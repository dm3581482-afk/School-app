import { NextRequest, NextResponse } from 'next/server';
import { createAppointment, getAppointments, updateAppointment } from '@/lib/db';
import { parse } from 'cookie';
import { verifyToken } from '@/lib/auth';
import type { Appointment } from '@/types';

// GET - Fetch appointments
export async function GET(request: NextRequest) {
  try {
    const cookies = parse(request.headers.get('cookie') || '');
    const token = cookies['auth-token'];
    
    const appointments = getAppointments();
    
    // If authenticated, return all relevant appointments
    if (token) {
      const user = verifyToken(token);
      if (user) {
        if (user.role === 'admin') {
          // Admins see all appointments
          return NextResponse.json({ appointments });
        } else if (user.role === 'teacher') {
          // Teachers see appointments with them
          const filtered = appointments.filter(
            a => a.appointmentWith === 'teacher' && a.teacherId === user.id
          );
          return NextResponse.json({ appointments: filtered });
        }
      }
    }
    
    // Public users can't see appointments
    return NextResponse.json({ appointments: [] });
  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create appointment
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { visitorName, visitorEmail, visitorPhone, appointmentWith, teacherId, date, time, purpose } = data;

    // Validate input
    if (!visitorName || !visitorEmail || !visitorPhone || !appointmentWith || !date || !time || !purpose) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate time (9 AM - 6 PM)
    const hour = parseInt(time.split(':')[0]);
    if (hour < 9 || hour >= 18) {
      return NextResponse.json(
        { error: 'Appointments are only available between 9 AM and 6 PM' },
        { status: 400 }
      );
    }

    const appointment: Appointment = {
      id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      visitorName,
      visitorEmail,
      visitorPhone,
      appointmentWith,
      teacherId: appointmentWith === 'teacher' ? teacherId : undefined,
      date,
      time,
      purpose,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    createAppointment(appointment);

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update appointment status
export async function PATCH(request: NextRequest) {
  try {
    const cookies = parse(request.headers.get('cookie') || '');
    const token = cookies['auth-token'];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Appointment ID and status are required' },
        { status: 400 }
      );
    }

    // Check authorization
    const appointments = getAppointments();
    const appointment = appointments.find(a => a.id === id);
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Verify user can approve this appointment
    const canApprove = 
      user.role === 'admin' ||
      (user.role === 'teacher' && appointment.appointmentWith === 'teacher' && appointment.teacherId === user.id);

    if (!canApprove) {
      return NextResponse.json(
        { error: 'Unauthorized to approve this appointment' },
        { status: 403 }
      );
    }

    const updated = updateAppointment(id, {
      status,
      approvedBy: user.id,
      approvedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      appointment: updated,
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

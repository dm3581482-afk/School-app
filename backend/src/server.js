import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Mock data
let users = [
  { id: 1, name: 'Admin Principal', role: 'admin', email: 'principal@kvs', password: 'password123' },
  { id: 2, name: 'Admin Vice Principal', role: 'admin', email: 'vp@kvs', password: 'password123' },
  { id: 3, name: 'Teacher Red', role: 'teacher', house: 'Red', email: 'teacher.red@kvs', password: 'password123' },
  { id: 4, name: 'Teacher Blue', role: 'teacher', house: 'Blue', email: 'teacher.blue@kvs', password: 'password123' },
  { id: 5, name: 'Teacher Green', role: 'teacher', house: 'Green', email: 'teacher.green@kvs', password: 'password123' },
  { id: 6, name: 'Teacher Yellow', role: 'teacher', house: 'Yellow', email: 'teacher.yellow@kvs', password: 'password123' },
];

let notices = [
  { id: 1, title: 'Welcome to School App', content: 'Important notices will appear here.' }
];

let appointments = [];
let communityPosts = {
  Red: [],
  Blue: [],
  Green: [],
  Yellow: [],
  All: []
};

function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role, house: user.house }, JWT_SECRET, { expiresIn: '1d' });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const token = generateToken(user);
  res.json({ token, user: { id: user.id, name: user.name, role: user.role, house: user.house } });
});

app.get('/api/notices', (req, res) => {
  res.json(notices);
});

app.post('/api/notices', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { title, content } = req.body;
  const notice = { id: notices.length + 1, title, content };
  notices.push(notice);
  res.status(201).json(notice);
});

app.post('/api/appointments', (req, res) => {
  const { name, email, role, preferredDate, preferredTime, purpose, withWhom } = req.body;
  const appointment = {
    id: appointments.length + 1,
    name,
    email,
    role,
    preferredDate,
    preferredTime,
    purpose,
    withWhom,
    status: 'Pending'
  };
  appointments.push(appointment);
  res.status(201).json(appointment);
});

app.get('/api/appointments', authenticateToken, authorizeRoles('admin', 'teacher'), (req, res) => {
  if (req.user.role === 'teacher') {
    const teacherHouse = users.find(u => u.id === req.user.id)?.house;
    return res.json(appointments.filter(a => a.withWhom === req.user.id || a.withWhom === teacherHouse));
  }
  res.json(appointments);
});

app.put('/api/appointments/:id', authenticateToken, authorizeRoles('admin', 'teacher'), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const appointment = appointments.find(a => a.id === parseInt(id));
  if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

  appointment.status = status;
  res.json(appointment);
});

app.get('/api/community/:house', authenticateToken, (req, res) => {
  const { house } = req.params;
  if (!communityPosts[house]) return res.status(404).json({ message: 'House not found' });

  if (house !== 'All' && req.user.house !== house && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  res.json(communityPosts[house]);
});

app.post('/api/community/:house', authenticateToken, (req, res) => {
  const { house } = req.params;
  if (!communityPosts[house]) return res.status(404).json({ message: 'House not found' });

  if (house !== 'All' && req.user.house !== house && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { content } = req.body;
  const post = { id: communityPosts[house].length + 1, userId: req.user.id, content, timestamp: new Date() };
  communityPosts[house].push(post);
  res.status(201).json(post);
});

app.get('/api/map', (req, res) => {
  res.json({ url: 'https://example.com/3d-map' });
});

app.post('/api/map', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { url } = req.body;
  res.json({ message: 'Map updated', url });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Center } from '@react-three/drei';
import { mapAPI } from '../utils/api';
import './Map3DViewer.css';

// Placeholder 3D School Building
function SchoolBuilding() {
  return (
    <Center>
      <group>
        {/* Main Building */}
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[8, 3, 6]} />
          <meshStandardMaterial color="#e8dcc4" />
        </mesh>

        {/* Roof */}
        <mesh position={[0, 3.25, 0]} castShadow>
          <coneGeometry args={[5, 1, 4]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>

        {/* Left Wing */}
        <mesh position={[-6, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, 2, 5]} />
          <meshStandardMaterial color="#e8dcc4" />
        </mesh>

        {/* Right Wing */}
        <mesh position={[6, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, 2, 5]} />
          <meshStandardMaterial color="#e8dcc4" />
        </mesh>

        {/* Ground/Base */}
        <mesh position={[0, -0.1, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#7cb342" />
        </mesh>

        {/* Courtyard */}
        <mesh position={[0, 0.05, 3]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6, 4]} />
          <meshStandardMaterial color="#ff9800" />
        </mesh>

        {/* Windows - Main Building */}
        {[-2, 0, 2].map((x) =>
          [0.5, 2].map((y) => (
            <mesh key={`window-${x}-${y}`} position={[x, y, 3.01]}>
              <boxGeometry args={[0.8, 0.8, 0.05]} />
              <meshStandardMaterial color="#64b5f6" emissive="#64b5f6" emissiveIntensity={0.2} />
            </mesh>
          ))
        )}

        {/* Door */}
        <mesh position={[0, 0.75, 3.01]}>
          <boxGeometry args={[1.2, 1.5, 0.05]} />
          <meshStandardMaterial color="#6d4c41" />
        </mesh>

        {/* Red House Flag */}
        <mesh position={[-5, 3, 2]}>
          <boxGeometry args={[0.1, 2, 0.1]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[-5, 4, 2]}>
          <boxGeometry args={[0.6, 0.4, 0.05]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>

        {/* Blue House Flag */}
        <mesh position={[-3, 3, 2]}>
          <boxGeometry args={[0.1, 2, 0.1]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[-3, 4, 2]}>
          <boxGeometry args={[0.6, 0.4, 0.05]} />
          <meshStandardMaterial color="#2563eb" />
        </mesh>

        {/* Green House Flag */}
        <mesh position={[3, 3, 2]}>
          <boxGeometry args={[0.1, 2, 0.1]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[3, 4, 2]}>
          <boxGeometry args={[0.6, 0.4, 0.05]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>

        {/* Yellow House Flag */}
        <mesh position={[5, 3, 2]}>
          <boxGeometry args={[0.1, 2, 0.1]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[5, 4, 2]}>
          <boxGeometry args={[0.6, 0.4, 0.05]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      </group>
    </Center>
  );
}

function Map3DViewer() {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMap();
  }, []);

  const loadMap = async () => {
    try {
      const response = await mapAPI.getActive();
      setMapData(response.data.data);
      setError(null);
    } catch (err) {
      // Use default placeholder if no map is uploaded
      console.log('No active map found, using default placeholder');
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="map-viewer-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading 3D Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-viewer-container">
      <div className="map-viewer-header">
        <h2>KVS School 3D Map</h2>
        <p>Explore our school campus in 3D</p>
      </div>

      <div className="map-canvas">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[10, 8, 10]} />

          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <hemisphereLight intensity={0.3} />

          <Suspense fallback={null}>
            <SchoolBuilding />
            <Environment preset="sunset" />
          </Suspense>

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={30}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

      <div className="map-controls-info">
        <div className="control-item">
          <strong>Rotate:</strong> Left Click + Drag
        </div>
        <div className="control-item">
          <strong>Zoom:</strong> Mouse Wheel
        </div>
        <div className="control-item">
          <strong>Pan:</strong> Right Click + Drag
        </div>
      </div>

      <div className="house-legend">
        <h3>House Flags</h3>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#dc2626' }}></span>
            <span>Red House</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#2563eb' }}></span>
            <span>Blue House</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#16a34a' }}></span>
            <span>Green House</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>
            <span>Yellow House</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Map3DViewer;

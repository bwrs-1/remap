import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer } from '@react-three/postprocessing';
import { Link } from 'react-router';
import { KeyboardModels } from './KeyboardModels';
import { Dither } from './Dither';
import './Keyboard3DViewer.scss';

// Preset color palettes (Light / Dark)
const PALETTES = [
  { name: 'Red & Black (Original)', light: '#ff2222', dark: '#000000' },
  { name: 'Matrix Cyberpunk', light: '#00ff66', dark: '#001408' },
  { name: 'Neon Cyan', light: '#00f0ff', dark: '#020b18' },
  { name: 'Monochrome Noir', light: '#ffffff', dark: '#000000' },
  { name: 'Amber CRT', light: '#ffb200', dark: '#140c00' },
];

export const Keyboard3DViewer: React.FC = () => {
  // Dithering parameters
  const [ditherEnabled, setDitherEnabled] = useState(true);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [scale, setScale] = useState(2.0);
  const [contrast, setContrast] = useState(1.3);
  const [brightness, setBrightness] = useState(0.0);

  // 3D Scene parameters
  const [splitDistance, setSplitDistance] = useState(0.9);
  const [rotationAngle, setRotationAngle] = useState(0.12);
  const [autoRotate, setAutoRotate] = useState(false);

  const activePalette = PALETTES[paletteIndex];

  return (
    <div className="keyboard-3d-container">
      {/* Top Header */}
      <header className="header-bar">
        <Link to="/" className="back-button">
          ← Back to Remap
        </Link>
        <div className="title-group">
          <h1>Split Keyboard 3D Dithering Shader</h1>
          <span>Niccolò Fanton Style Dither Effect with R3F</span>
        </div>
      </header>

      {/* 3D Canvas Scene */}
      <div className="canvas-wrapper">
        <Canvas
          shadows
          camera={{ position: [0, 3.2, 3.6], fov: 42 }}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
        >
          {/* Lighting optimized for keyboard keycap facets and bevels */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[4, 7, 5]}
            intensity={2.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <directionalLight position={[-4, 3, -3]} intensity={0.6} />
          <pointLight position={[0, -2, 2]} intensity={0.4} />

          {/* 3D Models */}
          <Suspense fallback={null}>
            <KeyboardModels
              splitDistance={splitDistance}
              rotationAngle={rotationAngle}
              roughness={0.3}
              metalness={0.15}
            />
          </Suspense>

          {/* Camera controls */}
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.05}
            minDistance={1.5}
            maxDistance={12}
            autoRotate={autoRotate}
            autoRotateSpeed={1.2}
          />

          {/* Postprocessing Dithering Shader */}
          {ditherEnabled && (
            <EffectComposer multisampling={0}>
              <Dither
                colorLight={activePalette.light}
                colorDark={activePalette.dark}
                scale={scale}
                contrast={contrast}
                brightness={brightness}
              />
            </EffectComposer>
          )}
        </Canvas>
      </div>

      {/* Interactive Control Panel */}
      <aside className="control-panel">
        {/* Dither Shader Controls */}
        <div className="panel-section">
          <div className="section-label">Dither Effect</div>
          <label className="toggle-row">
            <span>Enable Dithering</span>
            <input
              type="checkbox"
              checked={ditherEnabled}
              onChange={(e) => setDitherEnabled(e.target.checked)}
            />
          </label>
        </div>

        {/* Color Palette Presets */}
        {ditherEnabled && (
          <div className="panel-section">
            <div className="section-label">Color Presets</div>
            <div className="palette-grid">
              {PALETTES.map((pal, idx) => (
                <button
                  key={pal.name}
                  className={`palette-btn ${idx === paletteIndex ? 'active' : ''}`}
                  onClick={() => setPaletteIndex(idx)}
                  title={pal.name}
                  type="button"
                >
                  <div className="split-preview">
                    <span
                      className="color-half"
                      style={{ background: pal.dark }}
                    />
                    <span
                      className="color-half"
                      style={{ background: pal.light }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Shader Fine Tuning */}
        {ditherEnabled && (
          <div className="panel-section">
            <div className="section-label">Shader Parameters</div>
            <div className="slider-row">
              <div className="slider-info">
                <span>Pixel Scale</span>
                <span>{scale.toFixed(1)}px</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="6.0"
                step="0.5"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
              />
            </div>

            <div className="slider-row">
              <div className="slider-info">
                <span>Contrast</span>
                <span>{contrast.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={contrast}
                onChange={(e) => setContrast(parseFloat(e.target.value))}
              />
            </div>

            <div className="slider-row">
              <div className="slider-info">
                <span>Brightness</span>
                <span>{brightness.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-0.5"
                max="0.5"
                step="0.05"
                value={brightness}
                onChange={(e) => setBrightness(parseFloat(e.target.value))}
              />
            </div>
          </div>
        )}

        {/* Model Layout & Controls */}
        <div className="panel-section">
          <div className="section-label">Keyboard Layout</div>
          <div className="slider-row">
            <div className="slider-info">
              <span>Split Distance</span>
              <span>{splitDistance.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="2.5"
              step="0.05"
              value={splitDistance}
              onChange={(e) => setSplitDistance(parseFloat(e.target.value))}
            />
          </div>

          <div className="slider-row">
            <div className="slider-info">
              <span>Ergonomic Angle</span>
              <span>{rotationAngle.toFixed(2)} rad</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.4"
              step="0.02"
              value={rotationAngle}
              onChange={(e) => setRotationAngle(parseFloat(e.target.value))}
            />
          </div>

          <label className="toggle-row" style={{ marginTop: '8px' }}>
            <span>Auto Rotate</span>
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
            />
          </label>
        </div>
      </aside>
    </div>
  );
};

export default Keyboard3DViewer;

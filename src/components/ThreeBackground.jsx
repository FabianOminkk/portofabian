import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect if Mobile Device
    const isMobile = window.innerWidth < 768;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Adjust camera distance for mobile vs desktop
    camera.position.z = isMobile ? 20 : 15;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. Particle Cloud Field
    const particleCount = isMobile ? 600 : 3000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i]     = (Math.random() - 0.5) * 45;
      positions[i + 1] = (Math.random() - 0.5) * 45;
      positions[i + 2] = (Math.random() - 0.5) * 45;

      colors[i]     = 0.1 + Math.random() * 0.3;
      colors[i + 1] = 0.5 + Math.random() * 0.5;
      colors[i + 2] = 0.8 + Math.random() * 0.2;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: isMobile ? 0.12 : 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    const particleField = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleField);

    // 2. Wireframe Torus Knot
    const knotRadius = isMobile ? 3.0 : 4.5;
    const knotTube   = isMobile ? 0.8 : 1.2;
    const knotGeometry = new THREE.TorusKnotGeometry(
      knotRadius, knotTube,
      isMobile ? 40 : 128,
      isMobile ? 16 : 32
    );
    const knotMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: isMobile ? 0.14 : 0.18,
    });
    const torusKnot = new THREE.Mesh(knotGeometry, knotMaterial);
    scene.add(torusKnot);

    // 3. Secondary Floating Geometries
    const icoGeometry = new THREE.IcosahedronGeometry(isMobile ? 1.5 : 2, 1);
    const icoMesh1 = new THREE.Mesh(
      icoGeometry,
      new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      })
    );
    icoMesh1.position.set(isMobile ? -5 : -9, isMobile ? 6 : 5, -4);
    scene.add(icoMesh1);

    const icoMesh2 = new THREE.Mesh(
      icoGeometry,
      new THREE.MeshBasicMaterial({
        color: 0xa855f7,
        wireframe: true,
        transparent: true,
        opacity: 0.2,
      })
    );
    icoMesh2.position.set(isMobile ? 5 : 10, isMobile ? -7 : -6, -4);
    scene.add(icoMesh2);

    // ─── Parallax State ──────────────────────────────────────────────
    // targetX / targetY are the GOAL rotation values (set by mouse, touch, or gyro)
    // currentX / currentY are the SMOOTHED values used in the render loop
    let targetX  = 0;
    let targetY  = 0;
    let currentX = 0;
    let currentY = 0;

    // ─── Desktop: Mouse Parallax ─────────────────────────────────────
    const handleMouseMove = (e) => {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      targetX = (e.clientX - cx) * 0.0005;
      targetY = (e.clientY - cy) * 0.0005;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ─── Mobile: Touch Parallax (fallback) ───────────────────────────
    const handleTouchMove = (e) => {
      if (!isMobile || !e.touches?.[0]) return;
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      targetX = (e.touches[0].clientX - cx) * 0.0008;
      targetY = (e.touches[0].clientY - cy) * 0.0008;
    };
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // ─── Mobile: Gyroscope (DeviceOrientation) ───────────────────────
    // gamma = left/right tilt (-90 to 90)   → drives X rotation of scene
    // beta  = front/back tilt (-180 to 180) → drives Y rotation of scene
    // We clamp to ±30° so the effect stays subtle yet lively.
    let gyroEnabled = false;

    const handleOrientation = (e) => {
      if (!isMobile) return;
      const beta  = e.beta  ?? 0; // front/back  –180…180
      const gamma = e.gamma ?? 0; // left/right  –90…90

      // Clamp and normalise to a small rotation range (±0.25 rad)
      const clampedBeta  = Math.max(-30, Math.min(30, beta  - 45)); // subtract ~45° default hold angle
      const clampedGamma = Math.max(-30, Math.min(30, gamma));

      targetY = (clampedGamma / 30) * 0.25;  // X axis tilt (left/right)
      targetX = (clampedBeta  / 30) * 0.20;  // Y axis tilt (front/back)

      gyroEnabled = true;
    };

    // iOS 13+ requires permission for DeviceOrientationEvent
    const requestGyro = async () => {
      if (!isMobile) return;
      if (typeof DeviceOrientationEvent !== 'undefined') {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          // iOS 13+ — permission gate; we try silently first,
          // the user can tap anywhere to trigger it once
          try {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation, { passive: true });
            }
          } catch {
            // Permission prompt failed or was denied — touch fallback still works
          }
        } else {
          // Android & older iOS — no permission required
          window.addEventListener('deviceorientation', handleOrientation, { passive: true });
        }
      }
    };

    // Auto-request for Android; iOS needs a user gesture (we wire to first touch)
    requestGyro();

    // iOS fallback: request gyro on first touch interaction
    const handleFirstTouch = () => {
      requestGyro();
      window.removeEventListener('touchstart', handleFirstTouch);
    };
    window.addEventListener('touchstart', handleFirstTouch, { passive: true });

    // ─── Resize Handler ──────────────────────────────────────────────
    const handleResize = () => {
      const mobileNow = window.innerWidth < 768;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.position.z = mobileNow ? 20 : 15;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(mobileNow ? 1.0 : Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);

    // ─── Animation Loop ──────────────────────────────────────────────
    let animationFrameId;
    const clock = new THREE.Clock();
    // Lerp factor: gyro uses a slower lerp (more cinematic),
    // touch/mouse uses faster response
    const lerpFactor = isMobile ? 0.04 : 0.05;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Geometry self-rotations
      torusKnot.rotation.x = elapsedTime * 0.15;
      torusKnot.rotation.y = elapsedTime * 0.2;

      icoMesh1.rotation.x =  elapsedTime * 0.3;
      icoMesh1.rotation.y =  elapsedTime * 0.2;

      icoMesh2.rotation.x = -elapsedTime * 0.2;
      icoMesh2.rotation.y = -elapsedTime * 0.3;

      // Smooth interpolation toward target
      currentX += (targetX - currentX) * lerpFactor;
      currentY += (targetY - currentY) * lerpFactor;

      scene.rotation.y = currentX;
      scene.rotation.x = currentY;

      particleField.rotation.y = elapsedTime * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    // ─── Cleanup ─────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove',      handleMouseMove);
      window.removeEventListener('touchmove',      handleTouchMove);
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('touchstart',     handleFirstTouch);
      window.removeEventListener('resize',         handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      knotGeometry.dispose();
      knotMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      icoGeometry.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
    />
  );
}

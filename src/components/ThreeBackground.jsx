import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect if Mobile Device
    const isMobile = window.innerWidth < 640;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Adjust camera distance for mobile vs desktop
    camera.position.z = isMobile ? 18 : 15;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile, // Disable anti-alias on low-end mobile for maximum performance
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    container.appendChild(renderer.domElement);

    // 1. Particle Cloud Field (Slightly fewer particles on mobile for battery savings)
    const particleCount = isMobile ? 1800 : 3000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 45;
      positions[i + 1] = (Math.random() - 0.5) * 45;
      positions[i + 2] = (Math.random() - 0.5) * 45;

      colors[i] = 0.1 + Math.random() * 0.3;     // Red channel
      colors[i + 1] = 0.5 + Math.random() * 0.5; // Green/Cyan channel
      colors[i + 2] = 0.8 + Math.random() * 0.2; // Blue channel
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: isMobile ? 0.09 : 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    const particleField = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleField);

    // 2. Wireframe Torus Knot (Adjust scale for mobile)
    const knotRadius = isMobile ? 3.5 : 4.5;
    const knotTube = isMobile ? 0.9 : 1.2;
    const knotGeometry = new THREE.TorusKnotGeometry(knotRadius, knotTube, isMobile ? 96 : 128, 32);
    const knotMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
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

    // Mouse & Touch Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (e.clientX - windowHalfX) * 0.0005;
      mouseY = (e.clientY - windowHalfY) * 0.0005;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;
        mouseX = (e.touches[0].clientX - windowHalfX) * 0.0008;
        mouseY = (e.touches[0].clientY - windowHalfY) * 0.0008;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Resize Handler
    const handleResize = () => {
      const mobileNow = window.innerWidth < 640;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.position.z = mobileNow ? 18 : 15;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobileNow ? 1.5 : 2));
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Rotations
      torusKnot.rotation.x = elapsedTime * 0.15;
      torusKnot.rotation.y = elapsedTime * 0.2;

      icoMesh1.rotation.x = elapsedTime * 0.3;
      icoMesh1.rotation.y = elapsedTime * 0.2;

      icoMesh2.rotation.x = -elapsedTime * 0.2;
      icoMesh2.rotation.y = -elapsedTime * 0.3;

      // Smooth Parallax Interpolation
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      scene.rotation.y = targetX;
      scene.rotation.x = targetY;

      particleField.rotation.y = elapsedTime * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
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

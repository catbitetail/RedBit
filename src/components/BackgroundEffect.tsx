
import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  color: string;
  type: 'petal' | 'snow';
  swing: number;
  swingSpeed: number;
}

const BackgroundEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, showEffect } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !showEffect) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resize);
    resize();

    const createParticle = (isInitial = false): Particle => {
      const isDark = theme === 'dark';
      
      if (isDark) {
          // SNOW LOGIC
          // Introduce a variant: "Fast & Tiny" snow (approx 20% of particles)
          // These mimic the heavier particles or those closer to camera/ground perception that seem to fall faster
          const isFastVariant = Math.random() < 0.2; 
          
          const size = isFastVariant 
            ? Math.random() * 0.8 + 0.2   // Tiny: 0.2px - 1.0px
            : Math.random() * 1.5 + 0.5;  // Standard: 0.5px - 2.0px

          const speedY = isFastVariant
            ? Math.random() * 1.5 + 0.8   // Fast: 0.8 - 2.3
            : Math.random() * 0.3 + 0.05; // Slow: 0.05 - 0.35

          return {
              x: Math.random() * width,
              y: isInitial ? Math.random() * height : -20,
              size: size,
              speedX: 0,
              speedY: speedY,
              rotation: Math.random() * 360,
              rotationSpeed: (Math.random() - 0.5) * 0.2,
              opacity: Math.random() * 0.5 + 0.3,
              color: 'rgba(255, 255, 255, ',
              type: 'snow',
              swing: Math.random() * Math.PI * 2,
              swingSpeed: Math.random() * 0.02 + 0.01
          };
      } else {
          // PETAL LOGIC (Reverted: Quadratic shapes, larger, drifting)
          const petalColors = [
            'rgba(255, 183, 178, ', 
            'rgba(255, 158, 205, ', 
            'rgba(255, 209, 220, ',
            'rgba(251, 113, 133, '
          ];
          
          return {
              x: Math.random() * width,
              y: isInitial ? Math.random() * height : -20,
              size: Math.random() * 8 + 5,
              speedX: Math.random() * 1 - 0.5,
              speedY: Math.random() * 1.5 + 0.5, 
              rotation: Math.random() * 360,
              rotationSpeed: (Math.random() - 0.5) * 2,
              opacity: Math.random() * 0.5 + 0.3,
              color: petalColors[Math.floor(Math.random() * petalColors.length)],
              type: 'petal',
              swing: 0, // Unused in old logic
              swingSpeed: 0 // Unused in old logic
          };
      }
    };

    // Initialize particles
    const initParticles = () => {
      particles = [];
      const isDark = theme === 'dark';
      const particleCount = width < 768 
        ? (isDark ? 100 : 20) 
        : (isDark ? 400 : 50); 

      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle(true));
      }
    };

    initParticles();

    // Reverted Simple Petal Shape (Quadratic Curves)
    const drawPetal = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color + '1)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(p.size / 2, -p.size, p.size, 0);
      ctx.quadraticCurveTo(p.size / 2, p.size, 0, 0);
      ctx.fill();
      ctx.restore();
    };

    // Optimized Snow Shape
    const drawSnow = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color + (p.opacity).toString() + ')';
      ctx.shadowBlur = 3;
      ctx.shadowColor = "white";
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, index) => {
        if (p.type === 'petal') {
            // Petal Update Logic (Reverted)
            p.y += p.speedY;
            p.x += p.speedX + Math.sin(p.y * 0.01) * 0.5; // Simple sine wave sway based on Y
            p.rotation += p.rotationSpeed;
        } else {
            // Snow Update Logic (Optimized)
            p.y += p.speedY;
            p.swing += p.swingSpeed;
            p.x += Math.sin(p.swing) * 0.3; // Gentle swing
        }

        // Reset if out of view
        if (p.y > height + 20) {
          particles[index] = createParticle();
        }

        if (p.type === 'petal') {
          drawPetal(p);
        } else {
          drawSnow(p);
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, showEffect]);

  if (!showEffect) return null;

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0 pdf-exclude"
      style={{ opacity: 1 }}
    />
  );
};

export default BackgroundEffect;

import { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  variant?: 'ocean' | 'waves' | 'particles';
  intensity?: 'light' | 'medium' | 'strong';
}

export function AnimatedBackground({ variant = 'ocean', intensity = 'medium' }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation variables
    let animationId: number;
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
    }> = [];

    // Color palette
    const colors = [
      'rgba(3, 4, 94, 0.1)',      // federal_blue
      'rgba(0, 119, 182, 0.15)',  // honolulu_blue  
      'rgba(0, 180, 216, 0.2)',   // pacific_cyan
      'rgba(144, 224, 239, 0.25)', // non_photo_blue
      'rgba(202, 240, 248, 0.3)'  // light_cyan
    ];

    // Initialize particles
    const particleCount = intensity === 'light' ? 50 : intensity === 'medium' ? 100 : 150;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (variant === 'ocean') {
        // Ocean wave effect
        const time = Date.now() * 0.001;
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(3, 4, 94, 0.05)');
        gradient.addColorStop(0.3, 'rgba(0, 119, 182, 0.03)');
        gradient.addColorStop(0.6, 'rgba(0, 180, 216, 0.02)');
        gradient.addColorStop(1, 'rgba(202, 240, 248, 0.01)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Animated waves
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.strokeStyle = colors[i + 1];
          ctx.lineWidth = 2;
          
          for (let x = 0; x <= canvas.width; x += 10) {
            const y = canvas.height * 0.3 + Math.sin((x * 0.01) + (time * (i + 1))) * 50;
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }
      }

      // Update and draw particles
      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Animate alpha
        particle.alpha += Math.sin(Date.now() * 0.001 + index) * 0.01;
        particle.alpha = Math.max(0.05, Math.min(0.4, particle.alpha));

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace(/[\d.]+\)$/g, `${particle.alpha})`);
        ctx.fill();

        // Draw connections to nearby particles
        particles.forEach((otherParticle, otherIndex) => {
          if (index === otherIndex) return;
          
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 180, 216, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [variant, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 w-full h-full"
      style={{
        background: 'linear-gradient(135deg, #03045e 0%, #0077b6 50%, #00b4d8 100%)'
      }}
    />
  );
}
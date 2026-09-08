/* Confetti.

   The one place in the app that deliberately escapes React. Particles are
   animated on a canvas at 60fps; putting several hundred of them in state
   would re-render the tree sixty times a second for a purely decorative
   effect. So the component exposes an imperative handle — burst() and
   bigConfetti() — and owns its own animation loop. */

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const COLORS = ["#a78bfa", "#f472b6", "#38bdf8", "#4ade80", "#fbbf24", "#fb7185", "#ffffff"];
const GOLD = ["#fbbf24", "#fcd34d", "#fde68a", "#f59e0b", "#fb923c", "#ffffff"];

export const ConfettiCanvas = forwardRef(function ConfettiCanvas(_props, ref) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animating = useRef(false);
  const palette = useRef(COLORS);
  const timers = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function sizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);
    return () => {
      window.removeEventListener("resize", sizeCanvas);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  function tick() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.current.forEach((p) => {
      p.vy += 0.28;
      p.vx *= 0.995;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.spin;
      p.life -= 0.006;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    particles.current = particles.current.filter(
      (p) => p.life > 0 && p.y < window.innerHeight + 60
    );

    if (particles.current.length) requestAnimationFrame(tick);
    else {
      animating.current = false;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  function start() {
    if (!animating.current) {
      animating.current = true;
      requestAnimationFrame(tick);
    }
  }

  const pick = () =>
    palette.current[Math.floor(Math.random() * palette.current.length)];

  function burst(x, y, count) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 3 + Math.random() * 7;
      particles.current.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 3,
        size: 4 + Math.random() * 6,
        color: pick(),
        rotation: Math.random() * 360,
        spin: (Math.random() - 0.5) * 22,
        life: 1,
      });
    }
    start();
  }

  function bigConfetti(gold) {
    palette.current = gold ? GOLD : COLORS;
    const waves = gold ? 4 : 3;
    for (let w = 0; w < waves; w++) {
      timers.current.push(
        setTimeout(() => {
          for (let i = 0; i < 90; i++) {
            particles.current.push({
              x: Math.random() * window.innerWidth,
              y: -20 - Math.random() * 120,
              vx: (Math.random() - 0.5) * 5,
              vy: 2 + Math.random() * 5,
              size: 5 + Math.random() * 8,
              color: pick(),
              rotation: Math.random() * 360,
              spin: (Math.random() - 0.5) * 18,
              life: 1,
            });
          }
          start();
        }, w * 260)
      );
    }
    burst(40, window.innerHeight * 0.7, 45);
    burst(window.innerWidth - 40, window.innerHeight * 0.7, 45);
    timers.current.push(
      setTimeout(() => {
        palette.current = COLORS;
      }, waves * 260 + 100)
    );
  }

  useImperativeHandle(ref, () => ({ burst, bigConfetti }), []);

  return <canvas id="confetti" ref={canvasRef} aria-hidden="true" />;
});

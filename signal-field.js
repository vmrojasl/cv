/*
 * Signal field: a constellation of brand-colored particles that orbits a center
 * and converges into the glyphs of a DOM element (a key figure). Shared by the
 * profile and the case study. Progressive enhancement only: callers keep the
 * DOM figure visible unless the field reports it is running.
 */
(function (global) {
  'use strict';

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const hexToRgb = (hex) => {
    const value = parseInt(hex.replace('#', ''), 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  };
  const mix = (a, b, t) => `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;

  function sampleGlyphs(anchor, density) {
    const rect = anchor.getBoundingClientRect();
    if (!rect.width || !rect.height) return [];
    const style = getComputedStyle(anchor);
    const pad = 40;
    const width = Math.ceil(rect.width + pad * 2);
    const height = Math.ceil(rect.height + pad * 2);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const fontSize = parseFloat(style.fontSize);
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = style.letterSpacing === 'normal' ? '0px' : style.letterSpacing;
    ctx.fillStyle = '#000';
    ctx.textBaseline = 'alphabetic';
    const metrics = ctx.measureText('M');
    const ascent = metrics.fontBoundingBoxAscent || fontSize * 0.8;
    const descent = metrics.fontBoundingBoxDescent || fontSize * 0.2;

    // Draw each character where the browser actually laid it out, so wraps and
    // tracking match the DOM figure the particles hand over to.
    const walker = document.createTreeWalker(anchor, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    let node;
    while ((node = walker.nextNode())) {
      for (let i = 0; i < node.length; i += 1) {
        const char = node.data[i];
        if (!char.trim()) continue;
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const box = range.getBoundingClientRect();
        if (!box.width) continue;
        const baseline = box.top - rect.top + (box.height - (ascent + descent)) / 2 + ascent;
        ctx.fillText(char, box.left - rect.left + pad, baseline + pad);
      }
    }

    const step = Math.max(2, Math.round(fontSize / density));
    const data = ctx.getImageData(0, 0, width, height).data;
    const points = [];
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        if (data[(y * width + x) * 4 + 3] > 140) points.push({ x: x - pad, y: y - pad });
      }
    }
    return { points, step };
  }

  function create(options) {
    const {
      canvas,
      anchor,
      count = 480,
      getCenter,
      fieldColor = '#003B5C',
      formedColor = '#003B5C',
      accentColors = [],
      linkColor = fieldColor,
      density = 30,
      onFormedChange = () => {}
    } = options;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const fieldRgb = hexToRgb(fieldColor);
    const formedRgb = hexToRgb(formedColor);
    const linkRgb = hexToRgb(linkColor);
    const accents = accentColors.map(hexToRgb);
    const rings = [1, 0.74, 0.42];
    const particles = Array.from({ length: count }, (_, index) => {
      const scattered = Math.random() < 0.28;
      return {
        angle: Math.random() * Math.PI * 2,
        radius: scattered ? 0.25 + Math.random() * 0.95 : rings[index % rings.length] + (Math.random() - 0.5) * 0.06,
        speed: (0.00005 + Math.random() * 0.00012) * (Math.random() < 0.5 ? -1 : 1),
        wobble: Math.random() * Math.PI * 2,
        size: 0.8 + Math.random() * 1.7,
        delay: Math.random(),
        accent: accents.length && Math.random() < 0.12 ? accents[index % accents.length] : null,
        tx: 0,
        ty: 0,
        x: 0,
        y: 0
      };
    });

    let width = 0;
    let height = 0;
    let dpr = 1;
    let targetStep = 4;
    let progress = 0;
    let goal = 0;
    let fade = 0;
    let formed = false;
    let frame = 0;
    let running = false;
    let pointer = { x: -9999, y: -9999 };
    let autoplay = null;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resample = () => {
      if (!anchor) return true;
      const sample = sampleGlyphs(anchor, density);
      if (!sample.points || !sample.points.length) return false;
      targetStep = sample.step;
      const pool = sample.points.slice();
      for (let i = pool.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      particles.forEach((particle, index) => {
        const point = pool[index % pool.length];
        const jitter = index >= pool.length ? targetStep * 0.35 : 0;
        particle.tx = point.x + (Math.random() - 0.5) * jitter;
        particle.ty = point.y + (Math.random() - 0.5) * jitter;
      });
      return true;
    };

    const draw = (time) => {
      frame = 0;
      if (autoplay) {
        const t = clamp((time - autoplay.start) / autoplay.duration, 0, 1);
        goal = t;
        if (t >= 1) autoplay = null;
      }
      progress += (goal - progress) * 0.065;
      if (Math.abs(goal - progress) < 0.0005) progress = goal;

      const isFormed = progress > 0.985;
      if (isFormed !== formed) {
        formed = isFormed;
        onFormedChange(formed);
      }
      fade = clamp(fade + (formed ? 0.04 : -0.08), 0, 1);

      ctx.clearRect(0, 0, width, height);
      const center = getCenter();
      const canvasRect = canvas.getBoundingClientRect();
      const anchorRect = anchor ? anchor.getBoundingClientRect() : canvasRect;
      const ax = anchorRect.left - canvasRect.left;
      const ay = anchorRect.top - canvasRect.top;
      const visibleAlpha = 1 - fade;

      if (visibleAlpha > 0.01) {
        particles.forEach((particle) => {
          const angle = particle.angle + time * particle.speed;
          const breathe = Math.sin(time * 0.0007 + particle.wobble) * 0.025;
          let fx = center.x + Math.cos(angle) * center.r * (particle.radius + breathe);
          let fy = center.y + Math.sin(angle) * center.r * (particle.radius + breathe) * 0.92;
          const dx = fx - pointer.x;
          const dy = fy - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 130 && distance > 0.1) {
            const push = (1 - distance / 130) * 34;
            fx += (dx / distance) * push;
            fy += (dy / distance) * push;
          }
          const local = easeInOut(clamp((progress - particle.delay * 0.35) / 0.65, 0, 1));
          particle.local = local;
          particle.x = lerp(fx, ax + particle.tx, local);
          particle.y = lerp(fy, ay + particle.ty, local);
        });

        const linkFade = clamp(1 - progress / 0.55, 0, 1);
        if (linkFade > 0.02) {
          const limit = Math.min(particles.length, 240);
          ctx.lineWidth = 0.6;
          for (let i = 0; i < limit; i += 1) {
            const a = particles[i];
            for (let j = i + 1; j < limit; j += 1) {
              const b = particles[j];
              const dx = a.x - b.x;
              if (dx > 74 || dx < -74) continue;
              const dy = a.y - b.y;
              if (dy > 74 || dy < -74) continue;
              const d = dx * dx + dy * dy;
              if (d < 5476) {
                ctx.strokeStyle = `rgba(${linkRgb[0]},${linkRgb[1]},${linkRgb[2]},${(1 - d / 5476) * 0.22 * linkFade * visibleAlpha})`;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
              }
            }
          }
        }

        particles.forEach((particle) => {
          const local = particle.local;
          const base = particle.accent || fieldRgb;
          ctx.fillStyle = mix(base, formedRgb, local);
          ctx.globalAlpha = lerp(0.72, 1, local) * visibleAlpha;
          const size = lerp(particle.size, targetStep * 0.46, local);
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      if (running) frame = requestAnimationFrame(draw);
    };

    const onPointer = (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const api = {
      start() {
        if (running) return;
        running = true;
        window.addEventListener('pointermove', onPointer, { passive: true });
        frame = requestAnimationFrame(draw);
      },
      stop() {
        running = false;
        window.removeEventListener('pointermove', onPointer);
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
      },
      setProgress(value) {
        goal = clamp(value, 0, 1);
      },
      play(duration = 2200, delay = 0) {
        autoplay = { start: performance.now() + delay, duration };
      },
      refresh() {
        resize();
        return resample();
      },
      get running() {
        return running;
      }
    };

    resize();
    if (!resample()) return null;
    return api;
  }

  global.SignalField = { create };
})(window);

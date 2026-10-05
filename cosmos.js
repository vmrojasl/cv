/*
 * Cosmos: the hero's night sky, charted around Bogota.
 * Bogota is a fixed home star. The Bogota Region and Colombia constellations
 * are drawn around it; then every other innovation ecosystem appears on its
 * own, placed in its true direction from Bogota, linked back by an arc and
 * labelled with its distance. Starfield, shooting stars, orbit satellites and
 * a visible cursor star complete the sky. Canvas only; the page reads fine
 * without it.
 */
(function (global) {
  'use strict';

  const TAU = Math.PI * 2;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const ease = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const rand = (min, max) => min + Math.random() * (max - min);

  const STAR = [255, 255, 255];
  const BALLAD = [191, 205, 217];
  const SAND = [191, 169, 149];
  const OLIVE = [160, 164, 70];
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const SANS = 'Aptos, "Segoe UI", Arial, sans-serif';
  const SERIF = '"Georgia Pro", Georgia, serif';

  const BOGOTA = { lon: -74.07, lat: 4.71 };

  const distanceKm = (lon, lat) => {
    const rad = Math.PI / 180;
    const dLat = (lat - BOGOTA.lat) * rad;
    const dLon = (lon - BOGOTA.lon) * rad;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(BOGOTA.lat * rad) * Math.cos(lat * rad) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };
  // Place names are written in Spanish below; locales/<lang>.json → cosmos.places
  // translates them, and cosmos.distance formats the distance line.
  const place = (name) => window.I18n?.get('cosmos.places')?.[name] || name;
  const formatKm = (km) => {
    const value = Math.round(km).toLocaleString(window.I18n?.locale || 'es-CO');
    return window.I18n?.t('cosmos.distance', { km: value }) || `${value} km`;
  };

  /* ---------- Local constellations, centred on Bogota ---------- */
  const local = (name, outline, hubs, links) => {
    const scale = (lon, lat) => ({ x: (lon - BOGOTA.lon), y: -(lat - BOGOTA.lat) });
    const points = [];
    const edges = [];
    outline.forEach(([lon, lat]) => points.push({ ...scale(lon, lat), kind: 'outline' }));
    outline.forEach((_, i) => edges.push([i, (i + 1) % outline.length, false]));
    const offset = points.length;
    points.push({ x: 0, y: 0, kind: 'home', label: 'Bogotá' });
    hubs.forEach(([lon, lat, label]) => points.push({ ...scale(lon, lat), kind: 'hub', label }));
    links.forEach(([a, b]) => edges.push([offset + a, offset + b, true]));
    const extent = Math.max(...points.map((p) => Math.max(Math.abs(p.x), Math.abs(p.y)))) || 1;
    points.forEach((p) => {
      p.x /= extent;
      p.y /= extent;
    });
    return { name, points, edges };
  };

  const REGION = local('Bogotá Región', [], [
    [-74.06, 4.86, 'Chía'], [-74.03, 4.92, 'Cajicá'], [-74.0, 5.02, 'Zipaquirá'], [-73.91, 4.97, 'Tocancipá'],
    [-73.94, 4.91, 'Sopó'], [-73.97, 4.72, 'La Calera'], [-74.22, 4.58, 'Soacha'], [-74.36, 4.34, 'Fusagasugá'],
    [-74.23, 4.71, 'Mosquera'], [-74.35, 4.81, 'Facatativá'], [-74.2, 4.97, 'Tenjo']
  ], [
    [0, 1], [0, 6], [0, 7], [0, 9], [0, 5], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
    [7, 8], [7, 9], [9, 10], [10, 11], [11, 2], [1, 11]
  ]);

  const COLOMBIA = local('Colombia', [
    [-77.4, 8.6], [-75.6, 10.4], [-74.8, 11.0], [-73.3, 11.3], [-71.9, 12.4], [-72.3, 11.1],
    [-72.5, 8.0], [-70.0, 7.0], [-67.5, 6.2], [-67.8, 2.0], [-69.9, 1.1], [-69.4, -1.1],
    [-70.0, -4.2], [-74.5, -0.2], [-77.0, 0.8], [-78.8, 1.8], [-77.3, 4.0], [-77.4, 6.6]
  ], [
    [-75.57, 6.24, 'Medellín'], [-76.53, 3.45, 'Cali'], [-74.8, 10.6, 'Barranquilla'],
    [-73.12, 7.12, 'Bucaramanga'], [-75.5, 10.2, 'Cartagena'], [-75.7, 4.8, 'Eje Cafetero']
  ], [[0, 1], [0, 2], [0, 4], [0, 6], [1, 5], [1, 6], [2, 6], [3, 5], [3, 4], [1, 3]]);

  /* ---------- Ecosystems presented one by one, grouped by region ---------- */
  const ECOSYSTEMS = [
    ['Ciudad de México', 'México', -99.13, 19.43], ['Monterrey', 'México', -100.3, 25.67],
    ['São Paulo', 'Brasil', -46.63, -23.55], ['Florianópolis', 'Brasil', -48.55, -27.6], ['Buenos Aires', 'Argentina', -58.38, -34.6],
    ['Santiago', 'Chile', -70.65, -33.45], ['Lima', 'Perú', -77.04, -12.05], ['Montevideo', 'Uruguay', -56.16, -34.9],
    ['Silicon Valley', 'EE. UU.', -122.42, 37.77], ['Seattle', 'EE. UU.', -122.33, 47.61], ['Los Ángeles', 'EE. UU.', -118.24, 34.05],
    ['Austin', 'EE. UU.', -97.74, 30.27], ['Miami', 'EE. UU.', -80.19, 25.76], ['Nueva York', 'EE. UU.', -74.0, 40.71],
    ['Boston', 'EE. UU.', -71.06, 42.36], ['Toronto', 'Canadá', -79.38, 43.65], ['Montreal', 'Canadá', -73.57, 45.5],
    ['Londres', 'Reino Unido', -0.13, 51.5], ['París', 'Francia', 2.35, 48.86], ['Berlín', 'Alemania', 13.4, 52.52],
    ['Múnich', 'Alemania', 11.58, 48.14], ['Ámsterdam', 'Países Bajos', 4.9, 52.37], ['Estocolmo', 'Suecia', 18.07, 59.33],
    ['Helsinki', 'Finlandia', 24.94, 60.17], ['Zúrich', 'Suiza', 8.54, 47.37], ['Madrid', 'España', -3.7, 40.42],
    ['Barcelona', 'España', 2.17, 41.39], ['Lisboa', 'Portugal', -9.14, 38.72],
    ['Tel Aviv', 'Israel', 34.78, 32.08], ['Dubái', 'EAU', 55.27, 25.2], ['Riad', 'Arabia Saudita', 46.68, 24.71],
    ['El Cairo', 'Egipto', 31.24, 30.04], ['Lagos', 'Nigeria', 3.38, 6.52], ['Nairobi', 'Kenia', 36.82, -1.29],
    ['Ciudad del Cabo', 'Sudáfrica', 18.42, -33.92],
    ['Bangalore', 'India', 77.59, 12.97], ['Mumbai', 'India', 72.88, 19.08], ['Delhi', 'India', 77.21, 28.61],
    ['Singapur', 'Singapur', 103.82, 1.35], ['Yakarta', 'Indonesia', 106.85, -6.21], ['Shenzhen', 'China', 114.06, 22.54],
    ['Shanghái', 'China', 121.47, 31.23], ['Pekín', 'China', 116.4, 39.9], ['Taipéi', 'Taiwán', 121.56, 25.03],
    ['Seúl', 'Corea del Sur', 126.98, 37.57], ['Tokio', 'Japón', 139.69, 35.69],
    ['Sídney', 'Australia', 151.21, -33.87], ['Melbourne', 'Australia', 144.96, -37.81]
  ].map(([name, country, lon, lat]) => {
    // True direction from Bogota on a flat chart, wrapped across the date line.
    let dLon = lon - BOGOTA.lon;
    if (dLon > 180) dLon -= 360;
    if (dLon < -180) dLon += 360;
    const dx = dLon * Math.cos(((lat + BOGOTA.lat) / 2) * Math.PI / 180);
    const dy = lat - BOGOTA.lat;
    const length = Math.hypot(dx, dy) || 1;
    let seed = 0;
    for (let i = 0; i < name.length; i += 1) seed = (seed * 31 + name.charCodeAt(i)) % 9973;
    return { name, country, ux: dx / length, uy: dy / length, km: distanceKm(lon, lat), seed };
  });

  const seeded = (seed) => {
    let value = seed || 1;
    return () => {
      value = (value * 16807) % 2147483647;
      return value / 2147483647;
    };
  };

  function create({ canvas, overlay, getOrbit = () => null, getAnchor }) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const octx = overlay ? overlay.getContext('2d') : ctx;
    const reduced = global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let anchor = { x: 0, y: 0, rx: 100, ry: 100 };
    let stars = [];
    let frame = 0;
    let running = false;
    const pointer = { x: -9999, y: -9999, nx: 0, ny: 0, active: false };
    let active = [];
    let shooting = [];
    let nextShot = 0;
    let nextAt = 0;
    let step = 0;

    // The narrative loop: region, country, then each ecosystem on its own.
    const timeline = [
      { type: 'figure', def: REGION, life: 8200, gap: 8600 },
      { type: 'figure', def: COLOMBIA, life: 8200, gap: 8600 },
      ...ECOSYSTEMS.map((eco, index) => ({ type: 'eco', eco, life: 4300, gap: index === ECOSYSTEMS.length - 1 ? 4800 : 4000 }))
    ];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, global.devicePixelRatio || 1);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (overlay) {
        overlay.width = canvas.width;
        overlay.height = canvas.height;
        octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      anchor = getAnchor(width, height);
      const count = Math.round(clamp((width * height) / 2600, 180, 620));
      stars = Array.from({ length: count }, () => {
        const depth = Math.random() < 0.6 ? 0.25 : Math.random() < 0.75 ? 0.6 : 1;
        const tint = Math.random();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          depth,
          size: depth === 1 ? rand(1.1, 1.9) : depth === 0.6 ? rand(0.7, 1.2) : rand(0.4, 0.8),
          base: depth === 1 ? rand(0.65, 0.95) : rand(0.25, 0.6),
          twinkle: rand(0.0008, 0.0026),
          phase: rand(0, TAU),
          drift: rand(0.004, 0.012) * depth,
          color: tint < 0.08 ? SAND : tint < 0.5 ? BALLAD : STAR
        };
      });
    };

    /* ---------- Spawning ---------- */
    const spawnFigure = (item, time) => {
      const size = Math.min(anchor.ry * 0.95, anchor.rx * 1.7);
      const points = item.def.points.map((p) => ({
        x: anchor.x + p.x * size,
        y: anchor.y + p.y * size,
        kind: p.kind,
        label: p.label,
        r: p.kind === 'hub' ? rand(1.8, 2.5) : rand(0.8, 1.2),
        phase: rand(0, TAU)
      }));
      const labelY = Math.max(...points.map((p) => p.y)) + 26;
      active.push({ type: 'figure', def: item.def, points, start: time, life: item.life, labelY });
    };

    const spawnEco = (item, time) => {
      const { eco } = item;
      const reach = 0.42 + 0.58 * Math.sqrt(clamp(eco.km / 19000, 0, 1));
      const hub = { x: anchor.x + eco.ux * reach * anchor.rx, y: anchor.y - eco.uy * reach * anchor.ry };
      const random = seeded(eco.seed + 7);
      const count = 3 + Math.floor(random() * 3);
      const satellites = Array.from({ length: count }, (_, i) => {
        const a = (i / count) * TAU + random() * 0.9;
        const d = 9 + random() * 13;
        return { x: hub.x + Math.cos(a) * d, y: hub.y + Math.sin(a) * d, r: 0.9 + random() * 0.8 };
      });
      active.push({ type: 'eco', eco, hub, satellites, start: time, life: item.life, phase: rand(0, TAU) });
    };

    const spawnNext = (time) => {
      anchor = getAnchor(width, height);
      const item = timeline[step % timeline.length];
      step += 1;
      if (item.type === 'figure') spawnFigure(item, time);
      else spawnEco(item, time);
      return item.gap;
    };

    /* ---------- Drawing ---------- */
    const arcPoint = (p, q, t) => {
      const dist = Math.hypot(q.x - p.x, q.y - p.y);
      const lift = Math.min(70, dist * 0.3);
      const nx = -(q.y - p.y) / (dist || 1);
      const ny = (q.x - p.x) / (dist || 1);
      const side = q.x >= p.x ? -1 : 1;
      const cx = (p.x + q.x) / 2 + nx * lift * side;
      const cy = (p.y + q.y) / 2 + ny * lift * side;
      const u = 1 - t;
      return { x: u * u * p.x + 2 * u * t * cx + t * t * q.x, y: u * u * p.y + 2 * u * t * cy + t * t * q.y };
    };

    const fadeOf = (item, time, fadeInMs = 700, fadeOutMs = 1100) => {
      const t = time - item.start;
      return { t, alpha: Math.min(ease(t / fadeInMs), 1 - ease((t - (item.life - fadeOutMs)) / fadeOutMs)) };
    };

    const drawFigure = (figure, time) => {
      const { t, alpha } = fadeOf(figure, time, 900, 1400);
      if (alpha <= 0) return;
      const drawSpan = 2200;
      const edgeCount = figure.def.edges.length;
      octx.lineWidth = 1;
      octx.lineCap = 'round';
      figure.def.edges.forEach(([a, b, strong], index) => {
        const progress = clamp((t - 350 - (index / edgeCount) * drawSpan) / 420, 0, 1);
        if (!progress) return;
        const p = figure.points[a];
        const q = figure.points[b];
        octx.strokeStyle = strong ? rgba(BALLAD, 0.55 * alpha) : rgba(BALLAD, 0.18 * alpha);
        octx.beginPath();
        octx.moveTo(p.x, p.y);
        octx.lineTo(p.x + (q.x - p.x) * ease(progress), p.y + (q.y - p.y) * ease(progress));
        octx.stroke();
      });
      figure.points.forEach((p, index) => {
        if (p.kind === 'home') return;
        const appear = ease((t - index * 45) / 500);
        const pulse = 0.75 + 0.25 * Math.sin(time * 0.003 + p.phase);
        const faint = p.kind === 'outline';
        octx.fillStyle = rgba(STAR, alpha * appear * pulse * (faint ? 0.55 : 1));
        octx.beginPath();
        octx.arc(p.x, p.y, p.r * appear, 0, TAU);
        octx.fill();
        if (!faint) {
          octx.fillStyle = rgba(BALLAD, 0.16 * alpha * appear);
          octx.beginPath();
          octx.arc(p.x, p.y, p.r * 3.2 * appear, 0, TAU);
          octx.fill();
        }
      });
      const labelAlpha = alpha * ease((t - drawSpan - 300) / 700);
      if (labelAlpha > 0) {
        octx.fillStyle = rgba(SAND, 0.9 * labelAlpha);
        octx.font = `700 11px ${SANS}`;
        octx.letterSpacing = '3px';
        octx.textAlign = 'center';
        octx.fillText(place(figure.def.name).toUpperCase(), anchor.x, Math.min(height - 60, figure.labelY));
        octx.letterSpacing = '0px';
      }
    };

    const drawEco = (item, time) => {
      const { t, alpha } = fadeOf(item, time);
      if (alpha <= 0) return;
      const home = { x: anchor.x, y: anchor.y };
      const travel = ease(clamp((t - 150) / 1000, 0, 1));

      // The link back to Bogota.
      octx.lineWidth = 1;
      octx.strokeStyle = rgba(BALLAD, 0.42 * alpha);
      octx.setLineDash([2, 4]);
      octx.beginPath();
      for (let k = 0; k <= 28; k += 1) {
        const pt = arcPoint(home, item.hub, (k / 28) * travel);
        if (k) octx.lineTo(pt.x, pt.y);
        else octx.moveTo(pt.x, pt.y);
      }
      octx.stroke();
      octx.setLineDash([]);
      if (travel < 1) {
        const head = arcPoint(home, item.hub, travel);
        octx.fillStyle = rgba(SAND, alpha);
        octx.beginPath();
        octx.arc(head.x, head.y, 2.2, 0, TAU);
        octx.fill();
        return;
      }

      // The ecosystem's own constellation.
      const arrived = t - 1150;
      const pop = ease(arrived / 500);
      item.satellites.forEach((s, i) => {
        const next = item.satellites[(i + 1) % item.satellites.length];
        octx.strokeStyle = rgba(BALLAD, 0.2 * alpha * pop);
        octx.beginPath();
        octx.moveTo(s.x, s.y);
        octx.lineTo(next.x, next.y);
        octx.stroke();
        octx.strokeStyle = rgba(BALLAD, 0.5 * alpha * pop);
        octx.beginPath();
        octx.moveTo(item.hub.x, item.hub.y);
        octx.lineTo(item.hub.x + (s.x - item.hub.x) * pop, item.hub.y + (s.y - item.hub.y) * pop);
        octx.stroke();
        octx.fillStyle = rgba(STAR, 0.85 * alpha * pop);
        octx.beginPath();
        octx.arc(s.x, s.y, s.r, 0, TAU);
        octx.fill();
      });
      const pulse = 0.8 + 0.2 * Math.sin(time * 0.004 + item.phase);
      octx.fillStyle = rgba(BALLAD, 0.2 * alpha * pop);
      octx.beginPath();
      octx.arc(item.hub.x, item.hub.y, 9 * pulse * pop, 0, TAU);
      octx.fill();
      octx.fillStyle = rgba(STAR, alpha * pop);
      octx.beginPath();
      octx.arc(item.hub.x, item.hub.y, 2.8, 0, TAU);
      octx.fill();

      // Name, country and how far it sits from Bogota, centred under the star
      // and kept inside the open sky around Bogota.
      const labelAlpha = alpha * ease((arrived - 150) / 500);
      if (labelAlpha > 0) {
        const meta = `${place(item.eco.country)} · ${formatKm(item.eco.km)}`;
        octx.font = `700 13px ${SANS}`;
        const nameWidth = octx.measureText(place(item.eco.name)).width;
        octx.font = `11px ${SANS}`;
        const half = Math.max(nameWidth, octx.measureText(meta).width) / 2;
        const minX = Math.max(8, anchor.x - anchor.rx - 24) + half;
        const maxX = Math.min(width - 8, anchor.x + anchor.rx + 24) - half;
        const lx = minX <= maxX ? clamp(item.hub.x, minX, maxX) : clamp(anchor.x, half + 8, width - half - 8);
        const below = item.hub.y < height - 70;
        const ly = below ? item.hub.y + 34 : item.hub.y - 40;
        octx.textAlign = 'center';
        octx.fillStyle = rgba(SAND, labelAlpha);
        octx.font = `700 13px ${SANS}`;
        octx.fillText(place(item.eco.name), lx, ly);
        octx.fillStyle = rgba(BALLAD, 0.9 * labelAlpha);
        octx.font = `11px ${SANS}`;
        octx.fillText(meta, lx, ly + 15);
      }
    };

    const drawHome = (time) => {
      const breathe = Math.sin(time * 0.004);
      octx.fillStyle = rgba(SAND, 0.16);
      octx.beginPath();
      octx.arc(anchor.x, anchor.y, 15 + breathe * 3, 0, TAU);
      octx.fill();
      octx.strokeStyle = rgba(SAND, 0.55);
      octx.lineWidth = 1;
      octx.beginPath();
      octx.arc(anchor.x, anchor.y, 8 + breathe, 0, TAU);
      octx.stroke();
      octx.fillStyle = rgba(SAND, 1);
      octx.beginPath();
      octx.arc(anchor.x, anchor.y, 3.6, 0, TAU);
      octx.fill();
      octx.font = `italic 14px ${SERIF}`;
      octx.textAlign = 'left';
      octx.fillText('Bogotá', anchor.x + 14, anchor.y - 10);
    };

    const drawSatellites = (time) => {
      const orbit = getOrbit();
      if (!orbit) return;
      [[orbit.r, 0.00012, SAND, 3.2], [orbit.r * 0.74, -0.0002, BALLAD, 2.4]].forEach(([r, speed, color, size], index) => {
        const a = time * speed + index * 2.1;
        for (let k = 0; k < 18; k += 1) {
          const ta = a - k * 0.018 * Math.sign(speed);
          ctx.fillStyle = rgba(color, (1 - k / 18) * 0.35);
          ctx.beginPath();
          ctx.arc(orbit.x + Math.cos(ta) * r, orbit.y + Math.sin(ta) * r, size * (1 - k / 24), 0, TAU);
          ctx.fill();
        }
        ctx.fillStyle = rgba(color, 1);
        ctx.beginPath();
        ctx.arc(orbit.x + Math.cos(a) * r, orbit.y + Math.sin(a) * r, size, 0, TAU);
        ctx.fill();
      });
    };

    const drawShooting = (time) => {
      if (time > nextShot) {
        nextShot = time + rand(2600, 5200);
        const fromRight = Math.random() < 0.7;
        shooting.push({
          x: fromRight ? rand(width * 0.45, width) : rand(0, width * 0.5),
          y: rand(-20, height * 0.35),
          vx: -rand(0.55, 0.85),
          vy: rand(0.28, 0.42),
          start: time,
          life: rand(900, 1300)
        });
      }
      shooting = shooting.filter((s) => time - s.start < s.life);
      shooting.forEach((s) => {
        const t = (time - s.start) / s.life;
        const travel = time - s.start;
        const hx = s.x + s.vx * travel;
        const hy = s.y + s.vy * travel;
        const len = 150 * Math.sin(Math.PI * t);
        const gradient = ctx.createLinearGradient(hx, hy, hx - s.vx * len, hy - s.vy * len);
        gradient.addColorStop(0, rgba(STAR, 0.95 * Math.sin(Math.PI * t)));
        gradient.addColorStop(0.3, rgba(SAND, 0.5 * Math.sin(Math.PI * t)));
        gradient.addColorStop(1, rgba(SAND, 0));
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx - s.vx * len, hy - s.vy * len);
        ctx.stroke();
      });
    };

    const drawPointer = (time, near) => {
      if (!pointer.active) return;
      near.sort((a, b) => a.d - b.d);
      const linked = near.slice(0, 6);
      octx.lineWidth = 0.8;
      linked.forEach((s, index) => {
        octx.strokeStyle = rgba(SAND, (1 - s.d / 160) * 0.6);
        octx.beginPath();
        octx.moveTo(pointer.x, pointer.y);
        octx.lineTo(s.x, s.y);
        octx.stroke();
        const next = linked[index + 1];
        if (next) {
          octx.strokeStyle = rgba(BALLAD, 0.18);
          octx.beginPath();
          octx.moveTo(s.x, s.y);
          octx.lineTo(next.x, next.y);
          octx.stroke();
        }
      });

      // Hovering a named star reveals it.
      let closest = null;
      active.forEach((item) => {
        const candidates = item.type === 'figure' ? item.points : [{ x: item.hub.x, y: item.hub.y, label: item.eco.name }];
        candidates.forEach((p) => {
          if (!p.label || p.kind === 'home') return;
          const d = Math.hypot(p.x - pointer.x, p.y - pointer.y);
          if (d < 30 && (!closest || d < closest.d)) closest = { p, d };
        });
      });
      if (closest) {
        const { p } = closest;
        octx.strokeStyle = rgba(SAND, 0.9);
        octx.lineWidth = 1;
        octx.beginPath();
        octx.arc(p.x, p.y, 7, 0, TAU);
        octx.stroke();
        octx.font = `700 12px ${SANS}`;
        const textWidth = octx.measureText(place(p.label)).width;
        octx.fillStyle = 'rgba(0,38,60,0.85)';
        octx.fillRect(p.x + 12, p.y - 24, textWidth + 14, 22);
        octx.fillStyle = rgba(SAND, 1);
        octx.textAlign = 'left';
        octx.fillText(place(p.label), p.x + 19, p.y - 9);
      }

      const breathe = Math.sin(time * 0.005);
      octx.fillStyle = rgba(SAND, 0.18);
      octx.beginPath();
      octx.arc(pointer.x, pointer.y, 16 + breathe * 3, 0, TAU);
      octx.fill();
      octx.strokeStyle = rgba(SAND, 0.75);
      octx.lineWidth = 1;
      octx.beginPath();
      octx.arc(pointer.x, pointer.y, 9 + breathe * 1.5, 0, TAU);
      octx.stroke();
      octx.fillStyle = rgba(STAR, 1);
      octx.beginPath();
      octx.arc(pointer.x, pointer.y, 3, 0, TAU);
      octx.fill();
    };

    const draw = (time) => {
      frame = 0;
      ctx.clearRect(0, 0, width, height);
      if (overlay) octx.clearRect(0, 0, width, height);

      [[0.18, 0.75, BALLAD, 0.07], [0.62, 0.22, OLIVE, 0.06]].forEach(([fx, fy, color, a], index) => {
        const cx = width * fx + Math.sin(time * 0.00006 + index) * 40;
        const cy = height * fy + Math.cos(time * 0.00005 + index) * 30;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.45);
        g.addColorStop(0, rgba(color, a));
        g.addColorStop(1, rgba(color, 0));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      });

      const px = pointer.nx * 14;
      const py = pointer.ny * 10;
      const near = [];
      stars.forEach((s) => {
        if (!reduced) s.x -= s.drift;
        if (s.x < -4) s.x = width + 4;
        const x = s.x + px * s.depth;
        const y = s.y + py * s.depth;
        ctx.fillStyle = rgba(s.color, s.base * (0.62 + 0.38 * Math.sin(time * s.twinkle + s.phase)));
        if (s.size < 1) ctx.fillRect(x, y, s.size * 1.6, s.size * 1.6);
        else {
          ctx.beginPath();
          ctx.arc(x, y, s.size, 0, TAU);
          ctx.fill();
        }
        if (pointer.active && s.depth > 0.3) {
          const d = Math.hypot(x - pointer.x, y - pointer.y);
          if (d < 160) near.push({ x, y, d });
        }
      });

      drawSatellites(time);
      if (!reduced) {
        if (time > nextAt) nextAt = time + spawnNext(time);
        active = active.filter((item) => time - item.start < item.life);
        drawShooting(time);
      }
      active.forEach((item) => {
        const at = reduced ? item.start + 4000 : time;
        if (item.type === 'figure') drawFigure(item, at);
        else drawEco(item, at);
      });
      drawHome(time);
      drawPointer(time, near);

      if (running && !reduced) frame = requestAnimationFrame(draw);
    };

    const onPointer = (event) => {
      if (event.pointerType === 'touch') return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.nx = (pointer.x / Math.max(1, width) - 0.5) * 2;
      pointer.ny = (pointer.y / Math.max(1, height) - 0.5) * 2;
      pointer.active = pointer.y >= 0 && pointer.y <= height;
      if (reduced && running) draw(0);
    };
    const onLeave = () => {
      pointer.active = false;
    };

    const staticFrame = () => {
      active = [];
      spawnFigure(timeline[1], 0);
      draw(0);
    };

    resize();

    return {
      start() {
        if (running) return;
        running = true;
        global.addEventListener('pointermove', onPointer, { passive: true });
        document.addEventListener('pointerleave', onLeave);
        if (reduced) {
          staticFrame();
          return;
        }
        nextAt = performance.now() + 500;
        nextShot = performance.now() + 1800;
        frame = requestAnimationFrame(draw);
      },
      stop() {
        running = false;
        global.removeEventListener('pointermove', onPointer);
        document.removeEventListener('pointerleave', onLeave);
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
      },
      refresh() {
        resize();
        active = [];
        if (reduced) staticFrame();
      },
      get running() {
        return running;
      }
    };
  }

  global.Cosmos = { create };
})(window);

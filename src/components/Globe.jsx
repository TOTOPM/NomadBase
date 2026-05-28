import { useEffect, useRef } from 'react';
import { feature } from 'topojson-client';
import worldData from 'world-atlas/land-110m.json';
import { destinations } from '../data/destinations';
import styles from './Globe.module.css';

const DEG = Math.PI / 180;

// Real coordinates for every destination
const COORDS = {
  'chiang-mai':        { lat: 18.8,  lon: 98.9   },
  'bali':              { lat: -8.4,  lon: 115.2  },
  'lisbon':            { lat: 38.7,  lon: -9.1   },
  'medellin':          { lat: 6.2,   lon: -75.6  },
  'tbilisi':           { lat: 41.7,  lon: 44.8   },
  'mexico-city':       { lat: 19.4,  lon: -99.1  },
  'bangkok':           { lat: 13.8,  lon: 100.5  },
  'da-nang':           { lat: 16.1,  lon: 108.2  },
  'porto':             { lat: 41.2,  lon: -8.6   },
  'istanbul':          { lat: 41.0,  lon: 28.9   },
  'budapest':          { lat: 47.5,  lon: 19.0   },
  'playa-del-carmen':  { lat: 20.6,  lon: -87.1  },
  'seoul':             { lat: 37.6,  lon: 126.9  },
  'cape-town':         { lat: -33.9, lon: 18.4   },
  'barcelona':         { lat: 41.4,  lon: 2.2    },
};

// Pre-process land polygons once (outside component)
const landGeoJSON = feature(worldData, worldData.objects.land);
const allRings = [];
landGeoJSON.features.forEach(f => {
  const geom = f.geometry;
  const polys = geom.type === 'MultiPolygon' ? geom.coordinates
              : geom.type === 'Polygon'      ? [geom.coordinates]
              : [];
  polys.forEach(poly => poly.forEach(ring => allRings.push(ring)));
});

export default function Globe() {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx  = canvas.getContext('2d');
    const dpr  = window.devicePixelRatio || 1;
    const SIZE = 380;

    canvas.width        = SIZE * dpr;
    canvas.height       = SIZE * dpr;
    canvas.style.width  = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;
    ctx.scale(dpr, dpr);

    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const R  = SIZE * 0.41;

    const points = destinations
      .filter(d => COORDS[d.id])
      .map((d, i) => ({ ...COORDS[d.id], name: d.name, emoji: d.emoji, i }));

    // ── helpers ──────────────────────────────────────────────────────────────
    function project(lon, lat, rot) {
      const lonR = (lon + rot) * DEG;
      const latR = lat * DEG;
      return {
        x: cx + R * Math.cos(latR) * Math.sin(lonR),
        y: cy - R * Math.sin(latR),
        z: Math.cos(latR) * Math.cos(lonR),
      };
    }

    function pillRect(x, y, w, h, r) {
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
      } else {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      }
    }

    // ── draw land rings ───────────────────────────────────────────────────────
    function drawLand(rot) {
      ctx.save();
      // clip to globe circle
      ctx.beginPath();
      ctx.arc(cx, cy, R - 1, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle   = '#4a9c72';
      ctx.strokeStyle = '#3a7d5a';
      ctx.lineWidth   = 0.4;

      allRings.forEach(ring => {
        let started = false;
        let px = 0, py = 0;

        ctx.beginPath();
        for (const [lon, lat] of ring) {
          const { x, y } = project(lon, lat, rot);

          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            // break path when crossing the back-to-front seam
            const dx = x - px, dy = y - py;
            if (dx * dx + dy * dy > R * R * 1.2) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          px = x; py = y;
        }
        ctx.fill();
        ctx.stroke();
      });

      ctx.restore();
    }

    // ── main draw ─────────────────────────────────────────────────────────────
    function draw(rot, t) {
      ctx.clearRect(0, 0, SIZE, SIZE);

      // atmosphere glow
      const ag = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 1.22);
      ag.addColorStop(0,   'rgba(193,68,14,0)');
      ag.addColorStop(0.6, 'rgba(193,68,14,0.06)');
      ag.addColorStop(1,   'rgba(193,68,14,0.22)');
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.22, 0, Math.PI * 2);
      ctx.fillStyle = ag;
      ctx.fill();

      // ocean base
      const ocean = ctx.createRadialGradient(cx - R * 0.28, cy - R * 0.28, R * 0.05, cx, cy, R);
      ocean.addColorStop(0,    '#2a6b8a');
      ocean.addColorStop(0.45, '#1b5070');
      ocean.addColorStop(1,    '#0c2535');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = ocean;
      ctx.fill();

      // land (clipped inside globe)
      drawLand(rot);

      // grid lines on top of land (clipped)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R - 0.5, 0, Math.PI * 2);
      ctx.clip();

      // latitude
      ctx.lineWidth = 0.4;
      for (let lat = -75; lat <= 75; lat += 15) {
        const yr = lat * DEG;
        const yp = cy - R * Math.sin(yr);
        const rx = R * Math.cos(yr);
        ctx.beginPath();
        ctx.ellipse(cx, yp, rx, rx * 0.12, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.stroke();
      }
      // longitude
      for (let i = 0; i < 12; i++) {
        const lonR = (i * 30 + rot) * DEG;
        const sinL = Math.sin(lonR);
        const cosL = Math.cos(lonR);
        const rx   = Math.abs(R * sinL);
        const a    = cosL > 0 ? 0.12 * cosL : 0.04;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.max(rx, 0.5), R, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${a})`;
        ctx.lineWidth   = 0.4;
        ctx.stroke();
      }
      ctx.restore();

      // specular highlight
      const sg = ctx.createRadialGradient(cx - R * 0.32, cy - R * 0.32, 0, cx, cy, R);
      sg.addColorStop(0,   'rgba(255,255,255,0.2)');
      sg.addColorStop(0.4, 'rgba(255,255,255,0.04)');
      sg.addColorStop(1,   'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = sg;
      ctx.fill();

      // edge shadow
      const es = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R);
      es.addColorStop(0, 'rgba(0,0,0,0)');
      es.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = es;
      ctx.fill();

      // globe rim
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(232,201,154,0.5)';
      ctx.lineWidth   = 1;
      ctx.stroke();

      // ── destination markers ──────────────────────────────────────────────
      const pts = points
        .map(p => ({ ...p, ...project(p.lon, p.lat, rot) }))
        .sort((a, b) => a.z - b.z); // back → front

      pts.forEach(p => {
        if (p.z < -0.15) return;
        const alpha  = Math.max(0, Math.min(1, (p.z + 0.15) / 0.45));
        const mr     = 4 + p.z * 4;
        const pulse  = (Math.sin(t * 1.7 + p.i * 1.3) + 1) / 2;

        // pulse ring
        if (p.z > 0.2 && alpha > 0.4) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, mr + 10 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(193,68,14,${0.22 * alpha * (1 - pulse)})`;
          ctx.fill();
        }

        // marker
        ctx.beginPath();
        ctx.arc(p.x, p.y, mr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(193,68,14,${0.92 * alpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, mr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(250,245,235,${0.9 * alpha})`;
        ctx.lineWidth   = 1.5;
        ctx.stroke();

        // inner dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(250,245,235,${alpha})`;
        ctx.fill();

        // label (only when clearly facing front)
        if (p.z > 0.2) {
          const la = Math.min(1, (p.z - 0.2) * 5);
          const label = `${p.emoji} ${p.name}`;
          ctx.font = '600 10px Arial, sans-serif';
          const tw = ctx.measureText(label).width;
          const lx = p.x;
          const ly = p.y - mr - 13;
          const pw = tw + 14, ph = 18;

          pillRect(lx - pw / 2, ly - ph / 2, pw, ph, 9);
          ctx.fillStyle = `rgba(10,6,2,${0.82 * la})`;
          ctx.fill();

          ctx.fillStyle      = `rgba(250,245,235,${la})`;
          ctx.textAlign      = 'center';
          ctx.textBaseline   = 'middle';
          ctx.fillText(label, lx, ly);
        }
      });
    }

    // ── animation loop ───────────────────────────────────────────────────────
    let start = null;
    function animate(ts) {
      if (!start) start = ts;
      const t   = (ts - start) / 1000;
      const rot = -t * 7; // 7°/s westward
      draw(rot, t);
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className={styles.wrap}>
      <canvas ref={canvasRef} />
    </div>
  );
}

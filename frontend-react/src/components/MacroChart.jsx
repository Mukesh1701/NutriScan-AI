import { useState, useEffect, useRef } from 'react';
import { Flame, Dumbbell, Zap, Droplet, Leaf } from 'lucide-react';

export default function MacroChart({ protein = 0, carbs = 0, fat = 0 }) {
  const canvasRef = useRef(null);
  const [segments, setSegments] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = 180;
    const center = size / 2;
    const radius = 70;
    const lineWidth = 24;

    ctx.clearRect(0, 0, size, size);

    const p = parseFloat(protein) || 0;
    const c = parseFloat(carbs) || 0;
    const f = parseFloat(fat) || 0;
    const total = p + c + f;

    if (total === 0) {
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(124, 58, 237, 0.08)';
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      setSegments([]);
      return;
    }

    const segData = [
      { value: p, color: '#3b82f6', label: 'Protein', unit: 'g' },
      { value: c, color: '#f59e0b', label: 'Carbs', unit: 'g' },
      { value: f, color: '#f97316', label: 'Fat', unit: 'g' },
    ];

    let startAngle = -Math.PI / 2;
    const gap = 0.04;

    segData.forEach((seg) => {
      const sliceAngle = (seg.value / total) * (Math.PI * 2 - gap * segData.length);
      ctx.beginPath();
      ctx.arc(center, center, radius, startAngle, startAngle + sliceAngle);
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      startAngle += sliceAngle + gap;
    });

    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(total) + 'g', center, center - 8);

    ctx.fillStyle = '#6b6394';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('total macros', center, center + 12);

    setSegments(segData);
  }, [protein, carbs, fat]);

  return (
    <div className="macro-chart-card">
      <h3 className="section-label">Macro Breakdown</h3>
      <div className="macro-chart-row">
        <canvas ref={canvasRef} width={180} height={180} />
        <div className="macro-legend">
          {segments.map((seg, i) => (
            <div key={i} className="legend-item">
              <span className="legend-dot" style={{ background: seg.color }} />
              <span className="legend-label">{seg.label}</span>
              <span className="legend-value">{seg.value.toFixed(1)}{seg.unit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NutritionGrid({ calories, protein, carbs, fat, fiber, unitLabel }) {
  return (
    <div className="nutrition-grid">
      <div className="nut-card nut-calories">
        <div className="nut-emoji"><Flame className="icon-inline" /></div>
        <div className="nut-val">{calories ?? '—'}</div>
        <div className="nut-name">Calories</div>
        <div className="nut-unit">{unitLabel || 'kcal'}</div>
      </div>
      <div className="nut-card nut-protein">
        <div className="nut-emoji"><Dumbbell className="icon-inline" /></div>
        <div className="nut-val">{protein ?? '—'}</div>
        <div className="nut-name">Protein</div>
        <div className="nut-unit">{unitLabel ? `g / ${unitLabel.split(' ')[1]}` : 'g'}</div>
      </div>
      <div className="nut-card nut-carbs">
        <div className="nut-emoji"><Zap className="icon-inline" /></div>
        <div className="nut-val">{carbs ?? '—'}</div>
        <div className="nut-name">Carbs</div>
        <div className="nut-unit">{unitLabel ? `g / ${unitLabel.split(' ')[1]}` : 'g'}</div>
      </div>
      <div className="nut-card nut-fat">
        <div className="nut-emoji"><Droplet className="icon-inline" /></div>
        <div className="nut-val">{fat ?? '—'}</div>
        <div className="nut-name">Fat</div>
        <div className="nut-unit">{unitLabel ? `g / ${unitLabel.split(' ')[1]}` : 'g'}</div>
      </div>
      <div className="nut-card nut-fiber">
        <div className="nut-emoji"><Leaf className="icon-inline" /></div>
        <div className="nut-val">{fiber ?? '—'}</div>
        <div className="nut-name">Fiber</div>
        <div className="nut-unit">{unitLabel ? `g / ${unitLabel.split(' ')[1]}` : 'g'}</div>
      </div>
    </div>
  );
}

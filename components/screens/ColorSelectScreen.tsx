'use client';
import { useRef, useEffect, useState } from 'react';
import { SHIP_COLORS } from '@/game/data/ships';
import { drawPlayerShip } from '@/game/DrawUtils';
import type { ShipColor } from '@/types/game';

interface ColorSelectScreenProps {
  selectedColor: ShipColor;
  onColorChange: (color: ShipColor) => void;
  onNext: () => void;
}

export default function ColorSelectScreen({ selectedColor, onColorChange, onNext }: ColorSelectScreenProps) {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(selectedColor);

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    const loop = () => {
      ctx.clearRect(0, 0, 120, 140);
      drawPlayerShip(ctx, 60, 65, color.hex, color.glow, 1.2);
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [color]);

  const handleSelect = (col: ShipColor) => {
    setColor(col);
    onColorChange(col);
  };

  return (
    <div className="select-content">
      <h2 className="section-title">SELECT YOUR SHIP</h2>
      <div className="ship-preview-area">
        <canvas ref={previewRef} width={120} height={140} />
      </div>
      <div className="color-grid">
        {SHIP_COLORS.map((col, i) => (
          <div
            key={col.id}
            className={`color-chip${col.id === color.id ? ' selected' : ''}`}
            style={col.id === color.id ? { borderColor: col.hex, boxShadow: `0 0 12px ${col.glow}` } : {}}
            onClick={() => handleSelect(col)}
          >
            <span
              className="color-dot"
              style={{ background: col.hex, color: col.hex, boxShadow: `0 0 12px ${col.glow}` }}
            />
            <span>{col.label}</span>
          </div>
        ))}
      </div>
      <button className="btn-neon" onClick={onNext}><span>NEXT ›</span></button>
    </div>
  );
}

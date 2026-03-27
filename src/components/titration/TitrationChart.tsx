'use client';

import { useRef, useEffect } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  Filler,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { CHART_LIGHT } from '@/lib/chart-theme';
import type { TitrationResult } from './ChemistryEngine';
import type { Species } from './AcidBaseDB';
import type { TitrationState } from './TitrationSimulator';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  Filler,
  annotationPlugin
);

interface Props {
  result: TitrationResult;
  sub: Species;
  titrant: Species;
  state: TitrationState;
}

export default function TitrationChart({ result, sub, titrant, state }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const { ph, deriv, eq, he, pka, Vmax } = result;

    const datasets: any[] = [
      {
        label: 'pH',
        data: ph,
        borderColor: '#22d3ee',
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        tension: 0.05,
        yAxisID: 'y',
        fill: false,
      },
    ];

    const maxD = deriv.length
      ? Math.min(Math.max(...deriv.map((d) => Math.abs(d.y))), 300)
      : 10;

    if (state.showDeriv) {
      datasets.push({
        label: 'dpH/dV',
        data: deriv.map((d) => ({ x: d.x, y: Math.min(Math.abs(d.y), maxD * 1.1) })),
        borderColor: 'rgba(167, 139, 250, 0.5)',
        borderWidth: 1.5,
        borderDash: [4, 2],
        pointRadius: 0,
        tension: 0.05,
        yAxisID: 'y2',
        fill: false,
      });
    }

    const annotations: Record<string, any> = {};

    // Phase background regions
    if (eq.length > 0) {
      annotations.phaseA1 = {
        type: 'box',
        xMin: 0,
        xMax: eq[0].v,
        backgroundColor: sub.type === 'acid' ? 'rgba(239,68,68,.04)' : 'rgba(96,165,250,.04)',
        borderWidth: 0,
      };
      if (eq.length >= 1) {
        const lastEq = eq[eq.length - 1];
        annotations.phaseEnd = {
          type: 'box',
          xMin: lastEq.v,
          xMax: Vmax,
          backgroundColor: sub.type === 'acid' ? 'rgba(96,165,250,.04)' : 'rgba(239,68,68,.04)',
          borderWidth: 0,
        };
      }
    }

    // Equivalence lines
    if (state.showEqLines) {
      eq.forEach((e, i) => {
        annotations[`eq${i}`] = {
          type: 'line',
          xMin: e.v,
          xMax: e.v,
          borderColor: 'rgba(244, 114, 182, 0.55)',
          borderWidth: 1.5,
          borderDash: [6, 3],
          label: {
            display: true,
            content: `${e.label} (${e.v} mL)`,
            position: 'start',
            color: '#9d174d',
            backgroundColor: CHART_LIGHT.labelBg,
            borderColor: CHART_LIGHT.tooltipBorder,
            borderWidth: 1,
            font: { size: 10, family: 'monospace', weight: '600' },
            padding: 3,
          },
        };
      });
    }

    // Half-equivalence lines
    if (state.showPkaLines) {
      he.forEach((h, i) => {
        annotations[`he${i}`] = {
          type: 'line',
          xMin: h.v,
          xMax: h.v,
          borderColor: 'rgba(52, 211, 153, 0.3)',
          borderWidth: 1,
          borderDash: [4, 4],
          label: {
            display: true,
            content: `½${h.pk.label}=${h.pk.value.toFixed(1)}`,
            position: 'end',
            color: '#047857',
            backgroundColor: CHART_LIGHT.labelBg,
            borderColor: CHART_LIGHT.tooltipBorder,
            borderWidth: 1,
            font: { size: 9, family: 'monospace', weight: '600' },
            padding: 3,
          },
        };
      });

      // Horizontal pKa lines
      pka.forEach((p, i) => {
        if (p.value > 0 && p.value < 14) {
          annotations[`pkaH${i}`] = {
            type: 'line',
            yMin: p.value,
            yMax: p.value,
            borderColor: 'rgba(52, 211, 153, 0.1)',
            borderWidth: 1,
            borderDash: [2, 6],
          };
        }
      });
    }

    // pH = 7 line
    annotations.ph7 = {
      type: 'line',
      yMin: 7,
      yMax: 7,
      borderColor: 'rgba(100, 140, 200, 0.18)',
      borderWidth: 1,
      borderDash: [8, 4],
    };

    // HH buffer zones
    if (state.showHH && pka.length > 0) {
      pka.forEach((p, i) => {
        const eqV = eq[i]?.v ?? Vmax;
        const prevV = i === 0 ? 0 : (eq[i - 1]?.v ?? 0);
        const v10 = prevV + (eqV - prevV) * 0.1;
        const v90 = prevV + (eqV - prevV) * 0.9;
        annotations[`hh${i}`] = {
          type: 'box',
          xMin: v10,
          xMax: v90,
          backgroundColor: 'rgba(34, 211, 238, 0.06)',
          borderColor: 'rgba(34, 211, 238, 0.2)',
          borderWidth: 1,
          borderDash: [4, 4],
          label: {
            display: true,
            content: `Buffer (${p.label})`,
            position: { x: 'center', y: 'end' },
            color: '#0e7490',
            backgroundColor: CHART_LIGHT.labelBg,
            borderColor: CHART_LIGHT.tooltipBorder,
            borderWidth: 1,
            font: { size: 9, family: 'monospace' },
            padding: 2,
          },
        };
      });
    }

    const scales: any = {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: `Volume of ${titrant.formula} (mL)`,
          color: CHART_LIGHT.axisTitle,
          font: { size: 12, weight: '500' },
        },
        ticks: { color: CHART_LIGHT.tick, font: { family: 'monospace', size: 10 }, maxTicksLimit: 15 },
        grid: { color: CHART_LIGHT.grid },
        border: { color: CHART_LIGHT.axisLine },
        min: 0,
        max: Vmax,
      },
      y: {
        type: 'linear',
        min: 0,
        max: 14,
        title: {
          display: true,
          text: 'pH',
          color: '#0891b2',
          font: { size: 14, weight: '700' },
        },
        ticks: { color: CHART_LIGHT.tick, font: { family: 'monospace', size: 10 }, stepSize: 1 },
        grid: { color: CHART_LIGHT.grid },
        border: { color: CHART_LIGHT.axisLine },
      },
    };

    if (state.showDeriv) {
      scales.y2 = {
        type: 'linear',
        position: 'right',
        min: 0,
        max: maxD * 1.15,
        title: {
          display: true,
          text: 'dpH/dV',
          color: '#a78bfa',
          font: { size: 12, weight: '600' },
        },
        ticks: { color: '#7c3aed', font: { family: 'monospace', size: 9 } },
        grid: { display: false },
        border: { color: CHART_LIGHT.axisLine },
      };
    }

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: { mode: 'nearest', intersect: false, axis: 'x' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: CHART_LIGHT.tooltipBg,
            titleColor: CHART_LIGHT.tooltipTitle,
            bodyColor: CHART_LIGHT.tooltipBody,
            borderColor: CHART_LIGHT.tooltipBorder,
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            titleFont: { family: 'monospace', size: 12 },
            bodyFont: { family: 'monospace', size: 13, weight: 'bold' as const },
            callbacks: {
              title: (items: any[]) => (items.length ? `V = ${items[0].parsed.x.toFixed(2)} mL` : ''),
              label: (item: any) =>
                item.datasetIndex === 0
                  ? ` pH = ${item.parsed.y.toFixed(3)}`
                  : ` dpH/dV = ${item.parsed.y.toFixed(2)}`,
            },
          },
          annotation: { annotations },
        },
        scales,
      },
      plugins: [
        {
          id: 'gradient',
          beforeDatasetDraw(chart: any, { index }: any) {
            if (index !== 0) return;
            const { ctx: c, chartArea: a } = chart;
            if (!a) return;
            const g = c.createLinearGradient(0, a.bottom, 0, a.top);
            g.addColorStop(0, '#34d399');
            g.addColorStop(0.5, '#22d3ee');
            g.addColorStop(1, '#a78bfa');
            chart.data.datasets[0].borderColor = g;
          },
        },
        {
          id: 'markers',
          afterDatasetsDraw(chart: any) {
            if (!state.showMarkers) return;
            const { ctx: c, chartArea: a, scales: sc } = chart;
            if (!a) return;
            const xS = sc.x;
            const yS = sc.y;
            c.save();

            function phAtV(v: number) {
              let best = ph[0];
              for (const pt of ph) {
                if (Math.abs(pt.x - v) < Math.abs(best.x - v)) best = pt;
              }
              return best;
            }

            // Equivalence markers
            eq.forEach((e) => {
              const pt = phAtV(e.v);
              const xP = xS.getPixelForValue(pt.x);
              const yP = yS.getPixelForValue(pt.y);
              if (xP >= a.left && xP <= a.right) {
                c.beginPath();
                c.arc(xP, yP, 5, 0, Math.PI * 2);
                c.fillStyle = '#f472b6';
                c.fill();
                c.strokeStyle = '#fda4af';
                c.lineWidth = 2;
                c.stroke();

                c.font = '600 10px monospace';
                const text = `pH=${e.pH}`;
                const tw = c.measureText(text).width;
                c.fillStyle = CHART_LIGHT.labelBg;
                c.strokeStyle = CHART_LIGHT.tooltipBorder;
                c.lineWidth = 1;
                c.fillRect(xP - tw / 2 - 4, yP - 22, tw + 8, 16);
                c.strokeRect(xP - tw / 2 - 4, yP - 22, tw + 8, 16);
                c.fillStyle = '#be185d';
                c.textAlign = 'center';
                c.textBaseline = 'middle';
                c.fillText(text, xP, yP - 14);
              }
            });

            // Half-equivalence markers
            he.forEach((h) => {
              const pt = phAtV(h.v);
              const xP = xS.getPixelForValue(pt.x);
              const yP = yS.getPixelForValue(pt.y);
              if (xP >= a.left && xP <= a.right) {
                c.beginPath();
                c.arc(xP, yP, 4, 0, Math.PI * 2);
                c.fillStyle = '#34d399';
                c.fill();
                c.strokeStyle = '#6ee7b7';
                c.lineWidth = 2;
                c.stroke();

                c.font = '600 10px monospace';
                const text = `pH=${h.pH}`;
                const tw = c.measureText(text).width;
                c.fillStyle = CHART_LIGHT.labelBg;
                c.strokeStyle = CHART_LIGHT.tooltipBorder;
                c.lineWidth = 1;
                c.fillRect(xP - tw / 2 - 4, yP + 8, tw + 8, 16);
                c.strokeRect(xP - tw / 2 - 4, yP + 8, tw + 8, 16);
                c.fillStyle = '#b45309';
                c.textAlign = 'center';
                c.textBaseline = 'middle';
                c.fillText(text, xP, yP + 16);
              }
            });

            c.restore();
          },
        },
      ],
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [result, state, sub, titrant]);

  return (
    <div className="relative w-full h-full min-h-[360px] rounded-xl border border-[var(--color-border)] bg-white p-3 shadow-sm">
      <canvas ref={canvasRef} />
    </div>
  );
}

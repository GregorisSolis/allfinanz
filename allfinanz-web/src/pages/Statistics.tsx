import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

interface ChartProps {
  data: number[];
}

const LineChart: React.FC<ChartProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart>();

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        if (chartRef.current) {
          chartRef.current.destroy();
        }
        chartRef.current = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: data.map((_, index) => index.toString()),
            datasets: [
              {
                label: 'Data',
                data: data,
                borderColor: 'rgba(0, 0, 255, 0.5)',
                backgroundColor: 'rgb(0, 111, 176)',
              },
            ],
          },
        });
      }
    }
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
};

export default LineChart;

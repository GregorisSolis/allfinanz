import React, { useRef, useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import { API } from '../services/api';
const ID_USER = localStorage.getItem('iden')

interface ChartProps {
  data: never[];
}

const Grafics: React.FC<ChartProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart>();
  const [cards, setCards] = useState([])

  useEffect(() => {

    loadCardUser();
    async function loadCardUser() {
        await API.get(`/card/all-card/user/${ID_USER}`)
        .then(resp => {
            setCards(resp.data.card)
		})
    }

    data.map(item => console.log(item))

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        if (chartRef.current) {
          chartRef.current.destroy();
        }
        chartRef.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: data.map((element) => element.card).filter((value, index, self) => self.lastIndexOf(value) === index),
            datasets: [
              {
                data: data.map((item) => {
                    return {
                      value: item.value.$numberDecimal,
                      additionalString: "extra string"
                    };
                  }),
                borderColor: 
                data.map((item) => {
                    const matchedCard = cards.find((card) => card.name === item.card);
                    return matchedCard ? matchedCard.color : 'rgb(0, 0, 0)';
                  }),
                backgroundColor: data.map((item) => {
                    const matchedCard = cards.find((card) => card.name === item.card);
                    return matchedCard ? matchedCard.color : 'rgb(0, 0, 0)';
                  }),
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

export default Grafics;

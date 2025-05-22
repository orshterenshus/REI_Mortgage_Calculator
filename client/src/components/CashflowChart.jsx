import React from 'react';
import { Line } from 'react-chartjs-2';
import styled from '@emotion/styled';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartContainer = styled.div`
  margin-bottom: 2rem;
`;

const CashflowChart = ({ forecast }) => {
  if (!forecast || !forecast.length) return null;

  const labels = forecast.map((item) => `שנה ${item.year}`);
  const accumulatedCashflow = forecast.map((item) => item.accumulatedCashflow);

  const options = {
    plugins: {
      title: {
        display: true,
        text: 'תזרים מצטבר לאורך השנים',
        font: {
          size: 16,
        },
      },
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'תזרים מצטבר',
        data: accumulatedCashflow,
        fill: 'start',
        backgroundColor: 'rgba(46, 204, 113, 0.2)',
        borderColor: 'rgba(39, 174, 96, 1)',
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  return (
    <ChartContainer className="card">
      <div className="chart-container">
        <Line options={options} data={data} />
      </div>
    </ChartContainer>
  );
};

export default CashflowChart; 
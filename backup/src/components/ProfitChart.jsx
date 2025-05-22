import React from 'react';
import { Bar } from 'react-chartjs-2';
import styled from '@emotion/styled';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ChartContainer = styled.div`
  margin-bottom: 2rem;
`;

const ProfitChart = ({ forecast }) => {
  if (!forecast || !forecast.length) return null;

  const labels = forecast.map((item) => `שנה ${item.year}`);
  const profitPercentages = forecast.map((item) => item.totalProfitPercentage);

  const options = {
    plugins: {
      title: {
        display: true,
        text: 'תשואה מצטברת לאורך זמן',
        font: {
          size: 16,
        },
      },
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.formattedValue}%`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return `${value}%`;
          }
        }
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'רווח כולל באחוזים',
        data: profitPercentages,
        backgroundColor: profitPercentages.map(value => 
          value >= 0 ? 'rgba(46, 204, 113, 0.7)' : 'rgba(231, 76, 60, 0.7)'
        ),
        borderColor: profitPercentages.map(value => 
          value >= 0 ? 'rgba(39, 174, 96, 1)' : 'rgba(192, 57, 43, 1)'
        ),
        borderWidth: 1,
      },
    ],
  };

  return (
    <ChartContainer className="card">
      <div className="chart-container">
        <Bar options={options} data={data} />
      </div>
    </ChartContainer>
  );
};

export default ProfitChart; 
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
  LineElement,
  PointElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const ChartContainer = styled.div`
  margin-bottom: 2rem;
`;

const PropertyValueChart = ({ forecast }) => {
  if (!forecast || !forecast.length) return null;

  const labels = forecast.map((item) => `שנה ${item.year}`);
  const propertyValues = forecast.map((item) => item.propertyValue);
  const marketValues = forecast.map((item) => item.marketValue);
  const loanValues = forecast.map((item) => item.remainingLoan);
  const equityValues = forecast.map((item) => item.equity);

  const options = {
    plugins: {
      title: {
        display: true,
        text: 'שווי נכס מול יתרת משכנתה והון עצמי',
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
      x: {
        stacked: true,
      },
      y: {
        stacked: false,
        beginAtZero: true,
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'הון עצמי',
        data: equityValues,
        backgroundColor: 'rgba(46, 204, 113, 0.7)',
        borderColor: 'rgba(39, 174, 96, 1)',
        borderWidth: 1,
      },
      {
        label: 'יתרת משכנתה',
        data: loanValues,
        backgroundColor: 'rgba(231, 76, 60, 0.7)',
        borderColor: 'rgba(192, 57, 43, 1)',
        borderWidth: 1,
      },
      {
        label: 'שווי נכס',
        data: propertyValues,
        type: 'line',
        fill: false,
        backgroundColor: 'rgba(52, 152, 219, 0.7)',
        borderColor: 'rgba(41, 128, 185, 1)',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: 'מחיר שוק',
        data: marketValues,
        type: 'line',
        fill: false,
        backgroundColor: 'rgba(155, 89, 182, 0.7)',
        borderColor: 'rgba(142, 68, 173, 1)',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderDash: [5, 5]
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

export default PropertyValueChart; 
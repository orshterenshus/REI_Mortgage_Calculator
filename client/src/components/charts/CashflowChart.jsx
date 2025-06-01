/**
 * ========================================
 * רכיב גרף תזרים מזומנים (CashflowChart Component)
 * ========================================
 * 
 * תיאור:
 * רכיב זה מציג גרף קווי של התזרים המצטבר לאורך השנים
 * 
 * תלויות:
 * - React: ספריית ה-UI
 * - react-chartjs-2: ספריית הגרפים
 * - CSS: לעיצוב הרכיב
 * 
 * Props:
 * - forecast: Array - מערך אובייקטי התחזית השנתית
 */

import React from 'react';
import { Line } from 'react-chartjs-2';
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
import '../../styles/charts/CashflowChart.css';

// רישום רכיבי Chart.js
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

/**
 * ========================================
 * רכיב גרף תזרים המזומנים
 * ========================================
 */
const CashflowChart = ({ forecast }) => {
  // בדיקת תקינות נתונים
  if (!forecast || !forecast.length) return null;

  // הכנת נתונים לגרף
  const labels = forecast.map((item) => `שנה ${item.year}`);
  const accumulatedCashflow = forecast.map((item) => item.accumulatedCashflow);

  // הגדרות הגרף
  const options = {
    plugins: {
      title: {
        display: true,
        text: 'תזרים מצטבר לאורך השנים',
        font: {
          size: 16,
          family: 'Arial, sans-serif',
          weight: 'bold'
        },
        color: '#333'
      },
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            family: 'Arial, sans-serif'
          },
          color: '#333',
          padding: 15
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          family: 'Arial, sans-serif'
        },
        bodyFont: {
          size: 12,
          family: 'Arial, sans-serif'
        },
        rtl: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('he-IL', {
                style: 'currency',
                currency: 'ILS',
                maximumFractionDigits: 0
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            family: 'Arial, sans-serif'
          },
          color: '#666'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11,
            family: 'Arial, sans-serif'
          },
          color: '#666',
          callback: function(value) {
            return '₪' + value.toLocaleString('he-IL');
          }
        }
      },
    },
  };

  // נתוני הגרף
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
        pointBackgroundColor: 'rgba(39, 174, 96, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
    ],
  };

  return (
    <div className="cashflow-chart-container">
      <div className="chart-wrapper">
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

/**
 * ========================================
 * ייצוא הרכיב
 * ========================================
 */
export default CashflowChart; 
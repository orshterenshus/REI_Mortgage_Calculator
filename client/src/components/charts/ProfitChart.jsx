/**
 * ========================================
 * רכיב גרף רווחיות (ProfitChart Component)
 * ========================================
 * 
 * תיאור:
 * רכיב זה מציג גרף עמודות של התשואה המצטברת לאורך השנים
 * 
 * תלויות:
 * - React: ספריית ה-UI
 * - react-chartjs-2: ספריית הגרפים
 * - CSS: לעיצוב הרכיב
 * 
 * Props:
 * - forecast: Array - מערך אובייקטי התחזית השנתית
 * - results: Object - תוצאות החישוב (אופציונלי)
 */

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import '../../styles/charts/ProfitChart.css';

// רישום רכיבי Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * ========================================
 * רכיב גרף הרווחיות
 * ========================================
 */
const ProfitChart = ({ forecast, results }) => {
  // בדיקת תקינות נתונים
  if (!forecast || !forecast.length) return null;

  // הכנת נתונים לגרף
  const labels = forecast.map((item) => `שנה ${item.year}`);
  const profitPercentages = forecast.map((item) => item.totalProfitPercentage);

  // הגדרות הגרף
  const options = {
    plugins: {
      title: {
        display: true,
        text: 'תשואה מצטברת לאורך זמן',
        font: {
          size: 16,
          family: 'Arial, sans-serif',
          weight: 'bold'
        },
        color: '#333'
      },
      legend: {
        display: false,
      },
      tooltip: {
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
            return `תשואה מצטברת: ${context.formattedValue}%`;
          }
        }
      }
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
            return `${value}%`;
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
        label: 'רווח כולל באחוזים',
        data: profitPercentages,
        backgroundColor: profitPercentages.map(value => 
          value >= 0 ? 'rgba(46, 204, 113, 0.7)' : 'rgba(231, 76, 60, 0.7)'
        ),
        borderColor: profitPercentages.map(value => 
          value >= 0 ? 'rgba(39, 174, 96, 1)' : 'rgba(192, 57, 43, 1)'
        ),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="profit-chart-container">
      <div className="chart-wrapper">
        <Bar options={options} data={data} />
      </div>
    </div>
  );
};

/**
 * ========================================
 * ייצוא הרכיב
 * ========================================
 */
export default ProfitChart; 
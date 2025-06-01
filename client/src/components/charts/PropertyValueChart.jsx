/**
 * ========================================
 * רכיב גרף שווי נכס (PropertyValueChart Component)
 * ========================================
 * 
 * תיאור:
 * רכיב זה מציג גרף של שווי הנכס, יתרת המשכנתא וההון העצמי לאורך השנים
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
import { Bar } from 'react-chartjs-2';
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
import '../../styles/charts/PropertyValueChart.css';

// רישום רכיבי Chart.js
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

/**
 * ========================================
 * רכיב גרף שווי הנכס
 * ========================================
 */
const PropertyValueChart = ({ forecast }) => {
  // בדיקת תקינות נתונים
  if (!forecast || !forecast.length) return null;

  // הכנת נתונים לגרף
  const labels = forecast.map((item) => `שנה ${item.year}`);
  const propertyValues = forecast.map((item) => item.propertyValue);
  const marketValues = forecast.map((item) => item.marketValue);
  const loanValues = forecast.map((item) => item.remainingLoan);
  const equityValues = forecast.map((item) => item.equity);

  // הגדרות הגרף
  const options = {
    plugins: {
      title: {
        display: true,
        text: 'שווי נכס מול יתרת משכנתה והון עצמי',
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
        rtl: true
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
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
        stacked: false,
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
    <div className="property-chart-container">
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
export default PropertyValueChart; 
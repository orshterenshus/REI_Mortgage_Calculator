/**
 * ========================================
 * רכיב מפת נכסים (PropertyMap Component)
 * ========================================
 * 
 * תיאור:
 * רכיב זה מציג מפת Google Maps עם כל הנכסים מסומנים עליה
 * משתמש ב-Google Maps API ומאפשר אינטראקציה עם הנכסים
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import './PropertyMap.css';

// ננסה לייבא את Google Maps wrapper, אם זה לא עובד נחזור למפה בסיסית
let Wrapper, Status;
try {
  const googleMapsWrapper = require('@googlemaps/react-wrapper');
  Wrapper = googleMapsWrapper.Wrapper;
  Status = googleMapsWrapper.Status;
} catch (error) {
  console.warn('Google Maps wrapper not found, falling back to basic map');
}

/**
 * רכיב המפה עצמו
 */
const MapComponent = ({ deals, onDealClick, selectedDeal, setSelectedDeal }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  // יצירת המפה
  useEffect(() => {
    if (mapRef.current && !map && window.google?.maps) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 31.5, lng: 34.8 }, // מרכז ישראל
        zoom: 8,
        mapTypeId: 'roadmap',
        language: 'he'
      });
      setMap(newMap);
    }
  }, [mapRef, map]);

  // Geocoding - המרת כתובת לקואורדינטות
  const geocodeAddress = async (address) => {
    if (!window.google?.maps?.Geocoder) return null;
    
    const geocoder = new window.google.maps.Geocoder();
    
    try {
      const result = await new Promise((resolve, reject) => {
        geocoder.geocode(
          { 
            address: `${address}, ישראל`,
            region: 'IL'
          },
          (results, status) => {
            if (status === 'OK' && results[0]) {
              resolve(results[0].geometry.location);
            } else {
              reject(status);
            }
          }
        );
      });
      
      return {
        lat: result.lat(),
        lng: result.lng()
      };
    } catch (error) {
      console.warn(`Geocoding failed for ${address}:`, error);
      return getBackupCoordinates(address);
    }
  };

  // קואורדינטות גיבוי למקרה של כשל ב-Geocoding
  const getBackupCoordinates = (address) => {
    const cityCoordinates = {
      'תל אביב': { lat: 32.0853, lng: 34.7818 },
      'ירושלים': { lat: 31.7683, lng: 35.2137 },
      'חיפה': { lat: 32.7940, lng: 34.9896 },
      'באר שבע': { lat: 31.2518, lng: 34.7915 },
      'ראשון לציון': { lat: 31.9730, lng: 34.8044 },
      'פתח תקווה': { lat: 32.0879, lng: 34.8878 },
      'אשדוד': { lat: 31.7940, lng: 34.6506 },
      'נתניה': { lat: 32.3215, lng: 34.8532 },
      'הרצליה': { lat: 32.1624, lng: 34.8443 },
      'רעננה': { lat: 32.1847, lng: 34.8708 },
      'כרמיאל': { lat: 32.9098, lng: 35.2969 },
      'נהריה': { lat: 33.0073, lng: 35.0956 },
      'עפולה': { lat: 32.6074, lng: 35.2892 },
      'טבריה': { lat: 32.7922, lng: 35.5311 },
      'אילת': { lat: 29.5581, lng: 34.9482 }
    };

    const parts = address.split(',');
    if (parts.length >= 2) {
      const city = parts[1].trim();
      
      for (const [cityName, coords] of Object.entries(cityCoordinates)) {
        if (city.includes(cityName) || cityName.includes(city)) {
          return {
            lat: coords.lat + (Math.random() - 0.5) * 0.01,
            lng: coords.lng + (Math.random() - 0.5) * 0.01
          };
        }
      }
    }

    return {
      lat: 31.5 + Math.random() * 2,
      lng: 34.8 + Math.random() * 1
    };
  };

  // יצירת סמנים על המפה
  useEffect(() => {
    if (!map || !deals?.length || !window.google?.maps) return;

    // ניקוי סמנים קיימים
    markers.forEach(marker => marker.setMap(null));

    const newMarkers = [];

    // יצירת סמן לכל עסקה
    const createMarkers = async () => {
      for (const deal of deals) {
        try {
          const coords = await geocodeAddress(deal.address);
          
          if (coords) {
            const marker = new window.google.maps.Marker({
              position: coords,
              map: map,
              title: deal.address,
              animation: window.google.maps.Animation.DROP
            });

            // InfoWindow עבור כל סמן
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="max-width: 250px; font-family: Arial, sans-serif; direction: rtl; text-align: right;">
                  <h4 style="margin: 0 0 10px 0; color: #2c3e50;">${deal.address}</h4>
                  <div style="margin: 5px 0;">
                    <strong>שווי נכס:</strong> ${formatCurrency(deal.propertyValue)}
                  </div>
                  <div style="margin: 5px 0;">
                    <strong>הון עצמי:</strong> ${formatCurrency(deal.equity)}
                  </div>
                  <div style="margin: 5px 0;">
                    <strong>הכנסה חודשית:</strong> ${formatCurrency(deal.monthlyRent)}
                  </div>
                  ${deal.results ? `
                    <div style="margin: 5px 0;">
                      <strong>תשלום חודשי:</strong> ${formatCurrency(deal.results.monthlyPayment)}
                    </div>
                  ` : ''}
                  <button 
                    onclick="window.viewDealDetails && window.viewDealDetails('${deal._id}')"
                    style="
                      background: #3498db; 
                      color: white; 
                      border: none; 
                      padding: 8px 16px; 
                      border-radius: 4px; 
                      cursor: pointer;
                      margin-top: 10px;
                      width: 100%;
                      font-family: Arial, sans-serif;
                    "
                  >
                    צפה בפרטים מלאים
                  </button>
                </div>
              `
            });

            marker.addListener('click', () => {
              // סגירת InfoWindows אחרים
              newMarkers.forEach(m => {
                if (m.infoWindow && m.infoWindow !== infoWindow) {
                  m.infoWindow.close();
                }
              });
              
              infoWindow.open(map, marker);
              setSelectedDeal(deal);
            });

            marker.infoWindow = infoWindow;
            newMarkers.push(marker);
          }
        } catch (error) {
          console.error(`Error creating marker for ${deal.address}:`, error);
        }
      }
      
      setMarkers(newMarkers);
    };

    createMarkers();
  }, [map, deals]);

  // פונקציה גלובלית לצפייה בפרטי עסקה
  useEffect(() => {
    window.viewDealDetails = (dealId) => {
      const deal = deals.find(d => d._id === dealId);
      if (deal && onDealClick) {
        onDealClick(deal);
      }
    };

    return () => {
      delete window.viewDealDetails;
    };
  }, [deals, onDealClick]);

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₪0';
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return <div ref={mapRef} style={{ width: '100%', height: '500px' }} />;
};

/**
 * מפה בסיסית עם CSS (גיבוי)
 */
const BasicMapComponent = ({ deals, onDealClick, selectedDeal, setSelectedDeal }) => {
  // קואורדינטות גיבוי
  const getCoordinatesForAddress = (address) => {
    const cityCoordinates = {
      'תל אביב': { lat: 32.0853, lng: 34.7818 },
      'ירושלים': { lat: 31.7683, lng: 35.2137 },
      'חיפה': { lat: 32.7940, lng: 34.9896 },
      'באר שבע': { lat: 31.2518, lng: 34.7915 },
      'ראשון לציון': { lat: 31.9730, lng: 34.8044 },
      'פתח תקווה': { lat: 32.0879, lng: 34.8878 },
      'אשדוד': { lat: 31.7940, lng: 34.6506 },
      'נתניה': { lat: 32.3215, lng: 34.8532 },
      'הרצליה': { lat: 32.1624, lng: 34.8443 },
      'רעננה': { lat: 32.1847, lng: 34.8708 },
      'כרמיאל': { lat: 32.9098, lng: 35.2969 },
      'נהריה': { lat: 33.0073, lng: 35.0956 },
      'עפולה': { lat: 32.6074, lng: 35.2892 },
      'טבריה': { lat: 32.7922, lng: 35.5311 },
      'אילת': { lat: 29.5581, lng: 34.9482 }
    };

    const parts = address.split(',');
    if (parts.length >= 2) {
      const city = parts[1].trim();
      
      for (const [cityName, coords] of Object.entries(cityCoordinates)) {
        if (city.includes(cityName) || cityName.includes(city)) {
          return {
            lat: coords.lat + (Math.random() - 0.5) * 0.01,
            lng: coords.lng + (Math.random() - 0.5) * 0.01
          };
        }
      }
    }

    return {
      lat: 31.5 + Math.random() * 2,
      lng: 34.8 + Math.random() * 1
    };
  };

  const handleMarkerClick = useCallback((deal) => {
    setSelectedDeal(deal);
    if (onDealClick) {
      onDealClick(deal);
    }
  }, [onDealClick, setSelectedDeal]);

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₪0';
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="basic-map-container">
      <div className="map-background">
        <div className="israel-outline">
          {/* מפה בסיסית של ישראל */}
          <svg viewBox="0 0 400 600" className="israel-svg">
            <path 
              d="M200,50 L220,80 L240,120 L250,160 L260,200 L270,240 L280,280 L275,320 L270,360 L260,400 L250,440 L240,480 L220,520 L200,550 L180,520 L160,480 L150,440 L140,400 L130,360 L135,320 L140,280 L150,240 L160,200 L170,160 L180,120 L200,80 Z" 
              fill="rgba(255,255,255,0.3)" 
              stroke="rgba(255,255,255,0.6)" 
              strokeWidth="2"
            />
          </svg>
        </div>
        
        {/* סמני הנכסים */}
        {deals.map((deal, index) => {
          const coords = getCoordinatesForAddress(deal.address || '');
          const position = {
            x: ((coords.lng - 34.2) / 1.5) * 100,
            y: ((36 - coords.lat) / 5) * 100
          };

          return (
            <div
              key={deal._id}
              className={`property-marker ${selectedDeal?._id === deal._id ? 'selected' : ''}`}
              style={{
                left: `${Math.max(10, Math.min(90, position.x))}%`,
                top: `${Math.max(10, Math.min(90, position.y))}%`
              }}
              onClick={() => handleMarkerClick(deal)}
              title={deal.address}
            >
              <div className="marker-icon">🏠</div>
              <div className="marker-tooltip">
                <div className="tooltip-address">{deal.address}</div>
                <div className="tooltip-value">{formatCurrency(deal.propertyValue)}</div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* פאנל מידע על הנכס הנבחר */}
      {selectedDeal && (
        <div className="property-info-panel">
          <button 
            className="close-panel-btn"
            onClick={() => setSelectedDeal(null)}
          >
            ×
          </button>
          <h3>{selectedDeal.address}</h3>
          <div className="property-details">
            <div className="detail-row">
              <span>מחיר נכס:</span>
              <span>{formatCurrency(selectedDeal.propertyValue)}</span>
            </div>
            <div className="detail-row">
              <span>הון עצמי:</span>
              <span>{formatCurrency(selectedDeal.equity)}</span>
            </div>
            <div className="detail-row">
              <span>שכירות חודשית:</span>
              <span>{formatCurrency(selectedDeal.monthlyRent)}</span>
            </div>
            {selectedDeal.results && (
              <div className="detail-row">
                <span>תשלום חודשי:</span>
                <span>{formatCurrency(selectedDeal.results.monthlyPayment)}</span>
              </div>
            )}
          </div>
          <button 
            className="view-deal-btn"
            onClick={() => onDealClick && onDealClick(selectedDeal)}
          >
            צפה בפרטים מלאים
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * ========================================
 * רכיב הראשי של המפה
 * ========================================
 */
const PropertyMap = ({ deals = [], onDealClick }) => {
  const [mapType, setMapType] = useState('roadmap');
  const [selectedDeal, setSelectedDeal] = useState(null);

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // אם אין מפתח API או אין Wrapper, השתמש במפה בסיסית
  if (!apiKey || !Wrapper) {
    return (
      <div className="property-map-container">
        {!apiKey && (
          <div className="map-notice">
            <p>💡 להפעלת Google Maps, צור קובץ client/.env עם המפתח:</p>
            <code>REACT_APP_GOOGLE_MAPS_API_KEY=המפתח_שלך</code>
          </div>
        )}
        
        {/* כפתורי בקרת מפה */}
        <div className="map-controls">
          <button 
            className={`map-control ${mapType === 'roadmap' ? 'active' : ''}`}
            onClick={() => setMapType('roadmap')}
          >
            מפה
          </button>
          <button 
            className={`map-control ${mapType === 'satellite' ? 'active' : ''}`}
            onClick={() => setMapType('satellite')}
          >
            לוויין
          </button>
        </div>

        <BasicMapComponent 
          deals={deals}
          onDealClick={onDealClick}
          selectedDeal={selectedDeal}
          setSelectedDeal={setSelectedDeal}
        />

        {/* מידע על המפה */}
        <div className="map-info">
          <div className="property-count">
            {deals.length} נכסים מוצגים על המפה (מצב בסיסי)
          </div>
        </div>
      </div>
    );
  }

  const render = (status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <p>טוען מפת Google Maps...</p>
          </div>
        );
      case Status.FAILURE:
        return (
          <div className="map-error">
            <h3>שגיאה בטעינת Google Maps</h3>
            <p>אנא בדוק את מפתח ה-API ושהוא פעיל עבור Maps JavaScript API</p>
            <p style={{fontSize: '0.9rem', color: '#7f8c8d'}}>
              מפתח נוכחי: {apiKey ? `${apiKey.substring(0, 10)}...` : 'לא נמצא'}
            </p>
            <button 
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => window.location.reload()}
            >
              נסה שוב
            </button>
          </div>
        );
      default:
        return (
          <MapComponent 
            deals={deals}
            onDealClick={onDealClick}
            selectedDeal={selectedDeal}
            setSelectedDeal={setSelectedDeal}
          />
        );
    }
  };

  return (
    <div className="property-map-container">
      {/* כפתורי בקרת מפה */}
      <div className="map-controls">
        <button 
          className={`map-control ${mapType === 'roadmap' ? 'active' : ''}`}
          onClick={() => setMapType('roadmap')}
        >
          מפה
        </button>
        <button 
          className={`map-control ${mapType === 'satellite' ? 'active' : ''}`}
          onClick={() => setMapType('satellite')}
        >
          לוויין
        </button>
      </div>

      {/* המפה עצמה */}
      <Wrapper 
        apiKey={apiKey}
        render={render}
        version="beta"
        libraries={['places']}
        language="he"
        region="IL"
      />

      {/* מידע על המפה */}
      <div className="map-info">
        <div className="property-count">
          {deals.length} נכסים מוצגים על המפה
        </div>
      </div>
    </div>
  );
};

export default PropertyMap; 
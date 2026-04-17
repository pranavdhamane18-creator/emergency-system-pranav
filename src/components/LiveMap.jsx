import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEmergency } from '../context/EmergencyContext';
import { calculateDistance } from '../utils/distance';
import { fetchOSRMRoute } from '../utils/routing';

const createCustomIcon = (color, label = '') => L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; font-weight: bold;">${label}</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

const userIcon = createCustomIcon('#3b82f6'); // Blue User
const responderIcon = createCustomIcon('#10b981', '+'); // Green cross
const hospitalIcon = createCustomIcon('#6366f1', 'H'); // Indigo Hospital

const RISK_ZONES = [
  { id: 1, latOffset: 0.005, lngOffset: 0.005, radius: 100, name: 'Accident Prone Area', icon: createCustomIcon('#f59e0b', '⚠️') },
  { id: 2, latOffset: -0.008, lngOffset: 0.002, radius: 100, name: 'Road Work Ahead', icon: createCustomIcon('#f59e0b', '🚧') },
  { id: 3, latOffset: 0.003, lngOffset: -0.008, radius: 100, name: 'Dangerous Blind Turn', icon: createCustomIcon('#f59e0b', '🔄') },
];

const EMERGENCY_SERVICES_OFFSETS = [
  { id: 1, latOffset: 0.003, lngOffset: -0.004, name: 'City Hospital' },
  { id: 2, latOffset: -0.005, lngOffset: -0.006, name: 'Central Police Station' }
];

function MapController({ center, simulating }) {
  const map = useMap();
  useEffect(() => {
    if (center && simulating) {
      map.setView(center, map.getZoom(), { animate: true });
    } else if (center && !simulating && map.getZoom() < 10) {
      map.setView(center, 14);
    }
  }, [center, simulating, map]);
  return null;
}

export default function LiveMap() {
  const { userLocation, setUserLocation, appState, setAppState, activeWarning, setActiveWarning, responder, responderRoute } = useEmergency();
  const [riskZones, setRiskZones] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  
  const [simulating, setSimulating] = useState(false);
  const [simInterval, setSimInterval] = useState(null);
  const [userRoute, setUserRoute] = useState([]);

  useEffect(() => {
    let watchId;
    let fallbackTimer;

    const setupMapData = (loc) => {
      setUserLocation(loc);
      if (riskZones.length === 0) {
        setRiskZones(RISK_ZONES.map(z => ({
          ...z,
          lat: loc.lat + z.latOffset,
          lng: loc.lng + z.lngOffset
        })));
        setHospitals(EMERGENCY_SERVICES_OFFSETS.map(h => ({
          ...h,
          lat: loc.lat + h.latOffset,
          lng: loc.lng + h.lngOffset
        })));
      }
    };

    const applyFallback = () => {
      if (!simulating) {
        const defaultLoc = { lat: 40.7128, lng: -74.0060 }; // NYC
        setupMapData(defaultLoc);
      }
    };

    if (navigator.geolocation) {
      fallbackTimer = setTimeout(() => {
        if (!userLocation) applyFallback();
      }, 3000);

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          clearTimeout(fallbackTimer);
          if (!simulating) {
            setupMapData({ lat: position.coords.latitude, lng: position.coords.longitude });
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          clearTimeout(fallbackTimer);
          if (!userLocation) applyFallback();
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
      
      return () => {
        if (watchId) navigator.geolocation.clearWatch(watchId);
        clearTimeout(fallbackTimer);
      };
    } else {
      if (!userLocation) applyFallback();
    }
  }, [simulating, riskZones.length, setUserLocation, userLocation]);

  useEffect(() => {
    if (!userLocation || riskZones.length === 0 || appState === 'EMERGENCY') return;

    let inDangerZone = null;
    for (const zone of riskZones) {
      const distKm = calculateDistance(userLocation.lat, userLocation.lng, zone.lat, zone.lng);
      if (distKm * 1000 < zone.radius) {
        inDangerZone = zone;
        break;
      }
    }

    if (inDangerZone && appState === 'NORMAL') {
      setActiveWarning(inDangerZone);
      setAppState('WARNING');
    } else if (!inDangerZone && appState === 'WARNING') {
      setActiveWarning(null);
      setAppState('NORMAL');
    }
  }, [userLocation, riskZones, appState, setAppState, setActiveWarning]);

  const toggleSimulation = async () => {
    if (simulating) {
      setSimulating(false);
      setUserRoute([]);
      clearInterval(simInterval);
    } else {
      if (!userLocation || riskZones.length === 0) return;
      
      // Target a random risk zone for simulation variety
      const target = riskZones[Math.floor(Math.random() * riskZones.length)];
      
      const routePoints = await fetchOSRMRoute(userLocation, target);
      setUserRoute(routePoints);
      setSimulating(true);
      
      let stepIndex = 0;
      
      const interval = setInterval(() => {
        if (stepIndex >= routePoints.length) {
          clearInterval(interval);
          setSimulating(false);
          return;
        }
        setUserLocation(routePoints[stepIndex]);
        stepIndex++;
      }, 800);
      
      setSimInterval(interval);
    }
  };

  useEffect(() => {
    return () => {
      if (simInterval) clearInterval(simInterval);
    };
  }, [simInterval]);

  if (!userLocation) {
    return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>Loading Map...</div>;
  }

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <MapContainer 
        center={userLocation} 
        zoom={14} 
        style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={userLocation} simulating={simulating} />
        
        {userRoute.length > 0 && <Polyline positions={userRoute} color="#3b82f6" weight={4} opacity={0.8} />}
        {responderRoute && responderRoute.length > 0 && !responder?.hasArrived && (
          <Polyline positions={responderRoute} color="#10b981" weight={4} opacity={0.8} dashArray="10, 10" />
        )}
        
        <Marker position={userLocation} icon={userIcon}>
           <Tooltip direction="top" opacity={1}>You</Tooltip>
        </Marker>

        {riskZones.map(zone => (
          <Marker key={`risk-${zone.id}`} position={{ lat: zone.lat, lng: zone.lng }} icon={zone.icon}>
            <Tooltip direction="top" opacity={1}>{zone.name}</Tooltip>
          </Marker>
        ))}

        {hospitals.map(hosp => (
          <Marker key={`hosp-${hosp.id}`} position={{ lat: hosp.lat, lng: hosp.lng }} icon={hospitalIcon}>
             <Tooltip direction="top" opacity={1}>{hosp.name}</Tooltip>
          </Marker>
        ))}

        {responder && !responder.hasArrived && (
          <Marker position={responder.location} icon={responderIcon}>
             <Tooltip direction="top" opacity={1}>{responder.name}</Tooltip>
          </Marker>
        )}
      </MapContainer>

      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
        <button 
          onClick={toggleSimulation}
          className="btn btn-secondary"
          style={{ padding: '8px 12px', background: 'rgba(30, 41, 59, 0.9)', fontSize: '12px', border: '2px solid rgba(255,255,255,0.2)' }}
        >
          {simulating ? 'Stop Drive' : 'Simulate Route Drive'}
        </button>
      </div>
    </div>
  );
}

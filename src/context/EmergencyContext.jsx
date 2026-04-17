import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { fetchOSRMRoute } from '../utils/routing';

const EmergencyContext = createContext();

export function useEmergency() {
  return useContext(EmergencyContext);
}

export function EmergencyProvider({ children }) {
  const [appState, setAppState] = useState('NORMAL'); // 'NORMAL', 'WARNING', 'EMERGENCY'
  const [activeWarning, setActiveWarning] = useState(null); // specific hazard info
  const [userLocation, setUserLocation] = useState(null); // { lat, lng }
  const [sosActive, setSosActive] = useState(false);
  const [alerts, setAlerts] = useState([]);
  
  const [responder, setResponder] = useState(null); 
  const [responderRoute, setResponderRoute] = useState([]); 

  const responderIntervalRef = useRef(null);

  const triggerSOS = async () => {
    if (sosActive) return;
    
    setAppState('EMERGENCY');
    setSosActive(true);
    setAlerts(['Emergency detected', 'Finding nearby responders...']);

    // Trigger Automatic SMS API Alert
    if (userLocation) {
       const message = `SOS! I need immediate assistance. My location is: https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
       
       fetch('https://textbelt.com/text', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           phone: '+919022023689',
           message: message,
           key: 'textbelt',
         })
       }).catch(err => console.error("SMS API Error:", err));
    }

    // Simulate finding responder
    setTimeout(async () => {
      setAlerts(prev => [...prev, 'Nearby responder notified']);
      
      if (userLocation) {
        // Spawn responder much closer (0.003 degrees away approx 300-400m)
        const initialResponderLoc = {
          lat: userLocation.lat + 0.003,
          lng: userLocation.lng + 0.003
        };
        
        // Fetch the real road route from OSRM
        const route = await fetchOSRMRoute(initialResponderLoc, userLocation);
        setResponderRoute(route);

        setResponder({
          name: "Unit-7 (Paramedic)",
          location: initialResponderLoc,
          distance: 0.5,
          eta: "2 mins",
          hasArrived: false,
          routeIndex: 0
        });
      }
    }, 2000);

    setTimeout(() => {
      setAlerts(prev => [...prev, 'Emergency contacts alerted']);
    }, 4000);

    setTimeout(() => {
      setAlerts(prev => [...prev, 'Help is on the way!']);
    }, 5500);
  };

  const cancelSOS = () => {
    setAppState('NORMAL');
    setSosActive(false);
    setAlerts([]);
    setResponder(null);
    setResponderRoute([]);
    if (responderIntervalRef.current) clearInterval(responderIntervalRef.current);
  };

  // Move responder along the fetched OSRM route path
  useEffect(() => {
    if (responder && !responder.hasArrived && responderRoute.length > 0) {
      responderIntervalRef.current = setInterval(() => {
        setResponder(prev => {
          if (!prev || prev.hasArrived) return prev;

          let nextIndex = prev.routeIndex + 1;
          
          // If we reach the end of the route array
          if (nextIndex >= responderRoute.length) {
            clearInterval(responderIntervalRef.current);
            return {
              ...prev,
              location: responderRoute[responderRoute.length - 1],
              distance: 0,
              eta: "Arrived",
              hasArrived: true
            };
          }

          // Progress through the route points. Calculate remaining distance roughly.
          const remainingPoints = responderRoute.length - nextIndex;
          const distanceKm = remainingPoints * 0.01; // Rough estimation for demo
          
          return {
            ...prev,
            location: responderRoute[nextIndex],
            routeIndex: nextIndex,
            distance: distanceKm.toFixed(2),
            eta: remainingPoints > 10 ? '2 mins' : '1 min'
          };
        });
      }, 800); // 800ms per coordinate point = realistic visual movement
    }

    return () => {
      if (responderIntervalRef.current) clearInterval(responderIntervalRef.current);
    };
  }, [responder, responderRoute]);

  return (
    <EmergencyContext.Provider value={{
      appState, setAppState,
      activeWarning, setActiveWarning,
      userLocation, setUserLocation,
      sosActive, triggerSOS, cancelSOS,
      alerts, responder, responderRoute
    }}>
      {children}
    </EmergencyContext.Provider>
  );
}

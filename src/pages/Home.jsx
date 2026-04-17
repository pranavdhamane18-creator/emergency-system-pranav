import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import LiveMap from '../components/LiveMap';
import { AlertTriangle, X, Navigation } from 'lucide-react';

export default function Home() {
  const { appState, sosActive, triggerSOS, cancelSOS, alerts, responder, activeWarning } = useEmergency();

  return (
    <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Map Container - fills available space */}
      <div style={{ flex: 1, minHeight: '350px', position: 'relative' }}>
        <LiveMap />
        
        {/* Warning Banner overlay */}
        {appState === 'WARNING' && (
          <div style={{ 
            position: 'absolute', top: 10, left: 10, right: 10, zIndex: 1000, 
            background: 'rgba(245, 158, 11, 0.9)', color: 'white', padding: '10px 15px', 
            borderRadius: '0.5rem', fontWeight: 'bold', display: 'flex', 
            alignItems: 'center', gap: '10px', backdropFilter: 'blur(4px)', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
          }}>
            <AlertTriangle className="animate-pulse" />
            WARNING: Approaching {activeWarning ? activeWarning.name : 'Risk Zone'}
          </div>
        )}
      </div>

      {/* SOS Panel - fixed at bottom of screen content */}
      <div style={{
        padding: '1.5rem',
        background: 'var(--bg-darker)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        zIndex: 1000,
        position: 'relative'
      }}>
        
        {/* Responder Status Card */}
        {responder && (
          <div className="card" style={{ marginBottom: '1rem', background: responder.hasArrived ? 'var(--accent-green)' : 'var(--bg-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0 }}>{responder.name}</h4>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                  {responder.hasArrived ? 'Responder has arrived' : `ETA: ${responder.eta} (${responder.distance}km)`}
                </div>
              </div>
              {!responder.hasArrived && <Navigation className="animate-pulse" size={24} />}
            </div>
          </div>
        )}

        {/* SOS Alerts Log */}
        {alerts.length > 0 && (
          <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {alerts.map((msg, i) => (
              <div key={i} style={{ 
                fontSize: '0.875rem', 
                color: i === alerts.length - 1 ? 'white' : 'var(--text-muted)',
                animation: 'fade-in 0.5s ease-out'
              }}>
                • {msg}
              </div>
            ))}
          </div>
        )}

        {/* Big Action Button */}
        {!sosActive ? (
          <button 
            onClick={triggerSOS}
            style={{
              width: '100%',
              padding: '1.5rem',
              borderRadius: '1rem',
              background: 'var(--primary-red)',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              animation: 'pulse-red 2s infinite',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <AlertTriangle size={32} />
            SOS EMERGENCY
          </button>
        ) : (
          <button 
            className="btn btn-secondary"
            onClick={cancelSOS}
            style={{ width: '100%', padding: '1rem', borderRadius: '1rem' }}
          >
            <X size={20} />
            Cancel Emergency
          </button>
        )}
      </div>
    </div>
  );
}

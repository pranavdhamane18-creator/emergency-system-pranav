import React, { useState, useEffect, useRef } from 'react';
import { Stethoscope, Activity, Droplet, ArrowLeft, Loader2, Bot } from 'lucide-react';

const SCENARIOS = [
  { id: 'accident', title: 'Car Accident', icon: Activity, color: '#f59e0b' },
  { id: 'unconscious', title: 'Unconscious Person', icon: Stethoscope, color: '#3b82f6' },
  { id: 'bleeding', title: 'Severe Bleeding', icon: Droplet, color: '#ef4444' }
];

const INSTRUCTIONS_DB = {
  accident: [
    "1. Ensure your own safety first. Do not stand in traffic.",
    "2. Check if the victims are responsive.",
    "3. Do not move injured persons unless there is an immediate danger (e.g., fire).",
    "4. Wait for the emergency responders you just alerted."
  ],
  unconscious: [
    "1. Check for responsiveness: tap their shoulder and shout 'Are you okay?'",
    "2. Check for normal breathing for 5-10 seconds.",
    "3. If breathing is normal, place them in the recovery position.",
    "4. If not breathing, begin CPR immediately (push hard and fast in the center of the chest)."
  ],
  bleeding: [
    "1. Apply direct pressure to the wound using a clean cloth or your hands.",
    "2. Maintain continuous pressure for at least 5 minutes without peeking.",
    "3. If possible, elevate the injured area above the heart.",
    "4. If blood soaks through, do not remove the cloth; add more on top."
  ]
};

export default function Guidance() {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [steps, setSteps] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const intervalRef = useRef(null);

  const handleSelect = (scenarioId) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    setSelectedScenario(scenarioId);
    const fullSteps = INSTRUCTIONS_DB[scenarioId];
    setSteps([fullSteps[0]]); // Show first step immediately
    setIsGenerating(true);
    
    let currentStep = 1;
    
    intervalRef.current = setInterval(() => {
      if (currentStep >= fullSteps.length) {
        clearInterval(intervalRef.current);
        setIsGenerating(false);
        return;
      }
      
      const stepToAdd = fullSteps[currentStep];
      setSteps(prev => [...prev, stepToAdd]);
      currentStep++;
    }, 1200);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (selectedScenario) {
    const scenarioDef = SCENARIOS.find(s => s.id === selectedScenario);
    return (
      <div style={{ padding: '1.5rem' }}>
        <button 
          onClick={() => setSelectedScenario(null)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={20} /> Back to Scenarios
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: scenarioDef.color, padding: '0.75rem', borderRadius: '0.5rem', display: 'flex' }}>
            <scenarioDef.icon size={24} color="white" />
          </div>
          <h2 style={{ margin: 0 }}>{scenarioDef.title}</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {steps.map((step, idx) => (
            <div key={idx} className="card" style={{ animation: 'slide-up 0.3s ease-out' }}>
              {step}
            </div>
          ))}
          
          {isGenerating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', padding: '1rem' }}>
              <Loader2 className="animate-spin" size={20} />
              <span>AI is generating next step...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
        <Bot size={48} color="var(--accent-blue)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ margin: '0 0 0.5rem 0' }}>AI Emergency Guidance</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Select an emergency type to receive real-time, step-by-step instructions.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {SCENARIOS.map(scenario => (
          <button
            key={scenario.id}
            onClick={() => handleSelect(scenario.id)}
            className="card"
            style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem', 
              cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)',
              textAlign: 'left', background: 'var(--bg-card)', color: 'white',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ background: scenario.color, padding: '1rem', borderRadius: '0.5rem', display: 'flex' }}>
              <scenario.icon size={24} color="white" />
            </div>
            <span style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{scenario.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

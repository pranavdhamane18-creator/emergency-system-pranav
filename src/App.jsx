import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EmergencyProvider } from './context/EmergencyContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Guidance from './pages/Guidance';
import Evacuation from './pages/Evacuation';
import './index.css';

function App() {
  return (
    <EmergencyProvider>
      <Router>
        <div className="app-container">
          <div className="screen-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/guidance" element={<Guidance />} />
              <Route path="/evacuation" element={<Evacuation />} />
            </Routes>
          </div>
          <Navigation />
        </div>
      </Router>
    </EmergencyProvider>
  );
}

export default App;

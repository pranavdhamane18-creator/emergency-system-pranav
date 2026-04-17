import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, Map, BookOpen } from 'lucide-react';

export default function Navigation() {
  return (
    <nav className="bottom-nav">
      <NavLink 
        to="/" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        end
      >
        <ShieldAlert size={24} />
        <span>SOS & Map</span>
      </NavLink>
      
      <NavLink 
        to="/evacuation" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <Map size={24} />
        <span>Evacuation</span>
      </NavLink>
      
      <NavLink 
        to="/guidance" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <BookOpen size={24} />
        <span>Guidance</span>
      </NavLink>
    </nav>
  );
}

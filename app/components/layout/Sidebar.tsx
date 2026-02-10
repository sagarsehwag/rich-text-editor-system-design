'use client';

import React from 'react';

interface NavItem {
  id: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'rendering', icon: '🎨', label: 'Rendering Approaches' },
  { id: 'contenteditable', icon: '✏️', label: 'ContentEditable Deep Dive' },
  { id: 'selection', icon: '📍', label: 'Selection Inspector' },
  { id: 'state', icon: '🏗️', label: 'State Model & Formatting' },
  { id: 'update-loop', icon: '🔄', label: 'Update Loop' },
  { id: 'node-structures', icon: '🔗', label: 'Node Structures' },
];

interface SidebarProps {
  activeDemo: string;
  onNavigate: (demoId: string) => void;
}

export default function Sidebar({ activeDemo, onNavigate }: SidebarProps) {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h1>📝 Rich Text Editor</h1>
        <p className="subtitle">System Design Demos</p>
      </div>
      <ul className="nav-list">
        {navItems.map((item) => (
          <li
            key={item.id}
            className={`nav-item ${activeDemo === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <p className="tip">💡 Open DevTools (F12) to inspect elements!</p>
      </div>
    </nav>
  );
}

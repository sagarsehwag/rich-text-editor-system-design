'use client';

import React, { useCallback, useEffect } from 'react';

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
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ activeDemo, onNavigate, isOpen, onToggle }: SidebarProps) {
  const handleNavigate = useCallback(
    (demoId: string) => {
      onNavigate(demoId);
      // Close sidebar on mobile after navigation
      if (window.innerWidth <= 768) {
        onToggle();
      }
    },
    [onNavigate, onToggle]
  );

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle]);

  return (
    <>
      {/* Hamburger toggle button - visible only on mobile */}
      <button
        className={`sidebar-toggle ${isOpen ? 'open' : ''}`}
        onClick={onToggle}
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isOpen}
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>

      {/* Overlay backdrop - visible on mobile when sidebar is open */}
      {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}

      <nav className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h1>📝 Rich Text Editor</h1>
          <p className="subtitle">System Design Demos</p>
        </div>
        <ul className="nav-list">
          {navItems.map((item) => (
            <li
              key={item.id}
              className={`nav-item ${activeDemo === item.id ? 'active' : ''}`}
              onClick={() => handleNavigate(item.id)}
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
    </>
  );
}

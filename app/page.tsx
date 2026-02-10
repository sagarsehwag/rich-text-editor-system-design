'use client';

import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import RenderingApproaches from './components/demos/RenderingApproaches';
import ContentEditableDemo from './components/demos/ContentEditableDemo';
import SelectionInspector from './components/demos/SelectionInspector';
import StateModel from './components/demos/StateModel';
import UpdateLoop from './components/demos/UpdateLoop';
import NodeStructures from './components/demos/NodeStructures';

const demoComponents: Record<string, React.ComponentType> = {
  rendering: RenderingApproaches,
  contenteditable: ContentEditableDemo,
  selection: SelectionInspector,
  state: StateModel,
  'update-loop': UpdateLoop,
  'node-structures': NodeStructures,
};

export default function Home() {
  const [activeDemo, setActiveDemo] = useState('rendering');

  const ActiveComponent = demoComponents[activeDemo];

  return (
    <>
      <Sidebar activeDemo={activeDemo} onNavigate={setActiveDemo} />
      <main className="content">
        {ActiveComponent && <ActiveComponent />}
      </main>
    </>
  );
}

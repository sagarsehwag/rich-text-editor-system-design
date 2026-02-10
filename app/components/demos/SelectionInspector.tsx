'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface SelectionState {
  type: string;
  anchorNode: string;
  anchorOffset: string;
  focusNode: string;
  focusOffset: string;
  backwards: string;
}

function getNodeDescription(node: Node | null): string {
  if (!node) return 'null';

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || '';
    const preview = text.length > 20 ? text.substring(0, 20) + '...' : text;
    return `Text: "${preview}"`;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const tag = (node as Element).tagName.toLowerCase();
    return `<${tag}>`;
  }

  return node.nodeName;
}

function isSelectionBackwards(selection: Selection): boolean {
  if (!selection.anchorNode || !selection.focusNode) return false;

  const position = selection.anchorNode.compareDocumentPosition(selection.focusNode);

  if (position === 0) {
    return selection.anchorOffset > selection.focusOffset;
  }

  return (position & Node.DOCUMENT_POSITION_PRECEDING) !== 0;
}

export default function SelectionInspector() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selState, setSelState] = useState<SelectionState>({
    type: '"None"',
    anchorNode: 'null',
    anchorOffset: '0',
    focusNode: 'null',
    focusOffset: '0',
    backwards: 'false',
  });
  const [changed, setChanged] = useState<Record<string, boolean>>({});

  const updateSelectionState = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setSelState({
        type: '"None"',
        anchorNode: 'null',
        anchorOffset: '0',
        focusNode: 'null',
        focusOffset: '0',
        backwards: 'false',
      });
      return;
    }

    const type = selection.isCollapsed ? '"Caret"' : '"Range"';
    const backwards = isSelectionBackwards(selection);

    const newState: SelectionState = {
      type,
      anchorNode: getNodeDescription(selection.anchorNode),
      anchorOffset: selection.anchorOffset.toString(),
      focusNode: getNodeDescription(selection.focusNode),
      focusOffset: selection.focusOffset.toString(),
      backwards: backwards.toString(),
    };

    setSelState((prev) => {
      const changedKeys: Record<string, boolean> = {};
      (Object.keys(newState) as (keyof SelectionState)[]).forEach((key) => {
        if (prev[key] !== newState[key]) {
          changedKeys[key] = true;
        }
      });
      if (Object.keys(changedKeys).length > 0) {
        setChanged(changedKeys);
        setTimeout(() => setChanged({}), 300);
      }
      return newState;
    });
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.anchorNode) {
        const editor = editorRef.current;
        if (editor && editor.contains(selection.anchorNode)) {
          updateSelectionState();
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateSelectionState]);

  function getTextNodes(element: HTMLElement): Text[] {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.textContent?.trim()) {
        textNodes.push(node as Text);
      }
    }
    return textNodes;
  }

  const handleBackwardsSelection = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const textNodes = getTextNodes(editor);
    if (textNodes.length >= 2) {
      const selection = window.getSelection();
      if (!selection) return;

      selection.removeAllRanges();
      const range = document.createRange();
      range.setStart(textNodes[1], Math.min(5, textNodes[1].length));
      range.setEnd(textNodes[1], Math.min(5, textNodes[1].length));
      selection.addRange(range);
      selection.extend(textNodes[0], Math.min(4, textNodes[0].length));

      updateSelectionState();
      editor.focus();
    }
  };

  const handleCrossNodeSelection = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const firstP = editor.querySelector('p');
    const secondP = editor.querySelectorAll('p')[1];

    if (firstP && secondP) {
      const selection = window.getSelection();
      if (!selection) return;

      selection.removeAllRanges();
      const range = document.createRange();

      const startNode = firstP.querySelector('strong') || firstP.firstChild;
      const endNode = secondP.querySelector('em') || secondP.firstChild;

      if (startNode && endNode) {
        const startTarget = startNode.firstChild || startNode;
        const endTarget = endNode.firstChild || endNode;
        range.setStart(startTarget, 0);
        range.setEnd(endTarget, Math.min(4, (endTarget.textContent || '').length));
        selection.addRange(range);
      }

      updateSelectionState();
      editor.focus();
    }
  };

  const stateRows: { label: string; key: keyof SelectionState; highlight?: boolean }[] = [
    { label: 'type:', key: 'type' },
    { label: 'anchorNode:', key: 'anchorNode' },
    { label: 'anchorOffset:', key: 'anchorOffset' },
    { label: 'focusNode:', key: 'focusNode' },
    { label: 'focusOffset:', key: 'focusOffset' },
    { label: 'isBackwards:', key: 'backwards', highlight: true },
  ];

  return (
    <section id="selection" className="demo-section active">
      <div className="demo-header">
        <h2>Selection Inspector</h2>
        <p className="demo-subtitle">Real-time visualization of the browser&apos;s Selection object</p>
      </div>

      <div className="demo-grid two-cols">
        <div className="demo-card large">
          <div className="card-header">
            <h3>Select Text Here</h3>
            <span className="badge badge-blue">Click and drag</span>
          </div>
          <div className="card-content">
            <div
              id="selection-editor"
              ref={editorRef}
              className="demo-contenteditable large"
              contentEditable
              suppressContentEditableWarning
              dangerouslySetInnerHTML={{
                __html:
                  '<p>The quick <strong>brown fox</strong> jumps over the <em>lazy dog</em>.</p><p>Try selecting text across multiple elements to see how selection works!</p>',
              }}
            />
            <div className="selection-actions">
              <button className="btn btn-secondary" onClick={handleBackwardsSelection}>
                Demo Backwards Selection
              </button>
              <button className="btn btn-secondary" onClick={handleCrossNodeSelection}>
                Demo Cross-Node Selection
              </button>
            </div>
          </div>
        </div>

        <div className="demo-card large">
          <div className="card-header">
            <h3>Selection Object State</h3>
            <span className="badge badge-green live-badge">LIVE</span>
          </div>
          <div className="card-content">
            <div className="state-display">
              {stateRows.map((row) => (
                <div key={row.key} className={`state-row ${row.highlight ? 'highlight' : ''}`}>
                  <span className="state-label">{row.label}</span>
                  <span className={`state-value ${changed[row.key] ? 'changed' : ''}`}>
                    {selState[row.key]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="visual-diagram">
        <h3>📐 Selection Direction Matters!</h3>
        <div className="direction-demo">
          <div className="direction-example">
            <h4>Forward Selection (Left → Right)</h4>
            <div className="text-with-markers">
              <span className="marker anchor">anchor</span>
              <span className="selected-text">Selected Text</span>
              <span className="marker focus">focus</span>
            </div>
            <p>Shift + → extends selection</p>
          </div>
          <div className="direction-example">
            <h4>Backward Selection (Right → Left)</h4>
            <div className="text-with-markers">
              <span className="marker focus">focus</span>
              <span className="selected-text">Selected Text</span>
              <span className="marker anchor">anchor</span>
            </div>
            <p>Shift + → shrinks selection!</p>
          </div>
        </div>
      </div>

      <div className="key-insight">
        <h3>🎯 Why This Matters</h3>
        <p>Rich text editors need to:</p>
        <ul>
          <li>Track selection to know WHERE to apply formatting</li>
          <li>Handle backwards selection for proper keyboard navigation</li>
          <li>Map browser selection to their internal state model</li>
        </ul>
      </div>
    </section>
  );
}

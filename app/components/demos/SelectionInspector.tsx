'use client';

import React, { useCallback, useEffect, useRef } from 'react';

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

// Directly update a DOM element's text content without triggering React re-renders.
// This mirrors the vanilla JS approach and avoids selection loss from reconciliation.
function updateElement(el: HTMLElement | null, value: string) {
  if (!el) return;
  if (el.textContent !== value) {
    el.textContent = value;
    el.classList.add('changed');
    setTimeout(() => el.classList.remove('changed'), 300);
  }
}

export default function SelectionInspector() {
  const editorRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLSpanElement>(null);
  const anchorNodeRef = useRef<HTMLSpanElement>(null);
  const anchorOffsetRef = useRef<HTMLSpanElement>(null);
  const focusNodeRef = useRef<HTMLSpanElement>(null);
  const focusOffsetRef = useRef<HTMLSpanElement>(null);
  const backwardsRef = useRef<HTMLSpanElement>(null);

  const updateSelectionState = useCallback(() => {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      updateElement(typeRef.current, '"None"');
      updateElement(anchorNodeRef.current, 'null');
      updateElement(anchorOffsetRef.current, '0');
      updateElement(focusNodeRef.current, 'null');
      updateElement(focusOffsetRef.current, '0');
      updateElement(backwardsRef.current, 'false');
      return;
    }

    const type = selection.isCollapsed ? '"Caret"' : '"Range"';
    const backwards = isSelectionBackwards(selection);

    updateElement(typeRef.current, type);
    updateElement(anchorNodeRef.current, getNodeDescription(selection.anchorNode));
    updateElement(anchorOffsetRef.current, selection.anchorOffset.toString());
    updateElement(focusNodeRef.current, getNodeDescription(selection.focusNode));
    updateElement(focusOffsetRef.current, selection.focusOffset.toString());
    updateElement(backwardsRef.current, backwards.toString());
  }, []);

  // Set up the editor's initial HTML content via ref, not dangerouslySetInnerHTML,
  // so React never tries to reconcile the contentEditable children.
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && !editor.hasChildNodes()) {
      editor.innerHTML =
        '<p>The quick <strong>brown fox</strong> jumps over the <em>lazy dog</em>.</p>' +
        '<p>Try selecting text across multiple elements to see how selection works!</p>';
    }
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
              <div className="state-row">
                <span className="state-label">type:</span>
                <span className="state-value" ref={typeRef}>&quot;None&quot;</span>
              </div>
              <div className="state-row">
                <span className="state-label">anchorNode:</span>
                <span className="state-value" ref={anchorNodeRef}>null</span>
              </div>
              <div className="state-row">
                <span className="state-label">anchorOffset:</span>
                <span className="state-value" ref={anchorOffsetRef}>0</span>
              </div>
              <div className="state-row">
                <span className="state-label">focusNode:</span>
                <span className="state-value" ref={focusNodeRef}>null</span>
              </div>
              <div className="state-row">
                <span className="state-label">focusOffset:</span>
                <span className="state-value" ref={focusOffsetRef}>0</span>
              </div>
              <div className="state-row highlight">
                <span className="state-label">isBackwards:</span>
                <span className="state-value" ref={backwardsRef}>false</span>
              </div>
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

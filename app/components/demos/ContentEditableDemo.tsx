'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

function escapeHTML(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatHTML(html: string): string {
  let formatted = html;
  formatted = formatted.replace(/(<\/?(p|div|h[1-6]|blockquote)[^>]*>)/gi, '\n$1\n');
  formatted = formatted.replace(/(<br\s*\/?>)/gi, '$1\n');
  formatted = formatted.split('\n').filter((line) => line.trim()).join('\n');
  return `<div contenteditable="true">\n  ${formatted}\n</div>`;
}

export default function ContentEditableDemo() {
  const formatEditorRef = useRef<HTMLDivElement>(null);
  const [domOutput, setDomOutput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  const updateDOMOutput = useCallback(() => {
    const editor = formatEditorRef.current;
    if (!editor) return;
    const html = editor.innerHTML;
    const formatted = formatHTML(html);
    setDomOutput(escapeHTML(formatted));
  }, []);

  useEffect(() => {
    updateDOMOutput();
  }, [updateDOMOutput]);

  const handleInput = () => {
    updateDOMOutput();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && ['b', 'i', 'u'].includes(e.key.toLowerCase())) {
      setTimeout(updateDOMOutput, 10);
    }
  };

  return (
    <section id="contenteditable" className="demo-section active">
      <div className="demo-header">
        <h2>ContentEditable Deep Dive</h2>
        <p className="demo-subtitle">Understanding the HTML attribute that powers rich text editing</p>
      </div>

      <div className="demo-grid two-cols">
        {/* Native Formatting */}
        <div className="demo-card large">
          <div className="card-header">
            <h3>Native Formatting Shortcuts</h3>
            <span className="badge badge-green">Try These!</span>
          </div>
          <div className="card-content">
            <div
              id="format-editor"
              ref={formatEditorRef}
              className="demo-contenteditable large"
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyDown={handleKeyDown}
            >
              Type here and try the keyboard shortcuts below to format your text. Select some text first!
            </div>
            <div className="shortcut-grid">
              <div className="shortcut">
                <span><kbd>Ctrl</kbd>+<kbd>B</kbd></span>
                <span>Bold</span>
              </div>
              <div className="shortcut">
                <span><kbd>Ctrl</kbd>+<kbd>I</kbd></span>
                <span>Italic</span>
              </div>
              <div className="shortcut">
                <span><kbd>Ctrl</kbd>+<kbd>U</kbd></span>
                <span>Underline</span>
              </div>
              <div className="shortcut">
                <span><kbd>Ctrl</kbd>+<kbd>Z</kbd></span>
                <span>Undo</span>
              </div>
            </div>
          </div>
        </div>

        {/* DOM Output */}
        <div className="demo-card large">
          <div className="card-header">
            <h3>Live DOM Output</h3>
            <span className="badge badge-blue">Updates in Real-time</span>
          </div>
          <div className="card-content">
            <pre className="code-output">
              <code dangerouslySetInnerHTML={{ __html: domOutput }} />
            </pre>
            <p className="hint">Watch how the DOM changes as you format text ↑</p>
          </div>
        </div>
      </div>

      <div className="demo-grid two-cols">
        {/* Text Nodes Explanation */}
        <div className="demo-card">
          <div className="card-header">
            <h3>🧩 Understanding Text Nodes</h3>
          </div>
          <div className="card-content">
            <div className="text-node-demo">
              <p>How many DOM nodes in this HTML?</p>
              <pre className="code-small">
                <code>&lt;p&gt;Hello &lt;strong&gt;World&lt;/strong&gt;&lt;/p&gt;</code>
              </pre>
              <button
                className="btn btn-primary"
                onClick={() => setShowAnswer(!showAnswer)}
              >
                {showAnswer ? 'Hide Answer' : 'Reveal Answer'}
              </button>
              <div className={`answer ${showAnswer ? '' : 'hidden'}`}>
                <p><strong>4 nodes!</strong></p>
                <ol className="node-list">
                  <li><code>HTMLParagraphElement</code> (&lt;p&gt;)</li>
                  <li><code>Text</code> node: &quot;Hello &quot;</li>
                  <li><code>HTMLStrongElement</code> (&lt;strong&gt;)</li>
                  <li><code>Text</code> node: &quot;World&quot;</li>
                </ol>
                <p className="hint">Text is always in Text nodes - they&apos;re invisible in DevTools by default!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cursor Demo */}
        <div className="demo-card">
          <div className="card-header">
            <h3>📍 Cursor Behavior</h3>
          </div>
          <div className="card-content">
            <div className="cursor-demo-area">
              <div
                contentEditable
                suppressContentEditableWarning
                className="demo-contenteditable multi-line"
                dangerouslySetInnerHTML={{
                  __html: '<h2>Large Heading</h2><p>Normal text here</p><small>Small text</small>',
                }}
              />
            </div>
            <p className="hint">Notice how the cursor height automatically matches the text size!</p>
          </div>
        </div>
      </div>

      <div className="key-insight">
        <h3>⚠️ The Catch with ContentEditable</h3>
        <ul>
          <li>
            <strong>Browser inconsistencies:</strong> Chrome and Safari may produce different HTML for the
            same action
          </li>
          <li>
            <strong>Limited formatting:</strong> Only inline formatting built-in, no headings/lists shortcuts
          </li>
          <li>
            <strong>HTML is unsafe:</strong> Storing raw HTML can lead to XSS vulnerabilities
          </li>
        </ul>
        <p className="solution">
          That&apos;s why editors like Lexical intercept events and maintain their own state model! →
        </p>
      </div>
    </section>
  );
}

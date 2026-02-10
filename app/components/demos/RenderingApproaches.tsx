'use client';

import React, { useEffect, useRef, useState } from 'react';

function CanvasDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText('Hello World', 20, 35);

    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('(This is rendered text)', 20, 60);

    let cursorVisible = true;
    const cursorX = 180;
    const cursorY = 25;

    const interval = setInterval(() => {
      ctx.fillStyle = '#242424';
      ctx.fillRect(cursorX, cursorY, 2, 20);

      if (cursorVisible) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cursorX, cursorY, 2, 20);
      }
      cursorVisible = !cursorVisible;
    }, 530);

    return () => clearInterval(interval);
  }, []);

  return <canvas ref={canvasRef} className="demo-canvas" width={200} height={80} />;
}

function FakeCursorDemo() {
  const demoRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const [showNote, setShowNote] = useState(false);

  const handleWordClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    const word = e.currentTarget;
    const cursor = cursorRef.current;
    if (!cursor) return;

    word.after(cursor);
    cursor.style.animation = 'none';
    // Force reflow
    void cursor.offsetHeight;
    cursor.style.animation = 'fakeBlink 1s step-end infinite';
  };

  return (
    <>
      <div
        className="fake-cursor-demo"
        id="fake-cursor-demo"
        ref={demoRef}
        onMouseEnter={() => setShowNote(true)}
      >
        <span className="word" onClick={handleWordClick}>Hello</span>{' '}
        <span className="word" onClick={handleWordClick}>World</span>
        <span className="fake-cursor" ref={cursorRef}></span>
      </div>
      {showNote && (
        <div className="cursor-complexity-note">
          💡 Real implementation needs: text measurement, line wrapping, font metrics, click position calculation...
        </div>
      )}
    </>
  );
}

export default function RenderingApproaches() {
  return (
    <section id="rendering" className="demo-section active">
      <div className="demo-header">
        <h2>Rendering Approaches Comparison</h2>
        <p className="demo-subtitle">4 ways to render editable text - each with trade-offs</p>
      </div>

      <div className="demo-grid four-cols">
        {/* Textarea */}
        <div className="demo-card">
          <div className="card-header">
            <h3>&lt;textarea&gt;</h3>
            <span className="badge badge-red">Plain Text Only</span>
          </div>
          <div className="card-content">
            <textarea
              className="demo-textarea"
              placeholder="Try typing here..."
              defaultValue={'Hello World\nThis is a second line'}
            />
            <div className="instructions">
              <p>Try: Select text + <kbd>Ctrl</kbd>+<kbd>B</kbd></p>
              <p className="result">❌ Nothing happens - no rich text support</p>
            </div>
          </div>
          <div className="card-footer">
            <ul className="pros-cons">
              <li className="pro">Multi-line support</li>
              <li className="con">No formatting</li>
              <li className="pro">Native cursor</li>
            </ul>
          </div>
        </div>

        {/* DOM with Fake Cursors */}
        <div className="demo-card">
          <div className="card-header">
            <h3>DOM + Fake Cursor</h3>
            <span className="badge badge-orange">Complex!</span>
          </div>
          <div className="card-content">
            <FakeCursorDemo />
            <div className="instructions">
              <p>Click words to &quot;move&quot; cursor</p>
              <p className="result">⚠️ Custom cursor positioning is very hard!</p>
            </div>
          </div>
          <div className="card-footer">
            <ul className="pros-cons">
              <li className="pro">Rich formatting</li>
              <li className="con">Custom cursor needed</li>
              <li className="con">Complex text measurement</li>
            </ul>
          </div>
        </div>

        {/* ContentEditable */}
        <div className="demo-card featured">
          <div className="card-header">
            <h3>contenteditable</h3>
            <span className="badge badge-green">Rich Text!</span>
          </div>
          <div className="card-content">
            <div
              className="demo-contenteditable"
              contentEditable
              suppressContentEditableWarning
              dangerouslySetInnerHTML={{ __html: 'Hello <strong>World</strong>' }}
            />
            <div className="instructions">
              <p>Try: Select text + <kbd>Ctrl</kbd>+<kbd>B</kbd></p>
              <p className="result">✅ Text becomes bold! Inspect to see &lt;b&gt; tags</p>
            </div>
          </div>
          <div className="card-footer">
            <ul className="pros-cons">
              <li className="pro">Rich formatting</li>
              <li className="pro">Native cursor</li>
              <li className="con">Browser inconsistencies</li>
            </ul>
          </div>
        </div>

        {/* Canvas */}
        <div className="demo-card">
          <div className="card-header">
            <h3>&lt;canvas&gt;</h3>
            <span className="badge badge-purple">Custom Everything</span>
          </div>
          <div className="card-content">
            <CanvasDemo />
            <div className="instructions">
              <p>Inspect this element in DevTools</p>
              <p className="result">⚠️ Screen readers can&apos;t access text inside!</p>
            </div>
          </div>
          <div className="card-footer">
            <ul className="pros-cons">
              <li className="pro">Full control</li>
              <li className="con">Custom cursor needed</li>
              <li className="con">Accessibility issues</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="comparison-table-wrapper">
        <h3>📊 Feature Comparison</h3>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Approach</th>
              <th>Rich Formatting</th>
              <th>Cursors</th>
              <th>Implementation</th>
              <th>Used By</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>&lt;textarea&gt;</code></td>
              <td className="no">❌ No</td>
              <td className="yes">✅ Native</td>
              <td className="easy">Easy</td>
              <td>Code editors, comments</td>
            </tr>
            <tr>
              <td><code>DOM + Fake Cursor</code></td>
              <td className="yes">✅ Yes</td>
              <td className="no">⚙️ Custom</td>
              <td className="hard">High</td>
              <td>Rarely used</td>
            </tr>
            <tr className="highlight-row">
              <td><code>contenteditable</code></td>
              <td className="yes">✅ Yes</td>
              <td className="yes">✅ Native</td>
              <td className="medium">Moderate</td>
              <td>Lexical, Slate, Gmail</td>
            </tr>
            <tr>
              <td><code>&lt;canvas&gt;</code></td>
              <td className="yes">✅ Custom</td>
              <td className="no">⚙️ Custom</td>
              <td className="hard">Very High</td>
              <td>Google Docs</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="key-insight">
        <h3>🎯 Key Insight</h3>
        <p>
          <strong>contenteditable</strong> is the sweet spot - you get native rich text support and cursor
          handling for free. That&apos;s why Lexical, Slate, Quill, and most editors use it!
        </p>
      </div>
    </section>
  );
}

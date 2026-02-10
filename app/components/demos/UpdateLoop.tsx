'use client';

import React, { useCallback, useRef, useState } from 'react';

interface StepState {
  activeStep: number | null;
  completedSteps: Set<number>;
  activeArrows: Set<number>;
}

export default function UpdateLoop() {
  const [stepState, setStepState] = useState<StepState>({
    activeStep: null,
    completedSteps: new Set(),
    activeArrows: new Set(),
  });
  const [isRunning, setIsRunning] = useState(false);
  const [buttonText, setButtonText] = useState('▶ Start Animation');
  const [speed, setSpeed] = useState(3);
  const animationRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sleep = useCallback((ms: number): Promise<void> => {
    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(resolve, ms);
    });
  }, []);

  const resetAnimation = useCallback(() => {
    animationRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setStepState({
      activeStep: null,
      completedSteps: new Set(),
      activeArrows: new Set(),
    });
    setIsRunning(false);
    setButtonText('▶ Start Animation');
  }, []);

  const getDelay = useCallback(() => {
    return 2000 - speed * 300;
  }, [speed]);

  const runAnimation = useCallback(async () => {
    if (animationRef.current) return;

    resetAnimation();
    animationRef.current = true;
    setIsRunning(true);
    setButtonText('⏸ Running...');

    const delay = getDelay();

    for (let i = 1; i <= 6; i++) {
      if (!animationRef.current) break;

      setStepState((prev) => ({
        ...prev,
        activeStep: i,
      }));

      await sleep(delay);
      if (!animationRef.current) break;

      setStepState((prev) => {
        const newCompleted = new Set(prev.completedSteps);
        newCompleted.add(i);
        const newArrows = new Set(prev.activeArrows);
        newArrows.add(i);
        return {
          activeStep: null,
          completedSteps: newCompleted,
          activeArrows: newArrows,
        };
      });

      await sleep(delay / 3);
    }

    if (animationRef.current) {
      // Last step stays active
      setStepState((prev) => {
        const newCompleted = new Set(prev.completedSteps);
        newCompleted.delete(6);
        return {
          ...prev,
          activeStep: 6,
          completedSteps: newCompleted,
        };
      });

      await sleep(delay);
    }

    setButtonText('▶ Play Again');
    setIsRunning(false);
    animationRef.current = false;
  }, [getDelay, resetAnimation, sleep]);

  const getStepClass = (step: number): string => {
    const classes = ['update-step'];
    if (step >= 5) classes.push('wide');
    if (stepState.activeStep === step) classes.push('active');
    if (stepState.completedSteps.has(step)) classes.push('completed');
    return classes.join(' ');
  };

  const getArrowClass = (step: number): string => {
    return `flow-arrow ${stepState.activeArrows.has(step) ? 'active' : ''}`;
  };

  return (
    <section id="update-loop" className="demo-section active">
      <div className="demo-header">
        <h2>Update Loop &amp; Reconciliation</h2>
        <p className="demo-subtitle">How editors efficiently update the DOM (like React&apos;s Virtual DOM)</p>
      </div>

      <div className="update-loop-container">
        <div className="update-loop-controls">
          <button
            className="btn btn-primary"
            onClick={runAnimation}
            disabled={isRunning}
          >
            {buttonText}
          </button>
          <button className="btn btn-secondary" onClick={resetAnimation}>
            ↺ Reset
          </button>
          <span className="speed-control">
            <label>Speed:</label>
            <input
              type="range"
              min={1}
              max={5}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </span>
        </div>

        <div className="update-loop-diagram">
          {/* Step 1 */}
          <div className={getStepClass(1)} data-step="1">
            <div className="step-icon">⌨️</div>
            <div className="step-content">
              <h4>1. Intercept Event</h4>
              <p>User presses a key</p>
              <div className="step-detail">
                <code>keydown: &apos;a&apos;</code>
              </div>
            </div>
          </div>

          <div className={getArrowClass(1)} data-step="1">→</div>

          {/* Step 2 */}
          <div className={getStepClass(2)} data-step="2">
            <div className="step-icon">📋</div>
            <div className="step-content">
              <h4>2. Convert to Command</h4>
              <p>Map event to operation</p>
              <div className="step-detail">
                <code>INSERT_TEXT(&apos;a&apos;)</code>
              </div>
            </div>
          </div>

          <div className={getArrowClass(2)} data-step="2">→</div>

          {/* Step 3 */}
          <div className={getStepClass(3)} data-step="3">
            <div className="step-icon">📑</div>
            <div className="step-content">
              <h4>3. Clone State</h4>
              <p>Copy current state</p>
              <div className="step-detail clone-visual">
                <div className="state-box original">Current</div>
                <span className="clone-arrow">→</span>
                <div className="state-box pending">Pending</div>
              </div>
            </div>
          </div>

          <div className={getArrowClass(3)} data-step="3">→</div>

          {/* Step 4 */}
          <div className={getStepClass(4)} data-step="4">
            <div className="step-icon">✏️</div>
            <div className="step-content">
              <h4>4. Modify Clone</h4>
              <p>Apply command to pending state</p>
              <div className="step-detail">
                <code>&quot;Hello&quot; → &quot;Helloa&quot;</code>
              </div>
            </div>
          </div>
        </div>

        <div className="update-loop-diagram row-2">
          {/* Step 5 */}
          <div className={getStepClass(5)} data-step="5">
            <div className="step-icon">🔍</div>
            <div className="step-content">
              <h4>5. Reconcile (Diff)</h4>
              <p>Compare states to find minimum changes</p>
              <div className="step-detail diff-visual">
                <div className="diff-box">
                  <div className="diff-line unchanged">{'{ type: "text",'}</div>
                  <div className="diff-line removed">{' text: "Hello"'}</div>
                  <div className="diff-line added">{' text: "Helloa"'}</div>
                  <div className="diff-line unchanged">{'}'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className={getArrowClass(5)} data-step="5">→</div>

          {/* Step 6 */}
          <div className={getStepClass(6)} data-step="6">
            <div className="step-icon">🖥️</div>
            <div className="step-content">
              <h4>6. Update DOM</h4>
              <p>Apply only the necessary changes</p>
              <div className="step-detail dom-update-visual">
                <div className="dom-node">
                  textNode.<span className="highlight">textContent</span> = &quot;Helloa&quot;
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="update-loop-comparison">
          <h3>Why Not Just Replace Everything?</h3>
          <div className="comparison-grid">
            <div className="comparison-bad">
              <h4>❌ Naive Approach</h4>
              <code>container.innerHTML = newHTML</code>
              <ul>
                <li>Destroys all nodes</li>
                <li>Loses selection/focus</li>
                <li>Slow for large documents</li>
              </ul>
            </div>
            <div className="comparison-good">
              <h4>✅ Reconciliation</h4>
              <code>node.textContent = &quot;Helloa&quot;</code>
              <ul>
                <li>Minimal DOM changes</li>
                <li>Preserves selection</li>
                <li>Fast &amp; efficient</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="key-insight">
        <h3>🎯 Just Like React!</h3>
        <p>This update flow is exactly how React&apos;s Virtual DOM works:</p>
        <ul>
          <li><strong>State change</strong> triggers an update</li>
          <li><strong>New virtual tree</strong> is created</li>
          <li><strong>Diff algorithm</strong> compares old vs new</li>
          <li><strong>Minimal patches</strong> applied to real DOM</li>
        </ul>
        <p className="solution">Lexical implements its own DOM reconciliation that&apos;s independent of React!</p>
      </div>
    </section>
  );
}

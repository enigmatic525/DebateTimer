class Timer {
    constructor(displayElement, initialSeconds, onEndCallback = null, onUpdateCallback = null) {
        this.displayElement = displayElement;
        this.initialSeconds = initialSeconds;
        this.remainingSeconds = initialSeconds;
        this.intervalId = null;
        this.isRunning = false;
        this.onEndCallback = onEndCallback;
        this.onUpdateCallback = onUpdateCallback;
        this.updateDisplay();
    }

    start() {
        if (this.isRunning) return;
        if (this.remainingSeconds <= 0) return;

        this.isRunning = true;
        this.intervalId = setInterval(() => {
            if (this.remainingSeconds > 0) {
                this.remainingSeconds--;
                this.updateDisplay();
                if (this.remainingSeconds === 0) {
                    this.pause();
                    if (this.onEndCallback) {
                        this.onEndCallback();
                    }
                }
            } else {
                this.pause();
            }
        }, 1000);
    }

    pause() {
        if (!this.isRunning) return;
        this.isRunning = false;
        clearInterval(this.intervalId);
    }

    reset() {
        this.pause();
        this.remainingSeconds = this.initialSeconds;
        this.updateDisplay();
    }

    setTime(seconds) {
        this.pause();
        this.initialSeconds = seconds;
        this.remainingSeconds = seconds;
        this.updateDisplay();
    }

    updateDisplay() {
        const minutes = Math.floor(this.remainingSeconds / 60);
        const seconds = this.remainingSeconds % 60;
        this.displayElement.textContent =
            `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (this.onUpdateCallback) {
            this.onUpdateCallback(this.remainingSeconds, this.initialSeconds);
        }
    }
}

// Icons
const playIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
const pauseIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const affDisplay = document.getElementById('aff-time');
    const negDisplay = document.getElementById('neg-time');
    const mainDisplay = document.getElementById('main-time');

    const affToggleBtn = document.getElementById('aff-toggle');
    const negToggleBtn = document.getElementById('neg-toggle');
    const mainToggleBtn = document.getElementById('main-toggle');

    const affResetBtn = document.getElementById('aff-reset');
    const negResetBtn = document.getElementById('neg-reset');
    const mainResetBtn = document.getElementById('main-reset');

    const presetBtns = document.querySelectorAll('.preset-btn');
    const flashOverlay = document.getElementById('flash-overlay');

    // Initialize Timers
    // Prep timers: 3 minutes (180 seconds)
    const affTimer = new Timer(affDisplay, 180);
    const negTimer = new Timer(negDisplay, 180);

    // Draw hash marks for the timer ring
    const drawHashMarks = () => {
        const group = document.getElementById('hash-marks');
        group.innerHTML = '';
        const cx = 200, cy = 200;
        const innerRadius = 175;
        const outerRadius = 195;
        const totalMarks = 60;

        for (let i = 0; i < totalMarks; i++) {
            const angle = (i / totalMarks) * 360 - 90;
            const radians = angle * Math.PI / 180;
            const x1 = cx + innerRadius * Math.cos(radians);
            const y1 = cy + innerRadius * Math.sin(radians);
            const x2 = cx + outerRadius * Math.cos(radians);
            const y2 = cy + outerRadius * Math.sin(radians);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('class', 'hash-mark');
            group.appendChild(line);
        }
    };
    drawHashMarks();

    const updateRing = (remaining, initial) => {
        const marks = document.querySelectorAll('.hash-mark');
        const consumedFraction = (initial - remaining) / initial;
        const numConsumedMarks = Math.floor(consumedFraction * marks.length);

        marks.forEach((mark, index) => {
            if (index < numConsumedMarks) {
                mark.classList.add('consumed');
            } else {
                mark.classList.remove('consumed');
            }
        });
    };

    // Main timer: Start at 4 minutes (240 seconds)
    const triggerFlash = () => {
        flashOverlay.classList.remove('flash-active');
        // Trigger reflow to restart animation
        void flashOverlay.offsetWidth;
        flashOverlay.classList.add('flash-active');
    };

    const mainTimer = new Timer(mainDisplay, 240, triggerFlash, updateRing);

    // Button Toggle Logic helper
    const toggleTimer = (timer, btn, isMain = false) => {
        if (timer.isRunning) {
            timer.pause();
            if (isMain) {
                btn.textContent = 'Resume';
            } else {
                btn.innerHTML = playIcon;
            }
        } else {
            if (timer.remainingSeconds > 0) {
                timer.start();
                if (isMain) {
                    btn.textContent = 'Pause';
                } else {
                    btn.innerHTML = pauseIcon;
                }
            }
        }
    };

    const resetUI = (timer, btn, isMain = false) => {
        timer.reset();
        if (isMain) {
            btn.textContent = 'Start';
        } else {
            btn.innerHTML = playIcon;
        }
    };

    // Event Listeners - Toggles
    affToggleBtn.addEventListener('click', () => toggleTimer(affTimer, affToggleBtn));
    negToggleBtn.addEventListener('click', () => toggleTimer(negTimer, negToggleBtn));
    mainToggleBtn.addEventListener('click', () => toggleTimer(mainTimer, mainToggleBtn, true));

    // Event Listeners - Resets
    affResetBtn.addEventListener('click', () => resetUI(affTimer, affToggleBtn));
    negResetBtn.addEventListener('click', () => resetUI(negTimer, negToggleBtn));
    mainResetBtn.addEventListener('click', () => resetUI(mainTimer, mainToggleBtn, true));

    // Event Listeners - Presets
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const seconds = parseInt(btn.dataset.time);
            mainTimer.setTime(seconds);
            mainToggleBtn.textContent = 'Start';

            // Visual feedback for active preset
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});

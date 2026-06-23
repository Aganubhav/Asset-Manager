document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('timer-display');
  const btnStart = document.getElementById('btn-start');
  const btnPause = document.getElementById('btn-pause');
  const btnReset = document.getElementById('btn-reset');
  
  const modes = {
    focus: { time: 25 * 60, btn: document.getElementById('btn-focus') },
    shortBreak: { time: 5 * 60, btn: document.getElementById('btn-short-break') },
    longBreak: { time: 15 * 60, btn: document.getElementById('btn-long-break') }
  };
  
  let currentMode = 'focus';
  let timeLeft = modes.focus.time;
  let timerInterval = null;

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function updateDisplay() {
    display.innerText = formatTime(timeLeft);
  }

  function setMode(mode) {
    currentMode = mode;
    timeLeft = modes[mode].time;
    updateDisplay();
    clearInterval(timerInterval);
    btnStart.style.display = 'inline-block';
    btnPause.style.display = 'none';
    
    Object.values(modes).forEach(m => m.btn.style.background = 'var(--bg-tertiary)');
    modes[mode].btn.style.background = 'var(--accent)';
  }

  Object.keys(modes).forEach(mode => {
    modes[mode].btn.addEventListener('click', () => setMode(mode));
  });

  btnStart.addEventListener('click', () => {
    btnStart.style.display = 'none';
    btnPause.style.display = 'inline-block';
    
    timerInterval = setInterval(() => {
      timeLeft--;
      updateDisplay();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        toast('Timer completed!', 'success');
        if (currentMode === 'focus') {
          logActivity('Completed Pomodoro Focus Session');
        }
        setMode('shortBreak');
      }
    }, 1000);
  });

  btnPause.addEventListener('click', () => {
    clearInterval(timerInterval);
    btnStart.style.display = 'inline-block';
    btnPause.style.display = 'none';
  });

  btnReset.addEventListener('click', () => {
    setMode(currentMode);
  });

  updateDisplay();
});
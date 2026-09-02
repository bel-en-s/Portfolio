const STARTUP_MS = 520;
const SHUTDOWN_MS = 550;

const CANVAS_SIZE_PX = 20;
const WAVE_POINT_COUNT = 48;
const WAVE_ANIMATION_SPEED = -0.05;
const WAVE_IDLE_SHAPE = { sinHeight: 0.6, stretch: 10 };
const WAVE_ACTIVE_SHAPE = { sinHeight: 1.5, stretch: 5 };

function easeOutCubic(p) {
  return 1 - (1 - p) ** 3;
}

function easeInCubic(p) {
  return p ** 3;
}

function interpolate(a, b, p) {
  return a + (b - a) * p;
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const audio = document.getElementById('bg-audio');
const button = document.getElementById('audio-toggle');

if (audio && button) {
  const canvas = button.querySelector('.audio-toggle-wave');
  if (canvas) {

  const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = CANVAS_SIZE_PX * devicePixelRatio;
  canvas.height = CANVAS_SIZE_PX * devicePixelRatio;
  canvas.style.width = `${CANVAS_SIZE_PX}px`;
  canvas.style.height = `${CANVAS_SIZE_PX}px`;

  const ctx = canvas.getContext('2d');
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 1.25;

  let waveMode = 'active';
  let transitionStartTime = 0;
  let waveTime = 0;
  let previousPlaying = !audio.paused;

  function getEnvelope(now) {
    if (waveMode === 'rampUp') {
      const progress = Math.min(1, (now - transitionStartTime) / STARTUP_MS);
      if (progress >= 1) {
        waveMode = 'active';
        return 1;
      }
      return easeOutCubic(progress);
    }

    if (waveMode === 'rampDown') {
      const progress = Math.min(1, (now - transitionStartTime) / SHUTDOWN_MS);
      if (progress >= 1) {
        waveMode = 'still';
        return 0;
      }
      return 1 - easeInCubic(progress);
    }

    return waveMode === 'active' ? 1 : 0;
  }

  function drawWave(envelope) {
    const size = CANVAS_SIZE_PX;
    const sinHeight = interpolate(WAVE_IDLE_SHAPE.sinHeight, WAVE_ACTIVE_SHAPE.sinHeight, envelope);
    const stretch = interpolate(WAVE_IDLE_SHAPE.stretch, WAVE_ACTIVE_SHAPE.stretch, envelope);
    const midlineY = size / 2;

    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = getComputedStyle(canvas).color;
    ctx.globalAlpha = 1;
    ctx.beginPath();

    let amplitudeIncrement = 0;
    for (let pointIndex = 0; pointIndex <= WAVE_POINT_COUNT; pointIndex++) {
      if (pointIndex < WAVE_POINT_COUNT / 2) {
        amplitudeIncrement += 0.1;
      } else {
        amplitudeIncrement += -0.1;
      }

      const x = (size / WAVE_POINT_COUNT) * pointIndex;
      const y =
        midlineY +
        Math.sin(waveTime * WAVE_ANIMATION_SPEED + pointIndex / stretch) *
          sinHeight *
          amplitudeIncrement;
      ctx.lineTo(x, y);
    }

    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function renderFrame(now) {
    waveTime += 1;
    drawWave(getEnvelope(now));
    requestAnimationFrame(renderFrame);
  }

  function startTransition(mode) {
    waveMode = mode;
    transitionStartTime = performance.now();
  }

  function syncState() {
    const playing = !audio.paused;
    button.classList.toggle('playing', playing);
    button.setAttribute('aria-pressed', playing ? 'true' : 'false');

    if (playing === previousPlaying) return;
    previousPlaying = playing;
    startTransition(playing ? 'rampDown' : 'rampUp');
  }

  audio.addEventListener('play', syncState);
  audio.addEventListener('pause', syncState);

  syncState();

  if (prefersReducedMotion) {
    drawWave(0);
  } else {
    requestAnimationFrame(renderFrame);
  }
  }
}

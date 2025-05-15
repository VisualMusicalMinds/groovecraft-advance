// --- Sound Synthesis Variables ---
let ctx = null, masterGain = null, compressor = null;
let customVoiceWave = null;
// CHANGED: use 'saw' instead of 'sawtooth'
const waveforms = ['sine', 'triangle', 'square', 'saw', 'voice'];
let currentWaveformIndex = 1;
let currentWaveform = waveforms[currentWaveformIndex];

// A/B toggle variables
let currentToggle = 'A'; // Default to A
let progressionA = ['', '', '', '']; // Store the chord selections for A
let progressionB = ['', '', '', '']; // Store the chord selections for B
let rhythmBoxesA = Array(8).fill(false); // Store the rhythm box states for A (8 boxes total)
let rhythmBoxesB = Array(8).fill(false); // Store the rhythm box states for B (8 boxes total)

function setupCustomVoiceWave() {
  const harmonics = 20;
  const real = new Float32Array(harmonics);
  const imag = new Float32Array(harmonics);
  real[1] = 1;
  real[2] = 0.15;
  real[3] = 0.1;
  real[4] = 0.05;
  for (let i = 5; i < harmonics; i++) real[i] = 0;
  if (ctx) {
    customVoiceWave = ctx.createPeriodicWave(real, imag);
  }
}

async function ensureAudio() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 1;
    compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    compressor.connect(ctx.destination);
    masterGain.connect(compressor);
    setupCustomVoiceWave();
  }
  if (!customVoiceWave) setupCustomVoiceWave();
  if (ctx.state !== "running") {
    await ctx.resume();
  }
}

// --- Instrument Dial Logic ---
function updateWaveformDisplay() {
  document.getElementById("waveform-name").textContent = currentWaveform;
}
function handleWaveformDial(dir) {
  currentWaveformIndex = (currentWaveformIndex + dir + waveforms.length) % waveforms.length;
  currentWaveform = waveforms[currentWaveformIndex];
  updateWaveformDisplay();
}

// --- A/B Toggle Functions ---
function saveCurrentProgression() {
  // Save the current chord selections and rhythm boxes state to the current toggle
  const chordValues = Array.from(document.querySelectorAll('.chord-select')).map(select => select.value);
  const rhythmBoxStates = Array.from(document.querySelectorAll('.bottom-rhythm-box')).map(box => box.classList.contains('active'));
  
  if (currentToggle === 'A') {
    progressionA = [...chordValues];
    rhythmBoxesA = [...rhythmBoxStates];
  } else {
    progressionB = [...chordValues];
    rhythmBoxesB = [...rhythmBoxStates];
  }
}

function loadProgression(toggle) {
  // Load the chord selections and rhythm box states from the specified toggle
  const progression = toggle === 'A' ? progressionA : progressionB;
  const rhythmBoxStates = toggle === 'A' ? rhythmBoxesA : rhythmBoxesB;
  
  // Set chord selections
  document.querySelectorAll('.chord-select').forEach((select, idx) => {
    select.value = progression[idx];
    setSlotColorAndStyle(idx, select);
  });
  
  // Set rhythm box states
  document.querySelectorAll('.bottom-rhythm-box').forEach((box, idx) => {
    if (rhythmBoxStates[idx]) {
      box.classList.add('active');
    } else {
      box.classList.remove('active');
    }
  });
  
  // Update rhythm pictures based on new state
  updateRhythmPictures();
}

function switchToggle(toggle) {
  if (currentToggle === toggle) return; // No change needed
  
  // Save current state to current toggle
  saveCurrentProgression();
  
  // Update toggle state
  currentToggle = toggle;
  
  // Update toggle buttons UI
  document.getElementById('toggleA').classList.toggle('ab-active', toggle === 'A');
  document.getElementById('toggleB').classList.toggle('ab-active', toggle === 'B');
  
  // Load the state from the newly selected toggle
  loadProgression(toggle);
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("wave-left").onclick = () => handleWaveformDial(-1);
  document.getElementById("wave-right").onclick = () => handleWaveformDial(1);
  document.getElementById("wave-left").addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter" || e.key === "ArrowLeft") {
      e.preventDefault();
      handleWaveformDial(-1);
      document.getElementById("wave-left").focus();
    }
  });
  document.getElementById("wave-right").addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight") {
      e.preventDefault();
      handleWaveformDial(1);
      document.getElementById("wave-right").focus();
    }
  });
  updateWaveformDisplay();

  // Initialize A/B toggle button listeners
  document.getElementById('toggleA').addEventListener('click', () => switchToggle('A'));
  document.getElementById('toggleB').addEventListener('click', () => switchToggle('B'));
  
  // Also add keyboard navigation for the A/B toggle
  document.getElementById('toggleA').addEventListener('keydown', (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      switchToggle('A');
    }
  });
  document.getElementById('toggleB').addEventListener('keydown', (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      switchToggle('B');
    }
  });
  
  // Initialize progression A with current state
  saveCurrentProgression();
});

// --------- SOUND PLAYERS ----------

async function playBrush() {
  if (!isBrushEnabled()) return;
  await ensureAudio();
  const duration = 0.09;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2000;
  filter.Q.value = 1.8;
  const gain = ctx.createGain();
  gain.gain.value = 0.5;
  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  noise.connect(filter).connect(gain).connect(masterGain);
  noise.start();
  noise.stop(ctx.currentTime + duration);
}

function isBrushEnabled() {
  const brushToggle = document.getElementById('brushToggle');
  return brushToggle && brushToggle.checked;
}

async function playBassDrum() {
  await ensureAudio();
  const duration = 0.19;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(140, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + duration * 0.85);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain).connect(masterGain);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

// Play notes using the currently selected instrument
async function playTriangleNotes(notes) {
  await ensureAudio();
  const duration = 0.29;
  const hold = 0.07;
  const TRIANGLE_GAIN = 0.38;
  const VOICE_GAIN = 0.36;
  const SQUARE_GAIN = 0.30;
  const SAW_GAIN = 0.28;
  const SINE_GAIN = 0.36;

  notes.forEach((note, i) => {
    const freq = midiToFreq(note);
    let osc, gain, lfo, lfoGain, filter;
    gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);

    if (currentWaveform === "voice") {
      osc = ctx.createOscillator();
      osc.setPeriodicWave(customVoiceWave);
      osc.frequency.value = freq;
      lfo = ctx.createOscillator();
      lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(1.5, ctx.currentTime);
      lfo.frequency.linearRampToValueAtTime(5, ctx.currentTime + 1);
      lfoGain.gain.setValueAtTime(2.0, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.value = 1;
      osc.connect(filter);
      filter.connect(gain);
      const attackTime = 0.08;
      const decayTime = 0.18;
      const sustainLevel = VOICE_GAIN * 0.6;
      const maxLevel = VOICE_GAIN * 1.0;
      gain.gain.linearRampToValueAtTime(maxLevel, ctx.currentTime + attackTime);
      gain.gain.linearRampToValueAtTime(sustainLevel, ctx.currentTime + attackTime + decayTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + duration);
      gain.connect(masterGain);
      osc.start(ctx.currentTime + 0.01 * i);
      osc.stop(ctx.currentTime + duration + 0.01 * i + 0.08);
      lfo.stop(ctx.currentTime + duration + 0.01 * i + 0.08);
    } else {
      osc = ctx.createOscillator();
      // CHANGED: Use AudioContext's 'sawtooth' for 'saw'
      osc.type = currentWaveform === "saw" ? "sawtooth" : currentWaveform;
      osc.frequency.value = freq;
      filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.value = 1;
      osc.connect(filter);
      filter.connect(gain);

      let targetGain =
        currentWaveform === "triangle" ? TRIANGLE_GAIN
        : currentWaveform === "square" ? SQUARE_GAIN
        : currentWaveform === "saw" ? SAW_GAIN
        : SINE_GAIN;

      const attackTime = 0.015;
      gain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + attackTime);
      gain.gain.setValueAtTime(targetGain, ctx.currentTime + attackTime + hold);
      gain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + duration);

      gain.connect(masterGain);
      osc.start(ctx.currentTime + 0.01 * i);
      osc.stop(ctx.currentTime + duration + 0.01 * i);
    }
  });
}

function midiToFreq(n) {
  const notes = {'C':0,'C#':1,'D':2,'D#':3,'E':4,'F':5,'F#':6,'G':7,'G#':8,'A':9,'A#':10,'B':11};
  let note = n.slice(0, n.length-1), octave = parseInt(n[n.length-1]);
  if (n.length > 2 && n[1] === '#') { note = n.slice(0,2); octave = parseInt(n.slice(2)); }
  return 440 * Math.pow(2, (notes[note]+(octave-4)*12-9)/12);
}

// --- App logic and UI variables ---
const chordTones = {
  'C':   ['C', 'E', 'G'],
  'Dm':  ['D', 'F', 'A'],
  'Em':  ['E', 'G', 'A'],
  'F':   ['F', 'A', 'C'],
  'G':   ['G', 'B', 'D'],
  'Am':  ['A', 'C', 'E'],
  'D':   ['D', 'F♯', 'A'], // Using unicode sharp symbol
  'E':   ['E', 'G♯', 'B'], // Using unicode sharp symbol
  'Bb':  ['B♭', 'D', 'F']  // Using unicode flat symbol
};
const noteColorClass = {
  'C': 'note-C',
  'D': 'note-D',
  'E': 'note-E',
  'F': 'note-F',
  'G': 'note-G',
  'A': 'note-A',
  'B': 'note-B',
    'F♯': 'note-F', // Using the F base color
  'G♯': 'note-G', // Using the G base color
  'B♭': 'note-B'  // Using the B color
};
const restDashImgUrl = "https://raw.githubusercontent.com/VisualMusicalMinds/Musical-Images/1100d582ac41ba2d0b1794da6dd96026a3869249/Cartoon%20RhythmBox5.svg";
const dashImgUrl = "https://raw.githubusercontent.com/VisualMusicalMinds/Musical-Images/48e79626ae5b3638784c98a6f73ec0e342cf9894/Cartoon%20RhythmBox1.svg";
const rhythmBox2 = "https://raw.githubusercontent.com/VisualMusicalMinds/Musical-Images/48e79626ae5b3638784c98a6f73ec0e342cf9894/Cartoon%20RhythmBox2.svg";
const rhythmBox3 = "https://raw.githubusercontent.com/VisualMusicalMinds/Musical-Images/48e79626ae5b3638784c98a6f73ec0e342cf9894/Cartoon%20RhythmBox3.svg";
const rhythmBox4 = "https://raw.githubusercontent.com/VisualMusicalMinds/Musical-Images/48e79626ae5b3638784c98a6f73ec0e342cf9894/Cartoon%20RhythmBox4.svg";

// Added bass note for each chord as requested, and updated Am to remove C4
const rhythmChordNotes = {
  'C':  ['C3', 'C4', 'E4', 'G4', 'C5'],
  'Dm': ['D3', 'D4', 'F4', 'A4'],
  'Em': ['E3', 'E4', 'G4', 'B4'],
  'F':  ['F3', 'C4', 'F4', 'A4', 'C5'],
  'G':  ['G3', 'D4', 'G4', 'B4'],
  'Am': ['A3', 'E4', 'A4', 'C5'],
    'D':  ['D3', 'D4', 'F#4', 'A4'],
  'E':  ['E3', 'E4', 'G#4', 'B4'],
  'Bb': ['Bb3', 'D4', 'F4', 'Bb4']
};

function setSlotColorAndStyle(slotIndex, select) {
  setSlotContent(slotIndex, select.value);
  select.classList.remove(
    'c-selected-c', 'c-selected-dm', 'c-selected-em', 'c-selected-f', 'c-selected-g', 'c-selected-am'
  );
  switch(select.value) {
    case 'C':  select.classList.add('c-selected-c'); break;
    case 'Dm': select.classList.add('c-selected-dm'); break;
    case 'Em': select.classList.add('c-selected-em'); break;
    case 'F':  select.classList.add('c-selected-f'); break;
    case 'G':  select.classList.add('c-selected-g'); break;
    case 'Am': select.classList.add('c-selected-am'); break;
    default: break;
  }
}
function setSlotContent(slotIndex, chord) {
  const slot = document.getElementById('slot' + slotIndex);
  const noteRects = slot.querySelector('.note-rects');
  let img = slot.querySelector('.dash-img-slot');
  noteRects.innerHTML = '';
  if (chord === "") {
    if (!img) {
      img = document.createElement('img');
      img.className = 'dash-img-slot';
      img.src = restDashImgUrl;
      img.alt = "Rhythm Box Rest";
      slot.insertBefore(img, slot.querySelector('.chord-select'));
    } else {
      img.src = restDashImgUrl;
      img.alt = "Rhythm Box Rest";
      img.style.display = "block";
    }
  } else {
    if (img) img.style.display = "none";
  }
  slot.className = 'slot-box';
  if (!chord || chord === "empty" || chord === "") {
    return;
  }
  const tones = chordTones[chord];
  noteRects.innerHTML = tones.map(note =>
    `<div class="note-rect ${noteColorClass[note]}">${note}</div>`
  ).join('');
}
function updateRhythmPictures() {
  for (let pair = 0; pair < 4; ++pair) {
    const box1 = document.querySelector(`.bottom-rhythm-box[data-pair="${pair}"][data-which="0"]`);
    const box2 = document.querySelector(`.bottom-rhythm-box[data-pair="${pair}"][data-which="1"]`);
    const picDiv = document.getElementById('bottomPic'+pair);
    const img = picDiv.querySelector('.bottom-picture-img');
    let url = dashImgUrl;
    if (box1.classList.contains('active') && !box2.classList.contains('active')) {
      url = rhythmBox2;
    } else if (box1.classList.contains('active') && box2.classList.contains('active')) {
      url = rhythmBox3;
    } else if (!box1.classList.contains('active') && box2.classList.contains('active')) {
      url = rhythmBox4;
    }
    img.src = url;
  }
}

// --- Playback logic

let isPlaying = false;
let rhythmInterval = null;
let slotIds = ['slot0', 'slot1', 'slot2', 'slot3'];
let slotHighlightStep = 0;
let pictureHighlightStep = 0;
let rhythmStep = 0;

function getBpmInputValue() {
  const bpmInput = document.getElementById('bpmInput');
  let val = parseInt(bpmInput.value, 10);
  if (isNaN(val)) val = 90;
  return val;
}
function setBpmInputValue(val) {
  const bpmInput = document.getElementById('bpmInput');
  bpmInput.value = val;
}
function clampBpm(val) {
  return Math.max(30, Math.min(300, val));
}

function setPlaying(playing) {
  isPlaying = playing;
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const playPauseBtn = document.getElementById('playPauseBtn');
  if (isPlaying) {
    playIcon.style.display = "none";
    pauseIcon.style.display = "block";
    playPauseBtn.title = "Pause";
    playPauseBtn.setAttribute('aria-label', 'Pause');
    startMainAnimation();
  } else {
    playIcon.style.display = "block";
    pauseIcon.style.display = "none";
    playPauseBtn.title = "Play";
    playPauseBtn.setAttribute('aria-label', 'Play');
    stopMainAnimation();
  }
}

function startMainAnimation() {
  stopMainAnimation();
  if (typeof startMainAnimation.preservedSteps === "object" && startMainAnimation.preservedSteps.keep) {
    slotHighlightStep = startMainAnimation.preservedSteps.slotHighlightStep;
    pictureHighlightStep = startMainAnimation.preservedSteps.pictureHighlightStep;
    rhythmStep = startMainAnimation.preservedSteps.rhythmStep;
    startMainAnimation.preservedSteps.keep = false;
  } else {
    slotHighlightStep = 0;
    pictureHighlightStep = 0;
    rhythmStep = 0;
  }
  updateSlotHighlights();
  updatePictureHighlights();
  const bpm = getBpmInputValue();
  const intervalMs = (60 / bpm) * 1000 / 2;
  playEighthNoteStep();
  rhythmInterval = setInterval(playEighthNoteStep, intervalMs);
}

function stopMainAnimation() {
  if (rhythmInterval) clearInterval(rhythmInterval);
  for (let i = 0; i < slotIds.length; i++) unhighlightSlot(i);
  for (let i = 0; i < 4; i++) unhighlightPicture(i);
}

function restartAnimationWithBpm() {
  if (isPlaying) {
    if (!startMainAnimation.preservedSteps) startMainAnimation.preservedSteps = {};
    startMainAnimation.preservedSteps.keep = true;
    startMainAnimation.preservedSteps.slotHighlightStep = slotHighlightStep;
    startMainAnimation.preservedSteps.pictureHighlightStep = pictureHighlightStep;
    startMainAnimation.preservedSteps.rhythmStep = rhythmStep;
    startMainAnimation();
  }
}

function playEighthNoteStep() {
  const currentSlotIdx = slotHighlightStep % 4;
  const currentSelect = document.getElementById(`slot${currentSlotIdx}`).querySelector('.chord-select');

  const whichBox = rhythmStep % 8;
  const pair = Math.floor(whichBox / 2);
  const which = whichBox % 2;
  const box = document.querySelector(`.bottom-rhythm-box[data-pair="${pair}"][data-which="${which}"]`);
  if (box && box.classList.contains('active')) {
    if (currentSelect.value === "") {
      playBassDrum();
    } else if (currentSelect.value === "empty") {
      // Play nothing
    } else if (rhythmChordNotes[currentSelect.value]) {
      playTriangleNotes(rhythmChordNotes[currentSelect.value]);
    }
  }

  if (rhythmStep % 2 === 0) {
    playBrush();
    updatePictureHighlights();
    pictureHighlightStep = (pictureHighlightStep + 1) % 4;
  }

  if (rhythmStep === 0) {
    updateSlotHighlights();
  }

  rhythmStep = (rhythmStep + 1) % 8;
  if (rhythmStep === 0) {
    slotHighlightStep = (slotHighlightStep + 1) % 4;
  }
}

function updateSlotHighlights() {
  for (let i = 0; i < slotIds.length; i++) unhighlightSlot(i);
  if (isPlaying) {
    highlightSlot(slotHighlightStep % 4);
  }
}
function highlightSlot(idx) {
  document.getElementById(slotIds[idx]).classList.add('enlarged');
}
function unhighlightSlot(idx) {
  document.getElementById(slotIds[idx]).classList.remove('enlarged');
}

function updatePictureHighlights() {
  for (let i = 0; i < 4; i++) unhighlightPicture(i);
  if (isPlaying) {
    highlightPicture(pictureHighlightStep % 4);
  }
}
function highlightPicture(idx) {
  document.getElementById('bottomPic'+idx).classList.add('picture-highlighted');
}
function unhighlightPicture(idx) {
  document.getElementById('bottomPic'+idx).classList.remove('picture-highlighted');
}

function clearAll() {
  // Clear the chord selections
  for (let i = 0; i < 4; i++) {
    const slot = document.getElementById('slot'+i);
    slot.querySelector('.note-rects').innerHTML = '';
    const select = slot.querySelector('.chord-select');
    select.selectedIndex = 0;
    setSlotColorAndStyle(i, select);
    slot.classList.remove('enlarged');
    let img = slot.querySelector('.dash-img-slot');
    if (img) {
      img.src = restDashImgUrl;
      img.alt = "Rhythm Box Rest";
      img.style.display = "block";
    }
  }
  
  // Clear the rhythm boxes
  document.querySelectorAll('.bottom-rhythm-box').forEach(box => box.classList.remove('active'));
  updateRhythmPictures();
  
  // Update the current progression in memory (A or B)
  saveCurrentProgression();
  
  setPlaying(false);
}

document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll('.chord-select').forEach((select, idx) => {
    select.addEventListener('change', function() {
      setSlotColorAndStyle(idx, select);
      // Save current state whenever a chord is changed
      saveCurrentProgression();
    });
    setSlotColorAndStyle(idx, select);
  });

  document.querySelectorAll('.bottom-rhythm-box').forEach(box => {
    box.addEventListener('click', function(e) {
      box.classList.toggle('active');
      updateRhythmPictures();
      // Save current state whenever rhythm boxes are toggled
      saveCurrentProgression();
    });
    box.addEventListener('touchstart', function(e) {
      e.preventDefault();
      box.classList.toggle('active');
      updateRhythmPictures();
      // Save current state on touch
      saveCurrentProgression();
    }, {passive: false});
    box.setAttribute('tabindex', '0');
    box.addEventListener('keydown', function(e) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        box.classList.toggle('active');
        updateRhythmPictures();
        // Save current state on keyboard interaction
        saveCurrentProgression();
      }
    });
  });

  const playPauseBtn = document.getElementById('playPauseBtn');
  playPauseBtn.addEventListener('click', function() {
    setPlaying(!isPlaying);
  });
  playPauseBtn.addEventListener('touchstart', function(e) {
    e.preventDefault();
    setPlaying(!isPlaying);
  }, {passive: false});
  playPauseBtn.addEventListener('keydown', function(e) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setPlaying(!isPlaying);
    }
  });

  const bpmInput = document.getElementById('bpmInput');
  const bpmUp = document.getElementById('bpmUp');
  const bpmDown = document.getElementById('bpmDown');

  bpmInput.addEventListener('blur', function() {
    let v = parseInt(bpmInput.value, 10);
    if (isNaN(v)) v = 90;
    v = clampBpm(v);
    setBpmInputValue(v);
    restartAnimationWithBpm();
  });
  bpmInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      let v = parseInt(bpmInput.value, 10);
      if (isNaN(v)) v = 90;
      v = clampBpm(v);
      setBpmInputValue(v);
      restartAnimationWithBpm();
      bpmInput.blur();
    } else if (e.key === 'ArrowUp') {
      let v = parseInt(bpmInput.value, 10);
      if (isNaN(v)) v = 90;
      v = clampBpm(v + 1);
      setBpmInputValue(v);
      restartAnimationWithBpm();
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      let v = parseInt(bpmInput.value, 10);
      if (isNaN(v)) v = 90;
      v = clampBpm(v - 1);
      setBpmInputValue(v);
      restartAnimationWithBpm();
      e.preventDefault();
    }
  });

  const brushToggle = document.getElementById('brushToggle');
  if (brushToggle) {
    brushToggle.addEventListener('change', function() {
      // Nothing needs to be done immediately - playBrush will check this value
      // when it's called
    });
  }

  let bpmHoldInterval = null, bpmHoldTimeout = null;
  function stepBpm(dir) {
    let v = parseInt(bpmInput.value, 10);
    if (isNaN(v)) v = 90;
    v = clampBpm(v + dir);
    setBpmInputValue(v);
    restartAnimationWithBpm();
  }
  function startHold(dir) {
    stepBpm(dir);
    bpmHoldTimeout = setTimeout(() => {
      bpmHoldInterval = setInterval(() => stepBpm(dir), 60);
    }, 500);
  }
  function stopHold() {
    clearTimeout(bpmHoldTimeout);
    clearInterval(bpmHoldInterval);
    bpmHoldTimeout = null;
    bpmHoldInterval = null;
  }
  bpmUp.addEventListener('mousedown', e => { startHold(+1); });
  bpmUp.addEventListener('touchstart', e => { e.preventDefault(); startHold(+1); }, {passive: false});
  bpmUp.addEventListener('mouseup', stopHold);
  bpmUp.addEventListener('mouseleave', stopHold);
  bpmUp.addEventListener('touchend', stopHold);
  bpmUp.addEventListener('touchcancel', stopHold);
  bpmDown.addEventListener('mousedown', e => { startHold(-1); });
  bpmDown.addEventListener('touchstart', e => { e.preventDefault(); startHold(-1); }, {passive: false});
  bpmDown.addEventListener('mouseup', stopHold);
  bpmDown.addEventListener('mouseleave', stopHold);
  bpmDown.addEventListener('touchend', stopHold);
  bpmDown.addEventListener('touchcancel', stopHold);
  bpmUp.addEventListener('click', function() { stepBpm(+1); });
  bpmDown.addEventListener('click', function() { stepBpm(-1); });

  document.getElementById('clear').addEventListener('click', clearAll);
  document.getElementById('clear').addEventListener('touchstart', function(e) {
    e.preventDefault();
    clearAll();
  }, {passive: false});

  updateRhythmPictures();

  for (let i = 0; i < slotIds.length; i++) {
    unhighlightSlot(i);
  }
  for (let i = 0; i < 4; i++) {
    unhighlightPicture(i);
  }

  isPlaying = false;
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  playIcon.style.display = "block";
  pauseIcon.style.display = "none";
});

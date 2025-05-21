// --- Sound Synthesis Variables ---
let ctx = null, masterGain = null, compressor = null;
let customVoiceWave = null;
const waveforms = ['sine', 'triangle', 'square', 'saw', 'voice'];
let currentWaveformIndex = 1;
let currentWaveform = waveforms[currentWaveformIndex];

// A/B/C/D toggle variables
let currentToggle = 'A'; // Default to A
let progressionA = ['', '', '', ''];
let progressionB = ['', '', '', ''];
let progressionC = ['', '', '', '']; // New C progression
let progressionD = ['', '', '', '']; // New D progression
let rhythmBoxesA = Array(8).fill(false);
let rhythmBoxesB = Array(8).fill(false);
let rhythmBoxesC = Array(8).fill(false); // New C rhythm boxes
let rhythmBoxesD = Array(8).fill(false); // New D rhythm boxes
// 7th chord toggles per slot for A, B, C, and D
let seventhA = [false, false, false, false];
let seventhB = [false, false, false, false];
let seventhC = [false, false, false, false]; // New C sevenths
let seventhD = [false, false, false, false]; // New D sevenths
// 2nd chord toggles per slot for A, B, C, and D
let secondA = [false, false, false, false];
let secondB = [false, false, false, false];
let secondC = [false, false, false, false]; // New C seconds
let secondD = [false, false, false, false]; // New D seconds

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

// --- A/B/C/D Toggle Functions ---
function saveCurrentProgression() {
  // Save the current chord selections, rhythm boxes state, 7th toggles, and 2nd toggles to the current toggle
  const chordValues = Array.from(document.querySelectorAll('.chord-select')).map(select => select.value);
  const rhythmBoxStates = Array.from(document.querySelectorAll('.bottom-rhythm-box')).map(box => box.classList.contains('active'));
  const seventhStates = Array.from(document.querySelectorAll('.seventh-btn')).map(btn => btn.classList.contains('active'));
  const secondStates = Array.from(document.querySelectorAll('.second-btn')).map(btn => btn.classList.contains('active'));
  
  if (currentToggle === 'A') {
    progressionA = [...chordValues];
    rhythmBoxesA = [...rhythmBoxStates];
    seventhA = [...seventhStates];
    secondA = [...secondStates];
  } else if (currentToggle === 'B') {
    progressionB = [...chordValues];
    rhythmBoxesB = [...rhythmBoxStates];
    seventhB = [...seventhStates];
    secondB = [...secondStates];
  } else if (currentToggle === 'C') {
    progressionC = [...chordValues];
    rhythmBoxesC = [...rhythmBoxStates];
    seventhC = [...seventhStates];
    secondC = [...secondStates];
  } else if (currentToggle === 'D') {
    progressionD = [...chordValues];
    rhythmBoxesD = [...rhythmBoxStates];
    seventhD = [...seventhStates];
    secondD = [...secondStates];
  }
}

function loadProgression(toggle) {
  // Load the chord selections, rhythm box states, 7th toggles, and 2nd toggles from the specified toggle
  let progression, rhythmBoxStates, seventhStates, secondStates;
  
  // Determine which set of variables to use based on toggle
  switch(toggle) {
    case 'A':
      progression = progressionA;
      rhythmBoxStates = rhythmBoxesA;
      seventhStates = seventhA;
      secondStates = secondA;
      break;
    case 'B':
      progression = progressionB;
      rhythmBoxStates = rhythmBoxesB;
      seventhStates = seventhB;
      secondStates = secondB;
      break;
    case 'C':
      progression = progressionC;
      rhythmBoxStates = rhythmBoxesC;
      seventhStates = seventhC;
      secondStates = secondC;
      break;
    case 'D':
      progression = progressionD;
      rhythmBoxStates = rhythmBoxesD;
      seventhStates = seventhD;
      secondStates = secondD;
      break;
    default:
      progression = progressionA;
      rhythmBoxStates = rhythmBoxesA;
      seventhStates = seventhA;
      secondStates = secondA;
  }

  // Set chord selections
  document.querySelectorAll('.chord-select').forEach((select, idx) => {
    select.value = progression[idx];
    setSlotColorAndStyle(idx, select, seventhStates[idx], secondStates[idx]);
  });

  // Set rhythm box states
  document.querySelectorAll('.bottom-rhythm-box').forEach((box, idx) => {
    if (rhythmBoxStates[idx]) {
      box.classList.add('active');
    } else {
      box.classList.remove('active');
    }
  });

  // Set 7th button states
  document.querySelectorAll('.seventh-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', seventhStates[idx]);
  });

  // Set 2nd button states
  document.querySelectorAll('.second-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', secondStates[idx]);
  });

  updateRhythmPictures();
}

function switchToggle(toggle) {
  if (currentToggle === toggle) return; // No change needed

  // Save current state to current toggle
  saveCurrentProgression();

  // Update toggle state
  currentToggle = toggle;

  // Update toggle buttons UI
  document.querySelectorAll('.abcd-toggle-btn').forEach(btn => {
    btn.classList.remove('abcd-active');
  });
  document.getElementById('toggle' + toggle).classList.add('abcd-active');

  // Load the state from the newly selected toggle
  loadProgression(toggle);
}

// Helper function to get the current toggle arrays
function getToggleArrays() {
  let seventhArr, secondArr;
  switch(currentToggle) {
    case 'A':
      seventhArr = seventhA;
      secondArr = secondA;
      break;
    case 'B':
      seventhArr = seventhB;
      secondArr = secondB;
      break;
    case 'C':
      seventhArr = seventhC;
      secondArr = secondC;
      break;
    case 'D':
      seventhArr = seventhD;
      secondArr = secondD;
      break;
    default:
      seventhArr = seventhA;
      secondArr = secondA;
  }
  return { seventhArr, secondArr };
}

// --- Chord Note Data Structures ---

const chordTones = {
  'C':   ['C', 'E', 'G'],
  'Dm':  ['D', 'F', 'A'],
  'Em':  ['E', 'G', 'B'],
  'F':   ['F', 'A', 'C'],
  'G':   ['G', 'B', 'D'],
  'Am':  ['A', 'C', 'E'],
  'D':   ['D', 'F♯', 'A'],
  'E':   ['E', 'G♯', 'B'],
  'Bb':  ['B♭', 'D', 'F']
};
// The additional note for a minor 7th (or dominant 7th for major chords)
const chordSevenths = {
  'C':   'B♭',
  'Dm':  'C',
  'Em':  'D',
  'F':   'E♭',
  'G':   'F',
  'Am':  'G',
  'D':   'C',
  'E':   'D',
  'Bb':  'A♭'
};
// The additional note for a 2nd (sus2 or normal 2nd, you can adjust as desired)
const chordSeconds = {
  'C':   'D',
  'Dm':  'E',
  'Em':  'F♯',
  'F':   'G',
  'G':   'A',
  'Am':  'B',
  'D':   'E',
  'E':   'F♯',
  'Bb':  'C'
};
// Used for playback, must use pitch names with octave!
const rhythmChordNotes = {
  'C':  ['C3', 'C4', 'E4', 'G4', 'C5'],
  'Dm': ['D3', 'D4', 'F4', 'A4'],
  'Em': ['E3', 'E4', 'G4', 'B4'],
  'F':  ['F3', 'F4', 'A4', 'C5'],
  'G':  ['G3', 'G4', 'B4', 'D4'],
  'Am': ['A3', 'E4', 'A4', 'C5'],
  'D':  ['D3', 'D4', 'F#4', 'A4'],
  'E':  ['E3', 'E4', 'G#4', 'B4'],
  'Bb': ['Bb3', 'D4', 'F4', 'Bb4']
};
const rhythmChordSeventhNotes = {
  'C':  'Bb4',
  'Dm': 'C5',
  'Em': 'D5',
  'F':  'Eb5',
  'G':  'F4',
  'Am': 'G4',
  'D':  'C5',
  'E':  'D5',
  'Bb': 'Ab4'
};
const rhythmChordSecondNotes = {
  'C':  'D4',
  'Dm': 'E4',
  'Em': 'F#4',
  'F':  'G4',
  'G':  'A4',
  'Am': 'B4',
  'D':  'E4',
  'E':  'F#4',
  'Bb': 'C5'
};

const noteColorClass = {
  'C': 'note-C',
  'D': 'note-D',
  'E': 'note-E',
  'F': 'note-F',
  'G': 'note-G',
  'A': 'note-A',
  'B': 'note-B',
  'F♯': 'note-F',
  'G♯': 'note-G',
  'B♭': 'note-B',
  'E♭': 'note-E',
  'A♭': 'note-A'
};

const restDashImgUrl = "https://visualmusicalminds.github.io/images/CartoonRhythmBox5.svg";
const dashImgUrl = "https://visualmusicalminds.github.io/images/CartoonRhythmBox1.svg";
const rhythmBox2 = "https://visualmusicalminds.github.io/images/CartoonRhythmBox2.svg";
const rhythmBox3 = "https://visualmusicalminds.github.io/images/CartoonRhythmBox3.svg";
const rhythmBox4 = "https://visualmusicalminds.github.io/images/CartoonRhythmBox4.svg";

// --- UI Slot Content and Color ---
function setSlotColorAndStyle(slotIndex, select, addSeventhArg, addSecondArg) {
  // Determine whether to add the 7th/2nd based on currentToggle and state arrays
  let addSeventh, addSecond;
  if (typeof addSeventhArg === 'boolean') {
    addSeventh = addSeventhArg;
  } else {
    const { seventhArr } = getToggleArrays();
    addSeventh = seventhArr[slotIndex];
  }
  if (typeof addSecondArg === 'boolean') {
    addSecond = addSecondArg;
  } else {
    const { secondArr } = getToggleArrays();
    addSecond = secondArr[slotIndex];
  }
  setSlotContent(slotIndex, select.value, addSeventh, addSecond);
  select.classList.remove(
    'c-selected-c', 'c-selected-dm', 'c-selected-em', 
    'c-selected-f', 'c-selected-g', 'c-selected-am',
    'c-selected-d', 'c-selected-e', 'c-selected-bb'
  );
  switch(select.value) {
    case 'C':  select.classList.add('c-selected-c'); break;
    case 'Dm': select.classList.add('c-selected-dm'); break;
    case 'Em': select.classList.add('c-selected-em'); break;
    case 'F':  select.classList.add('c-selected-f'); break;
    case 'G':  select.classList.add('c-selected-g'); break;
    case 'Am': select.classList.add('c-selected-am'); break;
    case 'D':  select.classList.add('c-selected-d'); break;
    case 'E':  select.classList.add('c-selected-e'); break;
    case 'Bb': select.classList.add('c-selected-bb'); break;
    default: break;
  }
}

function setSlotContent(slotIndex, chord, addSeventh, addSecond) {
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
    return;
  } else {
    if (img) img.style.display = "none";
  }
  slot.className = 'slot-box';
  if (!chord || chord === "empty" || chord === "") {
    return;
  }
  const tones = chordTones[chord];
  if (!tones) return;

  // Prepare the basic rects from tones
  let rects = tones.map(note => {
    if (note.includes('♯')) {
      const baseLetter = note.charAt(0);
      return `<div class="note-rect ${noteColorClass[note]}">
        ${baseLetter}<span class="accidental sharp">♯</span>
      </div>`;
    } else if (note.includes('♭')) {
      const baseLetter = note.charAt(0);
      return `<div class="note-rect ${noteColorClass[note]}">
        ${baseLetter}<span class="accidental flat">♭</span>
      </div>`;
    } else {
      return `<div class="note-rect ${noteColorClass[note]}">${note}</div>`;
    }
  });

  // Add the second if enabled and the chord has a defined 2nd
  if (addSecond && chordSeconds[chord]) {
    let note = chordSeconds[chord];
    let baseLetter = note.charAt(0);
    let colorClass = noteColorClass[note] || noteColorClass[baseLetter];
    let display;
    if (note.includes('♯')) {
      display = `<div class="note-rect note-2nd ${colorClass}">
        ${baseLetter}<span class="accidental sharp">♯</span>
      </div>`;
    } else if (note.includes('♭')) {
      display = `<div class="note-rect note-2nd ${colorClass}">
        ${baseLetter}<span class="accidental flat">♭</span>
      </div>`;
    } else {
      display = `<div class="note-rect note-2nd ${colorClass}">${note}</div>`;
    }
    // Insert the "2" note at the second position (index 1)
    rects.splice(1, 0, display);
  }

  // Add the seventh if enabled and the chord has a defined 7th
  if (addSeventh && chordSevenths[chord]) {
    let note = chordSevenths[chord];
    let baseLetter = note.charAt(0);
    let colorClass = noteColorClass[note] || noteColorClass[baseLetter];
    let display;
    if (note.includes('♯')) {
      display = `<div class="note-rect note-7th ${colorClass}">
        ${baseLetter}<span class="accidental sharp">♯</span>
      </div>`;
    } else if (note.includes('♭')) {
      display = `<div class="note-rect note-7th ${colorClass}">
        ${baseLetter}<span class="accidental flat">♭</span>
      </div>`;
    } else {
      display = `<div class="note-rect note-7th ${colorClass}">${note}</div>`;
    }
    rects.push(display);
  }
  noteRects.innerHTML = rects.join('');
}

// --- 7th Button Logic ---
function toggleSeventh(idx) {
  const { seventhArr, secondArr } = getToggleArrays();
  seventhArr[idx] = !seventhArr[idx];
  updateSeventhBtnStates();
  // Re-render the slot content
  const select = document.getElementById('slot'+idx).querySelector('.chord-select');
  setSlotColorAndStyle(idx, select, seventhArr[idx], secondArr[idx]);
  saveCurrentProgression();
}
function updateSeventhBtnStates() {
  const { seventhArr } = getToggleArrays();
  document.querySelectorAll('.seventh-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', seventhArr[idx]);
  });
}

// --- 2nd Button Logic ---
function toggleSecond(idx) {
  const { seventhArr, secondArr } = getToggleArrays();
  secondArr[idx] = !secondArr[idx];
  updateSecondBtnStates();
  // Re-render the slot content
  const select = document.getElementById('slot'+idx).querySelector('.chord-select');
  setSlotColorAndStyle(idx, select, seventhArr[idx], secondArr[idx]);
  saveCurrentProgression();
}
function updateSecondBtnStates() {
  const { secondArr } = getToggleArrays();
  document.querySelectorAll('.second-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', secondArr[idx]);
  });
}

// --- Rhythm Pictures ---
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

// --- Playback logic ---

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
    } else {
      // Handle 7th and 2nd
      const { seventhArr, secondArr } = getToggleArrays();
      let addSeventh = seventhArr[currentSlotIdx];
      let addSecond = secondArr[currentSlotIdx];
      let notes = rhythmChordNotes[currentSelect.value] ? [...rhythmChordNotes[currentSelect.value]] : [];
      if (addSecond && rhythmChordSecondNotes[currentSelect.value]) {
        notes.push(rhythmChordSecondNotes[currentSelect.value]);
      }
      if (addSeventh && rhythmChordSeventhNotes[currentSelect.value]) {
        notes.push(rhythmChordSeventhNotes[currentSelect.value]);
      }
      playTriangleNotes(notes);
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
    setSlotColorAndStyle(i, select, false, false);
    slot.classList.remove('enlarged');
    let img = slot.querySelector('.dash-img-slot');
    if (img) {
      img.src = restDashImgUrl;
      img.alt = "Rhythm Box Rest";
      img.style.display = "block";
    }
    // Clear 7th button
    const btn7 = slot.querySelector('.seventh-btn');
    if (btn7) btn7.classList.remove('active');
    // Clear 2nd button
    const btn2 = slot.querySelector('.second-btn');
    if (btn2) btn2.classList.remove('active');
  }

  // Clear the rhythm boxes
  document.querySelectorAll('.bottom-rhythm-box').forEach(box => box.classList.remove('active'));
  updateRhythmPictures();

  // Clear 7th/2nd arrays based on current toggle
  const { seventhArr, secondArr } = getToggleArrays();
  for (let i = 0; i < 4; i++) {
    seventhArr[i] = false;
    secondArr[i] = false;
  }
  updateSeventhBtnStates();
  updateSecondBtnStates();

  // Update the current progression in memory
  saveCurrentProgression();

  setPlaying(false);
}

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
  // Accepts note strings like C4, F#4, Bb4, etc.
  const notes = {'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,'E':4,'F':5,'F#':6,'Gb':6,'G':7,'G#':8,'Ab':8,'A':9,'A#':10,'Bb':10,'B':11,
    'F♯':6, 'G♯':8, 'B♭':10, 'E♭':3, 'A♭':8 };
   let note, octave;
  if (n.includes('♭')) {
    note = n.slice(0, 2);
    octave = parseInt(n.slice(2));
  } else if (n.includes('♯')) {
    note = n.slice(0, 2);
    octave = parseInt(n.slice(2));
  } else if (n.length > 2 && (n[1] === '#' || n[1] === 'b')) {
    note = n.slice(0, 2);
    octave = parseInt(n.slice(2));
  } else {
    note = n.slice(0, n.length-1);
    octave = parseInt(n[n.length-1]);
  }
  return 440 * Math.pow(2, (notes[note]+(octave-4)*12-9)/12);
}

// --- Play chord preview on chord select ---
function playChordPreview(idx) {
  if (isPlaying) return; // Only preview if NOT playing!
  const select = document.getElementById('slot' + idx).querySelector('.chord-select');
  const chord = select.value;
  if (!chord || chord === "" || chord === "empty") return;
  // Check if 2nd or 7th is selected for this chord
  const { seventhArr, secondArr } = getToggleArrays();
  let addSeventh = seventhArr[idx];
  let addSecond = secondArr[idx];
  let notes = rhythmChordNotes[chord] ? [...rhythmChordNotes[chord]] : [];
  if (addSecond && rhythmChordSecondNotes[chord]) {
    notes.push(rhythmChordSecondNotes[chord]);
  }
  if (addSeventh && rhythmChordSeventhNotes[chord]) {
    notes.push(rhythmChordSeventhNotes[chord]);
  }
  playTriangleNotes(notes);
}

// --- DOMContentLoaded & Event Listeners ---
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

  // Initialize A/B/C/D toggle button listeners
  document.getElementById('toggleA').addEventListener('click', () => switchToggle('A'));
  document.getElementById('toggleB').addEventListener('click', () => switchToggle('B'));
  document.getElementById('toggleC').addEventListener('click', () => switchToggle('C'));
  document.getElementById('toggleD').addEventListener('click', () => switchToggle('D'));
  
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
  document.getElementById('toggleC').addEventListener('keydown', (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      switchToggle('C');
    }
  });
  document.getElementById('toggleD').addEventListener('keydown', (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      switchToggle('D');
    }
  });

  // Chord select
  document.querySelectorAll('.chord-select').forEach((select, idx) => {
    select.addEventListener('change', function() {
      setSlotColorAndStyle(idx, select);
      saveCurrentProgression();
      playChordPreview(idx); // Play the sound when a chord is selected (but only if not playing)
    });
    setSlotColorAndStyle(idx, select);
  });

  // 7th buttons
  document.querySelectorAll('.seventh-btn').forEach((btn, idx) => {
    btn.addEventListener('click', function() {
      toggleSeventh(idx);
      playChordPreview(idx); // Play on toggle if not playing
    });
    btn.addEventListener('keydown', function(e) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggleSeventh(idx);
        playChordPreview(idx); // Play on toggle with keyboard if not playing
      }
    });
  });

  // 2nd buttons
  document.querySelectorAll('.second-btn').forEach((btn, idx) => {
    btn.addEventListener('click', function() {
      toggleSecond(idx);
      playChordPreview(idx); // Play on toggle if not playing
    });
    btn.addEventListener('keydown', function(e) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggleSecond(idx);
        playChordPreview(idx); // Play on toggle with keyboard if not playing
      }
    });
  });

  // Rhythm boxes
  document.querySelectorAll('.bottom-rhythm-box').forEach(box => {
    box.addEventListener('click', function(e) {
      box.classList.toggle('active');
      updateRhythmPictures();
      saveCurrentProgression();
    });
    box.addEventListener('touchstart', function(e) {
      e.preventDefault();
      box.classList.toggle('active');
      updateRhythmPictures();
      saveCurrentProgression();
    }, {passive: false});
    box.setAttribute('tabindex', '0');
    box.addEventListener('keydown', function(e) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        box.classList.toggle('active');
        updateRhythmPictures();
        saveCurrentProgression();
      }
    });
  });

  // Play/Pause button
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

  // BPM input and stepper
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

  // BPM hold (for holding arrow)
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

  const brushToggle = document.getElementById('brushToggle');
  if (brushToggle) {
    brushToggle.addEventListener('change', function() {
      // Nothing needs to be done immediately - playBrush will check this value when it's called
    });
  }

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

  // Initialize A with current state
  saveCurrentProgression();
  updateSeventhBtnStates();
  updateSecondBtnStates();
});

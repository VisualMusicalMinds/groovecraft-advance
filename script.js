// --- Sound Synthesis Variables ---
let ctx = null, masterGain = null;
async function ensureAudio() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state !== "running") {
    await ctx.resume();
  }
}
async function playBrush() {
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
async function playTriangleNotes(notes) {
  await ensureAudio();
  const duration = 0.29;
  const hold = 0.07;
  const TRIANGLE_GAIN = 0.38; // Lowered by 5% from 0.4

  notes.forEach((note, i) => {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(midiToFreq(note), ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(TRIANGLE_GAIN, ctx.currentTime);
    gain.gain.setValueAtTime(TRIANGLE_GAIN, ctx.currentTime + hold);
    gain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + duration);
    osc.connect(gain).connect(masterGain);
    osc.start(ctx.currentTime + 0.01 * i);
    osc.stop(ctx.currentTime + duration + 0.01 * i);
  });
}
function midiToFreq(n) {
  // Accepts "C4", "D#4", etc.
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
  'Am':  ['A', 'C', 'E']
};
const noteColorClass = {
  'C': 'note-C',
  'D': 'note-D',
  'E': 'note-E',
  'F': 'note-F',
  'G': 'note-G',
  'A': 'note-A',
  'B': 'note-B'
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
  'Am': ['A3', 'E4', 'A4', 'C5']
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
    let url = dashImgUrl; // Default
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
let slotHighlightStep = 0;       // 0-3, always cycles through all slots
let pictureHighlightStep = 0;    // 0-3, always cycles through all pictures
let rhythmStep = 0;              // 0-7, for 8th notes (rhythm boxes)

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
  // Restore steps if bpm change, else reset
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
  // interval = 8th note (half of quarter note)
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

// Play cycle: called every 8th note
function playEighthNoteStep() {
  // 1. Rhythm box (every 8th note)
  // Which slot is currently active for this measure?
  const currentSlotIdx = slotHighlightStep % 4;
  const currentSelect = document.getElementById(`slot${currentSlotIdx}`).querySelector('.chord-select');

  // Which rhythm box in the measure? (which rhythmStep of this slot's measure: 0-7)
  const whichBox = rhythmStep % 8;
  const pair = Math.floor(whichBox / 2);
  const which = whichBox % 2;
  const box = document.querySelector(`.bottom-rhythm-box[data-pair="${pair}"][data-which="${which}"]`);
  // Only play sound if the box is active
  if (box && box.classList.contains('active')) {
    if (currentSelect.value === "") {
      playBassDrum();
    } else if (currentSelect.value === "empty") {
      // Play nothing
    } else if (rhythmChordNotes[currentSelect.value]) {
      playTriangleNotes(rhythmChordNotes[currentSelect.value]);
    }
  }

  // 2. Quarter note pulse: picture highlight and brush sound
  if (rhythmStep % 2 === 0) {
    playBrush();
    updatePictureHighlights();
    pictureHighlightStep = (pictureHighlightStep + 1) % 4;
  }

  // 3. Whole note: chord slot highlight (every 8 8th notes)
  if (rhythmStep === 0) {
    updateSlotHighlights();
  }

  // 4. Step forward
  rhythmStep = (rhythmStep + 1) % 8;

  // 5. Only after all 8 rhythm steps, advance slotHighlightStep
  if (rhythmStep === 0) {
    slotHighlightStep = (slotHighlightStep + 1) % 4;
  }
}

// Highlight always 4 slots in sequence, including "empty"
function updateSlotHighlights() {
  for (let i = 0; i < slotIds.length; i++) unhighlightSlot(i);
  if (isPlaying) { // Only highlight if playing
    highlightSlot(slotHighlightStep % 4);
  }
}
function highlightSlot(idx) {
  document.getElementById(slotIds[idx]).classList.add('enlarged');
}
function unhighlightSlot(idx) {
  document.getElementById(slotIds[idx]).classList.remove('enlarged');
}

// Highlight only one picture box at a time (quarter note pulse)
function updatePictureHighlights() {
  for (let i = 0; i < 4; i++) unhighlightPicture(i);
  if (isPlaying) { // Only highlight if playing
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
  document.querySelectorAll('.bottom-rhythm-box').forEach(box => box.classList.remove('active'));
  updateRhythmPictures();
  setPlaying(false);
}

document.addEventListener("DOMContentLoaded", function() {
  // Chord select listeners
  document.querySelectorAll('.chord-select').forEach((select, idx) => {
    select.addEventListener('change', function() {
      setSlotColorAndStyle(idx, select);
    });
    setSlotColorAndStyle(idx, select);
  });

  // Rhythm box listeners
  document.querySelectorAll('.bottom-rhythm-box').forEach(box => {
    box.addEventListener('click', function(e) {
      box.classList.toggle('active');
      updateRhythmPictures();
    });
    box.addEventListener('touchstart', function(e) {
      e.preventDefault();
      box.classList.toggle('active');
      updateRhythmPictures();
    }, {passive: false});
    box.setAttribute('tabindex', '0');
    box.addEventListener('keydown', function(e) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        box.classList.toggle('active');
        updateRhythmPictures();
      }
    });
  });

  // Play/Pause
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

  // BPM events
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

  // Clear
  document.getElementById('clear').addEventListener('click', clearAll);
  document.getElementById('clear').addEventListener('touchstart', function(e) {
    e.preventDefault();
    clearAll();
  }, {passive: false});

  // Initial setup
  updateRhythmPictures();
  
  // Ensure nothing is highlighted at start
  for (let i = 0; i < slotIds.length; i++) {
    unhighlightSlot(i);
  }
  for (let i = 0; i < 4; i++) {
    unhighlightPicture(i);
  }
  
  // Make sure isPlaying is false at start
  isPlaying = false;
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  playIcon.style.display = "block";
  pauseIcon.style.display = "none";
});

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
let progressionC = ['', '', '', '']; 
let progressionD = ['', '', '', '']; 
let rhythmBoxesA = Array(8).fill(false);
let rhythmBoxesB = Array(8).fill(false);
let rhythmBoxesC = Array(8).fill(false); 
let rhythmBoxesD = Array(8).fill(false); 
let seventhA = [false, false, false, false];
let seventhB = [false, false, false, false];
let seventhC = [false, false, false, false]; 
let seventhD = [false, false, false, false]; 
let secondA = [false, false, false, false];
let secondB = [false, false, false, false];
let secondC = [false, false, false, false]; 
let secondD = [false, false, false, false]; 
// M/m toggle variables - 'none' = natural, 'major' = forced major, 'minor' = forced minor
let majorA = ['none', 'none', 'none', 'none'];
let majorB = ['none', 'none', 'none', 'none'];
let majorC = ['none', 'none', 'none', 'none'];
let majorD = ['none', 'none', 'none', 'none'];

const chordTypes = {
  'C': 'major', 'Dm': 'minor', 'Em': 'minor', 'F': 'major', 'G': 'major', 'Am': 'minor', 'D': 'major', 'E': 'major', 'Bb': 'major'
};

const chordAlternateThirds = {
  'C':  { 'major': 'E', 'minor': 'E♭', 'majorNote': 'E4', 'minorNote': 'Eb4' },
  'Dm': { 'major': 'F♯','minor': 'F',  'majorNote': 'F#4','minorNote': 'F4'  },
  'Em': { 'major': 'G♯','minor': 'G',  'majorNote': 'G#4','minorNote': 'G4'  },
  'F':  { 'major': 'A', 'minor': 'A♭', 'majorNote': 'A4', 'minorNote': 'Ab4' },
  'G':  { 'major': 'B', 'minor': 'B♭', 'majorNote': 'B4', 'minorNote': 'Bb4' },
  'Am': { 'major': 'C♯','minor': 'C',  'majorNote': 'C#5','minorNote': 'C5'  },
  'D':  { 'major': 'F♯','minor': 'F',  'majorNote': 'F#4','minorNote': 'F4'  },
  'E':  { 'major': 'G♯','minor': 'G',  'majorNote': 'G#4','minorNote': 'G4'  },
  'Bb': { 'major': 'D', 'minor': 'D♭', 'majorNote': 'D4', 'minorNote': 'Db4' }
};

function setupCustomVoiceWave() {
  const harmonics = 20;
  const real = new Float32Array(harmonics);
  const imag = new Float32Array(harmonics);
  real[1] = 1; real[2] = 0.15; real[3] = 0.1; real[4] = 0.05;
  for (let i = 5; i < harmonics; i++) real[i] = 0;
  if (ctx) customVoiceWave = ctx.createPeriodicWave(real, imag);
}

async function ensureAudio() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain(); masterGain.gain.value = 1;
    compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -24; compressor.knee.value = 30; compressor.ratio.value = 12;
    compressor.attack.value = 0.003; compressor.release.value = 0.25;
    compressor.connect(ctx.destination); masterGain.connect(compressor);
    setupCustomVoiceWave();
  }
  if (!customVoiceWave) setupCustomVoiceWave();
  if (ctx.state !== "running") await ctx.resume();
}

function updateWaveformDisplay() { document.getElementById("waveform-name").textContent = currentWaveform; }
function handleWaveformDial(dir) {
  currentWaveformIndex = (currentWaveformIndex + dir + waveforms.length) % waveforms.length;
  currentWaveform = waveforms[currentWaveformIndex];
  updateWaveformDisplay();
}

function saveCurrentProgression() {
  const chordValues = Array.from(document.querySelectorAll('.chord-select')).map(select => select.value);
  const rhythmBoxStates = Array.from(document.querySelectorAll('.bottom-rhythm-box')).map(box => box.classList.contains('active'));
  const seventhStates = Array.from(document.querySelectorAll('.seventh-btn')).map(btn => btn.classList.contains('active'));
  const secondStates = Array.from(document.querySelectorAll('.second-btn')).map(btn => btn.classList.contains('active'));
  // majorA, majorB, etc. are updated directly by toggleMajorMinor, so no need to read from DOM here for them.
  
  if (currentToggle === 'A') {
    progressionA = [...chordValues]; rhythmBoxesA = [...rhythmBoxStates]; seventhA = [...seventhStates]; secondA = [...secondStates]; /* majorA is already up-to-date */
  } else if (currentToggle === 'B') {
    progressionB = [...chordValues]; rhythmBoxesB = [...rhythmBoxStates]; seventhB = [...seventhStates]; secondB = [...secondStates]; /* majorB is already up-to-date */
  } else if (currentToggle === 'C') {
    progressionC = [...chordValues]; rhythmBoxesC = [...rhythmBoxStates]; seventhC = [...seventhStates]; secondC = [...secondStates]; /* majorC is already up-to-date */
  } else if (currentToggle === 'D') {
    progressionD = [...chordValues]; rhythmBoxesD = [...rhythmBoxStates]; seventhD = [...seventhStates]; secondD = [...secondStates]; /* majorD is already up-to-date */
  }
}

function _updateQualityButtonVisualForSlot(idx, state) {
    const slot = document.getElementById('slot' + idx);
    if (!slot) return;
    const qualityBtn = slot.querySelector('.quality-toggle-btn');
    if (qualityBtn) {
        if (state === 'minor') {
            qualityBtn.textContent = 'm';
        } else {
            qualityBtn.textContent = 'M'; // For 'none' and 'major'
        }

        if (state === 'none') {
            qualityBtn.classList.remove('quality-active');
        } else {
            qualityBtn.classList.add('quality-active'); // For 'major' and 'minor'
        }
    }
}

function loadProgression(toggle) {
  let progression, rhythmBoxStates, seventhStates, secondStates, majorStatesToLoad;
  switch(toggle) {
    case 'A': progression = progressionA; rhythmBoxStates = rhythmBoxesA; seventhStates = seventhA; secondStates = secondA; majorStatesToLoad = majorA; break;
    case 'B': progression = progressionB; rhythmBoxStates = rhythmBoxesB; seventhStates = seventhB; secondStates = secondB; majorStatesToLoad = majorB; break;
    case 'C': progression = progressionC; rhythmBoxStates = rhythmBoxesC; seventhStates = seventhC; secondStates = secondC; majorStatesToLoad = majorC; break;
    case 'D': progression = progressionD; rhythmBoxStates = rhythmBoxesD; seventhStates = seventhD; secondStates = secondD; majorStatesToLoad = majorD; break;
    default:  progression = progressionA; rhythmBoxStates = rhythmBoxesA; seventhStates = seventhA; secondStates = secondA; majorStatesToLoad = majorA;
  }

  document.querySelectorAll('.chord-select').forEach((select, idx) => {
    select.value = progression[idx];
    setSlotColorAndStyle(idx, select, seventhStates[idx], secondStates[idx]);
  });
  document.querySelectorAll('.bottom-rhythm-box').forEach((box, idx) => box.classList.toggle('active', rhythmBoxStates[idx]));
  document.querySelectorAll('.seventh-btn').forEach((btn, idx) => btn.classList.toggle('active', seventhStates[idx]));
  document.querySelectorAll('.second-btn').forEach((btn, idx) => btn.classList.toggle('active', secondStates[idx]));
  
  // Set M/m toggle states using the new helper
  majorStatesToLoad.forEach((state, idx) => {
    _updateQualityButtonVisualForSlot(idx, state);
  });

  updateRhythmPictures();
}

function switchToggle(toggle) {
  if (currentToggle === toggle) return;
  saveCurrentProgression();
  currentToggle = toggle;
  document.querySelectorAll('.abcd-toggle-btn').forEach(btn => btn.classList.remove('abcd-active'));
  document.getElementById('toggle' + toggle).classList.add('abcd-active');
  loadProgression(toggle);
}

function getToggleArrays() {
  let seventhArr, secondArr, majorArr;
  switch(currentToggle) {
    case 'A': seventhArr = seventhA; secondArr = secondA; majorArr = majorA; break;
    case 'B': seventhArr = seventhB; secondArr = secondB; majorArr = majorB; break;
    case 'C': seventhArr = seventhC; secondArr = secondC; majorArr = majorC; break;
    case 'D': seventhArr = seventhD; secondArr = secondD; majorArr = majorD; break;
    default:  seventhArr = seventhA; secondArr = secondA; majorArr = majorA;
  }
  return { seventhArr, secondArr, majorArr };
}

// --- Chord Quality Toggle Functions ---
function toggleMajorMinor(idx) {
  const { majorArr } = getToggleArrays(); // This gets the array for the current progression (e.g., majorA)
  const slot = document.getElementById('slot' + idx);
  const select = slot.querySelector('.chord-select');
  const chord = select.value;
  
  if (!chord || chord === "" || chord === "empty") {
    majorArr[idx] = 'none'; // Reset state if no chord
    _updateQualityButtonVisualForSlot(idx, 'none');
    // setSlotColorAndStyle(idx, select); // Update visuals if needed
    // saveCurrentProgression(); // Save this reset
    return;
  }
  
  // Cycle through states: none -> major -> minor -> none
  if (majorArr[idx] === 'none') {
    majorArr[idx] = 'major';
  } else if (majorArr[idx] === 'major') {
    majorArr[idx] = 'minor';
  } else { // majorArr[idx] === 'minor'
    majorArr[idx] = 'none';
  }
  
  _updateQualityButtonVisualForSlot(idx, majorArr[idx]); // Update button appearance
  
  const { seventhArr, secondArr } = getToggleArrays(); // Re-fetch in case of complex interactions (though not expected here)
  setSlotColorAndStyle(idx, select, seventhArr[idx], secondArr[idx]);
  saveCurrentProgression(); // This will save the updated majorArr[idx] into majorA/B/C/D
  playChordPreview(idx);
}

function _updateAllQualityButtonVisualsCurrentToggle() {
    const { majorArr } = getToggleArrays(); // Gets for currentToggle
    for (let i = 0; i < 4; i++) {
        _updateQualityButtonVisualForSlot(i, majorArr[i]);
    }
}


const chordTones = {
  'C': ['C', 'E', 'G'], 'Dm': ['D', 'F', 'A'], 'Em': ['E', 'G', 'B'], 'F': ['F', 'A', 'C'],
  'G': ['G', 'B', 'D'], 'Am': ['A', 'C', 'E'], 'D': ['D', 'F♯', 'A'], 'E': ['E', 'G♯', 'B'], 'Bb': ['B♭', 'D', 'F']
};
const chordSevenths = {
  'C': 'B♭', 'Dm': 'C', 'Em': 'D', 'F': 'E♭', 'G': 'F', 'Am': 'G', 'D': 'C', 'E': 'D', 'Bb': 'A♭'
};
const chordSeconds = {
  'C': 'D', 'Dm': 'E', 'Em': 'F♯', 'F': 'G', 'G': 'A', 'Am': 'B', 'D': 'E', 'E': 'F♯', 'Bb': 'C'
};
const rhythmChordNotes = {
  'C':  ['C3', 'C4', 'E4', 'G4', 'C5'], 'Dm': ['D3', 'D4', 'F4', 'A4'], 'Em': ['E3', 'E4', 'G4', 'B4'],
  'F':  ['F3', 'F4', 'A4', 'C5'], 'G':  ['G3', 'G4', 'B4', 'D4'], 'Am': ['A3', 'A4', 'C5', 'E5'],
  'D':  ['D3', 'D4', 'F#4', 'A4'], 'E':  ['E3', 'E4', 'G#4', 'B4'], 'Bb': ['Bb3', 'D4', 'F4', 'Bb4']
};
const rhythmChordSeventhNotes = {
  'C': 'Bb4', 'Dm': 'C5', 'Em': 'D5', 'F': 'Eb5', 'G': 'F4', 'Am': 'G4', 'D': 'C5', 'E': 'D5', 'Bb': 'Ab4'
};
const rhythmChordSecondNotes = {
  'C': 'D4', 'Dm': 'E4', 'Em': 'F#4', 'F': 'G4', 'G': 'A4', 'Am': 'B4', 'D': 'E4', 'E': 'F#4', 'Bb': 'C5'
};
const noteColorClass = {
  'C': 'note-C', 'D': 'note-D', 'E': 'note-E', 'F': 'note-F', 'G': 'note-G', 'A': 'note-A', 'B': 'note-B',
  'F♯': 'note-F', 'G♯': 'note-G', 'B♭': 'note-B', 'E♭': 'note-E', 'A♭': 'note-A', 'C♯': 'note-C', 'D♭': 'note-D'
};
const restDashImgUrl = "https://visualmusicalminds.github.io/images/CartoonRhythmBox5.svg";
const dashImgUrl = "https://visualmusicalminds.github.io/images/CartoonRhythmBox1.svg";
const rhythmBox2 = "https://visualmusicalminds.github.io/images/CartoonRhythmBox2.svg";
const rhythmBox3 = "https://visualmusicalminds.github.io/images/CartoonRhythmBox3.svg";
const rhythmBox4 = "https://visualmusicalminds.github.io/images/CartoonRhythmBox4.svg";

function setSlotColorAndStyle(slotIndex, select, addSeventhArg, addSecondArg) {
  let addSeventh, addSecond;
  if (typeof addSeventhArg === 'boolean') addSeventh = addSeventhArg;
  else { const { seventhArr } = getToggleArrays(); addSeventh = seventhArr[slotIndex]; }
  if (typeof addSecondArg === 'boolean') addSecond = addSecondArg;
  else { const { secondArr } = getToggleArrays(); addSecond = secondArr[slotIndex]; }
  
  setSlotContent(slotIndex, select.value, addSeventh, addSecond);
  select.classList.remove('c-selected-c', 'c-selected-dm', 'c-selected-em', 'c-selected-f', 'c-selected-g', 'c-selected-am', 'c-selected-d', 'c-selected-e', 'c-selected-bb');
  switch(select.value) {
    case 'C':  select.classList.add('c-selected-c'); break; case 'Dm': select.classList.add('c-selected-dm'); break;
    case 'Em': select.classList.add('c-selected-em'); break; case 'F':  select.classList.add('c-selected-f'); break;
    case 'G':  select.classList.add('c-selected-g'); break; case 'Am': select.classList.add('c-selected-am'); break;
    case 'D':  select.classList.add('c-selected-d'); break; case 'E':  select.classList.add('c-selected-e'); break;
    case 'Bb': select.classList.add('c-selected-bb'); break; default: break;
  }
}

function setSlotContent(slotIndex, chord, addSeventh, addSecond) {
  const slot = document.getElementById('slot' + slotIndex);
  const noteRects = slot.querySelector('.note-rects');
  let img = slot.querySelector('.dash-img-slot');
  noteRects.innerHTML = '';
  
  if (chord === "") {
    if (!img) {
      img = document.createElement('img'); img.className = 'dash-img-slot';
      img.src = restDashImgUrl; img.alt = "Rhythm Box Rest";
      slot.insertBefore(img, slot.querySelector('.chord-select'));
    } else { img.src = restDashImgUrl; img.alt = "Rhythm Box Rest"; img.style.display = "block"; }
    return;
  } else { if (img) img.style.display = "none"; }
  
  slot.className = 'slot-box';
  if (!chord || chord === "empty" || chord === "") return;
  
  let tones = [...chordTones[chord]];
  const { majorArr } = getToggleArrays();
  const toggleState = majorArr[slotIndex];
  
  // Modify the third based on toggleState
  if (chordAlternateThirds[chord]) {
      if (toggleState === 'major') tones[1] = chordAlternateThirds[chord]['major'];
      else if (toggleState === 'minor') tones[1] = chordAlternateThirds[chord]['minor'];
  }
  
  let rects = tones.map(note => {
    const baseLetter = note.charAt(0);
    if (note.includes('♯')) return `<div class="note-rect ${noteColorClass[note] || noteColorClass[baseLetter]}">${baseLetter}<span class="accidental sharp">♯</span></div>`;
    if (note.includes('♭')) return `<div class="note-rect ${noteColorClass[note] || noteColorClass[baseLetter]}">${baseLetter}<span class="accidental flat">♭</span></div>`;
    return `<div class="note-rect ${noteColorClass[note]}">${note}</div>`;
  });

  if (addSecond && chordSeconds[chord]) {
    let note = chordSeconds[chord], baseLetter = note.charAt(0), colorClass = noteColorClass[note] || noteColorClass[baseLetter], display;
    if (note.includes('♯')) display = `<div class="note-rect note-2nd ${colorClass}">${baseLetter}<span class="accidental sharp">♯</span></div>`;
    else if (note.includes('♭')) display = `<div class="note-rect note-2nd ${colorClass}">${baseLetter}<span class="accidental flat">♭</span></div>`;
    else display = `<div class="note-rect note-2nd ${colorClass}">${note}</div>`;
    rects.splice(1, 0, display);
  }

  if (addSeventh && chordSevenths[chord]) {
    let note = chordSevenths[chord], baseLetter = note.charAt(0), colorClass = noteColorClass[note] || noteColorClass[baseLetter], display;
    if (note.includes('♯')) display = `<div class="note-rect note-7th ${colorClass}">${baseLetter}<span class="accidental sharp">♯</span></div>`;
    else if (note.includes('♭')) display = `<div class="note-rect note-7th ${colorClass}">${baseLetter}<span class="accidental flat">♭</span></div>`;
    else display = `<div class="note-rect note-7th ${colorClass}">${note}</div>`;
    rects.push(display);
  }
  noteRects.innerHTML = rects.join('');
}

function toggleSeventh(idx) {
  const { seventhArr, secondArr } = getToggleArrays();
  seventhArr[idx] = !seventhArr[idx];
  updateSeventhBtnStates();
  const select = document.getElementById('slot'+idx).querySelector('.chord-select');
  setSlotColorAndStyle(idx, select, seventhArr[idx], secondArr[idx]);
  saveCurrentProgression();
}
function updateSeventhBtnStates() {
  const { seventhArr } = getToggleArrays();
  document.querySelectorAll('.seventh-btn').forEach((btn, idx) => btn.classList.toggle('active', seventhArr[idx]));
}

function toggleSecond(idx) {
  const { seventhArr, secondArr } = getToggleArrays();
  secondArr[idx] = !secondArr[idx];
  updateSecondBtnStates();
  const select = document.getElementById('slot'+idx).querySelector('.chord-select');
  setSlotColorAndStyle(idx, select, seventhArr[idx], secondArr[idx]);
  saveCurrentProgression();
}
function updateSecondBtnStates() {
  const { secondArr } = getToggleArrays();
  document.querySelectorAll('.second-btn').forEach((btn, idx) => btn.classList.toggle('active', secondArr[idx]));
}

function updateRhythmPictures() {
  for (let pair = 0; pair < 4; ++pair) {
    const box1 = document.querySelector(`.bottom-rhythm-box[data-pair="${pair}"][data-which="0"]`);
    const box2 = document.querySelector(`.bottom-rhythm-box[data-pair="${pair}"][data-which="1"]`);
    const img = document.getElementById('bottomPic'+pair).querySelector('.bottom-picture-img');
    let url = dashImgUrl;
    if (box1.classList.contains('active') && !box2.classList.contains('active')) url = rhythmBox2;
    else if (box1.classList.contains('active') && box2.classList.contains('active')) url = rhythmBox3;
    else if (!box1.classList.contains('active') && box2.classList.contains('active')) url = rhythmBox4;
    img.src = url;
  }
}

let isPlaying = false, rhythmInterval = null, slotIds = ['slot0', 'slot1', 'slot2', 'slot3'];
let slotHighlightStep = 0, pictureHighlightStep = 0, rhythmStep = 0;

function getBpmInputValue() { let val = parseInt(document.getElementById('bpmInput').value, 10); return isNaN(val) ? 90 : val; }
function setBpmInputValue(val) { document.getElementById('bpmInput').value = val; }
function clampBpm(val) { return Math.max(30, Math.min(300, val)); }

function setPlaying(playing) {
  isPlaying = playing;
  const playIcon = document.getElementById('playIcon'), pauseIcon = document.getElementById('pauseIcon'), playPauseBtn = document.getElementById('playPauseBtn');
  playIcon.style.display = isPlaying ? "none" : "block"; pauseIcon.style.display = isPlaying ? "block" : "none";
  playPauseBtn.title = isPlaying ? "Pause" : "Play"; playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
  if (isPlaying) startMainAnimation(); else stopMainAnimation();
}

function startMainAnimation() {
  stopMainAnimation();
  if (typeof startMainAnimation.preservedSteps === "object" && startMainAnimation.preservedSteps.keep) {
    slotHighlightStep = startMainAnimation.preservedSteps.slotHighlightStep;
    pictureHighlightStep = startMainAnimation.preservedSteps.pictureHighlightStep;
    rhythmStep = startMainAnimation.preservedSteps.rhythmStep;
    startMainAnimation.preservedSteps.keep = false;
  } else { slotHighlightStep = 0; pictureHighlightStep = 0; rhythmStep = 0; }
  updateSlotHighlights(); updatePictureHighlights();
  const intervalMs = (60 / getBpmInputValue()) * 1000 / 2;
  playEighthNoteStep(); rhythmInterval = setInterval(playEighthNoteStep, intervalMs);
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
  const box = document.querySelector(`.bottom-rhythm-box[data-pair="${Math.floor((rhythmStep % 8) / 2)}"][data-which="${(rhythmStep % 8) % 2}"]`);
  
  if (box && box.classList.contains('active')) {
    if (currentSelect.value === "") playBassDrum();
    else if (currentSelect.value !== "empty") {
      const chord = currentSelect.value;
      const { seventhArr, secondArr, majorArr } = getToggleArrays();
      const addSeventh = seventhArr[currentSlotIdx], addSecond = secondArr[currentSlotIdx], toggleState = majorArr[currentSlotIdx];
      let notes = [...rhythmChordNotes[chord]];
      
      if (chordAlternateThirds[chord]) { // Modify third for playback
          if (toggleState === 'major') notes[2] = chordAlternateThirds[chord]['majorNote'];
          else if (toggleState === 'minor') notes[2] = chordAlternateThirds[chord]['minorNote'];
      }
      if (addSecond && rhythmChordSecondNotes[chord]) notes.push(rhythmChordSecondNotes[chord]);
      if (addSeventh && rhythmChordSeventhNotes[chord]) notes.push(rhythmChordSeventhNotes[chord]);
      playTriangleNotes(notes);
    }
  }
  if (rhythmStep % 2 === 0) { playBrush(); updatePictureHighlights(); pictureHighlightStep = (pictureHighlightStep + 1) % 4; }
  if (rhythmStep === 0) updateSlotHighlights();
  rhythmStep = (rhythmStep + 1) % 8;
  if (rhythmStep === 0) slotHighlightStep = (slotHighlightStep + 1) % 4;
}

function updateSlotHighlights() { for (let i = 0; i < slotIds.length; i++) unhighlightSlot(i); if (isPlaying) highlightSlot(slotHighlightStep % 4); }
function highlightSlot(idx) { document.getElementById(slotIds[idx]).classList.add('enlarged'); }
function unhighlightSlot(idx) { document.getElementById(slotIds[idx]).classList.remove('enlarged'); }
function updatePictureHighlights() { for (let i = 0; i < 4; i++) unhighlightPicture(i); if (isPlaying) highlightPicture(pictureHighlightStep % 4); }
function highlightPicture(idx) { document.getElementById('bottomPic'+idx).classList.add('picture-highlighted'); }
function unhighlightPicture(idx) { document.getElementById('bottomPic'+idx).classList.remove('picture-highlighted'); }

function clearAll() {
  for (let i = 0; i < 4; i++) {
    const slot = document.getElementById('slot'+i);
    slot.querySelector('.note-rects').innerHTML = '';
    const select = slot.querySelector('.chord-select');
    select.selectedIndex = 0;
    setSlotColorAndStyle(i, select, false, false); // This will use new setSlotContent
    slot.classList.remove('enlarged');
    let img = slot.querySelector('.dash-img-slot');
    if (img) { img.src = restDashImgUrl; img.alt = "Rhythm Box Rest"; img.style.display = "block"; }
    slot.querySelector('.seventh-btn')?.classList.remove('active');
    slot.querySelector('.second-btn')?.classList.remove('active');
  }
  document.querySelectorAll('.bottom-rhythm-box').forEach(box => box.classList.remove('active'));
  updateRhythmPictures();

  const currentToggleArrays = getToggleArrays();
  for (let i = 0; i < 4; i++) {
    currentToggleArrays.seventhArr[i] = false;
    currentToggleArrays.secondArr[i] = false;
    currentToggleArrays.majorArr[i] = 'none'; 
    _updateQualityButtonVisualForSlot(i, 'none'); // Update new button visual
  }
  updateSeventhBtnStates(); // For 7th buttons
  updateSecondBtnStates();  // For 2nd buttons
  // _updateAllQualityButtonVisualsCurrentToggle(); // Called by the loop above with _updateQualityButtonVisualForSlot

  saveCurrentProgression();
  setPlaying(false);
}

async function playBrush() {
  if (!document.getElementById('brushToggle')?.checked) return;
  await ensureAudio(); const duration = 0.09, bufferSize = ctx.sampleRate * duration, buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource(); noise.buffer = buffer;
  const filter = ctx.createBiquadFilter(); filter.type = "bandpass"; filter.frequency.value = 2000; filter.Q.value = 1.8;
  const gain = ctx.createGain(); gain.gain.value = 0.5; gain.gain.setValueAtTime(0.5, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  noise.connect(filter).connect(gain).connect(masterGain); noise.start(); noise.stop(ctx.currentTime + duration);
}

async function playBassDrum() {
  await ensureAudio(); const duration = 0.19; const osc = ctx.createOscillator(); osc.type = "sine";
  osc.frequency.setValueAtTime(140, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + duration * 0.85);
  const gain = ctx.createGain(); gain.gain.setValueAtTime(1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain).connect(masterGain); osc.start(); osc.stop(ctx.currentTime + duration);
}

// --- Sound Synthesis Variables ---
let ctx = null, masterGain = null, compressor = null;
let customVoiceWave = null;
const waveforms = ['sine', 'triangle', 'square', 'saw', 'voice'];
let currentWaveformIndex = 1;
let currentWaveform = waveforms[currentWaveformIndex];

// Other variables and functions unchanged...

async function playTriangleNotes(notes) {
  await ensureAudio(); 
  
  // Different sound characteristics for each waveform type
  const soundProfiles = {
    // Smooth, rounded, pure tone with gentle fade
    sine: {
      duration: 0.4,
      attack: 0.04,
      hold: 0.2,
      release: 0.16,
      filterFreq: 3000,
      filterQ: 0.5,
      gain: 0.36,
      vibrato: false
    },
    // Staccato and bouncy (keeping as requested)
    triangle: {
      duration: 0.29,
      attack: 0.015,
      hold: 0.07,
      release: 0.2,
      filterFreq: 1200,
      filterQ: 1,
      gain: 0.38,
      vibrato: false
    },
    // Sharp, percussive with quick decay - pluck-like sound
    square: {
      duration: 0.25,
      attack: 0.005,
      hold: 0.02,
      release: 0.225,
      filterFreq: 900,
      filterQ: 2,
      gain: 0.30,
      vibrato: false
    },
    // Bright with slight pitch bend at start (synth-like)
    saw: {
      duration: 0.33,
      attack: 0.02,
      hold: 0.05,
      release: 0.26,
      filterFreq: 1600,
      filterQ: 1.5,
      gain: 0.28,
      pitchBend: true,
      bendAmount: 30,
      bendTime: 0.08,
      vibrato: false
    },
    // Smooth and legato with vibrato (as requested)
    voice: {
      duration: 0.5,
      attack: 0.08,
      hold: 0.3,
      release: 0.12,
      filterFreq: 1000,
      filterQ: 1,
      gain: 0.36,
      vibrato: true,
      vibratoFreq: 5,
      vibratoAmount: 4
    }
  };
  
  // Get the current sound profile
  const profile = soundProfiles[currentWaveform];
  
  notes.forEach((note, i) => {
    const freq = midiToFreq(note);
    let osc, gain, lfo, lfoGain, filter;
    gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    
    if (currentWaveform === "voice") {
      // Voice: Smooth legato with pronounced vibrato
      osc = ctx.createOscillator();
      osc.setPeriodicWave(customVoiceWave);
      osc.frequency.value = freq;
      
      // Create vibrato effect for voice
      lfo = ctx.createOscillator();
      lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(profile.vibratoFreq, ctx.currentTime);
      lfoGain.gain.setValueAtTime(profile.vibratoAmount, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      
      // Filter setup
      filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(profile.filterFreq, ctx.currentTime);
      filter.Q.value = profile.filterQ;
      osc.connect(filter);
      filter.connect(gain);
      
      // Voice envelope: slow attack, long sustain
      const attackTime = profile.attack;
      const decayTime = 0.18;
      const sustainLevel = profile.gain * 0.7;
      const maxLevel = profile.gain * 1.0;
      
      gain.gain.linearRampToValueAtTime(maxLevel, ctx.currentTime + attackTime);
      gain.gain.linearRampToValueAtTime(sustainLevel, ctx.currentTime + attackTime + decayTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + profile.duration);
      
      gain.connect(masterGain);
      osc.start(ctx.currentTime + 0.01 * i);
      osc.stop(ctx.currentTime + profile.duration + 0.01 * i + 0.08);
      lfo.stop(ctx.currentTime + profile.duration + 0.01 * i + 0.08);
    } else if (currentWaveform === "saw") {
      // Saw: Bright with initial pitch bend for character
      osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      
      // Create pitch bend effect for saw
      if (profile.pitchBend) {
        osc.frequency.setValueAtTime(freq + profile.bendAmount, ctx.currentTime + 0.01 * i);
        osc.frequency.exponentialRampToValueAtTime(freq, ctx.currentTime + 0.01 * i + profile.bendTime);
      }
      
      // Add a subtle phaser-like effect for saw wave
      const allpass = ctx.createBiquadFilter();
      allpass.type = 'allpass';
      allpass.frequency.value = 800;
      allpass.Q.value = 5;
      
      filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(profile.filterFreq, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(profile.filterFreq * 0.5, ctx.currentTime + profile.duration);
      filter.Q.value = profile.filterQ;
      
      osc.connect(filter);
      filter.connect(allpass);
      allpass.connect(gain);
      
      // Saw envelope: medium attack, medium release
      gain.gain.linearRampToValueAtTime(profile.gain, ctx.currentTime + profile.attack + 0.01 * i);
      gain.gain.setValueAtTime(profile.gain, ctx.currentTime + profile.attack + profile.hold + 0.01 * i);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + profile.duration + 0.01 * i);
      
      gain.connect(masterGain);
      osc.start(ctx.currentTime + 0.01 * i);
      osc.stop(ctx.currentTime + profile.duration + 0.01 * i);
    } else if (currentWaveform === "square") {
      // Square: Sharp, percussive pluck with quick decay
      osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = freq;
      
      // Create a punchy effect with dual filters
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 80;
      
      filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(profile.filterFreq * 2, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(profile.filterFreq, ctx.currentTime + profile.attack + profile.hold);
      filter.Q.value = profile.filterQ;
      
      osc.connect(highpass);
      highpass.connect(filter);
      filter.connect(gain);
      
      // Square envelope: very quick attack, quick decay
      gain.gain.linearRampToValueAtTime(profile.gain * 1.2, ctx.currentTime + profile.attack + 0.01 * i);
      gain.gain.exponentialRampToValueAtTime(profile.gain * 0.5, ctx.currentTime + profile.attack + profile.hold + 0.05 + 0.01 * i);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + profile.duration + 0.01 * i);
      
      gain.connect(masterGain);
      osc.start(ctx.currentTime + 0.01 * i);
      osc.stop(ctx.currentTime + profile.duration + 0.01 * i);
    } else if (currentWaveform === "sine") {
      // Sine: Smooth, pure tone with gentle fade
      osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      
      // Add gentle harmonics to make it richer
      const harmonicOsc = ctx.createOscillator();
      harmonicOsc.type = "sine";
      harmonicOsc.frequency.value = freq * 2; // First harmonic
      
      const harmonicGain = ctx.createGain();
      harmonicGain.gain.value = 0.15; // Subtle amount
      
      filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(profile.filterFreq, ctx.currentTime);
      filter.Q.value = profile.filterQ;
      
      osc.connect(filter);
      harmonicOsc.connect(harmonicGain);
      harmonicGain.connect(filter);
      filter.connect(gain);
      
      // Sine envelope: gentle attack and release
      gain.gain.linearRampToValueAtTime(profile.gain, ctx.currentTime + profile.attack + 0.01 * i);
      gain.gain.setValueAtTime(profile.gain, ctx.currentTime + profile.attack + profile.hold + 0.01 * i);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + profile.duration + 0.01 * i);
      
      gain.connect(masterGain);
      osc.start(ctx.currentTime + 0.01 * i);
      osc.stop(ctx.currentTime + profile.duration + 0.01 * i);
      harmonicOsc.start(ctx.currentTime + 0.01 * i);
      harmonicOsc.stop(ctx.currentTime + profile.duration + 0.01 * i);
    } else {
      // Triangle (keep as is)
      osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      
      filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(profile.filterFreq, ctx.currentTime);
      filter.Q.value = profile.filterQ;
      
      osc.connect(filter);
      filter.connect(gain);
      
      // Triangle envelope: quick attack, short hold, medium release
      gain.gain.linearRampToValueAtTime(profile.gain, ctx.currentTime + profile.attack + 0.01 * i);
      gain.gain.setValueAtTime(profile.gain, ctx.currentTime + profile.attack + profile.hold + 0.01 * i);
      gain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + profile.duration + 0.01 * i);
      
      gain.connect(masterGain);
      osc.start(ctx.currentTime + 0.01 * i);
      osc.stop(ctx.currentTime + profile.duration + 0.01 * i);
    }
  });
}

function midiToFreq(n) {
  const notes = {'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,'E':4,'F':5,'F#':6,'Gb':6,'G':7,'G#':8,'Ab':8,'A':9,'A#':10,'Bb':10,'B':11, 'F♯':6, 'G♯':8, 'B♭':10, 'E♭':3, 'A♭':8, 'C♯':1, 'D♭':1 };
  let note, octave;
  if (n.includes('♭') || n.includes('♯')) { note = n.slice(0, 2); octave = parseInt(n.slice(2)); }
  else { note = n.slice(0, n.length-1); octave = parseInt(n[n.length-1]); }
  return 440 * Math.pow(2, (notes[note]+(octave-4)*12-9)/12);
}

function playChordPreview(idx) {
  if (isPlaying) return;
  const select = document.getElementById('slot' + idx).querySelector('.chord-select');
  const chord = select.value;
  if (!chord || chord === "" || chord === "empty") return;
  
  const { seventhArr, secondArr, majorArr } = getToggleArrays();
  const addSeventh = seventhArr[idx], addSecond = secondArr[idx], toggleState = majorArr[idx];
  let notes = [...rhythmChordNotes[chord]];

  if (chordAlternateThirds[chord]) { // Modify third for playback
      if (toggleState === 'major') notes[2] = chordAlternateThirds[chord]['majorNote'];
      else if (toggleState === 'minor') notes[2] = chordAlternateThirds[chord]['minorNote'];
  }
  if (addSecond && rhythmChordSecondNotes[chord]) notes.push(rhythmChordSecondNotes[chord]);
  if (addSeventh && rhythmChordSeventhNotes[chord]) notes.push(rhythmChordSeventhNotes[chord]);
  playTriangleNotes(notes);
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("wave-left").onclick = () => handleWaveformDial(-1);
  document.getElementById("wave-right").onclick = () => handleWaveformDial(1);
  document.getElementById("wave-left").addEventListener("keydown", (e) => { if (e.key===" "||e.key==="Enter"||e.key==="ArrowLeft") { e.preventDefault(); handleWaveformDial(-1); e.target.focus(); }});
  document.getElementById("wave-right").addEventListener("keydown", (e) => { if (e.key===" "||e.key==="Enter"||e.key==="ArrowRight") { e.preventDefault(); handleWaveformDial(1); e.target.focus(); }});
  updateWaveformDisplay();

  ['A', 'B', 'C', 'D'].forEach(t => {
    const btn = document.getElementById('toggle' + t);
    btn.addEventListener('click', () => switchToggle(t));
    btn.addEventListener('keydown', (e) => { if (e.key===" "||e.key==="Enter") { e.preventDefault(); switchToggle(t); }});
  });

  document.querySelectorAll('.chord-select').forEach((select, idx) => {
    select.addEventListener('change', function() {
      setSlotColorAndStyle(idx, select); saveCurrentProgression(); playChordPreview(idx);
    });
    setSlotColorAndStyle(idx, select); // Initial call
  });

  document.querySelectorAll('.seventh-btn').forEach((btn, idx) => {
    btn.addEventListener('click', function() { toggleSeventh(idx); playChordPreview(idx); });
    btn.addEventListener('keydown', function(e) { if (e.key===" "||e.key==="Enter") { e.preventDefault(); toggleSeventh(idx); playChordPreview(idx); }});
  });
  document.querySelectorAll('.second-btn').forEach((btn, idx) => {
    btn.addEventListener('click', function() { toggleSecond(idx); playChordPreview(idx); });
    btn.addEventListener('keydown', function(e) { if (e.key===" "||e.key==="Enter") { e.preventDefault(); toggleSecond(idx); playChordPreview(idx); }});
  });
  
  // New M/m toggle listeners
  document.querySelectorAll('.slot-box').forEach((slot, idx) => {
    const qualityBtn = slot.querySelector('.quality-toggle-btn');
    if (qualityBtn) {
      qualityBtn.addEventListener('click', function() { toggleMajorMinor(idx); });
      qualityBtn.addEventListener('keydown', function(e) {
        if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggleMajorMinor(idx); }
      });
    }
  });

  document.querySelectorAll('.bottom-rhythm-box').forEach(box => {
    function toggleActive(e) { e.preventDefault(); box.classList.toggle('active'); updateRhythmPictures(); saveCurrentProgression(); }
    box.addEventListener('click', toggleActive);
    box.addEventListener('touchstart', toggleActive, {passive: false});
    box.setAttribute('tabindex', '0');
    box.addEventListener('keydown', (e) => { if (e.key===" "||e.key==="Enter") toggleActive(e); });
  });

  const playPauseBtn = document.getElementById('playPauseBtn');
  function togglePlay(e) { e.preventDefault(); setPlaying(!isPlaying); }
  playPauseBtn.addEventListener('click', togglePlay);
  playPauseBtn.addEventListener('touchstart', togglePlay, {passive: false});
  playPauseBtn.addEventListener('keydown', (e) => { if (e.key===" "||e.key==="Enter") togglePlay(e); });

  const bpmInput = document.getElementById('bpmInput'), bpmUp = document.getElementById('bpmUp'), bpmDown = document.getElementById('bpmDown');
  bpmInput.addEventListener('blur', () => { setBpmInputValue(clampBpm(getBpmInputValue())); restartAnimationWithBpm(); });
  bpmInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { setBpmInputValue(clampBpm(getBpmInputValue())); restartAnimationWithBpm(); bpmInput.blur(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setBpmInputValue(clampBpm(getBpmInputValue() + 1)); restartAnimationWithBpm(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setBpmInputValue(clampBpm(getBpmInputValue() - 1)); restartAnimationWithBpm(); }
  });
  let bpmHoldInterval = null, bpmHoldTimeout = null;
  function stepBpm(dir) { setBpmInputValue(clampBpm(getBpmInputValue() + dir)); restartAnimationWithBpm(); }
  function startHold(dir) { stepBpm(dir); bpmHoldTimeout = setTimeout(() => { bpmHoldInterval = setInterval(() => stepBpm(dir), 60); }, 500); }
  function stopHold() { clearTimeout(bpmHoldTimeout); clearInterval(bpmHoldInterval); bpmHoldTimeout=null; bpmHoldInterval=null; }
  [bpmUp, bpmDown].forEach((btn, i) => {
    const dir = i === 0 ? 1 : -1;
    btn.addEventListener('mousedown', () => startHold(dir)); btn.addEventListener('touchstart', (e) => { e.preventDefault(); startHold(dir);}, {passive:false});
    btn.addEventListener('mouseup', stopHold); btn.addEventListener('mouseleave', stopHold);
    btn.addEventListener('touchend', stopHold); btn.addEventListener('touchcancel', stopHold);
    btn.addEventListener('click', () => stepBpm(dir));
  });

  document.getElementById('clear').addEventListener('click', clearAll);
  document.getElementById('clear').addEventListener('touchstart', (e)=>{e.preventDefault();clearAll();},{passive:false});

  updateRhythmPictures();
  for (let i = 0; i < slotIds.length; i++) unhighlightSlot(i);
  for (let i = 0; i < 4; i++) unhighlightPicture(i);
  setPlaying(false); // Initialize play/pause button

  saveCurrentProgression(); // Save initial 'none' states for all progressions
  updateSeventhBtnStates();
  updateSecondBtnStates();
  _updateAllQualityButtonVisualsCurrentToggle(); // Initialize new quality buttons for the current toggle
});

// --- Sound Synthesis Variables ---
let ctx = null, masterGain = null, compressor = null;
let customVoiceWave = null;
const waveforms = ['sine', 'triangle', 'square', 'saw', 'voice'];
let currentWaveformIndex = 1;
let currentWaveform = waveforms[currentWaveformIndex];

// A/B/C/D toggle variables
let currentToggle = 'A'; 
let progressionA = ['', '', '', '']; // ... and B, C, D
let progressionB = ['', '', '', ''];
let progressionC = ['', '', '', '']; 
let progressionD = ['', '', '', '']; 
let rhythmBoxesA = Array(8).fill(false); // ... and B, C, D
let rhythmBoxesB = Array(8).fill(false);
let rhythmBoxesC = Array(8).fill(false); 
let rhythmBoxesD = Array(8).fill(false); 

// Chord modifier states
let seventhA = [false, false, false, false], seventhB = [false, false, false, false], seventhC = [false, false, false, false], seventhD = [false, false, false, false]; 
let secondA = [false, false, false, false], secondB = [false, false, false, false], secondC = [false, false, false, false], secondD = [false, false, false, false]; 
let fourthA = [false, false, false, false], fourthB = [false, false, false, false], fourthC = [false, false, false, false], fourthD = [false, false, false, false]; 
let susA = [false, false, false, false], susB = [false, false, false, false], susC = [false, false, false, false], susD = [false, false, false, false];
let majorA = ['none', 'none', 'none', 'none'], majorB = ['none', 'none', 'none', 'none'], majorC = ['none', 'none', 'none', 'none'], majorD = ['none', 'none', 'none', 'none'];

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
  const fourthStates = Array.from(document.querySelectorAll('.fourth-btn')).map(btn => btn.classList.contains('active')); 
  const susStates = Array.from(document.querySelectorAll('.sus-btn')).map(btn => btn.classList.contains('active')); 
  
  const target = currentToggle === 'A' ? { p: progressionA, r: rhythmBoxesA, s7: seventhA, s2: secondA, s4: fourthA, sus: susA, m: majorA } :
                 currentToggle === 'B' ? { p: progressionB, r: rhythmBoxesB, s7: seventhB, s2: secondB, s4: fourthB, sus: susB, m: majorB } :
                 currentToggle === 'C' ? { p: progressionC, r: rhythmBoxesC, s7: seventhC, s2: secondC, s4: fourthC, sus: susC, m: majorC } :
                                         { p: progressionD, r: rhythmBoxesD, s7: seventhD, s2: secondD, s4: fourthD, sus: susD, m: majorD };

  target.p.splice(0, target.p.length, ...chordValues);
  target.r.splice(0, target.r.length, ...rhythmBoxStates);
  target.s7.splice(0, target.s7.length, ...seventhStates);
  target.s2.splice(0, target.s2.length, ...secondStates);
  target.s4.splice(0, target.s4.length, ...fourthStates);
  target.sus.splice(0, target.sus.length, ...susStates);
  // Major states (target.m) are updated directly in toggleMajorMinor
}


function _updateQualityButtonVisualForSlot(idx, state) {
    const slot = document.getElementById('slot' + idx);
    if (!slot) return;
    const qualityBtn = slot.querySelector('.quality-toggle-btn');
    if (qualityBtn) {
        if (state === 'minor') qualityBtn.textContent = 'm';
        else qualityBtn.textContent = 'M'; 
        qualityBtn.classList.toggle('quality-active', state !== 'none');
    }
}

function loadProgression(toggle) {
  let progression, rhythmBoxStates, seventhStates, secondStates, fourthStatesToLoad, susStatesToLoad, majorStatesToLoad; 
  switch(toggle) {
    case 'A': progression = progressionA; rhythmBoxStates = rhythmBoxesA; seventhStates = seventhA; secondStates = secondA; fourthStatesToLoad = fourthA; susStatesToLoad = susA; majorStatesToLoad = majorA; break;
    case 'B': progression = progressionB; rhythmBoxStates = rhythmBoxesB; seventhStates = seventhB; secondStates = secondB; fourthStatesToLoad = fourthB; susStatesToLoad = susB; majorStatesToLoad = majorB; break;
    case 'C': progression = progressionC; rhythmBoxStates = rhythmBoxesC; seventhStates = seventhC; secondStates = secondC; fourthStatesToLoad = fourthC; susStatesToLoad = susC; majorStatesToLoad = majorC; break;
    case 'D': progression = progressionD; rhythmBoxStates = rhythmBoxesD; seventhStates = seventhD; secondStates = secondD; fourthStatesToLoad = fourthD; susStatesToLoad = susD; majorStatesToLoad = majorD; break;
    default:  progression = progressionA; rhythmBoxStates = rhythmBoxesA; seventhStates = seventhA; secondStates = secondA; fourthStatesToLoad = fourthA; susStatesToLoad = susA; majorStatesToLoad = majorA;
  }

  document.querySelectorAll('.chord-select').forEach((select, idx) => {
    select.value = progression[idx];
    setSlotColorAndStyle(idx, select, seventhStates[idx], secondStates[idx], fourthStatesToLoad[idx], susStatesToLoad[idx]); 
  });
  document.querySelectorAll('.bottom-rhythm-box').forEach((box, idx) => box.classList.toggle('active', rhythmBoxStates[idx]));
  document.querySelectorAll('.seventh-btn').forEach((btn, idx) => btn.classList.toggle('active', seventhStates[idx]));
  document.querySelectorAll('.second-btn').forEach((btn, idx) => btn.classList.toggle('active', secondStates[idx]));
  document.querySelectorAll('.fourth-btn').forEach((btn, idx) => btn.classList.toggle('active', fourthStatesToLoad[idx])); 
  document.querySelectorAll('.sus-btn').forEach((btn, idx) => btn.classList.toggle('active', susStatesToLoad[idx]));
  
  majorStatesToLoad.forEach((state, idx) => _updateQualityButtonVisualForSlot(idx, state));
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
  let seventhArr, secondArr, majorArr, fourthArr, susArr; 
  switch(currentToggle) {
    case 'A': seventhArr = seventhA; secondArr = secondA; majorArr = majorA; fourthArr = fourthA; susArr = susA; break;
    case 'B': seventhArr = seventhB; secondArr = secondB; majorArr = majorB; fourthArr = fourthB; susArr = susB; break;
    case 'C': seventhArr = seventhC; secondArr = secondC; majorArr = majorC; fourthArr = fourthC; susArr = susC; break;
    case 'D': seventhArr = seventhD; secondArr = secondD; majorArr = majorD; fourthArr = fourthD; susArr = susD; break;
    default:  seventhArr = seventhA; secondArr = secondA; majorArr = majorA; fourthArr = fourthA; susArr = susA;
  }
  return { seventhArr, secondArr, majorArr, fourthArr, susArr }; 
}

function toggleMajorMinor(idx) {
  const { majorArr, seventhArr, secondArr, fourthArr, susArr } = getToggleArrays(); 
  const slot = document.getElementById('slot' + idx);
  const select = slot.querySelector('.chord-select');
  const chord = select.value;
  
  if (!chord || chord === "" || chord === "empty") {
    majorArr[idx] = 'none'; 
    _updateQualityButtonVisualForSlot(idx, 'none');
    return;
  }
  
  if (majorArr[idx] === 'none') majorArr[idx] = 'major';
  else if (majorArr[idx] === 'major') majorArr[idx] = 'minor';
  else majorArr[idx] = 'none';
  
  _updateQualityButtonVisualForSlot(idx, majorArr[idx]); 
  setSlotColorAndStyle(idx, select, seventhArr[idx], secondArr[idx], fourthArr[idx], susArr[idx]); 
  saveCurrentProgression(); 
  playChordPreview(idx);
}

function _updateAllQualityButtonVisualsCurrentToggle() {
    const { majorArr } = getToggleArrays(); 
    for (let i = 0; i < 4; i++) _updateQualityButtonVisualForSlot(i, majorArr[i]);
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
const chordFourths = { 
  'C': 'F', 'Dm': 'G', 'Em': 'A', 'F': 'B♭', 'G': 'C', 'Am': 'D', 'D': 'G', 'E': 'A', 'Bb': 'E♭'
};

const rhythmChordNotes = { // Root, Octave Root, Third, Fifth, (Optional Higher Octave Root)
  'C':  ['C3', 'C4', 'E4', 'G4', 'C5'], 'Dm': ['D3', 'D4', 'F4', 'A4', 'D5'], 'Em': ['E3', 'E4', 'G4', 'B4', 'E5'],
  'F':  ['F3', 'F4', 'A4', 'C5', 'F5'],  'G':  ['G3', 'G4', 'B4', 'D5', 'G5'], 'Am': ['A3', 'A4', 'C5', 'E5', 'A5'],
  'D':  ['D3', 'D4', 'F#4', 'A4', 'D5'], 'E':  ['E3', 'E4', 'G#4', 'B4', 'E5'], 'Bb': ['Bb2', 'Bb3', 'D4', 'F4', 'Bb4']
};
const rhythmChordSeventhNotes = { // Minor 7ths from root typically
  'C': 'Bb4', 'Dm': 'C5', 'Em': 'D5', 'F': 'Eb5', 'G': 'F5', 'Am': 'G4', 'D': 'C5', 'E': 'D5', 'Bb': 'Ab4'
};
const rhythmChordSecondNotes = { // Major 2nds from root
  'C': 'D4', 'Dm': 'E4', 'Em': 'F#4', 'F': 'G4', 'G': 'A4', 'Am': 'B4', 'D': 'E4', 'E': 'F#4', 'Bb': 'C4'
};
const rhythmChordFourthNotes = { // Perfect 4ths from root
  'C': 'F4', 'Dm': 'G4', 'Em': 'A4', 'F': 'Bb4', 'G': 'C5', 'Am': 'D5', 'D': 'G4', 'E': 'A4', 'Bb': 'Eb4'
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

function setSlotColorAndStyle(slotIndex, select, addSeventhArg, addSecondArg, addFourthArg, addSusArg) { 
  let addSeventh, addSecond, addFourth, addSus; 
  const toggleArrays = getToggleArrays();
  addSeventh = (typeof addSeventhArg === 'boolean') ? addSeventhArg : toggleArrays.seventhArr[slotIndex];
  addSecond = (typeof addSecondArg === 'boolean') ? addSecondArg : toggleArrays.secondArr[slotIndex];
  addFourth = (typeof addFourthArg === 'boolean') ? addFourthArg : toggleArrays.fourthArr[slotIndex];
  addSus = (typeof addSusArg === 'boolean') ? addSusArg : toggleArrays.susArr[slotIndex];
  
  setSlotContent(slotIndex, select.value, addSeventh, addSecond, addFourth, addSus); 
  select.classList.remove('c-selected-c', 'c-selected-dm', 'c-selected-em', 'c-selected-f', 'c-selected-g', 'c-selected-am', 'c-selected-d', 'c-selected-e', 'c-selected-bb');
  if (select.value && select.value !== "empty") {
    select.classList.add(`c-selected-${select.value.toLowerCase().replace('♯','#')}`);
  }
}

function setSlotContent(slotIndex, chord, addSeventh, addSecond, addFourth, addSus) { 
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
  
  let baseTones = [...chordTones[chord]]; // [Root, Natural Third, Fifth]
  const { majorArr } = getToggleArrays();
  const qualityState = majorArr[slotIndex];
  
  let finalNotesForDisplay = [];

  // 1. Root
  finalNotesForDisplay.push({ note: baseTones[0], type: 'root' });

  // 2. Handle Sus, 2nd, 3rd, 4th
  if (addSus) {
    // If sus, 3rd is omitted. Add 2nd and/or 4th if active.
    if (addSecond && chordSeconds[chord]) {
      finalNotesForDisplay.push({ note: chordSeconds[chord], type: '2nd' });
    }
    if (addFourth && chordFourths[chord]) { // Not "else if" - allow both 2 and 4 with sus
      finalNotesForDisplay.push({ note: chordFourths[chord], type: '4th' });
    }
  } else {
    // Not suspended: add 3rd (possibly altered by M/m toggle)
    let thirdNote = baseTones[1]; // Natural third
    if (chordAlternateThirds[chord]) {
      if (qualityState === 'major') thirdNote = chordAlternateThirds[chord]['major'];
      else if (qualityState === 'minor') thirdNote = chordAlternateThirds[chord]['minor'];
    }
    finalNotesForDisplay.push({ note: thirdNote, type: '3rd' });

    // If not sus, 2nd and 4th act as "add" tones.
    // Add 2nd (add2) - typically placed after root, before 3rd.
    if (addSecond && chordSeconds[chord]) {
      const rootIndex = finalNotesForDisplay.findIndex(n => n.type === 'root');
      finalNotesForDisplay.splice(rootIndex + 1, 0, { note: chordSeconds[chord], type: '2nd' });
    }
    // Add 4th (add4) - typically placed after 3rd.
    if (addFourth && chordFourths[chord]) {
      const thirdIndex = finalNotesForDisplay.findIndex(n => n.type === '3rd');
      if (thirdIndex !== -1) {
         finalNotesForDisplay.splice(thirdIndex + 1, 0, { note: chordFourths[chord], type: '4th' });
      } else { // Should not happen if not sus, but as a fallback
         finalNotesForDisplay.push({ note: chordFourths[chord], type: '4th'});
      }
    }
  }
  
  // 3. Fifth (always present unless the base chord definition changes)
  finalNotesForDisplay.push({ note: baseTones[2], type: '5th' });

  // 4. Seventh (added at the end)
  if (addSeventh && chordSevenths[chord]) {
    finalNotesForDisplay.push({ note: chordSevenths[chord], type: '7th' });
  }

  // Ensure notes are somewhat sorted for display (R, 2, 3/sus, 4, 5, 7)
  const noteOrder = { 'root': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5, '7th': 6 };
  finalNotesForDisplay.sort((a, b) => (noteOrder[a.type] || 99) - (noteOrder[b.type] || 99));


  let rectsHTML = finalNotesForDisplay.map(item => {
    const note = item.note;
    const typeClass = `note-${item.type}`; 
    const baseLetter = note.charAt(0);
    const colorClass = noteColorClass[note.replace('♭','b').replace('♯','#')] || noteColorClass[baseLetter];
    
    if (note.includes('♯')) return `<div class="note-rect ${typeClass} ${colorClass}">${baseLetter}<span class="accidental sharp">♯</span></div>`;
    if (note.includes('♭')) return `<div class="note-rect ${typeClass} ${colorClass}">${baseLetter}<span class="accidental flat">♭</span></div>`;
    return `<div class="note-rect ${typeClass} ${colorClass}">${note}</div>`;
  });
  
  noteRects.innerHTML = rectsHTML.join('');
}


function _createToggleFunction(type, updateBtnStatesFn) {
  return function(idx) {
    const arrays = getToggleArrays();
    const targetArray = arrays[`${type}Arr`];
    targetArray[idx] = !targetArray[idx];
    updateBtnStatesFn();
    const select = document.getElementById('slot' + idx).querySelector('.chord-select');
    setSlotColorAndStyle(idx, select, arrays.seventhArr[idx], arrays.secondArr[idx], arrays.fourthArr[idx], arrays.susArr[idx]);
    saveCurrentProgression();
    playChordPreview(idx);
  };
}

const toggleSeventh = _createToggleFunction('seventh', updateSeventhBtnStates);
const toggleSecond = _createToggleFunction('second', updateSecondBtnStates);
const toggleFourth = _createToggleFunction('fourth', updateFourthBtnStates);
const toggleSus = _createToggleFunction('sus', updateSusBtnStates);


function updateSeventhBtnStates() {
  const { seventhArr } = getToggleArrays();
  document.querySelectorAll('.seventh-btn').forEach((btn, idx) => btn.classList.toggle('active', seventhArr[idx]));
}
function updateSecondBtnStates() {
  const { secondArr } = getToggleArrays();
  document.querySelectorAll('.second-btn').forEach((btn, idx) => btn.classList.toggle('active', secondArr[idx]));
}
function updateFourthBtnStates() {
  const { fourthArr } = getToggleArrays();
  document.querySelectorAll('.fourth-btn').forEach((btn, idx) => btn.classList.toggle('active', fourthArr[idx]));
}
function updateSusBtnStates() {
  const { susArr } = getToggleArrays();
  document.querySelectorAll('.sus-btn').forEach((btn, idx) => btn.classList.toggle('active', susArr[idx]));
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
  const currentPair = Math.floor((rhythmStep % 8) / 2);
  const currentWhich = (rhythmStep % 8) % 2;
  const box = document.querySelector(`.bottom-rhythm-box[data-pair="${currentPair}"][data-which="${currentWhich}"]`);
  
  let isNextBoxInactive = false;
  if (currentWhich === 0 && box && box.classList.contains('active')) {
    const nextBox = document.querySelector(`.bottom-rhythm-box[data-pair="${currentPair}"][data-which="1"]`);
    isNextBoxInactive = nextBox && !nextBox.classList.contains('active');
  }

  if (box && box.classList.contains('active')) {
    if (currentSelect.value === "") {
      playBassDrum(isNextBoxInactive ? 0.38 : 0.19); 
    } else if (currentSelect.value !== "empty") {
      const chordName = currentSelect.value;
      const { seventhArr, secondArr, majorArr, fourthArr, susArr } = getToggleArrays(); 
      const addSeventh = seventhArr[currentSlotIdx];
      const addSecond = secondArr[currentSlotIdx];
      const qualityState = majorArr[currentSlotIdx];
      const addFourth = fourthArr[currentSlotIdx];
      const addSus = susArr[currentSlotIdx];
      
      let notesToPlay = [];
      const baseRhythmNotes = rhythmChordNotes[chordName]; 

      if (!baseRhythmNotes) return; // Chord not found in rhythm map

      // Root and Octave Root(s)
      if(baseRhythmNotes[0]) notesToPlay.push(baseRhythmNotes[0]);
      if(baseRhythmNotes[1]) notesToPlay.push(baseRhythmNotes[1]);
      if (baseRhythmNotes.length > 4 && baseRhythmNotes[4]) notesToPlay.push(baseRhythmNotes[4]);
      
      // Fifth
      if(baseRhythmNotes[3]) notesToPlay.push(baseRhythmNotes[3]);

      if (addSus) {
        if (addSecond && rhythmChordSecondNotes[chordName]) {
          notesToPlay.push(rhythmChordSecondNotes[chordName]);
        }
        if (addFourth && rhythmChordFourthNotes[chordName]) { // Not else if
          notesToPlay.push(rhythmChordFourthNotes[chordName]);
        }
      } else {
        let thirdNoteToPlay = baseRhythmNotes[2];
        if (chordAlternateThirds[chordName] && qualityState !== 'none') {
            thirdNoteToPlay = chordAlternateThirds[chordName][qualityState === 'major' ? 'majorNote' : 'minorNote'];
        }
        if(thirdNoteToPlay) notesToPlay.push(thirdNoteToPlay);

        if (addSecond && rhythmChordSecondNotes[chordName]) {
          notesToPlay.push(rhythmChordSecondNotes[chordName]);
        }
        if (addFourth && rhythmChordFourthNotes[chordName]) {
          notesToPlay.push(rhythmChordFourthNotes[chordName]);
        }
      }
      
      if (addSeventh && rhythmChordSeventhNotes[chordName]) {
        notesToPlay.push(rhythmChordSeventhNotes[chordName]);
      }
      
      playTriangleNotes(notesToPlay.filter(n => n), isNextBoxInactive); // Filter out any undefined notes
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
    setSlotColorAndStyle(i, select, false, false, false, false); 
    slot.classList.remove('enlarged');
    let img = slot.querySelector('.dash-img-slot');
    if (img) { img.src = restDashImgUrl; img.alt = "Rhythm Box Rest"; img.style.display = "block"; }
    slot.querySelector('.seventh-btn')?.classList.remove('active');
    slot.querySelector('.second-btn')?.classList.remove('active');
    slot.querySelector('.fourth-btn')?.classList.remove('active'); 
    slot.querySelector('.sus-btn')?.classList.remove('active'); 
  }
  document.querySelectorAll('.bottom-rhythm-box').forEach(box => box.classList.remove('active'));
  updateRhythmPictures();

  const currentToggleArrays = getToggleArrays();
  for (let i = 0; i < 4; i++) {
    currentToggleArrays.seventhArr[i] = false;
    currentToggleArrays.secondArr[i] = false;
    currentToggleArrays.fourthArr[i] = false; 
    currentToggleArrays.susArr[i] = false; 
    currentToggleArrays.majorArr[i] = 'none'; 
    _updateQualityButtonVisualForSlot(i, 'none'); 
  }
  updateSeventhBtnStates(); 
  updateSecondBtnStates();  
  updateFourthBtnStates(); 
  updateSusBtnStates(); 

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

async function playBassDrum(customDuration) {
  await ensureAudio(); 
  const duration = customDuration || 0.19; 
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

const soundProfiles = {
  sine: { duration: 0.4, attack: 0.04, hold: 0.2, release: 0.16, filterFreq: 3000, filterQ: 0.5, gain: 0.36, vibrato: false },
  triangle: { duration: 0.29, attack: 0.015, hold: 0.07, release: 0.2, filterFreq: 1200, filterQ: 1, gain: 0.38, vibrato: false },
  square: { duration: 0.25, attack: 0.005, hold: 0.02, release: 0.225, filterFreq: 900, filterQ: 2, gain: 0.30, vibrato: false },
  saw: { duration: 0.33, attack: 0.02, hold: 0.05, release: 0.26, filterFreq: 1600, filterQ: 1.5, gain: 0.28, pitchBend: true, bendAmount: 30, bendTime: 0.08, vibrato: false },
  voice: { duration: 0.5, attack: 0.08, hold: 0.3, release: 0.12, filterFreq: 1000, filterQ: 1, gain: 0.36, vibrato: true, vibratoFreq: 5, vibratoAmount: 4 }
};

async function playTriangleNotes(notes, extendDuration = false) {
  await ensureAudio(); 
  const profile = soundProfiles[currentWaveform];
  let durationMultiplier = extendDuration ? 2 : 1;
  
  notes.forEach((note, i) => {
    if (!note) return; 
    const freq = midiToFreq(note);
    if (!freq) return; 

    let osc, gain, lfo, lfoGain, filter;
    gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    
    // ... (rest of the playTriangleNotes sound synthesis logic remains the same) ...
    if (currentWaveform === "voice") {
      osc = ctx.createOscillator(); osc.setPeriodicWave(customVoiceWave); osc.frequency.value = freq;
      lfo = ctx.createOscillator(); lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(profile.vibratoFreq, ctx.currentTime); lfoGain.gain.setValueAtTime(profile.vibratoAmount, ctx.currentTime);
      lfo.connect(lfoGain); lfoGain.connect(osc.frequency); lfo.start();
      filter = ctx.createBiquadFilter(); filter.type = 'lowpass';
      filter.frequency.setValueAtTime(profile.filterFreq, ctx.currentTime); filter.Q.value = profile.filterQ;
      osc.connect(filter); filter.connect(gain);
      const attackTime = profile.attack, decayTime = 0.18, sustainLevel = profile.gain * 0.7, maxLevel = profile.gain * 1.0;
      gain.gain.linearRampToValueAtTime(maxLevel, ctx.currentTime + attackTime);
      gain.gain.linearRampToValueAtTime(sustainLevel, ctx.currentTime + attackTime + decayTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + profile.duration * durationMultiplier);
      gain.connect(masterGain); osc.start(ctx.currentTime + 0.01 * i);
      osc.stop(ctx.currentTime + profile.duration * durationMultiplier + 0.01 * i + 0.08);
      lfo.stop(ctx.currentTime + profile.duration * durationMultiplier + 0.01 * i + 0.08);
    } else if (currentWaveform === "saw") {
      osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = freq;
      if (profile.pitchBend) {
        osc.frequency.setValueAtTime(freq + profile.bendAmount, ctx.currentTime + 0.01 * i);
        osc.frequency.exponentialRampToValueAtTime(freq, ctx.currentTime + 0.01 * i + profile.bendTime);
      }
      const allpass = ctx.createBiquadFilter(); allpass.type = 'allpass';
      allpass.frequency.value = 800; allpass.Q.value = 5;
      filter = ctx.createBiquadFilter(); filter.type = 'lowpass';
      filter.frequency.setValueAtTime(profile.filterFreq, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(profile.filterFreq * 0.5, ctx.currentTime + profile.duration * durationMultiplier);
      filter.Q.value = profile.filterQ;
      osc.connect(filter); filter.connect(allpass); allpass.connect(gain);
      gain.gain.linearRampToValueAtTime(profile.gain, ctx.currentTime + profile.attack + 0.01 * i);
      gain.gain.setValueAtTime(profile.gain, ctx.currentTime + profile.attack + profile.hold + 0.01 * i);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + profile.duration * durationMultiplier + 0.01 * i);
      gain.connect(masterGain); osc.start(ctx.currentTime + 0.01 * i);
      osc.stop(ctx.currentTime + profile.duration * durationMultiplier + 0.01 * i);
    } else if (currentWaveform === "square") {
      osc = ctx.createOscillator(); osc.type = "square"; osc.frequency.value = freq;
      const highpass = ctx.createBiquadFilter(); highpass.type = 'highpass'; highpass.frequency.value = 80;
      filter = ctx.createBiquadFilter(); filter.type = 'lowpass';
      filter.frequency.setValueAtTime(profile.filterFreq * 2, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(profile.filterFreq, ctx.currentTime + profile.attack + profile.hold);
      filter.Q.value = profile.filterQ;
      osc.connect(highpass); highpass.connect(filter); filter.connect(gain);
      gain.gain.linearRampToValueAtTime(profile.gain * 1.2, ctx.currentTime + profile.attack + 0.01 * i);
      if (extendDuration) {
        gain.gain.exponentialRampToValueAtTime(profile.gain * 0.6, ctx.currentTime + profile.attack + profile.hold + 0.15 + 0.01 * i);
      } else {
        gain.gain.exponentialRampToValueAtTime(profile.gain * 0.5, ctx.currentTime + profile.attack + profile.hold + 0.05 + 0.01 * i);
      }
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + profile.duration * durationMultiplier + 0.01 * i);
      gain.connect(masterGain); osc.start(ctx.currentTime + 0.01 * i);
      osc.stop(ctx.currentTime + profile.duration * durationMultiplier + 0.01 * i);
    } else if (currentWaveform === "sine") {
      osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = freq;
      const harmonicOsc = ctx.createOscillator(); harmonicOsc.type = "sine"; harmonicOsc.frequency.value = freq * 2; 
      const harmonicGain = ctx.createGain(); harmonicGain.gain.value = 0.15; 
      filter = ctx.createBiquadFilter(); filter.type = 'lowpass';
      filter.frequency.setValueAtTime(profile.filterFreq, ctx.currentTime); filter.Q.value = profile.filterQ;
      osc.connect(filter); harmonicOsc.connect(harmonicGain); harmonicGain.connect(filter); filter.connect(gain);
      gain.gain.linearRampToValueAtTime(profile.gain, ctx.currentTime + profile.attack + 0.01 * i);
      gain.gain.setValueAtTime(profile.gain, ctx.currentTime + profile.attack + profile.hold * durationMultiplier + 0.01 * i);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + profile.duration * durationMultiplier + 0.01 * i);
      gain.connect(masterGain); osc.start(ctx.currentTime + 0.01 * i);
      osc.stop(ctx.currentTime + profile.duration * durationMultiplier + 0.01 * i);
      harmonicOsc.start(ctx.currentTime + 0.01 * i);
      harmonicOsc.stop(ctx.currentTime + profile.duration * durationMultiplier + 0.01 * i);
    } else { // Triangle (default/fallback)
      osc = ctx.createOscillator(); osc.type = "triangle"; osc.frequency.value = freq;
      filter = ctx.createBiquadFilter(); filter.type = 'lowpass';
      filter.frequency.setValueAtTime(profile.filterFreq, ctx.currentTime); filter.Q.value = profile.filterQ;
      osc.connect(filter); filter.connect(gain);
      gain.gain.linearRampToValueAtTime(profile.gain, ctx.currentTime + profile.attack + 0.01 * i);
      gain.gain.setValueAtTime(profile.gain, ctx.currentTime + profile.attack + profile.hold * durationMultiplier + 0.01 * i);
      gain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + profile.duration * durationMultiplier + 0.01 * i);
      gain.connect(masterGain); osc.start(ctx.currentTime + 0.01 * i);
      osc.stop(ctx.currentTime + profile.duration * durationMultiplier + 0.01 * i);
    }
  });
}

function midiToFreq(n) {
  if (!n) return null;
  const notes = {'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,'E':4,'F':5,'F#':6,'Gb':6,'G':7,'G#':8,'Ab':8,'A':9,'A#':10,'Bb':10,'B':11, 'F♯':6, 'G♯':8, 'B♭':10, 'E♭':3, 'A♭':8, 'C♯':1, 'D♭':1 };
  let noteName = n.slice(0, -1);
  let octaveStr = n.slice(-1);

  if (n.length > 1 && (n[1] === 'b' || n[1] === '♭' || n[1] === '#'|| n[1] === '♯')) {
    noteName = n.slice(0,2);
    octaveStr = n.slice(2);
  }
  const octave = parseInt(octaveStr);
  if (notes[noteName] === undefined || isNaN(octave)) return null;
  return 440 * Math.pow(2, (notes[noteName]+(octave-4)*12-9)/12);
}


function playChordPreview(idx) {
  if (isPlaying) return;
  const select = document.getElementById('slot' + idx).querySelector('.chord-select');
  const chordName = select.value;
  if (!chordName || chordName === "" || chordName === "empty") return;
  
  const { seventhArr, secondArr, majorArr, fourthArr, susArr } = getToggleArrays(); 
  const addSeventh = seventhArr[idx];
  const addSecond = secondArr[idx];
  const qualityState = majorArr[idx];
  const addFourth = fourthArr[idx];
  const addSus = susArr[idx];
  
  let notesToPlay = [];
  const baseRhythmNotes = rhythmChordNotes[chordName];
  if (!baseRhythmNotes) return;

  // Root and Octave Root(s)
  if(baseRhythmNotes[0]) notesToPlay.push(baseRhythmNotes[0]);
  if(baseRhythmNotes[1]) notesToPlay.push(baseRhythmNotes[1]);
  if (baseRhythmNotes.length > 4 && baseRhythmNotes[4]) notesToPlay.push(baseRhythmNotes[4]);
  
  // Fifth
  if(baseRhythmNotes[3]) notesToPlay.push(baseRhythmNotes[3]);

  if (addSus) {
    if (addSecond && rhythmChordSecondNotes[chordName]) {
      notesToPlay.push(rhythmChordSecondNotes[chordName]);
    }
    if (addFourth && rhythmChordFourthNotes[chordName]) { // Not else if
      notesToPlay.push(rhythmChordFourthNotes[chordName]);
    }
  } else {
    let thirdNoteToPlay = baseRhythmNotes[2];
    if (chordAlternateThirds[chordName] && qualityState !== 'none') {
        thirdNoteToPlay = chordAlternateThirds[chordName][qualityState === 'major' ? 'majorNote' : 'minorNote'];
    }
    if(thirdNoteToPlay) notesToPlay.push(thirdNoteToPlay);

    if (addSecond && rhythmChordSecondNotes[chordName]) {
      notesToPlay.push(rhythmChordSecondNotes[chordName]);
    }
    if (addFourth && rhythmChordFourthNotes[chordName]) {
      notesToPlay.push(rhythmChordFourthNotes[chordName]);
    }
  }
  
  if (addSeventh && rhythmChordSeventhNotes[chordName]) {
    notesToPlay.push(rhythmChordSeventhNotes[chordName]);
  }
  playTriangleNotes(notesToPlay.filter(n => n)); 
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
      const { seventhArr, secondArr, fourthArr, susArr } = getToggleArrays(); 
      setSlotColorAndStyle(idx, select, seventhArr[idx], secondArr[idx], fourthArr[idx], susArr[idx]); 
      saveCurrentProgression(); playChordPreview(idx);
    });
    // Initial call using default false states for buttons, setSlotColorAndStyle will use getToggleArrays for current states
    setSlotColorAndStyle(idx, select); 
  });

  document.querySelectorAll('.seventh-btn').forEach((btn, idx) => {
    btn.addEventListener('click', function() { toggleSeventh(idx); }); 
    btn.addEventListener('keydown', function(e) { if (e.key===" "||e.key==="Enter") { e.preventDefault(); toggleSeventh(idx); }});
  });
  document.querySelectorAll('.second-btn').forEach((btn, idx) => {
    btn.addEventListener('click', function() { toggleSecond(idx); });
    btn.addEventListener('keydown', function(e) { if (e.key===" "||e.key==="Enter") { e.preventDefault(); toggleSecond(idx); }});
  });
  document.querySelectorAll('.fourth-btn').forEach((btn, idx) => {
    btn.addEventListener('click', function() { toggleFourth(idx); });
    btn.addEventListener('keydown', function(e) { if (e.key===" "||e.key==="Enter") { e.preventDefault(); toggleFourth(idx); }});
  });
  document.querySelectorAll('.sus-btn').forEach((btn, idx) => {
    btn.addEventListener('click', function() { toggleSus(idx); });
    btn.addEventListener('keydown', function(e) { if (e.key===" "||e.key==="Enter") { e.preventDefault(); toggleSus(idx); }});
  });
  
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
  playPauseBtn.addEventListener('keydown', (e) => { if (e.key===" "||e.key==="Enter") {e.preventDefault(); togglePlay(e); }});


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
    btn.addEventListener('click', () => stepBpm(dir)); // Keep direct click for single steps
  });

  document.getElementById('clear').addEventListener('click', clearAll);
  document.getElementById('clear').addEventListener('touchstart', (e)=>{e.preventDefault();clearAll();},{passive:false});
   document.getElementById('clear').addEventListener('keydown', (e) => { if (e.key===" "||e.key==="Enter") {e.preventDefault();clearAll();}});


  updateRhythmPictures();
  for (let i = 0; i < slotIds.length; i++) unhighlightSlot(i);
  for (let i = 0; i < 4; i++) unhighlightPicture(i);
  setPlaying(false); 

  saveCurrentProgression(); 
  updateSeventhBtnStates();
  updateSecondBtnStates();
  updateFourthBtnStates(); 
  updateSusBtnStates(); 
  _updateAllQualityButtonVisualsCurrentToggle(); 
});

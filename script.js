// --- Sound Synthesis Variables ---
let ctx = null, masterGain = null, compressor = null;
let customVoiceWave = null;
const waveforms = ['sine', 'triangle', 'square', 'saw', 'voice'];
let currentWaveformIndex = 1;
let currentWaveform = waveforms[currentWaveformIndex];

// --- Key Selection Variables ---
const musicalKeys = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
let currentKeyIndex = 0; 
let currentMusicalKey = musicalKeys[currentKeyIndex];

// --- Chord Data for Each Key ---
const keyChordMap = {
  'C': [ { value: 'C',  display: 'C / I' }, { value: 'Dm', display: 'Dm / ii' }, { value: 'Em', display: 'Em / iii' }, { value: 'F',  display: 'F / IV' }, { value: 'G',  display: 'G / V' }, { value: 'Am', display: 'Am / vi' }, { value: 'Bb', display: 'Bb / bVII' } ],
  'Db': [ { value: 'Db', display: 'Db / I' }, { value: 'Ebm',display: 'Ebm / ii' }, { value: 'Fm', display: 'Fm / iii' }, { value: 'Gb', display: 'Gb / IV' }, { value: 'Ab', display: 'Ab / V' }, { value: 'Bbm',display: 'Bbm / vi' }, { value: 'Cb', display: 'Cb / bVII' } ],
  'D': [ { value: 'D',  display: 'D / I' }, { value: 'Em', display: 'Em / ii' }, { value: 'F#m',display: 'F#m / iii' }, { value: 'G',  display: 'G / IV' }, { value: 'A',  display: 'A / V' }, { value: 'Bm', display: 'Bm / vi' }, { value: 'C',  display: 'C / bVII' } ],
  'Eb': [ { value: 'Eb', display: 'Eb / I' }, { value: 'Fm', display: 'Fm / ii' }, { value: 'Gm', display: 'Gm / iii' }, { value: 'Ab', display: 'Ab / IV' }, { value: 'Bb', display: 'Bb / V' }, { value: 'Cm', display: 'Cm / vi' }, { value: 'Db', display: 'Db / bVII' } ],
  'E': [ { value: 'E',  display: 'E / I' }, { value: 'F#m',display: 'F#m / ii' }, { value: 'G#m',display: 'G#m / iii' }, { value: 'A',  display: 'A / IV' }, { value: 'B',  display: 'B / V' }, { value: 'C#m',display: 'C#m / vi' }, { value: 'D',  display: 'D / bVII' } ],
  'F': [ { value: 'F',  display: 'F / I' }, { value: 'Gm', display: 'Gm / ii' }, { value: 'Am', display: 'Am / iii' }, { value: 'Bb', display: 'Bb / IV' }, { value: 'C',  display: 'C / V' }, { value: 'Dm', display: 'Dm / vi' }, { value: 'Eb', display: 'Eb / bVII' } ],
  'Gb': [ { value: 'Gb', display: 'Gb / I' }, { value: 'Abm',display: 'Abm / ii' }, { value: 'Bbm',display: 'Bbm / iii' }, { value: 'Cb', display: 'Cb / IV' },  { value: 'Db', display: 'Db / V' }, { value: 'Ebm',display: 'Ebm / vi' }, { value: 'Fb', display: 'Fb / bVII' } ],
  'G': [ { value: 'G',  display: 'G / I' }, { value: 'Am', display: 'Am / ii' }, { value: 'Bm', display: 'Bm / iii' }, { value: 'C',  display: 'C / IV' }, { value: 'D',  display: 'D / V' }, { value: 'Em', display: 'Em / vi' }, { value: 'F',  display: 'F / bVII' } ],
  'Ab': [ { value: 'Ab', display: 'Ab / I' }, { value: 'Bbm',display: 'Bbm / ii' }, { value: 'Cm', display: 'Cm / iii' }, { value: 'Db', display: 'Db / IV' }, { value: 'Eb', display: 'Eb / V' }, { value: 'Fm', display: 'Fm / vi' }, { value: 'Gb', display: 'Gb / bVII' } ],
  'A': [ { value: 'A',  display: 'A / I' }, { value: 'Bm', display: 'Bm / ii' }, { value: 'C#m',display: 'C#m / iii' }, { value: 'D',  display: 'D / IV' }, { value: 'E',  display: 'E / V' }, { value: 'F#m',display: 'F#m / vi' }, { value: 'G',  display: 'G / bVII' } ],
  'Bb': [ { value: 'Bb', display: 'Bb / I' }, { value: 'Cm', display: 'Cm / ii' }, { value: 'Dm', display: 'Dm / iii' }, { value: 'Eb', display: 'Eb / IV' }, { value: 'F',  display: 'F / V' }, { value: 'Gm', display: 'Gm / vi' }, { value: 'Ab', display: 'Ab / bVII' } ],
  'B': [ { value: 'B',  display: 'B / I' }, { value: 'C#m',display: 'C#m / ii' }, { value: 'D#m',display: 'D#m / iii' }, { value: 'E',  display: 'E / IV' }, { value: 'F#', display: 'F# / V' }, { value: 'G#m',display: 'G#m / vi' }, { value: 'A',  display: 'A / bVII' } ]
};

// A/B/C/D toggle variables
let currentToggle = 'A'; // Represents the progression whose data is loaded in the UI
let progressionA = ['', '', '', ''], progressionB = ['', '', '', ''], progressionC = ['', '', '', ''], progressionD = ['', '', '', '']; 
let rhythmBoxesA = Array(8).fill(false), rhythmBoxesB = Array(8).fill(false), rhythmBoxesC = Array(8).fill(false), rhythmBoxesD = Array(8).fill(false); 

// Chord modifier states
let seventhA = [false, false, false, false], seventhB = [false, false, false, false], seventhC = [false, false, false, false], seventhD = [false, false, false, false]; 
let secondA = [false, false, false, false], secondB = [false, false, false, false], secondC = [false, false, false, false], secondD = [false, false, false, false]; 
let fourthA = [false, false, false, false], fourthB = [false, false, false, false], fourthC = [false, false, false, false], fourthD = [false, false, false, false]; 
let susA = [false, false, false, false], susB = [false, false, false, false], susC = [false, false, false, false], susD = [false, false, false, false];
let majSeventhA = [false, false, false, false], majSeventhB = [false, false, false, false], majSeventhC = [false, false, false, false], majSeventhD = [false, false, false, false];
let majorA = ['none', 'none', 'none', 'none'], majorB = ['none', 'none', 'none', 'none'], majorC = ['none', 'none', 'none', 'none'], majorD = ['none', 'none', 'none', 'none'];

// --- State Variables for Linking Progressions ---
let progressionLinkStates = { A: false, B: false, C: false, D: false };
let linkedProgressionSequence = []; 
let currentLinkedProgressionIndex = 0; 

const chordTypes = {
  'C': 'major', 'Dm': 'minor', 'Em': 'minor', 'F': 'major', 'G': 'major', 'Am': 'minor', 'Bb': 'major',
  'Db': 'major', 'Ebm': 'minor', 'Fm': 'minor', 'Gb': 'major', 'Ab': 'major', 'Bbm': 'minor', 'Cb': 'major',
  'D': 'major', 'F#m': 'minor', 'Bm': 'minor', 
  'Eb': 'major', 'Gm': 'minor', 'Cm': 'minor',
  'E': 'major', 'G#m': 'minor', 'C#m': 'minor',
  'Fb': 'major', 'Abm': 'minor', 
  'B': 'major', 'D#m': 'minor', 'F#': 'major', 'A': 'major' 
};

const chordAlternateThirds = {
  'C':  { 'major': 'E', 'minor': 'E♭', 'majorNote': 'E4', 'minorNote': 'Eb4' },
  'Dm': { 'major': 'F♯','minor': 'F',  'majorNote': 'F#4','minorNote': 'F4'  },
  'Em': { 'major': 'G♯','minor': 'G',  'majorNote': 'G#4','minorNote': 'G4'  },
  'F':  { 'major': 'A', 'minor': 'A♭', 'majorNote': 'A4', 'minorNote': 'Ab4' },
  'G':  { 'major': 'B', 'minor': 'B♭', 'majorNote': 'B4', 'minorNote': 'Bb4' },
  'Am': { 'major': 'C♯','minor': 'C',  'majorNote': 'C#5','minorNote': 'C5'  },
  'Bb': { 'major': 'D', 'minor': 'D♭', 'majorNote': 'D4', 'minorNote': 'Db4' },
  'Db': { 'major': 'F', 'minor': 'F♭', 'majorNote': 'F4', 'minorNote': 'Fb4' }, 
  'Ebm':{ 'major': 'G', 'minor': 'G♭', 'majorNote': 'G4', 'minorNote': 'Gb4' },
  'Fm': { 'major': 'A', 'minor': 'A♭', 'majorNote': 'A4', 'minorNote': 'Ab4' },
  'Gb': { 'major': 'B♭','minor': 'B♭♭','majorNote': 'Bb4','minorNote': 'Bbb4'}, 
  'Ab': { 'major': 'C', 'minor': 'C♭', 'majorNote': 'C5', 'minorNote': 'Cb5' }, 
  'Bbm':{ 'major': 'D', 'minor': 'D♭', 'majorNote': 'D4', 'minorNote': 'Db4' },
  'Cb': { 'major': 'E♭','minor': 'E♭♭','majorNote': 'Eb4','minorNote': 'Ebb4'}, 
  'D':  { 'major': 'F♯','minor': 'F',  'majorNote': 'F#4','minorNote': 'F4'  },
  'F#m':{ 'major': 'A♯','minor': 'A',  'majorNote': 'A#4','minorNote': 'A4'  },
  'A':  { 'major': 'C♯','minor': 'C',  'majorNote': 'C#5','minorNote': 'C5'  },
  'Bm': { 'major': 'D♯','minor': 'D',  'majorNote': 'D#4','minorNote': 'D4'  },
  'Eb': { 'major': 'G', 'minor': 'G♭', 'majorNote': 'G4', 'minorNote': 'Gb4' },
  'Gm': { 'major': 'B', 'minor': 'B♭', 'majorNote': 'B4', 'minorNote': 'Bb4' },
  'Cm': { 'major': 'E', 'minor': 'E♭', 'majorNote': 'E5', 'minorNote': 'Eb5' },
  'E':  { 'major': 'G♯','minor': 'G',  'majorNote': 'G#4','minorNote': 'G4'  },
  'G#m':{ 'major': 'B♯','minor': 'B',  'majorNote': 'B#4','minorNote': 'B4'  }, 
  'C#m':{ 'major': 'E♯','minor': 'E',  'majorNote': 'E#5','minorNote': 'E5'  }, 
  'B':  { 'major': 'D♯','minor': 'D',  'majorNote': 'D#5','minorNote': 'D5'  },
  'D#m':{ 'major': 'F♯♯','minor':'F♯','majorNote': 'F##5','minorNote':'F#5'}, 
  'Fb': { 'major': 'A♭','minor': 'A♭♭','majorNote': 'Ab4','minorNote': 'Abb4'}, 
  'F#': { 'major': 'A♯','minor': 'A',  'majorNote': 'A#4','minorNote': 'A4'  },
  'Abm':{ 'major': 'C', 'minor': 'C♭', 'majorNote': 'C5', 'minorNote': 'Cb4' } 
};

const chordTones = { 
  'C': ['C', 'E', 'G'], 'Dm': ['D', 'F', 'A'], 'Em': ['E', 'G', 'B'], 'F': ['F', 'A', 'C'], 'G': ['G', 'B', 'D'], 'Am': ['A', 'C', 'E'], 'Bb': ['B♭', 'D', 'F'],
  'Db': ['D♭', 'F', 'A♭'], 'Ebm': ['E♭', 'G♭', 'B♭'], 'Fm': ['F', 'A♭', 'C'], 'Gb': ['G♭', 'B♭', 'D♭'], 'Ab': ['A♭', 'C', 'E♭'], 'Bbm': ['B♭', 'D♭', 'F'], 'Cb': ['C♭', 'E♭', 'G♭'],
  'D': ['D', 'F♯', 'A'], 'F#m': ['F♯', 'A', 'C♯'], 'Bm': ['B', 'D', 'F♯'],
  'Eb': ['E♭', 'G', 'B♭'], 'Gm': ['G', 'B♭', 'D'], 'Cm': ['C', 'E♭', 'G'],
  'E': ['E', 'G♯', 'B'], 'G#m': ['G♯', 'B', 'D♯'], 'C#m': ['C♯', 'E', 'G♯'],
  'Fb': ['F♭', 'A♭', 'C♭'], 'Abm': ['A♭', 'C♭', 'E♭'], 
  'B': ['B', 'D♯', 'F♯'], 'D#m': ['D♯', 'F♯', 'A♯'], 'F#': ['F♯', 'A♯', 'C♯'], 'A': ['A', 'C♯', 'E']
};

const chordSevenths = { 
  'C': 'B♭', 'Dm': 'C', 'Em': 'D', 'F': 'E♭', 'G': 'F', 'Am': 'G', 'Bb': 'A♭',
  'Db': 'C♭', 'Ebm': 'D♭', 'Fm': 'E♭', 'Gb': 'F♭', 'Ab': 'G♭', 'Bbm': 'A♭', 'Cb': 'B♭♭',
  'D': 'C', 'F#m': 'E', 'Bm': 'A',
  'Eb': 'D♭', 'Gm': 'F', 'Cm': 'B♭',
  'E': 'D', 'G#m': 'F♯', 'C#m': 'B',
  'Fb': 'E♭♭', 'Abm': 'G♭', 
  'B': 'A', 'D#m': 'C♯', 'F#': 'E', 'A': 'G'
};
const chordMajorSevenths = { 
  'C': 'B', 'Dm': 'C♯', 'Em': 'D♯', 'F': 'E', 'G': 'F♯', 'Am': 'G♯', 'Bb': 'A',
  'Db': 'C', 'Ebm': 'D', 'Fm': 'E', 'Gb': 'F', 'Ab': 'G', 'Bbm': 'A', 'Cb': 'B♭',
  'D': 'C♯', 'F#m': 'E♯', 'Bm': 'A♯',
  'Eb': 'D', 'Gm': 'F♯', 'Cm': 'B',
  'E': 'D♯', 'G#m': 'F♯♯', 'C#m': 'B♯',
  'Fb': 'E♭', 'Abm': 'G', 
  'B': 'A♯', 'D#m': 'C♯♯', 'F#': 'E♯', 'A': 'G♯'
};
const chordSeconds = { 
  'C': 'D', 'Dm': 'E', 'Em': 'F♯', 'F': 'G', 'G': 'A', 'Am': 'B', 'Bb': 'C',
  'Db': 'E♭', 'Ebm': 'F', 'Fm': 'G', 'Gb': 'A♭', 'Ab': 'B♭', 'Bbm': 'C', 'Cb': 'D♭',
  'D': 'E', 'F#m': 'G♯', 'Bm': 'C♯',
  'Eb': 'F', 'Gm': 'A', 'Cm': 'D',
  'E': 'F♯', 'G#m': 'A♯', 'C#m': 'D♯',
  'Fb': 'G♭', 'Abm': 'B♭', 
  'B': 'C♯', 'D#m': 'E♯', 'F#': 'G♯', 'A': 'B'
};
const chordFourths = { 
  'C': 'F', 'Dm': 'G', 'Em': 'A', 'F': 'B♭', 'G': 'C', 'Am': 'D', 'Bb': 'E♭',
  'Db': 'G♭', 'Ebm': 'A♭', 'Fm': 'B♭', 'Gb': 'C♭', 'Ab': 'D♭', 'Bbm': 'E♭', 'Cb': 'F♭',
  'D': 'G', 'F#m': 'B', 'Bm': 'E',
  'Eb': 'A♭', 'Gm': 'C', 'Cm': 'F',
  'E': 'A', 'G#m': 'C♯', 'C#m': 'F♯',
  'Fb': 'B♭♭', 'Abm': 'D♭', 
  'B': 'E', 'D#m': 'G♯', 'F#': 'B', 'A': 'D'
};

const rhythmChordNotes = { 
  'C':  ['C3', 'C4', 'E4', 'G4', 'C5'], 'Dm': ['D3', 'D4', 'F4', 'A4', 'D5'], 'Em': ['E3', 'E4', 'G4', 'B4', 'E5'], 'F':  ['F3', 'F4', 'A4', 'C5', 'F5'],  'G':  ['G3', 'G4', 'B4', 'D5', 'G5'], 'Am': ['A3', 'A4', 'C5', 'E5', 'A5'], 'Bb': ['Bb2', 'Bb3', 'D4', 'F4', 'Bb4'],
  'Db': ['Db3','Db4','F4','Ab4','Db5'], 'Ebm':['Eb3','Eb4','Gb4','Bb4','Eb5'], 'Fm': ['F3','F4','Ab4','C5','F5'], 'Gb': ['Gb3', 'Gb4', 'Bb3', 'Db4', 'Gb5'], 'Ab': ['Ab2','Ab3','C4','Eb4','Ab4'], 'Bbm':['Bb2','Bb3','Db4','F4','Bb4'], 'Cb': ['Cb3','Cb4','Eb4','Gb4','Cb5'],
  'D':  ['D3', 'D4', 'F#4', 'A4', 'D5'], 'F#m':['F#3','F#4','A4','C#5','F#5'], 'Bm': ['B2','B3','D4','F#4','B4'],
  'Eb': ['Eb3','Eb4','G4','Bb4','Eb5'], 'Gm': ['G3','G4','Bb4','D5','G5'], 'Cm': ['C3','C4','Eb4','G4','C5'],
  'E':  ['E3', 'E4', 'G#4', 'B4', 'E5'], 'G#m':['G#3','G#4','B4','D#5','G#5'], 'C#m':['C#3','C#4','E4','G#4','C#5'],
  'Fb': ['Fb3','Fb4','Ab4','Cb4','Fb5'], 'Abm':['Ab2','Ab3','Cb4','Eb4','Ab4'], 
  'B':  ['B2', 'B3', 'D#4', 'F#4', 'B4'], 'D#m':['D#3','D#4','F#4','A#4','D#5'], 'F#': ['F#3','F#4','A#4','C#5','F#5'], 'A': ['A2','A3','C#4','E4','A4']
};
const rhythmChordSeventhNotes = { 
  'C': 'Bb4', 'Dm': 'C5', 'Em': 'D5', 'F': 'Eb5', 'G': 'F5', 'Am': 'G4', 'Bb': 'Ab4',
  'Db':'Cb4', 'Ebm':'Db5', 'Fm':'Eb5', 'Gb':'Fb5', 'Ab':'Gb4', 'Bbm':'Ab4', 'Cb':'Bbb4',
  'D': 'C5', 'F#m':'E5', 'Bm':'A4',
  'Eb':'Db5', 'Gm':'F5', 'Cm':'Bb4',
  'E': 'D5', 'G#m':'F#5', 'C#m':'B4',
  'Fb':'Ebb5', 'Abm': 'Gb4', 
  'B': 'A4', 'D#m':'C#5', 'F#':'E5', 'A':'G4'
};
const rhythmChordMajorSeventhNotes = { 
  'C': 'B4', 'Dm': 'C#5', 'Em': 'D#5', 'F': 'E5', 'G': 'F#4', 'Am': 'G#4', 'Bb': 'A4',
  'Db':'C5', 'Ebm':'D5', 'Fm':'E5', 'Gb':'F4', 'Ab':'G4', 'Bbm':'A4', 'Cb':'Bb4',
  'D': 'C#5', 'F#m':'E#5', 'Bm':'A#4', 
  'Eb':'D5', 'Gm':'F#5', 'Cm':'B4',
  'E': 'D#5', 'G#m':'F##5', 'C#m':'B#5', 
  'Fb':'Eb5', 'Abm': 'G4', 
  'B': 'A#4', 'D#m':'C##5', 'F#':'E#5', 'A':'G#4' 
};
const rhythmChordSecondNotes = {
  'C': 'D4', 'Dm': 'E4', 'Em': 'F#4', 'F': 'G4', 'G': 'A4', 'Am': 'B4', 'Bb': 'C4',
  'Db':'Eb4', 'Ebm':'F4', 'Fm':'G4', 'Gb':'Ab4', 'Ab':'Bb4', 'Bbm':'C4', 'Cb':'Db4',
  'D': 'E4', 'F#m':'G#4', 'Bm':'C#4',
  'Eb':'F4', 'Gm':'A4', 'Cm':'D4',
  'E': 'F#4', 'G#m':'A#4', 'C#m':'D#4',
  'Fb':'Gb4', 'Abm': 'Bb3', 
  'B': 'C#4', 'D#m':'E#4', 'F#':'G#4', 'A':'B3' 
};
const rhythmChordFourthNotes = {
  'C': 'F4', 'Dm': 'G4', 'Em': 'A4', 'F': 'Bb4', 'G': 'C5', 'Am': 'D5', 'Bb': 'Eb4',
  'Db':'Gb4', 'Ebm':'Ab4', 'Fm':'Bb4', 'Gb':'Cb4', 'Ab':'Db5', 'Bbm':'Eb4', 'Cb':'Fb4',
  'D': 'G4', 'F#m':'B4', 'Bm':'E4',
  'Eb':'Ab4', 'Gm':'C5', 'Cm':'F4',
  'E': 'A4', 'G#m':'C#5', 'C#m':'F#4',
  'Fb':'Bbb4', 'Abm': 'Db5', 
  'B': 'E4', 'D#m':'G#4', 'F#':'B3', 'A':'D4' 
};

const noteColorClass = {
  'C': 'note-C', 'D': 'note-D', 'E': 'note-E', 'F': 'note-F', 'G': 'note-G', 'A': 'note-A', 'B': 'note-B',
  'F♯': 'note-F', 'G♯': 'note-G', 'B♭': 'note-B', 'E♭': 'note-E', 'A♭': 'note-A', 'C♯': 'note-C', 'D♭': 'note-D',
  'F#': 'note-F', 'G#': 'note-G', 'Bb': 'note-B', 'Eb': 'note-E', 'Ab': 'note-A', 'C#': 'note-C', 'Db': 'note-D', 
  'Cb': 'note-B', 'Fb': 'note-E', 
  'Abm': 'note-A', 'Ebm': 'note-E', 'Bbm': 'note-B', 'F#m': 'note-F', 'C#m': 'note-C', 'G#m': 'note-G', 'D#m': 'note-D' 
};

const restDashImgUrl = "https://visualmusicalminds.github.io/images/CartoonRhythmBox5.svg";
const dashImgUrl = "https://visualmusicalminds.github.io/images/CartoonRhythmBox1.svg";
const rhythmBox2 = "https://visualmusicalminds.github.io/images/CartoonRhythmBox2.svg";
const rhythmBox3 = "https://visualmusicalminds.github.io/images/CartoonRhythmBox3.svg";
const rhythmBox4 = "https://visualmusicalminds.github.io/images/CartoonRhythmBox4.svg";


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

// Fetches all data for a given progression letter (A, B, C, or D)
function getProgressionData(progLetter) {
  switch(progLetter) {
    case 'A': return { p: progressionA, r: rhythmBoxesA, s7: seventhA, s2: secondA, s4: fourthA, sus: susA, maj7: majSeventhA, m: majorA };
    case 'B': return { p: progressionB, r: rhythmBoxesB, s7: seventhB, s2: secondB, s4: fourthB, sus: susB, maj7: majSeventhB, m: majorB };
    case 'C': return { p: progressionC, r: rhythmBoxesC, s7: seventhC, s2: secondC, s4: fourthC, sus: susC, maj7: majSeventhC, m: majorC };
    case 'D': return { p: progressionD, r: rhythmBoxesD, s7: seventhD, s2: secondD, s4: fourthD, sus: susD, maj7: majSeventhD, m: majorD };
    default:  
      // Fallback to the current master toggle if an invalid letter is somehow passed
      // console.warn("Invalid progLetter for getProgressionData:", progLetter, "defaulting to currentToggle:", currentToggle);
      return getProgressionData(currentToggle); 
  }
}


function saveCurrentProgression() {
  // Saves the DOM state (rhythm, modifiers) to the arrays of the currentToggle
  const currentData = getProgressionData(currentToggle);
  if (!currentData) return;

  const rhythmBoxStates = Array.from(document.querySelectorAll('.bottom-rhythm-box')).map(box => box.classList.contains('active'));
  currentData.r.splice(0, currentData.r.length, ...rhythmBoxStates);

  const modifierClasses = ['.seventh-btn', '.second-btn', '.fourth-btn', '.sus-btn', '.maj-seventh-btn'];
  const modifierArrays = [currentData.s7, currentData.s2, currentData.s4, currentData.sus, currentData.maj7];

  modifierClasses.forEach((className, i) => {
    const states = Array.from(document.querySelectorAll(className)).map(btn => btn.classList.contains('active'));
    modifierArrays[i].splice(0, modifierArrays[i].length, ...states);
  });
  
  // Save M/m states
  const majorStates = [];
  for(let i=0; i<4; i++) {
      majorStates.push(currentData.m[i]); // Already points to the correct majorA, majorB etc.
  }
  currentData.m.splice(0, currentData.m.length, ...majorStates);
}


function _updateQualityButtonVisualForSlot(idx, state) {
    const slot = document.getElementById('slot' + idx);
    if (!slot) return;
    const qualityBtn = slot.querySelector('.quality-toggle-btn');
    if (qualityBtn) {
        if (state === 'minor') qualityBtn.textContent = 'm';
        else qualityBtn.textContent = 'M'; 
        qualityBtn.classList.toggle('quality-active', state === 'major' || state === 'minor');
    }
}

function loadProgression(progLetter) {
  const dataToLoad = getProgressionData(progLetter);
  if (!dataToLoad) return;

  const { p, r, s7, s2, s4, sus, maj7, m } = dataToLoad;

  updateChordDropdowns(); // Ensure dropdowns have options for currentMusicalKey

  document.querySelectorAll('.chord-select').forEach((select, idx) => {
    const storedChord = p[idx] || "";
    select.value = storedChord; 
    setSlotColorAndStyle(idx, select, storedChord, s7[idx], s2[idx], s4[idx], sus[idx], maj7[idx]); 
  });
  document.querySelectorAll('.bottom-rhythm-box').forEach((box, idx) => box.classList.toggle('active', r[idx]));
  
  // Update all modifier button visuals based on the loaded progression's state
  updateSeventhBtnStates(s7); 
  updateSecondBtnStates(s2); 
  updateFourthBtnStates(s4); 
  updateSusBtnStates(sus); 
  updateMajSeventhBtnStates(maj7);
  
  m.forEach((state, idx) => _updateQualityButtonVisualForSlot(idx, state || 'none')); 
  updateRhythmPictures();
}

function switchToggle(toggle) {
  saveCurrentProgression();

  currentToggle = toggle;
  document.querySelectorAll('.abcd-toggle-btn').forEach(btn => btn.classList.remove('abcd-active'));
  document.getElementById('toggle' + toggle).classList.add('abcd-active');
  loadProgression(toggle);

  if (isPlaying) { 
    slotHighlightStep = 0;
    rhythmStep = 0;
    pictureHighlightStep = 0;
    currentLinkedProgressionIndex = 0;
    startMainAnimation();
  }
}


function toggleMajorMinor(idx) {
  const arrays = getProgressionData(currentToggle);
  const slot = document.getElementById('slot' + idx);
  const select = slot.querySelector('.chord-select');
  const chord = arrays.p[idx];

  if (!chord || chord === "" || chord === "empty") {
    arrays.m[idx] = 'none';
    _updateQualityButtonVisualForSlot(idx, 'none');
    return;
  }

  // Cycle: none → major → minor → none ...
  if (arrays.m[idx] === 'none') {
    arrays.m[idx] = 'major';
  } else if (arrays.m[idx] === 'major') {
    arrays.m[idx] = 'minor';
  } else if (arrays.m[idx] === 'minor') {
    arrays.m[idx] = 'none';
  } else {
    arrays.m[idx] = 'major'; // fallback
  }

  _updateQualityButtonVisualForSlot(idx, arrays.m[idx]);

  setSlotColorAndStyle(
    idx,
    select,
    chord,
    arrays.s7[idx],
    arrays.s2[idx],
    arrays.s4[idx],
    arrays.sus[idx],
    arrays.maj7[idx]
  );
  saveCurrentProgression();
  playChordPreview(idx);
}

function _updateQualityButtonVisualForSlot(idx, state) {
  const slot = document.getElementById('slot' + idx);
  if (!slot) return;
  const qualityBtn = slot.querySelector('.quality-toggle-btn');
  if (qualityBtn) {
    if (state === 'minor') qualityBtn.textContent = 'm';
    else qualityBtn.textContent = 'M';
    qualityBtn.classList.toggle('quality-active', state === 'major' || state === 'minor');
  }
}

function setSlotColorAndStyle(slotIndex, selectElement, chordToDisplay, addSeventhArg, addSecondArg, addFourthArg, addSusArg, addMajSeventhArg) { 
  const currentProgData = getProgressionData(currentToggle); 

  const addSeventh = (typeof addSeventhArg === 'boolean') ? addSeventhArg : currentProgData.s7[slotIndex];
  const addSecond = (typeof addSecondArg === 'boolean') ? addSecondArg : currentProgData.s2[slotIndex];
  const addFourth = (typeof addFourthArg === 'boolean') ? addFourthArg : currentProgData.s4[slotIndex];
  const addSus = (typeof addSusArg === 'boolean') ? addSusArg : currentProgData.sus[slotIndex];
  const addMajSeventh = (typeof addMajSeventhArg === 'boolean') ? addMajSeventhArg : currentProgData.maj7[slotIndex];
  
  setSlotContent(slotIndex, chordToDisplay, addSeventh, addSecond, addFourth, addSus, addMajSeventh); 
  
  selectElement.className = 'chord-select'; 
  if (chordToDisplay && chordToDisplay !== "empty" && chordToDisplay !== "") {
    let chordClass = `c-selected-${chordToDisplay.toLowerCase()}`;
    chordClass = chordClass.replace('♭', 'flat').replace('♯', 'sharp').replace('#', 'sharp'); 
    selectElement.classList.add(chordClass);
  }
}

function setSlotContent(slotIndex, chord, addSeventh, addSecond, addFourth, addSus, addMajSeventh) { 
  const slot = document.getElementById('slot' + slotIndex);
  const noteRects = slot.querySelector('.note-rects');
  let img = slot.querySelector('.dash-img-slot');
  noteRects.innerHTML = '';
  if (chord === "" || chord === "empty") { 
    if (!img) { img = document.createElement('img'); img.className = 'dash-img-slot'; slot.insertBefore(img, slot.querySelector('.chord-select')); }
    img.src = restDashImgUrl; img.alt = "Rhythm Box Rest"; img.style.display = "block"; return;
  } else { if (img) img.style.display = "none"; }
  slot.className = 'slot-box'; 
  if (!chordTones[chord]) { console.warn("Chord tones not defined for:", chord); noteRects.innerHTML = `<div class="note-rect" style="background: #777; color:white; font-size:0.8em; padding: 5px;">${chord}?</div>`; return; }
  let baseTones = [...chordTones[chord]]; 
  const { m: majorArr } = getProgressionData(currentToggle); 
  const qualityState = majorArr[slotIndex];
  let finalNotesForDisplay = [];
  finalNotesForDisplay.push({ note: baseTones[0], type: 'root' });
  if (addSus) {
    if (addSecond && chordSeconds[chord]) finalNotesForDisplay.push({ note: chordSeconds[chord], type: '2nd' }); else if (addSecond) console.warn(`2nd not defined for sus chord ${chord}`);
    if (addFourth && chordFourths[chord]) finalNotesForDisplay.push({ note: chordFourths[chord], type: '4th' }); else if (addFourth) console.warn(`4th not defined for sus chord ${chord}`);
  } else {
    let thirdNote = baseTones[1]; 
    if (chordAlternateThirds[chord] && (qualityState === 'major' || qualityState === 'minor')) {
        thirdNote = chordAlternateThirds[chord][qualityState]; 
    } else if (qualityState === 'none' && chordTypes[chord]) { 
        const defaultQuality = chordTypes[chord];
        if (chordAlternateThirds[chord] && (defaultQuality === 'major' || defaultQuality === 'minor')) {
            thirdNote = chordAlternateThirds[chord][defaultQuality];
        }
    }
    finalNotesForDisplay.push({ note: thirdNote, type: '3rd' });

    if (addSecond && chordSeconds[chord]) { const rootIndex = finalNotesForDisplay.findIndex(n => n.type === 'root'); finalNotesForDisplay.splice(rootIndex + 1, 0, { note: chordSeconds[chord], type: '2nd' }); } else if (addSecond) console.warn(`2nd not defined for chord ${chord}`);
    if (addFourth && chordFourths[chord]) { const thirdIndex = finalNotesForDisplay.findIndex(n => n.type === '3rd'); finalNotesForDisplay.splice(thirdIndex !== -1 ? thirdIndex + 1 : finalNotesForDisplay.length -1 , 0, { note: chordFourths[chord], type: '4th' }); } else if (addFourth) console.warn(`4th not defined for chord ${chord}`);
  }
  if (baseTones[2]) finalNotesForDisplay.push({ note: baseTones[2], type: '5th' }); 
  if (addSeventh) { 
    const seventhNote = addMajSeventh && chordMajorSevenths[chord] ? chordMajorSevenths[chord] : chordSevenths[chord];
    if (seventhNote) finalNotesForDisplay.push({ note: seventhNote, type: '7th' }); else console.warn(`7th/Maj7th not defined for chord ${chord}`);
  }
  const noteOrder = { 'root': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5, '7th': 6 };
  finalNotesForDisplay.sort((a, b) => (noteOrder[a.type] || 99) - (noteOrder[b.type] || 99));
  let rectsHTML = finalNotesForDisplay.map(item => {
    const note = item.note; if (!note) return ''; 
    const typeClass = `note-${item.type}`; const baseLetter = note.charAt(0);
    let colorClassKey = note.replace('♭','flat').replace('♯','sharp').replace('#','sharp'); 
    const colorClass = noteColorClass[colorClassKey] || noteColorClass[baseLetter] || 'note-default';
    let accidentalHtml = '';
    if (note.includes('♯') || note.includes('#')) accidentalHtml = `<span class="accidental sharp">♯</span>`;
    else if (note.includes('♭') || note.includes('b')) accidentalHtml = `<span class="accidental flat">♭</span>`;
    return `<div class="note-rect ${typeClass} ${colorClass}">${baseLetter}${accidentalHtml}</div>`;
  }).filter(html => html !== '').join('');
  noteRects.innerHTML = rectsHTML;
}

function _createToggleFunction(modifierKey, updateBtnStatesFn, dependencies = null) {
  return function(idx) {
    const currentData = getProgressionData(currentToggle);
    const targetModifierArray = currentData[modifierKey];

    if (!Array.isArray(targetModifierArray) || typeof targetModifierArray[idx] === 'undefined') {
      console.error(`Modifier array ${modifierKey} or index ${idx} is invalid.`);
      return;
    }
    
    const wasActive = targetModifierArray[idx];
    targetModifierArray[idx] = !targetModifierArray[idx];

    if (dependencies) {
      if (modifierKey === 'maj7' && targetModifierArray[idx] && !currentData.s7[idx]) { 
        currentData.s7[idx] = true; 
        if (dependencies.updateFnS7) dependencies.updateFnS7(currentData.s7); // Pass the array for update
      } else if (modifierKey === 's7' && !targetModifierArray[idx] && wasActive && currentData.maj7[idx]) { 
        currentData.maj7[idx] = false; 
        if (dependencies.updateFnMaj7) dependencies.updateFnMaj7(currentData.maj7); // Pass the array
      }
    }
    // Simplified Sus logic: if sus is ON, 2nd XOR 4th should ideally be ON.
    // If 2nd or 4th is turned OFF, and it makes sus meaningless (neither 2 or 4 is on), turn sus OFF.
    if ((modifierKey === 's2' && !targetModifierArray[idx]) || (modifierKey === 's4' && !targetModifierArray[idx])) {
        if (currentData.sus[idx] && !currentData.s2[idx] && !currentData.s4[idx]) {
            currentData.sus[idx] = false;
            updateSusBtnStates(currentData.sus);
        }
    }
    
    updateBtnStatesFn(targetModifierArray); // Update the button state for the current modifier
    
    const select = document.getElementById('slot' + idx).querySelector('.chord-select');
    const chordToDisplay = currentData.p[idx]; 
    setSlotColorAndStyle(idx, select, chordToDisplay, currentData.s7[idx], currentData.s2[idx], currentData.s4[idx], currentData.sus[idx], currentData.maj7[idx]);
    saveCurrentProgression(); 
    playChordPreview(idx);
  };
}

function updateModifierButtonVisuals(modifierKey, buttonClassName, progressionModifierArray) {
  const currentData = getProgressionData(currentToggle);
  const statesArray = progressionModifierArray || currentData[modifierKey]; // Use passed array or get from currentToggle
  if (statesArray) {
    document.querySelectorAll(`.${buttonClassName}`).forEach((btn, idx) => btn.classList.toggle('active', statesArray[idx]));
  }
}

function updateSeventhBtnStates(s7Arr) { updateModifierButtonVisuals('s7', 'seventh-btn', s7Arr); }
function updateSecondBtnStates(s2Arr) { updateModifierButtonVisuals('s2', 'second-btn', s2Arr); }
function updateFourthBtnStates(s4Arr) { updateModifierButtonVisuals('s4', 'fourth-btn', s4Arr); }
function updateSusBtnStates(susArr) { updateModifierButtonVisuals('sus', 'sus-btn', susArr); }
function updateMajSeventhBtnStates(maj7Arr) { updateModifierButtonVisuals('maj7', 'maj-seventh-btn', maj7Arr); }


const toggleSeventh = _createToggleFunction('s7', updateSeventhBtnStates, { updateFnMaj7: updateMajSeventhBtnStates });
const toggleSecond = _createToggleFunction('s2', updateSecondBtnStates); 
const toggleFourth = _createToggleFunction('s4', updateFourthBtnStates); 
const toggleSus = _createToggleFunction('sus', updateSusBtnStates);
const toggleMajSeventh = _createToggleFunction('maj7', updateMajSeventhBtnStates, { updateFnS7: updateSeventhBtnStates });


function updateRhythmPictures() {
  for (let pair = 0; pair < 4; ++pair) {
    const box1 = document.querySelector(`.bottom-rhythm-box[data-pair="${pair}"][data-which="0"]`);
    const box2 = document.querySelector(`.bottom-rhythm-box[data-pair="${pair}"][data-which="1"]`);
    const imgElement = document.getElementById('bottomPic'+pair); 
    if (imgElement) {
        const img = imgElement.querySelector('.bottom-picture-img'); 
        if (box1 && box2 && img) { 
            let url = dashImgUrl;
            if (box1.classList.contains('active') && !box2.classList.contains('active')) url = rhythmBox2;
            else if (box1.classList.contains('active') && box2.classList.contains('active')) url = rhythmBox3;
            else if (!box1.classList.contains('active') && box2.classList.contains('active')) url = rhythmBox4;
            img.src = url;
        }
    }
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
  if(playIcon) playIcon.style.display = isPlaying ? "none" : "block"; 
  if(pauseIcon) pauseIcon.style.display = isPlaying ? "block" : "none";
  if(playPauseBtn) { playPauseBtn.title = isPlaying ? "Pause" : "Play"; playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play'); }
  if (isPlaying) startMainAnimation(); else stopMainAnimation();
}

// --- THIS IS THE MAIN CHANGE! ---
function startMainAnimation() {
  stopMainAnimation();
  // Always start playback from the beginning!
  slotHighlightStep = 0;
  pictureHighlightStep = 0;
  rhythmStep = 0;
  currentLinkedProgressionIndex = 0;

  // If in linked mode, ensure UI displays the first set in the sequence
  if (linkedProgressionSequence.length > 0) {
      const firstLinkedProg = linkedProgressionSequence[0];
      if (currentToggle !== firstLinkedProg) {
          currentToggle = firstLinkedProg;
          document.querySelectorAll('.abcd-toggle-btn').forEach(btn => btn.classList.remove('abcd-active'));
          document.getElementById('toggle' + currentToggle)?.classList.add('abcd-active');
          loadProgression(currentToggle);
      }
  } else {
      // Set UI to currentToggle
      document.querySelectorAll('.abcd-toggle-btn').forEach(btn => btn.classList.remove('abcd-active'));
      document.getElementById('toggle' + currentToggle)?.classList.add('abcd-active');
      loadProgression(currentToggle);
  }

  updateSlotHighlights(); 
  updatePictureHighlights();

  const intervalMs = (60 / getBpmInputValue()) * 1000 / 2;
  if (intervalMs > 0 && isFinite(intervalMs)) { playEighthNoteStep(); rhythmInterval = setInterval(playEighthNoteStep, intervalMs); }
}

// --- Remove all step preservation logic from stopMainAnimation ---
function stopMainAnimation() {
  if (rhythmInterval) clearInterval(rhythmInterval);
  rhythmInterval = null;
  for (let i = 0; i < slotIds.length; i++) unhighlightSlot(i);
  for (let i = 0; i < 4; i++) unhighlightPicture(i);
  // No preservation of steps or positions here!
}

// --- When BPM changes and playback is running, also restart from the beginning ---
function restartAnimationWithBpm() {
  if (isPlaying) {
    // Always restart from the beginning
    setPlaying(false);
    setPlaying(true);
  }
}

function playEighthNoteStep() {
  let playingProgLetter;
  let isLinkedMode = linkedProgressionSequence.length > 0;

  if (isLinkedMode) {
    playingProgLetter = linkedProgressionSequence[currentLinkedProgressionIndex];

    if (currentToggle !== playingProgLetter) {
      // Don't save here, as we are just switching playback context.
      // The UI for 'currentToggle' was already saved when it was last active.
      currentToggle = playingProgLetter; 
      document.querySelectorAll('.abcd-toggle-btn').forEach(btn => btn.classList.remove('abcd-active'));
      document.getElementById('toggle' + currentToggle)?.classList.add('abcd-active');
      loadProgression(currentToggle); 
    }
  } else {
    playingProgLetter = currentToggle;
     // Ensure currentToggle's button is active if not in linked mode
     if (!document.getElementById('toggle' + currentToggle)?.classList.contains('abcd-active')) {
        document.querySelectorAll('.abcd-toggle-btn').forEach(btn => btn.classList.remove('abcd-active'));
        document.getElementById('toggle' + currentToggle)?.classList.add('abcd-active');
        // loadProgression might be needed if UI somehow got out of sync
        // loadProgression(currentToggle);
     }
  }

  const progData = getProgressionData(playingProgLetter);
  if (!progData) { console.error("No progression data for playback:", playingProgLetter); return; }

  const currentSlotIdx = slotHighlightStep % 4; 
  const chordName = progData.p[currentSlotIdx]; 

  const currentPair = Math.floor((rhythmStep % 8) / 2);
  const currentWhich = (rhythmStep % 8) % 2;
  const box = document.querySelector(`.bottom-rhythm-box[data-pair="${currentPair}"][data-which="${currentWhich}"]`);
  let isNextBoxInactive = false;
  if (currentWhich === 0 && box && box.classList.contains('active')) { const nextBox = document.querySelector(`.bottom-rhythm-box[data-pair="${currentPair}"][data-which="1"]`); isNextBoxInactive = nextBox && !nextBox.classList.contains('active'); }
  
  if (box && box.classList.contains('active')) {
    if (!chordName || chordName === "" || chordName === "empty") { playBassDrum(isNextBoxInactive ? 0.38 : 0.19); } 
    else {
      if (!rhythmChordNotes[chordName]) { console.warn("Playback notes not defined for chord:", chordName); playBassDrum(isNextBoxInactive ? 0.38 : 0.19); return; }
      
      const addSeventh = progData.s7[currentSlotIdx], addSecond = progData.s2[currentSlotIdx], qualityState = progData.m[currentSlotIdx], addFourth = progData.s4[currentSlotIdx], addSus = progData.sus[currentSlotIdx], addMajSeventh = progData.maj7[currentSlotIdx];
      let notesToPlay = []; const baseRhythmNotes = rhythmChordNotes[chordName]; 
      if(!baseRhythmNotes) { console.error("Base rhythm notes missing for", chordName); return; }

      if(baseRhythmNotes[0]) notesToPlay.push(baseRhythmNotes[0]); 
      if(baseRhythmNotes[1]) notesToPlay.push(baseRhythmNotes[1]);
      if (baseRhythmNotes.length > 4 && baseRhythmNotes[4]) notesToPlay.push(baseRhythmNotes[4]); 
      if(baseRhythmNotes[3]) notesToPlay.push(baseRhythmNotes[3]);
      if (addSus) {
        if (addSecond && rhythmChordSecondNotes[chordName]) notesToPlay.push(rhythmChordSecondNotes[chordName]);
        if (addFourth && rhythmChordFourthNotes[chordName]) notesToPlay.push(rhythmChordFourthNotes[chordName]);
      } else {
        let thirdNoteToPlay = baseRhythmNotes[2];
        if (chordAlternateThirds[chordName] && qualityState !== 'none') { 
            thirdNoteToPlay = chordAlternateThirds[chordName][qualityState === 'major' ? 'majorNote' : 'minorNote']; 
        } else if (qualityState === 'none' && chordTypes[chordName] && chordAlternateThirds[chordName]) {
            const defaultQuality = chordTypes[chordName];
            if (defaultQuality === 'major' || defaultQuality === 'minor') {
                 thirdNoteToPlay = chordAlternateThirds[chordName][defaultQuality === 'major' ? 'majorNote' : 'minorNote'];
            }
        }
        if(thirdNoteToPlay) notesToPlay.push(thirdNoteToPlay);
        if (addSecond && rhythmChordSecondNotes[chordName]) notesToPlay.push(rhythmChordSecondNotes[chordName]);
        if (addFourth && rhythmChordFourthNotes[chordName]) notesToPlay.push(rhythmChordFourthNotes[chordName]);
      }
      if (addSeventh) { const seventhNoteToPlay = addMajSeventh && rhythmChordMajorSeventhNotes[chordName] ? rhythmChordMajorSeventhNotes[chordName] : rhythmChordSeventhNotes[chordName]; if(seventhNoteToPlay) notesToPlay.push(seventhNoteToPlay); }
      playTriangleNotes(notesToPlay.filter(n => n), isNextBoxInactive);
    }
  }
  
  updateSlotHighlights(); 
  if (rhythmStep % 2 === 0) { 
    playBrush(); 
    updatePictureHighlights(); 
    pictureHighlightStep = (pictureHighlightStep + 1) % 4; 
  }

  rhythmStep = (rhythmStep + 1) % 8;
  
  if (rhythmStep === 0) { 
    slotHighlightStep = (slotHighlightStep + 1) % 4; 

    if (isLinkedMode && slotHighlightStep === 0) { 
      currentLinkedProgressionIndex = (currentLinkedProgressionIndex + 1) % linkedProgressionSequence.length;
      // The next playingProgLetter and UI load will be handled at the start of the next playEighthNoteStep call.
    }
  }
}


function updateSlotHighlights() { for (let i = 0; i < slotIds.length; i++) unhighlightSlot(i); if (isPlaying) highlightSlot(slotHighlightStep % 4); }
function highlightSlot(idx) { document.getElementById(slotIds[idx])?.classList.add('enlarged'); }
function unhighlightSlot(idx) { document.getElementById(slotIds[idx])?.classList.remove('enlarged'); }
function updatePictureHighlights() { for (let i = 0; i < 4; i++) unhighlightPicture(i); if (isPlaying) highlightPicture(pictureHighlightStep % 4); }
function highlightPicture(idx) { document.getElementById('bottomPic'+idx)?.classList.add('picture-highlighted'); }
function unhighlightPicture(idx) { document.getElementById('bottomPic'+idx)?.classList.remove('picture-highlighted'); }

function clearAll() {
  // Stop playback before clearing
  if (isPlaying) setPlaying(false);

  // Reset all progression data arrays
  progressionA = ['', '', '', '']; progressionB = ['', '', '', '']; progressionC = ['', '', '', '']; progressionD = ['', '', '', ''];
  rhythmBoxesA = Array(8).fill(false); rhythmBoxesB = Array(8).fill(false); rhythmBoxesC = Array(8).fill(false); rhythmBoxesD = Array(8).fill(false);
  [seventhA, secondA, fourthA, susA, majSeventhA, 
   seventhB, secondB, fourthB, susB, majSeventhB, 
   seventhC, secondC, fourthC, susC, majSeventhC, 
   seventhD, secondD, fourthD, susD, majSeventhD].forEach(arr => arr.fill(false));
  [majorA, majorB, majorC, majorD].forEach(arr => arr.fill('none'));

  // Reset link states
  Object.keys(progressionLinkStates).forEach(progLetter => {
    progressionLinkStates[progLetter] = false;
    updateLinkVisuals(progLetter); // Visually unlink
  });
  updateLinkedProgressionSequence(); // Empties the sequence

  // Reset currentToggle to A and load its (now empty) state
  currentToggle = 'A';
  document.querySelectorAll('.abcd-toggle-btn').forEach(btn => btn.classList.remove('abcd-active'));
  document.getElementById('toggleA')?.classList.add('abcd-active');
  loadProgression('A'); // This will clear the UI based on the empty 'A' arrays

  // Clear rhythm boxes visuals (already done by loadProgression via updateRhythmPictures)
  // Clear slot visuals (already done by loadProgression via setSlotColorAndStyle -> setSlotContent)
  
  // Reset playback counters
  slotHighlightStep = 0;
  pictureHighlightStep = 0;
  rhythmStep = 0;
  currentLinkedProgressionIndex = 0;

  updateSlotHighlights(); // Clear highlights
  updatePictureHighlights(); // Clear highlights
}


async function playBrush() {
  if (!document.getElementById('brushToggle')?.checked) return;
  await ensureAudio(); const duration = 0.09, bufferSize = ctx.sampleRate * duration, buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource(); noise.buffer = buffer;
  const filter = ctx.createBiquadFilter(); filter.type = "bandpass"; filter.frequency.value = 2000; filter.Q.value = 1.8;
  const gainNode = ctx.createGain(); gainNode.gain.value = 0.5; gainNode.gain.setValueAtTime(0.5, ctx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  noise.connect(filter).connect(gainNode).connect(masterGain); noise.start(); noise.stop(ctx.currentTime + duration);
}

async function playBassDrum(customDuration) {
  await ensureAudio(); 
  const duration = customDuration || 0.19; 
  const osc = ctx.createOscillator(); osc.type = "sine";
  osc.frequency.setValueAtTime(140, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + duration * 0.85);
  const gainNode = ctx.createGain(); gainNode.gain.setValueAtTime(1, ctx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gainNode).connect(masterGain); osc.start(); osc.stop(ctx.currentTime + duration);
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
  if (!profile) { console.error("Sound profile not found for waveform:", currentWaveform); return; }
  let durationMultiplier = extendDuration ? 2 : 1;
  
  notes.forEach((note, i) => {
    if (!note) return; 
    const freq = midiToFreq(note);
    if (!freq) { console.warn("Could not get frequency for note:", note); return; }

    let osc, gainNode, lfo, lfoGain, filter; 
    gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    
    const staggeredStartTime = ctx.currentTime + 0.01 * i;
    const noteEndTime = staggeredStartTime + profile.duration * durationMultiplier;
    const voiceStopTime = noteEndTime + 0.08; 

    if (currentWaveform === "voice" && customVoiceWave) {
      osc = ctx.createOscillator(); osc.setPeriodicWave(customVoiceWave); osc.frequency.value = freq;
      lfo = ctx.createOscillator(); lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(profile.vibratoFreq, staggeredStartTime); lfoGain.gain.setValueAtTime(profile.vibratoAmount, staggeredStartTime);
      lfo.connect(lfoGain); lfoGain.connect(osc.frequency); lfo.start(staggeredStartTime);
      filter = ctx.createBiquadFilter(); filter.type = 'lowpass';
      filter.frequency.setValueAtTime(profile.filterFreq, staggeredStartTime); filter.Q.value = profile.filterQ;
      osc.connect(filter); filter.connect(gainNode);
      const attackTime = profile.attack, decayTime = 0.18, sustainLevel = profile.gain * 0.7, maxLevel = profile.gain * 1.0;
      gainNode.gain.linearRampToValueAtTime(maxLevel, staggeredStartTime + attackTime);
      gainNode.gain.linearRampToValueAtTime(sustainLevel, staggeredStartTime + attackTime + decayTime);
      gainNode.gain.linearRampToValueAtTime(0.001, noteEndTime);
      gainNode.connect(masterGain); osc.start(staggeredStartTime);
      osc.stop(voiceStopTime); lfo.stop(voiceStopTime);
    } 
    else if (currentWaveform === "saw") {
      osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = freq;
      if (profile.pitchBend) {
        osc.frequency.setValueAtTime(freq + profile.bendAmount, staggeredStartTime);
        osc.frequency.exponentialRampToValueAtTime(freq, staggeredStartTime + profile.bendTime);
      }
      const allpass = ctx.createBiquadFilter(); allpass.type = 'allpass';
      allpass.frequency.value = 800; allpass.Q.value = 5;
      filter = ctx.createBiquadFilter(); filter.type = 'lowpass';
      filter.frequency.setValueAtTime(profile.filterFreq, staggeredStartTime);
      filter.frequency.linearRampToValueAtTime(profile.filterFreq * 0.5, noteEndTime);
      filter.Q.value = profile.filterQ;
      osc.connect(filter); filter.connect(allpass); allpass.connect(gainNode);
      gainNode.gain.linearRampToValueAtTime(profile.gain, staggeredStartTime + profile.attack);
      gainNode.gain.setValueAtTime(profile.gain, staggeredStartTime + profile.attack + profile.hold);
      gainNode.gain.exponentialRampToValueAtTime(0.001, noteEndTime);
      gainNode.connect(masterGain); osc.start(staggeredStartTime); osc.stop(noteEndTime);
    } 
    else if (currentWaveform === "square") {
      osc = ctx.createOscillator(); osc.type = "square"; osc.frequency.value = freq;
      const highpass = ctx.createBiquadFilter(); highpass.type = 'highpass'; highpass.frequency.value = 80;
      filter = ctx.createBiquadFilter(); filter.type = 'lowpass';
      filter.frequency.setValueAtTime(profile.filterFreq * 2, staggeredStartTime);
      filter.frequency.exponentialRampToValueAtTime(profile.filterFreq, staggeredStartTime + profile.attack + profile.hold);
      filter.Q.value = profile.filterQ;
      osc.connect(highpass); highpass.connect(filter); filter.connect(gainNode);
      gainNode.gain.linearRampToValueAtTime(profile.gain * 1.2, staggeredStartTime + profile.attack);
      let decayPoint = profile.gain * 0.5;
      if (extendDuration) decayPoint = profile.gain * 0.6;
      gainNode.gain.exponentialRampToValueAtTime(decayPoint, staggeredStartTime + profile.attack + profile.hold + (extendDuration ? 0.15 : 0.05) );
      gainNode.gain.exponentialRampToValueAtTime(0.001, noteEndTime);
      gainNode.connect(masterGain); osc.start(staggeredStartTime); osc.stop(noteEndTime);
    } 
    else if (currentWaveform === "sine") {
      osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = freq;
      const harmonicOsc = ctx.createOscillator(); harmonicOsc.type = "sine"; harmonicOsc.frequency.value = freq * 2; 
      const harmonicGain = ctx.createGain(); harmonicGain.gain.value = 0.15; 
      filter = ctx.createBiquadFilter(); filter.type = 'lowpass';
      filter.frequency.setValueAtTime(profile.filterFreq, staggeredStartTime); filter.Q.value = profile.filterQ;
      osc.connect(filter); harmonicOsc.connect(harmonicGain); harmonicGain.connect(filter); filter.connect(gainNode);
      gainNode.gain.linearRampToValueAtTime(profile.gain, staggeredStartTime + profile.attack);
      gainNode.gain.setValueAtTime(profile.gain, staggeredStartTime + profile.attack + profile.hold * durationMultiplier);
      gainNode.gain.linearRampToValueAtTime(0.001, noteEndTime);
      gainNode.connect(masterGain); osc.start(staggeredStartTime); osc.stop(noteEndTime);
      harmonicOsc.start(staggeredStartTime); harmonicOsc.stop(noteEndTime);
    } 
    else { // Triangle (default/fallback)
      osc = ctx.createOscillator(); osc.type = "triangle"; osc.frequency.value = freq;
      filter = ctx.createBiquadFilter(); filter.type = 'lowpass';
      const triangleProfile = soundProfiles.triangle; 
      filter.frequency.setValueAtTime(triangleProfile.filterFreq, staggeredStartTime); filter.Q.value = triangleProfile.filterQ;
      osc.connect(filter); filter.connect(gainNode);
      gainNode.gain.linearRampToValueAtTime(triangleProfile.gain, staggeredStartTime + triangleProfile.attack);
      gainNode.gain.setValueAtTime(triangleProfile.gain, staggeredStartTime + triangleProfile.attack + triangleProfile.hold * durationMultiplier);
      gainNode.gain.linearRampToValueAtTime(0.012, staggeredStartTime + triangleProfile.duration * durationMultiplier); 
      gainNode.connect(masterGain); osc.start(staggeredStartTime);
      osc.stop(staggeredStartTime + triangleProfile.duration * durationMultiplier);
    }
  });
}

function midiToFreq(n) {
  if (!n) return null;
  const notes = {'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,'E':4,'F':5,'F#':6,'Gb':6,'G':7,'G#':8,'Ab':8,'A':9,'A#':10,'Bb':10,'B':11, 
                 'Cb':11, 'Fb':4, 'E#':5, 'B#':0, 'Bbb':9, 'Ebb':2, 'Abb':7, 'Dbb':0, 'Gbb':5,
                 'F##':7, 'C##':2, 'G##':9, 'D##':4, 'A##':0, 'E##':6 }; 
  let noteName = n.slice(0, -1);
  let octaveStr = n.slice(-1);

  if (n.length > 1 && (n[1] === 'b' || n[1] === '♭' || n[1] === '#' || n[1] === '♯')) {
    noteName = n.slice(0,2);
    octaveStr = n.slice(2);
    if (n.length > 2 && (n[2] === 'b' || n[2] === '♭' || n[2] === '#' || n[2] === '♯')) { 
        noteName = n.slice(0,3);
        octaveStr = n.slice(3);
    }
  }
  const octave = parseInt(octaveStr);
  if (notes[noteName] === undefined || isNaN(octave)) { console.warn("Invalid note string for midiToFreq:", n); return null; }
  return 440 * Math.pow(2, (notes[noteName]+(octave-4)*12-9)/12);
}

function playChordPreview(idx) {
  if (isPlaying) return;
  const currentData = getProgressionData(currentToggle); 
  const chordName = currentData.p[idx]; 
  
  if (!chordName || chordName === "" || chordName === "empty") return;
  if (!rhythmChordNotes[chordName]) { console.warn("Preview notes not defined for chord:", chordName); return; }
  
  const addSeventh = currentData.s7[idx], addSecond = currentData.s2[idx], qualityState = currentData.m[idx], addFourth = currentData.s4[idx], addSus = currentData.sus[idx], addMajSeventh = currentData.maj7[idx];
  let notesToPlay = []; const baseRhythmNotes = rhythmChordNotes[chordName];
  if(!baseRhythmNotes) { console.error("Base rhythm notes missing for preview", chordName); return; }

  if(baseRhythmNotes[0]) notesToPlay.push(baseRhythmNotes[0]); if(baseRhythmNotes[1]) notesToPlay.push(baseRhythmNotes[1]);
  if (baseRhythmNotes.length > 4 && baseRhythmNotes[4]) notesToPlay.push(baseRhythmNotes[4]); if(baseRhythmNotes[3]) notesToPlay.push(baseRhythmNotes[3]);
  if (addSus) {
    if (addSecond && rhythmChordSecondNotes[chordName]) notesToPlay.push(rhythmChordSecondNotes[chordName]);
    if (addFourth && rhythmChordFourthNotes[chordName]) notesToPlay.push(rhythmChordFourthNotes[chordName]);
  } else {
    let thirdNoteToPlay = baseRhythmNotes[2];
    if (chordAlternateThirds[chordName] && qualityState !== 'none') { 
        thirdNoteToPlay = chordAlternateThirds[chordName][qualityState === 'major' ? 'majorNote' : 'minorNote']; 
    } else if (qualityState === 'none' && chordTypes[chordName] && chordAlternateThirds[chordName]) {
        const defaultQuality = chordTypes[chordName];
        if (defaultQuality === 'major' || defaultQuality === 'minor') {
             thirdNoteToPlay = chordAlternateThirds[chordName][defaultQuality === 'major' ? 'majorNote' : 'minorNote'];
        }
    }
    if(thirdNoteToPlay) notesToPlay.push(thirdNoteToPlay);
    if (addSecond && rhythmChordSecondNotes[chordName]) notesToPlay.push(rhythmChordSecondNotes[chordName]);
    if (addFourth && rhythmChordFourthNotes[chordName]) notesToPlay.push(rhythmChordFourthNotes[chordName]);
  }
  if (addSeventh) { const seventhNoteToPlay = addMajSeventh && rhythmChordMajorSeventhNotes[chordName] ? rhythmChordMajorSeventhNotes[chordName] : rhythmChordSeventhNotes[chordName]; if(seventhNoteToPlay) notesToPlay.push(seventhNoteToPlay); }
  playTriangleNotes(notesToPlay.filter(n => n)); 
}


function updateKeyDisplay() {
  const keyNameDisplay = document.getElementById("current-key-name");
  if (keyNameDisplay) { keyNameDisplay.textContent = currentMusicalKey; }
}

function updateChordDropdowns() {
  const chordsForCurrentKey = keyChordMap[currentMusicalKey];
  if (!chordsForCurrentKey) { console.error("Chords not defined for key:", currentMusicalKey); return; }
  document.querySelectorAll('.chord-select').forEach(selectElement => {
    const currentVal = selectElement.value; 
    selectElement.innerHTML = ''; 
    const defaultOption = document.createElement('option'); defaultOption.value = ""; defaultOption.textContent = "-"; selectElement.appendChild(defaultOption);
    const emptyOption = document.createElement('option'); emptyOption.value = "empty"; emptyOption.textContent = ""; selectElement.appendChild(emptyOption);
    chordsForCurrentKey.forEach(chordData => { const option = document.createElement('option'); option.value = chordData.value; option.textContent = chordData.display; selectElement.appendChild(option); });
    
    if (Array.from(selectElement.options).some(opt => opt.value === currentVal) || currentVal === "" || currentVal === "empty") {
        selectElement.value = currentVal;
    }
  });
}

function handleKeyDial(direction) {
  saveCurrentProgression(); // Save before changing key context potentially affects dropdowns
  currentKeyIndex = (currentKeyIndex + direction + musicalKeys.length) % musicalKeys.length;
  currentMusicalKey = musicalKeys[currentKeyIndex];
  updateKeyDisplay();
  updateChordDropdowns(); 

  // After dropdowns are updated, reload the current progression's UI
  // to reflect any chord display changes (e.g. C/I becomes C / IV if key changes)
  // and to ensure the correct chords are selected in the dropdowns if they are still valid.
  loadProgression(currentToggle); 
}

// --- Functions for Progression Linking ---
function toggleLinkState(progLetter) {
  progressionLinkStates[progLetter] = !progressionLinkStates[progLetter];
  updateLinkVisuals(progLetter);
  updateLinkedProgressionSequence();

  // If playback is active and the sequence changes, reset relevant counters
  // to ensure smooth transition or restart of the sequence.
  if (isPlaying) {
      slotHighlightStep = 0;
      rhythmStep = 0;
      currentLinkedProgressionIndex = 0; // Start sequence from beginning
      // stop and restart animation to apply new sequence immediately
      stopMainAnimation(); 
      startMainAnimation();
  }
}

function updateLinkVisuals(progLetter) {
  const icon = document.getElementById('linkIcon' + progLetter);
  if (icon) {
    icon.classList.toggle('linked', progressionLinkStates[progLetter]);
  }
}

function updateLinkedProgressionSequence() {
  linkedProgressionSequence = [];
  ['A', 'B', 'C', 'D'].forEach(progLetter => {
    if (progressionLinkStates[progLetter]) {
      linkedProgressionSequence.push(progLetter);
    }
  });
  currentLinkedProgressionIndex = 0; 
}


document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("wave-left").onclick = () => handleWaveformDial(-1);
  document.getElementById("wave-right").onclick = () => handleWaveformDial(1);
  document.getElementById("wave-left").addEventListener("keydown", (e) => { if (e.key===" "||e.key==="Enter"||e.key==="ArrowLeft") { e.preventDefault(); handleWaveformDial(-1); e.target.focus(); }});
  document.getElementById("wave-right").addEventListener("keydown", (e) => { if (e.key===" "||e.key==="Enter"||e.key==="ArrowRight") { e.preventDefault(); handleWaveformDial(1); e.target.focus(); }});
  updateWaveformDisplay();

  ['A', 'B', 'C', 'D'].forEach(t => { 
    const btn = document.getElementById('toggle' + t); 
    if(btn) { 
      btn.addEventListener('click', () => switchToggle(t)); 
      btn.addEventListener('keydown', (e) => { if (e.key===" "||e.key==="Enter") { e.preventDefault(); switchToggle(t); }}); 
    }
    const linkIcon = document.getElementById('linkIcon' + t);
    if (linkIcon) {
      linkIcon.addEventListener('click', (event) => {
        event.stopPropagation(); 
        toggleLinkState(t);
      });
      linkIcon.addEventListener('keydown', (event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          event.stopPropagation();
          toggleLinkState(t);
        }
      });
    }
  });

  const keyLeftBtn = document.getElementById("key-left");
  const keyRightBtn = document.getElementById("key-right");
  if (keyLeftBtn) { keyLeftBtn.onclick = () => handleKeyDial(-1); keyLeftBtn.addEventListener("keydown", (e) => { if (e.key===" "||e.key==="Enter"||e.key==="ArrowLeft") { e.preventDefault(); handleKeyDial(-1); e.target.focus(); }}); }
  if (keyRightBtn) { keyRightBtn.onclick = () => handleKeyDial(1); keyRightBtn.addEventListener("keydown", (e) => { if (e.key===" "||e.key==="Enter"||e.key==="ArrowRight") { e.preventDefault(); handleKeyDial(1); e.target.focus(); }}); }
  updateKeyDisplay(); 

  document.querySelectorAll('.chord-select').forEach((select, idx) => { 
    select.addEventListener('change', function() { 
      const currentData = getProgressionData(currentToggle); 
      const selectedChordFromDropdown = this.value;
      currentData.p[idx] = selectedChordFromDropdown; 
      setSlotColorAndStyle(idx, this, selectedChordFromDropdown, currentData.s7[idx], currentData.s2[idx], currentData.s4[idx], currentData.sus[idx], currentData.maj7[idx]); 
      playChordPreview(idx); 
      saveCurrentProgression(); 
    }); 
  });
  document.querySelectorAll('.seventh-btn').forEach((btn, idx) => { btn.addEventListener('click', function() { toggleSeventh(idx); }); btn.addEventListener('keydown', function(e) { if (e.key===" "||e.key==="Enter") { e.preventDefault(); toggleSeventh(idx); }}); });
  document.querySelectorAll('.second-btn').forEach((btn, idx) => { btn.addEventListener('click', function() { toggleSecond(idx); }); btn.addEventListener('keydown', function(e) { if (e.key===" "||e.key==="Enter") { e.preventDefault(); toggleSecond(idx); }}); });
  document.querySelectorAll('.fourth-btn').forEach((btn, idx) => { btn.addEventListener('click', function() { toggleFourth(idx); }); btn.addEventListener('keydown', function(e) { if (e.key===" "||e.key==="Enter") { e.preventDefault(); toggleFourth(idx); }}); });
  document.querySelectorAll('.sus-btn').forEach((btn, idx) => { btn.addEventListener('click', function() { toggleSus(idx); }); btn.addEventListener('keydown', function(e) { if (e.key===" "||e.key==="Enter") { e.preventDefault(); toggleSus(idx); }}); });
  document.querySelectorAll('.maj-seventh-btn').forEach((btn, idx) => { btn.addEventListener('click', function() { toggleMajSeventh(idx); }); btn.addEventListener('keydown', function(e) { if (e.key===" "||e.key==="Enter") { e.preventDefault(); toggleMajSeventh(idx); }}); });
  document.querySelectorAll('.slot-box').forEach((slot, idx) => { const qualityBtn = slot.querySelector('.quality-toggle-btn'); if (qualityBtn) { qualityBtn.addEventListener('click', function() { toggleMajorMinor(idx); }); qualityBtn.addEventListener('keydown', function(e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggleMajorMinor(idx); } }); } });
  document.querySelectorAll('.bottom-rhythm-box').forEach(box => { function toggleActive(e) { e.preventDefault(); box.classList.toggle('active'); updateRhythmPictures(); saveCurrentProgression(); } box.addEventListener('click', toggleActive); box.addEventListener('touchstart', toggleActive, {passive: false}); box.setAttribute('tabindex', '0'); box.addEventListener('keydown', (e) => { if (e.key===" "||e.key==="Enter") toggleActive(e); }); });
  const playPauseBtn = document.getElementById('playPauseBtn'); if(playPauseBtn) { function togglePlay(e) { e.preventDefault(); setPlaying(!isPlaying); } playPauseBtn.addEventListener('click', togglePlay); playPauseBtn.addEventListener('touchstart', togglePlay, {passive: false}); playPauseBtn.addEventListener('keydown', (e) => { if (e.key===" "||e.key==="Enter") {e.preventDefault(); togglePlay(e); }}); }
  const bpmInput = document.getElementById('bpmInput'), bpmUp = document.getElementById('bpmUp'), bpmDown = document.getElementById('bpmDown'); if(bpmInput && bpmUp && bpmDown) { bpmInput.addEventListener('blur', () => { setBpmInputValue(clampBpm(getBpmInputValue())); restartAnimationWithBpm(); }); bpmInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { setBpmInputValue(clampBpm(getBpmInputValue())); restartAnimationWithBpm(); bpmInput.blur(); } else if (e.key === 'ArrowUp') { e.preventDefault(); setBpmInputValue(clampBpm(getBpmInputValue() + 1)); restartAnimationWithBpm(); } else if (e.key === 'ArrowDown') { e.preventDefault(); setBpmInputValue(clampBpm(getBpmInputValue() - 1)); restartAnimationWithBpm(); } }); let bpmHoldInterval = null, bpmHoldTimeout = null; function stepBpm(dir) { setBpmInputValue(clampBpm(getBpmInputValue() + dir)); restartAnimationWithBpm(); } function startHold(dir) { stepBpm(dir); bpmHoldTimeout = setTimeout(() => { bpmHoldInterval = setInterval(() => stepBpm(dir), 60); }, 500); } function stopHold() { clearTimeout(bpmHoldTimeout); clearInterval(bpmHoldInterval); bpmHoldTimeout=null; bpmHoldInterval=null; } [bpmUp, bpmDown].forEach((btn, i) => { const dir = i === 0 ? 1 : -1; btn.addEventListener('mousedown', () => startHold(dir)); btn.addEventListener('touchstart', (e) => { e.preventDefault(); startHold(dir);}, {passive:false}); btn.addEventListener('mouseup', stopHold); btn.addEventListener('mouseleave', stopHold); btn.addEventListener('touchend', stopHold); btn.addEventListener('touchcancel', stopHold); btn.addEventListener('click', () => stepBpm(dir)); }); }
  const clearButton = document.getElementById('clear'); if(clearButton) { clearButton.addEventListener('click', clearAll); clearButton.addEventListener('touchstart', (e)=>{e.preventDefault();clearAll();},{passive:false}); clearButton.addEventListener('keydown', (e) => { if (e.key===" "||e.key==="Enter") {e.preventDefault();clearAll();}}); }

  updateRhythmPictures();
  for (let i = 0; i < slotIds.length; i++) unhighlightSlot(i);
  for (let i = 0; i < 4; i++) unhighlightPicture(i);
  setPlaying(false); 
  loadProgression(currentToggle); 
});

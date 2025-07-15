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

// --- Time Signature Variables ---
const timeSignatureNumerators = [4, 3, 2, 5];
let currentTimeSignatureIndex = 0;

const optionColors = {
    'C': { background: '#F44336', text: '#fff' },
    'D': { background: '#FF9800', text: '#fff' },
    'E': { background: '#FFD600', text: '#000' },
    'F': { background: '#4CAF50', text: '#fff' },
    'G': { background: '#17b99a', text: '#fff' },
    'A': { background: '#1760af', text: '#fff' },
    'B': { background: '#9C27B0', text: '#fff' }
};

// --- Chord Data for Each Key ---
const keyChordMap = {
  'C': [ { value: 'C',  display: 'C / I' }, { value: 'Dm', display: 'Dm / ii' }, { value: 'Em', display: 'Em / iii' }, { value: 'F',  display: 'F / IV' }, { value: 'G',  display: 'G / V' }, { value: 'Am', display: 'Am / vi' }, { value: 'Bdim', display: 'Bdim / vii°' } ],
  'Db': [ { value: 'Db', display: 'Db / I' }, { value: 'Ebm',display: 'Ebm / ii' }, { value: 'Fm', display: 'Fm / iii' }, { value: 'Gb', display: 'Gb / IV' }, { value: 'Ab', display: 'Ab / V' }, { value: 'Bbm',display: 'Bbm / vi' }, { value: 'Cdim', display: 'Cdim / vii°' } ],
  'D': [ { value: 'D',  display: 'D / I' }, { value: 'Em', display: 'Em / ii' }, { value: 'F#m',display: 'F#m / iii' }, { value: 'G',  display: 'G / IV' }, { value: 'A',  display: 'A / V' }, { value: 'Bm', display: 'Bm / vi' }, { value: 'C#dim',display: 'C#dim / vii°' } ],
  'Eb': [ { value: 'Eb', display: 'Eb / I' }, { value: 'Fm', display: 'Fm / ii' }, { value: 'Gm', display: 'Gm / iii' }, { value: 'Ab', display: 'Ab / IV' }, { value: 'Bb', display: 'Bb / V' }, { value: 'Cm', display: 'Cm / vi' }, { value: 'Ddim', display: 'Ddim / vii°' } ],
  'E': [ { value: 'E',  display: 'E / I' }, { value: 'F#m',display: 'F#m / ii' }, { value: 'G#m',display: 'G#m / iii' }, { value: 'A',  display: 'A / IV' }, { value: 'B',  display: 'B / V' }, { value: 'C#m',display: 'C#m / vi' }, { value: 'D#dim',display: 'D#dim / vii°' } ],
  'F': [ { value: 'F',  display: 'F / I' }, { value: 'Gm', display: 'Gm / ii' }, { value: 'Am', display: 'Am / iii' }, { value: 'Bb', display: 'Bb / IV' }, { value: 'C',  display: 'C / V' }, { value: 'Dm', display: 'Dm / vi' }, { value: 'Edim', display: 'Edim / vii°' } ],
  'Gb': [ { value: 'Gb', display: 'Gb / I' }, { value: 'Abm',display: 'Abm / ii' }, { value: 'Bbm',display: 'Bbm / iii' }, { value: 'Cb', display: 'Cb / IV' },  { value: 'Db', display: 'Db / V' }, { value: 'Ebm',display: 'Ebm / vi' }, { value: 'Fdim', display: 'Fdim / vii°' } ],
  'G': [ { value: 'G',  display: 'G / I' }, { value: 'Am', display: 'Am / ii' }, { value: 'Bm', display: 'Bm / iii' }, { value: 'C',  display: 'C / IV' }, { value: 'D',  display: 'D / V' }, { value: 'Em', display: 'Em / vi' }, { value: 'F#dim',display: 'F#dim / vii°' } ],
  'Ab': [ { value: 'Ab', display: 'Ab / I' }, { value: 'Bbm',display: 'Bbm / ii' }, { value: 'Cm', display: 'Cm / iii' }, { value: 'Db', display: 'Db / IV' }, { value: 'Eb', display: 'Eb / V' }, { value: 'Fm', display: 'Fm / vi' }, { value: 'Gdim', display: 'Gdim / vii°' } ],
  'A': [ { value: 'A',  display: 'A / I' }, { value: 'Bm', display: 'Bm / ii' }, { value: 'C#m',display: 'C#m / iii' }, { value: 'D',  display: 'D / IV' }, { value: 'E',  display: 'E / V' }, { value: 'F#m',display: 'F#m / vi' }, { value: 'G#dim',display: 'G#dim / vii°' } ],
  'Bb': [ { value: 'Bb', display: 'Bb / I' }, { value: 'Cm', display: 'Cm / ii' }, { value: 'Dm', display: 'Dm / iii' }, { value: 'Eb', display: 'Eb / IV' }, { value: 'F',  display: 'F / V' }, { value: 'Gm', display: 'Gm / vi' }, { value: 'Adim', display: 'Adim / vii°' } ],
  'B': [ { value: 'B',  display: 'B / I' }, { value: 'C#m',display: 'C#m / ii' }, { value: 'D#m',display: 'D#m / iii' }, { value: 'E',  display: 'E / IV' }, { value: 'F#', display: 'F# / V' }, { value: 'G#m',display: 'G#m / vi' }, { value: 'A#dim',display: 'A#dim / vii°' } ]
};

// --- Create a master list of all unique chords ---
const allChords = [...new Set(Object.values(keyChordMap).flat().map(c => c.value))].sort();
const allChordOptions = allChords.map(chordValue => {
    // Find the best display name (e.g., from the key of C if possible)
    let displayName = chordValue;
    for (const key in keyChordMap) {
        const found = keyChordMap[key].find(c => c.value === chordValue);
        if (found) {
            displayName = found.display;
            break; 
        }
    }
    return { value: chordValue, display: displayName };
});


// A/B/C/D toggle variables
let currentToggle = 'A'; // Represents the progression whose data is loaded in the UI
let progressionA = ['', '', '', ''], progressionB = ['', '', '', ''], progressionC = ['', '', '', ''], progressionD = ['', '', '', '']; 
let rhythmBoxesA = Array(10).fill(false), rhythmBoxesB = Array(10).fill(false), rhythmBoxesC = Array(10).fill(false), rhythmBoxesD = Array(10).fill(false); 

// Chord modifier states for PRIMARY chords
let seventhA = [false, false, false, false], seventhB = [false, false, false, false], seventhC = [false, false, false, false], seventhD = [false, false, false, false]; 
let secondA = [false, false, false, false], secondB = [false, false, false, false], secondC = [false, false, false, false], secondD = [false, false, false, false]; 
let fourthA = [false, false, false, false], fourthB = [false, false, false, false], fourthC = [false, false, false, false], fourthD = [false, false, false, false]; 
let susA = [false, false, false, false], susB = [false, false, false, false], susC = [false, false, false, false], susD = [false, false, false, false];
let majSeventhA = [false, false, false, false], majSeventhB = [false, false, false, false], majSeventhC = [false, false, false, false], majSeventhD = [false, false, false, false];
let majorA = ['none', 'none', 'none', 'none'], majorB = ['none', 'none', 'none', 'none'], majorC = ['none', 'none', 'none', 'none'], majorD = ['none', 'none', 'none', 'none'];

// Split Chord State for PRIMARY chords
let splitChordActiveA = [false, false, false, false], splitChordActiveB = [false, false, false, false], splitChordActiveC = [false, false, false, false], splitChordActiveD = [false, false, false, false];
let splitChordValueA = ['', '', '', ''], splitChordValueB = ['', '', '', ''], splitChordValueC = ['', '', '', ''], splitChordValueD = ['', '', '', ''];

// Chord modifier states for SPLIT chords
let splitSeventhA = [false, false, false, false], splitSeventhB = [false, false, false, false], splitSeventhC = [false, false, false, false], splitSeventhD = [false, false, false, false];
let splitSecondA = [false, false, false, false], splitSecondB = [false, false, false, false], splitSecondC = [false, false, false, false], splitSecondD = [false, false, false, false];
let splitFourthA = [false, false, false, false], splitFourthB = [false, false, false, false], splitFourthC = [false, false, false, false], splitFourthD = [false, false, false, false];
let splitSusA = [false, false, false, false], splitSusB = [false, false, false, false], splitSusC = [false, false, false, false], splitSusD = [false, false, false, false];
let splitMajSeventhA = [false, false, false, false], splitMajSeventhB = [false, false, false, false], splitMajSeventhC = [false, false, false, false], splitMajSeventhD = [false, false, false, false];
let splitMajorA = ['none', 'none', 'none', 'none'], splitMajorB = ['none', 'none', 'none', 'none'], splitMajorC = ['none', 'none', 'none', 'none'], splitMajorD = ['none', 'none', 'none', 'none'];


// --- State Variables for Linking Progressions ---
let progressionLinkStates = { A: false, B: false, C: false, D: false };
let linkedProgressionSequence = []; 
let currentLinkedProgressionIndex = 0; 

const songs = {
  "eagle-view-song": {
    key: "D",
    bpm: 136,
    progressions: {
      A: { 
        chords: ["D", "G", "A", "G"],
        rhythm: [true, false, false, true, true, false, true, false], // 1, 4, 5, 7
        modifiers: [ 
          { seventh: false, second: false, fourth: false, sus: false, majSeventh: false, quality: 'none' }, // D
          { seventh: false, second: false, fourth: false, sus: false, majSeventh: false, quality: 'none' }, // G
          { seventh: false, second: false, fourth: false, sus: false, majSeventh: false, quality: 'none' }, // A
          { seventh: false, second: false, fourth: false, sus: false, majSeventh: false, quality: 'none' }  // G
        ]
      },
      B: { 
        chords: ["D", "G", "A", "D"],
        rhythm: [true, false, false, true, true, false, true, false], // 1, 4, 5, 7
        modifiers: [ 
          { seventh: false, second: false, fourth: false, sus: false, majSeventh: false, quality: 'none' }, // D
          { seventh: false, second: false, fourth: false, sus: false, majSeventh: false, quality: 'none' }, // G
          { seventh: false, second: false, fourth: false, sus: false, majSeventh: false, quality: 'none' }, // A
          { seventh: false, second: false, fourth: false, sus: false, majSeventh: false, quality: 'none' }  // D
        ]
      },
      C: { 
        chords: ["A", "D", "A", "D"],
        rhythm: [true, true, false, true, false, true, true, false], // 1, 2, 4, 6, 7
        modifiers: [ 
          { seventh: true,  second: false, fourth: false, sus: false, majSeventh: false, quality: 'none' }, // A7
          { seventh: false, second: false, fourth: false, sus: false, majSeventh: false, quality: 'none' }, // D
          { seventh: true,  second: false, fourth: false, sus: false, majSeventh: false, quality: 'none' }, // A7
          { seventh: false, second: false, fourth: false, sus: false, majSeventh: false, quality: 'none' }  // D
        ]
      },
      D: { 
        chords: ["A", "D", "E", "A"],
        rhythm: [true, true, false, true, false, true, true, true], // 1, 2, 4, 6, 7, 8
        modifiers: [ 
          { seventh: true,  second: false, fourth: false, sus: false, majSeventh: false, quality: 'none' },  // A7
          { seventh: false, second: false, fourth: false, sus: false, majSeventh: false, quality: 'none' },  // D
          { seventh: false, second: false, fourth: false, sus: false, majSeventh: false, quality: 'major'}, // E (major)
          { seventh: true,  second: false, fourth: false, sus: false, majSeventh: false, quality: 'none' }   // A7
        ]
      }
    }
  }
};

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
  'Abm':{ 'major': 'C', 'minor': 'C♭', 'majorNote': 'C5', 'minorNote': 'Cb4' },
  'Bdim': { 'major': 'D♯', 'minor': 'D', 'majorNote': 'D#4', 'minorNote': 'D4' },
  'Cdim': { 'major': 'E', 'minor': 'E♭', 'majorNote': 'E4', 'minorNote': 'Eb4' },
  'C#dim': { 'major': 'E♯', 'minor': 'E', 'majorNote': 'E#4', 'minorNote': 'E4' },
  'Ddim': { 'major': 'F♯', 'minor': 'F', 'majorNote': 'F#4', 'minorNote': 'F4' },
  'D#dim': { 'major': 'F♯♯', 'minor': 'F♯', 'majorNote': 'F##4', 'minorNote': 'F#4' },
  'Edim': { 'major': 'G♯', 'minor': 'G', 'majorNote': 'G#4', 'minorNote': 'G4' },
  'Fdim': { 'major': 'A', 'minor': 'A♭', 'majorNote': 'A4', 'minorNote': 'Ab4' },
  'F#dim': { 'major': 'A♯', 'minor': 'A', 'majorNote': 'A#4', 'minorNote': 'A4' },
  'Gdim': { 'major': 'B', 'minor': 'B♭', 'majorNote': 'B4', 'minorNote': 'Bb4' },
  'G#dim': { 'major': 'B♯', 'minor': 'B', 'majorNote': 'B#4', 'minorNote': 'B4' },
  'Adim': { 'major': 'C♯', 'minor': 'C', 'majorNote': 'C#5', 'minorNote': 'C5' },
  'A#dim': { 'major': 'C♯♯', 'minor': 'C♯', 'majorNote': 'C##5', 'minorNote': 'C#5' }
};

const chordTones = { 
  'C': ['C', 'E', 'G'], 'Dm': ['D', 'F', 'A'], 'Em': ['E', 'G', 'B'], 'F': ['F', 'A', 'C'], 'G': ['G', 'B', 'D'], 'Am': ['A', 'C', 'E'], 'Bb': ['B♭', 'D', 'F'],
  'Db': ['D♭', 'F', 'A♭'], 'Ebm': ['E♭', 'G♭', 'B♭'], 'Fm': ['F', 'A♭', 'C'], 'Gb': ['G♭', 'B♭', 'D♭'], 'Ab': ['A♭', 'C', 'E♭'], 'Bbm': ['B♭', 'D♭', 'F'], 'Cb': ['C♭', 'E♭', 'B♭'],
  'D': ['D', 'F♯', 'A'], 'F#m': ['F♯', 'A', 'C♯'], 'Bm': ['B', 'D', 'F♯'],
  'Eb': ['E♭', 'G', 'B♭'], 'Gm': ['G', 'B♭', 'D'], 'Cm': ['C', 'E♭', 'G'],
  'E': ['E', 'G♯', 'B'], 'G#m': ['G♯', 'B', 'D♯'], 'C#m': ['C♯', 'E', 'G♯'],
  'Fb': ['F♭', 'A♭', 'C♭'], 'Abm': ['A♭', 'C♭', 'E♭'], 
  'B': ['B', 'D♯', 'F♯'], 'D#m': ['D♯', 'F♯', 'A♯'], 'F#': ['F♯', 'A♯', 'C♯'], 'A': ['A', 'C♯', 'E'],
  'Bdim': ['B', 'D', 'F'], 'Cdim': ['C', 'E♭', 'G♭'], 'C#dim': ['C♯', 'E', 'G'], 'Ddim': ['D', 'F', 'A♭'], 'D#dim': ['D♯', 'F♯', 'A'], 'Edim': ['E', 'G', 'B♭'], 'Fdim': ['F', 'A♭', 'C♭'], 'F#dim': ['F♯', 'A', 'C'], 'Gdim': ['G', 'B♭', 'D♭'], 'G#dim': ['G♯', 'B', 'D'], 'Adim': ['A', 'C', 'E♭'], 'A#dim': ['A♯', 'C♯', 'E']
};

const chordSevenths = { 
  'C': 'B♭', 'Dm': 'C', 'Em': 'D', 'F': 'E♭', 'G': 'F', 'Am': 'G', 'Bb': 'A♭',
  'Db': 'C♭', 'Ebm': 'D♭', 'Fm': 'E♭', 'Gb': 'F♭', 'Ab': 'G♭', 'Bbm': 'A♭', 'Cb': 'B♭♭',
  'D': 'C', 'F#m': 'E', 'Bm': 'A',
  'Eb': 'D♭', 'Gm': 'F', 'Cm': 'B♭',
  'E': 'D', 'G#m': 'F♯', 'C#m': 'B',
  'Fb': 'E♭♭', 'Abm': 'G♭', 
  'B': 'A', 'D#m': 'C♯', 'F#': 'E', 'A': 'G',
  'Bdim': 'A', 'Cdim': 'B♭', 'C#dim': 'B', 'Ddim': 'C', 'D#dim': 'C♯', 'Edim': 'D', 'Fdim': 'E♭', 'F#dim': 'E', 'Gdim': 'F', 'G#dim': 'F♯', 'Adim': 'G', 'A#dim': 'G♯'
};
const chordMajorSevenths = { 
  'C': 'B', 'Dm': 'C♯', 'Em': 'D♯', 'F': 'E', 'G': 'F♯', 'Am': 'G♯', 'Bb': 'A',
  'Db': 'C', 'Ebm': 'D', 'Fm': 'E', 'Gb': 'F', 'Ab': 'G', 'Bbm': 'A', 'Cb': 'B♭',
  'D': 'C♯', 'F#m': 'E♯', 'Bm': 'A♯',
  'Eb': 'D', 'Gm': 'F♯', 'Cm': 'B',
  'E': 'D♯', 'G#m': 'F♯♯', 'C#m': 'B♯',
  'Fb': 'E♭', 'Abm': 'G', 
  'B': 'A♯', 'D#m': 'C♯♯', 'F#': 'E♯', 'A': 'G♯',
  'Bdim': 'A♯', 'Cdim': 'B', 'C#dim': 'B♯', 'Ddim': 'C♯', 'D#dim': 'C♯♯', 'Edim': 'D♯', 'Fdim': 'E', 'F#dim': 'E♯', 'Gdim': 'F♯', 'G#dim': 'F♯♯', 'Adim': 'G♯', 'A#dim': 'G♯♯'
};
const chordSeconds = { 
  'C': 'D', 'Dm': 'E', 'Em': 'F♯', 'F': 'G', 'G': 'A', 'Am': 'B', 'Bb': 'C',
  'Db': 'E♭', 'Ebm': 'F', 'Fm': 'G', 'Gb': 'A♭', 'Ab': 'B♭', 'Bbm': 'C', 'Cb': 'D♭',
  'D': 'E', 'F#m': 'G♯', 'Bm': 'C♯',
  'Eb': 'F', 'Gm': 'A', 'Cm': 'D',
  'E': 'F♯', 'G#m': 'A♯', 'C#m': 'D♯',
  'Fb': 'G♭', 'Abm': 'B♭', 
  'B': 'C♯', 'D#m': 'E♯', 'F#': 'G♯', 'A': 'B',
  'Bdim': 'C♯', 'Cdim': 'D', 'C#dim': 'D♯', 'Ddim': 'E', 'D#dim': 'E♯', 'Edim': 'F♯', 'Fdim': 'G', 'F#dim': 'G♯', 'Gdim': 'A', 'G#dim': 'A♯', 'Adim': 'B', 'A#dim': 'B♯'
};
const chordFourths = { 
  'C': 'F', 'Dm': 'G', 'Em': 'A', 'F': 'B♭', 'G': 'C', 'Am': 'D', 'Bb': 'E♭',
  'Db': 'G♭', 'Ebm': 'A♭', 'Fm': 'B♭', 'Gb': 'C♭', 'Ab': 'D♭', 'Bbm': 'E♭', 'Cb': 'F♭',
  'D': 'G', 'F#m': 'B', 'Bm': 'E',
  'Eb': 'A♭', 'Gm': 'C', 'Cm': 'F',
  'E': 'A', 'G#m': 'C♯', 'C#m': 'F♯',
  'Fb': 'B♭♭', 'Abm': 'D♭', 
  'B': 'E', 'D#m': 'G♯', 'F#': 'B', 'A': 'D',
  'Bdim': 'E', 'Cdim': 'F', 'C#dim': 'F♯', 'Ddim': 'G', 'D#dim': 'G♯', 'Edim': 'A', 'Fdim': 'B♭', 'F#dim': 'B', 'Gdim': 'C', 'G#dim': 'C♯', 'Adim': 'D', 'A#dim': 'D♯'
};

const rhythmChordNotes = { 
  'C': ['C3', 'C4', 'E4', 'G4', 'C5'], 'Dm': ['D3', 'D4', 'F4', 'A4', 'D5'], 'Em': ['E3', 'E4', 'G4', 'B4', 'E5'], 'F':  ['F3', 'F4', 'A4', 'C5', 'F5'],  'G':  ['G3', 'G4', 'B4', 'D5', 'G5'], 'Am': ['A2', 'A3', 'C4', 'E4', 'A4'], 'Bb': ['Bb2', 'Bb3', 'D4', 'F4', 'Bb4'],
  'Db': ['Db3','Db4','F4','Ab4','Db5'], 'Ebm':['Eb3','Eb4','Gb4','Bb4','Eb5'], 'Fm': ['F3','F4','Ab4','C5','F5'], 'Gb': ['Gb3', 'Gb4', 'Bb3', 'Db4', 'Gb5'], 'Ab': ['Ab2','Ab3','C4','Eb4','Ab4'], 'Bbm':['Bb2','Bb3','Db4','F4','Bb4'], 'Cb': ['Cb3','Cb4','Eb4','Gb4','Cb5'],
  'D':  ['D3', 'D4', 'F#4', 'A4', 'D5'], 'F#m':['F#3','F#4','A4','C#5','F#5'], 'Bm': ['B2','B3','D4','F#4','B4'],
  'Eb': ['Eb3','Eb4','G4','Bb4','Eb5'], 'Gm': ['G3','G4','Bb4','D5','G5'], 'Cm': ['C3','C4','Eb4','G4','C5'],
  'E':  ['E3', 'E4', 'G#4', 'B4', 'E5'], 'G#m':['G#3','G#4','B4','D#5','G#5'], 'C#m':['C#3','C#4','E4','G#4','C#5'],
  'Fb': ['Fb3','Fb4','Ab4','Cb4','Fb5'], 'Abm':['Ab2','Ab3','Cb4','Eb4','Ab4'], 
  'B':  ['B2', 'B3', 'D#4', 'F#4', 'B4'], 'D#m':['D#3','D#4','F#4','A#4','D#5'], 'F#': ['F#3','F#4','A#4','C#5','F#5'], 'A': ['A2','A3','C#4','E4','A4'],
  'Bdim': ['B2', 'B3', 'D4', 'F4', 'B4'], 'Cdim': ['C3', 'C4', 'Eb4', 'Gb4', 'C5'], 'C#dim': ['C#3', 'C#4', 'E4', 'G4', 'C#5'], 'Ddim': ['D3', 'D4', 'F4', 'Ab4', 'D5'], 'D#dim': ['D#3', 'D#4', 'F#4', 'A4', 'D#5'], 'Edim': ['E3', 'E4', 'G4', 'Bb4', 'E5'], 'Fdim': ['F3', 'F4', 'Ab4', 'Cb5', 'F5'], 'F#dim': ['F#3', 'F#4', 'A4', 'C5', 'F#5'], 'Gdim': ['G3', 'G4', 'Bb4', 'Db5', 'G5'], 'G#dim': ['G#3', 'G#4', 'B4', 'D5', 'G#5'], 'Adim': ['A2', 'A3', 'C4', 'Eb4', 'A4'], 'A#dim': ['A#2', 'A#3', 'C#4', 'E4', 'A#4']
};
const rhythmChordSeventhNotes = { 
  'C': 'Bb4', 'Dm': 'C5', 'Em': 'D5', 'F': 'Eb5', 'G': 'F5', 'Am': 'G4', 'Bb': 'Ab4',
  'Db':'Cb4', 'Ebm':'Db5', 'Fm':'Eb5', 'Gb':'Fb5', 'Ab':'Gb4', 'Bbm':'Ab4', 'Cb':'Bbb4',
  'D': 'C5', 'F#m':'E5', 'Bm':'A4',
  'Eb':'Db5', 'Gm':'F5', 'Cm':'Bb4',
  'E': 'D5', 'G#m':'F#5', 'C#m':'B4',
  'Fb':'Ebb5', 'Abm': 'Gb4', 
  'B': 'A4', 'D#m':'C#5', 'F#':'E5', 'A':'G4',
  'Bdim': 'A4', 'Cdim': 'Bb4', 'C#dim': 'B4', 'Ddim': 'C5', 'D#dim': 'C#5', 'Edim': 'D5', 'Fdim': 'Eb5', 'F#dim': 'E5', 'Gdim': 'F5', 'G#dim': 'F#5', 'Adim': 'G4', 'A#dim': 'G#4'
};
const rhythmChordMajorSeventhNotes = { 
  'C': 'B4', 'Dm': 'C#5', 'Em': 'D#5', 'F': 'E5', 'G': 'F#4', 'Am': 'G#4', 'Bb': 'A4',
  'Db':'C5', 'Ebm':'D5', 'Fm':'E5', 'Gb':'F4', 'Ab':'G4', 'Bbm':'A4', 'Cb':'Bb4',
  'D': 'C#5', 'F#m':'E#5', 'Bm':'A#4', 
  'Eb':'D5', 'Gm':'F#5', 'Cm':'B4',
  'E': 'D#5', 'G#m':'F##5', 'C#m':'B#5', 
  'Fb':'Eb5', 'Abm': 'G4', 
  'B': 'A#4', 'D#m':'C##5', 'F#':'E#5', 'A':'G#4',
  'Bdim': 'A#4', 'Cdim': 'B4', 'C#dim': 'B#4', 'Ddim': 'C#5', 'D#dim': 'C##5', 'Edim': 'D#5', 'Fdim': 'E5', 'F#dim': 'E#5', 'Gdim': 'F#5', 'G#dim': 'F##5', 'Adim': 'G#4', 'A#dim': 'G##4'
};
const rhythmChordSecondNotes = {
  'C': 'D4', 'Dm': 'E4', 'Em': 'F#4', 'F': 'G4', 'G': 'A4', 'Am': 'B4', 'Bb': 'C4',
  'Db':'Eb4', 'Ebm':'F4', 'Fm':'G4', 'Gb':'Ab4', 'Ab':'Bb4', 'Bbm':'C4', 'Cb':'Db4',
  'D': 'E4', 'F#m':'G#4', 'Bm':'C#4',
  'Eb':'F4', 'Gm':'A4', 'Cm':'D4',
  'E': 'F#4', 'G#m':'A#4', 'C#m':'D#4',
  'Fb':'Gb4', 'Abm': 'Bb3', 
  'B': 'C#4', 'D#m':'E#4', 'F#':'G#4', 'A':'B3',
  'Bdim': 'C#4', 'Cdim': 'D4', 'C#dim': 'D#4', 'Ddim': 'E4', 'D#dim': 'E#4', 'Edim': 'F#4', 'Fdim': 'G4', 'F#dim': 'G#4', 'Gdim': 'A4', 'G#dim': 'A#4', 'Adim': 'B3', 'A#dim': 'B#3'
};
const rhythmChordFourthNotes = {
  'C': 'F4', 'Dm': 'G4', 'Em': 'A4', 'F': 'Bb4', 'G': 'C5', 'Am': 'D5', 'Bb': 'Eb4',
  'Db':'Gb4', 'Ebm':'Ab4', 'Fm':'Bb4', 'Gb':'Cb4', 'Ab':'Db5', 'Bbm':'Eb4', 'Cb':'Fb4',
  'D': 'G4', 'F#m':'B4', 'Bm':'E4',
  'Eb':'Ab4', 'Gm':'C5', 'Cm':'F4',
  'E': 'A4', 'G#m':'C#5', 'C#m':'F#4',
  'Fb':'Bbb4', 'Abm': 'Db5', 
  'B': 'E4', 'D#m':'G#4', 'F#':'B3', 'A':'D4',
  'Bdim': 'E4', 'Cdim': 'F4', 'C#dim': 'F#4', 'Ddim': 'G4', 'D#dim': 'G#4', 'Edim': 'A4', 'Fdim': 'Bb4', 'F#dim': 'B3', 'Gdim': 'C5', 'G#dim': 'C#5', 'Adim': 'D4', 'A#dim': 'D#4'
};

const noteColorClass = {
  'C': 'note-C', 'D': 'note-D', 'E': 'note-E', 'F': 'note-F', 'G': 'note-G', 'A': 'note-A', 'B': 'note-B',
  'F♯': 'note-F', 'G♯': 'note-G', 'B♭': 'note-B', 'E♭': 'note-E', 'A♭': 'note-A', 'C♯': 'note-C', 'D♭': 'note-D',
  'F#': 'note-F', 'G#': 'note-G', 'Bb': 'note-B', 'Eb': 'note-E', 'Ab': 'note-A', 'C#': 'note-C', 'Db': 'note-D', 
  'Cb': 'note-B', 'Fb': 'note-E', 
  'Abm': 'note-A', 'Ebm': 'note-E', 'Bbm': 'note-B', 'F#m': 'note-F', 'C#m': 'note-C', 'G#m': 'note-G', 'D#m': 'note-D' 
};

const restDashImgUrl = "https://eagleviewmusic.com/images/CartoonRhythmBox5.svg";
const dashImgUrl = "https://eagleviewmusic.com/images/CartoonRhythmBox1.svg";
const rhythmBox2 = "https://eagleviewmusic.com/images/CartoonRhythmBox2.svg";
const rhythmBox3 = "https://eagleviewmusic.com/images/CartoonRhythmBox3.svg";
const rhythmBox4 = "https://eagleviewmusic.com/images/CartoonRhythmBox4.svg";


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

function getProgressionData(progLetter) {
  switch(progLetter) {
    case 'A': return { 
        p: progressionA, r: rhythmBoxesA, s7: seventhA, s2: secondA, s4: fourthA, sus: susA, maj7: majSeventhA, m: majorA, 
        splitActive: splitChordActiveA, splitVal: splitChordValueA, 
        splitS7: splitSeventhA, splitS2: splitSecondA, splitS4: splitFourthA, splitSus: splitSusA, splitMaj7: splitMajSeventhA, splitM: splitMajorA 
    };
    case 'B': return { 
        p: progressionB, r: rhythmBoxesB, s7: seventhB, s2: secondB, s4: fourthB, sus: susB, maj7: majSeventhB, m: majorB, 
        splitActive: splitChordActiveB, splitVal: splitChordValueB,
        splitS7: splitSeventhB, splitS2: splitSecondB, splitS4: splitFourthB, splitSus: splitSusB, splitMaj7: splitMajSeventhB, splitM: splitMajorB
    };
    case 'C': return { 
        p: progressionC, r: rhythmBoxesC, s7: seventhC, s2: secondC, s4: fourthC, sus: susC, maj7: majSeventhC, m: majorC, 
        splitActive: splitChordActiveC, splitVal: splitChordValueC,
        splitS7: splitSeventhC, splitS2: splitSecondC, splitS4: splitFourthC, splitSus: splitSusC, splitMaj7: splitMajSeventhC, splitM: splitMajorC
    };
    case 'D': return { 
        p: progressionD, r: rhythmBoxesD, s7: seventhD, s2: secondD, s4: fourthD, sus: susD, maj7: majSeventhD, m: majorD, 
        splitActive: splitChordActiveD, splitVal: splitChordValueD,
        splitS7: splitSeventhD, splitS2: splitSecondD, splitS4: splitFourthD, splitSus: splitSusD, splitMaj7: splitMajSeventhD, splitM: splitMajorD
    };
    default:  
      return getProgressionData(currentToggle); 
  }
}


function saveCurrentProgression() {
  const currentData = getProgressionData(currentToggle);
  if (!currentData) return;

  document.querySelectorAll('.slot-box').forEach((slot, idx) => {
      const primarySelect = slot.querySelector('.primary-chord-select');
      const splitSelect = slot.querySelector('.split-chord-select');
      if (primarySelect) {
        currentData.p[idx] = primarySelect.value;
      }
      if (splitSelect) {
        currentData.splitVal[idx] = splitSelect.value;
      }
  });

  const rhythmBoxStates = Array.from(document.querySelectorAll('.bottom-rhythm-box')).map(box => box.classList.contains('active'));
  currentData.r.splice(0, currentData.r.length, ...rhythmBoxStates);

  const modifierClasses = ['.seventh-btn', '.second-btn', '.fourth-btn', '.sus-btn', '.maj-seventh-btn', '.add-split-chord-btn'];
  const modifierArrays = [currentData.s7, currentData.s2, currentData.s4, currentData.sus, currentData.maj7, currentData.splitActive];

  modifierClasses.forEach((className, i) => {
    const states = Array.from(document.querySelectorAll(className)).map(btn => btn.classList.contains('active'));
    modifierArrays[i].splice(0, modifierArrays[i].length, ...states);
  });
  
  const majorStates = [];
  document.querySelectorAll('.slot-box').forEach((slot, slotIndex) => {
      majorStates.push(currentData.m[slotIndex]); 
  });
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

  const { p, r, s7, s2, s4, sus, maj7, m, splitActive, splitVal } = dataToLoad;

  updateChordDropdowns(); 

  document.querySelectorAll('.slot-box').forEach((slot, idx) => {
    const primarySelect = slot.querySelector('.primary-chord-select');
    const splitSelect = slot.querySelector('.split-chord-select');
    const splitBtn = slot.querySelector('.add-split-chord-btn');

    primarySelect.value = p[idx] || ""; 
    splitSelect.value = splitVal[idx] || "";
    setSplitSlotColorAndStyle(idx, splitSelect, splitVal[idx]);

    const isActive = splitActive[idx];
    slot.classList.toggle('split-active', isActive);
    splitBtn.classList.toggle('active', isActive);
    splitSelect.classList.toggle('visible', isActive);
    
    setSlotContent(idx);
  });

  document.querySelectorAll('.bottom-rhythm-box').forEach((box, idx) => box.classList.toggle('active', r[idx]));
  
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
  const chord = arrays.p[idx];

  if (!chord || chord === "" || chord === "empty") {
    arrays.m[idx] = 'none';
    _updateQualityButtonVisualForSlot(idx, 'none');
    return;
  }

  if (arrays.m[idx] === 'none') {
    arrays.m[idx] = 'major';
  } else if (arrays.m[idx] === 'major') {
    arrays.m[idx] = 'minor';
  } else if (arrays.m[idx] === 'minor') {
    arrays.m[idx] = 'none';
  } else {
    arrays.m[idx] = 'major'; 
  }

  _updateQualityButtonVisualForSlot(idx, arrays.m[idx]);

  setSlotContent(idx);
  saveCurrentProgression();
  playChordPreview(idx);
}

function setSplitSlotColorAndStyle(slotIndex, selectElement, chordToDisplay) {
    selectElement.className = 'chord-select split-chord-select visible'; // ensure base classes are there
    if (chordToDisplay && chordToDisplay !== "empty" && chordToDisplay !== "") {
        let chordClass = `c-selected-${chordToDisplay.toLowerCase()}`;
        chordClass = chordClass.replace('♭', 'flat').replace('♯', 'sharp').replace('#', 'sharp');
        selectElement.classList.add(chordClass);
    }
}

function buildNotesForDisplay(chord, addSeventh, addSecond, addFourth, addSus, addMajSeventh, qualityState) {
    if (!chord || !chordTones[chord]) {
        return [{ note: chord || '?', type: 'unknown' }];
    }

    let finalNotes = [];
    const baseTones = [...chordTones[chord]];
    finalNotes.push({ note: baseTones[0], type: 'root' });

    if (addSus) {
        if (addSecond && chordSeconds[chord]) finalNotes.push({ note: chordSeconds[chord], type: '2nd' });
        if (addFourth && chordFourths[chord]) finalNotes.push({ note: chordFourths[chord], type: '4th' });
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
        finalNotes.push({ note: thirdNote, type: '3rd' });

        if (addSecond && chordSeconds[chord]) {
            const rootIndex = finalNotes.findIndex(n => n.type === 'root');
            finalNotes.splice(rootIndex + 1, 0, { note: chordSeconds[chord], type: '2nd' });
        }
        if (addFourth && chordFourths[chord]) {
            const thirdIndex = finalNotes.findIndex(n => n.type === '3rd');
            finalNotes.splice(thirdIndex !== -1 ? thirdIndex + 1 : finalNotes.length, 0, { note: chordFourths[chord], type: '4th' });
        }
    }

    if (baseTones[2]) finalNotes.push({ note: baseTones[2], type: '5th' });

    if (addSeventh) {
        const seventhNote = addMajSeventh && chordMajorSevenths[chord] ? chordMajorSevenths[chord] : chordSevenths[chord];
        if (seventhNote) finalNotes.push({ note: seventhNote, type: '7th' });
    }

    const noteOrder = { 'root': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5, '7th': 6 };
    finalNotes.sort((a, b) => (noteOrder[a.type] || 99) - (noteOrder[b.type] || 99));
    return finalNotes;
}

function generateNoteRectsHTML(notes) {
    return notes.map(item => {
        const note = item.note;
        if (!note) return '';
        const typeClass = item.type ? `note-${item.type}` : 'note-default';
        const baseLetter = note.charAt(0);
        let colorClassKey = note.replace('♭', 'flat').replace('♯', 'sharp').replace('#', 'sharp');
        const colorClass = noteColorClass[colorClassKey] || noteColorClass[baseLetter] || 'note-default';
        let accidentalHtml = '';
        if (note.includes('♯') || note.includes('#')) accidentalHtml = `<span class="accidental sharp">♯</span>`;
        else if (note.includes('♭') || note.includes('b')) accidentalHtml = `<span class="accidental flat">♭</span>`;
        return `<div class="note-rect ${typeClass} ${colorClass}">${baseLetter}${accidentalHtml}</div>`;
    }).filter(html => html !== '').join('');
}

function setSlotContent(slotIndex) {
    const slot = document.getElementById('slot' + slotIndex);
    const primarySelect = slot.querySelector('.primary-chord-select');
    const primaryNoteRects = slot.querySelector('.primary-note-rects');
    const splitNoteRects = slot.querySelector('.split-note-rects');
    const noteRectsContainer = slot.querySelector('.note-rects-container');
    let img = slot.querySelector('.dash-img-slot');
    
    primaryNoteRects.innerHTML = '';
    splitNoteRects.innerHTML = '';

    const progData = getProgressionData(currentToggle);
    const primaryChord = progData.p[slotIndex];

    // Set primary chord dropdown color
    primarySelect.className = 'chord-select primary-chord-select'; 
    if (primaryChord && primaryChord !== "empty") {
        let chordClass = `c-selected-${primaryChord.toLowerCase()}`;
        chordClass = chordClass.replace('♭', 'flat').replace('♯', 'sharp').replace('#', 'sharp'); 
        primarySelect.classList.add(chordClass);
    }

    if (!primaryChord || primaryChord === "empty") {
        if (!img) {
            img = document.createElement('img');
            img.className = 'dash-img-slot';
            slot.insertBefore(img, noteRectsContainer);
        }
        img.src = restDashImgUrl;
        img.alt = "Rhythm Box Rest";
        img.style.display = "block";
        noteRectsContainer.style.display = "none";
        return;
    } else {
        if (img) img.style.display = "none";
        noteRectsContainer.style.display = "flex";
    }

    const primaryNotes = buildNotesForDisplay(
        primaryChord, progData.s7[slotIndex], progData.s2[slotIndex], progData.s4[slotIndex], 
        progData.sus[slotIndex], progData.maj7[slotIndex], progData.m[slotIndex]
    );
    primaryNoteRects.innerHTML = generateNoteRectsHTML(primaryNotes);

    if (progData.splitActive[slotIndex] && progData.splitVal[slotIndex]) {
        const splitNotes = buildNotesForDisplay(
            progData.splitVal[slotIndex], progData.splitS7[slotIndex], progData.splitS2[slotIndex], progData.splitS4[slotIndex], 
            progData.splitSus[slotIndex], progData.splitMaj7[slotIndex], progData.splitM[slotIndex]
        );
        splitNoteRects.innerHTML = generateNoteRectsHTML(splitNotes);
    }
}

function _createToggleFunction(modifierKey, updateBtnStatesFn, dependencies = null) {
  return function(idx) {
    const currentData = getProgressionData(currentToggle);
    const targetModifierArray = currentData[modifierKey];

    if (!Array.isArray(targetModifierArray) || typeof targetModifierArray[idx] === 'undefined') {
      return;
    }
    
    const wasActive = targetModifierArray[idx];
    targetModifierArray[idx] = !targetModifierArray[idx];

    if (dependencies) {
      if (modifierKey === 'maj7' && targetModifierArray[idx] && !currentData.s7[idx]) { 
        currentData.s7[idx] = true; 
        if (dependencies.updateFnS7) dependencies.updateFnS7(currentData.s7); 
      } else if (modifierKey === 's7' && !targetModifierArray[idx] && wasActive && currentData.maj7[idx]) { 
        currentData.maj7[idx] = false; 
        if (dependencies.updateFnMaj7) dependencies.updateFnMaj7(currentData.maj7); 
      }
    }
    if ((modifierKey === 's2' && !targetModifierArray[idx]) || (modifierKey === 's4' && !targetModifierArray[idx])) {
        if (currentData.sus[idx] && !currentData.s2[idx] && !currentData.s4[idx]) {
            currentData.sus[idx] = false;
            updateSusBtnStates(currentData.sus);
        }
    }
    
    updateBtnStatesFn(targetModifierArray); 
    setSlotContent(idx);
    saveCurrentProgression(); 
    playChordPreview(idx);
  };
}

function updateModifierButtonVisuals(modifierKey, buttonClassName, progressionModifierArray) {
  const currentData = getProgressionData(currentToggle);
  const statesArray = progressionModifierArray || currentData[modifierKey]; 
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
    const numerator = timeSignatureNumerators[currentTimeSignatureIndex];
    for (let pair = 0; pair < 5; ++pair) { // Iterate up to 5
        const box1 = document.querySelector(`.bottom-rhythm-box[data-pair="${pair}"][data-which="0"]`);
        const box2 = document.querySelector(`.bottom-rhythm-box[data-pair="${pair}"][data-which="1"]`);
        const imgElement = document.getElementById('bottomPic' + pair);
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

function startMainAnimation() {
  stopMainAnimation();
  slotHighlightStep = 0;
  pictureHighlightStep = 0;
  rhythmStep = 0;
  currentLinkedProgressionIndex = 0;

  if (linkedProgressionSequence.length > 0) {
      const firstLinkedProg = linkedProgressionSequence[0];
      if (currentToggle !== firstLinkedProg) {
          currentToggle = firstLinkedProg;
          document.querySelectorAll('.abcd-toggle-btn').forEach(btn => btn.classList.remove('abcd-active'));
          document.getElementById('toggle' + currentToggle)?.classList.add('abcd-active');
          loadProgression(currentToggle);
      }
  } else {
      document.querySelectorAll('.abcd-toggle-btn').forEach(btn => btn.classList.remove('abcd-active'));
      document.getElementById('toggle' + currentToggle)?.classList.add('abcd-active');
      loadProgression(currentToggle);
  }

  updateSlotHighlights(); 
  updatePictureHighlights();

  const intervalMs = (60 / getBpmInputValue()) * 1000 / 2;
  if (intervalMs > 0 && isFinite(intervalMs)) { playEighthNoteStep(); rhythmInterval = setInterval(playEighthNoteStep, intervalMs); }
}

function stopMainAnimation() {
  if (rhythmInterval) clearInterval(rhythmInterval);
  rhythmInterval = null;
  for (let i = 0; i < 4; i++) unhighlightSlot(i);
  const numerator = timeSignatureNumerators[currentTimeSignatureIndex];
  for (let i = 0; i < numerator; i++) unhighlightPicture(i);
}

function restartAnimationWithBpm() {
  if (isPlaying) {
    setPlaying(false);
    setPlaying(true);
  }
}

function getNotesToPlayForChord(chordName, isSplit, slotIdx, progData) {
    if (!chordName || !rhythmChordNotes[chordName]) return [];

    const s7 = isSplit ? progData.splitS7[slotIdx] : progData.s7[slotIdx];
    const s2 = isSplit ? progData.splitS2[slotIdx] : progData.s2[slotIdx];
    const s4 = isSplit ? progData.splitS4[slotIdx] : progData.s4[slotIdx];
    const sus = isSplit ? progData.splitSus[slotIdx] : progData.sus[slotIdx];
    const maj7 = isSplit ? progData.splitMaj7[slotIdx] : progData.maj7[slotIdx];
    const quality = isSplit ? progData.splitM[slotIdx] : progData.m[slotIdx];

    let notesToPlay = [];
    const baseRhythmNotes = rhythmChordNotes[chordName];
    if (!baseRhythmNotes) return [];

    if (baseRhythmNotes[0]) notesToPlay.push(baseRhythmNotes[0]);
    if (baseRhythmNotes[1]) notesToPlay.push(baseRhythmNotes[1]);
    if (baseRhythmNotes.length > 4 && baseRhythmNotes[4]) notesToPlay.push(baseRhythmNotes[4]);
    if (baseRhythmNotes[3]) notesToPlay.push(baseRhythmNotes[3]);

    if (sus) {
        if (s2 && rhythmChordSecondNotes[chordName]) notesToPlay.push(rhythmChordSecondNotes[chordName]);
        if (s4 && rhythmChordFourthNotes[chordName]) notesToPlay.push(rhythmChordFourthNotes[chordName]);
    } else {
        let thirdNoteToPlay = baseRhythmNotes[2];
        if (chordAlternateThirds[chordName] && quality !== 'none') {
            thirdNoteToPlay = chordAlternateThirds[chordName][quality === 'major' ? 'majorNote' : 'minorNote'];
        } else if (quality === 'none' && chordTypes[chordName] && chordAlternateThirds[chordName]) {
            const defaultQuality = chordTypes[chordName];
            if (defaultQuality === 'major' || defaultQuality === 'minor') {
                thirdNoteToPlay = chordAlternateThirds[chordName][defaultQuality === 'major' ? 'majorNote' : 'minorNote'];
            }
        }
        if (thirdNoteToPlay) notesToPlay.push(thirdNoteToPlay);
        if (s2 && rhythmChordSecondNotes[chordName]) notesToPlay.push(rhythmChordSecondNotes[chordName]);
        if (s4 && rhythmChordFourthNotes[chordName]) notesToPlay.push(rhythmChordFourthNotes[chordName]);
    }
    if (s7) {
        const seventhNoteToPlay = maj7 && rhythmChordMajorSeventhNotes[chordName] ? rhythmChordMajorSeventhNotes[chordName] : rhythmChordSeventhNotes[chordName];
        if (seventhNoteToPlay) notesToPlay.push(seventhNoteToPlay);
    }
    return notesToPlay.filter(n => n);
}

function playEighthNoteStep() {
    const numerator = timeSignatureNumerators[currentTimeSignatureIndex];
    const totalEighthNotes = numerator * 2;

    let playingProgLetter;
    let isLinkedMode = linkedProgressionSequence.length > 0;

    if (isLinkedMode) {
        playingProgLetter = linkedProgressionSequence[currentLinkedProgressionIndex];
        if (currentToggle !== playingProgLetter) {
            currentToggle = playingProgLetter;
            document.querySelectorAll('.abcd-toggle-btn').forEach(btn => btn.classList.remove('abcd-active'));
            document.getElementById('toggle' + currentToggle)?.classList.add('abcd-active');
            loadProgression(currentToggle);
        }
    } else {
        playingProgLetter = currentToggle;
    }

    const progData = getProgressionData(playingProgLetter);
    if (!progData) return;

    const currentSlotIdx = slotHighlightStep % 4;
    let chordNameToPlay = progData.p[currentSlotIdx];
    let isPlayingSplit = false;

    if (progData.splitActive[currentSlotIdx] && progData.splitVal[currentSlotIdx]) {
        const splitPoint = Math.floor(totalEighthNotes / 2);
        if (rhythmStep >= splitPoint) {
            chordNameToPlay = progData.splitVal[currentSlotIdx];
            isPlayingSplit = true;
        }
    }

    const currentPair = Math.floor((rhythmStep % totalEighthNotes) / 2);
    const currentWhich = (rhythmStep % totalEighthNotes) % 2;
    const box = document.querySelector(`.bottom-rhythm-box[data-pair="${currentPair}"][data-which="${currentWhich}"]`);

    if (box && box.classList.contains('active')) {
        if (!chordNameToPlay || chordNameToPlay === "empty") {
            playBassDrum();
        } else {
            const notesToPlay = getNotesToPlayForChord(chordNameToPlay, isPlayingSplit, currentSlotIdx, progData);
            if (notesToPlay.length > 0) {
                playTriangleNotes(notesToPlay);
            } else {
                playBassDrum();
            }
        }
    }

    updateSlotHighlights();
    if (rhythmStep % 2 === 0) {
        playBrush();
        updatePictureHighlights();
        pictureHighlightStep = (pictureHighlightStep + 1) % numerator;
    }

    rhythmStep = (rhythmStep + 1) % totalEighthNotes;

    if (rhythmStep === 0) {
        slotHighlightStep = (slotHighlightStep + 1) % 4;
        if (isLinkedMode && slotHighlightStep === 0) {
            currentLinkedProgressionIndex = (currentLinkedProgressionIndex + 1) % linkedProgressionSequence.length;
        }
    }
}


function updateSlotHighlights() { 
    for (let i = 0; i < 4; i++) unhighlightSlot(i); 
    if (isPlaying) highlightSlot(slotHighlightStep % 4); 
}
function highlightSlot(idx) { document.getElementById(slotIds[idx])?.classList.add('enlarged'); }
function unhighlightSlot(idx) { document.getElementById(slotIds[idx])?.classList.remove('enlarged'); }

function updatePictureHighlights() { 
    const numerator = timeSignatureNumerators[currentTimeSignatureIndex];
    for (let i = 0; i < 5; i++) unhighlightPicture(i); 
    if (isPlaying) highlightPicture(pictureHighlightStep % numerator); 
}
function highlightPicture(idx) { document.getElementById('bottomPic'+idx)?.classList.add('picture-highlighted'); }
function unhighlightPicture(idx) { document.getElementById('bottomPic'+idx)?.classList.remove('picture-highlighted'); }

function clearAll() {
  if (isPlaying) setPlaying(false);

  // Clear Primary
  progressionA = ['', '', '', '']; progressionB = ['', '', '', '']; progressionC = ['', '', '', '']; progressionD = ['', '', '', ''];
  rhythmBoxesA.fill(false); rhythmBoxesB.fill(false); rhythmBoxesC.fill(false); rhythmBoxesD.fill(false);
  [seventhA, secondA, fourthA, susA, majSeventhA, 
   seventhB, secondB, fourthB, susB, majSeventhB, 
   seventhC, secondC, fourthC, susC, majSeventhC, 
   seventhD, secondD, fourthD, susD, majSeventhD].forEach(arr => arr.fill(false));
  [majorA, majorB, majorC, majorD].forEach(arr => arr.fill('none'));
  [splitChordActiveA, splitChordActiveB, splitChordActiveC, splitChordActiveD].forEach(arr => arr.fill(false));
  [splitChordValueA, splitChordValueB, splitChordValueC, splitChordValueD].forEach(arr => arr.fill(''));

  // Clear Split Chord Modifiers
  [splitSeventhA, splitSecondA, splitFourthA, splitSusA, splitMajSeventhA,
   splitSeventhB, splitSecondB, splitFourthB, splitSusB, splitMajSeventhB,
   splitSeventhC, splitSecondC, splitFourthC, splitSusC, splitMajSeventhC,
   splitSeventhD, splitSecondD, splitFourthD, splitSusD, splitMajSeventhD].forEach(arr => arr.fill(false));
  [splitMajorA, splitMajorB, splitMajorC, splitMajorD].forEach(arr => arr.fill('none'));

  // Clear Links
  Object.keys(progressionLinkStates).forEach(progLetter => {
    progressionLinkStates[progLetter] = false;
    updateLinkVisuals(progLetter); 
  });
  updateLinkedProgressionSequence(); 

  // Reset UI
  currentToggle = 'A';
  document.querySelectorAll('.abcd-toggle-btn').forEach(btn => btn.classList.remove('abcd-active'));
  document.getElementById('toggleA')?.classList.add('abcd-active');
  loadProgression('A'); 
  
  // Reset playback state
  slotHighlightStep = 0;
  pictureHighlightStep = 0;
  rhythmStep = 0;
  currentLinkedProgressionIndex = 0;
  updateSlotHighlights(); 
  updatePictureHighlights(); 
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
  if (!profile) { return; }
  let durationMultiplier = extendDuration ? 2 : 1;
  
  notes.forEach((note, i) => {
    if (!note) return; 
    const freq = midiToFreq(note);
    if (!freq) { return; }

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
  if (notes[noteName] === undefined || isNaN(octave)) { return null; }
  return 440 * Math.pow(2, (notes[noteName]+(octave-4)*12-9)/12);
}

function playChordPreview(idx) {
  if (isPlaying) return;
  const currentData = getProgressionData(currentToggle); 
  const chordName = currentData.p[idx]; 
  if (!chordName || chordName === "" || chordName === "empty") return;
  const notesToPlay = getNotesToPlayForChord(chordName, false, idx, currentData);
  playTriangleNotes(notesToPlay);
}

function playSimpleChordPreview(chordName) {
    if (isPlaying || !chordName || chordName === "" || chordName === "empty") return;
    const notesToPlay = getNotesToPlayForChord(chordName, false, -1, {}); // -1 index and empty progData as it's a simple preview
    playTriangleNotes(notesToPlay);
}


function updateKeyDisplay() {
  const keyNameDisplay = document.getElementById("current-key-name");
  if (keyNameDisplay) { keyNameDisplay.textContent = currentMusicalKey; }
}

function updateChordDropdowns() {
    const chordsForCurrentKey = keyChordMap[currentMusicalKey] || [];
    const diatonicChordValues = new Set(chordsForCurrentKey.map(c => c.value));

    document.querySelectorAll('.chord-select').forEach(selectElement => {
        const currentVal = selectElement.value;
        const hasCurrentVal = allChordOptions.some(opt => opt.value === currentVal);
        
        selectElement.innerHTML = ''; 

        // Add default and empty options
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "-";
        selectElement.appendChild(defaultOption);
        const emptyOption = document.createElement('option');
        emptyOption.value = "empty";
        emptyOption.textContent = "";
        selectElement.appendChild(emptyOption);

        // Add an optgroup for diatonic chords
        const diatonicGroup = document.createElement('optgroup');
        diatonicGroup.label = `${currentMusicalKey} Major Scale Chords`;
        chordsForCurrentKey.forEach(chordData => {
            const option = createChordOption(chordData);
            diatonicGroup.appendChild(option);
        });
        selectElement.appendChild(diatonicGroup);
        
        // Add an optgroup for other chords if necessary
        const otherChords = allChordOptions.filter(c => !diatonicChordValues.has(c.value));
        if (otherChords.length > 0) {
            const nonDiatonicGroup = document.createElement('optgroup');
            nonDiatonicGroup.label = "Other Chords";
            otherChords.forEach(chordData => {
                const option = createChordOption(chordData);
                nonDiatonicGroup.appendChild(option);
            });
            selectElement.appendChild(nonDiatonicGroup);
        }
        
        // Restore the selected value
        if (hasCurrentVal) {
            selectElement.value = currentVal;
        } else {
            selectElement.value = "";
        }
    });
}

function createChordOption(chordData) {
    const option = document.createElement('option');
    option.value = chordData.value;
    option.textContent = chordData.display;

    const rootNote = chordData.value.replace(/m|dim|sus|maj7/g, '').replace(/#|♯/g, 'sharp').replace(/b|♭/g, 'flat').charAt(0);
    const colorInfo = optionColors[rootNote.toUpperCase()];
     if (colorInfo) {
        option.style.backgroundColor = colorInfo.background;
        option.style.color = colorInfo.text;
    }
    return option;
}


function transposeChord(chord, oldKey, newKey) {
    if (!chord || chord === "" || chord === "empty") {
        return chord; // Don't transpose empty slots
    }

    const oldKeyChords = keyChordMap[oldKey];
    const newKeyChords = keyChordMap[newKey];

    if (!oldKeyChords || !newKeyChords) {
        return chord; // Cannot transpose if key data is missing
    }

    const chordIndex = oldKeyChords.findIndex(c => c.value === chord);

    if (chordIndex === -1) {
        // The chord is not diatonic to the old key, so we don't change it.
        return chord;
    }

    const newChordData = newKeyChords[chordIndex];
    return newChordData ? newChordData.value : chord;
}


function handleKeyDial(direction) {
  // A transpose checkbox could be added to the HTML to enable this functionality
  const transposeCheckbox = document.getElementById('transpose-checkbox');
  const oldKey = currentMusicalKey;

  const newKeyIndex = (currentKeyIndex + direction + musicalKeys.length) % musicalKeys.length;
  const newKey = musicalKeys[newKeyIndex];

  if (transposeCheckbox && transposeCheckbox.checked) {
      saveCurrentProgression(); // Save the currently displayed UI state before transposing

      ['A', 'B', 'C', 'D'].forEach(progLetter => {
          const progData = getProgressionData(progLetter);
          
          progData.p = progData.p.map(chord => transposeChord(chord, oldKey, newKey));
          progData.splitVal = progData.splitVal.map(chord => transposeChord(chord, oldKey, newKey));
      });
  }
  
  // Update the current key regardless of transpose state
  currentKeyIndex = newKeyIndex;
  currentMusicalKey = newKey;

  updateKeyDisplay();
  // We don't need to save/load here, just update the dropdowns and the UI will reflect the new key context
  updateChordDropdowns();
  loadProgression(currentToggle); 
}


function toggleLinkState(progLetter) {
  progressionLinkStates[progLetter] = !progressionLinkStates[progLetter];
  updateLinkVisuals(progLetter);
  updateLinkedProgressionSequence();

  if (isPlaying) {
      slotHighlightStep = 0;
      rhythmStep = 0;
      currentLinkedProgressionIndex = 0; 
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

function loadSong(songId) {
  console.log("Loading song:", songId); 
  const songData = songs[songId];
  if (!songData) {
    console.warn("Song not found:", songId);
    return;
  }

  if (isPlaying) {
    setPlaying(false); 
  }
  
  clearAll();

  const bpmInputElement = document.getElementById('bpmInput');
  if (bpmInputElement) {
    bpmInputElement.value = songData.bpm;
  }

  const newKeyIndex = musicalKeys.indexOf(songData.key);
  if (newKeyIndex !== -1) {
    currentKeyIndex = newKeyIndex;
    currentMusicalKey = musicalKeys[currentKeyIndex];
    updateKeyDisplay();
    updateChordDropdowns(); 
  } else {
    console.warn("Key not found in musicalKeys:", songData.key);
  }

  ['A', 'B', 'C', 'D'].forEach(progLetter => {
    const targetData = getProgressionData(progLetter);
    const songProgDetails = songData.progressions[progLetter];

    if (targetData && songProgDetails) {
      targetData.p.splice(0, 4, ...(songProgDetails.chords || ["", "", "", ""]));
      targetData.r.splice(0, targetData.r.length, ...(songProgDetails.rhythm || Array(8).fill(false)));
      
      for (let i = 0; i < 4; i++) { 
        const modifiers = songProgDetails.modifiers[i] || {};
        targetData.s7[i] = modifiers.seventh || false;
        targetData.s2[i] = modifiers.second || false;
        targetData.s4[i] = modifiers.fourth || false;
        targetData.sus[i] = modifiers.sus || false;
        targetData.maj7[i] = modifiers.majSeventh || false;
        targetData.m[i] = modifiers.quality || 'none';
      }
    }
  });

  if (songId === "eagle-view-song") { 
    ['A', 'B', 'C', 'D'].forEach(progLetter => {
      progressionLinkStates[progLetter] = true;
      updateLinkVisuals(progLetter);
    });
    updateLinkedProgressionSequence(); 
  }

  currentToggle = 'A';
  document.querySelectorAll('.abcd-toggle-btn').forEach(btn => btn.classList.remove('abcd-active'));
  document.getElementById('toggleA')?.classList.add('abcd-active');
  loadProgression('A'); 
}

function updateGridForTimeSignature(numerator) {
    document.documentElement.style.setProperty('--time-sig-beats', numerator);

    for (let i = 0; i < 5; i++) {
        const pic = document.getElementById(`bottomPic${i}`);
        const pair = document.getElementById(`rhythm-box-pair-${i}`);
        if (pic) {
            pic.style.display = i < numerator ? 'flex' : 'none';
        }
        if (pair) {
            pair.style.display = i < numerator ? 'flex' : 'none';
        }
    }
    
    if (isPlaying) {
        restartAnimationWithBpm();
    }
}


function cycleTimeSignature() {
  currentTimeSignatureIndex = (currentTimeSignatureIndex + 1) % timeSignatureNumerators.length;
  const newNumerator = timeSignatureNumerators[currentTimeSignatureIndex];
  document.getElementById('time-sig-top').textContent = newNumerator;
  
  updateGridForTimeSignature(newNumerator);
}

function toggleSplitChord(idx) {
    const currentData = getProgressionData(currentToggle);
    const splitActiveArr = currentData.splitActive;

    const isActive = !splitActiveArr[idx];
    splitActiveArr[idx] = isActive;

    const slot = document.getElementById('slot' + idx);
    const splitBtn = slot.querySelector('.add-split-chord-btn');
    const splitSelect = slot.querySelector('.split-chord-select');

    slot.classList.toggle('split-active', isActive);
    splitBtn.classList.toggle('active', isActive);
    splitSelect.classList.toggle('visible', isActive);
    
    setSlotContent(idx);

    saveCurrentProgression();
}

function _generateChordString(baseChord, progData, idx, isSplit) {
    if (!baseChord || baseChord === 'empty') return '--';

    const s2 = isSplit ? progData.splitS2[idx] : progData.s2[idx];
    const s4 = isSplit ? progData.splitS4[idx] : progData.s4[idx];
    const maj7 = isSplit ? progData.splitMaj7[idx] : progData.maj7[idx];
    const s7 = isSplit ? progData.splitS7[idx] : progData.s7[idx];
    const m = isSplit ? progData.splitM[idx] : progData.m[idx];
    const sus = isSplit ? progData.splitSus[idx] : progData.sus[idx];

    let chordStr = baseChord;
    const appendedMods = [];
    const parenMods = [];

    if (s2) appendedMods.push('2');
    if (s4) appendedMods.push('4');
    if (maj7) appendedMods.push('maj7');
    else if (s7) appendedMods.push('7');

    if (m === 'major') parenMods.push('M');
    if (m === 'minor') parenMods.push('m');
    if (sus) parenMods.push('sus');

    chordStr += appendedMods.join('');
    if (parenMods.length > 0) {
        chordStr += `(${parenMods.join(',')})`;
    }
    return chordStr;
}

function generateSongSummary() {
    saveCurrentProgression();

    const bpm = getBpmInputValue();
    const timeSig = `${timeSignatureNumerators[currentTimeSignatureIndex]}/4`;
    const key = currentMusicalKey;

    let summary = `BPM: ${bpm} | Time Signature: ${timeSig} | Key: ${key}\n\n`;

    ['A', 'B', 'C', 'D'].forEach(progLetter => {
        const progData = getProgressionData(progLetter);
        const linkStatus = progressionLinkStates[progLetter] ? 'linked' : 'unlinked';
        summary += `[Section ${progLetter}, ${linkStatus}]\n`;

        const rhythmText = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
        const activeRhythm = progData.r.map((isActive, i) => isActive ? rhythmText[i] : '').join('');
        summary += `  [Rhythm: ${activeRhythm || 'none'}]\n`;

        const chordsSummary = progData.p.map((chord, idx) => {
            let primaryStr = _generateChordString(chord, progData, idx, false);
            if (progData.splitActive[idx] && progData.splitVal[idx]) {
                const splitStr = _generateChordString(progData.splitVal[idx], progData, idx, true);
                primaryStr += `/${splitStr}`;
            }
            return primaryStr;
        }).join(', ');

        summary += `  [Chords: ${chordsSummary}]\n\n`;
    });

    return summary;
}

function _parseAndApplyModifiers(chordToken, progData, idx, isSplit) {
    if (!chordToken) return;
    
    let remainingToken = chordToken;
    const parenMatch = remainingToken.match(/\((.*)\)/);
    const parenMods = parenMatch ? parenMatch[1] : '';
    if (parenMatch) remainingToken = remainingToken.replace(parenMatch[0], '');

    const mainPartMatch = remainingToken.match(/([A-G][b#]?[a-z]*)(.*)/);
    if (!mainPartMatch) return;

    const baseChord = mainPartMatch[1];
    const appendedMods = mainPartMatch[2];

    const s7 = appendedMods.includes('maj7') || appendedMods.includes('7');
    const maj7 = appendedMods.includes('maj7');
    const s2 = appendedMods.includes('2');
    const s4 = appendedMods.includes('4');
    const m = parenMods.includes('M') ? 'major' : (parenMods.includes('m') ? 'minor' : 'none');
    const sus = parenMods.includes('sus');

    if (isSplit) {
        progData.splitVal[idx] = baseChord;
        progData.splitS7[idx] = s7;
        progData.splitMaj7[idx] = maj7;
        progData.splitS2[idx] = s2;
        progData.splitS4[idx] = s4;
        progData.splitM[idx] = m;
        progData.splitSus[idx] = sus;
        progData.splitActive[idx] = true;
    } else {
        progData.p[idx] = baseChord;
        progData.s7[idx] = s7;
        progData.maj7[idx] = maj7;
        progData.s2[idx] = s2;
        progData.s4[idx] = s4;
        progData.m[idx] = m;
        progData.sus[idx] = sus;
    }
}

function parseAndLoadSongSummary(summaryText) {
    try {
        clearAll();
        const lines = summaryText.split('\n');

        const headerMatch = lines[0].match(/BPM: (\d+).*Time Signature: (\d+)\/4.*Key: (C#|Db|D#|Eb|F#|Gb|G#|Ab|A#|Bb|A|B|C|D|E|F|G)/);
        if (headerMatch) {
            setBpmInputValue(clampBpm(parseInt(headerMatch[1], 10)));
            const timeSigNum = parseInt(headerMatch[2], 10);
            const timeSigIndex = timeSignatureNumerators.indexOf(timeSigNum);
            if (timeSigIndex !== -1) {
                currentTimeSignatureIndex = timeSigIndex;
                document.getElementById('time-sig-top').textContent = timeSigNum;
                updateGridForTimeSignature(timeSigNum);
            }
            const keyName = headerMatch[3];
            const keyIndex = musicalKeys.indexOf(keyName);
            if (keyIndex !== -1) {
                currentKeyIndex = keyIndex;
                currentMusicalKey = musicalKeys[currentKeyIndex];
                updateKeyDisplay();
            }
        }

        const sectionRegex = /\[Section ([A-D]), (linked|unlinked)\]/;
        const rhythmRegex = /\[Rhythm: ([0-9]*)\]/;
        const chordsRegex = /\[Chords: (.*)\]/;
        
        for (let i = 1; i < lines.length; i++) {
            const sectionMatch = lines[i].match(sectionRegex);
            if (sectionMatch) {
                const progLetter = sectionMatch[1];
                const isLinked = sectionMatch[2] === 'linked';
                const progData = getProgressionData(progLetter);
                progressionLinkStates[progLetter] = isLinked;

                const rhythmMatch = (lines[i + 1] || '').match(rhythmRegex);
                if (rhythmMatch) {
                    const rhythmStr = rhythmMatch[1] || '';
                    const rhythmMap = {'1':0, '2':1, '3':2, '4':3, '5':4, '6':5, '7':6, '8':7, '9':8, '0':9};
                    progData.r.fill(false);
                    for (const char of rhythmStr) {
                        if (rhythmMap[char] !== undefined) progData.r[rhythmMap[char]] = true;
                    }
                }

                const chordsMatch = (lines[i + 2] || '').match(chordsRegex);
                if (chordsMatch) {
                    const chordsStr = chordsMatch[1].split(', ');
                    chordsStr.forEach((chordToken, idx) => {
                        if (idx >= 4 || chordToken === '--') return;

                        const [primaryToken, splitToken] = chordToken.split('/');
                        _parseAndApplyModifiers(primaryToken, progData, idx, false);
                        if (splitToken) {
                            _parseAndApplyModifiers(splitToken, progData, idx, true);
                        }
                    });
                }
            }
        }
        
        updateChordDropdowns();
        ['A', 'B', 'C', 'D'].forEach(updateLinkVisuals);
        updateLinkedProgressionSequence();
        loadProgression(currentToggle);
        
    } catch (error) {
        console.error("Failed to parse song summary:", error);
        alert("Could not load the song from the text. Please check the format.");
    }
}


document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM fully loaded. Setting up event listeners."); 

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

  document.querySelectorAll('.slot-box').forEach((slot, idx) => {
    const primarySelect = slot.querySelector('.primary-chord-select');
    primarySelect.addEventListener('change', function() { 
      const currentData = getProgressionData(currentToggle); 
      currentData.p[idx] = this.value; 
      setSlotContent(idx);
      playChordPreview(idx); 
      saveCurrentProgression(); 
    }); 

    const splitSelect = slot.querySelector('.split-chord-select');
    splitSelect.addEventListener('change', function() {
        const currentData = getProgressionData(currentToggle);
        currentData.splitVal[idx] = this.value;
        setSlotContent(idx);
        playSimpleChordPreview(this.value);
        saveCurrentProgression();
    });

    const splitBtn = slot.querySelector('.add-split-chord-btn');
    splitBtn.addEventListener('click', () => toggleSplitChord(idx));
  });

  document.querySelectorAll('.seventh-btn').forEach((btn, idx) => { btn.addEventListener('click', function() { toggleSeventh(idx); }); btn.addEventListener('keydown', function(e) { if (e.key===" "||e.key==="Enter") { e.preventDefault(); toggleSeventh(idx); }}); });
  document.querySelectorAll('.second-btn').forEach((btn, idx) => { btn.addEventListener('click', function() { toggleSecond(idx); }); btn.addEventListener('keydown', function(e) { if (e.key===" "||e.key==="Enter") { e.preventDefault(); toggleSecond(idx); }}); });
  document.querySelectorAll('.fourth-btn').forEach((btn, idx) => { btn.addEventListener('click', function() { toggleFourth(idx); }); btn.addEventListener('keydown', function(e) { if (e.key===" "||e.key==="Enter") { e.preventDefault(); toggleFourth(idx); }}); });
  document.querySelectorAll('.sus-btn').forEach((btn, idx) => { btn.addEventListener('click', function() { toggleSus(idx); }); btn.addEventListener('keydown', function(e) { if (e.key===" "||e.key==="Enter") { e.preventDefault(); toggleSus(idx); }}); });
  document.querySelectorAll('.maj-seventh-btn').forEach((btn, idx) => { btn.addEventListener('click', function() { toggleMajSeventh(idx); }); btn.addEventListener('keydown', function(e) { if (e.key===" "||e.key==="Enter") { e.preventDefault(); toggleMajSeventh(idx); }}); });
  document.querySelectorAll('.slot-box .quality-toggle-btn').forEach((btn, idx) => { btn.addEventListener('click', function() { toggleMajorMinor(idx); }); btn.addEventListener('keydown', function(e) { if (e.key===" "||e.key==="Enter") { e.preventDefault(); toggleMajorMinor(idx); }}); });
  document.querySelectorAll('.bottom-rhythm-box').forEach(box => { function toggleActive(e) { e.preventDefault(); box.classList.toggle('active'); updateRhythmPictures(); saveCurrentProgression(); } box.addEventListener('click', toggleActive); box.addEventListener('touchstart', toggleActive); box.addEventListener('keydown', e => { if (e.key === " " || e.key === "Enter") toggleActive(e); }); });
  const playPauseBtn = document.getElementById('playPauseBtn'); if(playPauseBtn) { function togglePlay(e) { e.preventDefault(); setPlaying(!isPlaying); } playPauseBtn.addEventListener('click', togglePlay); playPauseBtn.addEventListener('keydown', e => { if (e.key === " " || e.key === "Enter") togglePlay(e); }); }
  const bpmInput = document.getElementById('bpmInput'), bpmUp = document.getElementById('bpmUp'), bpmDown = document.getElementById('bpmDown'); if(bpmInput && bpmUp && bpmDown) { bpmInput.addEventListener('change', () => { setBpmInputValue(clampBpm(getBpmInputValue())); restartAnimationWithBpm(); }); bpmUp.addEventListener('click', () => { setBpmInputValue(clampBpm(getBpmInputValue() + 1)); restartAnimationWithBpm(); }); bpmDown.addEventListener('click', () => { setBpmInputValue(clampBpm(getBpmInputValue() - 1)); restartAnimationWithBpm(); }); }
  const clearButton = document.getElementById('clear'); if(clearButton) { clearButton.addEventListener('click', clearAll); clearButton.addEventListener('touchstart', (e)=>{e.preventDefault();clearAll();}); clearButton.addEventListener('keydown', (e)=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();clearAll();}}); }

  const songSelectDropdown = document.getElementById('song-select');
  if (songSelectDropdown) {
    songSelectDropdown.addEventListener('change', function() {
      if (this.value) { 
        loadSong(this.value);
      }
    });
  }
  
  const timeSigButton = document.getElementById('time-sig-top');
  if (timeSigButton) {
    timeSigButton.addEventListener('click', cycleTimeSignature);
  }

  // Save Modal Logic
  const saveSongBtn = document.getElementById('save-song-btn');
  const saveModalOverlay = document.getElementById('save-modal-overlay');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelSaveBtn = document.getElementById('cancel-save-btn');
  const submitSaveBtn = document.getElementById('submit-save-btn');
  const summaryTextarea = document.getElementById('song-summary-textarea');
  
  function openModal() {
    summaryTextarea.value = generateSongSummary();
    saveModalOverlay.classList.remove('modal-hidden');
  }
  function closeModal() {
    saveModalOverlay.classList.add('modal-hidden');
  }

  saveSongBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  cancelSaveBtn.addEventListener('click', closeModal);
  submitSaveBtn.addEventListener('click', () => {
    parseAndLoadSongSummary(summaryTextarea.value);
    closeModal();
  });
  saveModalOverlay.addEventListener('click', (e) => {
    if (e.target === saveModalOverlay) {
      closeModal();
    }
  });
  
  // Initial setup
  updateGridForTimeSignature(timeSignatureNumerators[currentTimeSignatureIndex]);
  updateRhythmPictures();
  for (let i = 0; i < 4; i++) unhighlightSlot(i);
  for (let i = 0; i < 5; i++) unhighlightPicture(i);
  setPlaying(false); 
  loadProgression(currentToggle); 
});

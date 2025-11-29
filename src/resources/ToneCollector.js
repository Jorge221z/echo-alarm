// Use 'require' to make RN resolve static resources correctly
export const DEFAULT_TONES_DATA = [
  { 
    id: 'default_1', // Unique identifier
    name: 'Bossfight Starship', 
    source: require('./bossfight_starship.mp3'),
    isDefault: true // Useful for UI logic (e.g., prevent deletion)
  },
  { 
    id: 'default_2', 
    name: 'Losing Game', 
    source: require('./losing_game.mp3'),
    isDefault: true
  },
  { 
    id: 'default_3', 
    name: 'Mateo', 
    source: require('./mateo.mp3'),
    isDefault: true
  },
];
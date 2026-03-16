export interface TeamMatch {
  id: string;
  name: string;
  flag: string;
  score?: number;
}

export interface Match {
  id: string;
  stage: 'groups' | 'r32' | 'r16' | 'qf' | 'sf' | 'final';
  team1?: TeamMatch;
  team2?: TeamMatch;
  date?: string;
  time?: string;
  venue?: string;
  status: 'upcoming' | 'live' | 'finished';
  winnerId?: string;
}

// Mock initial bracket structure for WC 2026
export const knockoutMatches: Record<string, Match[]> = {
  r32: Array.from({ length: 16 }, (_, i) => ({
    id: `r32-${i + 1}`,
    stage: 'r32',
    status: 'upcoming',
  })),
  r16: Array.from({ length: 8 }, (_, i) => ({
    id: `r16-${i + 1}`,
    stage: 'r16',
    status: 'upcoming',
  })),
  qf: Array.from({ length: 4 }, (_, i) => ({
    id: `qf-${i + 1}`,
    stage: 'qf',
    status: 'upcoming',
  })),
  sf: Array.from({ length: 2 }, (_, i) => ({
    id: `sf-${i + 1}`,
    stage: 'sf',
    status: 'upcoming',
  })),
  final: [
    {
      id: 'final-1',
      stage: 'final',
      status: 'upcoming',
    }
  ]
};

// Some initial mock matches for the Round of 32 to show the UI
knockoutMatches.r32[0] = {
  id: 'r32-1',
  stage: 'r32',
  status: 'finished',
  team1: { id: 'mexico', name: 'México', flag: 'https://flagcdn.com/w640/mx.png', score: 2 },
  team2: { id: 'sudafrica', name: 'Sudáfrica', flag: 'https://flagcdn.com/w640/za.png', score: 1 },
  winnerId: 'mexico'
};

knockoutMatches.r32[1] = {
  id: 'r32-2',
  stage: 'r32',
  status: 'finished',
  team1: { id: 'brasil', name: 'Brasil', flag: 'https://flagcdn.com/w640/br.png', score: 3 },
  team2: { id: 'escocia', name: 'Escocia', flag: 'https://flagcdn.com/w640/gb-sct.png', score: 0 },
  winnerId: 'brasil'
};

// Winners advance to R16-1
knockoutMatches.r16[0] = {
  id: 'r16-1',
  stage: 'r16',
  status: 'upcoming',
  team1: { id: 'mexico', name: 'México', flag: 'https://flagcdn.com/w640/mx.png' },
  team2: { id: 'brasil', name: 'Brasil', flag: 'https://flagcdn.com/w640/br.png' },
  date: '2026-07-04',
  time: '12:00',
  venue: 'AT&T Stadium, Dallas'
};


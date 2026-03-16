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

// Fixed initial bracket structure for WC 2026 - All TBD as tournament hasn't started
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

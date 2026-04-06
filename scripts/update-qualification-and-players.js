/**
 * update-qualification-and-players.js
 *
 * Safely syncs player data:
 *  1. Removes retired / excluded players
 *  2. Cleans orphaned player references from team rosters
 *
 * NOTE: Qualified status and team list are managed directly in
 * src/content/teams/data.json — do NOT derive them here.
 */

import fs from 'fs';
import path from 'path';

const teamsPath = path.join(process.cwd(), 'src', 'content', 'teams', 'data.json');
const playersPath = path.join(process.cwd(), 'src', 'content', 'players', 'data.json');

const teamsData = JSON.parse(fs.readFileSync(teamsPath, 'utf8'));
let playersData = JSON.parse(fs.readFileSync(playersPath, 'utf8'));

// Players to exclude (retired or not in the competition)
const EXCLUDED_PLAYERS = [
  'di maria', 'ángel di maría',
  'suarez', 'luis suárez',
  'cavani', 'edinson cavani',
  'griezmann', 'antoine griezmann',
];

const normalize = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// 1. Remove excluded players
const activePlayers = playersData.filter((p) => {
  const norm = normalize(p.name);
  const excluded = EXCLUDED_PLAYERS.some((ex) => norm.includes(normalize(ex)));
  if (excluded) console.log(`  [REMOVE] ${p.name}`);
  return !excluded;
});

// 2. Remove orphaned player IDs from team rosters
const activeIds = new Set(activePlayers.map((p) => p.id));
let orphansRemoved = 0;
for (const team of teamsData) {
  if (team.players) {
    const before = team.players.length;
    team.players = team.players.filter((pid) => activeIds.has(pid));
    orphansRemoved += before - team.players.length;
  }
}

// 3. Write
fs.writeFileSync(teamsPath, JSON.stringify(teamsData, null, 2));
fs.writeFileSync(playersPath, JSON.stringify(activePlayers, null, 2));

console.log(`\nDone.`);
console.log(`  Players kept   : ${activePlayers.length}`);
console.log(`  Players removed: ${playersData.length - activePlayers.length}`);
console.log(`  Orphan refs    : ${orphansRemoved}`);

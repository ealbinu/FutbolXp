import fs from 'fs';
import path from 'path';

const teamsPath = path.join(process.cwd(), 'src', 'content', 'teams', 'data.json');
const teamsData = JSON.parse(fs.readFileSync(teamsPath, 'utf8'));

// Official FIFA World Cup 2026 Groups (Draw: Dec 5, 2025)
// 42 confirmed + 6 playoff spots
const officialGroups = {
  A: ['mexico', 'sudafrica', 'corea-del-sur'], // + UEFA Playoff D winner
  B: ['canada', 'suiza', 'catar'],              // + UEFA Playoff A winner
  C: ['brazil', 'marruecos', 'escocia', 'haiti'],
  D: ['estados-unidos', 'paraguay', 'australia'], // + UEFA Playoff C winner
  E: ['alemania', 'ecuador', 'costas-de-marfil', 'curazao'],
  F: ['paises-bajos', 'japon', 'tunez'],         // + UEFA Playoff B winner
  G: ['belgica', 'iran', 'egipto', 'nueva-zelanda'],
  H: ['espana', 'uruguay', 'arabia-saudita', 'cabo-verde'],
  I: ['francia', 'senegal', 'noruega'],          // + Intercontinental Playoff 2 winner
  J: ['argentina', 'argelia', 'austria', 'jordania'],
  K: ['portugal', 'uzbekistan', 'colombia'],     // + Intercontinental Playoff 1 winner
  L: ['inglaterra', 'croacia', 'ghana', 'panama'],
};

// Qualified teams (all 42 confirmed)

// Build reverse lookup: teamId -> group
const idToGroup = {};
for (const [group, ids] of Object.entries(officialGroups)) {
  for (const id of ids) {
    idToGroup[id] = group;
  }
}

// Teams that need to be added if missing
const missingTeams = [
  { id: 'sudafrica', name: 'Sudáfrica', code: 'RSA', continent: 'Africa', flag: 'https://flagcdn.com/w640/za.png' },
  { id: 'haiti', name: 'Haití', code: 'HAI', continent: 'North America', flag: 'https://flagcdn.com/w640/ht.png' },
  { id: 'curazao', name: 'Curazao', code: 'CUW', continent: 'North America', flag: 'https://flagcdn.com/w640/cw.png' },
  { id: 'noruega', name: 'Noruega', code: 'NOR', continent: 'Europe', flag: 'https://flagcdn.com/w640/no.png' },
  { id: 'senegal', name: 'Senegal', code: 'SEN', continent: 'Africa', flag: 'https://flagcdn.com/w640/sn.png' },
  { id: 'argelia', name: 'Argelia', code: 'ALG', continent: 'Africa', flag: 'https://flagcdn.com/w640/dz.png' },
  { id: 'jordania', name: 'Jordania', code: 'JOR', continent: 'Asia', flag: 'https://flagcdn.com/w640/jo.png' },
  { id: 'uzbekistan', name: 'Uzbekistán', code: 'UZB', continent: 'Asia', flag: 'https://flagcdn.com/w640/uz.png' },
  { id: 'nueva-zelanda', name: 'Nueva Zelanda', code: 'NZL', continent: 'Oceania', flag: 'https://flagcdn.com/w640/nz.png' },
  { id: 'cabo-verde', name: 'Cabo Verde', code: 'CPV', continent: 'Africa', flag: 'https://flagcdn.com/w640/cv.png' },
  { id: 'costas-de-marfil', name: 'Costa de Marfil', code: 'CIV', continent: 'Africa', flag: 'https://flagcdn.com/w640/ci.png' },
  { id: 'catar', name: 'Catar', code: 'QAT', continent: 'Asia', flag: 'https://flagcdn.com/w640/qa.png' },
  { id: 'sudafrica', name: 'Sudáfrica', code: 'RSA', continent: 'Africa', flag: 'https://flagcdn.com/w640/za.png' },
  { id: 'corea-del-sur', name: 'Corea del Sur', code: 'KOR', continent: 'Asia', flag: 'https://flagcdn.com/w640/kr.png' },
];

const existingIds = new Set(teamsData.map(t => t.id));

// Add missing teams
for (const mt of missingTeams) {
  if (!existingIds.has(mt.id)) {
    console.log(`Añadiendo equipo: ${mt.name}`);
    teamsData.push({
      id: mt.id,
      name: mt.name,
      code: mt.code,
      continent: mt.continent,
      qualified: true,
      flag: mt.flag,
      players: [],
      news: [],
      social: {}
    });
    existingIds.add(mt.id);
  }
}

// Update all teams
let classifiedCount = 0;
for (const team of teamsData) {
  if (idToGroup[team.id]) {
    team.group = idToGroup[team.id];
    team.qualified = true;
    classifiedCount++;
  } else {
    // Not in any confirmed group
    team.group = undefined;
    team.qualified = false;
  }
}

// Remove teams that are not classified AND have no content
const finalTeams = teamsData.filter(t => {
  if (t.qualified) return true;
  // Keep unqualified teams that have players or news
  if (t.players && t.players.length > 0) return true;
  if (t.news && t.news.length > 0) return true;
  console.log(`Removiendo equipo sin clasificar y sin contenido: ${t.name}`);
  return false;
});

fs.writeFileSync(teamsPath, JSON.stringify(finalTeams, null, 2));

console.log(`\nResumen:`);
console.log(`  Equipos clasificados: ${classifiedCount}`);
console.log(`  Equipos totales en archivo: ${finalTeams.length}`);
console.log(`  Equipos por playoff: 6 plazas pendientes (UEFA Playoffs A/B/C/D + Intercontinental 1/2)`);

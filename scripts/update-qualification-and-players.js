import fs from 'fs';
import path from 'path';

const teamsPath = path.join(process.cwd(), 'src', 'content', 'teams', 'data.json');
const playersPath = path.join(process.cwd(), 'src', 'content', 'players', 'data.json');

const teamsData = JSON.parse(fs.readFileSync(teamsPath, 'utf8'));
let playersData = JSON.parse(fs.readFileSync(playersPath, 'utf8'));

const qualifiedTeams = [
  "Estados Unidos", "Canadá", "México", "Panamá", "Haití", "Curazao",
  "Argentina", "Brasil", "Ecuador", "Uruguay", "Colombia", "Paraguay",
  "España", "Bélgica", "Suiza", "Austria", "Escocia", "Inglaterra",
  "Francia", "Croacia", "Portugal", "Noruega", "Alemania", "Países Bajos",
  "Irán", "Uzbekistán", "Corea del Sur", "Jordania", "Japón", "Australia",
  "Catar", "Arabia Saudita", "Marruecos", "Túnez", "Egipto", "Argelia",
  "Ghana", "Cabo Verde", "Sudáfrica", "Senegal", "Costa de Marfil", "Nueva Zelanda"
];

// Normalize text for comparison
const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const qualifiedNormalized = qualifiedTeams.map(normalize);

const existingTeamsSet = new Set(teamsData.map(t => normalize(t.name)));

// 1. Update status
for (const team of teamsData) {
  const normName = normalize(team.name);
  team.qualified = qualifiedNormalized.includes(normName);
}

// 2. Add missing qualified teams
for (let i = 0; i < qualifiedTeams.length; i++) {
  const normName = qualifiedNormalized[i];
  if (!existingTeamsSet.has(normName)) {
    console.log(`Añadiendo equipo clasificado que faltaba: ${qualifiedTeams[i]}`);
    teamsData.push({
      id: normName.replace(/\s+/g, '-'),
      name: qualifiedTeams[i],
      code: normName.substring(0, 3).toUpperCase(),
      continent: "Por Definir",
      qualified: true,
      flag: `https://flagcdn.com/w640/${normName.substring(0, 2)}.png`, // Placeholder flag
      players: [],
      news: []
    });
  }
}

// 3. Update the retired players
const retiredFilters = ["di maria", "suarez", "cavani", "griezmann"];

const activePlayers = playersData.filter(p => {
  const pNorm = normalize(p.name);
  for (const r of retiredFilters) {
    if (pNorm.includes(r)) {
      console.log(`Eliminando jugador retirado: ${p.name}`);
      return false;
    }
  }
  return true;
});

const activeIds = new Set(activePlayers.map(p => p.id));

for (const team of teamsData) {
  if (team.players) {
    team.players = team.players.filter(pid => activeIds.has(pid));
  }
}

fs.writeFileSync(teamsPath, JSON.stringify(teamsData, null, 2));
fs.writeFileSync(playersPath, JSON.stringify(activePlayers, null, 2));

console.log("Datos actualizados correctamente.");

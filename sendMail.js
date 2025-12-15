const fetch = require("node-fetch");
const nodemailer = require("nodemailer");

const API_KEY = "123";

const competitions = [
  { name: "Jupiler Pro League", id: 4341 },
  { name: "Eredivisie", id: 4337 },
  { name: "Premier League", id: 4328 },
  { name: "La Liga", id: 4335 },
  { name: "Bundesliga", id: 4331 },
  { name: "Serie A", id: 4332 }
];

// Functie om HTML per competitie te genereren
async function getLeagueHTML(league) {
  const res = await fetch(
    `https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventspastleague.php?id=${league.id}`
  );
  if (!res.ok) {
    console.log(`Fout bij ophalen ${league.name}:`, res.status);
    return "";
  }
  const data = await res.json();
  if (!data.events) return "";

  const lastRound = Math.max(
    ...data.events
      .filter(e => e.intRound)
      .map(e => parseInt(e.intRound))
  );

  const matches = data.events.filter(
    match => parseInt(match.intRound) === lastRound
  );

  if (matches.length === 0) return "";

  let html = `
    <tr>
      <td style="padding:20px 0;"

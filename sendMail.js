const fetch = require("node-fetch");
const nodemailer = require("nodemailer");

const API_KEY = "123";

// Jupiler Pro League altijd eerst
const competitions = [
  { name: "Jupiler Pro League", id: 4341, color: "#ffcc00" },
  { name: "Eredivisie", id: 4337, color: "#da291c" },
  { name: "Premier League", id: 4328, color: "#1b458f" },
  { name: "La Liga", id: 4335, color: "#f1bf00" },
  { name: "Bundesliga", id: 4331, color: "#e2001a" },
  { name: "Serie A", id: 4332, color: "#0066b3" }
];

async function getLeagueHTML(league) {
  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventspastleague.php?id=${league.id}`
    );
    if (!res.ok) return "";
    const data = await res.json();
    if (!data.events || data.events.length === 0) return "";

    // ➜ Neem het MEEST RECENTE event
    const latestEvent = data.events
      .filter(e => e.strRound)
      .sort((a, b) => new Date(b.dateEvent) - new Date(a.dateEvent))[0];

    if (!latestEvent) return "";

    const roundName = latestEvent.strRound;

    // ➜ ALLE wedstrijden van die speeldag
    const matches = data.events.filter(e => e.strRound === roundName);

    if (matches.length === 0) return "";

    let html = `
<tr>
<td style="padding:15px 0;">
<h2 style="margin:0;padding:10px;background:${league.color};color:#ffffff;border-radius:5px;text-align:center;font-family:Arial,sans-serif;">
${league.name} – ${roundName}
</h2>
<table width="100%" cellpadding="6" cellspacing="0" style="font-family:Arial,sans-serif;margin-top:5px;">
`;

    matches.forEach(match => {
      html += `
<tr>
<td style="border-bottom:1px solid #ddd;padding:6px 0;">
${match.strHomeTeam} ${match.intHomeScore} - ${match.intAwayScore} ${match.strAwayTeam}
</td>
</tr>`;
    });

    html += `
</table>
</td>
</tr>`;

    return html;
  } catch (err) {
    console.error("Fou

}

// Start script
sendMail();

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

async function getLeagueHTML(league) {
  const res = await fetch(
    `https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventspastleague.php?id=${league.id}`
  );
  const data = await res.json();
  if (!data.events) return "";

  const lastRound = Math.max(
    ...data.events
      .filter(e => e.intRound)
      .map(e => parseInt(e.intRound))
  );

  const matches = data.events.filter(
    m => parseInt(m.intRound) === lastRound
  );

  if (matches.length === 0) return "";

  let html = `
    <tr>
      <td style="padding:20px 0;">
        <h2 style="color:#0b3d91;">
          ${league.name} – Speeldag ${lastRound}
        </h2>
        <table width="100%">
  `;

  matches.forEach(m => {
    html += `
      <tr>
        <td style="border-bottom:1px solid #ddd;padding:6px 0;">
          <strong>${m.strHomeTeam}</strong>
          ${m.intHomeScore} - ${m.intAwayScore}
          <strong>${m.strAwayTeam}</strong>
        </td>
      </tr>
    `;
  });

  html += `</table></td></tr>`;
  return html;
}

async function buildEmailHTML() {
  let content = "";
  for (const league of competitions) {
    content += await getLeagueHTML(league);
  }

  return `
  <html>
  <body style="background:#f4f6f8;margin:0;">
    <table width="100%">
      <tr>
        <td align="center">
          <table width="600" style="background:#fff;font-family:Arial;">
            <tr>
              <td style="background:#0b3d91;color:#fff;text-align:center;padding:20px;">
                <h1>⚽ VOETBAL ACTUEEL</h1>
                <p>Uitslagen van de voorbije speeldag</p>
              </td>
            </tr>
            ${content}
            <tr>
              <td style="text-align:center;font-size:12px;color:#666;padding:20px;">
                Automatisch verzonden
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
 

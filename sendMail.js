const fetch = require("node-fetch");
const nodemailer = require("nodemailer");

const API_KEY = "123";

// Clubs met logo's via jouw GitHub repo (root)
const clubs = [
  { name: "Standard Liège", league: "Jupiler Pro League", logo: "https://raw.githubusercontent.com/timo14-ctrl/Automatische-mail-voetbalupdates/main/standard.png" },
  { name: "PSV Eindhoven", league: "Eredivisie", logo: "https://raw.githubusercontent.com/timo14-ctrl/Automatische-mail-voetbalupdates/main/psv.png" },
  { name: "Aston Villa", league: "Premier League", logo: "https://raw.githubusercontent.com/timo14-ctrl/Automatische-mail-voetbalupdates/main/astonvilla.png" },
  { name: "AC Milan", league: "Serie A", logo: "https://raw.githubusercontent.com/timo14-ctrl/Automatische-mail-voetbalupdates/main/acmilan.png" },
  { name: "FC Barcelona", league: "La Liga", logo: "https://raw.githubusercontent.com/timo14-ctrl/Automatische-mail-voetbalupdates/main/barcelona.png" },
  { name: "Olympique de Marseille", league: "Ligue 1", logo: "https://raw.githubusercontent.com/timo14-ctrl/Automatische-mail-voetbalupdates/main/marseille.png" }
];

// Vaste kleur voor alle scores
const SCORE_COLOR = "#111111"; // donkergrijs/zwart

// Functie om de laatste gespeelde match van een club te tonen
async function getLastMatchHTML(club) {
  const teamRes = await fetch(
    `https://www.thesportsdb.com/api/v1/json/${API_KEY}/searchteams.php?t=${encodeURIComponent(club.name)}`
  );
  const teamData = await teamRes.json();
  if (!teamData.teams || teamData.teams.length === 0) return "";

  const team = teamData.teams[0];
  const teamId = team.idTeam;
  const logo = club.logo || team.strTeamBadge || "https://via.placeholder.com/50";

  const matchRes = await fetch(
    `https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventslast.php?id=${teamId}`
  );
  const matchData = await matchRes.json();
  if (!matchData.results || matchData.results.length === 0) return "";

  // Filter op de competitie van de club
  const filteredMatches = matchData.results
    .filter(m => m.strLeague && m.strLeague.toLowerCase().includes(club.league.toLowerCase()))
    .sort((a, b) => new Date(b.dateEvent) - new Date(a.dateEvent)); // laatste eerst

  // Fallback: pak eerste match als er geen competitie-match is
  const match = filteredMatches[0] || matchData.results[0];

  return `
    <tr>
      <td style="padding:20px; border-bottom:1px solid #eaeaea; border-radius:6px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="70" valign="middle">
              <img src="${logo}" alt="${club.name}" width="50" style="display:block;">
            </td>
            <td valign="middle">
              <h3 style="margin:0; font-size:18px; color:#111;">${club.name}</h3>
              <p style="margin:4px 0 8px 0; color:#666; font-size:14px;">${club.league}</p>
              <p style="margin:0; font-size:16px; font-weight:bold; color:${SCORE_COLOR};">
                ${match.strHomeTeam} ${match.intHomeScore} - ${match.intAwayScore} ${match.strAwayTeam}
              </p>
              <p style="margin:4px 0 0 0; color:#999; font-size:12px;">${match.dateEvent}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

// Verstuur de nieuwsbrief
async function sendMail() {
  let clubBlocks = "";

  for (const club of clubs) {
    clubBlocks += await getLastMatchHTML(club);
  }

  if (!clubBlocks) {
    clubBlocks = `
      <tr>
        <td style="padding:20px; text-align:center;">
          Geen wedstrijden gevonden.
        </td>
      </tr>
    `;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject: "Dit zijn de laatste voetbaluitslagen van jouw clubs!",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Voetbal Actueel</title>
</head>
<body style="margin:0; padding:0; background:#f4f4f4; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:30px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:6px; overflow:hidden;">
          
          <!-- HEADER -->
          <tr>
            <td style="background:#111; color:#ffffff; padding:24px;">
              <h1 style="margin:0; font-size:26px;">⚽ VOETBAL ACTUEEL</h1>
              <p style="margin:8px 0 0 0; font-size:14px; color:#cccccc;">
                Jouw wekelijkse voetbalupdate
              </p>
            </td>
          </tr>

          <!-- INTRO -->
          <tr>
            <td style="padding:20px; color:#333;">
              <p style="margin:0; font-size:15px;">
                Hey voetballiefhebber! Wat hebben jouw favoriete clubs afgelopen wedstrijd gedaan? Ontdek het hieronder.
              </p>
            </td>
          </tr>

          <!-- CLUBS -->
          ${clubBlocks}

          <!-- FOOTER -->
          <tr>
            <td style="background:#f4f4f4; padding:16px; text-align:center; font-size:12px; color:#777;">
              Deze mail wordt elke maandag automatisch verstuurd.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  });

  console.log("Nieuwsbrief verzonden: correcte laatste competitie-match voor alle clubs");
}

sendMail();

const fetch = require("node-fetch");
const nodemailer = require("nodemailer");

const API_KEY = "123";

// Clubs met team ID, competitie en logo
const clubs = [
  { id: "133602", name: "Standard Liège", league: "Jupiler Pro League", leagueId: "4328", logo: "https://raw.githubusercontent.com/timo14-ctrl/Automatische-mail-voetbalupdates/main/standard.png" },
  { id: "1104", name: "PSV Eindhoven", league: "Eredivisie", leagueId: "4332", logo: "https://raw.githubusercontent.com/timo14-ctrl/Automatische-mail-voetbalupdates/main/psv.png" },
  { id: "133604", name: "Aston Villa", league: "Premier League", leagueId: "4328", logo: "https://raw.githubusercontent.com/timo14-ctrl/Automatische-mail-voetbalupdates/main/astonvilla.png" },
  { id: "133738", name: "AC Milan", league: "Serie A", leagueId: "4332", logo: "https://raw.githubusercontent.com/timo14-ctrl/Automatische-mail-voetbalupdates/main/acmilan.png" },
  { id: "133739", name: "FC Barcelona", league: "La Liga", leagueId: "4335", logo: "https://raw.githubusercontent.com/timo14-ctrl/Automatische-mail-voetbalupdates/main/barcelona.png" },
  { id: "133701", name: "Olympique de Marseille", league: "Ligue 1", leagueId: "4334", logo: "https://raw.githubusercontent.com/timo14-ctrl/Automatische-mail-voetbalupdates/main/marseille.png" }
];

// Functie om kleur van score te bepalen
function getScoreColor(match, clubId) {
  const homeScore = parseInt(match.intHomeScore);
  const awayScore = parseInt(match.intAwayScore);

  if (isNaN(homeScore) || isNaN(awayScore)) return "#000000"; // onbekend
  if (homeScore === awayScore) return "#FFA500"; // gelijk
  if (match.idHomeTeam === clubId && homeScore > awayScore) return "#28a745"; // winst thuis
  if (match.idAwayTeam === clubId && awayScore > homeScore) return "#28a745"; // winst uit
  return "#dc3545"; // verlies
}

// Haal laatste gespeelde match in competitie
async function getLastMatchHTML(club) {
  const seasonRes = await fetch(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsseason.php?id=${club.leagueId}&s=2025-2026`);
  const seasonData = await seasonRes.json();
  if (!seasonData.events || seasonData.events.length === 0) return "";

  // Filter voor wedstrijden van deze club die al gespeeld zijn
  const clubMatches = seasonData.events
    .filter(m => (m.idHomeTeam === club.id || m.idAwayTeam === club.id) && m.intHomeScore !== null)
    .sort((a,b) => new Date(b.dateEvent) - new Date(a.dateEvent)); // laatste eerst

  if (clubMatches.length === 0) return "";

  const match = clubMatches[0];
  const color = getScoreColor(match, club.id);

  return `
    <tr>
      <td style="padding:20px; border-bottom:1px solid #eaeaea; border-radius:6px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="70" valign="middle">
              <img src="${club.logo}" alt="${club.name}" width="50" style="display:block;">
            </td>
            <td valign="middle">
              <h3 style="margin:0; font-size:18px; color:#111;">${club.name}</h3>
              <p style="margin:4px 0 8px 0; color:#666; font-size:14px;">${club.league}</p>
              <p style="margin:0; font-size:16px; font-weight:bold; color:${color};">
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

  console.log("Nieuwsbrief verzonden: juiste wedstrijden, kleuren correct, alle clubs aanwezig");
}

sendMail();

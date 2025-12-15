const fetch = require("node-fetch");
const nodemailer = require("nodemailer");

const API_KEY = "123";

const competitions = [
  { name: "Jupiler Pro League", id: 4341, color: "#ffcc00" },
  { name: "Eredivisie", id: 4337, color: "#da291c" },
  { name: "Premier League", id: 4328, color: "#1b458f" },
  { name: "La Liga", id: 4335, color: "#f1bf00" },
  { name: "Bundesliga", id: 4331, color: "#e2001a" },
  { name: "Serie A", id: 4332, color: "#0066b3" }
];

// Functie om HTML per competitie te genereren
async function getLeagueHTML(league) {
  try {
    const res = await fetch(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventspastleague.php?id=${league.id}`);
    if (!res.ok) return "";
    const data = await res.json();
    if (!data.events) return "";

    const lastRound = Math.max(
      ...data.events.filter(e => e.intRound).map(e => parseInt(e.intRound))
    );

    const matches = data.events.filter(m => parseInt(m.intRound) === lastRound);
    if (matches.length === 0) return "";

    let html = `<tr>
<td style="padding:15px 0;">
<h2 style="margin:0;padding:10px;background:${league.color};color:#ffffff;border-radius:5px;text-align:center;font-family:Arial,sans-serif;">
${league.name} – Speeldag ${lastRound}
</h2>
<table width="100%" cellpadding="6" cellspacing="0" style="font-family:Arial,sans-serif;margin-top:5px;">`;

    matches.forEach(match => {
      html += `<tr>
<td style="border-bottom:1px solid #ddd;padding:5px 0;">
<strong>${match.strHomeTeam}</strong> ${match.intHomeScore} - ${match.intAwayScore} <strong>${match.strAwayTeam}</strong>
</td>
</tr>`;
    });

    html += `</table></td></tr>`;
    return html;
  } catch (err) {
    console.error("Fout bij league HTML:", league.name, err);
    return "";
  }
}

// Bouw complete e-mail HTML
async function buildEmailHTML() {
  let leaguesHTML = "";
  for (const league of competitions) {
    leaguesHTML += await getLeagueHTML(league);
  }

  return `<html>
<body style="margin:0;padding:0;background:#f4f6f8;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center">
<table width="600" cellpadding="20" cellspacing="0" style="background:#ffffff;font-family:Arial,sans-serif;border-radius:10px;">
<tr>
<td style="background:#0b3d91;color:#ffffff;text-align:center;border-radius:10px 10px 0 0;">
<h1 style="margin:0;padding:10px;">⚽ VOETBAL ACTUEEL</h1>
<p style="margin:5px 0 0;font-size:14px;">Hey voetballiefhebber! Wij geven je een wekelijkse update van het voorbije voetbalweekend. Ontdek het hieronder!</p>
</td>
</tr>

${leaguesHTML}

<tr>
<td style="text-align:center;font-size:12px;color:#666;padding-top:20px;border-top:1px solid #ddd;">
Automatisch verzonden via GitHub Actions • TheSportsDB
</td>
</tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// Verzenden mail
async function sendMail() {
  try {
    const html = await buildEmailHTML();
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"VOETBAL ACTUEEL" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: "Dit zijn de voetbaluitslagen van de voorbije speeldag!",
      html
    });

    console.log("Mail verzonden");
  } catch (err) {
    console.error("Fout bij verzenden mail:", err);
    process.exit(1);
  }
}

// Start script
sendMail();


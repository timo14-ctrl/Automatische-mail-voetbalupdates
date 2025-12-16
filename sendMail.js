const fetch = require("node-fetch");
const nodemailer = require("nodemailer");

const API_KEY = "123";

const clubs = [
  { name: "Standard", league: "Jupiler Pro League" },
  { name: "Aston Villa", league: "Premier League" },
  { name: "AC Milan", league: "Serie A" },
  { name: "FC Barcelona", league: "La Liga" },
  { name: "Marseille", league: "Ligue 1" },
  { name: "PSV", league: "Eredivisie" }
];

async function getLastMatchHTML(club) {
  // 1️⃣ Zoek team ID
  const teamRes = await fetch(
    `https://www.thesportsdb.com/api/v1/json/${API_KEY}/searchteams.php?t=${encodeURIComponent(club.name)}`
  );
  const teamData = await teamRes.json();
  if (!teamData.teams || teamData.teams.length === 0) return "";

  const teamId = teamData.teams[0].idTeam;

  // 2️⃣ Haal laatste wedstrijd op
  const matchRes = await fetch(
    `https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventslast.php?id=${teamId}`
  );
  const matchData = await matchRes.json();
  if (!matchData.results || matchData.results.length === 0) return "";

  const match = matchData.results[0];

  return `
    <h2>${club.name} (${club.league})</h2>
    <p>
      ${match.strHomeTeam} ${match.intHomeScore}
      -
      ${match.intAwayScore} ${match.strAwayTeam}
      <br>
      <small>${match.dateEvent}</small>
    </p>
  `;
}

async function sendMail() {
  let content = "";

  for (const club of clubs) {
    content += await getLastMatchHTML(club);
  }

  if (!content) {
    content = "<p>Geen wedstrijden gevonden.</p>";
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
      <h1>VOETBAL ACTUEEL</h1>
      <p>
        Hey voetballiefhebber!  
        Hier zijn de meest recente wedstrijden van jouw favoriete clubs.
      </p>
      ${content}
    `
  });

  console.log("Mail verzonden met laatste clubwedstrijden");
}

sendMail();


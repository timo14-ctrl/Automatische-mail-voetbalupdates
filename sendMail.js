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
  if (!data.events || data.events.length === 0) return "";

  // Tel hoe vaak elke strRound voorkomt
  const roundCount = {};
  data.events.forEach(e => {
    if (e.strRound) {
      roundCount[e.strRound] = (roundCount[e.strRound] || 0) + 1;
    }
  });

  const rounds = Object.keys(roundCount);
  if (rounds.length === 0) return "";

  // Neem de speeldag met de meeste wedstrijden
  const bestRound = rounds.sort(
    (a, b) => roundCount[b] - roundCount[a]
  )[0];

  const matches = data.events.filter(e => e.strRound === bestRound);
  if (matches.length === 0) return "";

  let html = `<h2>${league.name} - ${bestRound}</h2><ul>`;

  matches.forEach(m => {
    html += `<li>${m.strHomeTeam} ${m.intHomeScore} - ${m.intAwayScore} ${m.strAwayTeam}</li>`;
  });

  html += `</ul>`;
  return html;
}

async function sendMail() {
  let content = "";

  for (const league of competitions) {
    content += await getLeagueHTML(league);
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
    subject: "Dit zijn de voetbaluitslagen van de voorbije speeldag!",
    html: `
      <h1>VOETBAL ACTUEEL</h1>
      <p>
        Hey voetballiefhebber! Wij geven je een wekelijkse update van het voorbije voetbalweekend.
      </p>
      ${content}
    `
  });

  console.log("Mail verzonden met wedstrijden");
}

sendMail();

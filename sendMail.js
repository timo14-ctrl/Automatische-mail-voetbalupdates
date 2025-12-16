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

// datum X dagen geleden
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function getLeagueHTML(league) {
  const res = await fetch(
    `https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventspastleague.php?id=${league.id}`
  );
  const data = await res.json();
  if (!data.events) return "";

  const oneWeekAgo = daysAgo(7);

  // ➜ alle matchen van de laatste 7 dagen
  const matches = data.events.filter(e => {
    if (!e.dateEvent) return false;
    return new Date(e.dateEvent) >= oneWeekAgo;
  });

  if (matches.length === 0) return "";

  let html = `<h2>${league.name} – Wedstrijden van de voorbije speeldag</h2><ul>`;

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
    content = "<p>Geen wedstrijden gespeeld in de voorbije week.</p>";
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


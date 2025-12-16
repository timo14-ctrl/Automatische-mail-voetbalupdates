const fetch = require("node-fetch");
const nodemailer = require("nodemailer");

const API_KEY = "123";

const competitions = [
  { name: "Jupiler Pro League", id: 4341 },
  { name: "Eredivisie", id: 4337 },
  { name: "Premier League", id: 4328 }
];

async function getLeagueHTML(league) {
  const res = await fetch(
    "https://www.thesportsdb.com/api/v1/json/" +
      API_KEY +
      "/eventspastleague.php?id=" +
      league.id
  );

  const data = await res.json();
  if (!data.events) return "";

  // laatste gespeelde speeldag via strRound
  const latest = data.events
    .filter(e => e.strRound && e.dateEvent)
    .sort((a, b) => new Date(b.dateEvent) - new Date(a.dateEvent))[0];

  if (!latest) return "";

  const round = latest.strRound;
  const matches = data.events.filter(e => e.strRound === round);

  let html = "<h2>" + league.name + " - " + round + "</h2><ul>";

  matches.forEach(m => {
    html +=
      "<li>" +
      m.strHomeTeam +
      " " +
      m.intHomeScore +
      " - " +
      m.intAwayScore +
      " " +
      m.strAwayTeam +
      "</li>";
  });

  html += "</ul>";
  return html;
}

async function sendMail() {
  let content = "";

  for (const league of competitions) {
    content += await getLeagueHTML(league);
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
    html:
      "<h1>VOETBAL ACTUEEL</h1>" +
      "<p>Hey voetballiefhebber! Wij geven je een wekelijkse update.</p>" +
      content
  });

  console.log("Mail verzonden");
}

sendMail();

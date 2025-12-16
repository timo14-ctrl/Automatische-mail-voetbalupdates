const fetch = require("node-fetch");
const nodemailer = require("nodemailer");

const API_KEY = "123";

// Competities (Jupiler Pro League eerst)
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
    const response = await fetch(
      `https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventspastleague.php?id=${league.id}`
    );

    if (!response.ok) return "";

    const data = await response.json();
    if (!data.events || data.events.length === 0) return "";

    // Laatst gespeelde speeldag bepalen via strRound
    const latestEvent = data.events
      .filter(e => e.strRound && e.dateEvent)
      .sort((a, b) => new Date(b.dateEvent) - new Date(a.dateEvent))[0];

    if

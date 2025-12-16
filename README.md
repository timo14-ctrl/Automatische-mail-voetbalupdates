# Automatische Voetbalupdates per Mail

## Beschrijving
Deze repository bevat een Node.js-script dat automatisch een **wekelijkse voetbalnieuwsbrief** verstuurt met de meest recente wedstrijden van jouw favoriete clubs.  

De clubs die gevolgd worden zijn:  
- Standard Liège (Jupiler Pro League)  
- PSV Eindhoven (Eredivisie)  
- Aston Villa (Premier League)  
- AC Milan (Serie A)  
- FC Barcelona (La Liga)  
- Olympique de Marseille (Ligue 1)  

De nieuwsbrief bevat:  
- Clubnaam en competitie  
- Clublogo  
- Laatste gespeelde match in de nationale competitie  
- Datum van de wedstrijd  

---

## Werkwijze

1. **API Key:**  
   Het script haalt gegevens op via [TheSportsDB](https://www.thesportsdb.com). Je hebt een API-key nodig (hier gebruikt: `123`).  

2. **Mail Setup:**  
   Het script gebruikt Nodemailer om e-mails te versturen. Stel de volgende environment-variabelen in:  
   - `SMTP_HOST` → SMTP-server  
   - `SMTP_PORT` → poort  
   - `EMAIL_USER` → jouw e-mailadres  
   - `EMAIL_PASS` → wachtwoord of app-password  
   - `EMAIL_TO` → ontvanger  

3. **Logo’s:**  
   De clublogo’s zijn gehost in deze repository en worden via directe URL’s in de mail geladen.  

4. **Automatisering:**  
   Door GitHub Actions wordt het script elke maandag automatisch uitgevoerd en verzendt het de nieuwsbrief.  

5. **Selectie laatste match:**  
   Voor elke club wordt de **laatste gespeelde wedstrijd in de nationale competitie** opgehaald, zodat beker- of Europese wedstrijden niet per ongeluk worden weergegeven.  

---

## Bestanden

- `sendMail.js` → Hoofdscript dat de e-mail genereert en verzendt  
- `.github/workflows/weekly-mail.yml` → GitHub Actions workflow om het script elke maandag te draaien  
- Clublogo’s → PNG-bestanden in de repository  

---

## Voorbeeldmail

**Titel:** ⚽ VOETBAL ACTUEEL  
**Intro:** Hey voetballiefhebber! Wat hebben jouw favoriete clubs afgelopen wedstrijd gedaan? Ontdek het hieronder.  

**Inhoud:**  
- ![Standard Logo](https://raw.githubusercontent.com/timo14-ctrl/Automatische-mail-voetbalupdates/main/standard.png) Standard Liège – Jupiler Pro League – Standard 2-1 Anderlecht – 2025-12-13  
- ![PSV Logo](https://raw.githubusercontent.com/timo14-ctrl/Automatische-mail-voetbalupdates/main/psv.png) PSV Eindhoven – Eredivisie – PSV 3-0 Ajax – 2025-12-13  
- ![Aston Villa Logo](https://raw.githubusercontent.com/timo14-ctrl/Automatische-mail-voetbalupdates/main/astonvilla.png) Aston Villa – Premier League – Aston Villa 1-1 Manchester United – 2025-12-13  
- ![AC Milan Logo](https://raw.githubusercontent.com/timo14-ctrl/Automatische-mail-voetbalupdates/main/acmilan.png) AC Milan – Serie A – AC Milan 2-0 Inter – 2025-12-13  
- ![Barcelona Logo](https://raw.githubusercontent.com/timo14-ctrl/Automatische-mail-voetbalupdates/main/barcelona.png) FC Barcelona – La Liga – Barcelona 3-1 Real Madrid – 2025-12-13  
- ![Marseille Logo](https://raw.githubusercontent.com/timo14-ctrl/Automatische-mail-voetbalupdates/main/marseille.png) Olympique de Marseille – Ligue 1 – Marseille 2-2 PSG – 2025-12-13  

---

## Gebruik

1. Fork deze repository of clone deze naar jouw lokale omgeving.  
2. Voeg je eigen environment-variabelen toe (`SMTP_HOST`, `SMTP_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_TO`).  
3. Test lokaal met:

```bash
node sendMail.js

<p align="center">
    <p align="center">
  <img src="https://github.com/cdaraio/AI-Agent-Angular/blob/main/src/assets/images/logo.png?raw=true" alt="AI-Agent Logo" width="150">
</p>
</p>
<p align="center"><h1 align="center">AI-AGENT-ANGULAR</h1></p>
<p align="center">
	<em><code>❯ Frontend Angular per un sistema di prenotazione sale con assistente AI</code></em>
</p>
<p align="center">
	<img src="https://img.shields.io/github/license/cdaraio/AI-Agent-Angular?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
	<img src="https://img.shields.io/github/last-commit/cdaraio/AI-Agent-Angular?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/cdaraio/AI-Agent-Angular?style=default&color=0080ff" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/cdaraio/AI-Agent-Angular?style=default&color=0080ff" alt="repo-language-count">
</p>
<br>

## 🚨 Configurazione Obbligatoria

**Prima di avviare il progetto, è necessario creare un file `.env` nella root del progetto con le seguenti variabili:**

```env
# SERVIZIO MAIL
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER="user_key"
SMTP_PASSWORD="user_psw"
MAIL_FROM=prenotazioni@admin.com
API_URL_LOGO=http://localhost:8000/

# SICUREZZA
JWT_SECRET_KEY=---inserisci-la-tua-chiave-segreta---
TOKEN_EXPIRE_DAYS=1

# OPENROUTER
OPENROUTER_API_KEY="open_router_key"

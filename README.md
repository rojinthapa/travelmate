<div align="center">

<img src="https://img.shields.io/badge/TravelMate-AI-1a9fe0?style=for-the-badge&logo=airplane&logoColor=white" alt="TravelMate AI"/>

# ✈️ TravelMate AI

**Your intelligent travel companion — plan trips, manage budgets,**  
**and get personalised AI advice for any destination on Earth.**

[![Live Demo](https://img.shields.io/badge/🌍_Live_Demo-rojinthapa66.pythonanywhere.com-1a9fe0?style=for-the-badge)](https://rojinthapa66.pythonanywhere.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.x-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://rojinthapa66.pythonanywhere.com)

</div>

---

## 🌟 Features

| Feature | Description |
|---|---|
| 🤖 **AI Trip Planner** | Personalised itineraries, packing lists & local tips powered by Gemini 2.5 Flash |
| 💰 **Budget Calculator** | Plan trip costs, track expenses across 30+ popular destinations |
| 💱 **Currency Converter** | Convert 70+ currencies — works live or fully offline |
| 🌤️ **Live Weather** | Real-time weather for any destination via wttr.in |
| 📲 **Installable PWA** | Install on any device — works offline with Service Worker caching |
| 🔥 **Trending Destinations** | Curated destination cards with pricing estimates |

---

## 📸 Preview

> 🔗 **[rojinthapa66.pythonanywhere.com](https://rojinthapa66.pythonanywhere.com)**

```
🏠 Home          — Destination search, trending cards, feature grid
✨ AI Chat        — Conversational travel assistant (multi-turn memory)
💰 Budget         — Trip cost calculator + currency converter
📊 Dashboard      — Destination overview with live weather
```

---

## 🛠️ Tech Stack

```
Backend     →  Python · Flask
AI          →  Google Gemini 2.5 Flash Lite
Frontend    →  Vanilla JS · CSS3 · Jinja2 Templates
PWA         →  Service Worker · Web App Manifest
Fonts       →  Plus Jakarta Sans · Syne (Google Fonts)
Markdown    →  marked.js
Deployment  →  PythonAnywhere
```

---

## 🗂️ Project Structure

```
travel_app/
├── app.py                  # Flask app — routes + Gemini AI
├── sw.js                   # Service Worker (offline caching)
├── manifest.json           # PWA manifest (installable)
│
├── templates/
│   ├── base.html           # Shared layout, navbar, SW registration
│   ├── index.html          # Home page
│   ├── chat.html           # AI Chat interface
│   ├── budget.html         # Budget calculator
│   └── dashboard.html      # Destination dashboard
│
└── static/
    ├── style.css           # All styles
    ├── script.js           # Main JS
    ├── currency.js         # Currency converter (offline-ready)
    └── icons/
        ├── icon-192.png    # PWA icon
        └── icon-512.png    # PWA icon
```

---

## 🚀 Run Locally

**1. Clone the repo**
```bash
git clone https://github.com/rojinthapa/travelmate.git
cd travelmate
```

**2. Install dependencies**
```bash
pip install flask google-generativeai
```

**3. Add your API key**

Open `app.py` and replace:
```python
GEMINI_API_KEY = "YOUR_API_KEY"
```
Get a free key at [aistudio.google.com](https://aistudio.google.com)

**4. Run**
```bash
python app.py
```
Visit `http://localhost:5000` 🎉

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Home page |
| `GET` | `/chat` | AI Chat page |
| `GET` | `/budget` | Budget calculator |
| `GET` | `/dashboard` | Destination dashboard |
| `POST` | `/api/chat` | Gemini AI chat (JSON) |
| `GET` | `/sw.js` | Service Worker |
| `GET` | `/manifest.json` | PWA Manifest |

---

## 📲 PWA — Install on Your Phone

1. Visit **[rojinthapa66.pythonanywhere.com](https://rojinthapa66.pythonanywhere.com)** on mobile
2. Tap the **"Install TravelMate"** banner
3. App installs to your home screen
4. Opens like a native app — works offline too ✅

> **Offline support:** UI, Budget Calculator, and Currency Converter work without internet. AI Chat requires connection to Gemini API.

---

## ⚙️ Environment

```python
# app.py
GEMINI_API_KEY = "your_key_here"   # Required — Google AI Studio
```

> ⚠️ Never commit real API keys. Use environment variables in production.

---

## 🙌 Acknowledgements

- [Google Gemini](https://ai.google.dev) — AI engine
- [wttr.in](https://wttr.in) — Weather API
- [fawazahmed0/currency-api](https://github.com/fawazahmed0/exchange-api) — Currency rates
- [marked.js](https://marked.js.org) — Markdown rendering
- [PythonAnywhere](https://pythonanywhere.com) — Hosting

---

<div align="center">

Made with ❤️ by **Rojin Thapa**

[![Live](https://img.shields.io/badge/🌍_Try_it_Live-rojinthapa66.pythonanywhere.com-1a9fe0?style=flat-square)](https://rojinthapa66.pythonanywhere.com)

</div>

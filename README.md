# WeatherApp (FastAPI + React)

A weather app featuring a **FastAPI** backend that serves a JSON API,
and a small **React** frontend (built with Vite) for the web view.

## Features

- **Weather search**: current temperature, conditions, feels-like, humidity and wind
- **5-day forecast**: daily high/low, most common conditions and average chance of precipitation
- **Temperature units**: switch between Celsius and Fahrenheit (your choice is remembered)
- **Favorites**: saved in localStorage
- **JSON API**: `GET /api/weather?city=London`, with interactive docs at `/docs`

## Quick start (no Node.js needed)

A prebuilt frontend is included in `frontend/dist`, so you only need Python.

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Create a `.env` file in this folder with your OpenWeatherMap API key:
   ```
   OPENWEATHER_API_KEY=your_api_key_here
   DEBUG=True
   ```
3. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
4. Open `http://localhost:8000`

Get a free API key from [OpenWeatherMap](https://openweathermap.org/api).

## Working on the frontend

Requires Node.js 20.19+ or 22.12+.

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173, proxies /api to FastAPI on :8000
npm run build    # rebuilds frontend/dist, which FastAPI serves
```

Keep `uvicorn main:app --reload` running in another terminal while using `npm run dev`.

## Project Structure

```
fastapi_app/
├── main.py              # FastAPI app: /api/weather + serves frontend/dist
├── weather.py           # Async OpenWeatherMap client and forecast aggregation
├── config.py            # Environment configuration
├── requirements.txt
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── dist/            # Prebuilt production bundle
    └── src/
        ├── main.jsx
        ├── App.jsx      # Search, unit toggle, favorites, weather and forecast
        └── App.css
```

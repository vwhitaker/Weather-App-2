from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from config import Config
from weather import WeatherError, weather_client

FRONTEND_DIST = Path(__file__).parent / "frontend" / "dist"

app = FastAPI(title="Weather App", debug=Config.DEBUG)


@app.get("/api/weather")
async def api_weather(city: str):
    """Current weather and 5-day forecast for a city (temperatures in Celsius)."""
    city = city.strip()
    if not city:
        raise HTTPException(status_code=400, detail="City name is required")
    try:
        return await weather_client.get_weather(city)
    except WeatherError as e:
        raise HTTPException(status_code=400, detail=str(e))


# Serve the built React app (run `npm run build` in frontend/ first)
if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", reload=Config.DEBUG)

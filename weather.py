import asyncio
from collections import Counter
from datetime import datetime
import httpx
from config import Config


class WeatherError(Exception):
    """Raised when weather data cannot be retrieved."""


class OpenWeatherClient:
    def __init__(self):
        self.api_key = Config.OPENWEATHER_API_KEY

    async def _get(self, client, url, **params):
        params["appid"] = self.api_key
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()

    async def get_coordinates(self, client, city):
        """
        Get coordinates for a city using OpenWeather Geocoding API
        """
        data = await self._get(client, Config.OPENWEATHER_GEOCODING_URL, q=city, limit=1)
        if not data:
            return None
        return {
            "lat": data[0]["lat"],
            "lon": data[0]["lon"],
            "name": data[0]["name"],
            "country": data[0].get("country", ""),
        }

    async def get_weather(self, city):
        """
        Get current weather and a 5-day forecast for a city.
        Temperatures are returned in Celsius.
        """
        if not self.api_key:
            raise WeatherError("API key not configured. Add OPENWEATHER_API_KEY to your .env file.")

        try:
            async with httpx.AsyncClient(timeout=10) as client:
                coords = await self.get_coordinates(client, city)
                if not coords:
                    raise WeatherError(f"City '{city}' not found. Please check the spelling and try again.")

                location = {"lat": coords["lat"], "lon": coords["lon"], "units": "metric"}
                current, forecast = await asyncio.gather(
                    self._get(client, Config.OPENWEATHER_BASE_URL, **location),
                    self._get(client, Config.OPENWEATHER_FORECAST_URL, **location),
                )
        except httpx.HTTPError as e:
            raise WeatherError(f"API request failed: {e}") from e

        try:
            return {
                "city": coords["name"],
                "country": coords["country"],
                "temperature": current["main"]["temp"],
                "feels_like": current["main"]["feels_like"],
                "description": current["weather"][0]["description"],
                "icon": current["weather"][0]["icon"],
                "humidity": current["main"]["humidity"],
                "wind_speed": current["wind"]["speed"],
                "forecast": self._process_forecast_data(forecast["list"]),
            }
        except (KeyError, IndexError) as e:
            raise WeatherError(f"Invalid response format: {e}") from e

    def _process_forecast_data(self, forecast_list):
        """
        Process the raw 3-hour forecast data into daily forecasts
        """
        daily_data = {}

        for item in forecast_list:
            dt = datetime.fromisoformat(item["dt_txt"])
            day = daily_data.setdefault(dt.date(), {
                "date": dt,
                "temps": [],
                "descriptions": [],
                "precipitation": [],
            })
            day["temps"].append(item["main"]["temp"])
            day["descriptions"].append(item["weather"][0]["description"])
            day["precipitation"].append(item.get("pop", 0) * 100)  # Convert to percentage

        forecast_days = []
        for date_key in sorted(daily_data)[:5]:  # Get next 5 days
            day = daily_data[date_key]
            forecast_days.append({
                "date": day["date"].strftime("%b %d"),
                "day": day["date"].strftime("%A"),
                "temp_high": max(day["temps"]),
                "temp_low": min(day["temps"]),
                "description": Counter(day["descriptions"]).most_common(1)[0][0],
                "precipitation": sum(day["precipitation"]) / len(day["precipitation"]),
            })

        return forecast_days


# Create a global instance
weather_client = OpenWeatherClient()

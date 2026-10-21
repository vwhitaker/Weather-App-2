"""
API keys and other configuration variables
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    # OpenWeather API configuration
    OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
    OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather"
    OPENWEATHER_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"
    OPENWEATHER_GEOCODING_URL = "https://api.openweathermap.org/geo/1.0/direct"

    # Server configuration
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"

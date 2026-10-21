import { useEffect, useState } from 'react'

const FAVORITES_KEY = 'weatherFavorites'
const UNIT_KEY = 'weatherUnit'

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) ?? []
  } catch {
    return []
  }
}

function loadUnit() {
  return localStorage.getItem(UNIT_KEY) === 'fahrenheit' ? 'fahrenheit' : 'celsius'
}

function formatTemp(celsius, unit) {
  return unit === 'fahrenheit'
    ? `${Math.round(celsius * 9 / 5 + 32)}°F`
    : `${Math.round(celsius)}°C`
}

export default function App() {
  const [query, setQuery] = useState('')
  const [unit, setUnit] = useState(loadUnit)
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [favorites, setFavorites] = useState(loadFavorites)

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem(UNIT_KEY, unit)
  }, [unit])

  async function search(city) {
    city = city.trim()
    if (!city) return
    setQuery(city)
    setLoading(true)
    setError('')
    setWeather(null)
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail ?? 'Failed to fetch weather data.')
      setWeather(data)
    } catch (e) {
      setError(e.message || 'Failed to fetch weather data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container">
      <h1>Weather Forecast</h1>

      <section className="card">
        <form className="search" onSubmit={e => { e.preventDefault(); search(query) }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Enter city name"
            required
            autoFocus
          />
          <button type="submit" disabled={loading}>Search</button>
        </form>

        <div className="units" role="group" aria-label="Temperature unit">
          {[['celsius', '°C'], ['fahrenheit', '°F']].map(([value, label]) => (
            <button
              key={value}
              className={unit === value ? 'active' : ''}
              aria-pressed={unit === value}
              onClick={() => setUnit(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <header className="row">
          <h2>Favorite Cities</h2>
          {weather && !favorites.includes(weather.city) && (
            <button className="add" onClick={() => setFavorites([...favorites, weather.city])}>
              ★ Add to Favorites
            </button>
          )}
        </header>

        {favorites.length ? (
          <ul className="favorites">
            {favorites.map(fav => (
              <li key={fav}>
                <button className="link" onClick={() => search(fav)}>{fav}</button>
                <button
                  className="remove"
                  aria-label={`Remove ${fav}`}
                  onClick={() => setFavorites(favorites.filter(f => f !== fav))}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No favorite cities yet. Search for a city and add it to your favorites!</p>
        )}
      </section>

      {loading && (
        <section className="card loading">
          <div className="spinner" />
          <p>Loading weather data...</p>
        </section>
      )}

      {error && <p className="error" role="alert">{error}</p>}

      {weather && <CurrentWeather weather={weather} unit={unit} />}
      {weather && <Forecast days={weather.forecast} unit={unit} />}
    </main>
  )
}

function CurrentWeather({ weather, unit }) {
  return (
    <section className="card">
      <h2>{weather.city}{weather.country && `, ${weather.country}`}</h2>
      <div className="current">
        <div className="temp">
          <img
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt=""
            width="80"
            height="80"
            onError={e => { e.currentTarget.hidden = true }}
          />
          <span>{formatTemp(weather.temperature, unit)}</span>
        </div>
        <dl>
          <dt>Conditions</dt><dd className="capitalize">{weather.description}</dd>
          <dt>Feels like</dt><dd>{formatTemp(weather.feels_like, unit)}</dd>
          <dt>Humidity</dt><dd>{weather.humidity}%</dd>
          <dt>Wind</dt><dd>{weather.wind_speed} m/s</dd>
        </dl>
      </div>
    </section>
  )
}

function Forecast({ days, unit }) {
  return (
    <section className="card">
      <h2>5-Day Forecast</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>High</th>
              <th>Low</th>
              <th>Forecast</th>
              <th>Precipitation</th>
            </tr>
          </thead>
          <tbody>
            {days.length ? days.map(day => (
              <tr key={day.date}>
                <td>{day.date}</td>
                <td>{day.day}</td>
                <td>{formatTemp(day.temp_high, unit)}</td>
                <td>{formatTemp(day.temp_low, unit)}</td>
                <td className="capitalize">{day.description}</td>
                <td>{Math.round(day.precipitation)}%</td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="muted center">No forecast data available</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

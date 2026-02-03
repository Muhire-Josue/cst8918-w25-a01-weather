/* eslint-disable @typescript-eslint/no-explicit-any */
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { fetchWeatherData } from '../api-services/open-weather-service'
import { capitalizeFirstLetter } from '../utils/text-formatting'
import type { MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    { title: 'Remix Weather' },
    {
      name: 'description',
      content: 'A demo web app using Remix and OpenWeather API.',
    },
  ]
}

const location = {
  city: 'Ottawa',
  postalCode: 'K2G 1V8', // Algonquin College, Woodroffe Campus
  lat: 45.3211,
  lon: -75.7391,
  countryCode: 'CA',
}
const units = 'metric'

export async function loader() {
  // TODO: accept query params for location and units
  // TODO: look up location by postal code

  try {
    const data: any = await fetchWeatherData({
      lat: location.lat,
      lon: location.lon,
      units: units,
    })

    // If OpenWeather returns an error, it often includes "message" or "cod"
    if (!data || !Array.isArray(data.weather) || data.weather.length === 0) {
      const details = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data)

      return json(
        {
          currentConditions: null,
          error: data?.message ?? 'Weather data missing from API response.',
          debug: details,
        },
        { status: 502 }
      )
    }

    return json({ currentConditions: data, error: null, debug: null })
  } catch (e: any) {
    return json(
      {
        currentConditions: null,
        error: e?.message ?? 'Failed to fetch weather data.',
        debug: null,
      },
      { status: 500 }
    )
  }
}

export default function CurrentConditions() {
  const { currentConditions, error, debug } = useLoaderData<typeof loader>()

  if (error) {
    return (
      <main style={{ padding: '1.5rem', fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
        <h1>Remix Weather</h1>
        <p style={{ color: 'crimson' }}>Error: {error}</p>

        {debug ? (
          <>
            <h2 style={{ marginTop: '1rem' }}>Debug</h2>
            <pre>{debug}</pre>
          </>
        ) : null}
      </main>
    )
  }

  if (!currentConditions) {
    return (
      <main style={{ padding: '1.5rem', fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
        <h1>Remix Weather</h1>
        <p>No weather data available.</p>
      </main>
    )
  }

  const weather = currentConditions.weather?.[0]

  if (!weather) {
    return (
      <main style={{ padding: '1.5rem', fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
        <h1>Remix Weather</h1>
        <p>Weather details unavailable.</p>
      </main>
    )
  }

  return (
    <>
      <main
        style={{
          padding: '1.5rem',
          fontFamily: 'system-ui, sans-serif',
          lineHeight: '1.8',
        }}
      >
        <h1>Remix Weather</h1>
        <p>
          For Algonquin College, Woodroffe Campus <br />
          <span style={{ color: 'hsl(220, 23%, 60%)' }}>
            (LAT: {location.lat}, LON: {location.lon})
          </span>
        </p>
        <h2>Current Conditions</h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
          <img src={getWeatherIconUrl(weather.icon)} alt="" />
          <div style={{ fontSize: '2rem' }}>{currentConditions.main.temp.toFixed(1)}°C</div>
        </div>
        <p
          style={{
            fontSize: '1.2rem',
            fontWeight: '400',
          }}
        >
          {capitalizeFirstLetter(weather.description)}. Feels like{' '}
          {currentConditions.main['feels_like'].toFixed(1)}°C.
          <br />
          <span style={{ color: 'hsl(220, 23%, 60%)', fontSize: '0.85rem' }}>
            updated at{' '}
            {new Intl.DateTimeFormat('en-CA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }).format(new Date(currentConditions.dt * 1000))}
          </span>
        </p>
      </main>
      <section
        style={{
          backgroundColor: 'hsl(220, 54%, 96%)',
          padding: '0.5rem 1.5rem 1rem 1.5rem',
          borderRadius: '0.25rem',
        }}
      >
        <h2>Raw Data</h2>
        <pre>{JSON.stringify(currentConditions, null, 2)}</pre>
      </section>
      <hr style={{ marginTop: '2rem' }} />
      <p>
        Learn how to customize this app. Read the{' '}
        <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
          Remix Docs
        </a>
      </p>
    </>
  )
}

function getWeatherIconUrl(iconCode: string) {
  return `http://openweathermap.org/img/wn/${iconCode}@2x.png`
}

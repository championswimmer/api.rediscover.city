import { PostHog } from 'posthog-node'
import { config } from '../../config'
import adze from 'adze'

// Initialize PostHog client if API key is provided
const apiKey = config.keys.posthog

export const posthog = apiKey
  ? new PostHog(apiKey, {
      host: process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
    })
  : undefined

if (posthog) {
  // Enable verbose logs in development
  if (process.env.NODE_ENV === 'development') {
    posthog.debug(true)
  }

  // Surface any background errors
  posthog.on('error', (err) => {
    adze.error('PostHog had an error!', err)
  })

  // Ensure graceful shutdown in most runtime environments
  const gracefulShutdown = async () => {
    try {
      await posthog.shutdown()
    } catch {
      // ignore
    }
  }

  process.on('beforeExit', gracefulShutdown)
  process.on('SIGINT', gracefulShutdown)
  process.on('SIGTERM', gracefulShutdown)
}



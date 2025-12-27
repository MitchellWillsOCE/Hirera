import { createClient } from 'redis'

declare global {
  var redis: ReturnType<typeof createClient> | undefined
}

const redisClient = globalThis.redis || createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

if (process.env.NODE_ENV !== 'production') globalThis.redis = redisClient

export const redis = redisClient

async function connectRedis() {
  if (!redis.isOpen) {
    try {
      await redis.connect()
      console.log('Redis client connected')
    } catch (err) {
      console.error('Redis connection error:', err)
    }
  }
}

connectRedis() 
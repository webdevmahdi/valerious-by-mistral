import mongoose from 'mongoose'
import app from './app'
import { env } from './config/env'
import { authService } from './services/authService'

async function main(): Promise<void> {
  await mongoose.connect(env.mongoUri)
  console.info('[db] connected')

  await authService.ensureAdminSeed()
  console.info('[seed] admin account ready')

  app.listen(env.port, () => {
    console.info(`[server] VALERIUS API listening on http://localhost:${env.port}/api/v1`)
  })
}

main().catch((error) => {
  console.error('[server] failed to start:', error)
  process.exit(1)
})

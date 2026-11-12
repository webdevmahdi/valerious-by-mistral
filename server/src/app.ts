import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/env'
import routes from './routes'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'

const app = express()

app.set('trust proxy', 1)
app.use(helmet())
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false }))

app.use('/api/v1', routes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app

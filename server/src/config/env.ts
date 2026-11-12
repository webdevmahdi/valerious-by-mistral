import dotenv from 'dotenv'

dotenv.config()

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/valerius'),
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(','),
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', 'dev-access-secret-change-me'),
    refreshSecret: required('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },
  payments: {
    sslCommerzStoreId: process.env.SSLCOMMERZ_STORE_ID ?? '',
    sslCommerzStorePassword: process.env.SSLCOMMERZ_STORE_PASSWORD ?? '',
    sslCommerzSandbox: process.env.SSLCOMMERZ_SANDBOX !== 'false',
    bkashAppKey: process.env.BKASH_APP_KEY ?? '',
    bkashAppSecret: process.env.BKASH_APP_SECRET ?? '',
    nagadPublicKey: process.env.NAGAD_PUBLIC_KEY ?? '',
  },
  email: {
    from: process.env.EMAIL_FROM ?? 'VALERIUS <orders@valerius.example>',
    smtpUrl: process.env.EMAIL_SMTP_URL ?? '',
  },
  adminSeedEmail: process.env.ADMIN_SEED_EMAIL ?? 'admin@valerius.example',
  adminSeedPassword: process.env.ADMIN_SEED_PASSWORD ?? 'valerius-admin',
}

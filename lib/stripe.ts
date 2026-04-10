import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
})

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID!
export const STRIPE_ANNUAL_PRICE_ID = process.env.STRIPE_ANNUAL_PRICE_ID!
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

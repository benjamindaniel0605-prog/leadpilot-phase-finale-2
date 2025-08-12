import 'server-only'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import {
  users,
  templates,
  leads,
  campaigns,
  campaignEmails,
  sequences,
  bookings,
  customEmails,
  sessions,
} from './schema'

// Configuration de la base de données
const connectionString = process.env.DATABASE_URL!
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

export const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1, // limite la pool en serverless / route handlers
})

export const db = drizzle(sql)

// Types exportés
export type User = typeof users.$inferSelect
export type InsertUser = typeof users.$inferInsert
export type Template = typeof templates.$inferSelect
export type InsertTemplate = typeof templates.$inferInsert
export type Lead = typeof leads.$inferSelect
export type InsertLead = typeof leads.$inferInsert
export type Campaign = typeof campaigns.$inferSelect
export type InsertCampaign = typeof campaigns.$inferInsert
export type CampaignEmail = typeof campaignEmails.$inferSelect
export type Sequence = typeof sequences.$inferSelect
export type InsertSequence = typeof sequences.$inferInsert
export type Booking = typeof bookings.$inferSelect
export type InsertBooking = typeof bookings.$inferInsert
export type CustomEmail = typeof customEmails.$inferSelect
export type InsertCustomEmail = typeof customEmails.$inferInsert



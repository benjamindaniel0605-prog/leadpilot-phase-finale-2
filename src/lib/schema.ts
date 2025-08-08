import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"

// Session storage table (pour l'authentification)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
)

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  plan: varchar("plan").notNull().default("free"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  leadsUsed: integer("leads_used").notNull().default(0),
  aiVariationsUsed: integer("ai_variations_used").notNull().default(0),
  variationHistory: jsonb("variation_history").default([]),
  // OAuth email connections
  googleEmailConnected: boolean("google_email_connected").default(false),
  googleEmailToken: text("google_email_token"),
  googleRefreshToken: text("google_refresh_token"),
  outlookEmailConnected: boolean("outlook_email_connected").default(false),
  outlookEmailToken: text("outlook_email_token"),
  outlookRefreshToken: text("outlook_refresh_token"),
  connectedEmailAddress: varchar("connected_email_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Email templates
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  plan: varchar("plan").notNull(),
  category: varchar("category"),
  variables: jsonb("variables"),
  timesUsed: integer("times_used").notNull().default(0),
  openRate: integer("open_rate").default(0),
  createdAt: timestamp("created_at").defaultNow(),
})

// Leads
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  company: varchar("company").notNull(),
  sector: varchar("sector"),
  position: varchar("position"),
  aiScore: integer("ai_score"),
  status: varchar("status").notNull().default("new"),
  source: varchar("source").default("external"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Custom emails created by users from base templates
export const customEmails = pgTable("custom_emails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: varchar("name").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  baseTemplateId: varchar("base_template_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Campaigns
export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  emailId: varchar("email_id").notNull().references(() => customEmails.id),
  leadTargets: varchar("lead_targets").notNull(), // Comma-separated lead IDs
  status: varchar("status").notNull().default("draft"),
  totalSent: integer("total_sent").notNull().default(0),
  totalOpened: integer("total_opened").notNull().default(0),
  totalClicked: integer("total_clicked").notNull().default(0),
  totalReplied: integer("total_replied").notNull().default(0),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Campaign emails
export const campaignEmails = pgTable("campaign_emails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => campaigns.id),
  leadId: varchar("lead_id").notNull().references(() => leads.id),
  status: varchar("status").notNull().default("pending"),
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  repliedAt: timestamp("replied_at"),
  createdAt: timestamp("created_at").defaultNow(),
})

// Sequences
export const sequences = pgTable("sequences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  status: varchar("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Sequence steps
export const sequenceSteps = pgTable("sequence_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sequenceId: varchar("sequence_id").notNull().references(() => sequences.id, { onDelete: "cascade" }),
  stepOrder: integer("step_order").notNull(),
  delayDays: integer("delay_days").notNull().default(0),
  delayHours: integer("delay_hours").notNull().default(0),
  emailTemplateId: varchar("email_template_id").references(() => customEmails.id),
  subject: varchar("subject"),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
})

// Sequence enrollments
export const sequenceEnrollments = pgTable("sequence_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sequenceId: varchar("sequence_id").notNull().references(() => sequences.id, { onDelete: "cascade" }),
  leadId: varchar("lead_id").notNull().references(() => leads.id),
  status: varchar("status").notNull().default("active"),
  currentStep: integer("current_step").notNull().default(0),
  nextSendAt: timestamp("next_send_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Calendar bookings
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  leadId: varchar("lead_id").references(() => leads.id),
  title: varchar("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: varchar("status").notNull().default("scheduled"),
  meetingType: varchar("meeting_type").default("video"),
  conversionStatus: varchar("conversion_status"), // converted, not_converted, pending
  contactName: varchar("contact_name"),
  contactEmail: varchar("contact_email"),
  contactPhone: varchar("contact_phone"),
  company: varchar("company"),
  createdAt: timestamp("created_at").defaultNow(),
})



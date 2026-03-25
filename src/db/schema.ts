import { pgTable, text, timestamp, boolean, decimal, integer, pgEnum, primaryKey, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums ──────────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["parent", "caregiver", "admin", "moderator"]);
export const jobStatusEnum = pgEnum("job_status", ["open", "closed", "completed"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "accepted", "rejected"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "in_progress", "completed", "cancelled"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "authorized", "captured", "refunded", "failed"]);
export const certificationTypeEnum = pgEnum("certification_type", ["registration", "elite_bundle", "standards_program"]);
export const certificationStatusEnum = pgEnum("certification_status", ["pending_payment", "enrolled", "in_progress", "completed", "expired"]);
export const verificationStatusEnum = pgEnum("verification_status", ["none", "draft", "pending", "verified", "rejected"]);
export const walletTransactionTypeEnum = pgEnum("wallet_transaction_type", ["earning", "withdrawal"]);
export const walletTransactionStatusEnum = pgEnum("wallet_transaction_status", ["pending", "completed", "failed"]);

export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in_progress", "resolved", "closed"]);
export const ticketPriorityEnum = pgEnum("ticket_priority", ["low", "medium", "high", "urgent"]);
export const ticketCategoryEnum = pgEnum("ticket_category", ["general", "safety", "payment", "technical"]);

// ── Users ──────────────────────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk User ID
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Nanny Profiles ─────────────────────────────────────────
export const nannyProfiles = pgTable("nanny_profiles", {
  id: text("id").primaryKey().references(() => users.id),
  bio: text("bio"),
  experienceYears: integer("experience_years").default(0),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).default("0"),
  location: text("location"),
  isVerified: boolean("is_verified").default(false).notNull(),
  stripeConnectId: text("stripe_connect_id"),
  photos: jsonb("photos").$type<string[]>().default([]),
});

// ── Children ───────────────────────────────────────────────
export const children = pgTable("children", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  parentId: text("parent_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  type: text("type").notNull(), // e.g., "toddler", "pre-schooler", "infant"
  specialNeeds: jsonb("special_needs").$type<string[]>().default([]), // JSON array stored as jsonb
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Jobs ───────────────────────────────────────────────────
export const jobs = pgTable("jobs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  parentId: text("parent_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  budget: text("budget").notNull(), // Display string like "$20-$30/hr"
  minRate: integer("min_rate"),
  maxRate: integer("max_rate"),
  status: jobStatusEnum("status").default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Applications ───────────────────────────────────────────
export const applications = pgTable("applications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobId: text("job_id").notNull().references(() => jobs.id),
  caregiverId: text("caregiver_id").notNull().references(() => users.id),
  message: text("message"),
  status: applicationStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Bookings ───────────────────────────────────────────────
export const bookings = pgTable("bookings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  parentId: text("parent_id").notNull().references(() => users.id),
  caregiverId: text("caregiver_id").notNull().references(() => users.id),
  jobId: text("job_id").references(() => jobs.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  hoursPerDay: integer("hours_per_day").notNull(),
  totalAmount: integer("total_amount").notNull(), // in cents
  notes: text("notes"),
  status: bookingStatusEnum("status").default("pending").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Payments ───────────────────────────────────────────────
export const payments = pgTable("payments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookingId: text("booking_id").references(() => bookings.id),
  userId: text("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // in cents
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: paymentStatusEnum("status").default("pending").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Conversations ──────────────────────────────────────────
export const conversations = pgTable("conversations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conversationMembers = pgTable("conversation_members", {
  conversationId: text("conversation_id").notNull().references(() => conversations.id),
  userId: text("user_id").notNull().references(() => users.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.conversationId, table.userId] }),
}));

// ── Messages ───────────────────────────────────────────────
export const messages = pgTable("messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  conversationId: text("conversation_id").notNull().references(() => conversations.id),
  senderId: text("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Reviews ────────────────────────────────────────────────
export const reviews = pgTable("reviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookingId: text("booking_id").references(() => bookings.id),
  reviewerId: text("reviewer_id").notNull().references(() => users.id),
  revieweeId: text("reviewee_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Support Tickets ────────────────────────────────────────
export const tickets = pgTable("tickets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  status: ticketStatusEnum("status").default("open").notNull(),
  priority: ticketPriorityEnum("priority").default("medium").notNull(),
  category: ticketCategoryEnum("category").default("general").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ticketMessages = pgTable("ticket_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  ticketId: text("ticket_id").notNull().references(() => tickets.id),
  senderId: text("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(false).notNull(), // for Moderator notes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Certifications ─────────────────────────────────────────
export const certifications = pgTable("certifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  caregiverId: text("caregiver_id").notNull().references(() => users.id),
  type: certificationTypeEnum("type").notNull(),
  status: certificationStatusEnum("status").default("pending_payment").notNull(),
  stripePaymentId: text("stripe_payment_id"),
  enrolledAt: timestamp("enrolled_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Notifications ──────────────────────────────────────────
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // e.g., "application", "booking", "message", "payment"
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  linkUrl: text("link_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Wallets ────────────────────────────────────────────────
export const wallets = pgTable("wallets", {
  id: text("id").primaryKey().references(() => users.id),
  balance: integer("balance").default(0).notNull(), // in cents
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  walletId: text("wallet_id").notNull().references(() => wallets.id),
  amount: integer("amount").notNull(), // in cents
  type: walletTransactionTypeEnum("type").notNull(),
  status: walletTransactionStatusEnum("status").default("pending").notNull(),
  description: text("description"),
  stripeTransferId: text("stripe_transfer_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Caregiver Verifications ────────────────────────────────
export const caregiverVerifications = pgTable("caregiver_verifications", {
  id: text("id").primaryKey().references(() => users.id),
  currentStep: integer("current_step").default(1).notNull(),
  
  // Step 1: Identity
  idFrontUrl: text("id_front_url"),
  idBackUrl: text("id_back_url"),
  
  // Step 2: Background Auth
  backgroundAuth: boolean("background_auth").default(false).notNull(),
  backgroundAuthTimestamp: timestamp("background_auth_timestamp"),
  
  // Step 3: References (JSONB equivalent or structured text)
  references: jsonb("references").$type<any[]>(), // Stored as jsonb for flexible structs
  
  status: verificationStatusEnum("status").default("none").notNull(),
  adminNotes: text("admin_notes"),
  
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Relations ──────────────────────────────────────────────
export const usersRelations = relations(users, ({ many, one }) => ({
  nannyProfile: one(nannyProfiles, { fields: [users.id], references: [nannyProfiles.id] }),
  children: many(children),
  jobs: many(jobs),
  applications: many(applications),
  bookingsAsParent: many(bookings, { relationName: "parentBookings" }),
  bookingsAsCaregiver: many(bookings, { relationName: "caregiverBookings" }),
  sentMessages: many(messages),
  reviewsGiven: many(reviews, { relationName: "reviewer" }),
  reviewsReceived: many(reviews, { relationName: "reviewee" }),
  certifications: many(certifications),
  notifications: many(notifications),
  conversationMemberships: many(conversationMembers),
  payments: many(payments),
  verification: one(caregiverVerifications),
  wallet: one(wallets),
}));

export const nannyProfilesRelations = relations(nannyProfiles, ({ one }) => ({
  user: one(users, { fields: [nannyProfiles.id], references: [users.id] }),
}));

export const caregiverVerificationsRelations = relations(caregiverVerifications, ({ one }) => ({
  user: one(users, { fields: [caregiverVerifications.id], references: [users.id] }),
}));

export const childrenRelations = relations(children, ({ one }) => ({
  parent: one(users, { fields: [children.parentId], references: [users.id] }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  parent: one(users, { fields: [jobs.parentId], references: [users.id] }),
  applications: many(applications),
  bookings: many(bookings),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, { fields: [applications.jobId], references: [jobs.id] }),
  caregiver: one(users, { fields: [applications.caregiverId], references: [users.id] }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  parent: one(users, { fields: [bookings.parentId], references: [users.id], relationName: "parentBookings" }),
  caregiver: one(users, { fields: [bookings.caregiverId], references: [users.id], relationName: "caregiverBookings" }),
  job: one(jobs, { fields: [bookings.jobId], references: [jobs.id] }),
  payments: many(payments),
  reviews: many(reviews),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, { fields: [payments.bookingId], references: [bookings.id] }),
  user: one(users, { fields: [payments.userId], references: [users.id] }),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  members: many(conversationMembers),
  messages: many(messages),
}));

export const conversationMembersRelations = relations(conversationMembers, ({ one }) => ({
  conversation: one(conversations, { fields: [conversationMembers.conversationId], references: [conversations.id] }),
  user: one(users, { fields: [conversationMembers.userId], references: [users.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, { fields: [reviews.bookingId], references: [bookings.id] }),
  reviewer: one(users, { fields: [reviews.reviewerId], references: [users.id], relationName: "reviewer" }),
  reviewee: one(users, { fields: [reviews.revieweeId], references: [users.id], relationName: "reviewee" }),
}));

export const certificationsRelations = relations(certifications, ({ one }) => ({
  caregiver: one(users, { fields: [certifications.caregiverId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, { fields: [wallets.id], references: [users.id] }),
  transactions: many(walletTransactions),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  wallet: one(wallets, { fields: [walletTransactions.walletId], references: [wallets.id] }),
}));

CREATE TYPE "public"."chat_unlock_method" AS ENUM('stripe', 'credits', 'booking', 'premium');--> statement-breakpoint
CREATE TYPE "public"."exam_status" AS ENUM('started', 'submitted', 'marking', 'passed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."platform_credit_transaction_type" AS ENUM('earned_booking', 'earned_referral', 'redeemed', 'revoked_refund');--> statement-breakpoint
CREATE TYPE "public"."referral_status" AS ENUM('pending', 'signed_up', 'reviewing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'past_due', 'canceled', 'incomplete', 'trialing');--> statement-breakpoint
CREATE TYPE "public"."support_status" AS ENUM('open', 'closed');--> statement-breakpoint
ALTER TYPE "public"."booking_status" ADD VALUE 'paid' BEFORE 'confirmed';--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_series" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text NOT NULL,
	"caregiver_id" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"days_of_week" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"nickname" text,
	"retainer_amount" integer,
	"overtime_rate" integer,
	"tax_withholding" boolean DEFAULT false NOT NULL,
	"billing_cycle" text DEFAULT 'monthly' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"next_billing_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "care_milestones" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text NOT NULL,
	"caregiver_id" text NOT NULL,
	"content" text NOT NULL,
	"photo_url" text,
	"type" text DEFAULT 'moment' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "care_team" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text NOT NULL,
	"caregiver_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"nickname" text,
	"private_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certification_exams" (
	"id" text PRIMARY KEY NOT NULL,
	"certification_type" "certification_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"total_marks" integer DEFAULT 100 NOT NULL,
	"pass_percentage" integer DEFAULT 75 NOT NULL,
	"time_limit" integer DEFAULT 60 NOT NULL,
	"price" integer NOT NULL,
	"retake_price" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "certification_exams_certification_type_unique" UNIQUE("certification_type")
);
--> statement-breakpoint
CREATE TABLE "chat_unlocks" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text NOT NULL,
	"caregiver_id" text NOT NULL,
	"unlocked_at" timestamp DEFAULT now() NOT NULL,
	"method" "chat_unlock_method" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"exam_id" text NOT NULL,
	"text" text NOT NULL,
	"marks" integer NOT NULL,
	"page" integer NOT NULL,
	"order" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"exam_id" text NOT NULL,
	"caregiver_id" text NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"score" integer,
	"status" "exam_status" DEFAULT 'started' NOT NULL,
	"exam_version" integer DEFAULT 1 NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"submitted_at" timestamp,
	"marked_at" timestamp,
	"moderator_id" text,
	"moderator_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "parent_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"family_name" text,
	"family_photo" text,
	"location" text,
	"bio" text,
	"household_manual" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parent_verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"status" "verification_status" DEFAULT 'none' NOT NULL,
	"stripe_identity_session_id" text,
	"identity_verified" boolean DEFAULT false NOT NULL,
	"home_safety_status" "verification_status" DEFAULT 'none' NOT NULL,
	"home_safety_admin_notes" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"moderator_id" text
);
--> statement-breakpoint
CREATE TABLE "platform_credit_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"booking_id" text,
	"amount" integer NOT NULL,
	"type" "platform_credit_transaction_type" NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "processed_webhook_events" (
	"event_id" text PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"processed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" text PRIMARY KEY NOT NULL,
	"referrer_id" text NOT NULL,
	"referee_id" text NOT NULL,
	"status" "referral_status" DEFAULT 'pending' NOT NULL,
	"reward_amount" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "series_id" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "hiring_mode" text DEFAULT 'hourly' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "refined_schedule" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "check_in_time" timestamp;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "check_out_time" timestamp;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "overtime_minutes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "lateness_minutes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "overtime_amount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "is_overtime" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "is_trial" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "retainer_adjustment_id" text;--> statement-breakpoint
ALTER TABLE "caregiver_verifications" ADD COLUMN "selfie_url" text;--> statement-breakpoint
ALTER TABLE "caregiver_verifications" ADD COLUMN "moderator_id" text;--> statement-breakpoint
ALTER TABLE "children" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "children" ADD COLUMN "photo_url" text;--> statement-breakpoint
ALTER TABLE "conversation_members" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "is_support" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "support_status" "support_status" DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "assigned_moderator_id" text;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "hiring_type" text DEFAULT 'hourly' NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "retainer_budget" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "duration" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "child_count" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "schedule_type" text DEFAULT 'recurring' NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "schedule" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "specific_dates" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "is_draft" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "is_boosted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "file_url" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "file_type" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "file_name" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "weekly_rate" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "availability" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "terms" text;--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "education" text;--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "response_time" text DEFAULT '15 mins';--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "last_active" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "active_jobs_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "specializations" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "logistics" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "core_skills" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "certifications" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "video_url" text;--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "is_occupied" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "max_travel_distance" integer DEFAULT 25 NOT NULL;--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "series_id" text;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "moderator_id" text;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "conversation_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_image_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referral_code" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referred_by" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referral_balance" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_connect_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_subscription_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_status" "subscription_status";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_premium" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "platform_credits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_role_switched_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_active" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD COLUMN "earning_type" text;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_series" ADD CONSTRAINT "booking_series_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_series" ADD CONSTRAINT "booking_series_caregiver_id_users_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_milestones" ADD CONSTRAINT "care_milestones_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_milestones" ADD CONSTRAINT "care_milestones_caregiver_id_users_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_team" ADD CONSTRAINT "care_team_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_team" ADD CONSTRAINT "care_team_caregiver_id_users_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_unlocks" ADD CONSTRAINT "chat_unlocks_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_unlocks" ADD CONSTRAINT "chat_unlocks_caregiver_id_users_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_exam_id_certification_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."certification_exams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_submissions" ADD CONSTRAINT "exam_submissions_exam_id_certification_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."certification_exams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_submissions" ADD CONSTRAINT "exam_submissions_caregiver_id_users_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_submissions" ADD CONSTRAINT "exam_submissions_moderator_id_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_profiles" ADD CONSTRAINT "parent_profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_verifications" ADD CONSTRAINT "parent_verifications_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_verifications" ADD CONSTRAINT "parent_verifications_moderator_id_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_credit_transactions" ADD CONSTRAINT "platform_credit_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_credit_transactions" ADD CONSTRAINT "platform_credit_transactions_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referee_id_users_id_fk" FOREIGN KEY ("referee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_verifications" ADD CONSTRAINT "caregiver_verifications_moderator_id_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_assigned_moderator_id_users_id_fk" FOREIGN KEY ("assigned_moderator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_series_id_booking_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."booking_series"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_moderator_id_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_fkey" FOREIGN KEY ("referred_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nanny_profiles" DROP COLUMN "stripe_connect_id";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code");
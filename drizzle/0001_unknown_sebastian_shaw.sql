CREATE TYPE "public"."application_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."certification_status" AS ENUM('pending_payment', 'enrolled', 'in_progress', 'completed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."certification_type" AS ENUM('registration', 'elite_bundle', 'standards_program');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('open', 'closed', 'completed');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'authorized', 'captured', 'refunded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('none', 'draft', 'pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."wallet_transaction_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."wallet_transaction_type" AS ENUM('earning', 'withdrawal');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text NOT NULL,
	"caregiver_id" text NOT NULL,
	"job_id" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"hours_per_day" integer NOT NULL,
	"total_amount" integer NOT NULL,
	"notes" text,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"stripe_payment_intent_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "caregiver_verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"current_step" integer DEFAULT 1 NOT NULL,
	"id_front_url" text,
	"id_back_url" text,
	"background_auth" boolean DEFAULT false NOT NULL,
	"background_auth_timestamp" timestamp,
	"references" text,
	"status" "verification_status" DEFAULT 'none' NOT NULL,
	"admin_notes" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certifications" (
	"id" text PRIMARY KEY NOT NULL,
	"caregiver_id" text NOT NULL,
	"type" "certification_type" NOT NULL,
	"status" "certification_status" DEFAULT 'pending_payment' NOT NULL,
	"stripe_payment_id" text,
	"enrolled_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "children" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text NOT NULL,
	"name" text NOT NULL,
	"age" integer NOT NULL,
	"type" text NOT NULL,
	"special_needs" text DEFAULT '[]',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_members" (
	"conversation_id" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "conversation_members_conversation_id_user_id_pk" PRIMARY KEY("conversation_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"link_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text,
	"user_id" text NOT NULL,
	"amount" integer NOT NULL,
	"stripe_payment_intent_id" text,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text,
	"reviewer_id" text NOT NULL,
	"reviewee_id" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"wallet_id" text NOT NULL,
	"amount" integer NOT NULL,
	"type" "wallet_transaction_type" NOT NULL,
	"status" "wallet_transaction_status" DEFAULT 'pending' NOT NULL,
	"description" text,
	"stripe_transfer_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" text PRIMARY KEY NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."application_status";--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "status" SET DATA TYPE "public"."application_status" USING "status"::"public"."application_status";--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "status" SET DEFAULT 'open'::"public"."job_status";--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "status" SET DATA TYPE "public"."job_status" USING "status"::"public"."job_status";--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "min_rate" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "max_rate" integer;--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "stripe_connect_id" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_caregiver_id_users_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_verifications" ADD CONSTRAINT "caregiver_verifications_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_caregiver_id_users_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "children" ADD CONSTRAINT "children_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewee_id_users_id_fk" FOREIGN KEY ("reviewee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
-- Redundant enum value already exists in production:
-- ALTER TYPE "public"."wallet_transaction_status" ADD VALUE 'cleared' BEFORE 'completed';--> statement-breakpoint
CREATE TABLE "care_activities" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"parent_id" text NOT NULL,
	"caregiver_id" text NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"photo_url" text,
	"video_url" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "phone_number" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "emergency_contact_name" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "emergency_contact_phone" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "selected_child_ids" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "is_priority" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ADD COLUMN "pending_balance" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "care_activities" ADD CONSTRAINT "care_activities_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_activities" ADD CONSTRAINT "care_activities_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_activities" ADD CONSTRAINT "care_activities_caregiver_id_users_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
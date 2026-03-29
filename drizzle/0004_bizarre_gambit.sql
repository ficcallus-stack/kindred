ALTER TABLE "jobs" ADD COLUMN "stripe_payment_intent_id" text;--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "latitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "longitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "images" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "reply_text" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "reply_created_at" timestamp;
ALTER TABLE "user_broadcast_reads" DROP CONSTRAINT "user_broadcast_reads_user_id_broadcast_id_pk";--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "child_count" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "selected_child_ids" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "location_description" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone_number" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "emergency_contact_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "emergency_contact_phone" text;
ALTER TYPE "booking_status" ADD VALUE 'disputed';
ALTER TYPE "payment_status" ADD VALUE 'disputed';
ALTER TYPE "ticket_category" ADD VALUE 'dispute';

CREATE TABLE IF NOT EXISTS "reference_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"caregiver_id" text NOT NULL,
	"employer_email" text NOT NULL,
	"employer_name" text NOT NULL,
	"token" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"rating" integer,
	"comment" text,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reference_submissions_token_unique" UNIQUE("token")
);

DO $$ BEGIN
 ALTER TABLE "reference_submissions" ADD CONSTRAINT "reference_submissions_caregiver_id_users_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

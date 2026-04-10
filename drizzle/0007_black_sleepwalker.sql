DO $$ BEGIN
    CREATE TYPE "public"."subscription_tier" AS ENUM('none', 'plus', 'elite');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
    ALTER TYPE "public"."payment_status" ADD VALUE 'held_in_escrow';
EXCEPTION
    WHEN duplicate_promise THEN null; -- actually duplicate_object or just 42710
	WHEN OTHERS THEN
		IF SQLSTATE = '42710' THEN NULL;
		ELSE RAISE;
		END IF;
END $$;
--> statement-breakpoint

DO $$ BEGIN
    ALTER TABLE "search_analytics" ADD COLUMN "latitude" numeric(10, 7);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
    ALTER TABLE "search_analytics" ADD COLUMN "longitude" numeric(10, 7);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
    ALTER TABLE "users" ADD COLUMN "subscription_tier" "subscription_tier" DEFAULT 'none' NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
CREATE TABLE "broadcast_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"link_url" text,
	"priority" text DEFAULT 'normal' NOT NULL,
	"target_role" text DEFAULT 'all' NOT NULL,
	"sender_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" text PRIMARY KEY NOT NULL,
	"caregiver_id" text NOT NULL,
	"exam_type" text NOT NULL,
	"attempt_number" integer DEFAULT 1 NOT NULL,
	"score" integer,
	"status" "exam_status" DEFAULT 'started' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "platform_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"job_id" text,
	"rating" integer NOT NULL,
	"feedback" text,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"auth" text NOT NULL,
	"p256dh" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "search_analytics" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"query_text" text NOT NULL,
	"filters_applied" jsonb DEFAULT '{}'::jsonb,
	"results_count" integer DEFAULT 0 NOT NULL,
	"converted_to_contact" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"admin_id" text,
	"category" text NOT NULL,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"status" "ticket_status" DEFAULT 'open' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_broadcast_reads" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"broadcast_id" text NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_broadcast_reads_user_id_broadcast_id_pk" PRIMARY KEY("user_id","broadcast_id")
);
--> statement-breakpoint
ALTER TABLE "conversation_members" ADD COLUMN "last_read_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "is_synthetic" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "last_name_update_at" timestamp;--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "has_car" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "car_description" text;--> statement-breakpoint
ALTER TABLE "nanny_profiles" ADD COLUMN "detailed_experience" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_ghost" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "broadcast_notifications" ADD CONSTRAINT "broadcast_notifications_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_caregiver_id_users_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_reviews" ADD CONSTRAINT "platform_reviews_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_reviews" ADD CONSTRAINT "platform_reviews_subject_id_users_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_reviews" ADD CONSTRAINT "platform_reviews_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_analytics" ADD CONSTRAINT "search_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_broadcast_reads" ADD CONSTRAINT "user_broadcast_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_broadcast_reads" ADD CONSTRAINT "user_broadcast_reads_broadcast_id_broadcast_notifications_id_fk" FOREIGN KEY ("broadcast_id") REFERENCES "public"."broadcast_notifications"("id") ON DELETE no action ON UPDATE no action;
CREATE TABLE IF NOT EXISTS "apppage" (
	"page_id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"page_name" varchar(255) NOT NULL,
	"page_content" json,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_completed_quiz" (
	"user_id" integer NOT NULL,
	"quiz_id" integer NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"time_spent_seconds" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp DEFAULT now(),
	CONSTRAINT "user_completed_quiz_user_id_quiz_id_pk" PRIMARY KEY("user_id","quiz_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_completed_world" (
	"user_id" integer NOT NULL,
	"world_id" integer NOT NULL,
	"completed_at" timestamp DEFAULT now(),
	CONSTRAINT "user_completed_world_user_id_world_id_pk" PRIMARY KEY("user_id","world_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crisisteam" (
	"contact_id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"name_fi" varchar(255) NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"role_fi" varchar(255) NOT NULL,
	"role_en" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"order_number" bigint NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_otps" (
	"otp_id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"otp_code" varchar(255) NOT NULL,
	"valid_until" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "info" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization" (
	"organization_id" serial PRIMARY KEY NOT NULL,
	"organization_name" varchar(255) NOT NULL,
	"logo_url" varchar(500),
	"homepage_url" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "physical_reward" (
	"reward_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"reward_code" varchar(64) NOT NULL,
	"claimed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "physical_reward_reward_code_key" UNIQUE("reward_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz" (
	"quiz_id" serial PRIMARY KEY NOT NULL,
	"world_id" integer NOT NULL,
	"quiz_name_fi" varchar(255) NOT NULL,
	"quiz_name_en" varchar(255) NOT NULL,
	"quiz_content" json,
	"order_number" bigint NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "turvauser" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"organization_id" integer NOT NULL,
	"profile_name" varchar(255) NOT NULL,
	"email_address" varchar(255) NOT NULL,
	"profile_picture_url" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "turvauser_profile_name_key" UNIQUE("profile_name"),
	CONSTRAINT "turvauser_role_check" CHECK ("turvauser"."role" IN ('user', 'admin'))
);
--> statement-breakpoint
ALTER TABLE "turvauser" ADD COLUMN IF NOT EXISTS "role" varchar(20) DEFAULT 'user' NOT NULL;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conrelid = '"turvauser"'::regclass
		  AND contype = 'c'
		  AND pg_get_constraintdef(oid) ILIKE '%role%'
	) THEN
		ALTER TABLE "turvauser"
		ADD CONSTRAINT "turvauser_role_check"
		CHECK ("role" IN ('user', 'admin'));
	END IF;
END
$$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "world" (
	"world_id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"world_name_fi" varchar(255) NOT NULL,
	"world_name_en" varchar(255) NOT NULL,
	"order_number" bigint NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype = 'f' AND conrelid = '"apppage"'::regclass AND confrelid = '"organization"'::regclass) THEN
		ALTER TABLE "apppage" ADD CONSTRAINT "apppage_organization_id_organization_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("organization_id") ON DELETE no action ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype = 'f' AND conrelid = '"user_completed_quiz"'::regclass AND confrelid = '"turvauser"'::regclass) THEN
		ALTER TABLE "user_completed_quiz" ADD CONSTRAINT "user_completed_quiz_user_id_turvauser_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."turvauser"("user_id") ON DELETE no action ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype = 'f' AND conrelid = '"user_completed_quiz"'::regclass AND confrelid = '"quiz"'::regclass) THEN
		ALTER TABLE "user_completed_quiz" ADD CONSTRAINT "user_completed_quiz_quiz_id_quiz_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("quiz_id") ON DELETE no action ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype = 'f' AND conrelid = '"user_completed_world"'::regclass AND confrelid = '"turvauser"'::regclass) THEN
		ALTER TABLE "user_completed_world" ADD CONSTRAINT "user_completed_world_user_id_turvauser_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."turvauser"("user_id") ON DELETE no action ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype = 'f' AND conrelid = '"user_completed_world"'::regclass AND confrelid = '"world"'::regclass) THEN
		ALTER TABLE "user_completed_world" ADD CONSTRAINT "user_completed_world_world_id_world_world_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."world"("world_id") ON DELETE no action ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype = 'f' AND conrelid = '"crisisteam"'::regclass AND confrelid = '"organization"'::regclass) THEN
		ALTER TABLE "crisisteam" ADD CONSTRAINT "crisisteam_organization_id_organization_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("organization_id") ON DELETE no action ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype = 'f' AND conrelid = '"physical_reward"'::regclass AND confrelid = '"turvauser"'::regclass) THEN
		ALTER TABLE "physical_reward" ADD CONSTRAINT "physical_reward_user_id_turvauser_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."turvauser"("user_id") ON DELETE no action ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype = 'f' AND conrelid = '"quiz"'::regclass AND confrelid = '"world"'::regclass) THEN
		ALTER TABLE "quiz" ADD CONSTRAINT "quiz_world_id_world_world_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."world"("world_id") ON DELETE no action ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype = 'f' AND conrelid = '"turvauser"'::regclass AND confrelid = '"organization"'::regclass) THEN
		ALTER TABLE "turvauser" ADD CONSTRAINT "turvauser_organization_id_organization_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("organization_id") ON DELETE no action ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype = 'f' AND conrelid = '"world"'::regclass AND confrelid = '"organization"'::regclass) THEN
		ALTER TABLE "world" ADD CONSTRAINT "world_organization_id_organization_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("organization_id") ON DELETE no action ON UPDATE no action;
	END IF;
END
$$;
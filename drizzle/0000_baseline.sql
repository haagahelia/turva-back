CREATE TABLE IF NOT EXISTS "AppPage" (
	"page_id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"page_name" varchar(255) NOT NULL,
	"page_content" json,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User_Completed_Quiz" (
	"user_id" integer NOT NULL,
	"quiz_id" integer NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"time_spent_seconds" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp DEFAULT now(),
	CONSTRAINT "User_Completed_Quiz_user_id_quiz_id_pk" PRIMARY KEY("user_id","quiz_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User_Completed_World" (
	"user_id" integer NOT NULL,
	"world_id" integer NOT NULL,
	"completed_at" timestamp DEFAULT now(),
	CONSTRAINT "User_Completed_World_user_id_world_id_pk" PRIMARY KEY("user_id","world_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CrisisTeam" (
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
CREATE TABLE IF NOT EXISTS "Organization" (
	"organization_id" serial PRIMARY KEY NOT NULL,
	"organization_name" varchar(255) NOT NULL,
	"logo_url" varchar(500),
	"homepage_url" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Physical_Reward" (
	"reward_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"reward_code" varchar(64) NOT NULL,
	"claimed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "Physical_Reward_reward_code_key" UNIQUE("reward_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Quiz" (
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
CREATE TABLE IF NOT EXISTS "TurvaUser" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"organization_id" integer NOT NULL,
	"profile_name" varchar(255) NOT NULL,
	"email_address" varchar(255) NOT NULL,
	"profile_picture_url" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "TurvaUser_profile_name_key" UNIQUE("profile_name"),
	CONSTRAINT "turvauser_role_check" CHECK ("TurvaUser"."role" IN ('user', 'admin'))
);
--> statement-breakpoint
ALTER TABLE "TurvaUser" ADD COLUMN IF NOT EXISTS "role" varchar(20) DEFAULT 'user' NOT NULL;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conrelid = '"TurvaUser"'::regclass
		  AND contype = 'c'
		  AND pg_get_constraintdef(oid) ILIKE '%role%'
	) THEN
		ALTER TABLE "TurvaUser"
		ADD CONSTRAINT "turvauser_role_check"
		CHECK ("role" IN ('user', 'admin'));
	END IF;
END
$$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "World" (
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
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype = 'f' AND conrelid = '"AppPage"'::regclass AND confrelid = '"Organization"'::regclass) THEN
		ALTER TABLE "AppPage" ADD CONSTRAINT "AppPage_organization_id_Organization_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."Organization"("organization_id") ON DELETE no action ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype = 'f' AND conrelid = '"User_Completed_Quiz"'::regclass AND confrelid = '"TurvaUser"'::regclass) THEN
		ALTER TABLE "User_Completed_Quiz" ADD CONSTRAINT "User_Completed_Quiz_user_id_TurvaUser_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."TurvaUser"("user_id") ON DELETE no action ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype = 'f' AND conrelid = '"User_Completed_Quiz"'::regclass AND confrelid = '"Quiz"'::regclass) THEN
		ALTER TABLE "User_Completed_Quiz" ADD CONSTRAINT "User_Completed_Quiz_quiz_id_Quiz_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."Quiz"("quiz_id") ON DELETE no action ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype = 'f' AND conrelid = '"User_Completed_World"'::regclass AND confrelid = '"TurvaUser"'::regclass) THEN
		ALTER TABLE "User_Completed_World" ADD CONSTRAINT "User_Completed_World_user_id_TurvaUser_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."TurvaUser"("user_id") ON DELETE no action ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype = 'f' AND conrelid = '"User_Completed_World"'::regclass AND confrelid = '"World"'::regclass) THEN
		ALTER TABLE "User_Completed_World" ADD CONSTRAINT "User_Completed_World_world_id_World_world_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."World"("world_id") ON DELETE no action ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype = 'f' AND conrelid = '"CrisisTeam"'::regclass AND confrelid = '"Organization"'::regclass) THEN
		ALTER TABLE "CrisisTeam" ADD CONSTRAINT "CrisisTeam_organization_id_Organization_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."Organization"("organization_id") ON DELETE no action ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype = 'f' AND conrelid = '"Physical_Reward"'::regclass AND confrelid = '"TurvaUser"'::regclass) THEN
		ALTER TABLE "Physical_Reward" ADD CONSTRAINT "Physical_Reward_user_id_TurvaUser_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."TurvaUser"("user_id") ON DELETE no action ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype = 'f' AND conrelid = '"Quiz"'::regclass AND confrelid = '"World"'::regclass) THEN
		ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_world_id_World_world_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."World"("world_id") ON DELETE no action ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype = 'f' AND conrelid = '"TurvaUser"'::regclass AND confrelid = '"Organization"'::regclass) THEN
		ALTER TABLE "TurvaUser" ADD CONSTRAINT "TurvaUser_organization_id_Organization_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."Organization"("organization_id") ON DELETE no action ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype = 'f' AND conrelid = '"World"'::regclass AND confrelid = '"Organization"'::regclass) THEN
		ALTER TABLE "World" ADD CONSTRAINT "World_organization_id_Organization_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."Organization"("organization_id") ON DELETE no action ON UPDATE no action;
	END IF;
END
$$;
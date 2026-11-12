import {
  check,
  integer,
  json,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  varchar,
  bigint,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const info = pgTable("info", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const emailOtps = pgTable("email_otps", {
  otp_id: serial("otp_id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  otp_code: varchar("otp_code", { length: 255 }).notNull(),
  valid_until: timestamp("valid_until").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const organizations = pgTable("Organization", {
  organization_id: serial("organization_id").primaryKey(),
  organization_name: varchar("organization_name", { length: 255 }).notNull(),
  logo_url: varchar("logo_url", { length: 500 }),
  homepage_url: varchar("homepage_url", { length: 500 }),
  created_at: timestamp("created_at").defaultNow(),
  deleted_at: timestamp("deleted_at"),
});

export const users = pgTable(
  "TurvaUser",
  {
    user_id: serial("user_id").primaryKey(),
    role: varchar("role", { length: 20 })
      .$type<"user" | "admin">()
      .notNull()
      .default("user"),
    organization_id: integer("organization_id")
      .notNull()
      .references(() => organizations.organization_id),
    profile_name: varchar("profile_name", { length: 255 }).notNull(),
    email_address: varchar("email_address", { length: 255 }).notNull(),
    profile_picture_url: varchar("profile_picture_url", { length: 500 }),
    created_at: timestamp("created_at").defaultNow(),
    deleted_at: timestamp("deleted_at"),
  },
  (table) => [
    unique("TurvaUser_profile_name_key").on(table.profile_name),
    check("turvauser_role_check", sql`${table.role} IN ('user', 'admin')`),
  ]
);

export const appPages = pgTable("AppPage", {
  page_id: serial("page_id").primaryKey(),
  organization_id: integer("organization_id")
    .notNull()
    .references(() => organizations.organization_id),
  page_name: varchar("page_name", { length: 255 }).notNull(),
  page_content: json("page_content"),
  created_at: timestamp("created_at").defaultNow(),
  deleted_at: timestamp("deleted_at"),
});

export const worlds = pgTable("World", {
  world_id: serial("world_id").primaryKey(),
  organization_id: integer("organization_id")
    .notNull()
    .references(() => organizations.organization_id),
  world_name_fi: varchar("world_name_fi", { length: 255 }).notNull(),
  world_name_en: varchar("world_name_en", { length: 255 }).notNull(),
  order_number: bigint("order_number", { mode: "number" }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  deleted_at: timestamp("deleted_at"),
});

export const quizzes = pgTable("Quiz", {
  quiz_id: serial("quiz_id").primaryKey(),
  world_id: integer("world_id")
    .notNull()
    .references(() => worlds.world_id),
  quiz_name_fi: varchar("quiz_name_fi", { length: 255 }).notNull(),
  quiz_name_en: varchar("quiz_name_en", { length: 255 }).notNull(),
  quiz_content: json("quiz_content"),
  order_number: bigint("order_number", { mode: "number" }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  deleted_at: timestamp("deleted_at"),
});

export const completedQuizzes = pgTable(
  "User_Completed_Quiz",
  {
    user_id: integer("user_id")
      .notNull()
      .references(() => users.user_id),
    quiz_id: integer("quiz_id")
      .notNull()
      .references(() => quizzes.quiz_id),
    score: integer("score").notNull().default(0),
    time_spent_seconds: integer("time_spent_seconds").notNull().default(0),
    completed_at: timestamp("completed_at").defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.user_id, table.quiz_id] })]
);

export const crisisTeam = pgTable("CrisisTeam", {
  contact_id: serial("contact_id").primaryKey(),
  organization_id: integer("organization_id")
    .notNull()
    .references(() => organizations.organization_id),
  name_fi: varchar("name_fi", { length: 255 }).notNull(),
  name_en: varchar("name_en", { length: 255 }).notNull(),
  role_fi: varchar("role_fi", { length: 255 }).notNull(),
  role_en: varchar("role_en", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  order_number: bigint("order_number", { mode: "number" }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  deleted_at: timestamp("deleted_at"),
});

export const completedWorlds = pgTable(
  "User_Completed_World",
  {
    user_id: integer("user_id")
      .notNull()
      .references(() => users.user_id),
    world_id: integer("world_id")
      .notNull()
      .references(() => worlds.world_id),
    completed_at: timestamp("completed_at").defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.user_id, table.world_id] })]
);

export const physicalRewards = pgTable(
  "Physical_Reward",
  {
    reward_id: serial("reward_id").primaryKey(),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.user_id),
    reward_code: varchar("reward_code", { length: 64 }).notNull(),
    claimed_at: timestamp("claimed_at"),
    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => [unique("Physical_Reward_reward_code_key").on(table.reward_code)]
);

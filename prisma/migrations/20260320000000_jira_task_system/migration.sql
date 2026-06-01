-- Jira-style project management schema + client CRM fields
-- Safe to run on DBs that already received these changes via db push (uses IF NOT EXISTS / IF EXISTS)

DO $$ BEGIN
  CREATE TYPE "PreferredContact" AS ENUM ('whatsapp', 'email', 'phone');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Client CRM fields (may already exist from manual drift)
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "preferred_contact" "PreferredContact";
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "access_expires_at" TIMESTAMPTZ;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "last_active_at" TIMESTAMPTZ;

DO $$ BEGIN
  CREATE TYPE "ActivityActorType" AS ENUM ('admin', 'client');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ActivityEntityType" AS ENUM ('task', 'comment', 'attachment', 'report');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ActivityAction" AS ENUM (
    'task_created',
    'task_updated',
    'task_status_changed',
    'task_priority_changed',
    'task_type_changed',
    'task_assignee_changed',
    'task_due_date_changed',
    'task_labels_changed',
    'task_visibility_changed',
    'task_moved',
    'comment_added',
    'comment_updated',
    'comment_deleted',
    'file_uploaded',
    'file_deleted',
    'report_created',
    'report_updated',
    'report_published'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "description_rich" JSONB;

CREATE TABLE IF NOT EXISTS "task_labels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_labels_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "task_label_assignments" (
    "task_id" UUID NOT NULL,
    "label_id" UUID NOT NULL,
    CONSTRAINT "task_label_assignments_pkey" PRIMARY KEY ("task_id","label_id")
);

CREATE TABLE IF NOT EXISTS "task_comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "task_id" UUID NOT NULL,
    "parent_id" UUID,
    "author_type" "ActivityActorType" NOT NULL,
    "author_user_id" TEXT,
    "author_client_id" UUID,
    "body" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "task_attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "task_id" UUID NOT NULL,
    "uploaded_by_type" "ActivityActorType" NOT NULL,
    "uploaded_by_user_id" TEXT,
    "uploaded_by_client_id" UUID,
    "file_path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT,
    "size_bytes" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_attachments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "task_subtasks" (
    "parent_task_id" UUID NOT NULL,
    "child_task_id" UUID NOT NULL,
    "display_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_subtasks_pkey" PRIMARY KEY ("parent_task_id","child_task_id")
);

CREATE TABLE IF NOT EXISTS "weekly_report_attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "report_id" UUID NOT NULL,
    "file_path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT,
    "size_bytes" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "weekly_report_attachments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "weekly_report_comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "report_id" UUID NOT NULL,
    "parent_id" UUID,
    "author_type" "ActivityActorType" NOT NULL,
    "author_user_id" TEXT,
    "author_client_id" UUID,
    "body" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "weekly_report_comments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "activity_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "entity_type" "ActivityEntityType" NOT NULL,
    "entity_id" UUID NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "actor_type" "ActivityActorType" NOT NULL,
    "actor_user_id" TEXT,
    "actor_client_id" UUID,
    "diff" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- Remove invalid polymorphic FKs if a prior db push created them
ALTER TABLE "activity_logs" DROP CONSTRAINT IF EXISTS "activity_log_task_fk";
ALTER TABLE "activity_logs" DROP CONSTRAINT IF EXISTS "activity_log_task_comment_fk";
ALTER TABLE "activity_logs" DROP CONSTRAINT IF EXISTS "activity_log_task_attachment_fk";
ALTER TABLE "activity_logs" DROP CONSTRAINT IF EXISTS "activity_log_weekly_report_fk";
ALTER TABLE "activity_logs" DROP CONSTRAINT IF EXISTS "activity_log_weekly_report_comment_fk";
ALTER TABLE "activity_logs" DROP CONSTRAINT IF EXISTS "activity_log_weekly_report_attachment_fk";

CREATE UNIQUE INDEX IF NOT EXISTS "task_labels_project_id_name_key" ON "task_labels"("project_id", "name");
CREATE INDEX IF NOT EXISTS "task_labels_project_id_idx" ON "task_labels"("project_id");
CREATE INDEX IF NOT EXISTS "task_label_assignments_label_id_idx" ON "task_label_assignments"("label_id");
CREATE INDEX IF NOT EXISTS "task_comments_task_id_created_at_idx" ON "task_comments"("task_id", "created_at");
CREATE INDEX IF NOT EXISTS "task_comments_parent_id_idx" ON "task_comments"("parent_id");
CREATE INDEX IF NOT EXISTS "task_attachments_task_id_created_at_idx" ON "task_attachments"("task_id", "created_at");
CREATE INDEX IF NOT EXISTS "task_subtasks_child_task_id_idx" ON "task_subtasks"("child_task_id");
CREATE INDEX IF NOT EXISTS "tasks_project_id_status_display_order_idx" ON "tasks"("project_id", "status", "display_order");
CREATE INDEX IF NOT EXISTS "tasks_project_id_created_at_idx" ON "tasks"("project_id", "created_at");
CREATE INDEX IF NOT EXISTS "weekly_reports_project_id_created_at_idx" ON "weekly_reports"("project_id", "created_at");
CREATE INDEX IF NOT EXISTS "weekly_report_attachments_report_id_created_at_idx" ON "weekly_report_attachments"("report_id", "created_at");
CREATE INDEX IF NOT EXISTS "weekly_report_comments_report_id_created_at_idx" ON "weekly_report_comments"("report_id", "created_at");
CREATE INDEX IF NOT EXISTS "weekly_report_comments_parent_id_idx" ON "weekly_report_comments"("parent_id");
CREATE INDEX IF NOT EXISTS "activity_logs_project_id_created_at_idx" ON "activity_logs"("project_id", "created_at");
CREATE INDEX IF NOT EXISTS "activity_logs_entity_type_entity_id_idx" ON "activity_logs"("entity_type", "entity_id");

DO $$ BEGIN
  ALTER TABLE "task_labels" ADD CONSTRAINT "task_labels_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "task_label_assignments" ADD CONSTRAINT "task_label_assignments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "task_label_assignments" ADD CONSTRAINT "task_label_assignments_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "task_labels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "task_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "task_subtasks" ADD CONSTRAINT "task_subtasks_parent_task_id_fkey" FOREIGN KEY ("parent_task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "task_subtasks" ADD CONSTRAINT "task_subtasks_child_task_id_fkey" FOREIGN KEY ("child_task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "weekly_report_attachments" ADD CONSTRAINT "weekly_report_attachments_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "weekly_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "weekly_report_comments" ADD CONSTRAINT "weekly_report_comments_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "weekly_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "weekly_report_comments" ADD CONSTRAINT "weekly_report_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "weekly_report_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

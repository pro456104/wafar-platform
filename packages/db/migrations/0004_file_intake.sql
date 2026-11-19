-- The file-intake migration: the catalog record and the three transient
-- per-merchant intake tables, carrying data-model.md §2-§5 exactly.
CREATE TABLE "catalogs" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"file_name" text NOT NULL,
	"byte_size" bigint NOT NULL,
	"content_type" text NOT NULL,
	"content_hash" char(64) NOT NULL,
	"storage_key" text NOT NULL,
	"status" text DEFAULT 'uploaded' NOT NULL,
	"uploaded_at" timestamp (3) with time zone NOT NULL,
	"deleted_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalogs_file_name_length" CHECK (char_length("catalogs"."file_name") BETWEEN 1 AND 255),
	CONSTRAINT "catalogs_byte_size_check" CHECK ("catalogs"."byte_size" > 0 AND "catalogs"."byte_size" <= 104857600),
	CONSTRAINT "catalogs_content_type_check" CHECK ("catalogs"."content_type" IN (
		'application/vnd.ms-excel',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'application/pdf'
	)),
	CONSTRAINT "catalogs_content_hash_check" CHECK ("catalogs"."content_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "catalogs_status_check" CHECK ("catalogs"."status" IN ('uploaded','processing','completed','failed'))
);
--> statement-breakpoint
ALTER TABLE "catalogs" ADD CONSTRAINT "catalogs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "catalogs_storage_key_uq" ON "catalogs" USING btree ("storage_key");
--> statement-breakpoint
CREATE INDEX "catalogs_user_id_uploaded_at_idx" ON "catalogs" USING btree ("user_id","uploaded_at" DESC);
--> statement-breakpoint
CREATE INDEX "catalogs_user_id_retained_idx" ON "catalogs" USING btree ("user_id") WHERE "catalogs"."deleted_at" IS NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX "catalogs_content_hash_retained_uq" ON "catalogs" USING btree ("content_hash") WHERE "catalogs"."deleted_at" IS NULL;
--> statement-breakpoint
CREATE TABLE "catalog_monthly_uploads" (
	"user_id" text NOT NULL,
	"month_start" date NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_monthly_uploads_user_id_month_start_pk" PRIMARY KEY("user_id","month_start"),
	CONSTRAINT "catalog_monthly_uploads_count_check" CHECK ("catalog_monthly_uploads"."count" >= 0)
);
--> statement-breakpoint
ALTER TABLE "catalog_monthly_uploads" ADD CONSTRAINT "catalog_monthly_uploads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "catalog_monthly_uploads_month_start_idx" ON "catalog_monthly_uploads" USING btree ("month_start");
--> statement-breakpoint
CREATE TABLE "catalog_upload_attempts" (
	"user_id" text NOT NULL,
	"window_start" timestamp (3) with time zone NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_upload_attempts_user_id_window_start_pk" PRIMARY KEY("user_id","window_start"),
	CONSTRAINT "catalog_upload_attempts_count_check" CHECK ("catalog_upload_attempts"."count" >= 0)
);
--> statement-breakpoint
ALTER TABLE "catalog_upload_attempts" ADD CONSTRAINT "catalog_upload_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "catalog_upload_attempts_window_start_idx" ON "catalog_upload_attempts" USING btree ("window_start");
--> statement-breakpoint
CREATE TABLE "catalog_upload_sessions" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"upload_id" text NOT NULL,
	"original_key" text NOT NULL,
	"sanitized_key" text,
	"file_name" text NOT NULL,
	"declared_bytes" bigint NOT NULL,
	"format" text NOT NULL,
	"content_hash" char(64),
	"state" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"url_expires_at" timestamp (3) with time zone NOT NULL,
	"completed_at" timestamp (3) with time zone,
	"aborted_at" timestamp (3) with time zone,
	CONSTRAINT "catalog_upload_sessions_state_check" CHECK ("catalog_upload_sessions"."state" IN ('open','completing','done','aborted','failed')),
	CONSTRAINT "catalog_upload_sessions_format_check" CHECK ("catalog_upload_sessions"."format" IN ('xls','xlsx','doc','docx','pdf')),
	CONSTRAINT "catalog_upload_sessions_declared_bytes_check" CHECK ("catalog_upload_sessions"."declared_bytes" > 0 AND "catalog_upload_sessions"."declared_bytes" <= 104857600)
);
--> statement-breakpoint
ALTER TABLE "catalog_upload_sessions" ADD CONSTRAINT "catalog_upload_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_upload_sessions_original_key_uq" ON "catalog_upload_sessions" USING btree ("original_key");
--> statement-breakpoint
CREATE INDEX "catalog_upload_sessions_user_id_state_idx" ON "catalog_upload_sessions" USING btree ("user_id","state");
--> statement-breakpoint
CREATE INDEX "catalog_upload_sessions_state_url_expires_at_idx" ON "catalog_upload_sessions" USING btree ("state","url_expires_at");

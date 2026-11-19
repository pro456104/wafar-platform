-- Down migration for 0004_file_intake: the exact inverse in reverse dependency
-- order, so the applied-step count returns to 3.
DROP TABLE IF EXISTS "catalog_upload_sessions";
--> statement-breakpoint
DROP TABLE IF EXISTS "catalog_upload_attempts";
--> statement-breakpoint
DROP TABLE IF EXISTS "catalog_monthly_uploads";
--> statement-breakpoint
DROP TABLE IF EXISTS "catalogs";

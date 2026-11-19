// The `catalogs` module's schema: the catalog record and the three transient
// per-merchant intake tables, with every constraint and index of data-model.md
// §2-§5.
import { sql } from 'drizzle-orm';
import {
  bigint,
  char,
  check,
  date,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './users.ts';

const uploadedAt = timestamp('uploaded_at', { withTimezone: true, precision: 3 });

export const catalogs = pgTable(
  'catalogs',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    fileName: text('file_name').notNull(),
    byteSize: bigint('byte_size', { mode: 'number' }).notNull(),
    contentType: text('content_type').notNull(),
    contentHash: char('content_hash', { length: 64 }).notNull(),
    storageKey: text('storage_key').notNull(),
    status: text('status').notNull().default('uploaded'),
    uploadedAt: uploadedAt.notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true, precision: 3 }),
    createdAt: timestamp('created_at', { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('catalogs_storage_key_uq').on(table.storageKey),
    index('catalogs_user_id_uploaded_at_idx').on(table.userId, table.uploadedAt.desc()),
    index('catalogs_user_id_retained_idx')
      .on(table.userId)
      .where(sql`${table.deletedAt} IS NULL`),
    uniqueIndex('catalogs_content_hash_retained_uq')
      .on(table.contentHash)
      .where(sql`${table.deletedAt} IS NULL`),
    check('catalogs_file_name_length', sql`char_length(${table.fileName}) BETWEEN 1 AND 255`),
    check('catalogs_byte_size_check', sql`${table.byteSize} > 0 AND ${table.byteSize} <= 104857600`),
    check(
      'catalogs_content_type_check',
      sql`${table.contentType} IN (
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf'
      )`,
    ),
    check('catalogs_content_hash_check', sql`${table.contentHash} ~ '^[0-9a-f]{64}$'`),
    check(
      'catalogs_status_check',
      sql`${table.status} IN ('uploaded','processing','completed','failed')`,
    ),
  ],
);

export const catalogMonthlyUploads = pgTable(
  'catalog_monthly_uploads',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    monthStart: date('month_start').notNull(),
    count: integer('count').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.monthStart] }),
    index('catalog_monthly_uploads_month_start_idx').on(table.monthStart),
    check('catalog_monthly_uploads_count_check', sql`${table.count} >= 0`),
  ],
);

export const catalogUploadAttempts = pgTable(
  'catalog_upload_attempts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    windowStart: timestamp('window_start', { withTimezone: true, precision: 3 }).notNull(),
    count: integer('count').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.windowStart] }),
    index('catalog_upload_attempts_window_start_idx').on(table.windowStart),
    check('catalog_upload_attempts_count_check', sql`${table.count} >= 0`),
  ],
);

export const catalogUploadSessions = pgTable(
  'catalog_upload_sessions',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    uploadId: text('upload_id').notNull(),
    originalKey: text('original_key').notNull(),
    sanitizedKey: text('sanitized_key'),
    fileName: text('file_name').notNull(),
    declaredBytes: bigint('declared_bytes', { mode: 'number' }).notNull(),
    format: text('format').notNull(),
    contentHash: char('content_hash', { length: 64 }),
    state: text('state').notNull().default('open'),
    createdAt: timestamp('created_at', { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
    urlExpiresAt: timestamp('url_expires_at', { withTimezone: true, precision: 3 }).notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true, precision: 3 }),
    abortedAt: timestamp('aborted_at', { withTimezone: true, precision: 3 }),
  },
  (table) => [
    uniqueIndex('catalog_upload_sessions_original_key_uq').on(table.originalKey),
    index('catalog_upload_sessions_user_id_state_idx').on(table.userId, table.state),
    index('catalog_upload_sessions_state_url_expires_at_idx').on(table.state, table.urlExpiresAt),
    check(
      'catalog_upload_sessions_state_check',
      sql`${table.state} IN ('open','completing','done','aborted','failed')`,
    ),
    check(
      'catalog_upload_sessions_format_check',
      sql`${table.format} IN ('xls','xlsx','doc','docx','pdf')`,
    ),
    check(
      'catalog_upload_sessions_declared_bytes_check',
      sql`${table.declaredBytes} > 0 AND ${table.declaredBytes} <= 104857600`,
    ),
  ],
);

import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon'),
  color: text('color'),
  motivation: text('motivation'),
  archivedAt: integer('archived_at'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  deletedAt: integer('deleted_at'),
});

export const routines = sqliteTable('routines', {
  id: text('id').primaryKey(),
  goalId: text('goal_id')
    .notNull()
    .references(() => goals.id),
  scheduleType: text('schedule_type', {
    enum: ['daily', 'weekdays', 'times_per_week'],
  }).notNull(),
  weekdays: integer('weekdays'),
  timesPerWeek: integer('times_per_week'),
  timeOfDay: text('time_of_day'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  updatedAt: integer('updated_at').notNull(),
  deletedAt: integer('deleted_at'),
});

export const reminders = sqliteTable('reminders', {
  id: text('id').primaryKey(),
  routineId: text('routine_id')
    .notNull()
    .references(() => routines.id),
  offsetMin: integer('offset_min').notNull().default(0),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  updatedAt: integer('updated_at').notNull(),
  deletedAt: integer('deleted_at'),
});

export const completions = sqliteTable(
  'completions',
  {
    id: text('id').primaryKey(),
    routineId: text('routine_id')
      .notNull()
      .references(() => routines.id),
    date: text('date').notNull(),
    completedAt: integer('completed_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
  },
  t => [unique('completions_routine_date_unique').on(t.routineId, t.date)],
);

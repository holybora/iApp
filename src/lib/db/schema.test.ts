import Database from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import * as schema from './schema';

function createTestDb() {
  const sqlite = new Database(':memory:');
  sqlite.pragma('foreign_keys = ON');
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: 'src/lib/db/migrations' });
  return db;
}

const NOW = 1_700_000_000_000;

function insertGoal(db: ReturnType<typeof createTestDb>, id = 'g1') {
  return db
    .insert(schema.goals)
    .values({ id, name: 'Read daily', createdAt: NOW, updatedAt: NOW })
    .run();
}

function insertRoutine(db: ReturnType<typeof createTestDb>, id = 'r1') {
  return db
    .insert(schema.routines)
    .values({
      id,
      goalId: 'g1',
      scheduleType: 'daily',
      timeOfDay: '08:00',
      updatedAt: NOW,
    })
    .run();
}

function insertReminder(db: ReturnType<typeof createTestDb>, id = 'rem1') {
  return db
    .insert(schema.reminders)
    .values({ id, routineId: 'r1', updatedAt: NOW })
    .run();
}

function insertCompletion(db: ReturnType<typeof createTestDb>, id = 'c1') {
  return db
    .insert(schema.completions)
    .values({
      id,
      routineId: 'r1',
      date: '2026-07-13',
      completedAt: NOW,
      updatedAt: NOW,
    })
    .run();
}

describe('db schema: create + read', () => {
  it('migration applies and all four tables round-trip', () => {
    const db = createTestDb();
    insertGoal(db);
    insertRoutine(db);
    insertReminder(db);
    insertCompletion(db);

    const goal = db.select().from(schema.goals).all();
    const routine = db.select().from(schema.routines).all();
    const reminder = db.select().from(schema.reminders).all();
    const completion = db.select().from(schema.completions).all();

    expect(goal).toHaveLength(1);
    expect(goal[0]?.deletedAt).toBeNull();
    expect(routine[0]?.active).toBe(true);
    expect(reminder[0]?.offsetMin).toBe(0);
    expect(reminder[0]?.enabled).toBe(true);
    expect(completion[0]?.date).toBe('2026-07-13');
  });
});

describe('db schema: update', () => {
  it('goal and routine update round-trip', () => {
    const db = createTestDb();
    insertGoal(db);
    insertRoutine(db);

    db.update(schema.goals)
      .set({ name: 'Read weekly' })
      .where(eq(schema.goals.id, 'g1'))
      .run();
    db.update(schema.routines)
      .set({ timeOfDay: '21:30' })
      .where(eq(schema.routines.id, 'r1'))
      .run();

    const goal = db
      .select()
      .from(schema.goals)
      .where(eq(schema.goals.id, 'g1'))
      .get();
    const routine = db
      .select()
      .from(schema.routines)
      .where(eq(schema.routines.id, 'r1'))
      .get();

    expect(goal?.name).toBe('Read weekly');
    expect(routine?.timeOfDay).toBe('21:30');
  });

  it('reminder and completion update round-trip', () => {
    const db = createTestDb();
    insertGoal(db);
    insertRoutine(db);
    insertReminder(db);
    insertCompletion(db);

    const newCompletedAt = NOW + 1000;
    db.update(schema.reminders)
      .set({ enabled: false })
      .where(eq(schema.reminders.id, 'rem1'))
      .run();
    db.update(schema.completions)
      .set({ completedAt: newCompletedAt })
      .where(eq(schema.completions.id, 'c1'))
      .run();

    const reminder = db
      .select()
      .from(schema.reminders)
      .where(eq(schema.reminders.id, 'rem1'))
      .get();
    const completion = db
      .select()
      .from(schema.completions)
      .where(eq(schema.completions.id, 'c1'))
      .get();

    expect(reminder?.enabled).toBe(false);
    expect(completion?.completedAt).toBe(newCompletedAt);
  });
});

describe('db schema: delete', () => {
  it('delete round-trip removes rows, respecting FK child-first order', () => {
    const db = createTestDb();
    insertGoal(db);
    insertRoutine(db);
    insertReminder(db);
    insertCompletion(db);

    // Delete children before parents to respect FK constraints.
    db.delete(schema.completions).where(eq(schema.completions.id, 'c1')).run();
    db.delete(schema.reminders).where(eq(schema.reminders.id, 'rem1')).run();
    db.delete(schema.routines).where(eq(schema.routines.id, 'r1')).run();
    db.delete(schema.goals).where(eq(schema.goals.id, 'g1')).run();

    const completion = db
      .select()
      .from(schema.completions)
      .where(eq(schema.completions.id, 'c1'))
      .all();
    const reminder = db
      .select()
      .from(schema.reminders)
      .where(eq(schema.reminders.id, 'rem1'))
      .all();
    const routine = db
      .select()
      .from(schema.routines)
      .where(eq(schema.routines.id, 'r1'))
      .all();
    const goal = db
      .select()
      .from(schema.goals)
      .where(eq(schema.goals.id, 'g1'))
      .all();

    expect(completion).toHaveLength(0);
    expect(reminder).toHaveLength(0);
    expect(routine).toHaveLength(0);
    expect(goal).toHaveLength(0);
  });
});

describe('db schema: constraints', () => {
  it('routine without existing goal violates FK', () => {
    const db = createTestDb();
    expect(() =>
      db
        .insert(schema.routines)
        .values({
          id: 'r-orphan',
          goalId: 'missing',
          scheduleType: 'daily',
          updatedAt: NOW,
        })
        .run(),
    ).toThrow(/FOREIGN KEY/);
  });

  it('reminder without existing routine violates FK', () => {
    const db = createTestDb();
    expect(() =>
      db
        .insert(schema.reminders)
        .values({ id: 'rem-orphan', routineId: 'missing', updatedAt: NOW })
        .run(),
    ).toThrow(/FOREIGN KEY/);
  });

  it('completion without existing routine violates FK', () => {
    const db = createTestDb();
    expect(() =>
      db
        .insert(schema.completions)
        .values({
          id: 'c-orphan',
          routineId: 'missing',
          date: '2026-07-13',
          completedAt: NOW,
          updatedAt: NOW,
        })
        .run(),
    ).toThrow(/FOREIGN KEY/);
  });

  it('one completion per routine per day (unique constraint)', () => {
    const db = createTestDb();
    insertGoal(db);
    insertRoutine(db);
    insertCompletion(db);
    expect(() =>
      db
        .insert(schema.completions)
        .values({
          id: 'c2',
          routineId: 'r1',
          date: '2026-07-13',
          completedAt: NOW,
          updatedAt: NOW,
        })
        .run(),
    ).toThrow(/UNIQUE/);
  });
});

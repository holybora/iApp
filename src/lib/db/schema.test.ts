import Database from 'better-sqlite3';
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

describe('db schema', () => {
  it('migration applies and all four tables round-trip', () => {
    const db = createTestDb();
    insertGoal(db);
    insertRoutine(db);
    db.insert(schema.reminders)
      .values({ id: 'rem1', routineId: 'r1', updatedAt: NOW })
      .run();
    db.insert(schema.completions)
      .values({
        id: 'c1',
        routineId: 'r1',
        date: '2026-07-13',
        completedAt: NOW,
        updatedAt: NOW,
      })
      .run();

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

  it('one completion per routine per day (unique constraint)', () => {
    const db = createTestDb();
    insertGoal(db);
    insertRoutine(db);
    const completion = {
      routineId: 'r1',
      date: '2026-07-13',
      completedAt: NOW,
      updatedAt: NOW,
    };
    db.insert(schema.completions)
      .values({ id: 'c1', ...completion })
      .run();
    expect(() =>
      db
        .insert(schema.completions)
        .values({ id: 'c2', ...completion })
        .run(),
    ).toThrow(/UNIQUE/);
  });
});

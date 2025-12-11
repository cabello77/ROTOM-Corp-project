const { describe, afterEach, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { newDb } = require('pg-mem');

// Read all migration SQL files so the in-memory DB matches the real schema
const migrationDir = path.join(__dirname, '..', 'prisma', 'migrations');
const migrationFiles = fs
  .readdirSync(migrationDir)
  .filter((entry) => fs.existsSync(path.join(migrationDir, entry, 'migration.sql')))
  .map((entry) => path.join(migrationDir, entry, 'migration.sql'));

// pg-mem cannot parse Prisma's auto-generated /* ... */ warning blocks, so strip block and line comments.
function loadAndCleanMigrations(files) {
  return files
    .map((file) => fs.readFileSync(file, 'utf8'))
    .map((sql) =>
      sql
        .replace(/\/\*[\s\S]*?\*\//g, '') // remove /* ... */ blocks
        .split('\n')
        .map((line) => (line.trim().startsWith('--') ? '' : line))
        .join('\n')
    )
    .join('\n\n');
}

// Skip the plpgsql-heavy migration and replace with pg-mem friendly SQL that yields the same final schema shape
const pgMemFriendly = `
ALTER TABLE "ClubMember" ADD COLUMN IF NOT EXISTS "pageNumber" INTEGER;
ALTER TABLE "Club" ADD COLUMN IF NOT EXISTS "readingGoalPageStart" INTEGER;
ALTER TABLE "Club" ADD COLUMN IF NOT EXISTS "readingGoalPageEnd" INTEGER;
ALTER TABLE "Club" DROP COLUMN IF EXISTS "goalDeadline";
ALTER TABLE "Club" ADD COLUMN IF NOT EXISTS "goalDeadline" TEXT;
`;

const filteredMigrations = migrationFiles.filter(
  (file) => !file.includes('20251203233402_update_club_and_member_fields')
);

const migrationSql = loadAndCleanMigrations(filteredMigrations) + '\n' + pgMemFriendly;

function createDatabase() {
  const db = newDb({ autoCreateForeignKeyIndices: true });

  // Prisma expects a few Postgres functions to exist
  db.public.registerFunction({ name: 'current_database', returns: 'text', implementation: () => 'pg-mem' });
  db.public.registerFunction({ name: 'version', returns: 'text', implementation: () => 'PostgreSQL 14.5' });
  db.public.registerFunction({ name: 'inet_client_addr', returns: 'text', implementation: () => '127.0.0.1' });

  // Apply the project migrations to the in-memory database
  db.public.none(migrationSql);

  return db;
}

describe('Prisma model tests (in-memory)', () => {
  let db;

  beforeEach(async () => {
    db = createDatabase();
  });

  afterEach(async () => {
    db = null;
  });

  test('creates a user with a nested profile and defaults', async () => {
    const user = db.public.one(`
      INSERT INTO "User" ("name", "email", "password")
      VALUES ('Alice', 'alice@example.com', 'hash')
      RETURNING "id", "name", "email", "createdAt" AS "createdAt";
    `);

    const profile = db.public.one(`
      INSERT INTO "Profile" ("username", "fullName", "userId")
      VALUES ('alice123', 'Alice Example', ${user.id})
      RETURNING "id", "username", "fullName", "joinDate" AS "joinDate", "userId" AS "userId";
    `);

    assert.equal(user.name, 'Alice');
    assert.equal(user.email, 'alice@example.com');
    assert.ok(user.createdAt instanceof Date);
    assert.equal(profile.username, 'alice123');
    assert.equal(profile.fullName, 'Alice Example');
    assert.ok(profile.joinDate instanceof Date);
    assert.equal(profile.userId, user.id);
  });

  test('rejects duplicate emails and duplicate profile usernames', async () => {
    db.public.none(`
      INSERT INTO "User" ("name", "email", "password") VALUES ('User One', 'dup@example.com', 'hash');
      INSERT INTO "Profile" ("username", "fullName", "userId") VALUES ('dup-username', 'User One', 1);
    `);

    assert.throws(() => {
      db.public.none(`
        INSERT INTO "User" ("name", "email", "password") VALUES ('User Two', 'dup@example.com', 'hash');
      `);
    }, /duplicate key value/);

    const userThree = db.public.one(`
      INSERT INTO "User" ("name", "email", "password")
      VALUES ('User Three', 'unique@example.com', 'hash')
      RETURNING "id";
    `);

    assert.throws(() => {
      db.public.none(`
        INSERT INTO "Profile" ("username", "fullName", "userId")
        VALUES ('dup-username', 'User Three', ${userThree.id});
      `);
    }, /duplicate key value/);
  });

  test('cascades profile deletion when user is removed', async () => {
    const user = db.public.one(`
      INSERT INTO "User" ("name", "email", "password")
      VALUES ('Delete Me', 'deleteme@example.com', 'hash')
      RETURNING "id";
    `);
    db.public.none(`
      INSERT INTO "Profile" ("username", "fullName", "userId")
      VALUES ('deleter', 'Delete Me User', ${user.id});
    `);

    db.public.none(`DELETE FROM "User" WHERE "id" = ${user.id};`);

    const remaining = db.public.many(`SELECT * FROM "Profile" WHERE "userId" = ${user.id};`);
    assert.equal(remaining.length, 0);
  });

  test('enforces unique club membership per user/club pair', async () => {
    const host = db.public.one(`
      INSERT INTO "User" ("name", "email", "password")
      VALUES ('Host', 'host@example.com', 'hash')
      RETURNING "id";
    `);
    const member = db.public.one(`
      INSERT INTO "User" ("name", "email", "password")
      VALUES ('Member', 'member@example.com', 'hash')
      RETURNING "id";
    `);
    const club = db.public.one(`
      INSERT INTO "Club" ("name", "description", "creatorId")
      VALUES ('Book Club', 'Testing club', ${host.id})
      RETURNING "id";
    `);

    db.public.none(`
      INSERT INTO "ClubMember" ("clubId", "userId", "role") VALUES (${club.id}, ${member.id}, 'MEMBER');
    `);

    assert.throws(() => {
      db.public.none(`
        INSERT INTO "ClubMember" ("clubId", "userId", "role") VALUES (${club.id}, ${member.id}, 'MEMBER');
      `);
    }, /duplicate key value/);
  });
});

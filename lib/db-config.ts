import path from 'path';

/**
 * Get the database path based on environment
 * - Development: Uses local SQLite file
 * - Production: Uses Turso (cloud SQLite) or local path from env
 */
export function getDbPath(): string {
  // In production with Turso, this won't be used (we'll use Turso URL directly)
  // But we still need a fallback for local development

  if (process.env.DB_PATH) {
    return process.env.DB_PATH;
  }

  // Default to local development database
  // Use absolute path for better-sqlite3
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  return dbPath;
}

/**
 * Check if we should use Turso (production cloud database)
 */
export function useTurso(): boolean {
  return !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
}

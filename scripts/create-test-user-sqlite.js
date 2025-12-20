const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');

const db = new Database('prisma/dev.db');

const email = 'test@brushatelier.ai';
const password = 'password123';
const name = 'Test User';

try {
  // Check if user already exists
  const existingUser = db.prepare('SELECT * FROM User WHERE email = ?').get(email);

  if (existingUser) {
    console.log('✅ Test user already exists!');
    console.log('Email:', email);
    console.log('Password: password123');
    process.exit(0);
  }

  // Generate a CUID-like ID (simplified version)
  const generateCuid = () => {
    return 'c' + randomBytes(12).toString('base64').replace(/[^a-z0-9]/gi, '').substring(0, 24);
  };

  const userId = generateCuid();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const now = new Date().toISOString();

  // Insert user
  const insert = db.prepare(`
    INSERT INTO User (id, email, password, name, role, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(userId, email, hashedPassword, name, 'STUDENT', now, now);

  console.log('✅ Test user created successfully!');
  console.log('Email:', email);
  console.log('Password: password123');
  console.log('User ID:', userId);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
} finally {
  db.close();
}

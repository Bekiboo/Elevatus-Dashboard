import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcrypt';
import { pgTable, serial, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

// Redéfinir la table users localement
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  title: varchar('title', { length: 150 }),
  role: varchar('role', { length: 20 }).notNull().default('author'),
  verified: boolean('verified').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Créer la connexion DB
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const client = postgres(connectionString);
const db = drizzle(client);

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await db.select().from(users).where(eq(users.email, 'admin@elevatus.com')).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('✅ Admin user already exists: admin@elevatus.com');
      return;
    }

    // Créer l'utilisateur admin par défaut
    const adminPassword = 'Admin123!'; // Changez ce mot de passe !
    const hashedPassword = await hashPassword(adminPassword);

    await db.insert(users).values({
      email: 'admin@elevatus.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'Elevatus',
      title: 'Administrator',
      role: 'admin',
      verified: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@elevatus.com');
    console.log('🔑 Password: Admin123!');
    console.log('');
    console.log('⚠️  IMPORTANT: Changez ce mot de passe dès votre première connexion !');
    console.log('');
    console.log('🚀 Vous pouvez maintenant vous connecter sur /login');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Exécuter le seed directement
seed()
  .then(() => {
    console.log('🎉 Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });

export default seed;
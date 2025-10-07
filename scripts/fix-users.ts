import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
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

async function fixUnverifiedUsers() {
  console.log('🔧 Correcting unverified users...');

  try {
    // Mettre à jour tous les utilisateurs non-admin pour qu'ils soient vérifiés
    // (puisqu'ils ont été créés via invitation)
    const result = await db.update(users)
      .set({ 
        verified: true,
        updatedAt: new Date()
      })
      .where(eq(users.verified, false))
      .returning();

    console.log(`✅ ${result.length} utilisateur(s) mis à jour et maintenant vérifié(s)`);
    
    if (result.length > 0) {
      result.forEach(user => {
        console.log(`   - ${user.firstName} ${user.lastName} (${user.email})`);
      });
    }

  } catch (error) {
    console.error('❌ Error fixing unverified users:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Exécuter le fix directement
fixUnverifiedUsers()
  .then(() => {
    console.log('🎉 Fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });

export default fixUnverifiedUsers;
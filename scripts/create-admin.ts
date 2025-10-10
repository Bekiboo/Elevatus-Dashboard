import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcrypt';
import { pgTable, serial, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

// Define the users table schema
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

// Database connection
if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not defined');
}

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function createAdminUser() {
	try {
		console.log('🔐 Creating admin account...\n');

		// Admin account details - customize these as needed
		const adminData = {
			email: 'admin@elevatus.com',
			password: 'admin123!', // Change this to a secure password
			firstName: 'Admin',
			lastName: 'Elevatus',
			title: 'System Administrator',
			role: 'admin',
			verified: true
		};

		console.log('Admin account details:');
		console.log(`Email: ${adminData.email}`);
		console.log(`Password: ${adminData.password}`);
		console.log(`Name: ${adminData.firstName} ${adminData.lastName}`);
		console.log(`Role: ${adminData.role}\n`);

		// Check if admin already exists
		const existingAdmin = await db
			.select()
			.from(users)
			.where(eq(users.email, adminData.email))
			.limit(1);

		if (existingAdmin.length > 0) {
			console.log('⚠️  Admin user already exists!');
			console.log('If you want to reset the password, delete the existing user first.');
			return;
		}

		// Hash the password
		console.log('🔒 Hashing password...');
		const passwordHash = await hashPassword(adminData.password);

		// Insert the admin user
		console.log('💾 Creating user in database...');
		const [newAdmin] = await db
			.insert(users)
			.values({
				email: adminData.email,
				passwordHash: passwordHash,
				firstName: adminData.firstName,
				lastName: adminData.lastName,
				title: adminData.title,
				role: adminData.role,
				verified: adminData.verified
			})
			.returning();

		console.log('✅ Admin user created successfully!');
		console.log(`User ID: ${newAdmin.id}`);
		console.log(`Email: ${newAdmin.email}`);
		console.log(`Role: ${newAdmin.role}`);
		console.log(`Verified: ${newAdmin.verified}`);

		console.log('\n🚀 You can now login with:');
		console.log(`Email: ${adminData.email}`);
		console.log(`Password: ${adminData.password}`);
		console.log('\n⚠️  IMPORTANT: Change the default password after first login!');

	} catch (error) {
		console.error('❌ Error creating admin user:', error);
		
		const errorMessage = (error as Error)?.message || '';
		if (errorMessage.includes('duplicate key')) {
			console.log('\nℹ️  This usually means the email already exists in the database.');
		}
	}
}

createAdminUser().finally(() => {
	sql.end();
});
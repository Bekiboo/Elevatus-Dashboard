import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	return {
		user: locals.user
	};
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		if (!locals.user) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();

		const title = formData.get('title') as string;
		const caption = formData.get('caption') as string;
		const excerpt = formData.get('excerpt') as string;
		const thumbnail = formData.get('thumbnail') as string;
		const status = formData.get('status') as string;
		const featured = formData.get('featured') === 'on';
		const archived = formData.get('archived') === 'on';
		const contentJson = formData.get('content') as string;

		// Validate required fields
		if (!title || !caption) {
			return {
				error: 'Title and caption are required'
			};
		}

		try {
			// Parse content JSON
			let content;
			if (contentJson) {
				try {
					content = JSON.parse(contentJson);
				} catch {
					return {
						error: 'Invalid content format'
					};
				}
			} else {
				content = [];
			}

			// Generate slug from title
			let slug = title
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/-+/g, '-')
				.trim();

			// Check if slug already exists and make it unique
			const [existingPost] = await db
				.select({ id: posts.id })
				.from(posts)
				.where(eq(posts.slug, slug))
				.limit(1);

			if (existingPost) {
				// Append timestamp to make it unique
				slug = `${slug}-${Date.now()}`;
			}

			// Create the post
			const [newPost] = await db
				.insert(posts)
				.values({
					authorId: locals.user.id,
					title,
					slug,
					caption,
					excerpt: excerpt || null,
					thumbnail: thumbnail || null,
					status,
					featured,
					archived,
					content,
					views: 0,
					publishedAt: status === 'published' ? new Date() : null,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning({ id: posts.id, slug: posts.slug });

			// Redirect to the new post
			throw redirect(302, `/blog/${newPost.slug}`);

		} catch (err) {
			console.error('Error creating blog post:', err);
			if (err instanceof Error && 'status' in err) {
				throw err;
			}
			return {
				error: 'Failed to create blog post'
			};
		}
	}
};
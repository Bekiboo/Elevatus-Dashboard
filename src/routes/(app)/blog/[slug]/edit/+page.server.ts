import { db } from '$lib/server/db';
import { posts, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const { slug } = params;

	try {
		// Get the post with author information
		const [post] = await db
			.select({
				id: posts.id,
				authorId: posts.authorId,
				title: posts.title,
				slug: posts.slug,
				caption: posts.caption,
				excerpt: posts.excerpt,
				thumbnail: posts.thumbnail,
				status: posts.status,
				featured: posts.featured,
				archived: posts.archived,
				content: posts.content,
				views: posts.views,
				createdAt: posts.createdAt,
				publishedAt: posts.publishedAt,
				updatedAt: posts.updatedAt,
				author: {
					id: users.id,
					firstName: users.firstName,
					lastName: users.lastName,
					title: users.title,
					email: users.email
				}
			})
			.from(posts)
			.leftJoin(users, eq(posts.authorId, users.id))
			.where(eq(posts.slug, slug))
			.limit(1);

		if (!post) {
			throw error(404, 'Post not found');
		}

		// Check if user can edit this post (author or admin)
		if (locals.user.role !== 'admin' && post.authorId !== locals.user.id) {
			throw error(403, 'Forbidden: You can only edit your own posts');
		}

		return {
			user: locals.user,
			post
		};
	} catch (err) {
		console.error('Error loading blog post for edit:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to load blog post');
	}
};

export const actions: Actions = {
	update: async ({ locals, params, request }) => {
		if (!locals.user) {
			throw error(401, 'Unauthorized');
		}

		const { slug } = params;
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

			// Get the current post to check permissions
			const [currentPost] = await db
				.select({ id: posts.id, authorId: posts.authorId, slug: posts.slug })
				.from(posts)
				.where(eq(posts.slug, slug))
				.limit(1);

			if (!currentPost) {
				throw error(404, 'Post not found');
			}

			// Check permissions
			if (locals.user.role !== 'admin' && currentPost.authorId !== locals.user.id) {
				throw error(403, 'Forbidden: You can only edit your own posts');
			}

			// Generate new slug if title changed
			let newSlug = currentPost.slug;
			if (title !== currentPost.slug) {
				newSlug = title
					.toLowerCase()
					.replace(/[^a-z0-9\s-]/g, '')
					.replace(/\s+/g, '-')
					.replace(/-+/g, '-')
					.trim();

				// Check if new slug already exists
				const [existingPost] = await db
					.select({ id: posts.id })
					.from(posts)
					.where(eq(posts.slug, newSlug))
					.limit(1);

				if (existingPost && existingPost.id !== currentPost.id) {
					// Append timestamp to make it unique
					newSlug = `${newSlug}-${Date.now()}`;
				}
			}

			// Update the post
			await db
				.update(posts)
				.set({
					title,
					slug: newSlug,
					caption,
					excerpt: excerpt || null,
					thumbnail: thumbnail || null,
					status,
					featured,
					archived,
					content,
					publishedAt: status === 'published' && currentPost.slug !== 'published' 
						? new Date() 
						: undefined,
					updatedAt: new Date()
				})
				.where(eq(posts.id, currentPost.id));

			// Redirect to the updated post (with new slug if changed)
			throw redirect(302, `/blog/${newSlug}`);

		} catch (err) {
			console.error('Error updating blog post:', err);
			if (err instanceof Error && 'status' in err) {
				throw err;
			}
			return {
				error: 'Failed to update blog post'
			};
		}
	},

	delete: async ({ locals, params }) => {
		if (!locals.user) {
			throw error(401, 'Unauthorized');
		}

		const { slug } = params;

		try {
			// Get the current post to check permissions
			const [currentPost] = await db
				.select({ id: posts.id, authorId: posts.authorId })
				.from(posts)
				.where(eq(posts.slug, slug))
				.limit(1);

			if (!currentPost) {
				throw error(404, 'Post not found');
			}

			// Check permissions
			if (locals.user.role !== 'admin' && currentPost.authorId !== locals.user.id) {
				throw error(403, 'Forbidden: You can only delete your own posts');
			}

			// Delete the post
			await db
				.delete(posts)
				.where(eq(posts.id, currentPost.id));

			// Redirect to blog listing
			throw redirect(302, '/blog');

		} catch (err) {
			console.error('Error deleting blog post:', err);
			if (err instanceof Error && 'status' in err) {
				throw err;
			}
			return {
				error: 'Failed to delete blog post'
			};
		}
	}
};
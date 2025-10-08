import { db } from '$lib/server/db';
import { posts, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		// Redirect to login if not authenticated
		throw error(401, 'Unauthorized');
	}

	const { slug } = params;

	try {
		// Get the post with author information
		const [post] = await db
			.select({
				id: posts.id,
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

		// Increment view count
		await db
			.update(posts)
			.set({ views: post.views + 1 })
			.where(eq(posts.id, post.id));

		return {
			user: locals.user,
			post: {
				...post,
				views: post.views + 1 // Update the view count in the returned data
			}
		};
	} catch (err) {
		console.error('Error loading blog post:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to load blog post');
	}
};
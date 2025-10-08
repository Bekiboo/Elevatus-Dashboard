import { db } from '$lib/server/db';
import { posts, users } from '$lib/server/db/schema';
import { eq, desc, or, ilike, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		// Redirect to login if not authenticated
		throw new Error('Unauthorized');
	}

	// Get query parameters
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '10');
	const search = url.searchParams.get('search') || '';
	const status = url.searchParams.get('status') || '';
	const featured = url.searchParams.get('featured') === 'true';
	
	const offset = (page - 1) * limit;

	try {
		// Build query conditions
		const conditions = [];
		
		if (search) {
			conditions.push(
				or(
					ilike(posts.title, `%${search}%`),
					ilike(posts.caption, `%${search}%`)
				)
			);
		}
		
		if (status) {
			conditions.push(eq(posts.status, status));
		}
		
		if (featured) {
			conditions.push(eq(posts.featured, true));
		}

		// Get posts with author information
		const postsQuery = db
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
				views: posts.views,
				createdAt: posts.createdAt,
				publishedAt: posts.publishedAt,
				updatedAt: posts.updatedAt,
				author: {
					id: users.id,
					firstName: users.firstName,
					lastName: users.lastName,
					title: users.title
				}
			})
			.from(posts)
			.leftJoin(users, eq(posts.authorId, users.id))
			.orderBy(desc(posts.createdAt))
			.limit(limit)
			.offset(offset);

		// Apply conditions if any
		if (conditions.length > 0) {
			postsQuery.where(sql`${conditions.reduce((acc, condition) => sql`${acc} AND ${condition}`, sql`1=1`)}`);
		}

		const blogPosts = await postsQuery;

		// Get total count for pagination
		const totalCountQuery = db
			.select({ count: sql<number>`count(*)` })
			.from(posts);
			
		if (conditions.length > 0) {
			totalCountQuery.where(sql`${conditions.reduce((acc, condition) => sql`${acc} AND ${condition}`, sql`1=1`)}`);
		}
		
		const [{ count: totalCount }] = await totalCountQuery;

		const totalPages = Math.ceil(totalCount / limit);

		return {
			user: locals.user,
			posts: blogPosts,
			pagination: {
				page,
				limit,
				totalCount,
				totalPages,
				hasNext: page < totalPages,
				hasPrev: page > 1
			},
			filters: {
				search,
				status,
				featured
			}
		};
	} catch (error) {
		console.error('Error loading blog posts:', error);
		return {
			user: locals.user,
			posts: [],
			pagination: {
				page: 1,
				limit: 10,
				totalCount: 0,
				totalPages: 0,
				hasNext: false,
				hasPrev: false
			},
			filters: {
				search: '',
				status: '',
				featured: false
			}
		};
	}
};
<script lang="ts">
	import type { PageData } from './$types.js';
	
	let { data }: { data: PageData } = $props();
	
	// Helper function to format dates
	function formatDate(date: Date | string): string {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short', 
			day: 'numeric'
		});
	}
	
	// Helper function to get status badge class
	function getStatusBadgeClass(status: string): string {
		switch (status) {
			case 'published': return 'bg-green-100 text-green-800';
			case 'draft': return 'bg-yellow-100 text-yellow-800';
			case 'archived': return 'bg-gray-100 text-gray-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<svelte:head>
	<title>Blog Management - Elevatus</title>
</svelte:head>

<div class="py-6">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Page header -->
		<div class="mb-8 md:flex md:items-center md:justify-between">
			<div class="flex-1 min-w-0">
				<h1 class="text-3xl font-bold text-gray-900">Blog Management</h1>
				<p class="mt-2 text-sm text-gray-700">Create, edit, and manage your blog posts</p>
			</div>
			<div class="mt-4 flex md:mt-0 md:ml-4">
				<a 
					href="/blog/new" 
					class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				>
					<svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
					</svg>
					New Post
				</a>
			</div>
		</div>

		<!-- Stats -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg class="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Total Posts</dt>
								<dd class="text-lg font-medium text-gray-900">{data.pagination.totalCount}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>
			
			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Published</dt>
								<dd class="text-lg font-medium text-gray-900">{data.posts.filter(p => p.status === 'published').length}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>
			
			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg class="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
							</svg>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Drafts</dt>
								<dd class="text-lg font-medium text-gray-900">{data.posts.filter(p => p.status === 'draft').length}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Filters -->
		<div class="mb-6 bg-white shadow rounded-lg">
			<div class="px-4 py-3 border-b border-gray-200">
				<div class="flex flex-col sm:flex-row gap-4">
					<div class="flex-1">
						<label for="search" class="sr-only">Search posts</label>
						<input 
							type="text" 
							name="search" 
							id="search" 
							value={data.filters.search}
							placeholder="Search posts..."
							class="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						>
					</div>
					<div>
						<select 
							name="status" 
							class="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
							value={data.filters.status}
						>
							<option value="">All Status</option>
							<option value="published">Published</option>
							<option value="draft">Draft</option>
							<option value="archived">Archived</option>
						</select>
					</div>
					<div>
						<label class="inline-flex items-center">
							<input 
								type="checkbox" 
								class="form-checkbox h-4 w-4 text-indigo-600"
								checked={data.filters.featured}
							>
							<span class="ml-2 text-sm text-gray-700">Featured only</span>
						</label>
					</div>
				</div>
			</div>
		</div>

		<!-- Posts list -->
		{#if data.posts.length > 0}
			<div class="bg-white shadow overflow-hidden sm:rounded-md">
				<ul class="divide-y divide-gray-200">
					{#each data.posts as post}
						<li>
							<div class="px-4 py-4 sm:px-6 hover:bg-gray-50">
								<div class="flex items-center justify-between">
									<div class="flex-1 min-w-0">
										<div class="flex items-center space-x-3">
											<h3 class="text-lg font-medium text-gray-900 truncate">
												<a href="/blog/{post.slug}" class="hover:text-indigo-600">
													{post.title}
												</a>
											</h3>
											{#if post.featured}
												<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
													Featured
												</span>
											{/if}
										</div>
										<p class="mt-1 text-sm text-gray-500 line-clamp-2">
											{post.caption}
										</p>
										<div class="mt-2 flex items-center text-sm text-gray-500 space-x-4">
											<div class="flex items-center">
												<svg class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
												</svg>
												{post.author ? `${post.author.firstName} ${post.author.lastName}` : 'Anonymous'}
											</div>
											<div class="flex items-center">
												<svg class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
												</svg>
												{formatDate(post.createdAt)}
											</div>
											<div class="flex items-center">
												<svg class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
												</svg>
												{post.views} views
											</div>
										</div>
									</div>
									<div class="ml-6 flex items-center space-x-3">
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusBadgeClass(post.status)}">
											{post.status}
										</span>
										<div class="flex space-x-2">
											<a 
												href="/blog/{post.slug}/edit" 
												class="text-indigo-600 hover:text-indigo-900 text-sm"
											>
												Edit
											</a>
											<button 
												class="text-red-600 hover:text-red-900 text-sm"
												onclick={() => confirm('Are you sure you want to delete this post?')}
											>
												Delete
											</button>
										</div>
									</div>
								</div>
							</div>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Pagination -->
			{#if data.pagination.totalPages > 1}
				<div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
					<div class="flex-1 flex justify-between sm:hidden">
						{#if data.pagination.hasPrev}
							<a 
								href="?page={data.pagination.page - 1}" 
								class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
							>
								Previous
							</a>
						{/if}
						{#if data.pagination.hasNext}
							<a 
								href="?page={data.pagination.page + 1}" 
								class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
							>
								Next
							</a>
						{/if}
					</div>
					<div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
						<div>
							<p class="text-sm text-gray-700">
								Showing
								<span class="font-medium">{(data.pagination.page - 1) * data.pagination.limit + 1}</span>
								to
								<span class="font-medium">{Math.min(data.pagination.page * data.pagination.limit, data.pagination.totalCount)}</span>
								of
								<span class="font-medium">{data.pagination.totalCount}</span>
								results
							</p>
						</div>
						<div>
							<nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
								{#if data.pagination.hasPrev}
									<a 
										href="?page={data.pagination.page - 1}" 
										class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
									>
										<span class="sr-only">Previous</span>
										<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
										</svg>
									</a>
								{/if}
								
								{#each Array(data.pagination.totalPages) as _, i}
									{#if i + 1 === data.pagination.page}
										<span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-indigo-50 text-sm font-medium text-indigo-600">
											{i + 1}
										</span>
									{:else}
										<a 
											href="?page={i + 1}" 
											class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
										>
											{i + 1}
										</a>
									{/if}
								{/each}
								
								{#if data.pagination.hasNext}
									<a 
										href="?page={data.pagination.page + 1}" 
										class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
									>
										<span class="sr-only">Next</span>
										<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
										</svg>
									</a>
								{/if}
							</nav>
						</div>
					</div>
				</div>
			{/if}
		{:else}
			<!-- Empty state -->
			<div class="bg-white shadow rounded-lg">
				<div class="px-4 py-12 sm:px-6 lg:px-8 text-center">
					<svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
					</svg>
					<h3 class="mt-4 text-lg font-medium text-gray-900">No blog posts found</h3>
					<p class="mt-2 text-sm text-gray-500">
						Get started by creating your first blog post.
					</p>
					<div class="mt-6">
						<a 
							href="/blog/new"
							class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
						>
							<svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
							Create your first post
						</a>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
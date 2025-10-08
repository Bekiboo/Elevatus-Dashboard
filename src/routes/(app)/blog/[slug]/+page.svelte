<script lang="ts">
	import type { PageData } from './$types.js';
	
	let { data }: { data: PageData } = $props();
	
	// Helper function to format dates
	function formatDate(date: Date | string): string {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long', 
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
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

	// Content renderer function
	function renderContent(content: any[]): string {
		return content.map(element => {
			switch (element.type) {
				case 'paragraph':
					return `<p class="mb-4 text-gray-700 leading-relaxed">${element.value}</p>`;
				case 'title':
					return `<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">${element.value}</h2>`;
				case 'image':
					const caption = element.caption ? `<figcaption class="mt-2 text-sm text-gray-500 text-center">${element.caption}</figcaption>` : '';
					return `<figure class="my-8"><img src="${element.value}" alt="" class="w-full rounded-lg shadow-md">${caption}</figure>`;
				case 'list':
					const items = element.value.map((item: string) => `<li class="mb-1">${item}</li>`).join('');
					return `<ul class="list-disc list-inside mb-4 text-gray-700 space-y-1">${items}</ul>`;
				case 'caption':
					return `<div class="text-center text-sm text-gray-500 mb-4 italic">${element.value}</div>`;
				default:
					return `<div class="mb-4">${element.value}</div>`;
			}
		}).join('');
	}
</script>

<svelte:head>
	<title>{data.post.title} - Elevatus Blog</title>
	<meta name="description" content={data.post.caption} />
</svelte:head>

<div class="py-6">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header actions -->
		<div class="mb-6 flex items-center justify-between">
			<nav class="flex" aria-label="Breadcrumb">
				<ol class="flex items-center space-x-4">
					<li>
						<div>
							<a href="/blog" class="text-gray-400 hover:text-gray-500">
								<span class="sr-only">Blog</span>
								<svg class="flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
									<path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L9 5.414V17a1 1 0 102 0V5.414l5.293 5.293a1 1 0 001.414-1.414l-7-7z" />
								</svg>
							</a>
						</div>
					</li>
					<li>
						<div class="flex items-center">
							<svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
							</svg>
							<a href="/blog" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">Blog</a>
						</div>
					</li>
					<li>
						<div class="flex items-center">
							<svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
							</svg>
							<span class="ml-4 text-sm font-medium text-gray-500 truncate">{data.post.title}</span>
						</div>
					</li>
				</ol>
			</nav>
			
			<div class="flex space-x-3">
				<a 
					href="/blog/{data.post.slug}/edit" 
					class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
				>
					<svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
					</svg>
					Edit
				</a>
				<button 
					class="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
					onclick={() => {
						if (confirm('Are you sure you want to delete this post?')) {
							// TODO: Implement delete functionality
							console.log('Delete post');
						}
					}}
				>
					<svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
					Delete
				</button>
			</div>
		</div>

		<!-- Article header -->
		<article class="bg-white shadow-lg rounded-lg overflow-hidden">
			<!-- Article meta -->
			<div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
				<div class="flex items-center justify-between flex-wrap gap-4">
					<div class="flex items-center space-x-4">
						<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusBadgeClass(data.post.status)}">
							{data.post.status}
						</span>
						{#if data.post.featured}
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
								Featured
							</span>
						{/if}
						{#if data.post.archived}
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
								Archived
							</span>
						{/if}
					</div>
					
					<div class="flex items-center text-sm text-gray-500 space-x-4">
						<div class="flex items-center">
							<svg class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
							</svg>
							{data.post.views} views
						</div>
					</div>
				</div>
			</div>

			<!-- Article content -->
			<div class="px-6 py-8">
				<!-- Title -->
				<header class="mb-8">
					<h1 class="text-4xl font-bold text-gray-900 mb-4">
						{data.post.title}
					</h1>
					
					{#if data.post.caption}
						<p class="text-xl text-gray-600 mb-6">
							{data.post.caption}
						</p>
					{/if}

					<!-- Author and date info -->
					<div class="flex items-center justify-between border-b border-gray-200 pb-6">
						<div class="flex items-center">
							<div class="flex-shrink-0">
								<div class="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
									<span class="text-white font-medium text-sm">
										{data.post.author ? `${data.post.author.firstName[0]}${data.post.author.lastName[0]}` : 'A'}
									</span>
								</div>
							</div>
							<div class="ml-4">
								<div class="text-sm font-medium text-gray-900">
									{data.post.author ? `${data.post.author.firstName} ${data.post.author.lastName}` : 'Anonymous'}
								</div>
								<div class="text-sm text-gray-500">
									{data.post.author?.title || ''}
								</div>
							</div>
						</div>
						
						<div class="text-right">
							<div class="text-sm text-gray-500">
								Created: {formatDate(data.post.createdAt)}
							</div>
							{#if data.post.publishedAt}
								<div class="text-sm text-gray-500">
									Published: {formatDate(data.post.publishedAt)}
								</div>
							{/if}
							{#if data.post.updatedAt && data.post.updatedAt !== data.post.createdAt}
								<div class="text-sm text-gray-500">
									Updated: {formatDate(data.post.updatedAt)}
								</div>
							{/if}
						</div>
					</div>
				</header>

				<!-- Thumbnail -->
				{#if data.post.thumbnail}
					<div class="mb-8">
						<img 
							src={data.post.thumbnail} 
							alt={data.post.title}
							class="w-full rounded-lg shadow-md"
						>
					</div>
				{/if}

				<!-- Content -->
				<div class="prose prose-lg max-w-none">
					{#if data.post.content && Array.isArray(data.post.content)}
						{@html renderContent(data.post.content)}
					{:else}
						<p class="text-gray-500 italic">No content available.</p>
					{/if}
				</div>
			</div>
		</article>

		<!-- Navigation -->
		<div class="mt-8 flex justify-between">
			<a 
				href="/blog" 
				class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
			>
				<svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
				</svg>
				Back to Blog
			</a>
		</div>
	</div>
</div>
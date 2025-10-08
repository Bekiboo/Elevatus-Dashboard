<script lang="ts">
	import type { PageData, ActionData } from './$types.js';
	import { enhance } from '$app/forms';
	
	interface ContentElement {
		type: string;
		value: string | string[];
		caption?: string;
	}
	
	let { data, form }: { data: PageData, form: ActionData } = $props();
	
	// Form state
	let title = $state('');
	let caption = $state('');
	let excerpt = $state('');
	let thumbnail = $state('');
	let status = $state('draft');
	let featured = $state(false);
	let archived = $state(false);
	let content = $state<ContentElement[]>([]);
	
	// Editor state
	let showPreview = $state(false);
	let isSubmitting = $state(false);
	
	// Content editor functions
	function addContentElement(type: string) {
		const newElement = {
			type,
			value: type === 'list' ? [] : '',
			...(type === 'image' ? { caption: '' } : {})
		};
		content = [...content, newElement];
	}
	
	function removeContentElement(index: number) {
		content = content.filter((_, i) => i !== index);
	}
	
	function moveContentElement(index: number, direction: 'up' | 'down') {
		const newContent = [...content];
		const targetIndex = direction === 'up' ? index - 1 : index + 1;
		
		if (targetIndex >= 0 && targetIndex < newContent.length) {
			[newContent[index], newContent[targetIndex]] = [newContent[targetIndex], newContent[index]];
			content = newContent;
		}
	}
	
	// Generate excerpt from content
	function generateExcerpt() {
		const textElements = content.filter(el => el.type === 'paragraph' && el.value);
		if (textElements.length > 0) {
			const firstParagraph = textElements[0].value;
			if (typeof firstParagraph === 'string') {
				excerpt = firstParagraph.length > 200 
					? firstParagraph.substring(0, 200).trim() + '...'
					: firstParagraph;
			}
		}
	}
	
	// Extract thumbnail from content
	function extractThumbnail() {
		const imageElements = content.filter(el => el.type === 'image' && el.value);
		if (imageElements.length > 0) {
			const imageValue = imageElements[0].value;
			if (typeof imageValue === 'string') {
				thumbnail = imageValue;
			}
		}
	}
	
	// Content renderer for preview
	function renderContentPreview(contentArray: any[]): string {
		return contentArray.map(element => {
			switch (element.type) {
				case 'paragraph':
					return `<p class="mb-4 text-gray-700">${element.value}</p>`;
				case 'title':
					return `<h2 class="text-xl font-bold text-gray-900 mb-3">${element.value}</h2>`;
				case 'image':
					const caption = element.caption ? `<figcaption class="mt-2 text-sm text-gray-500 text-center">${element.caption}</figcaption>` : '';
					return `<figure class="mb-6"><img src="${element.value}" alt="" class="w-full rounded">${caption}</figure>`;
				case 'list':
					const items = element.value.map((item: string) => `<li>${item}</li>`).join('');
					return `<ul class="list-disc list-inside mb-4 text-gray-700">${items}</ul>`;
				case 'caption':
					return `<div class="text-center text-sm text-gray-500 mb-4 italic">${element.value}</div>`;
				default:
					return `<div class="mb-4">${element.value}</div>`;
			}
		}).join('');
	}
</script>

<svelte:head>
	<title>Create New Blog Post - Elevatus</title>
</svelte:head>

<div class="py-6">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-6">
			<nav class="flex mb-4" aria-label="Breadcrumb">
				<ol class="flex items-center space-x-4">
					<li>
						<a href="/blog" class="text-gray-400 hover:text-gray-500">Blog</a>
					</li>
					<li>
						<div class="flex items-center">
							<svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
							</svg>
							<span class="ml-4 text-sm font-medium text-gray-500">New Post</span>
						</div>
					</li>
				</ol>
			</nav>
			
			<div class="flex items-center justify-between">
				<h1 class="text-2xl font-bold text-gray-900">Create New Blog Post</h1>
				<div class="flex space-x-3">
					<button 
						onclick={() => showPreview = !showPreview}
						class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
					>
						{showPreview ? 'Edit' : 'Preview'}
					</button>
				</div>
			</div>
		</div>

		{#if form?.error}
			<div class="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
				<div class="flex">
					<svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
					</svg>
					<div class="ml-3">
						<p class="text-sm text-red-800">{form.error}</p>
					</div>
				</div>
			</div>
		{/if}

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Main content -->
			<div class="lg:col-span-2">
				{#if showPreview}
					<!-- Preview mode -->
					<div class="bg-white shadow rounded-lg">
						<div class="px-6 py-4 border-b border-gray-200">
							<h3 class="text-lg font-medium text-gray-900">Preview</h3>
						</div>
						<div class="px-6 py-8">
							{#if title}
								<h1 class="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
							{:else}
								<h1 class="text-3xl font-bold text-gray-400 mb-4">Your Post Title</h1>
							{/if}
							
							{#if caption}
								<p class="text-lg text-gray-600 mb-6">{caption}</p>
							{:else}
								<p class="text-lg text-gray-400 mb-6">Your post caption will appear here...</p>
							{/if}
							
							{#if thumbnail}
								<img src={thumbnail} alt="" class="w-full rounded-lg mb-6">
							{/if}
							
							<div class="prose max-w-none">
								{#if content.length > 0}
									{@html renderContentPreview(content)}
								{:else}
									<p class="text-gray-400 italic">Add some content to see the preview...</p>
								{/if}
							</div>
						</div>
					</div>
				{:else}
					<!-- Edit mode -->
					<form method="POST" action="?/create" use:enhance={() => {
						isSubmitting = true;
						return async ({ update }) => {
							await update();
							isSubmitting = false;
						};
					}}>
						<div class="space-y-6">
							<!-- Basic fields -->
							<div class="bg-white shadow rounded-lg">
								<div class="px-6 py-4 border-b border-gray-200">
									<h3 class="text-lg font-medium text-gray-900">Basic Information</h3>
								</div>
								<div class="px-6 py-4 space-y-4">
									<div>
										<label for="title" class="block text-sm font-medium text-gray-700">Title *</label>
										<input
											type="text"
											name="title"
											id="title"
											bind:value={title}
											required
											placeholder="Enter your blog post title..."
											class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										>
									</div>
									
									<div>
										<label for="caption" class="block text-sm font-medium text-gray-700">Caption *</label>
										<textarea
											name="caption"
											id="caption"
											rows="2"
											bind:value={caption}
											required
											placeholder="A brief description of your post..."
											class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										></textarea>
									</div>
									
									<div>
										<label for="excerpt" class="block text-sm font-medium text-gray-700">
											Excerpt
											<button type="button" onclick={generateExcerpt} class="ml-2 text-xs text-indigo-600 hover:text-indigo-500">
												Auto-generate
											</button>
										</label>
										<textarea
											name="excerpt"
											id="excerpt"
											rows="3"
											bind:value={excerpt}
											placeholder="Optional excerpt for search results and previews..."
											class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										></textarea>
									</div>
									
									<div>
										<label for="thumbnail" class="block text-sm font-medium text-gray-700">
											Thumbnail URL
											<button type="button" onclick={extractThumbnail} class="ml-2 text-xs text-indigo-600 hover:text-indigo-500">
												Extract from content
											</button>
										</label>
										<input
											type="url"
											name="thumbnail"
											id="thumbnail"
											bind:value={thumbnail}
											placeholder="https://example.com/image.jpg"
											class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										>
									</div>
								</div>
							</div>

							<!-- Content editor -->
							<div class="bg-white shadow rounded-lg">
								<div class="px-6 py-4 border-b border-gray-200">
									<div class="flex items-center justify-between">
										<h3 class="text-lg font-medium text-gray-900">Content</h3>
										<div class="flex space-x-2">
											<button type="button" onclick={() => addContentElement('paragraph')} class="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">
												+ Paragraph
											</button>
											<button type="button" onclick={() => addContentElement('title')} class="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">
												+ Title
											</button>
											<button type="button" onclick={() => addContentElement('image')} class="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">
												+ Image
											</button>
											<button type="button" onclick={() => addContentElement('list')} class="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">
												+ List
											</button>
										</div>
									</div>
								</div>
								<div class="px-6 py-4">
									<div class="space-y-4">
										{#each content as element, index}
											<div class="border border-gray-200 rounded-lg p-4">
												<div class="flex items-center justify-between mb-3">
													<span class="text-sm font-medium text-gray-500 capitalize">{element.type}</span>
													<div class="flex space-x-2">
														<button type="button" onclick={() => moveContentElement(index, 'up')} disabled={index === 0} class="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50">
															↑
														</button>
														<button type="button" onclick={() => moveContentElement(index, 'down')} disabled={index === content.length - 1} class="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50">
															↓
														</button>
														<button type="button" onclick={() => removeContentElement(index)} class="text-xs text-red-600 hover:text-red-800">
															Remove
														</button>
													</div>
												</div>
												
												{#if element.type === 'paragraph' || element.type === 'title' || element.type === 'caption'}
													<textarea
														bind:value={element.value}
														rows={element.type === 'paragraph' ? 3 : 2}
														class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
														placeholder={`Enter ${element.type} content...`}
													></textarea>
												{:else if element.type === 'image'}
													<div class="space-y-2">
														<input
															type="url"
															bind:value={element.value}
															placeholder="Image URL"
															class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
														>
														<input
															type="text"
															bind:value={element.caption}
															placeholder="Image caption (optional)"
															class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
														>
													</div>
												{:else if element.type === 'list'}
													<div class="space-y-2">
														{#each Array.isArray(element.value) ? element.value : [] as item, itemIndex}
															<div class="flex items-center space-x-2">
																<input
																	type="text"
																	value={item}
																	onchange={(e) => {
																		const target = e.target as HTMLInputElement;
																		if (Array.isArray(element.value) && target) {
																			element.value[itemIndex] = target.value;
																			content = [...content];
																		}
																	}}
																	placeholder="List item"
																	class="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
																>
																<button type="button" onclick={() => {
																	if (Array.isArray(element.value)) {
																		element.value = element.value.filter((_, i) => i !== itemIndex);
																		content = [...content];
																	}
																}} class="text-red-600 hover:text-red-800">
																	Remove
																</button>
															</div>
														{/each}
														<button type="button" onclick={() => {
															if (Array.isArray(element.value)) {
																element.value = [...element.value, ''];
																content = [...content];
															}
														}} class="text-sm text-indigo-600 hover:text-indigo-500">
															+ Add item
														</button>
													</div>
												{/if}
											</div>
										{/each}
										
										{#if content.length === 0}
											<div class="text-center py-12 text-gray-500">
												<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
												</svg>
												<h3 class="mt-2 text-sm font-medium text-gray-900">No content yet</h3>
												<p class="mt-1 text-sm text-gray-500">Get started by adding your first content block above.</p>
											</div>
										{/if}
									</div>
								</div>
							</div>
						</div>

						<!-- Hidden fields -->
						<input type="hidden" name="content" value={JSON.stringify(content)}>
						<input type="hidden" name="status" value={status}>
						<input type="hidden" name="featured" value={featured ? 'on' : 'off'}>
						<input type="hidden" name="archived" value={archived ? 'on' : 'off'}>
					</form>
				{/if}
			</div>

			<!-- Sidebar -->
			<div class="space-y-6">
				<!-- Publish settings -->
				<div class="bg-white shadow rounded-lg">
					<div class="px-6 py-4 border-b border-gray-200">
						<h3 class="text-lg font-medium text-gray-900">Publish Settings</h3>
					</div>
					<div class="px-6 py-4 space-y-4">
						<div>
							<label for="status" class="block text-sm font-medium text-gray-700">Status</label>
							<select
								name="status"
								id="status"
								bind:value={status}
								class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							>
								<option value="draft">Save as Draft</option>
								<option value="published">Publish Now</option>
							</select>
						</div>
						
						<div class="flex items-center">
							<input
								type="checkbox"
								name="featured"
								id="featured"
								bind:checked={featured}
								class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
							>
							<label for="featured" class="ml-2 block text-sm text-gray-900">
								Featured post
							</label>
						</div>
						
						<div class="flex items-center">
							<input
								type="checkbox"
								name="archived"
								id="archived"
								bind:checked={archived}
								class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
							>
							<label for="archived" class="ml-2 block text-sm text-gray-900">
								Start as archived
							</label>
						</div>
					</div>
				</div>

				<!-- Actions -->
				<div class="bg-white shadow rounded-lg">
					<div class="px-6 py-4">
						<div class="space-y-3">
							<button
								type="submit"
								form="createForm"
								disabled={isSubmitting || !title || !caption}
								class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isSubmitting ? 'Creating...' : status === 'published' ? 'Publish Post' : 'Save Draft'}
							</button>
							
							<a
								href="/blog"
								class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
							>
								Cancel
							</a>
						</div>
					</div>
				</div>

				<!-- Tips -->
				<div class="bg-blue-50 border border-blue-200 rounded-lg">
					<div class="px-6 py-4">
						<h3 class="text-sm font-medium text-blue-900 mb-2">Writing Tips</h3>
						<ul class="text-xs text-blue-800 space-y-1">
							<li>• Use descriptive titles to engage readers</li>
							<li>• Keep captions concise but informative</li>
							<li>• Add images to break up long text sections</li>
							<li>• Use headings to organize your content</li>
							<li>• Preview your post before publishing</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Hidden form for submission -->
<form id="createForm" method="POST" action="?/create" use:enhance={() => {
	isSubmitting = true;
	return async ({ update }) => {
		await update();
		isSubmitting = false;
	};
}} style="display: none;">
	<input type="hidden" name="title" value={title}>
	<input type="hidden" name="caption" value={caption}>
	<input type="hidden" name="excerpt" value={excerpt}>
	<input type="hidden" name="thumbnail" value={thumbnail}>
	<input type="hidden" name="content" value={JSON.stringify(content)}>
	<input type="hidden" name="status" value={status}>
	<input type="hidden" name="featured" value={featured ? 'on' : 'off'}>
	<input type="hidden" name="archived" value={archived ? 'on' : 'off'}>
</form>
<script lang="ts">
	import type { PageData, ActionData } from './$types.js';
	import { enhance } from '$app/forms';
	
	let { data, form }: { data: PageData, form: ActionData } = $props();
	
	// Types for content elements
	interface ContentElement {
		type: string;
		value: string | string[];
		caption?: string;
	}
	
	// Form state
	let title = $state(data.post.title);
	let caption = $state(data.post.caption);
	let excerpt = $state(data.post.excerpt || '');
	let thumbnail = $state(data.post.thumbnail || '');
	let status = $state(data.post.status);
	let featured = $state(data.post.featured);
	let archived = $state(data.post.archived);
	let content = $state<ContentElement[]>(data.post.content as ContentElement[] || []);
	
	// Editor state
	let showPreview = $state(false);
	let isSubmitting = $state(false);
	let showDeleteConfirm = $state(false);
	
	// Content editor functions
	function addContentElement(type: string) {
		const newElement: ContentElement = {
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
		const textElements = content.filter((el: ContentElement) => el.type === 'paragraph' && el.value);
		if (textElements.length > 0) {
			const firstParagraph = textElements[0].value as string;
			excerpt = firstParagraph.length > 200 
				? firstParagraph.substring(0, 200).trim() + '...'
				: firstParagraph;
		}
	}
	
	// Extract thumbnail from content
	function extractThumbnail() {
		const imageElements = content.filter((el: ContentElement) => el.type === 'image' && el.value);
		if (imageElements.length > 0) {
			thumbnail = imageElements[0].value as string;
		}
	}
	
	// Content renderer for preview
	function renderContentPreview(contentArray: ContentElement[]): string {
		return contentArray.map(element => {
			switch (element.type) {
				case 'paragraph':
					return `<p class="mb-4 text-gray-700">${element.value as string}</p>`;
				case 'title':
					return `<h2 class="text-xl font-bold text-gray-900 mb-3">${element.value as string}</h2>`;
				case 'image':
					const caption = element.caption ? `<figcaption class="mt-2 text-sm text-gray-500 text-center">${element.caption}</figcaption>` : '';
					return `<figure class="mb-6"><img src="${element.value as string}" alt="" class="w-full rounded">${caption}</figure>`;
				case 'list':
					const items = (element.value as string[]).map((item: string) => `<li>${item}</li>`).join('');
					return `<ul class="list-disc list-inside mb-4 text-gray-700">${items}</ul>`;
				case 'caption':
					return `<div class="text-center text-sm text-gray-500 mb-4 italic">${element.value as string}</div>`;
				default:
					return `<div class="mb-4">${element.value}</div>`;
			}
		}).join('');
	}
</script>

<svelte:head>
	<title>Edit: {data.post.title} - Elevatus Blog</title>
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
							<a href="/blog/{data.post.slug}" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">{data.post.title}</a>
						</div>
					</li>
					<li>
						<div class="flex items-center">
							<svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
							</svg>
							<span class="ml-4 text-sm font-medium text-gray-500">Edit</span>
						</div>
					</li>
				</ol>
			</nav>
			
			<div class="flex items-center justify-between">
				<h1 class="text-2xl font-bold text-gray-900">Edit Blog Post</h1>
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
							<h1 class="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
							<p class="text-lg text-gray-600 mb-6">{caption}</p>
							{#if thumbnail}
								<img src={thumbnail} alt="" class="w-full rounded-lg mb-6">
							{/if}
							<div class="prose max-w-none">
								{@html renderContentPreview(content)}
							</div>
						</div>
					</div>
				{:else}
					<!-- Edit mode -->
					<form method="POST" action="?/update" use:enhance={() => {
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
										<label for="title" class="block text-sm font-medium text-gray-700">Title</label>
										<input
											type="text"
											name="title"
											id="title"
											bind:value={title}
											required
											class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										>
									</div>
									
									<div>
										<label for="caption" class="block text-sm font-medium text-gray-700">Caption</label>
										<textarea
											name="caption"
											id="caption"
											rows="2"
											bind:value={caption}
											required
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
														{#each element.value as item, itemIndex}
															<div class="flex items-center space-x-2">
																<input
																	type="text"
																	bind:value={element.value[itemIndex]}
																	placeholder="List item"
																	class="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
																>
																<button type="button" onclick={() => {
																	if (Array.isArray(element.value)) {
																		element.value = element.value.filter((_, i) => i !== itemIndex);
																	}
																	content = [...content];
																}} class="text-red-600 hover:text-red-800">
																	Remove
																</button>
															</div>
														{/each}
														<button type="button" onclick={() => {
															element.value = [...element.value, ''];
															content = [...content];
														}} class="text-sm text-indigo-600 hover:text-indigo-500">
															+ Add item
														</button>
													</div>
												{/if}
											</div>
										{/each}
										
										{#if content.length === 0}
											<div class="text-center py-8 text-gray-500">
												<p>No content yet. Add your first content block above.</p>
											</div>
										{/if}
									</div>
								</div>
							</div>
						</div>

						<!-- Hidden field for content JSON -->
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
						<h3 class="text-lg font-medium text-gray-900">Settings</h3>
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
								<option value="draft">Draft</option>
								<option value="published">Published</option>
								<option value="archived">Archived</option>
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
								Archived
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
								form="updateForm"
								disabled={isSubmitting}
								class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
							>
								{isSubmitting ? 'Saving...' : 'Update Post'}
							</button>
							
							<a
								href="/blog/{data.post.slug}"
								class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
							>
								Cancel
							</a>
							
							<button
								type="button"
								onclick={() => showDeleteConfirm = true}
								class="w-full flex justify-center py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
							>
								Delete Post
							</button>
						</div>
					</div>
				</div>

				<!-- Post info -->
				<div class="bg-white shadow rounded-lg">
					<div class="px-6 py-4 border-b border-gray-200">
						<h3 class="text-lg font-medium text-gray-900">Post Info</h3>
					</div>
					<div class="px-6 py-4 space-y-2 text-sm text-gray-600">
						<div>
							<span class="font-medium">Author:</span> {data.post.author ? `${data.post.author.firstName} ${data.post.author.lastName}` : 'Anonymous'}
						</div>
						<div>
							<span class="font-medium">Created:</span> {new Date(data.post.createdAt).toLocaleDateString()}
						</div>
						<div>
							<span class="font-medium">Views:</span> {data.post.views}
						</div>
						<div>
							<span class="font-medium">Slug:</span> {data.post.slug}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Delete confirmation modal -->
{#if showDeleteConfirm}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
		<div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
			<div class="mt-3 text-center">
				<div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
					<svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
					</svg>
				</div>
				<h3 class="text-lg font-medium text-gray-900 mt-2">Delete Post</h3>
				<div class="mt-2 px-7 py-3">
					<p class="text-sm text-gray-500">
						Are you sure you want to delete this blog post? This action cannot be undone.
					</p>
				</div>
				<div class="flex justify-center space-x-4 mt-4">
					<button
						onclick={() => showDeleteConfirm = false}
						class="px-4 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-400"
					>
						Cancel
					</button>
					<form method="POST" action="?/delete" use:enhance>
						<button
							type="submit"
							class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
						>
							Delete
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Form ID for submit button -->
<form id="updateForm" method="POST" action="?/update" use:enhance={() => {
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
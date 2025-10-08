<script lang="ts">
	import type { PageData } from './$types.js';
	
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Blog Management - Elevatus</title>
</svelte:head>

<div class="py-6">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Page header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">Blog Management</h1>
			<p class="mt-2 text-sm text-gray-700">Create, edit, and manage your blog posts</p>
		</div>

		<!-- Coming soon placeholder -->
		<div class="bg-white shadow rounded-lg">
			<div class="px-4 py-12 sm:px-6 lg:px-8 text-center">
				<svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
				</svg>
				<h3 class="mt-4 text-lg font-medium text-gray-900">Blog Management</h3>
				<p class="mt-2 text-sm text-gray-500">
					This feature is coming soon! You'll be able to create, edit, and manage all your blog posts from here.
				</p>
				<div class="mt-6">
					<div class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
						<svg class="-ml-1 mr-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
						</svg>
						Coming Soon
					</div>
				</div>
			</div>
		</div>

		<!-- Quick links -->
		<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg class="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">
									New Post
								</dt>
								<dd class="text-lg font-medium text-gray-900">
									<span class="text-gray-400">Coming Soon</span>
								</dd>
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
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">
									Draft Posts
								</dt>
								<dd class="text-lg font-medium text-gray-900">
									<span class="text-gray-400">Coming Soon</span>
								</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg class="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
							</svg>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">
									Analytics
								</dt>
								<dd class="text-lg font-medium text-gray-900">
									<span class="text-gray-400">Coming Soon</span>
								</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
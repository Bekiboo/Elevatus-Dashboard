<script lang="ts">
	import { userStore } from '$lib/stores/user.svelte.js';
	import type { PageData } from './$types.js';
	import Nav from './Nav.svelte';

	// Props
	let { data }: { data: PageData } = $props();

	// Update store with user data
	$effect(() => {
		userStore.setUser(data.user);
	});
</script>

<svelte:head>
	<title>Dashboard - Elevatus</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
    <Nav {data} />	

	<!-- Contenu principal -->
	<main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
		<div class="px-4 py-6 sm:px-0">
			<!-- Quick actions -->
			<div class="mb-8">
				<h2 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#if userStore.canWrite()}
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
												New Article
											</dt>
											<dd class="text-lg font-medium text-gray-900">
												<a href="/posts/new" class="text-indigo-600 hover:text-indigo-500">
													Create a Post
												</a>
											</dd>
										</dl>
									</div>
								</div>
							</div>
						</div>
					{/if}


					<div class="bg-white overflow-hidden shadow rounded-lg">
						<div class="p-5">
							<div class="flex items-center">
								<div class="flex-shrink-0">
									<svg class="h-8 w-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
								</div>
								<div class="ml-5 w-0 flex-1">
									<dl>
										<dt class="text-sm font-medium text-gray-500 truncate">
											My Articles
										</dt>
										<dd class="text-lg font-medium text-gray-900">
											<a href="/posts" class="text-gray-600 hover:text-gray-500">
												View All Posts
											</a>
										</dd>
									</dl>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- User information -->
			<div class="bg-white shadow overflow-hidden sm:rounded-lg">
				<div class="px-4 py-5 sm:px-6">
					<h3 class="text-lg leading-6 font-medium text-gray-900">
						Profile Information
					</h3>
					<p class="mt-1 max-w-2xl text-sm text-gray-500">
						Details of your user account.
					</p>
				</div>
				<div class="border-t border-gray-200">
					<dl>
						<div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
							<dt class="text-sm font-medium text-gray-500">
								Full Name
							</dt>
							<dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
								{data.user.firstName} {data.user.lastName}
							</dd>
						</div>
						<div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
							<dt class="text-sm font-medium text-gray-500">
								Email
							</dt>
							<dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
								{data.user.email}
							</dd>
						</div>
						{#if data.user.title}
							<div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
								<dt class="text-sm font-medium text-gray-500">
									Title
								</dt>
								<dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
									{data.user.title}
								</dd>
							</div>
						{/if}
						<div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
							<dt class="text-sm font-medium text-gray-500">
								Role
							</dt>
							<dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
								<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
									{data.user.role}
								</span>
							</dd>
						</div>
						<div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
							<dt class="text-sm font-medium text-gray-500">
								Status
							</dt>
							<dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
								{#if data.user.verified}
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
										Verified
									</span>
								{:else}
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
										Pending Verification
									</span>
								{/if}
							</dd>
						</div>
					</dl>
				</div>
			</div>
		</div>
	</main>
</div>
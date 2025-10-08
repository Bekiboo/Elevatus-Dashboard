<script lang="ts">
	import { userStore } from '$lib/stores/user.svelte.js';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import type { LayoutData } from './$types.js';

	let { data, children }: { data: LayoutData; children: any } = $props();

	// Update store with user data
	$effect(() => {
		if (data.user) {
			userStore.setUser(data.user);
		}
	});

	// Navigation items
	const navigationItems = [
		{
			name: 'Dashboard',
			href: '/dashboard',
			icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M9 9h6v6H9z'
		},
		{
			name: 'Blog Management',
			href: '/blog',
			icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
		},
		{
			name: 'Children Management',
			href: '/children',
			icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
		}
	];

	// Admin-only navigation item
	const adminItem = {
		name: 'Administration',
		href: '/admin',
		icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
	};

	function isActiveRoute(href: string): boolean {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}
</script>

<div class="min-h-screen bg-gray-50 flex">
	<!-- Sidebar -->
	<div class="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
		<div class="flex-1 flex flex-col min-h-0 bg-white shadow">
			<div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
				<!-- Logo -->
				<div class="flex items-center flex-shrink-0 px-4 mb-8">
					<h1 class="text-xl font-bold text-gray-900">Elevatus Dashboard</h1>
				</div>
				
				<!-- Navigation -->
				<nav class="mt-5 flex-1 px-2 space-y-1">
					{#each navigationItems as item}
						<a
							href={item.href}
							class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 {
								isActiveRoute(item.href)
									? 'bg-indigo-100 text-indigo-900'
									: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
							}"
						>
							<svg
								class="mr-3 flex-shrink-0 h-6 w-6 {
									isActiveRoute(item.href) ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
								}"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
							</svg>
							{item.name}
						</a>
					{/each}
					
					<!-- Admin section (only visible to admins) -->
					{#if userStore.isAdmin}
						<div class="border-t border-gray-200 mt-6 pt-6">
							<a
								href={adminItem.href}
								class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 {
									isActiveRoute(adminItem.href)
										? 'bg-indigo-100 text-indigo-900'
										: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
								}"
							>
								<svg
									class="mr-3 flex-shrink-0 h-6 w-6 {
										isActiveRoute(adminItem.href) ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
									}"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={adminItem.icon} />
								</svg>
								{adminItem.name}
							</a>
						</div>
					{/if}
				</nav>
			</div>
			
			<!-- User info and logout -->
			<div class="flex-shrink-0 flex border-t border-gray-200 p-4">
				<div class="flex-shrink-0 w-full group block">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">
								{data.user?.firstName?.charAt(0).toUpperCase() ?? '?'}
							</div>
						</div>
						<div class="ml-3 flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900 truncate">
								{data.user?.firstName} {data.user?.lastName}
							</p>
							<p class="text-xs text-gray-500 truncate">
								{data.user?.role}
							</p>
						</div>
						<div class="ml-3">
							<form method="POST" action="/?/logout" use:enhance>
								<button
									type="submit"
									class="text-gray-400 hover:text-gray-600 transition-colors duration-150"
									title="Logout"
								>
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
									</svg>
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Mobile menu button -->
	<div class="md:hidden">
		<div class="fixed inset-0 flex z-40">
			<div class="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true"></div>
			<!-- Mobile menu (we'll implement this later if needed) -->
		</div>
	</div>

	<!-- Main content -->
	<div class="md:pl-64 flex flex-col flex-1">
		<main class="flex-1">
			{@render children()}
		</main>
	</div>
</div>
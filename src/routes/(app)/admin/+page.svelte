<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	
	// Tab state
	let activeTab = $state<'users' | 'invitations' | 'create'>('users');
	
	// Invitation form state
	let inviteEmail = $state('');
	let inviteRole = $state('author');
	let showCopySuccess = $state(false);
	
	// Utility functions
	function copyInviteUrl(url?: string) {
		if (!url) return;
		navigator.clipboard.writeText(url).then(() => {
			showCopySuccess = true;
			setTimeout(() => {
				showCopySuccess = false;
			}, 2000);
		}).catch(() => {
			// Fallback for browsers that don't support clipboard API
			const textArea = document.createElement('textarea');
			textArea.value = url;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);
			showCopySuccess = true;
			setTimeout(() => {
				showCopySuccess = false;
			}, 2000);
		});
	}
	
	// Reset form after success
	$effect(() => {
		if (form?.success && form?.inviteUrl) {
			// Reset form after 3 seconds
			setTimeout(() => {
				inviteEmail = '';
				inviteRole = 'author';
			}, 3000);
		}
	});
	
	function canDeleteUser(user: any): boolean {
		// Cannot delete oneself
		if (user.id === data.currentUserId) return false;
		
		// If it's an admin, check that there are others
		if (user.role === 'admin') {
			const adminCount = data.users.filter(u => u.role === 'admin' && u.verified).length;
			return adminCount > 1;
		}
		
		return true;
	}
	
	function canChangeRole(user: any): boolean {
		// Cannot change own admin role if it's the only one
		if (user.id === data.currentUserId && user.role === 'admin') {
			const adminCount = data.users.filter(u => u.role === 'admin' && u.verified).length;
			return adminCount > 1;
		}
		
		return true;
	}
</script>

<svelte:head>
	<title>Admin - Complete Management</title>
</svelte:head>

<div class="py-6">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">Administration</h1>
			<p class="mt-2 text-sm text-gray-700">Complete management of users and invitations</p>
		</div>

		<!-- Tabs -->
		<div class="mb-8">
			<div class="border-b border-gray-200">
				<nav class="-mb-px flex space-x-8">
					<button
						onclick={() => activeTab = 'users'}
						class={`py-2 px-1 border-b-2 font-medium text-sm ${
							activeTab === 'users' 
								? 'border-indigo-500 text-indigo-600' 
								: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
						}`}
					>
						Users ({data.users.length})
					</button>
					<button
						onclick={() => activeTab = 'invitations'}
						class={`py-2 px-1 border-b-2 font-medium text-sm ${
							activeTab === 'invitations' 
								? 'border-indigo-500 text-indigo-600' 
								: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
						}`}
					>
						Invitations ({data.invitations.length})
					</button>
					<button
						onclick={() => activeTab = 'create'}
						class={`py-2 px-1 border-b-2 font-medium text-sm ${
							activeTab === 'create' 
								? 'border-indigo-500 text-indigo-600' 
								: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
						}`}
					>
						New Invitation
					</button>
				</nav>
			</div>
		</div>

		<!-- Messages -->
		{#if form?.error}
			<div class="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
				<div class="flex">
					<div class="ml-3">
						<h3 class="text-sm leading-5 font-medium text-red-800">Error</h3>
						<div class="mt-2 text-sm leading-5 text-red-700">
							<p>{form.error}</p>
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if form?.success}
			<div class="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
				<div class="flex">
					<div class="ml-3">
						<h3 class="text-sm leading-5 font-medium text-green-800">Success</h3>
						<div class="mt-2 text-sm leading-5 text-green-700">
							<p>{form.success}</p>
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if showCopySuccess}
			<div class="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
				<div class="flex">
					<div class="ml-3">
						<h3 class="text-sm leading-5 font-medium text-blue-800">Copied!</h3>
						<div class="mt-2 text-sm leading-5 text-blue-700">
							<p>The invitation link has been copied to your clipboard.</p>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Content by tab -->
		{#if activeTab === 'users'}
			<!-- Users Tab -->
			<div class="bg-white shadow overflow-hidden sm:rounded-md">
				<div class="px-4 py-5 sm:px-6 flex justify-between items-center">
					<div>
						<h3 class="text-lg leading-6 font-medium text-gray-900">Users</h3>
						<p class="mt-1 max-w-2xl text-sm text-gray-500">
							{data.users.length} registered user{data.users.length > 1 ? 's' : ''}
						</p>
					</div>
					{#if data.users.some((user) => !user.verified)}
						<form method="post" action="?/verifyAll" use:enhance>
							<button
								type="submit"
								class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
							>
								Verify All
							</button>
						</form>
					{/if}
				</div>
				<ul class="divide-y divide-gray-200">
					{#each data.users as user}
						<li class="px-4 py-4 sm:px-6">
							<div class="flex items-center justify-between">
								<div class="flex items-center">
									<div class="flex-shrink-0">
										<div
											class="h-10 w-10 rounded-full {user.role === 'admin' ? 'bg-purple-500' : 'bg-indigo-500'} flex items-center justify-center text-white font-medium"
										>
											{user.firstName?.charAt(0).toUpperCase() ?? '?'}
										</div>
									</div>
									<div class="ml-4">
										<div class="text-sm font-medium text-gray-900 flex items-center">
											{user.firstName} {user.lastName}
											{#if user.id === data.currentUserId}
												<span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
													You
												</span>
											{/if}
										</div>
										<div class="text-sm text-gray-500">{user.email}</div>
										<div class="text-xs text-gray-400 flex items-center space-x-2 mt-1">
											<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium {user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">
												{user.role}
											</span>
											<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium {user.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
												{user.verified ? 'Verified' : 'Not Verified'}
											</span>
										</div>
									</div>
								</div>
								<div class="flex items-center space-x-2">
									{#if !user.verified}
										<form method="post" action="?/verifyUser" use:enhance>
											<input type="hidden" name="userId" value={user.id} />
											<button
												type="submit"
												class="inline-flex items-center px-3 py-1.5 border border-green-300 text-xs font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
											>
												Verify
											</button>
										</form>
									{/if}
									
									{#if canChangeRole(user)}
										<form method="post" action="?/updateUserRole" use:enhance>
											<input type="hidden" name="userId" value={user.id} />
											<select 
												name="role" 
												onchange={(e) => e.target.form.submit()}
												class="text-xs border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
											>
												<option value="author" selected={user.role === 'author'}>Author</option>
												<option value="admin" selected={user.role === 'admin'}>Admin</option>
											</select>
										</form>
									{:else}
										<span class="text-xs text-gray-400 px-3 py-1.5">
											{user.role}
										</span>
									{/if}
									
									{#if canDeleteUser(user)}
										<form method="post" action="?/deleteUser" use:enhance>
											<input type="hidden" name="userId" value={user.id} />
											<button
												type="submit"
												onclick={() => confirm('Are you sure you want to delete this user?')}
												class="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
											>
												Delete
											</button>
										</form>
									{:else if user.id === data.currentUserId}
										<span class="text-xs text-gray-400 px-3 py-1.5">
											You
										</span>
									{:else}
										<span class="text-xs text-gray-400 px-3 py-1.5">
											Last admin
										</span>
									{/if}
								</div>
							</div>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if activeTab === 'invitations'}
			<!-- Invitations Tab -->
			<div class="bg-white shadow overflow-hidden sm:rounded-md">
				<div class="px-4 py-5 sm:px-6">
					<h3 class="text-lg leading-6 font-medium text-gray-900">Pending Invitations</h3>
					<p class="mt-1 max-w-2xl text-sm text-gray-500">
						{data.invitations.length} pending invitation{data.invitations.length > 1 ? 's' : ''}
					</p>
				</div>
				{#if data.invitations.length > 0}
					<ul class="divide-y divide-gray-200">
						{#each data.invitations as invitation}
							<li class="px-4 py-4 sm:px-6">
								<div class="flex items-center justify-between">
									<div class="flex-1">
										<div class="text-sm font-medium text-gray-900">{invitation.email}</div>
										<div class="text-xs text-gray-400 flex items-center space-x-2 mt-1">
											<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium {invitation.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">
												{invitation.role}
											</span>
											<span>Expires: {new Date(invitation.expiresAt).toLocaleDateString('en-US')}</span>
										</div>
										<div class="text-xs text-gray-400 mt-2 break-all">
											<span class="font-medium">Link:</span> 
											<span class="text-blue-600">{new URL(`/register?token=${invitation.token}`, $page.url.origin).href}</span>
										</div>
									</div>
									<div class="flex items-center space-x-2 ml-4">
										<button
											onclick={() => copyInviteUrl(new URL(`/register?token=${invitation.token}`, $page.url.origin).href)}
											class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
										>
											📋 Copy
										</button>
										<form method="post" action="?/deleteInvitation" use:enhance>
											<input type="hidden" name="invitationId" value={invitation.id} />
											<button
												type="submit"
												onclick={() => confirm('Are you sure you want to delete this invitation?')}
												class="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
											>
												Delete
											</button>
										</form>
									</div>
								</div>
							</li>
						{/each}
					</ul>
				{:else}
					<div class="px-4 py-8 text-center">
						<div class="text-gray-400 text-4xl mb-4">📧</div>
						<div class="text-sm text-gray-500">No pending invitations</div>
					</div>
				{/if}
			</div>
		{/if}

		{#if activeTab === 'create'}
			<!-- Create Invitation Tab -->
			<div class="bg-white shadow rounded-lg">
				<div class="px-4 py-5 sm:p-6">
					<h3 class="text-lg leading-6 font-medium text-gray-900">
                        Invite a new user
					</h3>
					<p class="mt-1 text-sm text-gray-500">
                        Create an invitation for a new person to join the Elevatus team.
					</p>

					{#if form?.success && form?.inviteUrl}
						<div class="mt-4 rounded-md bg-green-50 p-4">
							<div class="flex">
								<div class="flex-shrink-0">
									<svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
										<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
									</svg>
								</div>
								<div class="ml-3">
									<h3 class="text-sm leading-5 font-medium text-green-800">
										Invitation created successfully!
									</h3>
									<div class="mt-2 text-sm leading-5 text-green-700">
										<p>The invitation for <strong>{form.email}</strong> has been created.</p>
										<p class="mt-2">Share this link with the invited person:</p>
										<div class="mt-3 p-3 bg-white border border-green-200 rounded-md">
											<div class="flex items-center justify-between">
												<code class="text-xs text-gray-800 break-all flex-1 mr-2">
													{form.inviteUrl}
												</code>
												<button
													type="button"
													onclick={() => copyInviteUrl(form.inviteUrl)}
													class="inline-flex items-center px-2 py-1 border border-green-300 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
												>
													{showCopySuccess ? '✓ Copied' : '📋 Copy'}
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					{/if}

					<form method="post" action="?/createInvite" class="mt-6" use:enhance>
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-1">
							<div>
								<label for="email" class="block text-sm font-medium text-gray-700">
									Email Address
								</label>
								<div class="mt-1">
									<input
										type="email"
										name="email"
										id="email"
										bind:value={inviteEmail}
										class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
										placeholder="example@domain.com"
										required
									/>
								</div>
								<p class="mt-2 text-sm text-gray-500">
									The email of the person you want to invite.
								</p>
							</div>

							<div>
								<label for="role" class="block text-sm font-medium text-gray-700">
									Role
								</label>
								<select
									name="role"
									id="role"
									bind:value={inviteRole}
									class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
								>
									<option value="viewer">Reader - Can only view content</option>
									<option value="author">Author - Can create and edit content</option>
									<option value="admin">Administrator - Full platform access</option>
								</select>
								<p class="mt-2 text-sm text-gray-500">
									Choose the access level for this person.
								</p>
							</div>
						</div>

						<div class="mt-6 bg-gray-50 rounded-lg p-4">
							<h4 class="text-sm font-medium text-gray-900">Invitation Preview</h4>
							<dl class="mt-2 text-sm text-gray-600">
								<div class="flex justify-between py-1">
									<dt class="font-medium">Email:</dt>
									<dd>{inviteEmail || 'Not specified'}</dd>
								</div>
								<div class="flex justify-between py-1">
									<dt class="font-medium">Role:</dt>
									<dd>{inviteRole === 'admin' ? 'Administrator' : inviteRole === 'author' ? 'Author' : 'Reader'}</dd>
								</div>
								<div class="flex justify-between py-1">
									<dt class="font-medium">Expiration:</dt>
									<dd>7 days after creation</dd>
								</div>
							</dl>
						</div>

						<div class="mt-6 flex items-center justify-end space-x-3">
							<button
								type="button"
								onclick={() => { inviteEmail = ''; inviteRole = 'author'; }}
								class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							>
								Reset
							</button>
							<button
								type="submit"
								disabled={!inviteEmail}
								class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
								</svg>
								Create Invitation
							</button>
						</div>
					</form>
				</div>
			</div>
		{/if}
	</div>
</div>
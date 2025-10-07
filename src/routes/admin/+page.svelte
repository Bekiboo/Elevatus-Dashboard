<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	
	// State pour les onglets
	let activeTab = $state<'users' | 'invitations' | 'create'>('users');
	
	// State pour le formulaire d'invitation
	let inviteEmail = $state('');
	let inviteRole = $state('author');
	let showCopySuccess = $state(false);
	
	// Fonctions utilitaires
	function copyInviteUrl(url: string) {
		navigator.clipboard.writeText(url).then(() => {
			showCopySuccess = true;
			setTimeout(() => {
				showCopySuccess = false;
			}, 2000);
		});
	}
	
	function canDeleteUser(user: any): boolean {
		// Ne peut pas supprimer soi-même
		if (user.id === data.currentUserId) return false;
		
		// Si c'est un admin, vérifier qu'il y en a d'autres
		if (user.role === 'admin') {
			const adminCount = data.users.filter(u => u.role === 'admin' && u.verified).length;
			return adminCount > 1;
		}
		
		return true;
	}
	
	function canChangeRole(user: any): boolean {
		// Ne peut pas changer son propre rôle d'admin s'il est le seul
		if (user.id === data.currentUserId && user.role === 'admin') {
			const adminCount = data.users.filter(u => u.role === 'admin' && u.verified).length;
			return adminCount > 1;
		}
		
		return true;
	}
</script>

<svelte:head>
	<title>Admin - Gestion complète</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">Administration</h1>
			<p class="mt-2 text-sm text-gray-700">Gestion complète des utilisateurs et invitations</p>
		</div>

		<!-- Onglets -->
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
						Utilisateurs ({data.users.length})
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
						Nouvelle invitation
					</button>
				</nav>
			</div>
		</div>

		<!-- Messages -->
		{#if form?.error}
			<div class="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
				<div class="flex">
					<div class="ml-3">
						<h3 class="text-sm leading-5 font-medium text-red-800">Erreur</h3>
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
						<h3 class="text-sm leading-5 font-medium text-green-800">Succès</h3>
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
						<h3 class="text-sm leading-5 font-medium text-blue-800">Copié !</h3>
						<div class="mt-2 text-sm leading-5 text-blue-700">
							<p>Le lien d'invitation a été copié dans votre presse-papiers.</p>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Contenu par onglet -->
		{#if activeTab === 'users'}
			<!-- Onglet Utilisateurs -->
			<div class="bg-white shadow overflow-hidden sm:rounded-md">
				<div class="px-4 py-5 sm:px-6 flex justify-between items-center">
					<div>
						<h3 class="text-lg leading-6 font-medium text-gray-900">Utilisateurs</h3>
						<p class="mt-1 max-w-2xl text-sm text-gray-500">
							{data.users.length} utilisateur{data.users.length > 1 ? 's' : ''} enregistré{data.users.length > 1 ? 's' : ''}
						</p>
					</div>
					{#if data.users.some((user) => !user.verified)}
						<form method="post" action="?/verifyAll" use:enhance>
							<button
								type="submit"
								class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
							>
								Vérifier tous
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
													Vous
												</span>
											{/if}
										</div>
										<div class="text-sm text-gray-500">{user.email}</div>
										<div class="text-xs text-gray-400 flex items-center space-x-2 mt-1">
											<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium {user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">
												{user.role}
											</span>
											<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium {user.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
												{user.verified ? 'Vérifié' : 'Non vérifié'}
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
												Vérifier
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
												<option value="author" selected={user.role === 'author'}>Auteur</option>
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
												onclick={() => confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')}
												class="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
											>
												Supprimer
											</button>
										</form>
									{:else if user.id === data.currentUserId}
										<span class="text-xs text-gray-400 px-3 py-1.5">
											Vous
										</span>
									{:else}
										<span class="text-xs text-gray-400 px-3 py-1.5">
											Dernier admin
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
			<!-- Onglet Invitations -->
			<div class="bg-white shadow overflow-hidden sm:rounded-md">
				<div class="px-4 py-5 sm:px-6">
					<h3 class="text-lg leading-6 font-medium text-gray-900">Invitations en attente</h3>
					<p class="mt-1 max-w-2xl text-sm text-gray-500">
						{data.invitations.length} invitation{data.invitations.length > 1 ? 's' : ''} en attente
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
											<span>Expire le: {new Date(invitation.expiresAt).toLocaleDateString('fr-FR')}</span>
										</div>
										<div class="text-xs text-gray-400 mt-2 break-all">
											<span class="font-medium">Lien:</span> 
											<span class="text-blue-600">{new URL(`/register?token=${invitation.token}`, $page.url.origin).href}</span>
										</div>
									</div>
									<div class="flex items-center space-x-2 ml-4">
										<button
											onclick={() => copyInviteUrl(new URL(`/register?token=${invitation.token}`, $page.url.origin).href)}
											class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
										>
											📋 Copier
										</button>
										<form method="post" action="?/deleteInvitation" use:enhance>
											<input type="hidden" name="invitationId" value={invitation.id} />
											<button
												type="submit"
												onclick={() => confirm('Êtes-vous sûr de vouloir supprimer cette invitation ?')}
												class="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
											>
												Supprimer
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
						<div class="text-sm text-gray-500">Aucune invitation en attente</div>
					</div>
				{/if}
			</div>
		{/if}

		{#if activeTab === 'create'}
			<!-- Onglet Création d'invitation -->
			<div class="bg-white shadow sm:rounded-lg">
				<div class="px-4 py-5 sm:p-6">
					<h3 class="text-lg leading-6 font-medium text-gray-900">Inviter un nouvel utilisateur</h3>
					<div class="mt-2 max-w-xl text-sm text-gray-500">
						<p>Créez une invitation pour permettre à quelqu'un de rejoindre la plateforme.</p>
					</div>
					<form method="post" action="?/createInvite" class="mt-5" use:enhance>
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
							<div>
								<label for="email" class="block text-sm font-medium text-gray-700">Email *</label>
								<input
									type="email"
									name="email"
									id="email"
									required
									bind:value={inviteEmail}
									class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
									placeholder="utilisateur@example.com"
								/>
							</div>
							<div>
								<label for="role" class="block text-sm font-medium text-gray-700">Rôle *</label>
								<select
									name="role"
									id="role"
									bind:value={inviteRole}
									class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
								>
									<option value="author">Auteur</option>
									<option value="admin">Administrateur</option>
								</select>
							</div>
						</div>
						<div class="mt-6 bg-gray-50 p-4 rounded-md">
							<h4 class="text-sm font-medium text-gray-900 mb-2">Aperçu de l'invitation</h4>
							<div class="text-sm text-gray-600">
								<p><strong>Email :</strong> {inviteEmail || 'Non spécifié'}</p>
								<p><strong>Rôle :</strong> {inviteRole === 'admin' ? 'Administrateur' : 'Auteur'}</p>
								<p><strong>Validité :</strong> 7 jours</p>
							</div>
						</div>
						<div class="mt-5 flex justify-between">
							<button
								type="button"
								onclick={() => {inviteEmail = ''; inviteRole = 'author';}}
								class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							>
								Réinitialiser
							</button>
							<button
								type="submit"
								disabled={!inviteEmail}
								class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Créer l'invitation
							</button>
						</div>
					</form>
				</div>
			</div>
		{/if}

		<!-- Navigation -->
		<div class="mt-8">
			<a href="/dashboard" class="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
				← Retour au dashboard
			</a>
		</div>
	</div>
</div>
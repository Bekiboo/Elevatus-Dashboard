<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types.js';

	// Props
	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Variables réactives avec Svelte 5
	let isSubmitting = $state(false);
	let email = $state(form?.email || '');
	let role = $state(form?.role || 'author');
	let showCopySuccess = $state(false);

	// Fonction pour copier l'URL
	function copyInviteUrl() {
		if (form?.inviteUrl) {
			navigator.clipboard.writeText(form.inviteUrl).then(() => {
				showCopySuccess = true;
				setTimeout(() => {
					showCopySuccess = false;
				}, 2000);
			});
		}
	}
</script>

<svelte:head>
	<title>Inviter un utilisateur - Elevatus Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-2xl mx-auto">
		<div class="bg-white shadow rounded-lg">
			<div class="px-4 py-5 sm:p-6">
				<h3 class="text-lg leading-6 font-medium text-gray-900">
					Inviter un nouvel utilisateur
				</h3>
				<p class="mt-1 text-sm text-gray-500">
					Créez une invitation pour qu'une nouvelle personne rejoigne l'équipe Elevatus.
				</p>

				{#if form?.success}
					<div class="mt-4 rounded-md bg-green-50 p-4">
						<div class="flex">
							<div class="flex-shrink-0">
								<svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
								</svg>
							</div>
							<div class="ml-3">
								<h3 class="text-sm font-medium text-green-800">
									Invitation créée avec succès !
								</h3>
								<div class="mt-2 text-sm text-green-700">
									<p>L'invitation a été générée pour <strong>{form.email}</strong> avec le rôle <strong>{form.role}</strong>.</p>
								</div>
								<div class="mt-4">
									<div class="bg-white rounded-md p-3 border border-green-200">
										<label for="invite-url" class="block text-sm font-medium text-gray-700 mb-2">
											Lien d'invitation à envoyer :
										</label>
										<div class="flex items-center space-x-2">
											<input
												id="invite-url"
												type="text"
												readonly
												value={form.inviteUrl}
												class="flex-1 text-sm font-mono bg-gray-50 border border-gray-300 rounded-md px-3 py-2"
											/>
											<button
												type="button"
												onclick={copyInviteUrl}
												class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
											>
												{#if showCopySuccess}
													<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
													</svg>
													Copié !
												{:else}
													<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
													</svg>
													Copier
												{/if}
											</button>
										</div>
									</div>
									<p class="mt-2 text-xs text-green-600">
										Cette invitation expire dans 7 jours. Envoyez le lien par email à la personne invitée.
									</p>
								</div>
							</div>
						</div>
					</div>
				{/if}

				{#if form?.error}
					<div class="mt-4 rounded-md bg-red-50 p-4">
						<div class="flex">
							<div class="flex-shrink-0">
								<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
								</svg>
							</div>
							<div class="ml-3">
								<h3 class="text-sm font-medium text-red-800">
									{form.error}
								</h3>
							</div>
						</div>
					</div>
				{/if}

				<form
					method="POST"
					class="mt-6 space-y-6"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ update }) => {
							await update();
							isSubmitting = false;
							// Reset le formulaire en cas de succès
							if (form?.success) {
								email = '';
								role = 'author';
							}
						};
					}}
				>
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<div>
							<label for="email" class="block text-sm font-medium text-gray-700">
								Adresse email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								required
								bind:value={email}
								class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								placeholder="nom@exemple.com"
							/>
						</div>

						<div>
							<label for="role" class="block text-sm font-medium text-gray-700">
								Rôle
							</label>
							<select
								id="role"
								name="role"
								bind:value={role}
								class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							>
								<option value="viewer">Viewer - Lecture seule</option>
								<option value="author">Author - Peut écrire des articles</option>
								<option value="admin">Admin - Tous les droits</option>
							</select>
						</div>
					</div>

					<div class="flex justify-end">
						<button
							type="submit"
							disabled={isSubmitting || !email}
							class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{#if isSubmitting}
								<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Création...
							{:else}
								Créer l'invitation
							{/if}
						</button>
					</div>
				</form>

				<div class="mt-8 border-t border-gray-200 pt-6">
					<div class="text-center">
						<a href="/dashboard" class="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
							← Retour au dashboard
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
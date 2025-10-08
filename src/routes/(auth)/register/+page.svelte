<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types.js';

	// Props
	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Variables réactives avec Svelte 5
	let isSubmitting = $state(false);
	let firstName = $state(form?.firstName || '');
	let lastName = $state(form?.lastName || '');
	let title = $state(form?.title || '');
	let password = $state('');
	let confirmPassword = $state('');

	// Validation en temps réel
	let passwordsMatch = $derived(password === confirmPassword && password.length > 0);
	let passwordValid = $derived(password.length >= 8);
</script>

<svelte:head>
	<title>Create Account - Elevatus Dashboard</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
				Create Your Account
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Welcome to the Elevatus team!
				<br />
				<span class="font-medium text-indigo-600">{data.email}</span>
				<br />
				<span class="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
					{data.role}
				</span>
			</p>
		</div>

		<form
			method="POST"
			class="mt-8 space-y-6"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					await update();
					isSubmitting = false;
				};
			}}
		>
			<!-- Champs cachés -->
			<input type="hidden" name="email" value={data.email} />
			<input type="hidden" name="token" value={data.token} />

			{#if form?.error}
				<div class="rounded-md bg-red-50 p-4">
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

			<div class="space-y-4">
				<!-- First Name and Last Name -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
						<input
							id="firstName"
							name="firstName"
							type="text"
							required
							bind:value={firstName}
							class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							placeholder="First Name"
						/>
					</div>
					<div>
						<label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
						<input
							id="lastName"
							name="lastName"
							type="text"
							required
							bind:value={lastName}
							class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							placeholder="Last Name"
						/>
					</div>
				</div>

				<!-- Title -->
				<div>
					<label for="title" class="block text-sm font-medium text-gray-700">Title (optional)</label>
					<input
						id="title"
						name="title"
						type="text"
						bind:value={title}
						class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						placeholder="e.g. Nutritionist, Director..."
					/>
				</div>

				<!-- Password -->
				<div>
					<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						bind:value={password}
						class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						placeholder="At least 8 characters"
					/>
					{#if password.length > 0 && !passwordValid}
						<p class="mt-1 text-sm text-red-600">Password must contain at least 8 characters</p>
					{/if}
				</div>

				<!-- Confirm Password -->
				<div>
					<label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
					<input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						required
						bind:value={confirmPassword}
						class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						placeholder="Confirm your password"
					/>
					{#if confirmPassword.length > 0 && !passwordsMatch}
						<p class="mt-1 text-sm text-red-600">Passwords do not match</p>
					{/if}
				</div>
			</div>

			<div>
				<button
					type="submit"
					disabled={isSubmitting || !passwordValid || !passwordsMatch || !firstName || !lastName}
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if isSubmitting}
						<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Creating...
					{:else}
						Create My Account
					{/if}
				</button>
			</div>

			<div class="text-center">
				<p class="text-sm text-gray-600">
					Already have an account? 
					<a href="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
						Sign in
					</a>
				</p>
			</div>
		</form>
	</div>
</div>
<script>
    import { enhance } from '$app/forms';
    
    let {data} = $props();
</script>

<nav class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex items-center">
					<h1 class="text-xl font-semibold text-gray-900">
						Elevatus Dashboard
					</h1>
				</div>
				<div class="flex items-center space-x-4">
					<span class="text-sm text-gray-700">
						Bonjour, <strong>{data.user.firstName} {data.user.lastName}</strong>
					</span>
					<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
						{data.user.role}
					</span>
					<form method="POST" action="/?/logout" use:enhance>
						<button
							type="submit"
							class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
						>
							Déconnexion
						</button>
					</form>
				</div>
			</div>
		</div>
	</nav>
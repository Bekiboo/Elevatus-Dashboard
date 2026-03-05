<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { MetaTags, deepMerge } from 'svelte-meta-tags';

	let { data, children } = $props();

	const metaTags = $derived(deepMerge(data.baseMetaTags, page.data.pageMetaTags));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<MetaTags {...metaTags} />

{@render children?.()}

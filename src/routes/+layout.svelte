<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { MetaTags } from 'svelte-meta-tags';

	let { children } = $props();

	const title = 'Secure Document Access | Certless';
	const description = 'You have been sent documents via Certless. Open this link to verify your identity and access them securely.';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<MetaTags
	{title}
	{description}
	robots="noindex, nofollow"
	openGraph={{
		title,
		description,
		url: `https://${page.url.host}${page.url.pathname}`,
		type: 'website',
		siteName: 'Certless',
		images: [
			{
				url: `https://${page.url.host}/og-reveal.png`,
				width: 1200,
				height: 630
			}
		]
	}}
	twitter={{
		cardType: 'summary_large_image',
		title,
		description,
		image: `https://${page.url.host}/og-reveal.png`
	}}
/>

{@render children?.()}

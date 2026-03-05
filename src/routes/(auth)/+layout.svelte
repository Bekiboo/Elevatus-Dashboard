<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
  import { MetaTags } from 'svelte-meta-tags';

	let { children } = $props();

  const data = {
    og: {
      title: 'Secure Document Access | Certless',
      description:
        'Securely access your documents with Certless. Click the link to verify your identity and view your files safely.'
    }
  };
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<MetaTags
  title={data.og.title}
  description={data.og.description}
  robots="noindex, nofollow"
  openGraph={{
    title: data.og.title,
    description: data.og.description,
    url: `https://${page.url.host}${page.url.pathname}`,
    type: 'website',
    siteName: 'Certless',
    images: [
      {
        url: `https://${page.url.host}/og-reveal1.png`,
        width: 1200,
        height: 630
      }
    ]
  }}
  twitter={{
    cardType: 'summary_large_image',
    title: data.og.title,
    description: data.og.description,
    image: `https://${page.url.host}/og-reveal1.png`
  }}
/>

{@render children?.()}

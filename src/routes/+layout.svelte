<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

  let data = {
    og: {
      title: 'Certless - A certificate authority for the decentralized web',
      description:
        'Certless is a certificate authority for the decentralized web. We provide free SSL certificates for decentralized websites.',
    },
  };
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	  <title>{data.og.title}</title>
  <meta name="description" content={data.og.description} />
  <meta property="og:title" content={data.og.title} />
  <meta property="og:description" content={data.og.description} />
  <meta
    property="og:url"
    content={`https://${page.url.host}${page.url.pathname}`}
  /> <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Certless" />
  <meta
    property="og:image"
    content={`https://${page.url.host}/og-reveal.png`}
  />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Title" />
  <meta name="twitter:description" content="Description" />
  <meta
    name="twitter:image"
    content={`https://${page.url.host}/og-reveal.png`}
  />
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

{@render children?.()}

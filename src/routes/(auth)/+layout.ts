import { definePageMetaTags } from 'svelte-meta-tags';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ url }) => {
	const canonicalUrl = new URL(url.pathname, url.origin).href;
	const imageUrl = new URL('/og-reveal1.png', url.origin).href;

	return definePageMetaTags({
		title: 'Secure Document Access | Certless',
		description:
			'Securely access your documents with Certless. Click the link to verify your identity and view your files safely.',
		robots: 'noindex, nofollow',
		canonical: canonicalUrl,
		openGraph: {
			title: 'Secure Document Access | Certless',
			description:
				'Securely access your documents with Certless. Click the link to verify your identity and view your files safely.',
			url: canonicalUrl,
			type: 'website',
			siteName: 'Certless',
			images: [
				{
					url: imageUrl,
					width: 1200,
					height: 630
				}
			]
		},
		twitter: {
			cardType: 'summary_large_image',
			title: 'Secure Document Access | Certless',
			description:
				'Securely access your documents with Certless. Click the link to verify your identity and view your files safely.',
			image: imageUrl
		}
	});
};
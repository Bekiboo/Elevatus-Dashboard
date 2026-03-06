import { defineBaseMetaTags } from 'svelte-meta-tags';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ url }) => {
	const canonicalUrl = new URL(url.pathname, url.origin).href;
	const imageUrl = new URL('/og-reveal1.png', url.origin).href;

	return defineBaseMetaTags({
		title: 'Secure Document Access | Certless',
		description:
			'You have been sent documents via Certless. Open this link to verify your identity and access them securely.',
		robots: 'noindex, nofollow',
		canonical: canonicalUrl,
		openGraph: {
			title: 'Secure Document Access | Certless',
			description:
				'You have been sent documents via Certless. Open this link to verify your identity and access them securely.',
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
				'You have been sent documents via Certless. Open this link to verify your identity and access them securely.',
			image: imageUrl
		}
	});
};
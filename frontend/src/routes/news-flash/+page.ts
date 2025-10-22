import type { PageLoad } from './$types';
import { fetchNews } from '$lib/api/news';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const news = await fetchNews(fetch);
		return { news };
	} catch (error) {
		console.error('Fehler beim Laden der News:', error);
		return { news: [] };
	}
};

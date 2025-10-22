import type { PageLoad } from './$types.js';
import { getPlugins, getPluginHealth } from '$lib/api/plugins.js';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const [pluginsResult, healthResult] = await Promise.all([
			getPlugins(fetch),
			getPluginHealth(fetch)
		]);

		return {
			plugins: pluginsResult.success ? (pluginsResult.data ?? []) : [],
			health: healthResult.health,
			error: pluginsResult.success ? null : pluginsResult.error
		};
	} catch (error) {
		console.error('Fehler beim Laden des Dashboards:', error);
		return {
			plugins: [],
			health: { status: 'unknown' as const },
			error: 'Unbekannter Fehler beim Laden'
		};
	}
};

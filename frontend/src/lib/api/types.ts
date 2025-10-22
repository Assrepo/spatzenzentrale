export interface NewsItem {
	id?: string;
	title: string;
	content: string;
	publishDate: string;
	created?: number;
}

export interface Plugin {
	name: string;
	version: string;
	description?: string;
	route?: string;
	enabled: boolean;
	category?: string;
	author?: string;
}

export interface SystemHealth {
	status: 'healthy' | 'warning' | 'error' | 'unknown';
	uptime?: number;
	activeConnections?: number;
	timestamp?: string;
	checks?: Record<string, unknown>;
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

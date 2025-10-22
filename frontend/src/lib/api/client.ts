/**
 * Zentraler API-Client
 * KISS: Eine Funktion für alle API-Calls
 */

// Nutze relative URLs - Vite Proxy handled den Rest
const API_BASE = '/api';

export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export class ApiError extends Error {
	constructor(
		message: string,
		public statusCode?: number,
		public response?: any
	) {
		super(message);
		this.name = 'ApiError';
	}
}

export async function apiCall<T = any>(
	endpoint: string,
	options?: RequestInit
): Promise<T> {
	const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

	try {
		const response = await fetch(url, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...options?.headers
			}
		});

		// Nicht-JSON Responses (z.B. Bilder, Redirects)
		if (!response.headers.get('content-type')?.includes('application/json')) {
			if (!response.ok) {
				throw new ApiError(
					`HTTP ${response.status}: ${response.statusText}`,
					response.status
				);
			}
			return response as any;
		}

		const result: ApiResponse<T> = await response.json();

		if (!response.ok || !result.success) {
			throw new ApiError(
				result.error || `HTTP ${response.status}`,
				response.status,
				result
			);
		}

		return result.data as T;
	} catch (error) {
		if (error instanceof ApiError) {
			throw error;
		}
		throw new ApiError(
			error instanceof Error ? error.message : 'Network error',
			undefined,
			error
		);
	}
}

// Convenience Helpers
export const api = {
	get: <T = any>(endpoint: string) => apiCall<T>(endpoint, { method: 'GET' }),

	post: <T = any>(endpoint: string, data?: any) =>
		apiCall<T>(endpoint, {
			method: 'POST',
			body: data ? JSON.stringify(data) : undefined
		}),

	put: <T = any>(endpoint: string, data?: any) =>
		apiCall<T>(endpoint, {
			method: 'PUT',
			body: data ? JSON.stringify(data) : undefined
		}),

	delete: <T = any>(endpoint: string) => apiCall<T>(endpoint, { method: 'DELETE' })
};

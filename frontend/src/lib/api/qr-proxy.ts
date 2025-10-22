import { api } from './client';

export interface QRCode {
	id: string;
	name: string;
	description: string;
	targetUrl: string;
	proxyUrl: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	clickCount: number;
}

export interface CreateQRCodeRequest {
	name: string;
	description?: string;
	targetUrl: string;
}

export interface UpdateQRCodeRequest {
	name?: string;
	description?: string;
	targetUrl?: string;
	isActive?: boolean;
}

export const createQRCode = (data: CreateQRCodeRequest) =>
	api.post<QRCode>('/qr-proxy/create', data);

export const getQRCodes = () => api.get<QRCode[]>('/qr-proxy/list');

export const getQRCode = (id: string) => api.get<QRCode>(`/qr-proxy/${id}`);

export const updateQRCode = (id: string, data: UpdateQRCodeRequest) =>
	api.put<QRCode>(`/qr-proxy/${id}`, data);

export const deleteQRCode = (id: string) => api.delete<void>(`/qr-proxy/${id}`);

export const getQRCodeImageUrl = (id: string) => `/qr-proxy/${id}/qr-image`;

export const getProxyUrl = (id: string) => `/qr-proxy/redirect/${id}`;

import { api } from './client';

export interface NewsArticle {
	id?: string;
	title: string;
	content: string;
	publishDate: string;
}

export const getNews = () => api.get<NewsArticle[]>('/news');

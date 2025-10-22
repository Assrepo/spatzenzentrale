import { writable, derived, get } from 'svelte/store';

interface PluginStateData {
	[key: string]: any;
}

interface MessageData {
	type: 'success' | 'error' | 'info';
	message: string;
	timestamp: number;
}

interface LoadingState {
	[key: string]: boolean;
}

class PluginState {
	private state = writable<PluginStateData>({});
	private messages = writable<MessageData[]>([]);
	private loading = writable<LoadingState>({});
	private dataCache = writable<Record<string, any>>({});

	public readonly values = { subscribe: this.state.subscribe };
	public readonly allMessages = { subscribe: this.messages.subscribe };
	public readonly loadingStates = { subscribe: this.loading.subscribe };

	init(pluginName: string) {
		// Initialize plugin-specific state
	}

	set(key: string, value: any) {
		this.state.update(s => ({ ...s, [key]: value }));
	}

	get(key: string): any {
		return get(this.state)[key];
	}

	setLoading(key: string, isLoading: boolean) {
		this.loading.update(l => ({ ...l, [key]: isLoading }));
	}

	isLoading(key: string): boolean {
		return get(this.loading)[key] || false;
	}

	addMessage(type: MessageData['type'], message: string) {
		const newMessage: MessageData = {
			type,
			message,
			timestamp: Date.now()
		};
		this.messages.update(msgs => [...msgs, newMessage]);

		// Auto-remove nach 5 Sekunden
		setTimeout(() => {
			this.removeMessage(newMessage.timestamp);
		}, 5000);
	}

	removeMessage(timestamp: number) {
		this.messages.update(msgs => msgs.filter(m => m.timestamp !== timestamp));
	}

	clearMessages() {
		this.messages.set([]);
	}

	cacheData(key: string, data: any) {
		this.dataCache.update(cache => ({ ...cache, [key]: data }));
	}

	getCachedData(key: string): any {
		return get(this.dataCache)[key];
	}

	reset() {
		this.state.set({});
		this.messages.set([]);
		this.loading.set({});
		this.dataCache.set({});
	}
}

export const pluginState = new PluginState();

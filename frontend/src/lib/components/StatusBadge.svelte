<script lang="ts">
	interface Props {
		status: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let { status, size = 'sm' }: Props = $props();

	interface StatusConfig {
		color: string;
		icon: string;
		label: string;
	}

	function getStatusConfig(status: string): StatusConfig {
		const configs: Record<string, StatusConfig> = {
			healthy: {
				color: 'bg-green-100 text-green-800 border-green-200',
				icon: '✅',
				label: 'Aktiv'
			},
			active: {
				color: 'bg-green-100 text-green-800 border-green-200',
				icon: '✅',
				label: 'Aktiv'
			},
			warning: {
				color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
				icon: '⚠️',
				label: 'Warnung'
			},
			error: {
				color: 'bg-red-100 text-red-800 border-red-200',
				icon: '❌',
				label: 'Fehler'
			},
			disabled: {
				color: 'bg-gray-100 text-gray-800 border-gray-200',
				icon: '⏸️',
				label: 'Deaktiviert'
			},
			unknown: {
				color: 'bg-gray-100 text-gray-800 border-gray-200',
				icon: '❓',
				label: 'Unbekannt'
			}
		};

		return configs[status] ?? configs['unknown']!;
	}

	let config = $derived(getStatusConfig(status));
	let sizeClass = $derived(
		size === 'lg' ? 'px-3 py-2 text-sm' : size === 'md' ? 'px-2 py-1 text-xs' : 'px-2 py-1 text-xs'
	);
</script>

<span
	class="inline-flex items-center space-x-1 rounded-full border font-medium {config.color} {sizeClass}"
>
	<span>{config.icon}</span>
	<span>{config.label}</span>
</span>

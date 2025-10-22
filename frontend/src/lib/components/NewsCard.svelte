<script lang="ts">
	import type { NewsItem } from '$lib/api/types';
	import { qrUrl } from '$lib/api/news';

	interface Props {
		newsItem: NewsItem;
		index: number;
	}

	let { newsItem, index }: Props = $props();
</script>

<article class="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
	<div class="p-6">
		<!-- Header -->
		<div class="flex items-start justify-between mb-4">
			<div class="flex-1">
				<h1 class="text-2xl font-bold text-gray-900 leading-tight mb-2">
					{newsItem.title}
				</h1>
				<div class="flex items-center space-x-4 text-sm text-gray-500">
					<span class="flex items-center">
						📅 {newsItem.publishDate}
					</span>
					<span class="flex items-center">
						🔢 Artikel #{index + 1}
					</span>
				</div>
			</div>
		</div>

		<!-- Content -->
		<div class="prose max-w-none mb-6">
			<p class="text-gray-700 leading-relaxed text-lg">
				{newsItem.content}
			</p>
		</div>

		<!-- Footer with QR Code -->
		<div class="border-t pt-4 flex items-end justify-between">
			<div class="flex-1">
				<p class="text-xs text-gray-400 mb-2">Scannen Sie den QR-Code für weitere Informationen</p>
			</div>
			<div class="flex-shrink-0">
				<img
					src={qrUrl(index)}
					alt="QR-Code für weitere Informationen"
					class="w-24 h-24 rounded-lg border border-gray-200"
				/>
			</div>
		</div>
	</div>
</article>

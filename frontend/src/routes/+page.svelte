<script lang="ts">
    import { onMount } from 'svelte';
    import { getCurrentDate, getCurrentTime } from '$lib/utils/datetime';
    import ServiceTiles from '$lib/components/ServiceTiles.svelte';

    let currentDate = '';
    let currentTime = '';
    let timeInterval: number | undefined;

    function updateDateTime() {
        currentDate = getCurrentDate();
        currentTime = getCurrentTime();
    }

    onMount(() => {
        updateDateTime();
        timeInterval = window.setInterval(updateDateTime, 1000);
        return () => {
            if (timeInterval) clearInterval(timeInterval);
        };
    });
</script>

<svelte:head>
    <title>Spatzenzentrale - Home</title>
</svelte:head>

<!-- Hero Section -->
<div class="bg-gradient-to-r from-brand text-black">
    <div class="container mx-auto px-4 py-20">
        <div class="text-center">
            <h1 class="text-5xl font-bold mb-4">Spatzenzentrale</h1>
            <div class="text-lg mb-8">
                <p>{currentDate}</p>
                <p class="font-mono text-2xl">{currentTime}</p>
            </div>
        </div>
    </div>
</div>

<!-- Dynamic Services -->
<ServiceTiles />



<!-- System Info Footer -->
<div class="bg-gray-100 py-8">
    <div class="container mx-auto px-4 text-center text-gray-600">
        <p class="mb-2">Spatzenzentrale System</p>
        <p class="text-sm">Server läuft auf Port 3001 • Frontend auf Port 5173</p>
    </div>
</div>
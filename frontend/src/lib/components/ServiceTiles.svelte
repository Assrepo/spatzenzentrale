<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { loadServices, groupServicesByCategory, getCategoryDisplayName } from '$lib/api/services';
  
  let services: any[] = [];
  let groupedServices: Record<string, any[]> = {};
  let isLoading = true;
  let error = '';
  
  async function fetchServices() {
    try {
      isLoading = true;
      error = '';
      
      console.log('🔄 Lade Services...');
      services = await loadServices();
      groupedServices = groupServicesByCategory(services);
      
      console.log('✅ Services geladen:', services.length);
      console.log('📂 Gruppiert:', Object.keys(groupedServices));
      
    } catch (err) {
      console.error('❌ Service-Loading Fehler:', err);
      error = `Fehler beim Laden der Services: ${err.message}`;
    } finally {
      isLoading = false;
    }
  }
  
  function handleServiceClick(service: any) {
    if (service.url) {
      // Externe URL in neuem Tab öffnen
      window.open(service.url, '_blank');
    } else if (service.route) {
      // Interne Route navigieren
      goto(service.route);
    }
  }
  
  onMount(() => {
    fetchServices();
  });
</script>

<div class="py-16 bg-gray-50">
  <div class="container mx-auto px-4">
    <h2 class="text-3xl font-bold text-center mb-12">Verfügbare Services</h2>
    
    {#if isLoading}
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Services werden geladen...</p>
      </div>
    {:else if error}
      <div class="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <div class="text-4xl mb-2">❌</div>
        <p class="text-red-800 text-sm">{error}</p>
        <button 
          on:click={fetchServices}
          class="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Erneut versuchen
        </button>
      </div>
    {:else if services.length === 0}
      <div class="text-center text-gray-500">
        <div class="text-4xl mb-4">🔌</div>
        <p>Keine Services verfügbar</p>
      </div>
    {:else}
      <!-- Services nach Kategorien gruppiert -->
      {#each Object.entries(groupedServices) as [category, categoryServices]}
        <div class="mb-12">
          <h3 class="text-xl font-semibold text-gray-800 mb-6 text-center">
            {getCategoryDisplayName(category)}
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {#each categoryServices as service}
              <button
                on:click={() => handleServiceClick(service)}
                class="group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 {service.color} text-white p-6 min-h-[200px] flex flex-col justify-between"
              >
                <!-- Background Pattern -->
                <div class="absolute inset-0 opacity-10">
                  <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                </div>
                
                <!-- Content -->
                <div class="relative z-10">
                  <div class="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <h3 class="text-xl font-bold mb-2">{service.name}</h3>
                  <p class="text-sm opacity-90 leading-relaxed">{service.description}</p>
                </div>
                
                <!-- Hover indicator -->
                {#if service.url}
                  <div class="relative z-10 text-xs opacity-75 flex items-center gap-1">
                    <span>↗</span> Externe URL
                  </div>
                {:else}
                  <div class="relative z-10 text-xs opacity-75 flex items-center gap-1">
                    <span>→</span> Intern
                  </div>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/each}
    {/if}
    
    <!-- Auto-Refresh Info -->
    {#if !isLoading && !error && services.length > 0}
      <div class="mt-8 text-center text-sm text-gray-500">
        <p>✨ Services werden automatisch erkannt • {services.length} Services verfügbar</p>
        <button 
          on:click={fetchServices}
          class="mt-2 text-blue-600 hover:text-blue-800 underline"
        >
          🔄 Aktualisieren
        </button>
      </div>
    {/if}
  </div>
</div>
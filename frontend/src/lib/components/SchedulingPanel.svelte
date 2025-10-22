<script lang="ts">
    export let selectedBotId: string;
    
    let isScheduling = false;
    let scheduleError = '';
    let scheduleSuccess = '';
    let scheduledJobs: any[] = [];
    
    // Scheduling form data
    let intervalMinutes = 60; // Standard: 1 Stunde
    let customScheduleQuestion = '';
    let enableAutoSchedule = false;
    let scheduleMethod = 'api'; // 'api' oder 'puppeteer'
    
    async function createSchedule() {
        if (isScheduling) return;
        
        scheduleError = '';
        scheduleSuccess = '';
        isScheduling = true;
        
        try {
            const response = await fetch('/botbucket/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chatbotId: selectedBotId,
                    interval: intervalMinutes * 60 * 1000, // Convert to milliseconds
                    question: customScheduleQuestion || undefined,
                    method: scheduleMethod
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                scheduleSuccess = `✅ Automatischer Abruf geplant! Nächste Ausführung: ${new Date(result.schedule.nextRun).toLocaleString('de-DE')}`;
                loadScheduledJobs();
            } else {
                scheduleError = `❌ Scheduling fehlgeschlagen: ${result.error}`;
            }
            
        } catch (err) {
            scheduleError = `❌ Fehler beim Scheduling: ${err.message}`;
        } finally {
            isScheduling = false;
        }
    }
    
    async function loadScheduledJobs() {
        try {
            // Placeholder - hier würde eine echte API für geplante Jobs stehen
            scheduledJobs = [
                {
                    id: 'job-1',
                    chatbotId: selectedBotId,
                    interval: '60 Minuten',
                    nextRun: new Date(Date.now() + 60 * 60 * 1000).toLocaleString('de-DE'),
                    method: scheduleMethod,
                    status: 'active'
                }
            ];
        } catch (err) {
            console.error('Fehler beim Laden der geplanten Jobs:', err);
        }
    }
    
    function formatInterval(minutes: number): string {
        if (minutes < 60) {
            return `${minutes} Minuten`;
        } else if (minutes === 60) {
            return '1 Stunde';
        } else if (minutes < 1440) {
            return `${Math.floor(minutes / 60)} Stunden`;
        } else {
            return `${Math.floor(minutes / 1440)} Tage`;
        }
    }
</script>

<div class="bg-white rounded-lg shadow-sm border p-6">
    <h2 class="text-xl font-semibold mb-4 flex items-center">
        ⏰ Automatisches Scheduling
    </h2>
    
    <!-- Messages -->
    {#if scheduleError}
        <div class="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-800 text-sm">{scheduleError}</p>
        </div>
    {/if}
    
    {#if scheduleSuccess}
        <div class="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <p class="text-green-800 text-sm">{scheduleSuccess}</p>
        </div>
    {/if}
    
    <div class="space-y-4">
        <!-- Enable/Disable Toggle -->
        <div class="flex items-center p-3 bg-gray-50 rounded-lg">
            <input 
                type="checkbox" 
                bind:checked={enableAutoSchedule}
                id="enableSchedule"
                class="mr-3"
            >
            <label for="enableSchedule" class="font-medium">
                Automatisches Scraping aktivieren
            </label>
        </div>
        
        {#if enableAutoSchedule}
            <div class="space-y-4 pl-4 border-l-2 border-purple-200">
                <!-- Interval Selection -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Ausführungsintervall
                    </label>
                    <div class="grid grid-cols-2 gap-2">
                        <select 
                            bind:value={intervalMinutes}
                            class="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value={15}>15 Minuten</option>
                            <option value={30}>30 Minuten</option>
                            <option value={60}>1 Stunde</option>
                            <option value={120}>2 Stunden</option>
                            <option value={360}>6 Stunden</option>
                            <option value={720}>12 Stunden</option>
                            <option value={1440}>24 Stunden</option>
                        </select>
                        <div class="flex items-center text-sm text-gray-600 px-2">
                            ({formatInterval(intervalMinutes)})
                        </div>
                    </div>
                </div>
                
                <!-- Method Selection -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Scraping-Methode
                    </label>
                    <div class="grid grid-cols-2 gap-2">
                        <label class="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50" class:bg-purple-50={scheduleMethod === 'api'} class:border-purple-500={scheduleMethod === 'api'}>
                            <input 
                                type="radio" 
                                bind:group={scheduleMethod} 
                                value="api"
                                class="mr-2"
                            >
                            <span class="text-sm">🌐 API</span>
                        </label>
                        <label class="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50" class:bg-purple-50={scheduleMethod === 'puppeteer'} class:border-purple-500={scheduleMethod === 'puppeteer'}>
                            <input 
                                type="radio" 
                                bind:group={scheduleMethod} 
                                value="puppeteer"
                                class="mr-2"
                            >
                            <span class="text-sm">🎭 Puppeteer</span>
                        </label>
                    </div>
                </div>
                
                <!-- Custom Question -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Spezielle Frage für geplante Ausführung (optional)
                    </label>
                    <textarea 
                        bind:value={customScheduleQuestion}
                        placeholder="Standard-Frage wird verwendet wenn leer..."
                        rows="2"
                        class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    ></textarea>
                </div>
                
                <!-- Schedule Button -->
                <button 
                    on:click={createSchedule}
                    disabled={isScheduling}
                    class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isScheduling ? '⏳ Plane...' : '📅 Zeitplan erstellen'}
                </button>
            </div>
        {/if}
        
        <!-- Scheduled Jobs List -->
        {#if enableAutoSchedule && scheduledJobs.length > 0}
            <div class="mt-6 pt-4 border-t">
                <h3 class="font-semibold mb-3">📋 Geplante Jobs</h3>
                <div class="space-y-2">
                    {#each scheduledJobs as job}
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div class="flex-1">
                                <div class="flex items-center space-x-2">
                                    <span class="text-sm font-medium">
                                        {job.method === 'api' ? '🌐' : '🎭'} {job.interval}
                                    </span>
                                    <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                        {job.status}
                                    </span>
                                </div>
                                <div class="text-xs text-gray-600 mt-1">
                                    Nächste Ausführung: {job.nextRun}
                                </div>
                            </div>
                            <button class="text-red-600 hover:text-red-800 text-sm">
                                🗑️ Stoppen
                            </button>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
        
        <!-- Info -->
        <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 class="text-sm font-semibold text-blue-900 mb-1">ℹ️ Scheduling-Info</h4>
            <div class="text-xs text-blue-800 space-y-1">
                <p>• Jobs laufen automatisch im Hintergrund</p>
                <p>• News werden direkt in die Datenbank gespeichert</p>
                <p>• Bei Fehlern wird automatisch mit der anderen Methode versucht</p>
                <p>• Duplikate werden automatisch erkannt und übersprungen</p>
            </div>
        </div>
    </div>
</div>
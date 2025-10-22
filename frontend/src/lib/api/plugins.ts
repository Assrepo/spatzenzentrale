import type { Plugin, SystemHealth, ApiResponse } from './types.js';

const BASE_URL = 'http://sus-web-01-lp:3001';

// Type Guards für bessere Validierung
function isApiResponse<T>(data: unknown): data is ApiResponse<T> {
    return (
        data !== null &&
        typeof data === 'object' &&
        'success' in data &&
        typeof (data as any).success === 'boolean' &&
        'data' in data
    );
}

function hasHealthProperty(data: unknown): data is { health: SystemHealth } {
    return (
        data !== null &&
        typeof data === 'object' &&
        'health' in data &&
        typeof (data as any).health === 'object'
    );
}

export async function getPlugins(fetchFn: typeof fetch = fetch): Promise<ApiResponse<Plugin[]>> {
    try {
        console.log('🔍 Fetching plugins from:', `${BASE_URL}/api/plugins`);
        
        const response = await fetchFn(`${BASE_URL}/api/plugins`);
        
        if (!response.ok) {
            console.error('❌ HTTP Error:', response.status, response.statusText);
            return { 
                success: false, 
                error: `HTTP ${response.status}: ${response.statusText}`, 
                data: [] 
            };
        }
        
        const data: unknown = await response.json();
        console.log('📦 Raw response:', data);
        
        // Korrekte Strukturvalidierung
        if (isApiResponse<Plugin[]>(data)) {
            console.log('✅ Valid ApiResponse structure');
            console.log('✅ Success:', data.success);
            console.log('✅ Data length:', Array.isArray(data.data) ? data.data.length : 'not array');
            return data;
        }
        
        // Fallback: Vielleicht ist die Antwort direkt ein Array?
        if (Array.isArray(data)) {
            console.log('⚠️  Direct array response, wrapping in ApiResponse');
            return { success: true, data: data as Plugin[] };
        }
        
        console.error('❌ Invalid response structure:', data);
        return { 
            success: false, 
            error: 'Ungültige Antwort vom Server - erwartete ApiResponse Struktur', 
            data: [] 
        };
        
    } catch (error) {
        console.error('❌ Request failed:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Netzwerkfehler', 
            data: [] 
        };
    }
}

export async function getPlugin(
    name: string,
    fetchFn: typeof fetch = fetch
): Promise<ApiResponse<Plugin>> {
    try {
        console.log(`🔍 Fetching plugin: ${name}`);
        
        const response = await fetchFn(`${BASE_URL}/api/plugins/${encodeURIComponent(name)}`);
        
        if (!response.ok) {
            console.error('❌ HTTP Error:', response.status, response.statusText);
            return { 
                success: false, 
                error: `HTTP ${response.status}: ${response.statusText}` 
            };
        }
        
        const data: unknown = await response.json();
        console.log('📦 Plugin response:', data);
        
        if (isApiResponse<Plugin>(data)) {
            console.log('✅ Valid plugin response');
            return data;
        }
        
        console.error('❌ Invalid plugin response structure:', data);
        return { 
            success: false, 
            error: 'Ungültige Antwort vom Server' 
        };
        
    } catch (error) {
        console.error(`❌ Plugin request failed for ${name}:`, error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Plugin nicht gefunden' 
        };
    }
}

export async function getPluginHealth(
    fetchFn: typeof fetch = fetch
): Promise<{ health: SystemHealth }> {
    try {
        console.log('🔍 Fetching health from:', `${BASE_URL}/api/plugins/system/health`);
        
        const response = await fetchFn(`${BASE_URL}/api/plugins/system/health`);
        
        if (!response.ok) {
            console.error('❌ Health check HTTP error:', response.status);
            return {
                health: {
                    status: 'error',
                    uptime: 0,
                    activeConnections: 0,
                    timestamp: new Date().toISOString(),
                    message: `HTTP ${response.status}: ${response.statusText}`
                }
            };
        }
        
        const data: unknown = await response.json();
        console.log('📦 Health response:', data);
        
        if (hasHealthProperty(data)) {
            console.log('✅ Valid health response');
            return data;
        }
        
        console.error('❌ Invalid health response structure:', data);
        return {
            health: {
                status: 'unknown',
                uptime: 0,
                activeConnections: 0,
                timestamp: new Date().toISOString(),
                message: 'Ungültige Health-Antwort'
            }
        };
        
    } catch (error) {
        console.error('❌ Health check failed:', error);
        return {
            health: {
                status: 'error',
                uptime: 0,
                activeConnections: 0,
                timestamp: new Date().toISOString(),
                message: error instanceof Error ? error.message : 'Health check fehlgeschlagen'
            }
        };
    }
}

export async function reloadPlugin(
    name: string,
    fetchFn: typeof fetch = fetch
): Promise<ApiResponse<unknown>> {
    try {
        console.log(`🔄 Reloading plugin: ${name}`);
        
        const response = await fetchFn(`${BASE_URL}/api/plugins/${encodeURIComponent(name)}/reload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error('❌ Reload HTTP error:', response.status);
            return { 
                success: false, 
                error: `HTTP ${response.status}: ${response.statusText}` 
            };
        }
        
        const data: unknown = await response.json();
        console.log('📦 Reload response:', data);
        
        if (isApiResponse(data)) {
            console.log('✅ Valid reload response');
            return data;
        }
        
        console.error('❌ Invalid reload response structure:', data);
        return { 
            success: false, 
            error: 'Ungültige Antwort vom Server' 
        };
        
    } catch (error) {
        console.error(`❌ Plugin reload failed for ${name}:`, error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Reload fehlgeschlagen' 
        };
    }
}

export async function togglePlugin(
    name: string,
    fetchFn: typeof fetch = fetch
): Promise<ApiResponse<{ newState: boolean; message: string; note?: string }>> {
    try {
        console.log(`🔄 Toggling plugin: ${name}`);
        
        const response = await fetchFn(`${BASE_URL}/api/plugins/${encodeURIComponent(name)}/toggle`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error('❌ Toggle HTTP error:', response.status);
            return { 
                success: false, 
                error: `HTTP ${response.status}: ${response.statusText}` 
            };
        }
        
        const data: unknown = await response.json();
        console.log('📦 Toggle response:', data);
        
        if (isApiResponse(data)) {
            console.log('✅ Valid toggle response');
            return data;
        }
        
        console.error('❌ Invalid toggle response structure:', data);
        return { 
            success: false, 
            error: 'Ungültige Antwort vom Server' 
        };
        
    } catch (error) {
        console.error(`❌ Plugin toggle failed for ${name}:`, error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Toggle fehlgeschlagen' 
        };
    }
}
interface ServiceTile {
  name: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  category: string;
  priority: number;
}

interface ServicesResponse {
  success: boolean;
  data: ServiceTile[];
  totalServices: number;
  error?: string;
}

/**
 * Lade alle verfügbaren Services von der API
 */
export async function loadServices(): Promise<ServiceTile[]> {
  try {
    const response = await fetch('/api/services');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result: ServicesResponse = await response.json();
    
    if (result.success) {
      console.log(`🔍 ${result.totalServices} Services entdeckt:`, result.data);
      return result.data;
    } else {
      throw new Error(result.error || 'Unbekannter API-Fehler');
    }
    
  } catch (error) {
    console.error('❌ Fehler beim Laden der Services:', error);
    
    // Fallback auf statische Services
    const fallbackServices: ServiceTile[] = [
      {
        name: 'News Flash',
        description: 'Aktuelle Nachrichten aus Ulm',
        icon: '📰',
        route: '/news-flash',
        color: 'bg-blue-500 hover:bg-blue-600',
        category: 'content',
        priority: 10
      },
      {
        name: 'Dashboard',
        description: 'Plugin-Verwaltung & Systemstatus',
        icon: '📊',
        route: '/dashboard',
        color: 'bg-green-500 hover:bg-green-600',
        category: 'system',
        priority: 5
      }
    ];
    
    console.log('🔄 Fallback auf statische Services:', fallbackServices);
    return fallbackServices;
  }
}

/**
 * Gruppiere Services nach Kategorie
 */
export function groupServicesByCategory(services: ServiceTile[]): Record<string, ServiceTile[]> {
  return services.reduce((groups, service) => {
    const category = service.category || 'general';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(service);
    return groups;
  }, {} as Record<string, ServiceTile[]>);
}

/**
 * Übersetze Kategorie-Namen für die Anzeige
 */
export function getCategoryDisplayName(category: string): string {
  const categoryNames: Record<string, string> = {
    'content': '📄 Inhalte',
    'management': '⚙️ Verwaltung', 
    'system': '🖥️ System',
    'general': '📦 Allgemein'
  };
  
  return categoryNames[category] || `📦 ${category}`;
}
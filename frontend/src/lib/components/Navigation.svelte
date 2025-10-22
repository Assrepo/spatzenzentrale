<script lang="ts">
    import { page } from '$app/stores';
    import { getCurrentTime } from '$lib/utils/datetime';
    import { onMount, onDestroy } from 'svelte';
    
    $: currentPath = $page.url.pathname;
    
    let currentTime = getCurrentTime();
    let timeInterval: number;
    
    const navItems = [
        { 
            href: '/dashboard', 
            label: 'Dashboard', 
            icon: '📊',
            description: 'System Dashboard'
        },
        { 
            href: '/bot-management', 
            label: 'Bot Management', 
            icon: '🤖',
            description: 'Scraping kontrollieren'
        },
        { 
            href: '/news-flash', 
            label: 'News Flash', 
            icon: '📰',
            description: 'Live News anzeigen'
        },
        { 
            href: '/qr-proxy', 
            label: 'QR-Code Proxy', 
            icon: '🔗',
            description: 'QR-Code Management'
        },
        { 
            href: '/db-admin', 
            label: 'Database Admin', 
            icon: '🗄️',
            description: 'Datenbank verwalten'
        }
    ];
    
    // Seiten-spezifische Titel und Infos
    $: pageInfo = getPageInfo(currentPath);
    
    function getPageInfo(path) {
        switch (path) {
            case '/dashboard':
                return {
                    title: 'System Dashboard',
                    subtitle: 'Plugin-Verwaltung und Systemübersicht',
                    showTime: true
                };
            case '/bot-management':
                return {
                    title: 'Bot Management', 
                    subtitle: 'Scraping Control Panel',
                    showTime: true
                };
            case '/news-flash':
                return {
                    title: 'News Flash',
                    subtitle: 'Live News Updates',
                    showTime: true
                };
            case '/qr-proxy':
                return {
                    title: 'QR-Code Proxy',
                    subtitle: 'QR-Code Management Dashboard',
                    showTime: true
                };
            case '/db-admin':
                return {
                    title: 'Database Admin',
                    subtitle: 'Datenbank-Verwaltungsinterface',
                    showTime: true
                };
            default:
                return {
                    title: 'Spatzenzentrale',
                    subtitle: 'Backend Administration',
                    showTime: true
                };
        }
    }
    
    function updateTime() {
        currentTime = getCurrentTime();
    }
    
    onMount(() => {
        timeInterval = window.setInterval(updateTime, 1000);
        return () => {
            if (timeInterval) clearInterval(timeInterval);
        };
    });
    
    onDestroy(() => {
        if (timeInterval) clearInterval(timeInterval);
    });
</script>

<nav class="bg-white shadow-sm border-b">
    <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
            <!-- Dynamic Logo/Title -->
            <div class="flex items-center space-x-4">
                <a href="/" class="text-2xl font-bold transition-colors duration-200"
                   class:text-gray-800={currentPath === '/'}
                   class:text-blue-600={currentPath === '/dashboard'}
                   class:text-purple-600={currentPath === '/bot-management'}>
                    {pageInfo.title}
                </a>
                <div class="hidden sm:block">
                    <p class="text-sm text-gray-500">{pageInfo.subtitle}</p>
                </div>
            </div>
            
            <!-- Navigation Links -->
            <div class="flex items-center space-x-1">
                {#each navItems as item}
                    <a 
                        href={item.href}
                        class="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                        class:bg-blue-100={currentPath === item.href}
                        class:text-blue-800={currentPath === item.href}
                        class:text-gray-600={currentPath !== item.href}
                        class:hover:bg-gray-100={currentPath !== item.href}
                        title={item.description}
                    >
                        <span class="text-lg">{item.icon}</span>
                        <span class="hidden md:inline">{item.label}</span>
                    </a>
                {/each}
            </div>
            
            <!-- Right Side: Time + Status -->
            <div class="flex items-center space-x-4">
                {#if pageInfo.showTime}
                    <div class="font-mono text-lg font-semibold text-purple-600">
                        {currentTime}
                    </div>
                {/if}
                <div class="flex items-center space-x-2 text-xs text-gray-500">
                    <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span class="hidden lg:inline">System Online</span>
                </div>
            </div>
        </div>
    </div>
</nav>
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'UMP Mentorship Portal')</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
    <x-head-assets />
</head>
<body class="min-h-screen bg-[var(--ump-page-gray)] font-sans text-[var(--ump-text-dark)]">
    <x-navigation :current="$currentNav ?? 'dashboard'" :portal="$portal ?? null" :admin-user="$adminUser ?? null" />

    @php($hasSidebar = !empty($sidebarItems ?? []))
    <div class="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:px-8 {{ $hasSidebar ? 'lg:grid-cols-[240px,1fr]' : '' }}">
        @if ($hasSidebar)
            <x-sidebar :title="$sidebarTitle ?? 'Portal Modules'" :items="$sidebarItems" />
        @endif

        <main class="space-y-6">
            @yield('content')
        </main>
    </div>
</body>
</html>

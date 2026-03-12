@props([
    'title' => 'Portal Modules',
    'items' => [],
])

<aside class="ump-sidebar h-fit p-4">
    <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">{{ $title }}</h2>
    <nav class="space-y-1">
        @foreach ($items as $item)
            <a
                href="{{ $item['route'] }}"
                class="ump-focusable block rounded-md px-3 py-2 text-sm transition {{ ($item['active'] ?? false) ? 'bg-[var(--ump-accent-gold)] text-[var(--ump-text-dark)] font-semibold' : 'text-[var(--ump-text-dark)] hover:bg-[var(--ump-page-gray)]' }}"
            >
                {{ $item['label'] }}
            </a>
        @endforeach
    </nav>
</aside>

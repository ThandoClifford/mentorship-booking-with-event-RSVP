@props([
    'title',
    'subtitle' => null,
])

<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
        <h1 class="text-2xl font-semibold tracking-tight text-[var(--ump-text-dark)]">{{ $title }}</h1>
        @if ($subtitle)
            <p class="mt-1 text-sm ump-muted">{{ $subtitle }}</p>
        @endif
    </div>

    @if (! $slot->isEmpty())
        <div class="flex flex-wrap items-center gap-2">
            {{ $slot }}
        </div>
    @endif
</div>

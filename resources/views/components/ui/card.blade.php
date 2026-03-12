@props([
    'title' => null,
    'subtitle' => null,
])

<section {{ $attributes->merge(['class' => 'ump-card p-5']) }}>
    @if ($title)
        <div class="mb-4">
            <h2 class="text-base font-semibold text-[var(--ump-text-dark)]">{{ $title }}</h2>
            @if ($subtitle)
                <p class="mt-1 text-sm ump-muted">{{ $subtitle }}</p>
            @endif
        </div>
    @endif

    {{ $slot }}
</section>

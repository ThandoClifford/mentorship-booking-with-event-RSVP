@props([
    'variant' => 'primary',
    'type' => 'button',
])

@php
    $variantClass = match ($variant) {
        'secondary' => 'ump-btn-secondary',
        'destructive' => 'ump-btn-destructive',
        default => 'ump-btn-primary',
    };
@endphp

<button type="{{ $type }}" {{ $attributes->merge(['class' => "ump-btn {$variantClass} ump-focusable"]) }}>
    {{ $slot }}
</button>

@php
    $manifestPath = public_path('build/manifest.json');
    $hotPath = public_path('hot');

    $hasHotFile = file_exists($hotPath);
    $hasManifest = file_exists($manifestPath);

    $cssFile = null;
    $jsFile = null;

    if ($hasManifest) {
        $manifest = json_decode((string) file_get_contents($manifestPath), true);
        if (is_array($manifest)) {
            $cssFile = $manifest['resources/css/app.css']['file'] ?? null;
            $jsFile = $manifest['resources/js/app.js']['file'] ?? null;
        }
    }
@endphp

@if ($hasHotFile)
    @vite(['resources/css/app.css', 'resources/js/app.js'])
@elseif ($hasManifest)
    @if ($cssFile)
        <link rel="stylesheet" href="{{ asset('build/'.$cssFile) }}">
    @endif
    @if ($jsFile)
        <script type="module" src="{{ asset('build/'.$jsFile) }}"></script>
    @endif
@else
    <!-- Vite assets are not built yet. Run npm run dev or npm run build. -->
@endif

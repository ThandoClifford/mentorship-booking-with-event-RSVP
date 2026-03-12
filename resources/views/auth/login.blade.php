<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sign In | UMP Mentorship Portal</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
    <x-head-assets />
</head>
<body class="min-h-screen bg-[var(--ump-page-gray)] font-sans text-[var(--ump-text-dark)]">
    <header class="border-b border-[var(--ump-border)] bg-white">
        <div class="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
            <a href="{{ route('dashboard') }}" class="ump-focusable inline-flex" aria-label="Go to home">
                @if (file_exists(public_path('images/ump-logo.png')))
                    <img src="{{ asset('images/ump-logo.png') }}" alt="University of Mpumalanga" class="h-14 w-auto rounded bg-white px-2 py-1 md:h-16">
                @else
                    <span class="text-sm font-semibold text-[var(--ump-primary-navy)]">UMP UMPCFERI Mentorship Portal</span>
                @endif
            </a>
        </div>
    </header>

    <div class="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10">
        <section class="ump-card w-full max-w-md p-6 sm:p-8">
            <div class="mb-5 text-center">
                @if (file_exists(public_path('images/ump-logo.png')))
                    <div class="mb-3 flex justify-center">
                        <img src="{{ asset('images/ump-logo.png') }}" alt="University of Mpumalanga" class="h-16 w-auto">
                    </div>
                @endif
                <p class="text-xl font-semibold text-[var(--ump-primary-navy)]">User Sign In</p>
                <p class="mt-1 text-sm ump-muted">Sign in as a mentee, mentor, or admin.</p>
            </div>

            @if (session('status'))
                <div class="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                    {{ session('status') }}
                </div>
            @endif

            @if ($errors->any())
                <div class="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    <ul class="list-disc space-y-1 pl-5">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <form method="POST" action="{{ route('login.attempt') }}" class="grid gap-4">
                @csrf
                <div>
                    <label for="email" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Email</label>
                    <input id="email" name="email" type="email" value="{{ old('email') }}" class="ump-focusable w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" required>
                </div>
                <div>
                    <label for="password" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Password</label>
                    <input id="password" name="password" type="password" class="ump-focusable w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" required>
                </div>
                <x-ui.button type="submit" class="w-full">Sign In</x-ui.button>
            </form>

            <div class="mt-4 grid gap-2 text-sm">
                <a href="{{ route('password.request') }}" class="ump-focusable text-center font-medium text-[var(--ump-deep-blue)] hover:underline">Forgot password?</a>
                <a href="{{ route('register') }}" class="ump-focusable text-center font-medium text-[var(--ump-deep-blue)] hover:underline">Create an account</a>
            </div>

            <div class="my-4 flex items-center gap-3">
                <span class="h-px flex-1 bg-[var(--ump-border)]"></span>
                <span class="text-xs uppercase tracking-wide ump-muted">or continue with</span>
                <span class="h-px flex-1 bg-[var(--ump-border)]"></span>
            </div>

            <div class="grid gap-2 sm:grid-cols-2">
                <a href="{{ route('oauth.redirect', ['provider' => 'google']) }}" class="ump-focusable inline-flex items-center justify-center rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--ump-text-dark)] transition hover:bg-[var(--ump-page-gray)]">Google</a>
                <a href="{{ route('oauth.redirect', ['provider' => 'facebook']) }}" class="ump-focusable inline-flex items-center justify-center rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--ump-text-dark)] transition hover:bg-[var(--ump-page-gray)]">Facebook</a>
            </div>
        </section>
    </div>
</body>
</html>

@props(['current' => 'dashboard', 'portal' => null, 'adminUser' => null])

@php
    $showMainNav = in_array($portal, ['student', 'mentor', 'admin'], true);
    $portalUser = request()->attributes->get('portal_user');
    $logoHomeRoute = match ($portal) {
        'admin' => route('admin.index'),
        'mentor' => route('mentor.index'),
        'student' => route('student.index'),
        default => route('dashboard'),
    };
    $partners = [
        ['file' => 'partner-standard-bank.png', 'label' => 'Standard Bank'],
        ['file' => 'partner-sedfa.png', 'label' => 'SEDFA'],
        ['file' => 'partner-old-mutual.png', 'label' => 'Old Mutual'],
        ['file' => 'partner-absa.png', 'label' => 'ABSA'],
        ['file' => 'partner-nyda.png', 'label' => 'NYDA'],
    ];
@endphp

<header class="w-full bg-[var(--ump-white)] shadow-sm">
    <div class="ump-top-header">
        <div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:px-8">
            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div class="flex w-full flex-wrap items-center gap-4 md:flex-nowrap md:gap-6">
                    @if (file_exists(public_path('images/ump-logo.png')))
                        <a href="{{ $logoHomeRoute }}" class="ump-focusable inline-flex shrink-0" aria-label="Go to home">
                            <img
                                src="{{ asset('images/ump-logo.png') }}"
                                alt="University of Mpumalanga"
                                class="h-14 w-auto md:h-16"
                            >
                        </a>
                    @endif

                    <div class="ump-partner-marquee flex-1 bg-white py-0">
                        <div class="ump-partner-marquee-track">
                            @foreach ([1, 2] as $copy)
                                @if ($copy === 2)
                                    <div class="ump-partner-marquee-set" aria-hidden="true">
                                @else
                                    <div class="ump-partner-marquee-set">
                                @endif
                                    @foreach ($partners as $partner)
                                        @php
                                            $path = 'images/'.$partner['file'];
                                        @endphp
                                        <div class="ump-partner-marquee-item">
                                            @if (file_exists(public_path($path)))
                                                <img
                                                    src="{{ asset($path) }}"
                                                    alt="{{ $partner['label'] }}"
                                                    class="h-10 w-auto md:h-12"
                                                >
                                            @else
                                                <span class="rounded bg-[var(--ump-page-gray)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ump-text-dark)]">{{ $partner['label'] }}</span>
                                            @endif
                                        </div>
                                    @endforeach
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>

            </div>

        </div>
    </div>

    @if ($showMainNav)
        <nav class="ump-main-nav">
            <div class="mx-auto max-w-7xl px-4 lg:px-8">
                <div class="flex flex-wrap items-center gap-1 py-2 text-sm">
                    @if ($portal === 'admin')
                        <details class="relative">
                            <summary class="ump-focusable flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-md border border-white/30 bg-white text-base font-semibold text-[var(--ump-primary-navy)]">
                                ☰
                            </summary>
                            <div class="absolute left-0 z-30 mt-2 w-56 rounded-lg border border-[var(--ump-border)] bg-white p-3 text-[var(--ump-text-dark)] shadow-lg">
                                <p class="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Admin Sections</p>
                                <div class="space-y-1 text-sm">
                                    <a href="{{ route('admin.index') }}#admin-overview" class="ump-focusable block rounded-md px-2 py-2 hover:bg-[var(--ump-surface)]">Admin Overview</a>
                                    <a href="{{ route('admin.index') }}#mentor-verification" class="ump-focusable block rounded-md px-2 py-2 hover:bg-[var(--ump-surface)]">Mentor Verification</a>
                                    <a href="{{ route('admin.index') }}#mentors-availability" class="ump-focusable block rounded-md px-2 py-2 hover:bg-[var(--ump-surface)]">Mentors & Availability</a>
                                    <a href="{{ route('admin.index') }}#upcoming-appointments" class="ump-focusable block rounded-md px-2 py-2 hover:bg-[var(--ump-surface)]">Upcoming Appointments</a>
                                    <a href="{{ route('admin.index') }}#announcements" class="ump-focusable block rounded-md px-2 py-2 hover:bg-[var(--ump-surface)]">Announcements</a>
                                    <a href="{{ route('admin.index') }}#centre-events" class="ump-focusable block rounded-md px-2 py-2 hover:bg-[var(--ump-surface)]">Centre Events</a>
                                </div>
                            </div>
                        </details>
                    @endif

                    @if ($portal === 'student')
                        <a href="{{ route('student.index') }}#browse-slots" class="ump-focusable ump-nav-link rounded-md px-3 py-2 ump-nav-link-active">Browse Slots</a>
                        <span class="px-1 text-white/60">|</span>
                        <a href="{{ route('student.index') }}#my-appointments" class="ump-focusable ump-nav-link rounded-md px-3 py-2">My Appointments</a>
                    @elseif ($portal === 'mentor')
                        <a href="{{ route('mentor.index') }}" class="ump-focusable ump-nav-link rounded-md px-3 py-2 ump-nav-link-active">Mentor Portal</a>
                    @endif

                    @if (in_array($portal, ['admin', 'student', 'mentor'], true))
                        @php
                            $profileUser = $portal === 'admin' ? $adminUser : $portalUser;
                            $profileRole = $portal === 'admin'
                                ? (isset($adminUser)
                                    ? ($adminUser->role instanceof \App\Enums\UserRole ? $adminUser->role->value : (string) $adminUser->role)
                                    : 'admin')
                                : ($portal ?: 'user');
                            $logoutRoute = $portal === 'admin' ? route('admin.logout') : route('logout');
                        @endphp
                        <div class="ml-auto">
                            <details class="relative">
                                <summary class="ump-focusable flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-white/30 bg-white text-xs font-semibold text-[var(--ump-primary-navy)]">
                                    {{ isset($profileUser) ? strtoupper(substr($profileUser->name, 0, 1)) : strtoupper(substr((string) $profileRole, 0, 1)) }}
                                </summary>
                                <div class="absolute right-0 z-30 mt-2 w-64 rounded-lg border border-[var(--ump-border)] bg-white p-4 text-[var(--ump-text-dark)] shadow-lg">
                                    <p class="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">{{ strtoupper((string) $profileRole) }} Profile</p>
                                    <div class="mt-2 space-y-1 text-sm">
                                        <p><span class="font-semibold text-[var(--ump-primary-navy)]">Name:</span> {{ $profileUser->name ?? 'Portal User' }}</p>
                                        <p><span class="font-semibold text-[var(--ump-primary-navy)]">Email:</span> {{ $profileUser->email ?? '-' }}</p>
                                        <p><span class="font-semibold text-[var(--ump-primary-navy)]">Role:</span> {{ strtoupper((string) $profileRole) }}</p>
                                    </div>

                                    <form method="POST" action="{{ $logoutRoute }}" class="mt-3">
                                        @csrf
                                        <button type="submit" class="ump-focusable inline-flex w-full items-center justify-center rounded-md bg-[var(--ump-surface)] px-3 py-2 text-sm font-medium text-[var(--ump-text-dark)] transition hover:bg-slate-200">Logout</button>
                                    </form>
                                </div>
                            </details>
                        </div>
                    @endif
                </div>
            </div>
        </nav>
    @endif
</header>

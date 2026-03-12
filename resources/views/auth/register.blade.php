<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Register | UMP Mentorship Portal</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
    <x-head-assets />
</head>
<body class="min-h-screen bg-[var(--ump-page-gray)] font-sans text-[var(--ump-text-dark)]">
    @php
        $partners = [
            ['file' => 'partner-standard-bank.png', 'label' => 'Standard Bank'],
            ['file' => 'partner-sedfa.png', 'label' => 'SEDFA'],
            ['file' => 'partner-old-mutual.png', 'label' => 'Old Mutual'],
            ['file' => 'partner-absa.png', 'label' => 'ABSA'],
            ['file' => 'partner-nyda.png', 'label' => 'NYDA'],
        ];
    @endphp

    <header class="border-b border-[var(--ump-border)] bg-[var(--ump-primary-navy)]">
        <div class="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-3">
            <a href="{{ route('dashboard') }}" class="ump-focusable inline-flex" aria-label="Go to home">
                @if (file_exists(public_path('images/ump-logo.png')))
                    <img src="{{ asset('images/ump-logo.png') }}" alt="University of Mpumalanga" class="h-14 w-auto rounded bg-white px-2 py-1 md:h-16">
                @else
                    <span class="text-sm font-semibold text-[var(--ump-white)]">UMP UMPCFERI Mentorship Portal</span>
                @endif
            </a>

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

            <a href="{{ route('login') }}" class="ump-btn ump-btn-primary ump-focusable px-3 py-2 text-sm">Back to Sign In</a>
        </div>
    </header>

    <div class="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10">
        <section class="ump-card w-full max-w-md p-6 sm:p-8">
            <div class="mb-5 text-center">
                <p class="text-xl font-semibold text-[var(--ump-primary-navy)]">Create Account</p>
                <p class="mt-1 text-sm ump-muted">Register as a mentee or mentor.</p>
                <p class="mt-1 text-xs ump-muted">Mentor accounts require admin verification before mentor portal access.</p>
            </div>

            @if ($errors->any())
                <div class="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    <ul class="list-disc space-y-1 pl-5">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <form method="POST" action="{{ route('register.submit') }}" enctype="multipart/form-data" class="grid gap-4">
                @csrf
                <div>
                    <label for="name" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Name</label>
                    <input id="name" name="name" type="text" value="{{ old('name') }}" class="ump-focusable w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" required>
                </div>
                <div>
                    <label for="email" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Email</label>
                    <input id="email" name="email" type="email" value="{{ old('email') }}" class="ump-focusable w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" required>
                </div>
                <div>
                    <label for="role" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Role</label>
                    <select id="role" name="role" class="ump-focusable w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" required>
                        <option value="student" {{ old('role') === 'student' ? 'selected' : '' }}>Mentee</option>
                        <option value="mentor" {{ old('role') === 'mentor' ? 'selected' : '' }}>Mentor</option>
                    </select>
                </div>
                <div id="faculty_field_wrapper" class="{{ old('role') === 'mentor' ? '' : 'hidden' }}">
                    <label for="faculty" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Faculty</label>
                    <input id="faculty" name="faculty" type="text" value="{{ old('faculty') }}" placeholder="e.g. Faculty of Agriculture and Natural Sciences" class="ump-focusable w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" {{ old('role') === 'mentor' ? 'required' : '' }}>
                    <p class="mt-1 text-xs ump-muted">Required for mentor signup.</p>
                </div>
                <div id="profile_photo_wrapper" class="{{ old('role') === 'mentor' ? '' : 'hidden' }}">
                    <label for="profile_photo" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Profile Photo</label>
                    <input id="profile_photo" name="profile_photo" type="file" accept="image/*" class="ump-focusable w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" {{ old('role') === 'mentor' ? 'required' : '' }}>
                    <p class="mt-1 text-xs ump-muted">Required for mentor signup. Max 4MB.</p>
                </div>
                <div>
                    <label for="password" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Password</label>
                    <input id="password" name="password" type="password" class="ump-focusable w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" required>
                </div>
                <div>
                    <label for="password_confirmation" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Confirm Password</label>
                    <input id="password_confirmation" name="password_confirmation" type="password" class="ump-focusable w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" required>
                </div>
                <x-ui.button type="submit" class="w-full">Register</x-ui.button>
            </form>
        </section>
    </div>

    <script>
        (function () {
            const roleSelect = document.getElementById('role');
            const facultyWrapper = document.getElementById('faculty_field_wrapper');
            const facultyInput = document.getElementById('faculty');
            const photoWrapper = document.getElementById('profile_photo_wrapper');
            const photoInput = document.getElementById('profile_photo');

            if (!roleSelect || !facultyWrapper || !facultyInput || !photoWrapper || !photoInput) {
                return;
            }

            const syncFacultyVisibility = () => {
                const isMentor = roleSelect.value === 'mentor';
                facultyWrapper.classList.toggle('hidden', !isMentor);
                facultyInput.required = isMentor;
                photoWrapper.classList.toggle('hidden', !isMentor);
                photoInput.required = isMentor;

                if (!isMentor) {
                    facultyInput.value = '';
                    photoInput.value = '';
                }
            };

            roleSelect.addEventListener('change', syncFacultyVisibility);
            syncFacultyVisibility();
        })();
    </script>
</body>
</html>

@extends('layouts.app')

@section('title', 'Admin Portal | UMP Mentorship Portal')

@section('content')
    @php
        $openAnnouncementForm = old('title') || old('type') || old('message') || old('published_on');
        $openCentreEventForm = old('event_title') || old('event_category') || old('event_date') || old('event_time') || old('event_venue');
    @endphp

    <x-ui.page-header title="Admin" />

    @if (session('status'))
        <x-ui.card class="border-green-200 bg-green-50">
            <p class="text-sm font-medium text-green-800">{{ session('status') }}</p>
        </x-ui.card>
    @endif

    @if ($errors->any())
        <x-ui.card class="border-red-200 bg-red-50">
            <ul class="list-disc space-y-1 pl-5 text-sm text-red-700">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </x-ui.card>
    @endif

    <x-ui.card id="admin-overview" title="Admin Overview" subtitle="Quick summary of portal operations.">
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-md border border-[var(--ump-border)] bg-white p-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Mentors</p>
                <p class="mt-1 text-2xl font-semibold text-[var(--ump-primary-navy)]">{{ $mentors->count() }}</p>
            </div>
            <div class="rounded-md border border-[var(--ump-border)] bg-white p-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Availability Windows</p>
                <p class="mt-1 text-2xl font-semibold text-[var(--ump-primary-navy)]">{{ $availabilitiesByMentor->flatten(1)->count() }}</p>
            </div>
            <div class="rounded-md border border-[var(--ump-border)] bg-white p-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Upcoming Appointments</p>
                <p class="mt-1 text-2xl font-semibold text-[var(--ump-primary-navy)]">{{ $upcomingAppointments->count() }}</p>
            </div>
            <div class="rounded-md border border-[var(--ump-border)] bg-white p-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Announcements</p>
                <p class="mt-1 text-2xl font-semibold text-[var(--ump-primary-navy)]">{{ ($announcements ?? collect())->count() }}</p>
            </div>
        </div>
    </x-ui.card>

    <x-ui.card id="mentor-verification" title="Mentors Waiting Verification" subtitle="Approve mentor profiles before they can access the mentor portal.">
        @if (! ($mentorVerificationEnabled ?? false))
            <div class="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Mentor verification schema is not applied yet. Run migrations to enable this feature.
            </div>
        @endif
        <div class="space-y-3">
            @forelse (($pendingMentorVerifications ?? collect()) as $pendingMentor)
                <div class="flex flex-col gap-3 rounded-md border border-[var(--ump-border)] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm font-semibold text-[var(--ump-primary-navy)]">{{ $pendingMentor->name }}</p>
                        <p class="text-xs ump-muted">{{ $pendingMentor->email }} · Signed up {{ optional($pendingMentor->created_at)->format('Y-m-d H:i') }}</p>
                    </div>
                    <form method="POST" action="{{ route('admin.mentors.verify', $pendingMentor->id) }}">
                        @csrf
                        <x-ui.button type="submit" class="!px-3 !py-1.5 !text-xs">Verify Mentor</x-ui.button>
                    </form>
                </div>
            @empty
                <p class="text-sm ump-muted">No mentors are waiting for verification.</p>
            @endforelse
        </div>
    </x-ui.card>

    <x-ui.card id="mentors-availability" title="Mentors and Availability" subtitle="Manage existing mentors and edit their availability windows.">
        <div class="space-y-5">
            @forelse ($mentors as $mentor)
                @php
                    $mentorAvailabilities = $availabilitiesByMentor->get($mentor->id, collect());
                    $isMentorAvailable = (bool) (($mentorLiveStatus ?? collect())->get($mentor->id, false));
                @endphp
                <div class="rounded-lg border border-[var(--ump-border)] p-4">
                    <div class="mb-3">
                        <div class="flex items-center justify-between gap-2">
                            <h3 class="text-base font-semibold text-[var(--ump-primary-navy)]">{{ $mentor->name }}</h3>
                            <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide {{ $isMentorAvailable ? 'bg-green-700 text-white' : 'border border-green-700 bg-white text-green-700' }}">
                                {{ $isMentorAvailable ? 'Available' : 'Unavailable' }}
                            </span>
                        </div>
                        <p class="text-sm ump-muted">{{ $mentor->email }} · Faculty: {{ $mentor->faculty ?: 'Not specified' }} · Added {{ optional($mentor->created_at)->format('Y-m-d') }}</p>
                    </div>

                    @if ($mentorAvailabilities->isEmpty())
                        <p class="text-sm ump-muted">No availability windows yet.</p>
                    @else
                        <div class="space-y-3">
                            @foreach ($mentorAvailabilities as $availability)
                                <details class="rounded-md border border-[var(--ump-border)] bg-white p-3">
                                    <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-[var(--ump-text-dark)]">
                                        <span>
                                            {{ ucfirst($availability->day_of_week) }} · {{ \Carbon\Carbon::parse($availability->start_time)->format('H:i') }} - {{ \Carbon\Carbon::parse($availability->end_time)->format('H:i') }}
                                        </span>
                                    </summary>

                                    <div class="mt-3 grid gap-2 border-t border-[var(--ump-border)] pt-3 sm:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Day</label>
                                            <p class="rounded-md border border-[var(--ump-border)] bg-[var(--ump-page-gray)] px-2 py-1.5 text-sm text-[var(--ump-text-dark)]">
                                                {{ ucfirst($availability->day_of_week) }}
                                            </p>
                                        </div>
                                        <div>
                                            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Start</label>
                                            <p class="rounded-md border border-[var(--ump-border)] bg-[var(--ump-page-gray)] px-2 py-1.5 text-sm text-[var(--ump-text-dark)]">
                                                {{ \Carbon\Carbon::parse($availability->start_time)->format('H:i') }}
                                            </p>
                                        </div>
                                        <div>
                                            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">End</label>
                                            <p class="rounded-md border border-[var(--ump-border)] bg-[var(--ump-page-gray)] px-2 py-1.5 text-sm text-[var(--ump-text-dark)]">
                                                {{ \Carbon\Carbon::parse($availability->end_time)->format('H:i') }}
                                            </p>
                                        </div>
                                        <div>
                                            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Status</label>
                                            <p>
                                                <span class="inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide {{ $availability->is_active ? 'bg-green-700 text-white' : 'border border-green-700 bg-white text-green-700' }}">
                                                    {{ $availability->is_active ? 'Available' : 'Unavailable' }}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </details>
                            @endforeach
                        </div>
                    @endif
                </div>
            @empty
                <p class="text-sm ump-muted">No mentors found. Add a mentor above to begin.</p>
            @endforelse
        </div>
    </x-ui.card>

    <x-ui.card id="upcoming-appointments" title="Upcoming Appointments" subtitle="Admin-only scheduling overview.">
        <div class="overflow-x-auto">
            <table class="ump-table min-w-[760px]">
                <thead>
                    <tr>
                        <th>Mentee</th>
                        <th>Mentor</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($upcomingAppointments as $appointment)
                        <tr>
                            <td>{{ optional($appointment->student)->name ?? '-' }}</td>
                            <td>{{ optional($appointment->mentor)->name ?? '-' }}</td>
                            <td>{{ optional($appointment->timeSlot)->date ? \Carbon\Carbon::parse($appointment->timeSlot->date)->format('Y-m-d') : '-' }}</td>
                            <td>
                                @if ($appointment->timeSlot)
                                    {{ \Carbon\Carbon::parse($appointment->timeSlot->start_time)->format('H:i') }}
                                @else
                                    -
                                @endif
                            </td>
                            <td>{{ ucfirst($appointment->status) }}</td>
                            <td>
                                <div class="flex flex-wrap gap-2">
                                    @if ($appointment->status === 'pending')
                                        <form method="POST" action="{{ route('admin.appointments.approve', $appointment->id) }}">
                                            @csrf
                                            <x-ui.button type="submit" class="!px-3 !py-1.5 !text-xs">Approve</x-ui.button>
                                        </form>
                                    @endif
                                    <a
                                        href="{{ route('admin.appointments.show', $appointment->id) }}"
                                        class="ump-focusable inline-flex items-center justify-center rounded-md border border-[var(--ump-border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--ump-text-dark)] transition hover:bg-[var(--ump-page-gray)]"
                                    >
                                        View
                                    </a>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="ump-muted">No upcoming appointments found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </x-ui.card>

    <x-ui.card id="announcements" title="Announcements" subtitle="Latest admin notices.">
        <details class="mb-4 rounded-md border border-[var(--ump-border)] bg-white p-3" @if($openAnnouncementForm) open @endif>
            <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[var(--ump-primary-navy)]">
                <span>Add Announcement</span>
                <span class="rounded-full bg-[var(--ump-page-gray)] px-2 py-0.5 text-xs text-[var(--ump-text-dark)]">Click</span>
            </summary>

            <form method="POST" action="{{ route('admin.announcements.store') }}" class="mt-3 grid gap-3 border-t border-[var(--ump-border)] pt-3">
                @csrf
                <div>
                    <label for="announcement_title" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Title</label>
                    <input id="announcement_title" name="title" type="text" value="{{ old('title') }}" class="ump-focusable w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" required>
                </div>
                <div>
                    <label for="announcement_type" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Type</label>
                    <input id="announcement_type" name="type" type="text" value="{{ old('type') }}" placeholder="Campaign / Maintenance / Deadline" class="ump-focusable w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" required>
                </div>
                <div>
                    <label for="announcement_message" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Message</label>
                    <textarea id="announcement_message" name="message" rows="4" class="ump-focusable w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" required>{{ old('message') }}</textarea>
                </div>
                <div>
                    <label for="announcement_date" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Date</label>
                    <input id="announcement_date" name="published_on" type="date" value="{{ old('published_on') }}" class="ump-focusable w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" required>
                </div>
                <x-ui.button type="submit">Add Announcement</x-ui.button>
            </form>
        </details>

        <div class="space-y-3">
                @forelse (($announcements ?? collect()) as $announcement)
                    <div class="rounded-md border border-[var(--ump-border)] p-3">
                        <div class="mb-1 flex items-center justify-between gap-3">
                            <p class="text-sm font-semibold text-[var(--ump-primary-navy)]">{{ $announcement->title }}</p>
                            <span class="text-xs ump-muted">{{ $announcement->type }}</span>
                        </div>
                        <p class="text-sm text-[var(--ump-text-dark)]">{{ $announcement->message }}</p>
                        <div class="mt-2 flex items-center justify-between gap-3">
                            <p class="text-xs ump-muted">{{ optional($announcement->published_on)->format('Y-m-d') ?? '-' }}</p>
                            <form method="POST" action="{{ route('admin.announcements.delete', $announcement->id) }}">
                                @csrf
                                <button type="submit" class="ump-btn ump-btn-destructive !px-3 !py-1.5 !text-xs">Delete</button>
                            </form>
                        </div>
                    </div>
                @empty
                    <p class="text-sm ump-muted">No announcements yet. Add one using the form.</p>
                @endforelse
        </div>
    </x-ui.card>

    <x-ui.card id="centre-events" title="Centre Events" subtitle="Manage events shown in Upcoming Centre Events on the home page.">
        <details class="mb-4 rounded-md border border-[var(--ump-border)] bg-white p-3" @if($openCentreEventForm) open @endif>
            <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[var(--ump-primary-navy)]">
                <span>Add Centre Event</span>
                <span class="rounded-full bg-[var(--ump-page-gray)] px-2 py-0.5 text-xs text-[var(--ump-text-dark)]">Click</span>
            </summary>

            <form method="POST" action="{{ route('admin.centre-events.store') }}" class="mt-3 grid gap-3 border-t border-[var(--ump-border)] pt-3 sm:grid-cols-2">
                @csrf
                <div class="sm:col-span-2">
                    <label for="event_title" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Event</label>
                    <input id="event_title" name="event_title" type="text" value="{{ old('event_title') }}" class="ump-focusable w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" required>
                </div>
                <div>
                    <label for="event_date" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Date</label>
                    <input id="event_date" name="event_date" type="date" value="{{ old('event_date') }}" class="ump-focusable w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" required>
                </div>
                <div>
                    <label for="event_time" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Time</label>
                    <input id="event_time" name="event_time" type="time" value="{{ old('event_time') }}" class="ump-focusable w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" required>
                </div>
                <div>
                    <label for="event_venue" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Venue</label>
                    <input id="event_venue" name="event_venue" type="text" value="{{ old('event_venue') }}" class="ump-focusable w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" required>
                </div>
                <div>
                    <label for="event_category" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Category</label>
                    <input id="event_category" name="event_category" type="text" value="{{ old('event_category') }}" class="ump-focusable w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm" required>
                </div>
                <div class="sm:col-span-2">
                    <x-ui.button type="submit">Add Centre Event</x-ui.button>
                </div>
            </form>
        </details>

        <div class="space-y-3">
            @forelse (($centreEvents ?? collect()) as $event)
                <div class="rounded-md border border-[var(--ump-border)] p-3">
                    <div class="mb-1 flex items-center justify-between gap-3">
                        <p class="text-sm font-semibold text-[var(--ump-primary-navy)]">{{ $event->title }}</p>
                        <span class="text-xs ump-muted">{{ $event->category }}</span>
                    </div>
                    <p class="text-sm text-[var(--ump-text-dark)]">{{ optional($event->event_date)->format('Y-m-d') ?? '-' }} · {{ $event->event_time ? substr((string) $event->event_time, 0, 5) : '-' }} · {{ $event->venue }}</p>
                    <div class="mt-2 flex items-center justify-end">
                        <form method="POST" action="{{ route('admin.centre-events.delete', $event->id) }}">
                            @csrf
                            <button type="submit" class="ump-btn ump-btn-destructive !px-3 !py-1.5 !text-xs">Delete</button>
                        </form>
                    </div>
                </div>
            @empty
                <p class="text-sm ump-muted">No centre events yet. Add one using the form.</p>
            @endforelse
        </div>
    </x-ui.card>
@endsection

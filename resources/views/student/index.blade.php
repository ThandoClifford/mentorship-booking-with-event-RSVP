@extends('layouts.app')

@section('title', 'Mentee Portal | UMP Mentorship Portal')

@section('content')
    <x-ui.page-header title="Mentee Portal" subtitle="View mentors, check availability, and book a mentorship slot." />

    @if (session('status'))
        <div
            id="status-toast"
            class="fixed right-4 top-4 z-50 max-w-sm rounded-lg border border-green-200 bg-green-50 px-4 py-3 shadow-lg transition-opacity duration-500"
            role="status"
            aria-live="polite"
        >
            <p class="text-sm font-medium text-green-800">{{ session('status') }}</p>
        </div>
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

    <div class="grid gap-4 lg:grid-cols-[280px,1fr]">
        <x-ui.card title="Mentors" subtitle="Select a mentor to view availability and slots.">
            <div class="space-y-2">
                @forelse ($mentors as $mentor)
                    @php
                        $isMentorAvailable = (bool) (($mentorLiveStatus ?? collect())->get($mentor->id, false));
                    @endphp
                    <a
                        href="{{ route('student.index', ['mentor_id' => $mentor->id]) }}"
                        class="ump-focusable block rounded-md border px-3 py-2 text-sm transition {{ $selectedMentorId === $mentor->id ? 'border-[var(--ump-accent-gold)] bg-[var(--ump-accent-gold)]/20 text-[var(--ump-text-dark)] font-semibold' : 'border-[var(--ump-border)] text-[var(--ump-text-dark)] hover:bg-[var(--ump-page-gray)]' }}"
                    >
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex items-center gap-2">
                                @if (!empty($mentor->profile_photo_path))
                                    <img src="{{ Storage::url($mentor->profile_photo_path) }}" alt="{{ $mentor->name }} profile" class="h-10 w-10 rounded-full border border-[var(--ump-border)] object-cover">
                                @else
                                    <div class="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--ump-border)] bg-[var(--ump-page-gray)] text-xs font-semibold text-[var(--ump-primary-navy)]">
                                        {{ strtoupper(substr($mentor->name, 0, 1)) }}
                                    </div>
                                @endif
                                <p>{{ $mentor->name }}</p>
                            </div>
                            <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide {{ $isMentorAvailable ? 'bg-green-700 text-white' : 'border border-green-700 bg-white text-green-700' }}">
                                {{ $isMentorAvailable ? 'Available' : 'Unavailable' }}
                            </span>
                        </div>
                        <p class="text-xs ump-muted">Faculty: {{ $mentor->faculty ?: 'Not specified' }}</p>
                        <p class="text-xs ump-muted">{{ $mentor->email }}</p>
                    </a>
                @empty
                    <p class="text-sm ump-muted">No mentors found.</p>
                @endforelse
            </div>
        </x-ui.card>

        <x-ui.card id="browse-slots" title="Availability and Slots" subtitle="Selected mentor availability and available bookable slots.">
            @php
                $selectedMentor = $mentors->firstWhere('id', $selectedMentorId);
                $mentorAvailabilities = $selectedMentor ? $availabilitiesByMentor->get($selectedMentor->id, collect()) : collect();
                $mentorSlots = $selectedMentor ? $slotsByMentor->get($selectedMentor->id, collect()) : collect();
            @endphp

            @if (! $selectedMentor)
                <p class="text-sm ump-muted">Select a mentor from the list to view availability.</p>
            @else
                <div class="mb-3 rounded-md border border-[var(--ump-border)] bg-white px-3 py-3">
                    <div class="flex items-center gap-3">
                        @if (file_exists(public_path('images/ump-logo.png')))
                            <img
                                src="{{ asset('images/ump-logo.png') }}"
                                alt="University of Mpumalanga"
                                class="h-10 w-auto"
                            >
                        @else
                            <div class="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--ump-border)] bg-[var(--ump-page-gray)] text-xs font-semibold text-[var(--ump-primary-navy)]">UMP</div>
                        @endif
                        <div>
                            <p class="text-sm font-semibold text-[var(--ump-primary-navy)]">UMPCFERI Mentor Session</p>
                            <p class="text-xs ump-muted">University of Mpumalanga UMPCFERI Mentorship Portal</p>
                        </div>
                    </div>
                </div>

                <div class="mb-3 rounded-md border border-[var(--ump-border)] bg-[var(--ump-page-gray)] px-3 py-2">
                    <div class="flex items-center gap-3">
                        @if (!empty($selectedMentor->profile_photo_path))
                            <img src="{{ Storage::url($selectedMentor->profile_photo_path) }}" alt="{{ $selectedMentor->name }} profile" class="h-12 w-12 rounded-full border border-[var(--ump-border)] object-cover">
                        @else
                            <div class="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--ump-border)] bg-white text-sm font-semibold text-[var(--ump-primary-navy)]">
                                {{ strtoupper(substr($selectedMentor->name, 0, 1)) }}
                            </div>
                        @endif
                        <p class="text-sm font-semibold text-[var(--ump-primary-navy)]">{{ $selectedMentor->name }}</p>
                    </div>
                    <p class="text-xs ump-muted">Faculty: {{ $selectedMentor->faculty ?: 'Not specified' }}</p>
                    <p class="text-xs ump-muted">{{ $selectedMentor->email }}</p>
                </div>

                <div class="mb-4">
                    <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Availability</p>
                    @if ($mentorAvailabilities->isEmpty())
                        <p class="text-sm ump-muted">No availability windows configured yet.</p>
                    @else
                        <div class="flex flex-wrap gap-2">
                            @foreach ($mentorAvailabilities as $availability)
                                <span class="rounded-md bg-[var(--ump-page-gray)] px-2.5 py-1 text-xs text-[var(--ump-text-dark)]">
                                    {{ ucfirst($availability->day_of_week) }} · {{ \Carbon\Carbon::parse($availability->start_time)->format('H:i') }} - {{ \Carbon\Carbon::parse($availability->end_time)->format('H:i') }}
                                </span>
                            @endforeach
                        </div>
                    @endif
                </div>

                <div>
                    <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Available Slots</p>
                    @if ($mentorSlots->isEmpty())
                        <p class="text-sm ump-muted">No open slots available right now.</p>
                    @else
                        <form method="POST" action="{{ route('student.book-slot') }}" class="grid gap-3 rounded-md border border-[var(--ump-border)] bg-white p-3 sm:grid-cols-[1.6fr,1fr,auto] sm:items-end">
                            @csrf
                            <input type="hidden" name="mentor_id" value="{{ $selectedMentorId }}">

                            <div>
                                <label for="time_slot_id" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Select Time Slot</label>
                                <select
                                    id="time_slot_id"
                                    name="time_slot_id"
                                    class="ump-focusable w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm"
                                    required
                                >
                                    <option value="" disabled {{ old('time_slot_id') ? '' : 'selected' }}>Choose a slot...</option>
                                    @foreach ($mentorSlots->take(20) as $slot)
                                        <option value="{{ $slot->id }}" {{ (string) old('time_slot_id') === (string) $slot->id ? 'selected' : '' }}>
                                            {{ \Carbon\Carbon::parse($slot->date)->format('Y-m-d') }} ({{ \Carbon\Carbon::parse($slot->date)->format('D') }}) - {{ \Carbon\Carbon::parse($slot->start_time)->format('H:i') }} to {{ \Carbon\Carbon::parse($slot->end_time)->format('H:i') }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>

                            <div>
                                <label for="appointment_subject" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Appointment Subject</label>
                                <input
                                    id="appointment_subject"
                                    type="text"
                                    name="appointment_subject"
                                    value="{{ old('appointment_subject') }}"
                                    placeholder="Brief subject"
                                    class="ump-focusable w-full rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm"
                                    maxlength="255"
                                    required
                                >
                            </div>

                            <x-ui.button type="submit" class="w-full sm:w-auto" :disabled="! $selectedStudentId">
                                Make Appointment
                            </x-ui.button>
                        </form>
                        <p class="mt-2 text-xs ump-muted">Showing up to 20 upcoming available slots for the selected mentor.</p>
                        @if (! $selectedStudentId)
                            <p class="mt-2 text-xs text-amber-700">No mentee account is currently available for booking.</p>
                        @endif
                    @endif
                </div>
            @endif
        </x-ui.card>
    </div>

    <x-ui.card id="my-appointments" title="My Appointments" subtitle="Booked sessions for the selected mentee.">
        @if (! $selectedStudentId)
            <p class="text-sm ump-muted">No mentee account found to display appointments.</p>
        @else
            <div class="overflow-x-auto">
                <table class="ump-table min-w-[640px]">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Mentor</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($appointments as $appointment)
                            <tr>
                                <td>{{ optional($appointment->timeSlot)->date ? \Carbon\Carbon::parse($appointment->timeSlot->date)->format('Y-m-d') : '-' }}</td>
                                <td>{{ optional($appointment->mentor)->name ?? '-' }}</td>
                                <td>
                                    @if ($appointment->timeSlot)
                                        {{ \Carbon\Carbon::parse($appointment->timeSlot->start_time)->format('H:i') }} - {{ \Carbon\Carbon::parse($appointment->timeSlot->end_time)->format('H:i') }}
                                    @else
                                        -
                                    @endif
                                </td>
                                <td>{{ ucfirst($appointment->status) }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="4" class="ump-muted">No appointments found for this mentee.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        @endif
    </x-ui.card>

    @if (session('status'))
        <script>
            (function () {
                const toast = document.getElementById('status-toast');

                if (!toast) {
                    return;
                }

                setTimeout(function () {
                    toast.classList.add('opacity-0');

                    setTimeout(function () {
                        toast.remove();
                    }, 500);
                }, 4000);
            })();
        </script>
    @endif
@endsection

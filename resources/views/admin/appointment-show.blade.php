@extends('layouts.app')

@section('title', 'Appointment Details | UMP Mentorship Portal')

@section('content')
    <x-ui.page-header title="Appointment Details" subtitle="Admin review of a mentorship appointment.">
        <a
            href="{{ route('admin.index') }}#upcoming-appointments"
            class="ump-focusable inline-flex items-center justify-center rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--ump-text-dark)] transition hover:bg-[var(--ump-page-gray)]"
        >
            Back to Appointments
        </a>
    </x-ui.page-header>

    <x-ui.card>
        <div class="grid gap-3 text-sm sm:grid-cols-2">
            <div class="rounded-md border border-[var(--ump-border)] bg-white px-3 py-2">
                <p class="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Mentee</p>
                <p class="mt-1 font-semibold text-[var(--ump-text-dark)]">{{ optional($appointment->student)->name ?? '-' }}</p>
                <p class="text-xs ump-muted">{{ optional($appointment->student)->email ?? '-' }}</p>
            </div>

            <div class="rounded-md border border-[var(--ump-border)] bg-white px-3 py-2">
                <p class="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Mentor</p>
                <p class="mt-1 font-semibold text-[var(--ump-text-dark)]">{{ optional($appointment->mentor)->name ?? '-' }}</p>
                <p class="text-xs ump-muted">{{ optional($appointment->mentor)->email ?? '-' }}</p>
            </div>

            <div class="rounded-md border border-[var(--ump-border)] bg-white px-3 py-2">
                <p class="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Date and Time</p>
                <p class="mt-1 font-semibold text-[var(--ump-text-dark)]">
                    @if ($appointment->timeSlot)
                        {{ \Carbon\Carbon::parse($appointment->timeSlot->date)->format('Y-m-d') }}
                        {{ \Carbon\Carbon::parse($appointment->timeSlot->start_time)->format('H:i') }} - {{ \Carbon\Carbon::parse($appointment->timeSlot->end_time)->format('H:i') }}
                    @else
                        -
                    @endif
                </p>
            </div>

            <div class="rounded-md border border-[var(--ump-border)] bg-white px-3 py-2">
                <p class="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Status</p>
                <p class="mt-1 font-semibold text-[var(--ump-text-dark)]">{{ ucfirst((string) $appointment->status) }}</p>
            </div>

            <div class="rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 sm:col-span-2">
                <p class="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Appointment Subject</p>
                <p class="mt-1 text-[var(--ump-text-dark)]">{{ $appointment->appointment_subject ?: 'Not provided' }}</p>
            </div>

            <div class="rounded-md border border-[var(--ump-border)] bg-white px-3 py-2 sm:col-span-2">
                <p class="text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Contact Details</p>
                <p class="mt-1 text-[var(--ump-text-dark)]">{{ $appointment->student_contact_details ?: (optional($appointment->student)->email ?: 'Not provided') }}</p>
            </div>
        </div>

        @if ($appointment->status === 'pending')
            <div class="mt-4">
                <form method="POST" action="{{ route('admin.appointments.approve', $appointment->id) }}">
                    @csrf
                    <x-ui.button type="submit">Approve Appointment</x-ui.button>
                </form>
            </div>
        @endif
    </x-ui.card>
@endsection

@extends('layouts.app')

@section('title', 'UMPCFERI Mentorship Portal')

@section('content')
    <section class="ump-card overflow-hidden p-0">
        <div class="bg-[var(--ump-primary-navy)] px-6 py-12 text-white sm:px-10">
            <p class="text-sm font-semibold uppercase tracking-wide text-[var(--ump-accent-gold)]">UMPCFERI</p>
            <h1 class="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">Welcome to the UMPCFERI Mentorship Portal</h1>
            <p class="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
                Connect mentees and mentors, manage availability, and oversee engagement outcomes from a single professional platform.
            </p>
            <div class="mt-6 flex flex-wrap gap-3">
                <a href="{{ route('student.index') }}" class="ump-btn ump-btn-primary">Mentee Portal</a>
                <a href="{{ route('mentor.index') }}" class="ump-btn ump-btn-secondary">Mentor Portal</a>
                <a href="{{ route('admin.index') }}" class="ump-btn border border-white/20 bg-transparent text-white hover:bg-white/10">Admin Portal</a>
            </div>
        </div>

        <div class="grid gap-4 bg-white p-6 sm:grid-cols-2 lg:grid-cols-3 sm:p-8">
            <div class="rounded-lg border border-[var(--ump-border)] p-4 transition hover:border-[var(--ump-primary-navy)] hover:bg-[var(--ump-page-gray)] hover:shadow-sm">
                <h2 class="text-base font-semibold text-[var(--ump-primary-navy)]">Mentee</h2>
                <p class="mt-2 text-sm ump-muted">Browse available slots and manage upcoming mentorship appointments.</p>
            </div>
            <div class="rounded-lg border border-[var(--ump-border)] p-4 transition hover:border-[var(--ump-primary-navy)] hover:bg-[var(--ump-page-gray)] hover:shadow-sm">
                <h2 class="text-base font-semibold text-[var(--ump-primary-navy)]">Mentor</h2>
                <p class="mt-2 text-sm ump-muted">Review schedules, capture notes, and support mentee progression.</p>
            </div>
            <div class="rounded-lg border border-[var(--ump-border)] p-4 transition hover:border-[var(--ump-primary-navy)] hover:bg-[var(--ump-page-gray)] hover:shadow-sm">
                <h2 class="text-base font-semibold text-[var(--ump-primary-navy)]">Admin</h2>
                <p class="mt-2 text-sm ump-muted">Manage mentors, availability, reports, operations, and system alerts.</p>
            </div>
        </div>
    </section>

    <div class="grid gap-4">
        <x-ui.card title="Announcements" subtitle="Latest admin notices.">
            <div class="space-y-3">
                @forelse (($announcements ?? []) as $announcement)
                    <div class="rounded-md border border-[var(--ump-border)] p-3">
                        <div class="mb-1 flex items-center justify-between gap-3">
                            <p class="text-sm font-semibold text-[var(--ump-primary-navy)]">{{ $announcement['title'] }}</p>
                            <span class="text-xs ump-muted">{{ $announcement['type'] }}</span>
                        </div>
                        <p class="text-sm text-[var(--ump-text-dark)]">{{ $announcement['message'] }}</p>
                        <p class="mt-1 text-xs ump-muted">{{ $announcement['date'] }}</p>
                    </div>
                @empty
                    <p class="text-sm ump-muted">No announcements available.</p>
                @endforelse
            </div>
        </x-ui.card>
    </div>

    <x-ui.card title="Upcoming Centre Events" subtitle="Events that will be held at UMPCFERI.">
        <div class="overflow-x-auto">
            <table class="ump-table min-w-[760px]">
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Venue</th>
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse (($centreEvents ?? []) as $event)
                        <tr>
                            <td>{{ $event['title'] }}</td>
                            <td>{{ $event['date'] }}</td>
                            <td>{{ $event['time'] }}</td>
                            <td>{{ $event['venue'] }}</td>
                            <td>{{ $event['category'] }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="ump-muted">No upcoming centre events yet.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </x-ui.card>

    <footer class="rounded-xl border border-[var(--ump-border)] bg-[var(--ump-primary-navy)] px-6 py-5 text-white">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 class="text-base font-semibold">Support</h2>
                <p class="mt-1 text-sm text-white/85">Need assistance with the portal?</p>
                <p class="mt-2 text-sm"><span class="font-semibold text-[var(--ump-accent-gold)]">Email:</span> umpcferi-support@ump.ac.za</p>
                <p class="mt-1 text-sm"><span class="font-semibold text-[var(--ump-accent-gold)]">Office Hours:</span> Mon-Fri, 08:00-16:30</p>
            </div>
            <button id="chatbot-open" type="button" class="ump-btn inline-flex items-center gap-2 border border-white/20 bg-white text-[var(--ump-primary-navy)] hover:bg-[var(--ump-page-gray)]">
                <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ump-primary-navy)] text-white" aria-hidden="true">
                    <svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="5" y="8" width="14" height="10" rx="2"></rect>
                        <path d="M12 8V5"></path>
                        <circle cx="10" cy="13" r="1"></circle>
                        <circle cx="14" cy="13" r="1"></circle>
                    </svg>
                </span>
                Chat with Bot
            </button>
        </div>
    </footer>

    <div id="chatbot-panel" class="fixed bottom-5 right-5 z-50 hidden w-[92vw] max-h-[85vh] max-w-sm overflow-hidden rounded-xl border border-[var(--ump-border)] bg-white shadow-lg" aria-hidden="true">
        <div class="flex items-center justify-between rounded-t-xl bg-[var(--ump-primary-navy)] px-4 py-3 text-white">
            <p class="inline-flex items-center gap-2 text-sm font-semibold">
                <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/15" aria-hidden="true">
                    <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="5" y="8" width="14" height="10" rx="2"></rect>
                        <path d="M12 8V5"></path>
                        <circle cx="10" cy="13" r="1"></circle>
                        <circle cx="14" cy="13" r="1"></circle>
                    </svg>
                </span>
                UMPCFERI Assistant
            </p>
            <button id="chatbot-close" type="button" class="ump-focusable rounded px-2 py-1 text-xs text-white/90 hover:bg-white/10">Close</button>
        </div>
        <div id="chatbot-messages" class="ump-scrollbar-hidden max-h-64 space-y-2 overflow-y-auto p-3 text-sm">
            <div class="max-w-[90%] rounded-md bg-[var(--ump-page-gray)] px-3 py-2 text-[var(--ump-text-dark)]">
                Hi, I can help with sign in, mentor verification, and appointments. What do you need?
            </div>
        </div>
        <div class="border-t border-[var(--ump-border)] px-3 py-2">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ump-primary-navy)]">Choose a question</p>
            <div id="chatbot-faq-list" class="ump-scrollbar-hidden flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1"></div>
        </div>
        <form id="chatbot-form" class="flex gap-2 border-t border-[var(--ump-border)] p-3">
            <input id="chatbot-input" type="text" class="ump-focusable w-full rounded-md border border-[var(--ump-border)] px-3 py-2 text-sm" placeholder="Type your question..." required>
            <button type="submit" class="ump-btn ump-btn-primary">Send</button>
        </form>
    </div>

    <script>
        (function () {
            const openBtn = document.getElementById('chatbot-open');
            const closeBtn = document.getElementById('chatbot-close');
            const panel = document.getElementById('chatbot-panel');
            const form = document.getElementById('chatbot-form');
            const input = document.getElementById('chatbot-input');
            const messages = document.getElementById('chatbot-messages');
            const faqList = document.getElementById('chatbot-faq-list');

            if (!openBtn || !closeBtn || !panel || !form || !input || !messages || !faqList) {
                return;
            }

            const fallbackFaqItems = [
                {
                    question: 'How do I register?',
                    keywords: ['register', 'sign up', 'create account'],
                    answer: 'Use Create an account on the login page, then complete your details. Mentor accounts must be verified by admin before appearing to mentees.',
                },
                {
                    question: 'How does mentor verification work?',
                    keywords: ['verify', 'verification', 'mentor approval'],
                    answer: 'Admin verifies mentor accounts in the Admin Portal. Unverified mentors do not appear on the mentee side.',
                },
                {
                    question: 'How do I book an appointment?',
                    keywords: ['book', 'slot', 'appointment', 'session'],
                    answer: 'Open the Mentee Portal, select a mentor, choose a time slot from the dropdown, add a subject, and submit the booking request.',
                },
                {
                    question: 'What if I forgot my password?',
                    keywords: ['password', 'forgot', 'reset', 'login'],
                    answer: 'Click Forgot password on the login page and follow the reset link process.',
                },
                {
                    question: 'What are support contacts?',
                    keywords: ['support', 'contact', 'email', 'help', 'office hours'],
                    answer: 'Contact support at umpcferi-support@ump.ac.za during office hours Mon-Fri, 08:00-16:30.',
                },
            ];

            let faqItems = fallbackFaqItems;

            const addMessage = function (text, fromBot) {
                const item = document.createElement('div');
                item.className = fromBot
                    ? 'max-w-[90%] rounded-md bg-[var(--ump-page-gray)] px-3 py-2 text-[var(--ump-text-dark)]'
                    : 'ml-auto max-w-[90%] rounded-md bg-[var(--ump-primary-navy)] px-3 py-2 text-white';
                item.textContent = text;
                messages.appendChild(item);
                messages.scrollTop = messages.scrollHeight;
            };

            const renderFaqButtons = function () {
                faqList.innerHTML = '';
                faqItems.slice(0, 12).forEach(function (item) {
                    if (!item || !item.question || !item.answer) {
                        return;
                    }

                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'ump-focusable rounded-full border border-[var(--ump-border)] bg-white px-3 py-1 text-xs text-[var(--ump-text-dark)] transition hover:bg-[var(--ump-page-gray)]';
                    button.textContent = item.question;
                    button.addEventListener('click', function () {
                        addMessage(item.question, false);
                        addMessage(item.answer, true);
                    });
                    faqList.appendChild(button);
                });
            };

            const getReply = function (value) {
                const message = value.toLowerCase();
                for (const item of faqItems) {
                    const keywords = Array.isArray(item.keywords) ? item.keywords : [];
                    const matched = keywords.some(function (keyword) {
                        return message.includes(String(keyword).toLowerCase());
                    });

                    if (matched && item.answer) {
                        return item.answer;
                    }
                }

                return 'I can help with login, mentor verification, and appointment booking. Please share a bit more detail.';
            };

            const loadFaqItems = async function () {
                try {
                    const response = await fetch('/data/faq.json', { cache: 'no-store' });
                    if (!response.ok) {
                        return;
                    }

                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        faqItems = data;
                    }
                } catch (error) {
                    // Keep fallback FAQs if JSON cannot be loaded.
                } finally {
                    renderFaqButtons();
                }
            };

            loadFaqItems();

            openBtn.addEventListener('click', function () {
                panel.classList.remove('hidden');
                panel.setAttribute('aria-hidden', 'false');
                input.focus();
            });

            closeBtn.addEventListener('click', function () {
                panel.classList.add('hidden');
                panel.setAttribute('aria-hidden', 'true');
            });

            form.addEventListener('submit', function (event) {
                event.preventDefault();
                const value = input.value.trim();
                if (!value) {
                    return;
                }

                addMessage(value, false);
                input.value = '';

                window.setTimeout(function () {
                    addMessage(getReply(value), true);
                }, 300);
            });
        })();
    </script>
@endsection

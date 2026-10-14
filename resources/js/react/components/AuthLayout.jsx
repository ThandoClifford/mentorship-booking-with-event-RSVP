import React from 'react';

export default function AuthLayout({ children, title, subtitle, variant = 'default' }) {
    const isAdmin = variant === 'admin';

    return (
        <div
            data-role={isAdmin ? 'admin' : undefined}
            className={`flex min-h-screen items-center justify-center px-4 ${
                isAdmin ? 'bg-[var(--ump-primary-navy)]' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
            }`}
        >
            <div className="w-full max-w-md">
                <div className={`rounded-lg bg-white p-8 shadow-lg ${isAdmin ? 'border-t-4 border-[var(--ump-accent-gold)]' : ''}`}>
                    {isAdmin ? (
                        <div className="mb-6 text-center">
                            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl bg-[var(--ump-primary-navy)] font-bold text-white ring-2 ring-[var(--ump-accent-gold)]">
                                U
                            </div>
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--ump-deep-blue)]">UMP-CFERI</p>
                        </div>
                    ) : null}
                    {title && <h1 className={`mb-3 text-center text-3xl font-bold ${isAdmin ? 'text-[var(--ump-primary-navy)]' : 'text-gray-900'}`}>{title}</h1>}
                    {subtitle ? <p className="mb-6 text-center text-sm text-[var(--tma-muted)]">{subtitle}</p> : null}
                    {children}
                </div>
            </div>
        </div>
    );
}

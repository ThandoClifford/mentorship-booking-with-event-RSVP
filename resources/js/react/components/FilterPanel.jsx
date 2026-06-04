import React, { useState } from 'react';
import { AVAILABILITY_FILTERS, EXPERTISE_OPTIONS, SESSION_TYPE_FILTERS } from '../brand';

function FilterGroup({ title, options, selected, onToggle, collapsed = true, onToggleCollapse }) {
    return (
        <div className="border-b border-[var(--tma-border)] pb-4 last:border-0 last:pb-0">
            <button
                type="button"
                onClick={onToggleCollapse}
                className="flex w-full items-center justify-between"
            >
                <span className="text-sm font-semibold text-[var(--tma-text)]">{title}</span>
                <svg className={`h-4 w-4 text-[var(--tma-muted)] transition ${collapsed ? '-rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {!collapsed && (
                <div className="mt-3 space-y-2">
                    {options.map((option) => (
                        <label key={option} className="flex cursor-pointer items-center gap-2 text-sm text-[var(--tma-text)]">
                            <input
                                type="checkbox"
                                checked={selected.includes(option)}
                                onChange={() => onToggle(option)}
                                className="rounded border-[var(--tma-border)] text-[var(--tma-pink)] focus:ring-[var(--tma-pink)]"
                            />
                            {option}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function FilterPanel({ filters, onToggle }) {
    const [open, setOpen] = useState(false);
    const [expandedGroup, setExpandedGroup] = useState(null);

    return (
        <aside className="rounded-2xl border border-[var(--tma-border)] bg-white shadow-sm">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold text-[var(--tma-pink)]"
            >
                {open ? 'Hide Filters' : 'Apply Filters'}
                <svg className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {open && (
                <div className="space-y-4 border-t border-[var(--tma-border)] px-5 pb-5 pt-4">
                    <FilterGroup
                        title="Expertise"
                        options={EXPERTISE_OPTIONS}
                        selected={filters.expertise}
                        onToggle={(v) => onToggle('expertise', v)}
                        collapsed={expandedGroup !== 'expertise'}
                        onToggleCollapse={() => setExpandedGroup(expandedGroup === 'expertise' ? null : 'expertise')}
                    />
                    <FilterGroup
                        title="Availability"
                        options={AVAILABILITY_FILTERS}
                        selected={filters.availability}
                        onToggle={(v) => onToggle('availability', v)}
                        collapsed={expandedGroup !== 'availability'}
                        onToggleCollapse={() => setExpandedGroup(expandedGroup === 'availability' ? null : 'availability')}
                    />
                    <FilterGroup
                        title="Session Type"
                        options={SESSION_TYPE_FILTERS}
                        selected={filters.sessionType}
                        onToggle={(v) => onToggle('sessionType', v)}
                        collapsed={expandedGroup !== 'sessionType'}
                        onToggleCollapse={() => setExpandedGroup(expandedGroup === 'sessionType' ? null : 'sessionType')}
                    />
                </div>
            )}
        </aside>
    );
}

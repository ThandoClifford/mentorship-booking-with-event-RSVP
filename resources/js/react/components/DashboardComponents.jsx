import React from 'react';

export function DataTable({ columns, data, actions }) {
    return (
        <table className="w-full">
            <thead className="bg-gray-100">
                <tr>
                    {columns.map((col) => (
                        <th key={col.key} className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                            {col.label}
                        </th>
                    ))}
                    {actions && <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>}
                </tr>
            </thead>
            <tbody>
                {data.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        {columns.map((col) => (
                            <td key={col.key} className="px-4 py-3 text-sm text-gray-700">
                                {row[col.key]}
                            </td>
                        ))}
                        {actions && <td className="px-4 py-3 text-sm">{actions(row)}</td>}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export function EmptyState({ icon, title, description }) {
    return (
        <div className="text-center py-12">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
}

export function SectionCard({ title, children, className = '' }) {
    return (
        <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
            {title && <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>}
            {children}
        </div>
    );
}

export function StatusBadge({ status }) {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        declined: 'bg-red-100 text-red-800',
        cancelled: 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || colors.pending}`}>{status}</span>;
}

export default { DataTable, EmptyState, SectionCard, StatusBadge };

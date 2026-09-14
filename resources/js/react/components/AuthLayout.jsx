import React from 'react';

export default function AuthLayout({ children, title }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {title && <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">{title}</h1>}
                    {children}
                </div>
            </div>
        </div>
    );
}

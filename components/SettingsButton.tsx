"use client"

import React from 'react';

interface SettingsButtonProps {
    onClick: () => void;
    isConfigured: boolean;
    title?: string;
}

export default function SettingsButton({ onClick, isConfigured, title = 'Configure Gemini API Key' }: SettingsButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-label={title}
            className="relative inline-flex items-center justify-center p-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#353233] transition-all"
        >
            <SettingsIcon className="w-5 h-5" />
            {isConfigured && (
                <span 
                    className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white" 
                    title="API key configured" 
                />
            )}
        </button>
    );
}

function SettingsIcon({ className }: { className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
            <path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"></path>
        </svg>
    );
}

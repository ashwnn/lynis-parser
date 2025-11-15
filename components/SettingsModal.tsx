"use client"

import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  geminiKey: string | null;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  onRemove: () => void;
}

export default function SettingsModal({
  isOpen,
  geminiKey,
  onClose,
  onSave,
  onRemove,
}: SettingsModalProps) {
  const [geminiKeyInput, setGeminiKeyInput] = useState(geminiKey ?? '');
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  const handleSave = () => {
    onSave(geminiKeyInput);
  };

  const handleRemove = () => {
    setGeminiKeyInput('');
    onRemove();
  };

  const handleClose = () => {
    setGeminiKeyInput('');
    setShowGeminiKey(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl z-10 w-full max-w-md border border-gray-200/80">
        {/* Header */}
        <div className="border-b border-gray-200/80 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Gemini API Key</h2>
          <p className="text-xs text-gray-500 mt-1">Configure your AI analysis settings</p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600">
            Enter your Gemini API key. This key is stored locally in your browser and used for client-side AI analysis.
          </p>

          <div className="bg-blue-50/50 border border-blue-200/60 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <span className="font-semibold">Note:</span> The Gemini API may restrict cross-origin calls (CORS). If you encounter CORS errors, you may need to configure API restrictions or use a server proxy.
            </p>
          </div>

          <div>
            <label htmlFor="apiKeyInput" className="block text-xs font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="flex items-center gap-2">
              <input
                id="apiKeyInput"
                type={showGeminiKey ? 'text' : 'password'}
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#353233] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey((v) => !v)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all"
              >
                {showGeminiKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200/80 px-6 py-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            Remove Key
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-[#353233] rounded-lg hover:bg-[#2a2725] transition-all"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

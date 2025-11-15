"use client"

import React, { useState, useRef, useEffect } from 'react';
import { parseLynisReport, parseLynisItem, ParsedReport } from '../lib/parse';
import SettingsModal from './SettingsModal';
import SettingsButton from './SettingsButton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const DEFAULT_SYSTEM_PROMPT = 'You are an expert Linux sysadmin. Your task is to provide a very short, actionable plan from a Lynis report.\n\n' +
  'You will be given warnings and suggestions.\n\n' +
  '**Your response MUST be concise and follow this format:**\n1.  **Summary:** 1-sentence summary of the system\'s security.\n2.  **Top Priorities:** A list of the top 3-5 most critical issues.\n\n' +
  '**For EACH priority item, you MUST provide:**\n* **Issue:** The ID and a 1-line description (e.g., "SSH-7408: X11Forwarding is enabled.").\n* **Fix:** The *minimal* runnable shell commands(s) to fix it.\n\n' +
  '**RULES:**\n* Be brief. No long explanations.\n* Only provide commands.\n* Use markdown for formatting (`code`, * bullets).\n\n' +
  '**Example:**\n### Top Priorities\n* **Issue:** SSH-7408: X11Forwarding is enabled.\n* **Fix:**\n```bash\necho "X11Forwarding no" | sudo tee -a /etc/ssh/sshd_config.d/99-hardening.conf\nsudo systemctl restart sshd\n```';

export default function Analyzer() {
  const [fileName, setFileName] = useState<string>('No file selected.');
  const [parsedReportData, setParsedReportData] = useState<ParsedReport | null>(null);
  const [aiResultMarkdown, setAiResultMarkdown] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geminiKey, setGeminiKey] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setFileName(`Selected file: ${file.name}`);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const content = ev.target?.result as string;
        const data = parseLynisReport(content);
        setParsedReportData(data);
        setError(null);
      } catch (err: any) {
        setError(`Parsing failed: ${String(err?.message ?? err)}`);
        setParsedReportData(null);
      }
    };
    reader.onerror = () => {
      setError('Error reading file.');
      setParsedReportData(null);
    };
    reader.readAsText(file);
  };

  const downloadJson = () => {
    if (!parsedReportData) return;
    const jsonString = JSON.stringify(parsedReportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    const hostname = parsedReportData.hostname || 'unknown-host';
    a.download = `lynis-report-${hostname}.json`;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const GEMINI_MODEL = 'gemini-2.5-flash-preview-09-2025';
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  async function callGemini(apiKey: string, payload: any, retries = 3) {
    for (let i = 0; i < retries; i++) {
      const response = await fetch(`${API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return response.json();
      }

      if (response.status >= 500 && i < retries - 1) {
        const backoff = Math.pow(2, i) * 1000 + Math.random() * 500;
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }

      const text = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${text}`);
    }
  }

  useEffect(() => {
    try {
      const k = localStorage.getItem('lynis_gemini_key');
      if (k) setGeminiKey(k);
    } catch (err) {
      // ignore localStorage permission problems
    }
  }, []);

  const openSettings = () => {
    setShowSettings(true);
  };

  const saveSettings = (apiKey: string) => {
    try {
      if (apiKey.trim().length === 0) {
        localStorage.removeItem('lynis_gemini_key');
        setGeminiKey(null);
      } else {
        localStorage.setItem('lynis_gemini_key', apiKey.trim());
        setGeminiKey(apiKey.trim());
      }
      setShowSettings(false);
      setError(null);
    } catch (err: any) {
      setError('Could not save API key to localStorage.');
    }
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  const removeKey = () => {
    try {
      localStorage.removeItem('lynis_gemini_key');
      setGeminiKey(null);
      setShowSettings(false);
    } catch (err) {
      setError('Could not remove API key from localStorage.');
    }
  };

  const callAi = async () => {
    if (!parsedReportData) return;
    const report = parsedReportData;
    const warnings = (report.warning ?? []) as string[];
    const suggestions = (report.suggestion ?? []) as string[];
    setAiLoading(true);
    setAiResultMarkdown(null);
    setError(null);

    try {
      if (!geminiKey) {
        setError('Gemini API key not configured. Click the settings icon to add it.');
        setAiLoading(false);
        return;
      }

      const userQuery = `Analyze the following Lynis report findings for an **${report.os_fullname ?? 'Linux'}** system. Please provide a summary and a prioritized action plan with runnable commands.\n\n` +
        (warnings.length > 0 ? '== Warnings ==\n' + warnings.map((w: string) => `- ${w.split('|')[0]}: ${w.split('|')[1] ?? ''}`).join('\n') + '\n\n' : '') +
        (suggestions.length > 0 ? '== Suggestions (Top 10) ==\n' + suggestions.slice(0, 10).map((s: string) => `- ${s.split('|')[0]}: ${s.split('|')[1] ?? ''}`).join('\n') : '');

      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: DEFAULT_SYSTEM_PROMPT }] },
      };

      const json = await callGemini(geminiKey, payload, 3);
      const candidate = json?.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text ?? '';
      if (text) setAiResultMarkdown(text);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setAiLoading(false);
    }
  };
  

  const warnings = parsedReportData?.warning ?? [];
  const suggestions = parsedReportData?.suggestion ?? [];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Modern Minimal Header */}
      <header className="flex items-center justify-between py-6 border-b border-gray-200/80">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Lynis Analyzer</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Security audit analysis powered by AI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input 
            id="fileInput" 
            ref={fileInputRef} 
            type="file" 
            accept=".dat" 
            onChange={onFileChange} 
          />
          <label 
            htmlFor="fileInput" 
            id="fileLabel" 
            className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            Upload Report
          </label>
          <button 
            onClick={downloadJson} 
            disabled={!parsedReportData} 
            className="px-4 py-2 text-sm font-medium text-white bg-[#353233] rounded-lg hover:bg-[#2a2725] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
          >
            Download JSON
          </button>
          <button 
            onClick={callAi} 
            disabled={!parsedReportData || aiLoading || !geminiKey} 
            className="px-4 py-2 text-sm font-medium text-white bg-[#353233] rounded-lg hover:bg-[#2a2725] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
          >
            {aiLoading ? 'Analyzing...' : 'Analyze with AI'}
          </button>
          <SettingsButton onClick={openSettings} isConfigured={!!geminiKey} />
        </div>
      </header>

      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          geminiKey={geminiKey}
          onClose={closeSettings}
          onSave={saveSettings}
          onRemove={removeKey}
        />
      )}
          {!parsedReportData && !error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-2xl">
                <span id="initialMessage" className="text-gray-400 text-sm">
                  Upload a Lynis report to begin analysis
                </span>

              </div>
            </div>
          )}

      <main className="flex-1 w-full min-h-0 pt-6">
        <div id="recommendationsOutput" className="w-full h-full p-8 bg-white border border-gray-200/80 rounded-xl text-sm overflow-auto custom-scrollbar">

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!parsedReportData && !error && (
            <div className="flex items-center justify-center h-full">
              <span id="initialMessage" className="text-gray-400 text-sm">
                Upload a Lynis report to begin analysis
              </span>
            </div>
          )}

          {parsedReportData && (
            <>
              {aiResultMarkdown && (
                <div className="mb-6">
                  <details className="collapsible-section bg-gray-50/50 rounded-lg p-6 border border-gray-200/60" open>
                    <summary className="collapsible-summary text-[#353233] cursor-pointer">
                      <span className="collapsible-title font-semibold">AI-Powered Analysis</span>
                      <span className="collapsible-arrow" />
                    </summary>
                    <div id="aiAnalysisContent" className="pt-4 text-gray-700">
                      {aiLoading ? (
                        <div className="flex items-center gap-3 text-gray-600">
                          <div className="loader"></div>
                          <span>Analyzing your report...</span>
                        </div>
                      ) : (
                        <div className="markdown-content prose prose-sm max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {aiResultMarkdown}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}

              {warnings.length === 0 && suggestions.length === 0 && (
                <div className="px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium">
                  ✓ No warnings or suggestions found in this report.
                </div>
              )}

              {warnings.length > 0 && (
                <details className="collapsible-section bg-red-50/30 rounded-lg p-6 border border-red-200/40 mb-6" open>
                  <summary className="collapsible-summary text-red-700 cursor-pointer">
                    <span className="collapsible-title font-semibold">Warnings ({warnings.length})</span>
                    <span className="collapsible-arrow" />
                  </summary>
                  <ul className="space-y-3 list-none pt-4">
                    {warnings.map((raw: string, i: number) => {
                      const item = parseLynisItem(raw);
                      return (
                        <li key={i} className="flex gap-4 items-start text-gray-700 py-2">
                          <span className="font-mono text-xs font-semibold text-red-900 bg-red-100 px-2 py-1 rounded shrink-0">
                            {item.id}
                          </span>
                          <span className="flex-1">{item.message}</span>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              )}

              {suggestions.length > 0 && (
                <details className="collapsible-section bg-yellow-50/30 rounded-lg p-6 border border-yellow-200/40" open>
                  <summary className="collapsible-summary text-yellow-800 cursor-pointer">
                    <span className="collapsible-title font-semibold">Suggestions ({suggestions.length})</span>
                    <span className="collapsible-arrow" />
                  </summary>
                  <ul className="space-y-3 list-none pt-4">
                    {suggestions.map((raw: string, i: number) => {
                      const item = parseLynisItem(raw);
                      return (
                        <li key={i} className="flex gap-4 items-start text-gray-700 py-2">
                          <span className="font-mono text-xs font-semibold text-yellow-900 bg-yellow-100 px-2 py-1 rounded shrink-0">
                            {item.id}
                          </span>
                          <span className="flex-1">
                            {item.message}
                            {item.details ? (
                              <span className="text-gray-500 italic ml-2 text-xs">({item.details})</span>
                            ) : null}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  );
}

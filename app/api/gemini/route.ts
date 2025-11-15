import { NextResponse } from 'next/server'

// Deprecated: This route previously proxied Gemini calls to the server.
// The application now performs Gemini requests directly from the client using a user-provided API key.
// Keep this route present but return 410 to avoid accidental usage.

export async function POST() {
  return NextResponse.json({ error: 'deprecated: use client-side Gemini integration via the Analyzer UI' }, { status: 410 });
}


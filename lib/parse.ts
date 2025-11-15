export type ParsedReport = Record<string, any>

export function parseLynisReport(reportText: string): ParsedReport {
  const reportData: ParsedReport = {}
  const lines = reportText.split('\n')

  for (const line of lines) {
    const trimmedLine = line.trim()

    // Skip empty lines, comments (#), and section headers ([...])
    if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith('[')) {
      continue
    }

    const parts = trimmedLine.split('=', 2)
    if (parts.length < 2) continue

    const key = parts[0]
    const value = parts[1]

    if (key.endsWith('[]')) {
      const baseKey = key.slice(0, -2)
      if (!reportData[baseKey]) reportData[baseKey] = []
      if (Array.isArray(reportData[baseKey])) reportData[baseKey].push(value)
    } else {
      reportData[key] = value
    }
  }

  return reportData
}

export function parseLynisItem(itemString: string) {
  const parts = itemString.split('|')
  const details = parts[3] && parts[3] !== '-' ? parts[3].replace('text:', '').trim() : ''
  return {
    id: parts[0] || 'N/A',
    message: parts[1] || 'No message.',
    details
  }
}

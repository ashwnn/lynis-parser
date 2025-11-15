# Lynis Analyzer

Lynis Analyzer is a small Next.js app that parses Lynis `.dat` reports and shows warnings and suggestions. You can optionally run AI analysis using Gemini with your own API key.

**Live demo:** https://ashwnn.github.io/lynis-analyzer/

---

## Features

- Upload Lynis `.dat` reports
- Extract and group warnings and suggestions
- View details in collapsible sections
- Download parsed results as JSON
- Optional AI analysis using Gemini for a concise, prioritized plan

---

## Using the hosted app

1. Open the live demo: https://ashwnn.github.io/lynis-analyzer/
2. Upload a Lynis `.dat` file.
3. Review the extracted warnings and suggestions.
4. Click **Download JSON** to export the parsed output.
5. (Optional) Click the gear icon, add your Gemini API key, then use **Analyze with AI**.

---

## Local development

**Requirements:** Node.js 18 or newer.

```bash
git clone https://github.com/ashwnn/lynis-analyzer.git
cd lynis-analyzer
npm install
npm run dev
````

The dev server runs at [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm run start
```

---

## AI analysis (Gemini)

* Open Settings (gear icon) and paste your Gemini API key.
* The key is stored in `localStorage` under `lynis_gemini_key` and used only in the browser.
* For production use, prefer a server side proxy that calls Gemini and keeps your key secret.

If you see CORS errors when calling Gemini directly from the browser, you may need to:

* Add a small server route that forwards requests to Gemini, or
* Adjust CORS and domain restrictions in your API setup.

---

## License

Licensed under [CC BY-NC-SA 4.0](http://creativecommons.org/licenses/by-nc-sa/4.0/), Attribution-NonCommercial-ShareAlike 4.0 International.

You are free to:

* Share: copy and redistribute the material
* Adapt: remix, transform, and build upon the material

Under the following terms:

* Attribution: you must give appropriate credit.
* NonCommercial: you may not use the material for commercial purposes.
* ShareAlike: if you remix or adapt, you must distribute your contributions under the same license.

# InterviewVault

This repository is now organized to store interview questions by experience level and technology, and includes a React-based UI to browse them.

Structure:

- `questions/` — contains subfolders `Junior`, `Mid`, `Senior`, each with JSON files per tech (e.g. `javascript.json`).
- `src/` — React application source code.
- `docs/` — built static site (output from `npm run build`).

## Managing Questions

### Quick Add Questions

Use the npm script to quickly add a new question:

```bash
npm run question:add <level> <tech> <sublevel>
```

Example:
```bash
npm run question:add Junior javascript "Async"
```

This creates a template question in `questions/Junior/javascript.json` that you can then edit.

### Validate Questions

Validate all questions to ensure they follow the schema:

```bash
npm run question:validate
```

### Manual Editing

You can also manually edit question files directly:
- Navigate to `questions/<Level>/<tech>.json`
- Add or edit question objects following the schema
- The UI will automatically reflect changes on page refresh

### Question Schema

The system supports both a simple schema and an enhanced schema with rich content:

**Simple Schema (backward compatible):**
```json
{
  "id": "js-jr-1",
  "title": "Question Title",
  "question": "Plain text question",
  "answer": "Plain text answer",
  "tags": ["tag1"],
  "sublevel": "Topic",
  "years": 1
}
```

**Enhanced Schema (with rich content):**
```json
{
  "id": "js-jr-2",
  "title": "Question Title",
  "question": "Question with **markdown** support",
  "answer": {
    "summary": "Brief summary",
    "content": "Detailed answer with **markdown**",
    "codeExamples": [
      {
        "language": "javascript",
        "title": "Example Title",
        "code": "console.log('hello')",
        "explanation": "What this code does"
      }
    ],
    "images": [],
    "videos": [],
    "resources": []
  },
  "tags": ["tag1", "tag2"],
  "sublevel": "Topic",
  "years": 1,
  "difficulty": "Junior",
  "lastUpdated": "2024-01-15"
}
```

**Rich Content Features:**
- **Markdown**: Bold, italic, lists, headers, code blocks
- **Code Examples**: Syntax-highlighted code with explanations
- **Images**: Support for diagrams and screenshots
- **Videos**: YouTube embeds and direct video links
- **Resources**: External documentation links

For detailed documentation, see [docs/QUESTION_GUIDE.md](docs/QUESTION_GUIDE.md).

### How It Works

The UI is fully dynamic:
- **Question counts** are calculated from actual question files
- **Topics/sublevels** are derived from question data
- **All indicators** update automatically when you add questions
- No manual manifest updates needed (though the add script keeps it in sync)

## Running the Application

Install and run locally:

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # builds static site into docs/
npm run preview    # preview built site
npm test           # run Vitest
```

Local serving helper scripts
----------------------------

To avoid CORS issues when opening `docs/index.html` locally, serve the repo over HTTP. Use the included helper scripts in `scripts/`:

Windows (cmd):
```
scripts\serve-docs.cmd
```

PowerShell:
```
.\scripts\serve-docs.ps1
```

Or run Python's simple server manually from the repository root:
```
python -m http.server 8000
# then open: http://localhost:8000/docs/
```

Automatic deploy to GitHub Pages
--------------------------------

A workflow is included to automatically deploy the `docs/` folder to GitHub Pages on pushes to the `main` branch: `.github/workflows/deploy-docs.yml`.

After you push, check the Actions tab for the `Deploy docs to GitHub Pages` run. When successful, the Pages site will be published (for public repos typically at `https://<owner>.github.io/<repo>/`).

Vite + React UI
---------------

I've added a richer UI scaffold using Vite and React. Files are in `src/`. Build output targets `docs/` so the existing Pages workflow will publish the built app.

Install and run locally:

```
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # builds static site into docs/
npm run preview    # preview built site
npm test           # run Vitest
```

Notes:
- The Vite config (`vite.config.js`) sets `build.outDir` to `docs` so the `build` command will replace the `docs/` static site with the optimized app.
- If you prefer to keep the simple static UI in `docs/` as-is, build output can be changed to a different folder in `vite.config.js`.


Interview Questions I ask for Junior/Mid and Senior people

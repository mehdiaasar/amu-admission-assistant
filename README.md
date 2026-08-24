# AMU Admission Assistance

A Retrieval-Augmented Generation (RAG) assistant that helps applicants fill out
Aligarh Muslim University admission forms. It answers questions from official
admission documents, and — when the user is stuck on a form field — accepts a
screenshot of the page and answers using both the retrieved documents and a
vision model's reading of the form.

B.Tech final year project.

## What it does

- **Document Q&A** — conversational RAG over AMU admission guides, indexed in Chroma.
- **Vision-assisted help** — the browser extension captures the current form,
  Gemini 1.5 Pro captions the field the user is confused about, and the caption is
  fed into the RAG chain alongside the retrieved context.
- **Session memory** — chat history per session, persisted in SQLite.
- **Document management** — upload / list / delete source PDFs, DOCX and HTML at runtime.

## Architecture

```
Chrome extension (Chatwebapr/)
  side panel UI + screenshot capture
              |
              v
FastAPI backend (conversatioal rag with production fastapi/api/)
  /chat          -> text-only conversational RAG
  /vision-chat   -> screenshot -> Gemini caption -> RAG
  /upload-doc, /list-docs, /delete-doc
              |
      +-------+--------+
      v                v
  Chroma           SQLite
  vector store     chat history + doc registry
```

There is also a Streamlit client (`conversatioal rag with production fastapi/app/`)
used during development.

## Repository layout

| Path | What it is |
|---|---|
| `conversatioal rag with production fastapi/` | The main application — FastAPI backend + Streamlit client |
| `Chatwebapr/` | **Current** Chrome extension (side panel, screenshot capture) |
| `extention/` | Earlier, simpler extension prototype — kept for reference |
| `amu data/` | Source admission documents used to build the index |
| `amu ICT RAG/` | Experiments on the ICT/online-course corpus |
| `auto form fill/` | Auto form-fill experiments |
| `data analysis/` | Data exploration |
| `learn/` | Tutorial notebooks followed while building the RAG pipeline |
| `*.ipynb` (root) | Retrieval experiments — chunking, reranking, HyPE, vector DB comparisons |

## Setup

Requires Python 3.11.

```bash
cd "conversatioal rag with production fastapi"
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requiremen.txt
```

Then create your `.env`:

```bash
cp .env.example .env
```

and fill in:

- `OPENAI_API_KEY` — chat completions and embeddings
- `GOOGLE_API_KEY` — Google AI Studio key, used for Gemini vision captioning

`.env` is git-ignored. Never commit real keys.

## Running

**Backend:**

```bash
cd "conversatioal rag with production fastapi/api"
uvicorn main:app --reload --port 8000
```

**Streamlit client:**

```bash
cd "conversatioal rag with production fastapi"
streamlit run app/streamlit_app.py
```

**Chrome extension:** open `chrome://extensions`, enable Developer mode,
click *Load unpacked*, and select the `Chatwebapr/` folder. The extension talks to
the backend on `http://127.0.0.1:8000`, so start the backend first.

## Building the index

The Chroma vector store is not committed — it is regenerable. Build it by
uploading the documents in `amu data/` through the `/upload-doc` endpoint (or the
Streamlit sidebar). By default the store is written to
`guideToAddmissinVectorheader/` at the repo root; override with the
`CHROMA_PERSIST_DIR` environment variable.

## Notes

- Virtual environments, vector-store binaries, SQLite databases, logs and uploaded
  screenshots are git-ignored — this repo holds source and data, not build output.
- `multiligual chatbot analyticsVidhya/RAG-based-Legal-Assistant/` is a third-party
  repository that was cloned locally for reference and is excluded from this repo.

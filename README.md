# ValiStart - AI Startup Idea Validator

Developed as an **Infosys Springboard Milestone 1** project, **ValiStart** is a full-stack, AI-powered web application that helps entrepreneurs, innovators, and students validate their business concepts using cooperative Large Language Model (LLM) agents and live web search.

The application features a modern, responsive **SaaS-style dashboard** that evaluates problem-solution fit, scans real-time competitors, compiles SWOT metrics, and assigns dynamic validation ratings.

---

## 🚀 Key Features

- **Multi-Agent Orchestration**: Outlines a four-stage execution pipeline:
  1. **Extraction Agent**: structures unstructured text inputs.
  2. **Market Research Agent**: queries live search indexes for trends.
  3. **Competitor Agent**: profiles market alternatives and moats.
  4. **Validation Agent**: assigns rating scores, formats SWOT grid, and creates recommendations.
- **Live Search Support**: Integrated with the **Tavily API** to verify active market segments.
- **Fail-Safe Mock Engine**: Automatically detects the absence of API keys and loads highly customized, realistic mock reports based on user startup inputs, ensuring immediate out-of-the-box evaluations.
- **Responsive Premium Interface**: Styled with dark mode support, SVG radial score meters, and responsive grid layouts.

---

## 🛠️ Tech Stack

**Frontend:**
- React.js (Vite)
- Tailwind CSS v3
- React Router DOM
- Axios & Lucide React

**Backend:**
- FastAPI (Python)
- Pydantic v2 schemas
- HTTPX async request client

**AI & Search Integrations:**
- Gemini 1.5 Flash (preferred)
- Tavily Search API (live web indexing)

---

## 📂 Project Structure

```text
AI Startup Idea Validator/
├── backend/
│   ├── main.py                # Server entry point
│   ├── config.py              # Settings validator
│   ├── requirements.txt       # Python package list
│   ├── .env                   # Configuration file (ignored in git)
│   ├── models/
│   │   └── validation.py      # Pydantic schema structures
│   ├── services/
│   │   ├── llm_service.py     # Gemini HTTP client helper
│   │   └── search_service.py  # Tavily HTTP client helper
│   └── agents/
│       ├── orchestrator.py    # Pipeline coordinator
│       ├── extraction_agent.py# Agent 1 logic
│       ├── market_research.py # Agent 2 logic
│       ├── competitor.py      # Agent 3 logic
│       ├── validation.py      # Agent 4 logic
│       └── mock_data.py       # Custom data generator
└── frontend/
    ├── src/
    │   ├── App.jsx            # App routes
    │   ├── index.css          # Tailwind and mesh styling
    │   ├── pages/
    │   │   ├── Home.jsx       # Submissions landing page
    │   │   └── ValidationReport.jsx # Report dashboard page
    │   ├── components/
    │   │   ├── Navbar.jsx     # Navigation and dark mode toggle
    │   │   ├── Footer.jsx     # Site footer
    │   │   ├── LoadingScreen.jsx # Step-by-step agent visualizer
    │   │   └── ScoreGauge.jsx # Circular score meters
    │   └── services/
    │       └── api.js         # Axios endpoints client
    ├── tailwind.config.js     # Tailwind presets
    └── vite.config.js         # Vite bundler properties
```

---

## ⚙️ Setup & Execution

### 1. Run the FastAPI Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate the pre-configured virtual environment:
   ```bash
   # On Windows (PowerShell)
   .\venv\Scripts\activate
   
   # On Linux/macOS
   source venv/bin/activate
   ```
3. (Optional) Provide API credentials:
   Open the `.env` file and insert your API keys:
   ```env
   GEMINI_API_KEY=your-gemini-key
   TAVILY_API_KEY=your-tavily-key
   ```
   *Note: If these keys are left empty, ValiStart will dynamically generate highly realistic mock validation data based on your specific startup statement.*
4. Boot up the server:
   ```bash
   python main.py
   ```
   The backend will run on `http://localhost:8000`.

---

### 2. Run the React Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Start the Vite local development server:
   ```bash
   npm run dev
   ```
   The application will boot up at `http://localhost:5173`. Open this URL in your web browser.


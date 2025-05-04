# ResearchAI

ResearchAI is an open-source platform that generates comprehensive, formal research papers on any topic using advanced AI models. It features a modern React + Vite frontend and a FastAPI backend, supporting real-time streaming of AI-generated content and PDF export. This documentation explains every part of the codebase, its architecture, and how all components interact.

---

## Table of Contents
- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Backend (FastAPI)](#backend-fastapi)
  - [app.py](#apppy)
  - [api.py](#apipy)
- [Frontend (React + Vite)](#frontend-react--vite)
  - [Project Structure](#project-structure)
  - [Key Files and Components](#key-files-and-components)
- [Styling](#styling)
- [Setup & Installation](#setup--installation)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Features
- **AI-Powered Research Paper Generation:** Input a research topic and receive a full-length, academically structured paper (minimum 30,000 words) with explicit source citations.
- **Real-Time Streaming:** See the research paper generated in real time via WebSocket streaming.
- **PDF Export:** Download the generated paper as a formatted PDF.
- **Modern Frontend:** Built with React and Vite for a fast, responsive user experience.
- **Backend API:** FastAPI backend handles AI requests and streaming.
- **Dark Mode:** Toggle between light and dark themes.

---

## Architecture Overview

```
ResearchAI/
├── api.py                  # FastAPI backend API
├── app.py                  # AI logic and Gemini API integration
├── research-ai-frontend/   # React frontend
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── main.jsx        # Entry point
│   │   ├── components/     # UI components (SearchBar, ResponseArea)
│   │   ├── assets/         # Static assets
│   │   ├── pages/          # (For future expansion)
│   │   ├── services/       # (For API calls)
│   │   └── lib/            # (For utility functions)
│   ├── public/             # Static files
│   ├── package.json        # Frontend dependencies and scripts
│   └── vite.config.js      # Vite configuration
├── README.md               # Project documentation
└── ...
```

---

## Backend (FastAPI)

### `app.py`
- **Purpose:** Contains the core AI logic and integration with the Google Gemini API.
- **Key Functions:**
  - `ai_search_stream(research_topic: str)`: Streams the generated research paper in chunks using Gemini API, following strict academic formatting and citation rules.
  - `ai_search(research_topic: str)`: Aggregates the streamed output into a single result for synchronous API calls.
- **Gemini API Integration:** Uses the `google-generativeai` library. The API key is read from the environment variable `GOOGLE_API_KEY` for security.
- **Prompt Engineering:** The prompt instructs the AI to generate a formal research paper (minimum 30,000 words), with explicit structure (Abstract, Introduction, Methodology, Results, Discussion, Conclusion, References) and full source citations.

### `api.py`
- **Purpose:** Exposes the backend API using FastAPI.
- **Key Features:**
  - **CORS Middleware:** Allows frontend connections from `localhost:3000` and `localhost:5173`.
  - **WebSocket Endpoint (`/ws`):** Accepts a research topic and streams the AI-generated paper chunk by chunk for real-time updates.
  - **POST Endpoint (`/process`):** Accepts a JSON payload `{ "query": "your research topic" }` and returns the full paper as `{ "answer": "full paper" }`.
  - **Error Handling:** Returns clear error messages for missing queries or backend exceptions.

---

## Frontend (React + Vite)

### Project Structure
```
research-ai-frontend/
├── src/
│   ├── App.jsx           # Main application logic
│   ├── main.jsx          # Entry point, renders App
│   ├── components/
│   │   ├── SearchBar.jsx       # Input for research topic
│   │   ├── ResponseArea.jsx    # Displays AI response
│   ├── assets/          # Images, fonts, etc.
│   ├── pages/           # (Reserved for future expansion)
│   ├── services/        # (Reserved for API logic)
│   └── lib/             # (Reserved for utility functions)
├── public/              # Static files (e.g., favicon, vite.svg)
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
```

### Key Files and Components
- **`App.jsx`:**
  - Central state management for query, response, loading, error, search history, and dark mode.
  - Handles WebSocket connection to backend for real-time streaming.
  - Exports the generated paper as PDF using `jspdf` and `html2canvas`.
  - Applies dark mode styling and manages search history.
- **`main.jsx`:**
  - Entry point; renders the `App` component inside a React root.
- **`components/SearchBar.jsx`:**
  - Controlled input for entering research topics.
  - Handles form submission and disables input while loading.
  - Shows a loading spinner when waiting for a response.
- **`components/ResponseArea.jsx`:**
  - Displays the research topic and the AI-generated response.
  - Uses `react-markdown` to render markdown output from the backend.
  - Shows a typing indicator while streaming.
  - Auto-scrolls as new content arrives.

---

## Styling
- **`src/App.css`:**
  - Global styles, layout, sidebar, responsive design, and dark mode support.
- **`components/SearchBar.css`:**
  - Styles for the search bar, input, button, and loading spinner.
- **`components/ResponseArea.css`:**
  - Styles for the response display, markdown formatting, and typing indicator.

---

## Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm 9+

### Backend Setup
1. **Create a virtual environment and install dependencies:**
   ```sh
   python3 -m venv .venv
   source .venv/bin/activate
   pip3 install fastapi uvicorn pydantic google-generativeai
   ```
2. **Set your Gemini API key:**
   - Export your API key as an environment variable:
     ```sh
     export GOOGLE_API_KEY=your_api_key_here
     ```
3. **Run the backend server:**
   ```sh
   uvicorn api:app --reload
   ```
   The API will be available at `http://localhost:8000`.

### Frontend Setup
1. **Install dependencies:**
   ```sh
   cd research-ai-frontend
   npm install
   ```
2. **Start the development server:**
   ```sh
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

---

## API Endpoints
- **POST `/process`**
  - **Request:** `{ "query": "your research topic" }`
  - **Response:** `{ "answer": "full paper" }`
- **WebSocket `/ws`**
  - Streams the generated paper chunk by chunk for real-time updates.

---

## Usage
- Enter a research topic in the search bar.
- The AI generates a full research paper, streamed in real time.
- Download the result as a PDF.
- Toggle dark mode for comfortable reading.

---

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please follow the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct.

---

## License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Acknowledgements
- [Google Gemini API](https://ai.google.dev/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [FastAPI](https://fastapi.tiangolo.com/)

---
For questions or support, open an issue or contact the maintainers.
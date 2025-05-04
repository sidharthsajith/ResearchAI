# ResearchAI

ResearchAI is an open-source platform that generates comprehensive, formal research papers on any topic using advanced AI models. It features a React + Vite frontend and a FastAPI backend, supporting real-time streaming of AI-generated content and PDF export. This project is designed for researchers, students, and anyone needing high-quality, structured academic writing.

## Features
- **AI-Powered Research Paper Generation:** Input a research topic and receive a full-length, academically structured paper (minimum 30,000 words) with explicit source citations.
- **Real-Time Streaming:** See the research paper generated in real time via WebSocket streaming.
- **PDF Export:** Download the generated paper as a formatted PDF.
- **Modern Frontend:** Built with React and Vite for fast, responsive user experience.
- **Backend API:** FastAPI backend handles AI requests and streaming.
- **Dark Mode:** Toggle between light and dark themes.

## Project Structure
```
ResearchAI/
├── api.py                  # FastAPI backend API
├── app.py                  # AI logic and integration with Gemini API
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

## Getting Started

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
     export GEMINI_API_KEY=your_api_key_here
     ```
   - (Replace the hardcoded key in `app.py` with `os.environ.get('GEMINI_API_KEY')` for security.)
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

## Usage
- Enter a research topic in the search bar.
- The AI generates a full research paper, streamed in real time.
- Download the result as a PDF.
- Toggle dark mode for comfortable reading.

## API Overview
- **POST /process**: Accepts `{ "query": "your research topic" }` and returns `{ "answer": "full paper" }`.
- **WebSocket /ws**: Streams the generated paper chunk by chunk for real-time updates.

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please follow the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct.

## License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgements
- [Google Gemini API](https://ai.google.dev/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [FastAPI](https://fastapi.tiangolo.com/)

---
For questions or support, open an issue or contact the maintainers.
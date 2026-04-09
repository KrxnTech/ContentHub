# ContentHub 〰️ : AI Video Clipping Platform

ContentHub is an automated video processing platform that uses Artificial Intelligence to identify, transcribe, and extract viral short-form clips from full-length videos. By leveraging modern LLMs and Speech-to-Text technologies, the platform automates the tedious work of manual video editing, allowing content creators to repurpose their content for social media efficiently.

## Architecture Overview

The platform follows a microservices-inspired architecture to separate high-intensity media processing from standard web operations:

1.  **Frontend (React/Vite)**: A responsive user interface for uploading videos, managing library content, and reviewing generated clips.
2.  **Backend (Node.js/Express)**: A coordination layer handling authentication, database management (MongoDB), and Cloudinary storage orchestration.
3.  **AI Engine (Python/FastAPI)**: A dedicated high-performance service for audio extraction, transcription (Whisper), AI analysis (Llama 3), and video manipulation (FFmpeg).

## Some Project SnapShots ✨

<img width="1247" height="579" alt="image" src="https://github.com/user-attachments/assets/bcf87a19-150a-46fa-9053-73eb9bdbca50" />
<img width="918" height="729" alt="image" src="https://github.com/user-attachments/assets/8214fecb-5c6b-4248-99d7-26a7aca3b80d" />
<img width="981" height="589" alt="image" src="https://github.com/user-attachments/assets/3adb8cff-baa2-433a-a1ad-b7c38ad8a69c" />
<img width="1411" height="835" alt="image" src="https://github.com/user-attachments/assets/06f492e1-c57d-4df8-88e4-f2e4fd3d7b85" />

## Technology Stack

*   **Frontend**: React.js, Vite, Tailwind CSS (for premium UI).
*   **Backend**: Node.js, Express.js, Mongoose.
*   **Database**: MongoDB (Local or Atlas).
*   **Storage**: Cloudinary (Video and Image management).
*   **AI Service**: Python 3.13, FastAPI, OpenAI Whisper, Groq SDK.
*   **Media Engine**: FFmpeg, MoviePy.

## Folder Structure

### Root Directory
```text
/
├── client/           # React Frontend Application
├── server/           # Node.js Express Backend
├── python-services/  # Python AI & Video Processing Service
└── .env              # Global Environment Configurations
```

### Frontend Structure (/client/clientFrontend)
```text
/src
├── components/       # Reusable UI components (Upload, ClipCard, Navbar)
├── pages/            # Application views (Home, Dashboard, VideoPlayer)
├── services/         # API integration logic using Axios
├── hooks/            # Custom React hooks for state management
└── assets/           # Global styles and static files
```

### Backend Structure (/server)
```text
/src
├── config/           # Configuration for MongoDB and Cloudinary
├── controllers/      # Route controllers for video and clip logic
├── models/           # Mongoose schemas (User, Video, Clip)
├── routes/           # API terminal points
├── services/         # Logic for communicating with Python service
└── utils/            # Shared helper functions
```

### AI Service Structure (/python-services)
```text
/app
├── routers/          # FastAPI route definitions
├── services/         # Logic for Transcription, AI Analysis, and Processing
│   ├── ai_analyzer.py      # Groq Llama 3 integration
│   ├── transcriber.py      # OpenAI Whisper STT implementation
│   ├── video_processor.py  # MoviePy/FFmpeg clipping engine
│   └── cloudinary_uploader.py # Media storage synchronization
├── utils/            # File system helpers and sanitization
└── main.py           # FastAPI application entry point
```

## System Workflow

1.  **Ingestion**: User uploads a video through the React frontend to Cloudinary.
2.  **Registration**: Metadata and the Cloudinary URL are saved to MongoDB via the Node.js backend.
3.  **Orchestration**: The backend triggers the Python service endpoint with the video metadata.
4.  **Audio Extraction**: The Python service extracts audio from the video using FFmpeg.
5.  **Transcription**: OpenAI Whisper processes the audio to generate a highly accurate text transcript.
6.  **AI Content Analysis**: The transcript is sent to Groq AI (Llama 3) with a specialized prompt to identify "viral" moments based on engagement potential.
7.  **Video Processing**: The service cuts the original video into multiple segments using the AI-identified timestamps.
8.  **Cloudinary Sync**: Generated clips are uploaded back to Cloudinary, and final metadata is returned to the Node.js backend to update the database.

## Installation and Setup

### Prerequisites
*   Node.js (v18+)
*   Python (3.13+)
*   FFmpeg (Installed in system PATH)
*   MongoDB Instance
*   Cloudinary Account
*   Groq API Key

### Backend Setup
1. Navigate to `/server`.
2. Install dependencies: `npm install`.
3. Configure `.env` with MongoDB, Cloudinary, and `PYTHON_SERVICE_URL`.
4. Start the server: `npm run dev`.

### Frontend Setup
1. Navigate to `/client/clientFrontend`.
2. Install dependencies: `npm install`.
3. Start the application: `npm run dev`.

### AI Service Setup
1. Navigate to `/python-services`.
2. Create virtual environment: `python -m venv venv`.
3. Activate environment: `.\venv\Scripts\activate`.
4. Install upgraded core tools: `python -m pip install --upgrade pip setuptools wheel`.
5. Install requirements: `pip install -r requirements.txt`.
6. Configure `.env` with Groq and Cloudinary keys.
7. Start the service: `uvicorn main:app --reload --port 8000`.

## Resolved Implementation Challenges

During the development phase, specific technical hurdles related to the modern environment were addressed:

### Challenge 1: Python 3.13 Build Errors
Older package managers failed to install media libraries (Whisper/Setuptools) on Python 3.13 due to the removal of `pkg_resources`.
*   **Solution**: Implemented a modern build workflow by upgrading core build tools (`pip`, `setuptools`, `wheel`) before installing dependencies to ensure compatibility with Python 3.13's updated architecture.

### Challenge 2: API Client Signature Mismatch
A `TypeError` occurred within the Groq Python SDK due to a conflict with the `httpx` library versioning.
*   **Solution**: Upgraded the Groq SDK to the latest version and adjusted the network wrapper configuration to maintain compatibility with modern asynchronous HTTP clients.

### Challenge 3: Resource Management
Large-scale video processing creates significant temporary data.
*   **Solution**: Implemented an automated cleanup utility within the Python service lifecycle that purges temporary video and audio files from local storage immediately after they are successfully synced to the cloud.

## License

This project is intended for educational and production use in content creation workflows.

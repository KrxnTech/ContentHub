# ContentHub 〰️ AI Video Clipping Platform 

ContentHub is an automated video processing platform that uses Artificial Intelligence to identify, transcribe, and extract viral short-form clips from full-length videos. By leveraging modern LLMs and Speech-to-Text technologies, the platform automates the tedious work of manual video editing, allowing content creators to repurpose their content for social media efficiently.

## Architecture Overview ✨

The platform follows a microservices-inspired architecture to separate high-intensity media processing from standard web operations:

1.  **Frontend (React/Vite)** : A responsive user interface for uploading videos, managing library content, and reviewing generated clips.
2.  **Backend (Node/Express)** : A coordination layer handling authentication, database management (MongoDB), and Cloudinary storage orchestration.
3.  **AI Engine (Python/FastAPI)** : A dedicated high-performance service for audio extraction, transcription (Whisper), AI analysis (Llama 3), and video manipulation (FFmpeg).

## Some Project SnapShots ✨

<img width="1494" height="868" alt="image" src="https://github.com/user-attachments/assets/352d13fb-e5dd-4bfd-b6ff-6ce4e00e29de" />
<img width="900" height="828" alt="image" src="https://github.com/user-attachments/assets/2dd6cd46-241b-4026-85cf-bb5a18032da4" />
<img width="1398" height="550" alt="image" src="https://github.com/user-attachments/assets/6738801a-4d35-4de4-b063-2df33a5777f1" />
<img width="1526" height="831" alt="image" src="https://github.com/user-attachments/assets/44f23a78-5a86-4e7c-b38b-096565cff0cb" />
<img width="1419" height="562" alt="image" src="https://github.com/user-attachments/assets/5c7328c2-5266-42a8-902f-7cdec144db2f" />
<img width="1474" height="690" alt="image" src="https://github.com/user-attachments/assets/3881b831-9a5c-43a2-8884-260fd1bc91a7" />

## Technology Stack

*   **Frontend** : React.js, Vite, Tailwind CSS (for premium UI).
*   **Backend** : Node.js, Express.js, Mongoose.
*   **Database** : MongoDB (Local or Atlas).
*   **Storage** : Cloudinary (Video and Image management).
*   **AI Service** : Python 3.13, FastAPI, OpenAI Whisper, Groq SDK.
*   **Media Engine** : FFmpeg, MoviePy.

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

1.  **Ingestion** : User uploads a video through the React frontend to Cloudinary.
2.  **Registration** : Metadata and the Cloudinary URL are saved to MongoDB via the Node.js backend.
3.  **Orchestration** : The backend triggers the Python service endpoint with the video metadata.
4.  **Audio Extraction** : The Python service extracts audio from the video using FFmpeg.
5.  **Transcription** : OpenAI Whisper processes the audio to generate a highly accurate text transcript.
6.  **AI Content Analysis** : The transcript is sent to Groq AI (Llama 3) with a specialized prompt to identify "viral" moments based on engagement potential.
7.  **Video Processing** : The service cuts the original video into multiple segments using the AI-identified timestamps.
8.  **Cloudinary Sync** : Generated clips are uploaded back to Cloudinary, and final metadata is returned to the Node.js backend to update the database.

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

import os
import whisper
import torch
from moviepy.editor import VideoFileClip
import uuid

# Load model once when service starts
# Options: "tiny", "base", "small", "medium", "large"
# "base" is a good balance between speed and accuracy for most use cases
model = whisper.load_model("base")

def extract_audio(video_path: str, temp_dir: str) -> str:
    """Extract audio from video file for transcription"""
    audio_path = os.path.join(temp_dir, f"audio_{uuid.uuid4().hex}.mp3")
    print(f"🎵 Extracting audio from {video_path}...")
    
    try:
        with VideoFileClip(video_path) as video:
            if video.audio:
                video.audio.write_audiofile(audio_path, verbose=False, logger=None)
                return audio_path
            else:
                return None
    except Exception as e:
        print(f"❌ Audio extraction failed: {e}")
        return None

def transcribe_audio(audio_path: str) -> dict:
    """Transcribe audio file using OpenAI Whisper"""
    if not audio_path or not os.path.exists(audio_path):
        return {"text": "No audio content found.", "segments": []}

    print(f"🗣️ Transcribing audio: {audio_path}...")
    
    try:
        # Using verbose=False to keep logs clean
        result = model.transcribe(audio_path, fp16=torch.cuda.is_available())
        return result
    except Exception as e:
        print(f"❌ Transcription failed: {e}")
        return {"text": "Transcription unavailable due to error.", "segments": []}


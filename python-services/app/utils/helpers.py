import os
import re
import requests
import uuid
from pathlib import Path


def sanitize_filename(name: str) -> str:
    """Remove special characters from filename"""
    name = re.sub(r'[^\w\s-]', '', name)
    name = re.sub(r'[-\s]+', '_', name)
    return name.strip('_')[:50]


def download_video(url: str, output_dir: str) -> str:
    """Download video from URL to local temp folder"""
    os.makedirs(output_dir, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.mp4"
    output_path = os.path.join(output_dir, filename)

    print(f"⬇️ Downloading video from: {url}")

    response = requests.get(url, stream=True, timeout=300)
    response.raise_for_status()

    with open(output_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"✅ Downloaded: {output_path} ({size_mb:.1f} MB)")
    return output_path


def cleanup_files(*file_paths: str):
    """Delete temp files after processing"""
    for path in file_paths:
        try:
            if path and os.path.exists(path):
                os.remove(path)
                print(f"🗑️ Cleaned up: {path}")
        except Exception as e:
            print(f"⚠️ Could not delete {path}: {e}")


def format_timestamp(seconds: float) -> str:
    """Convert seconds to MM:SS format"""
    minutes = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{minutes:02d}:{secs:02d}"


def get_video_duration(video_path: str) -> float:
    """Get video duration in seconds using moviepy"""
    try:
        from moviepy.editor import VideoFileClip
        with VideoFileClip(video_path) as clip:
            return clip.duration
    except Exception as e:
        print(f"⚠️ Could not get duration: {e}")
        return 0.0
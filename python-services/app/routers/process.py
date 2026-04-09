from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from app.services.ai_analyzer import analyze_video_for_clips
from app.services.video_processor import process_all_clips
from app.services.cloudinary_uploader import upload_all_clips
from app.utils.helpers import download_video, cleanup_files, get_video_duration
import os
import traceback
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
TEMP_DIR = os.getenv("TEMP_DIR", "./temp")


class ProcessRequest(BaseModel):
    video_id: str
    video_url: str
    title: str


@router.post("/process")
async def process_video(request: ProcessRequest):
    """
    Main endpoint: receives video URL, processes it, returns clips.
    
    Flow:
    1. Download video from Cloudinary URL
    2. Get video duration
    3. Extract audio and Transcribe (Whisper)
    4. Send transcript to Groq AI for analysis
    5. Cut clips using MoviePy
    6. Upload clips to Cloudinary
    7. Return clip data to Node.js backend
    """

    video_path = None
    print(f"\n{'='*50}")
    print(f"🎬 Processing video: {request.title}")
    print(f"📎 Video ID: {request.video_id}")
    print(f"{'='*50}\n")

    try:
        # STEP 1: Download video
        video_path = download_video(request.video_url, TEMP_DIR)

        # STEP 2: Get duration
        duration = get_video_duration(video_path)
        if duration < 10:
            raise HTTPException(
                status_code=400,
                detail="Video too short. Minimum 10 seconds required."
            )

        print(f"⏱️ Video duration: {duration:.1f} seconds ({duration/60:.1f} minutes)")

        # STEP 3: Transcription (New Addition for Accuracy)
        audio_path = None
        transcript = ""
        try:
            from app.services.transcriber import extract_audio, transcribe_audio
            audio_path = extract_audio(video_path, TEMP_DIR)
            transcript = transcribe_audio(audio_path)
            print(f"✅ Transcription complete ({len(transcript)} chars)")
        except Exception as e:
            print(f"⚠️ Transcription failed, falling back to title-only analysis: {e}")
        finally:
            if audio_path:
                cleanup_files(audio_path)

        # STEP 4: AI Analysis
        clip_segments = analyze_video_for_clips(
            title=request.title,
            duration=duration,
            transcript=transcript
        )


        if not clip_segments:
            raise HTTPException(
                status_code=500,
                detail="AI could not generate clip suggestions"
            )

        print(f"\n🎯 AI suggested {len(clip_segments)} clips")

        # STEP 5: Cut clips
        processed_clips = process_all_clips(
            video_path=video_path,
            clip_segments=clip_segments,
            temp_dir=TEMP_DIR
        )

        if not processed_clips:
            raise HTTPException(
                status_code=500,
                detail="Video processing failed — no clips were cut"
            )

        # STEP 6: Upload to Cloudinary
        uploaded_clips = upload_all_clips(
            processed_clips=processed_clips,
            video_id=request.video_id
        )

        if not uploaded_clips:
            raise HTTPException(
                status_code=500,
                detail="Failed to upload clips to Cloudinary"
            )

        # STEP 7: Return to Node.js
        print(f"\n🎉 SUCCESS: {len(uploaded_clips)} clips ready!")
        print(f"{'='*50}\n")

        return {
            "success": True,
            "message": f"Successfully generated {len(uploaded_clips)} clips",
            "clips": uploaded_clips
        }

    except HTTPException:
        raise

    except Exception as e:
        error_msg = str(e)
        print(f"\n❌ PROCESSING ERROR: {error_msg}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_msg)

    finally:
        # Always cleanup downloaded video
        if video_path:
            cleanup_files(video_path)
        
        # Cleanup clip temp files
        clips_dir = os.path.join(TEMP_DIR, "clips")
        if os.path.exists(clips_dir):
            import shutil
            try:
                shutil.rmtree(clips_dir)
                print("🗑️ Cleaned up temp clips folder")
            except Exception:
                pass
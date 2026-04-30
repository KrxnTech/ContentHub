from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from app.services.ai_analyzer import analyze_video_for_clips, deep_analyze_clip
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
    num_clips: int = 5  # Default to 5 clips, can be set to 3


class DeepAnalysisRequest(BaseModel):
    clip_data: dict
    transcript_segments: list = None


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
        whisper_result = {"text": "", "segments": []}
        try:
            from app.services.transcriber import extract_audio, transcribe_audio
            audio_path = extract_audio(video_path, TEMP_DIR)
            whisper_result = transcribe_audio(audio_path)
            print(f"✅ Transcription complete ({len(whisper_result['text'])} chars)")
        except Exception as e:
            print(f" Transcription failed, falling back to title-only analysis: {e}")
        finally:
            if audio_path:
                cleanup_files(audio_path)

        # STEP 4: AI Analysis
        analysis_result = analyze_video_for_clips(
            title=request.title,
            duration=duration,
            whisper_result=whisper_result,
            num_clips=request.num_clips
        )
        
        clip_segments = analysis_result.get("clips", [])
        ai_segments = analysis_result.get("segments", [])

        print(f"DEBUG: AI suggested {len(clip_segments)} clips.")

        # STEP 5: Cut clips
        processed_clips = process_all_clips(
            video_path=video_path,
            clip_segments=clip_segments,
            temp_dir=TEMP_DIR
        )

        # STEP 6: Upload to Cloudinary
        uploaded_clips = upload_all_clips(
            processed_clips=processed_clips,
            video_id=request.video_id
        )

        # STEP 7: Return to Node.js
        transcript_segments = whisper_result.get("segments", [])
        
        print("\n" + "!" * 60)
        print("CRITICAL DEBUG: FINAL PAYLOAD TO BACKEND")
        print(f"Clips Count: {len(uploaded_clips)}")
        print(f"Transcript Count: {len(transcript_segments)}")
        if transcript_segments:
            print(f"Sample Segment Time: Start={transcript_segments[0].get('start')}, End={transcript_segments[0].get('end')}")
        
        # FAIL HARD IF NO CLIPS
        if len(uploaded_clips) == 0:
            print(" ERROR: ZERO CLIPS GENERATED!")
            raise Exception("CRITICAL FAILURE: No clips were successfully generated or uploaded.")
            
        print("!" * 60 + "\n")

        return {
            "success": True,
            "clips": uploaded_clips,
            "transcript": transcript_segments,
            "ai_segments": ai_segments,
            "reliability_score": analysis_result.get("reliability_score", 0),
            "reliability_reasoning": analysis_result.get("reliability_reasoning", "")
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
                print(" Cleaned up temp clips folder")
            except Exception:
                pass


@router.post("/deep-analysis")
async def deep_analysis(request: DeepAnalysisRequest):
    """
    Deep analysis endpoint for a specific clip.
    Returns detailed insights for engagement, retention, virality, and improvements.
    """
    print(f"\n{'='*50}")
    print(f" Deep Analysis for Clip: {request.clip_data.get('title', 'Unknown')}")
    print(f"{'='*50}\n")

    try:
        analysis_result = deep_analyze_clip(
            clip_data=request.clip_data,
            transcript_segments=request.transcript_segments
        )

        return {
            "success": True,
            "analysis": analysis_result
        }

    except Exception as e:
        error_msg = str(e)
        print(f"\n DEEP ANALYSIS ERROR: {error_msg}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_msg)
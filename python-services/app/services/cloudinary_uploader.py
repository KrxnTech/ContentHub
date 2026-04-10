import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)


def upload_clip_to_cloudinary(
    clip_path: str,
    video_id: str,
    clip_index: int
) -> dict:
    """
    Upload a video clip to Cloudinary.
    Returns upload result with URL and public_id.
    """
    print(f"☁️ Uploading clip {clip_index + 1} to Cloudinary...")

    try:
        public_id = f"video-clipper/clips/{video_id}/clip_{clip_index + 1}"

        result = cloudinary.uploader.upload(
            clip_path,
            resource_type="video",
            public_id=public_id,
            overwrite=True,
            folder="video-clipper/clips",
            transformation=[
                {"quality": "auto"},
                {"fetch_format": "mp4"}
            ]
        )

        # Generate thumbnail from clip
        thumbnail_url = cloudinary.CloudinaryVideo(result["public_id"]).build_url(
            transformation=[
                {"start_offset": "1"},
                {"format": "jpg"},
                {"quality": "auto"},
                {"width": 640, "height": 360, "crop": "fill"}
            ]
        )

        print(f"✅ Clip uploaded: {result['secure_url']}")

        return {
            "clip_url": result["secure_url"],
            "cloudinary_public_id": result["public_id"],
            "thumbnail_url": thumbnail_url,
        }

    except Exception as e:
        print(f"❌ Cloudinary upload error: {e}")
        raise


def upload_all_clips(processed_clips: list, video_id: str) -> list:
    """
    Upload all processed clips to Cloudinary.
    Returns clips with Cloudinary URLs added.
    """
    final_clips = []

    for i, clip in enumerate(processed_clips):
        clip_data = {
            "start": clip.get("start_time"),
            "end": clip.get("end_time"),
            "duration": clip.get("duration"),
            "viral_score": clip.get("viral_score"),
            "reason": clip.get("reason"),
            "why_this_part": clip.get("why_this_part"),
            "emotion": clip.get("emotion"),
            "category": clip.get("category"),
            "keywords": clip.get("keywords", []),
            "analysis": clip.get("analysis", {}),
            "title": clip.get("title", f"Clip {i+1}")
        }

        try:
            upload_result = upload_clip_to_cloudinary(
                clip_path=clip["local_path"],
                video_id=video_id,
                clip_index=i
            )

            clip_data.update({
                "clipUrl": upload_result.get("clip_url"),
                "cloudinaryPublicId": upload_result.get("cloudinary_public_id"),
                "thumbnailUrl": upload_result.get("thumbnail_url"),
            })

        except Exception as e:
            print(f"❌ UPLOAD ERROR for clip {i+1}: {str(e)}")
            clip_data.update({
                "clipUrl": None,
                "uploadError": str(e)
            })

        # ALWAYS append, never skip
        final_clips.append(clip_data)

    return final_clips
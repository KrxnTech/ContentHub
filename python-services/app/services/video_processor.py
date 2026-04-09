import os
import uuid
from moviepy.editor import VideoFileClip
from app.utils.helpers import cleanup_files


def cut_video_clip(
    video_path: str,
    start_time: float,
    end_time: float,
    output_dir: str
) -> str:
    """
    Cut a segment from a video file and save as new file.
    Returns path to the cut clip.
    """
    os.makedirs(output_dir, exist_ok=True)
    output_filename = f"clip_{uuid.uuid4().hex}.mp4"
    output_path = os.path.join(output_dir, output_filename)

    print(f"✂️ Cutting clip: {start_time:.1f}s → {end_time:.1f}s")

    try:
        with VideoFileClip(video_path) as video:
            # Clamp times to video duration
            actual_end = min(end_time, video.duration)
            actual_start = max(0, start_time)

            if actual_end <= actual_start:
                raise ValueError(f"Invalid clip times: {actual_start} to {actual_end}")

            clip = video.subclip(actual_start, actual_end)

            clip.write_videofile(
                output_path,
                codec='libx264',
                audio_codec='aac',
                temp_audiofile=f'temp_audio_{uuid.uuid4().hex}.m4a',
                remove_temp=True,
                verbose=False,
                logger=None,
                fps=24
            )

        print(f"✅ Clip saved: {output_path}")
        return output_path

    except Exception as e:
        print(f"❌ Error cutting clip: {e}")
        raise


def process_all_clips(video_path: str, clip_segments: list, temp_dir: str) -> list:
    """
    Process all clip segments from a video.
    Returns list of clip data with local file paths.
    """
    processed_clips = []
    clips_dir = os.path.join(temp_dir, "clips")
    os.makedirs(clips_dir, exist_ok=True)

    for i, segment in enumerate(clip_segments):
        print(f"\n📎 Processing clip {i+1}/{len(clip_segments)}: {segment['title']}")

        try:
            clip_path = cut_video_clip(
                video_path=video_path,
                start_time=segment["start_time"],
                end_time=segment["end_time"],
                output_dir=clips_dir
            )

            processed_clips.append({
                **segment,
                "local_path": clip_path
            })

        except Exception as e:
            print(f"⚠️ Skipping clip {i+1} due to error: {e}")
            continue

    print(f"\n✅ Successfully processed {len(processed_clips)}/{len(clip_segments)} clips")
    return processed_clips
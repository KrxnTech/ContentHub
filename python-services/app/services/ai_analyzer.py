import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def analyze_video_for_clips(title: str, duration: float, transcript: str = "") -> list:
    """
    Use Groq AI to analyze video and suggest best clip timestamps.
    Uses transcript if available for much better accuracy.
    """

    print(f"🤖 Analyzing video with AI: '{title}' ({duration:.0f}s)")
    if transcript:
        print(f"📝 Transcript length: {len(transcript)} characters")

    # Build smart prompt for AI
    prompt = f"""You are an expert video editor and content strategist specializing in creating viral short clips.

A video titled "{title}" has a duration of {duration:.0f} seconds.

TRANSCRIPT:
\"\"\"
{transcript if transcript else "No transcript available. Use title for context."}
\"\"\"

Your task: Identify 4-6 of the most engaging, shareable moments that would make great short clips.

Rules:
- Each clip must be between 25-55 seconds long
- Clips should NOT overlap
- Use the transcript to find high-impact moments (funny parts, deep insights, emotional peaks)
- Spread clips across the full video duration
- Focus on: key moments, emotional peaks, valuable insights, action sequences, quotable moments

Respond ONLY with a valid JSON array. No explanation, no markdown, just pure JSON:

[
  {{
    "title": "Engaging clip title here",
    "description": "What makes this moment special and why viewers will love it",
    "start_time": 15,
    "end_time": 50,
    "engagement_score": 87,
    "tags": ["tag1", "tag2", "tag3"],
    "ai_reason": "Based on the transcript, this segment contains a key insight about..."
  }}
]

Generate clips for this {duration:.0f} second video. Make start_time and end_time realistic numbers within 0 to {duration:.0f}."""


    try:
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional video editor AI. You only respond with valid JSON arrays, no other text."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=2000,
        )

        raw_response = response.choices[0].message.content.strip()
        print(f"🤖 AI Response received: {len(raw_response)} chars")

        # Clean response — extract JSON array
        json_match = re.search(r'\[.*\]', raw_response, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
        else:
            json_str = raw_response

        clips_data = json.loads(json_str)

        # Validate and fix each clip
        valid_clips = []
        for clip in clips_data:
            start = float(clip.get("start_time", 0))
            end = float(clip.get("end_time", 0))

            # Skip invalid clips
            if end <= start:
                continue
            if start < 0 or end > duration:
                continue
            if (end - start) < 10:
                continue

            valid_clips.append({
                "title": str(clip.get("title", "Highlight Clip")),
                "description": str(clip.get("description", "")),
                "start_time": round(start, 2),
                "end_time": round(end, 2),
                "duration": round(end - start, 2),
                "engagement_score": min(100, max(0, int(clip.get("engagement_score", 75)))),
                "tags": clip.get("tags", [])[:5],
                "ai_reason": str(clip.get("ai_reason", ""))
            })

        print(f"✅ AI suggested {len(valid_clips)} valid clips")
        return valid_clips

    except json.JSONDecodeError as e:
        print(f"⚠️ AI JSON parse error: {e}. Using fallback clips.")
        return generate_fallback_clips(duration)

    except Exception as e:
        print(f"⚠️ AI analysis error: {e}. Using fallback clips.")
        return generate_fallback_clips(duration)


def generate_fallback_clips(duration: float) -> list:
    """
    Generate evenly spaced clips if AI fails.
    This ensures the service always returns something.
    """
    print("📋 Generating fallback clips...")

    clips = []
    clip_duration = 40  # seconds per clip
    num_clips = min(5, max(3, int(duration / 60)))
    spacing = duration / (num_clips + 1)

    labels = ["Opening Hook", "Key Moment", "Main Highlight", "Best Part", "Closing Moment"]

    for i in range(num_clips):
        start = round(spacing * (i + 0.5), 2)
        end = round(min(start + clip_duration, duration - 2), 2)

        if end - start < 10:
            continue

        clips.append({
            "title": labels[i] if i < len(labels) else f"Clip {i+1}",
            "description": f"Auto-selected highlight from {start:.0f}s to {end:.0f}s",
            "start_time": start,
            "end_time": end,
            "duration": round(end - start, 2),
            "engagement_score": max(60, 85 - (i * 5)),
            "tags": ["highlight", "auto-clip"],
            "ai_reason": "Auto-selected based on video structure"
        })

    return clips
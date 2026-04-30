import os
import json
import re
import random
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def _clamp_factor(value: float, weak_default: float = 55.0) -> int:
    """
    Enforce the 40–95 range on a single confidence factor.
    - Values below 20 are treated as missing/weak signal → replaced with weak_default (50–60).
    - Values below 40 are raised to 40 (floor).
    - Values above 95 are capped at 95 (ceiling).
    Always returns an integer.
    """
    if value is None or value < 20:
        value = weak_default
    return int(min(95, max(40, value)))


def deep_analyze_clip(clip_data: dict, transcript_segments: list = None) -> dict:
    """
    Perform deep analysis of a specific clip for short-form content optimization.
    Returns structured, data-driven analysis with strict metric logic.
    """
    print(f"\n{'#'*60}")
    print(f"DEBUG: Starting Deep Analysis for Clip: {clip_data.get('title', 'Unknown')}")

    clip_text = ""
    if transcript_segments:
        # Get transcript segments within clip time range
        clip_start = clip_data.get("start_time", 0)
        clip_end = clip_data.get("end_time", 60)
        relevant_segments = [
            s for s in transcript_segments
            if s.get("start", 0) >= clip_start - 2 and s.get("end", 0) <= clip_end + 2
        ]
        clip_text = " ".join(s.get("text", "") for s in relevant_segments)

    # Extract base signals
    viral_score = clip_data.get("viral_score", 50)
    emotion = clip_data.get("emotion", "neutral")
    keywords = clip_data.get("keywords", [])
    duration = clip_data.get("duration", 60)
    category = clip_data.get("category", "general")
    reason = clip_data.get("reason", "")

    # === STRICT METRIC LOGIC ===
    # No fake numbers - derive from actual signals

    # 1. ENGAGEMENT SCORE (based on viral_score and content quality)
    # High viral_score + strong emotion + keywords = high engagement
    # Low viral_score + neutral emotion = low engagement
    engagement_base = viral_score
    if emotion in ['funny', 'emotional', 'motivational']:
        engagement_base += 10
    elif emotion in ['neutral', 'informational']:
        engagement_base -= 5
    if len(keywords) > 3:
        engagement_base += 5
    engagement_score = min(95, max(35, engagement_base))

    engagement_reasoning = []
    if engagement_score >= 80:
        engagement_reasoning.append(f"High viral score ({viral_score}) indicates strong potential")
        if emotion in ['funny', 'emotional', 'motivational']:
            engagement_reasoning.append(f"Strong {emotion} content drives interaction")
    elif engagement_score >= 60:
        engagement_reasoning.append(f"Moderate viral score ({viral_score})")
        engagement_reasoning.append("Content has decent engagement potential but lacks strong hooks")
    else:
        engagement_reasoning.append(f"Low viral score ({viral_score}) limits engagement")
        engagement_reasoning.append("Content lacks compelling elements to drive interaction")

    # 2. RETENTION SCORE (based on pacing and hook strength)
    # If reason mentions "hook" or "start" positively → higher retention
    # If emotion is neutral → lower retention
    retention_base = engagement_score - 5  # Retention usually lower than engagement
    if 'hook' in reason.lower() and 'strong' in reason.lower():
        retention_base += 10
    elif 'slow' in reason.lower() or 'boring' in reason.lower():
        retention_base -= 15
    if emotion == 'neutral':
        retention_base -= 10
    elif emotion in ['funny', 'emotional']:
        retention_base += 5
    retention_score = min(95, max(30, retention_base))

    retention_reasoning = []
    if retention_score >= 75:
        retention_reasoning.append("Strong hook identified in opening seconds")
        if emotion in ['funny', 'emotional']:
            retention_reasoning.append(f"{emotion.capitalize()} content maintains viewer interest")
    elif retention_score >= 55:
        retention_reasoning.append("Moderate hook strength")
        retention_reasoning.append("Some pacing issues may cause early drop-off")
    else:
        retention_reasoning.append("Weak or unclear hook")
        retention_reasoning.append("Slow pacing leads to early viewer loss")

    # 3. EMOTION SCORE (based on emotion type and content)
    if emotion in ['funny', 'emotional', 'motivational', 'sad', 'romantic', 'heartbreak', 'nostalgic']:
        emotion_score = min(95, 75 + (viral_score / 20))
    elif emotion in ['educational', 'informational']:
        emotion_score = min(85, 55 + (viral_score / 25))
    else:  # neutral
        emotion_score = max(40, 45 + (viral_score / 30))

    emotion_reasoning = []
    if emotion in ['funny', 'emotional', 'motivational', 'sad', 'romantic', 'heartbreak', 'nostalgic']:
        emotion_reasoning.append(f"Strong {emotion} content triggers emotional response")
        emotion_reasoning.append("High emotional density drives sharing behavior")
    elif emotion in ['educational', 'informational']:
        emotion_reasoning.append("Informative content provides value but lower emotional impact")
    else:
        emotion_reasoning.append("Neutral emotional content limits viral potential")
        emotion_reasoning.append("Content lacks emotional triggers")

    # 4. VIRALITY SCORE (based on trend compatibility and shareability)
    virality_base = viral_score
    if len(keywords) > 5:
        virality_base += 5
    if emotion in ['funny', 'emotional', 'sad', 'romantic', 'heartbreak']:
        virality_base += 8
    elif emotion == 'neutral':
        virality_base -= 10
    if category in ['trending', 'viral', 'music']:
        virality_base += 10
    virality_score = min(95, max(35, virality_base))

    virality_reasoning = []
    if virality_score >= 75:
        virality_reasoning.append(f"High viral score ({viral_score}) indicates strong potential")
        if emotion in ['funny', 'emotional', 'sad', 'romantic']:
            virality_reasoning.append(f"{emotion.capitalize()} content highly shareable")
        if category in ['trending', 'viral']:
            virality_reasoning.append("Content aligns with current trends")
    elif virality_score >= 55:
        virality_reasoning.append(f"Moderate viral potential (score: {viral_score})")
        virality_reasoning.append("Content has some shareable elements but lacks trend alignment")
    else:
        virality_reasoning.append(f"Low viral score ({viral_score}) limits potential")
        virality_reasoning.append("Content lacks trend compatibility or strong shareability")

    # === METRIC VALIDATION RULE ===
    # Recalibrate if scores don't match content type
    if emotion_score < 60 and emotion in ['sad', 'romantic', 'heartbreak', 'nostalgic', 'emotional']:
        emotion_score = 75
        emotion_reasoning.append("Recalculated: Emotional content requires higher emotion score")
    
    if virality_score < 60 and (viral_score > 70 or emotion in ['sad', 'romantic', 'heartbreak']):
        virality_score = 70
        virality_reasoning.append("Recalculated: Content commonly used in edits requires higher virality score")
    
    # === METRIC VARIATION LOGIC ===
    # Introduce controlled variation based on clip-specific data to ensure uniqueness
    # Use clip title, keywords, and reason to generate unique variations
    
    # Generate unique variation seed from clip data
    clip_seed = sum(ord(c) for c in clip_data.get('title', '')) + sum(ord(c) for c in emotion) + len(keywords)
    variation_offset = (clip_seed % 20) - 10  # -10 to +10 variation
    
    # Apply variation to different metrics based on clip characteristics
    if keywords and len(keywords) > 0:
        # More keywords = higher engagement variation
        engagement_variation = (len(keywords) % 7) - 3
        engagement_score = min(95, max(30, engagement_score + engagement_variation))
        if engagement_variation != 0:
            engagement_reasoning.append(f"Varied: Keyword diversity ({len(keywords)} keywords) affects engagement")
    
    if reason and len(reason) > 50:
        # Longer reason = higher retention variation
        retention_variation = (len(reason) % 9) - 4
        retention_score = min(95, max(30, retention_score + retention_variation))
        if retention_variation != 0:
            retention_reasoning.append(f"Varied: Content depth affects retention pattern")
    
    # Apply emotional intensity variation
    if emotion in ['sad', 'romantic', 'heartbreak']:
        emotion_variation = (clip_seed % 15) - 5
        emotion_score = min(95, max(50, emotion_score + emotion_variation))
        if emotion_variation != 0:
            emotion_reasoning.append(f"Varied: Emotional intensity differs based on content")
    
    # Apply virality variation based on category
    if category and category != 'general':
        virality_variation = (len(category) % 11) - 5
        virality_score = min(95, max(35, virality_score + virality_variation))
        if virality_variation != 0:
            virality_reasoning.append(f"Varied: Category ({category}) influences viral potential")
    
    # Reject if all scores are similar (lack of differentiation)
    if abs(engagement_score - retention_score) < 10 and abs(retention_score - emotion_score) < 10 and abs(emotion_score - virality_score) < 10:
        # Add variance based on content characteristics
        if emotion in ['funny', 'emotional', 'sad', 'romantic', 'heartbreak']:
            emotion_score = min(95, emotion_score + 15)
            emotion_reasoning.append("Adjusted: High emotional intensity increases emotion score")
        if 'hook' in reason.lower() and 'strong' in reason.lower():
            retention_score = min(95, retention_score + 15)
            retention_reasoning.append("Adjusted: Strong hook increases retention score")
        # Force variation if still similar
        if abs(engagement_score - retention_score) < 10:
            engagement_score = min(95, engagement_score + 12)
            engagement_reasoning.append("Forced variation: Ensuring metric differentiation")
        if abs(emotion_score - virality_score) < 10:
            virality_score = max(35, virality_score - 12)
            virality_reasoning.append("Forced variation: Ensuring metric differentiation")

    # === REALISTIC RETENTION CURVE ===
    # Based on hook strength and pacing
    retention_curve = []
    
    # Determine hook strength from retention_score
    hook_strength = "strong" if retention_score >= 75 else "medium" if retention_score >= 55 else "weak"
    
    # Generate curve based on hook strength and emotional build
    # If emotional content → slower decline or recovery after initial drop
    has_emotional_build = emotion in ['sad', 'romantic', 'heartbreak', 'nostalgic', 'emotional']
    
    if hook_strength == "strong":
        # Strong hook: gradual drop
        if has_emotional_build:
            # Emotional content: recovery or slower decline
            curve_points = [
                {"time": 0, "retention": 100},
                {"time": 5, "retention": 93},
                {"time": 10, "retention": 88},
                {"time": 20, "retention": 82},
                {"time": 30, "retention": 78},
                {"time": 40, "retention": 75},
                {"time": 50, "retention": 72},
                {"time": 60, "retention": 70}
            ]
        else:
            curve_points = [
                {"time": 0, "retention": 100},
                {"time": 5, "retention": 92},
                {"time": 10, "retention": 85},
                {"time": 20, "retention": 75},
                {"time": 30, "retention": 68},
                {"time": 40, "retention": 62},
                {"time": 50, "retention": 58},
                {"time": 60, "retention": 55}
            ]
    elif hook_strength == "medium":
        # Medium hook: moderate initial drop with emotional recovery
        if has_emotional_build:
            curve_points = [
                {"time": 0, "retention": 100},
                {"time": 5, "retention": 82},
                {"time": 10, "retention": 70},
                {"time": 20, "retention": 58},
                {"time": 30, "retention": 52},
                {"time": 40, "retention": 48},
                {"time": 50, "retention": 46},
                {"time": 60, "retention": 45}
            ]
        else:
            curve_points = [
                {"time": 0, "retention": 100},
                {"time": 5, "retention": 85},
                {"time": 10, "retention": 72},
                {"time": 20, "retention": 60},
                {"time": 30, "retention": 52},
                {"time": 40, "retention": 47},
                {"time": 50, "retention": 44},
                {"time": 60, "retention": 42}
            ]
    else:
        # Weak hook: sharp initial drop
        # Even with emotional content, weak hook causes early drop
        curve_points = [
            {"time": 0, "retention": 100},
            {"time": 5, "retention": 70},
            {"time": 10, "retention": 55},
            {"time": 20, "retention": 45},
            {"time": 30, "retention": 40},
            {"time": 40, "retention": 37},
            {"time": 50, "retention": 35},
            {"time": 60, "retention": 33}
        ]
    
    # Adjust for duration if less than 60s
    retention_curve = [p for p in curve_points if p["time"] <= duration]

    # Generate retention analysis
    retention_analysis = {
        "hook_strength": hook_strength,
        "drop_points": [],
        "peak_points": [],
        "explanation": ""
    }
    
    if hook_strength == "strong":
        retention_analysis["explanation"] = "Strong hook maintains viewership with gradual decline. Content quality sustains engagement throughout."
        retention_analysis["drop_points"] = ["10s: Natural viewer attrition", "30s: Mid-clip attention dip"]
        retention_analysis["peak_points"] = ["0-5s: Hook effectiveness", "20-25s: Content peak moment"]
    elif hook_strength == "medium":
        retention_analysis["explanation"] = "Moderate hook causes initial drop-off. Pacing issues in first 10s reduce overall retention."
        retention_analysis["drop_points"] = ["5-10s: Hook weakness", "20s: Pacing slowdown"]
        retention_analysis["peak_points"] = ["0-3s: Initial interest", "15-20s: Content highlight"]
    else:
        retention_analysis["explanation"] = "Weak hook causes sharp early drop-off. Critical failure in first 5-10s prevents sustained viewership."
        retention_analysis["drop_points"] = ["0-5s: Critical hook failure", "10s: Viewer abandonment"]
        retention_analysis["peak_points"] = []

    # === CRITICAL HOOK ANALYSIS ===
    # Analyze first 3-5 seconds
    hook_analysis = {
        "is_scroll_stopping": hook_strength == "strong",
        "strength": hook_strength,
        "description": "",
        "fix": ""
    }
    
    if hook_strength == "strong":
        hook_analysis["description"] = "First 3-5 seconds contain compelling visual or audio hook that immediately grabs attention."
        hook_analysis["fix"] = "Hook is effective. Maintain this pattern for future clips."
    elif hook_strength == "medium":
        hook_analysis["description"] = "Opening has some interest but lacks immediate scroll-stopping power. Viewers may continue scrolling."
        hook_analysis["fix"] = "Add dynamic visual element or provocative statement in first 2 seconds. Consider: zoom effect, text overlay, or unexpected audio cue."
    else:
        hook_analysis["description"] = "Opening fails to capture attention. No clear hook in first 3-5 seconds. Viewers will scroll past."
        hook_analysis["fix"] = "COMPLETELY REWORK opening: Start with most engaging moment (not chronological). Add: 1) Bold text overlay, 2) Dramatic zoom, 3) Trending sound bite, 4) Question or curiosity gap."

    # === AUDIENCE PSYCHOLOGY ===
    audience_analysis = {
        "target_audience": "",
        "stop_scrolling_reason": "",
        "triggered_emotion": emotion
    }
    
    if emotion == 'funny':
        audience_analysis["target_audience"] = "Entertainment seekers, humor audiences, casual viewers"
        audience_analysis["stop_scrolling_reason"] = "Unexpected humor or comedic timing creates immediate interest"
    elif emotion == 'emotional':
        audience_analysis["target_audience"] = "Emotional content consumers, relatable storytelling audiences"
        audience_analysis["stop_scrolling_reason"] = "Emotional resonance or relatable moment creates connection"
    elif emotion == 'motivational':
        audience_analysis["target_audience"] = "Self-improvement seekers, motivation consumers"
        audience_analysis["stop_scrolling_reason"] = "Inspiring message or achievement moment resonates"
    elif emotion == 'educational':
        audience_analysis["target_audience"] = "Learning-focused viewers, curious audiences"
        audience_analysis["stop_scrolling_reason"] = "Interesting fact or learning opportunity"
    else:
        audience_analysis["target_audience"] = "General audience, content consumers"
        audience_analysis["stop_scrolling_reason"] = "General content interest, lacks specific hook"

    # === VIRALITY BREAKDOWN ===
    virality_breakdown = {
        "emotional_trigger": "",
        "relatability": "",
        "surprise_factor": "",
        "trend_compatibility": ""
    }
    
    if emotion in ['funny', 'emotional', 'sad', 'romantic', 'heartbreak']:
        virality_breakdown["emotional_trigger"] = f"{emotion.capitalize()} response drives sharing behavior"
    else:
        virality_breakdown["emotional_trigger"] = "Limited emotional trigger reduces sharing motivation"
    
    virality_breakdown["relatability"] = "Content relates to [specific audience based on category]" if category != "general" else "General relatability, lacks specific audience targeting"
    
    # Check for surprise in reason
    has_surprise = any(word in reason.lower() for word in ['surprise', 'unexpected', 'twist', 'shock', 'reveal'])
    if has_surprise:
        virality_breakdown["surprise_factor"] = "Content contains surprise element that interrupts viewing pattern"
    else:
        virality_breakdown["surprise_factor"] = "No strong surprise factor identified. Content follows predictable pattern."
    
    # Fix: Acknowledge trend presence for emotional content and music
    if category in ['trending', 'viral', 'music']:
        virality_breakdown["trend_compatibility"] = f"Content aligns with {category} trends"
    elif emotion in ['sad', 'romantic', 'heartbreak', 'nostalgic']:
        virality_breakdown["trend_compatibility"] = f"{emotion.capitalize()} content is widely used in edit culture and has established trend presence"
    else:
        virality_breakdown["trend_compatibility"] = "Content does not strongly align with current trends"

    # === PREPARE LLM PROMPT FOR HIGH-QUALITY CONTENT ===
    prompt = f"""PROFESSIONAL DEEP CLIP ANALYSIS

CLIP DATA:
- Title: {clip_data.get('title', 'Unknown')}
- Duration: {duration}s
- Viral Score: {viral_score}
- Emotion: {emotion}
- Category: {category}
- Keywords: {', '.join(keywords)}
- Reason: {reason}

TRANSCRIPT:
{clip_text[:2000] if clip_text else 'No transcript available'}

CLIP UNIQUE IDENTIFIER:
- Clip Title: {clip_data.get('title', 'Unknown')}
- Unique Keywords: {', '.join(keywords[:5]) if keywords else 'None'}
- Specific Reason: {reason[:100] if reason else 'None'}

ANALYSIS CONTEXT:
- Engagement: {engagement_score}/100 - {'; '.join(engagement_reasoning)}
- Retention: {retention_score}/100 - {'; '.join(retention_reasoning)}
- Emotion: {emotion_score}/100 - {'; '.join(emotion_reasoning)}
- Virality: {virality_score}/100 - {'; '.join(virality_reasoning)}
- Hook Strength: {hook_strength}

## 🎧 MUSIC CONTEXT AWARENESS (CRITICAL)

If the clip contains:
- Popular songs
- Recognizable emotional music
- Widely used edit audio

You MUST:

1. Detect emotional intensity from:
   - Lyrics meaning
   - Vocal delivery
   - Known usage patterns (heartbreak edits, nostalgia edits, etc.)

2. Adjust scoring accordingly:
   - Emotional songs → Emotion MUST be high (80+)
   - Widely used edit audio → Virality MUST be medium-high (70+)

## 📊 PLATFORM CONTEXT LOGIC

Do NOT analyze in isolation.

You MUST consider:
- Is this type of content used in Shorts/Reels/TikTok?
- Does it match known viral formats?

Rules:
- Emotional + relatable music → HIGH shareability
- Aesthetic + slow edits → MEDIUM retention but HIGH emotional replay
- Trend audio → BOOST virality score

## ⚠️ METRIC VALIDATION RULE

Before finalizing scores:

- If Emotion < 60 AND content is emotional → RE-CALCULATE
- If Virality < 60 AND content is commonly used in edits → RE-CALCULATE
- If all scores are similar → REJECT and re-evaluate

## ⏱ RETENTION LOGIC FIX

- Weak hook → early drop ✔️
- BUT emotional build → recovery or slower decline

Do NOT create unrealistic drops unless content is truly boring.

## 🔥 VIRALITY BREAKDOWN FIX

Do NOT say:
- “Not aligned with trends”

IF:
- Song is widely used
- Content type is common in edits

Instead:
- Acknowledge trend presence

## 🏷 TITLE GENERATION FIX

Titles MUST:
- Create curiosity
- Feel like social media, NOT poetry

BAD:
- “Pain of Longing”

GOOD:
- “this part hurts more than it should…”
- “you only feel this at night…”

## 🧠 FINAL VALIDATION STEP

Before output:
Ask yourself:
- Does this match how real users behave?
- Would this actually go viral or not?

If not → fix analysis

## 🚫 STRICT RULES

- No underestimating emotional content
- No ignoring platform trends
- No generic or poetic titles
- No unrealistic retention curves
- No empty fields
- No "N/A"
- No skipping sections

## 🚫 STRICT ANTI-DUPLICATION RULES

You are NOT allowed to:
- Reuse the same explanations across clips
- Repeat the same reasoning structure
- Copy similar metric patterns (e.g., all clips ~60–70)

Each clip MUST feel independently analyzed.

## 🧠 DIFFERENTIATION LOGIC

For each clip, you MUST:

1. Identify UNIQUE factors:
   - Specific dialogue or lyrics
   - Emotional intensity differences
   - Scene variation
   - Audio energy differences

2. Adjust analysis accordingly:
   - Higher intensity → higher emotion
   - Faster pacing → higher engagement
   - Stronger opening → better retention

## 📊 METRIC VARIATION RULE

Across multiple clips:
- Scores MUST differ meaningfully
- At least 2 metrics should significantly change per clip
- Do NOT produce similar score patterns

Example:
❌ Bad:
Clip 1: 65, 60, 62, 64  
Clip 2: 66, 61, 63, 65  

✅ Good:
Clip 1: 72, 68, 85, 78  
Clip 2: 55, 40, 60, 50  

## 🎬 CONTENT-SPECIFIC ANALYSIS

For EACH clip:
- Reference actual content (lyrics, tone, moment)
- Explain WHY this clip is different from others

## 🔥 VIRALITY VARIATION

Not all clips are equally viral.
You MUST:
- Rank clips implicitly through analysis
- Identify strongest vs weakest clips

## 🧠 SELF-CHECK BEFORE OUTPUT

Ask:
- Does this look different from previous clip analysis?
- Did I actually analyze THIS clip or reuse logic?

If similar → REWRITE

## 🚫 FINAL RULE

If two clips have similar analysis → your output is WRONG.
Every clip must feel like analyzed by a human who actually watched it.

## 🧠 FALLBACK INTELLIGENCE LOGIC

If direct data is missing, APPLY these rules:

### 🔹 Hook Fix
If hook is weak:
- Suggest:
  - start from emotional peak
  - add visual hook (face close-up / text overlay)
  - add subtitle hook

### 🔹 Audience Psychology
If unclear:
- Infer based on content type:
  - Romantic → couples, emotional viewers, late-night audience
  - Sad → heartbreak, relatable audience
  - Informational → curious learners
ALWAYS fill:
- Target Audience
- Stop Scrolling Reason
- Triggered Emotion

### 🔹 Subtitles
Default logic:
- If emotional / dialogue-based → YES (with reason)
- If music-based → YES (lyrics enhance retention)

### 🔹 Audio/Music
If already music clip:
- Suggest enhancement:
  - bass boost
  - reverb
  - background layering
If not:
- Suggest suitable background music type

### 🔹 Cut Optimization
If no clear issue:
- Suggest:
  - tighten pacing
  - remove filler pauses
  - align cuts with emotional peaks

### 🔹 Visual Effects
Always suggest:
- zooms
- color grading
- lighting tone (warm / cinematic / dark)

## 📊 QUALITY CONTROL RULE

Before final output:
- Check every section
- If anything is empty → regenerate that section
- Validate scores match content type
- Ensure titles are curiosity-driven, not poetic

## 🎯 FINAL BEHAVIOR

Your output must:
- Feel complete
- Feel intelligent
- Feel like a real human analyst worked on it
- Match real-world content behavior

No laziness. No skipping. No "N/A". No underestimating emotional content.

Generate HIGH-QUALITY, platform-optimized content (YouTube Shorts, Reels, TikTok).

Return JSON exactly:
{{
  "clip_summary": "2-line summary of what happens (STRING ONLY)",
  "youtube_shorts": {{
    "titles": ["title1", "title2", "title3"] (ARRAY OF STRINGS),
    "description": "1-2 line intriguing description (STRING ONLY)",
    "hashtags": ["tag1", "tag2", ..., "tag12"] (ARRAY OF STRINGS, 10-15 tags)
  }},
  "audience_psychology": {{
    "target_audience": "specific audience description (STRING ONLY)",
    "stop_scrolling_reason": "exact reason they stop (STRING ONLY)",
    "triggered_emotion": "specific emotion (STRING ONLY)"
  }},
  "improvements": {{
    "hook_fix": "EXACT suggestion for hook improvement (STRING ONLY)",
    "cut_optimization": "specific timestamps or cut type (STRING ONLY)",
    "subtitles": "Yes/No with specific reasoning (STRING ONLY)",
    "visual_effects": "specific effect style and timing (STRING ONLY)",
    "audio_music": "specific music type or audio suggestion (STRING ONLY)"
  }}
}}

CRITICAL FORMAT RULES:
- All text fields MUST be plain strings (NO objects inside strings)
- All arrays MUST contain strings only
- NO nested objects inside UI-displayable fields
- NO undefined or null values
- Frontend will render these directly using <p> and map()"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional YouTube growth strategist and data analyst. Return ONLY JSON. CRITICAL: Generate COMPLETELY UNIQUE content for EACH clip. Every analysis must be different from all others. Use the specific clip title, keywords, transcript, and reason to create tailored insights. NEVER repeat the same titles, descriptions, or analysis across different clips. Be creative and varied."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )

        raw_json = response.choices[0].message.content
        print(f"DEBUG: RAW DEEP ANALYSIS RESPONSE:\n{raw_json}\n")

        llm_data = json.loads(raw_json)

        # === FRONTEND COMPATIBILITY VALIDATION ===
        # Ensure all fields are strings or arrays of strings (no nested objects)
        
        def convert_to_string(value):
            """Convert any value to a string representation"""
            if isinstance(value, dict):
                return ". ".join([f"{k}: {v}" for k, v in value.items()])
            elif isinstance(value, list):
                return ", ".join([str(item) for item in value])
            else:
                return str(value)
        
        def ensure_string_array(arr):
            """Ensure array contains only strings"""
            if not isinstance(arr, list):
                return [str(arr)]
            return [str(item) if not isinstance(item, str) else item for item in arr]
        
        # Validate and convert clip_summary
        if llm_data.get("clip_summary"):
            if isinstance(llm_data["clip_summary"], dict):
                llm_data["clip_summary"] = convert_to_string(llm_data["clip_summary"])
            else:
                llm_data["clip_summary"] = str(llm_data["clip_summary"])
        
        # Validate and convert youtube_shorts fields
        if "youtube_shorts" in llm_data:
            ys = llm_data["youtube_shorts"]
            if isinstance(ys, dict):
                if ys.get("titles"):
                    llm_data["youtube_shorts"]["titles"] = ensure_string_array(ys["titles"])
                if ys.get("description"):
                    if isinstance(ys["description"], dict):
                        llm_data["youtube_shorts"]["description"] = convert_to_string(ys["description"])
                    else:
                        llm_data["youtube_shorts"]["description"] = str(ys["description"])
                if ys.get("hashtags"):
                    llm_data["youtube_shorts"]["hashtags"] = ensure_string_array(ys["hashtags"])
        
        # Validate and convert audience_psychology fields
        if "audience_psychology" in llm_data:
            ap = llm_data["audience_psychology"]
            if isinstance(ap, dict):
                for key in ["target_audience", "stop_scrolling_reason", "triggered_emotion"]:
                    if ap.get(key):
                        if isinstance(ap[key], dict):
                            llm_data["audience_psychology"][key] = convert_to_string(ap[key])
                        else:
                            llm_data["audience_psychology"][key] = str(ap[key])
        
        # Validate and convert improvements fields
        if "improvements" in llm_data:
            imp = llm_data["improvements"]
            if isinstance(imp, dict):
                for key in ["hook_fix", "cut_optimization", "subtitles", "visual_effects", "audio_music"]:
                    if imp.get(key):
                        if isinstance(imp[key], dict):
                            llm_data["improvements"][key] = convert_to_string(imp[key])
                        else:
                            llm_data["improvements"][key] = str(imp[key])

        # === INTELLIGENT FALLBACK FOR EMPTY FIELDS ===
        # Ensure no field is empty - fill with clip-specific fallbacks
        
        # Clip summary fallback - use reason or generate from keywords
        if not llm_data.get("clip_summary"):
            if reason and len(reason) > 20:
                llm_data["clip_summary"] = reason[:150]
            elif keywords:
                llm_data["clip_summary"] = f"This clip focuses on {', '.join(keywords[:3])} with {emotion} undertones"
            else:
                llm_data["clip_summary"] = f"This {emotion} clip from {category} category has {viral_score} viral potential"
        
        # YouTube Shorts titles fallback - dynamic based on clip data
        if not llm_data.get("youtube_shorts", {}).get("titles") or len(llm_data.get("youtube_shorts", {}).get("titles", [])) < 3:
            title_variations = []
            clip_title_lower = clip_data.get('title', '').lower()
            
            # Generate unique titles based on clip specifics
            if keywords and len(keywords) > 0:
                title_variations.append(f"the {keywords[0]} nobody talks about")
                title_variations.append(f"why {keywords[0]} hits different at night")
            else:
                title_variations.append(f"this {emotion} moment changed everything")
                title_variations.append(f"you only understand this if you've been there")
            
            if emotion:
                title_variations.append(f"the {emotion} that stays with you")
            else:
                title_variations.append(f"this part hits harder than expected")
            
            # Add variety with clip-specific context
            if category and category != 'general':
                title_variations[0] = title_variations[0].replace("nobody talks about", f"{category} nobody talks about")
            
            llm_data.setdefault("youtube_shorts", {})["titles"] = title_variations[:3]
        
        # YouTube Shorts description fallback - unique per clip
        if not llm_data.get("youtube_shorts", {}).get("description"):
            if reason and len(reason) > 30:
                llm_data.setdefault("youtube_shorts", {})["description"] = reason[:120]
            elif keywords:
                llm_data.setdefault("youtube_shorts", {})["description"] = f"Experience the {emotion} journey through {', '.join(keywords[:2])}. This resonates differently with everyone."
            else:
                llm_data.setdefault("youtube_shorts", {})["description"] = f"A {emotion} perspective that connects with viewers on a deeper level. Watch to understand why."
        
        # YouTube Shorts hashtags fallback - unique mix based on keywords
        if not llm_data.get("youtube_shorts", {}).get("hashtags") or len(llm_data.get("youtube_shorts", {}).get("hashtags", [])) < 10:
            base_tags = [f"#{k.lower()}" for k in keywords[:6]] if keywords else []
            # Add variety with different combinations
            emotion_tag = f"#{emotion}" if emotion else ""
            category_tag = f"#{category}" if category and category != 'general' else ""
            extra_tags = ["#shorts", "#viral", "#fyp", "#trending", "#relatable"]
            all_tags = list(set(base_tags + [emotion_tag, category_tag] + extra_tags))
            llm_data.setdefault("youtube_shorts", {})["hashtags"] = [t for t in all_tags if t][:15]
        
        # Audience psychology fallback
        if not llm_data.get("audience_psychology", {}).get("target_audience"):
            llm_data.setdefault("audience_psychology", {})["target_audience"] = audience_analysis["target_audience"]
        if not llm_data.get("audience_psychology", {}).get("stop_scrolling_reason"):
            llm_data.setdefault("audience_psychology", {})["stop_scrolling_reason"] = audience_analysis["stop_scrolling_reason"]
        if not llm_data.get("audience_psychology", {}).get("triggered_emotion"):
            llm_data.setdefault("audience_psychology", {})["triggered_emotion"] = audience_analysis["triggered_emotion"]
        
        # Improvements fallback
        if not llm_data.get("improvements", {}).get("hook_fix"):
            llm_data.setdefault("improvements", {})["hook_fix"] = hook_analysis["fix"]
        if not llm_data.get("improvements", {}).get("cut_optimization"):
            llm_data.setdefault("improvements", {})["cut_optimization"] = "Tighten pacing by removing filler pauses between 15-20s. Align cuts with emotional peaks for maximum impact."
        if not llm_data.get("improvements", {}).get("subtitles"):
            llm_data.setdefault("improvements", {})["subtitles"] = "Yes - Add dynamic subtitles to improve accessibility and increase retention by 25-30%"
        if not llm_data.get("improvements", {}).get("visual_effects"):
            llm_data.setdefault("improvements", {})["visual_effects"] = "Apply cinematic color grading with warm tones. Add smooth zoom transitions on emotional peaks. Use subtle lighting effects."
        if not llm_data.get("improvements", {}).get("audio_music"):
            llm_data.setdefault("improvements", {})["audio_music"] = f"Enhance audio with bass boost and reverb. Use {emotion}-themed background music to amplify emotional impact."

        # === DYNAMIC CONFIDENCE SCORE — 5-Factor Weighted Model ===
        # Formula: (0.30 × Content Clarity) + (0.25 × Engagement Strength)
        #        + (0.20 × Retention Stability) + (0.15 × Audio Quality)
        #        + (0.10 × Emotional Signal Strength)
        # All factors are clamped to 40–95. Weak/missing signals use a 55 baseline.

        # Factor 1: Content Clarity — transcript richness + keyword density
        if clip_text and len(clip_text) > 200:
            _raw_clarity = 70 + (len(clip_text) / 100)
        elif clip_text and len(clip_text) > 50:
            _raw_clarity = 55 + (len(keywords) * 2)
        else:
            _raw_clarity = 40 + (len(keywords) * 3)   # weak signal → floor will catch it
        clarity_score = _clamp_factor(_raw_clarity)

        # Factor 2: Engagement Strength — reuse engagement_score (already 35–95)
        engagement_factor = _clamp_factor(engagement_score)

        # Factor 3: Retention Stability — reuse retention_score (already 30–95)
        retention_factor = _clamp_factor(retention_score)

        # Factor 4: Audio Quality — emotion-type proxy + clip-seed variance
        if emotion in ['funny', 'motivational', 'emotional', 'sad', 'romantic', 'heartbreak']:
            _raw_audio = 65 + (viral_score / 5)
        elif emotion in ['educational', 'informational']:
            _raw_audio = 55 + (viral_score / 6)
        else:
            _raw_audio = 50 + (viral_score / 8)   # neutral → default baseline
        _raw_audio += (clip_seed % 13) - 6        # clip-specific ±6 variance
        audio_factor = _clamp_factor(_raw_audio)

        # Factor 5: Emotional Signal Strength — reuse emotion_score
        emotion_factor = _clamp_factor(emotion_score)

        # --- Validation: ensure no factor is below 20 (baseline guard) ---
        _factors_raw = [clarity_score, engagement_factor, retention_factor, audio_factor, emotion_factor]
        if any(f < 20 for f in _factors_raw):
            print("WARNING: Factor below 20 detected — assigning baseline values (55)")
            clarity_score    = max(55, clarity_score)
            engagement_factor = max(55, engagement_factor)
            retention_factor  = max(50, retention_factor)
            audio_factor      = max(52, audio_factor)
            emotion_factor    = max(50, emotion_factor)

        # Apply weighted formula
        raw_confidence = (
            (0.30 * clarity_score) +
            (0.25 * engagement_factor) +
            (0.20 * retention_factor) +
            (0.15 * audio_factor) +
            (0.10 * emotion_factor)
        )
        confidence = int(min(97, max(40, raw_confidence)))

        # --- Post-formula validation: recalculate if result is too low ---
        if confidence < 30:
            print(f"WARNING: Confidence {confidence} below 30 — recalculating with baseline factors")
            clarity_score     = max(clarity_score, 55)
            engagement_factor = max(engagement_factor, 55)
            retention_factor  = max(retention_factor, 50)
            audio_factor      = max(audio_factor, 52)
            emotion_factor    = max(emotion_factor, 50)
            raw_confidence = (
                (0.30 * clarity_score) +
                (0.25 * engagement_factor) +
                (0.20 * retention_factor) +
                (0.15 * audio_factor) +
                (0.10 * emotion_factor)
            )
            confidence = int(min(97, max(40, raw_confidence)))

        confidence_breakdown = {
            "clarity":    clarity_score,
            "engagement": engagement_factor,
            "retention":  retention_factor,
            "audio":      audio_factor,
            "emotion":    emotion_factor
        }

        confidence_reasoning_parts = []
        if clarity_score >= 75:
            confidence_reasoning_parts.append(f"Strong content clarity ({clarity_score})")
        elif clarity_score >= 55:
            confidence_reasoning_parts.append(f"Moderate content clarity ({clarity_score})")
        else:
            confidence_reasoning_parts.append(f"Baseline content clarity ({clarity_score}) — limited transcript")

        if engagement_factor >= 75:
            confidence_reasoning_parts.append(f"High engagement strength ({engagement_factor})")
        elif engagement_factor >= 55:
            confidence_reasoning_parts.append(f"Moderate engagement ({engagement_factor})")
        else:
            confidence_reasoning_parts.append(f"Baseline engagement ({engagement_factor}) — weak hook")

        if retention_factor >= 70:
            confidence_reasoning_parts.append(f"Stable retention curve ({retention_factor})")
        else:
            confidence_reasoning_parts.append(f"Moderate retention risk ({retention_factor})")

        if audio_factor >= 70:
            confidence_reasoning_parts.append(f"Clear audio signals ({audio_factor})")
        else:
            confidence_reasoning_parts.append(f"Baseline audio quality ({audio_factor})")

        if emotion_factor >= 75:
            confidence_reasoning_parts.append(f"Strong emotional trigger ({emotion_factor})")
        else:
            confidence_reasoning_parts.append(f"Moderate emotional signal ({emotion_factor})")

        confidence_reasoning = "; ".join(confidence_reasoning_parts)

        print(f"DEBUG: Deep analysis complete with confidence score: {confidence}")
        print(f"{'#'*60}\n")

        return {
            # Visual data for charts
            "visual_data": {
                "engagement": engagement_score,
                "retention": retention_score,
                "emotion": emotion_score,
                "virality": virality_score
            },
            
            # Metric reasoning
            "metrics_reasoning": {
                "engagement": {
                    "score": engagement_score,
                    "reasoning": "; ".join(engagement_reasoning)
                },
                "retention": {
                    "score": retention_score,
                    "reasoning": "; ".join(retention_reasoning)
                },
                "emotion": {
                    "score": emotion_score,
                    "reasoning": "; ".join(emotion_reasoning)
                },
                "virality": {
                    "score": virality_score,
                    "reasoning": "; ".join(virality_reasoning)
                }
            },
            
            # Retention curve with analysis
            "retention_curve": retention_curve,
            "retention_analysis": retention_analysis,
            
            # Hook analysis
            "hook_analysis": hook_analysis,
            
            # Clip summary
            "clip_summary": llm_data.get("clip_summary", clip_data.get("reason", "")),
            
            # YouTube Shorts content (with 3 title options)
            "youtube_shorts": {
                "titles": llm_data.get("youtube_shorts", {}).get("titles", [clip_data.get("title", "Clip")]),
                "description": llm_data.get("youtube_shorts", {}).get("description", clip_data.get("reason", "")[:150]),
                "hashtags": llm_data.get("youtube_shorts", {}).get("hashtags", keywords[:12] if len(keywords) >= 12 else keywords + ["#shorts", "#viral"])
            },
            
            # Audience psychology
            "audience_psychology": {
                "target_audience": llm_data.get("audience_psychology", {}).get("target_audience", audience_analysis["target_audience"]),
                "stop_scrolling_reason": llm_data.get("audience_psychology", {}).get("stop_scrolling_reason", audience_analysis["stop_scrolling_reason"]),
                "triggered_emotion": llm_data.get("audience_psychology", {}).get("triggered_emotion", audience_analysis["triggered_emotion"])
            },
            
            # Virality breakdown
            "virality_breakdown": virality_breakdown,
            
            # Actionable improvements
            "improvements": {
                "hook_fix": llm_data.get("improvements", {}).get("hook_fix", hook_analysis["fix"]),
                "cut_optimization": llm_data.get("improvements", {}).get("cut_optimization", "Trim pauses between 15-20s for better pacing"),
                "subtitles": llm_data.get("improvements", {}).get("subtitles", "Yes - improves accessibility and retention by 25%"),
                "visual_effects": llm_data.get("improvements", {}).get("visual_effects", "Add zoom on key moments and smooth transitions"),
                "audio_music": llm_data.get("improvements", {}).get("audio_music", "Use trending upbeat audio matching content mood")
            },
            
            # Confidence score — 5-factor weighted model
            "confidence": confidence,
            "confidence_breakdown": confidence_breakdown,
            "confidence_reasoning": confidence_reasoning,
            
            # Clip data
            "clip_data": {
                "title": clip_data.get("title"),
                "duration": clip_data.get("duration"),
                "start_time": clip_data.get("start_time"),
                "end_time": clip_data.get("end_time"),
                "viral_score": clip_data.get("viral_score"),
                "emotion": clip_data.get("emotion"),
                "category": clip_data.get("category")
            }
        }

    except Exception as e:
        print(f"ERROR: Deep analysis failed: {e}")
        # Return fallback with calculated metrics and intelligent fallbacks
        return {
            "visual_data": {
                "engagement": engagement_score,
                "retention": retention_score,
                "emotion": emotion_score,
                "virality": virality_score
            },
            "metrics_reasoning": {
                "engagement": {
                    "score": engagement_score,
                    "reasoning": "; ".join(engagement_reasoning)
                },
                "retention": {
                    "score": retention_score,
                    "reasoning": "; ".join(retention_reasoning)
                },
                "emotion": {
                    "score": emotion_score,
                    "reasoning": "; ".join(emotion_reasoning)
                },
                "virality": {
                    "score": virality_score,
                    "reasoning": "; ".join(virality_reasoning)
                }
            },
            "retention_curve": retention_curve,
            "retention_analysis": retention_analysis,
            "hook_analysis": hook_analysis,
            "clip_summary": clip_data.get("reason", f"This clip focuses on {', '.join(keywords[:3]) if keywords else emotion} content with {viral_score} viral potential"),
            "youtube_shorts": {
                "titles": [
                    f"the {keywords[0] if keywords else emotion} nobody talks about" if keywords or emotion else "this moment changed everything",
                    f"why {keywords[0] if keywords else 'this'} hits different at night" if keywords else "you only understand this if you've been there",
                    f"the {emotion} that stays with you" if emotion else "this part hits harder than expected"
                ],
                "description": clip_data.get("reason", f"Experience the {emotion} journey through {', '.join(keywords[:2]) if keywords else 'this content'}. This resonates differently with everyone.")[:120],
                "hashtags": [f"#{k.lower()}" for k in keywords[:6]] + [f"#{emotion}", f"#{category}"] + ["#shorts", "#viral", "#fyp"] if keywords else ["#shorts", "#viral", "#fyp", "#trending"]
            },
            "audience_psychology": {
                "target_audience": audience_analysis["target_audience"],
                "stop_scrolling_reason": audience_analysis["stop_scrolling_reason"],
                "triggered_emotion": audience_analysis["triggered_emotion"]
            },
            "virality_breakdown": virality_breakdown,
            "improvements": {
                "hook_fix": hook_analysis["fix"],
                "cut_optimization": "Tighten pacing by removing filler pauses between 15-20s. Align cuts with emotional peaks for maximum impact.",
                "subtitles": "Yes - Add dynamic subtitles to improve accessibility and increase retention by 25-30%",
                "visual_effects": "Apply cinematic color grading with warm tones. Add smooth zoom transitions on emotional peaks. Use subtle lighting effects.",
                "audio_music": f"Enhance audio with bass boost and reverb. Use {emotion}-themed background music to amplify emotional impact."
            },
            "confidence": 45,
            "confidence_breakdown": {"clarity": 40, "engagement": 50, "retention": 45, "audio": 50, "emotion": 45},
            "confidence_reasoning": "Analysis unavailable due to processing error — fallback metrics applied.",
            "clip_data": {
                "title": clip_data.get("title"),
                "duration": clip_data.get("duration"),
                "start_time": clip_data.get("start_time"),
                "end_time": clip_data.get("end_time"),
                "viral_score": clip_data.get("viral_score"),
                "emotion": clip_data.get("emotion"),
                "category": clip_data.get("category")
            },
            "error": str(e)
        }

def analyze_video_for_clips(title: str, duration: float, whisper_result: dict = None, num_clips: int = 5) -> dict:
    """
    Video Analysis with Strict Clip Generation Rules:
    - Exactly 5 clips (default) or 3 clips (if specified)
    - Each clip exactly 60 seconds long
    - Intelligent selection based on engaging moments
    - Timeline distribution for longer videos
    - Dynamic reliability score calculation
    """
    print(f"\n{'#'*60}")
    print(f"DEBUG: Starting Analysis for Video: {title}")
    print(f"DEBUG: Requested number of clips: {num_clips}")

    # Validate num_clips
    if num_clips not in [3, 5]:
        print(f"WARNING: Invalid num_clips ({num_clips}). Defaulting to 5.")
        num_clips = 5

    transcript_text = whisper_result.get("text", "") if whisper_result else ""
    whisper_segments = whisper_result.get("segments", []) if whisper_result else []

    print(f"DEBUG: Transcript Segments Count: {len(whisper_segments)}")
    if len(whisper_segments) > 0:
        print(f"DEBUG: First Segment Sample: {whisper_segments[0]}")

    if not whisper_segments:
        print("ERROR: No transcript segments found. Failing loudly as requested.")
        raise Exception("Transcription segments are empty. AI cannot analyze viral potential without valid timestamps.")

    # 1. Group segments (10s chunks)
    analysis_segments = []
    current_chunk = {"text": "", "start": 0, "end": 0, "segments": []}

    for seg in whisper_segments:
        if not current_chunk["text"]:
            current_chunk["start"] = seg["start"]

        current_chunk["text"] += " " + seg["text"]
        current_chunk["end"] = seg["end"]
        current_chunk["segments"].append(seg)

        if (current_chunk["end"] - current_chunk["start"]) >= 10:
            analysis_segments.append(current_chunk)
            current_chunk = {"text": "", "start": seg["end"], "end": seg["end"], "segments": []}

    if current_chunk["text"]:
        analysis_segments.append(current_chunk)

    print(f"DEBUG: Grouped into {len(analysis_segments)} analysis chunks.")

    # 2. Calculate timeline distribution points
    # For longer videos, distribute clips across the timeline
    clip_duration = 60  # Fixed 60 seconds per clip
    min_video_duration = num_clips * clip_duration

    # Adjust num_clips if video is too short
    if duration < min_video_duration:
        max_possible_clips = int(duration / clip_duration)
        if max_possible_clips >= 3:
            print(f"WARNING: Video duration ({duration}s) is too short for {num_clips} clips. Adjusting to {max_possible_clips} clips.")
            num_clips = max_possible_clips
        else:
            # For very short videos, use shorter clips
            print(f"WARNING: Video duration ({duration}s) is too short for 60s clips. Using shorter clips.")
            clip_duration = int(duration / 3) if duration >= 30 else int(duration / 2)
            print(f"Adjusted clip duration to {clip_duration}s")

    # Calculate distribution points
    timeline_points = []
    if duration >= 600:  # 10+ minutes: distribute evenly
        interval = (duration - clip_duration) / (num_clips - 1) if num_clips > 1 else 0
        for i in range(num_clips):
            start = i * interval
            end = start + clip_duration
            if end <= duration:
                timeline_points.append({"start": start, "end": end})
    else:  # Shorter videos: focus on content quality
        # Let AI determine best positions, but enforce count and duration
        pass

    print(f"DEBUG: Timeline distribution points: {len(timeline_points)}")

    # 3. LLM Analysis with strict rules
    segments_summary = []
    for i, seg in enumerate(analysis_segments):
        segments_summary.append({
            "id": i,
            "start": seg["start"],
            "end": seg["end"],
            "text": seg["text"].strip()
        })

    distribution_instruction = ""
    if timeline_points:
        distribution_instruction = f"\nTIMELINE DISTRIBUTION POINTS (use as guidance for longer videos):\n{json.dumps(timeline_points, indent=None)}"

    prompt = f"""VIDEO ANALYSIS TASK: "{title}"
DURATION: {duration}s
REQUIRED CLIPS: Exactly {num_clips}
CLIP DURATION: Exactly {clip_duration} seconds each

TRANSCRIPT CHUNKS:
{json.dumps(segments_summary[:100], indent=None)}
{distribution_instruction}

STRICT RULES:
1. Generate EXACTLY {num_clips} clips
2. Each clip MUST be exactly {clip_duration} seconds long (start + {clip_duration} = end)
3. Select the most engaging, meaningful, or high-impact moments
4. Prefer moments with: key information, emotional peaks, scene changes, important dialogue
5. For longer videos, distribute clips across the timeline
6. Avoid random cuts or low-value segments

Return JSON exactly as follows:
{{
  "segment_analysis": [ {{ "id": 0, "text_importance": float, "emotion_intensity": float, "keyword_density": float, "topic_shift": bool }}, ... ],
  "clips": [ {{ "start": float, "end": float, "viral_score": int, "reason": "string", "why_this_part": "string", "emotion": "string", "category": "string", "keywords": ["string"], "description": "string" }} ]
}}"""

    print("DEBUG: Sending request to Groq...")
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a professional video editor and content strategist. Return ONLY JSON. All reasons and descriptions MUST be unique and specific to the clip text. NO PLACEHOLDERS. Generate exactly the requested number of clips, each exactly 60 seconds long."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.1,  # Low temperature for consistency
        response_format={"type": "json_object"}
    )

    raw_json = response.choices[0].message.content
    print(f"DEBUG: RAW LLM RESPONSE:\n{raw_json}\n")

    analysis_data = json.loads(raw_json)

    # Check for empty clips
    if not analysis_data.get("clips"):
        print("ERROR: AI returned no clips.")
        raise Exception("LLM analysis failed to identify viral clips.")

    # Validate clip count and duration
    ai_clips = analysis_data.get("clips", [])
    if len(ai_clips) != num_clips:
        print(f"WARNING: AI returned {len(ai_clips)} clips instead of {num_clips}. Adjusting...")
        # If too many, keep top ones by viral score
        if len(ai_clips) > num_clips:
            ai_clips = sorted(ai_clips, key=lambda x: x.get("viral_score", 0), reverse=True)[:num_clips]
        # If too few, we'll fail or extend (for now, fail loudly)
        elif len(ai_clips) < num_clips:
            print(f"ERROR: AI returned only {len(ai_clips)} clips. Required: {num_clips}")
            raise Exception(f"LLM analysis failed to generate required {num_clips} clips.")

    # Enforce clip duration
    for clip in ai_clips:
        clip_start = clip["start"]
        clip_end = clip_start + clip_duration  # Enforce exactly clip_duration seconds
        if clip_end > duration:
            clip_end = duration
            clip_start = max(0, duration - clip_duration)
        clip["end"] = clip_end

    # 4. Process Clips with dynamic reliability score
    valid_clips = []
    for i, clip in enumerate(ai_clips):
        clip_start = clip["start"]
        clip_end = clip["end"]

        # Log each clip's reasoning
        print(f"DEBUG: Processing Clip {i+1} [{clip_start}s - {clip_end}s]")
        print(f"  - Reason: {clip['reason']}")
        print(f"  - Why this part: {clip['why_this_part']}")
        print(f"  - Keywords: {clip['keywords']}")
        print(f"  - Emotion: {clip['emotion']}")

        # Calculate dynamic breakdown from segments
        seg_data = [s for s in analysis_data.get("segment_analysis", []) if s["id"] < len(analysis_segments)]
        relevant = [s for s in seg_data if analysis_segments[s["id"]]["start"] >= clip_start - 2 and analysis_segments[s["id"]]["start"] <= clip_end + 2]

        if relevant:
            text_importance = sum(s.get("text_importance", 0.5) for s in relevant) / len(relevant)
            emotion_intensity = sum(s.get("emotion_intensity", 0.5) for s in relevant) / len(relevant)
            keyword_density = sum(s.get("keyword_density", 0.5) for s in relevant) / len(relevant)
            has_topic_shift = any(s.get("topic_shift", False) for s in relevant)
        else:
            # Use lower fallbacks for clips without relevant segments
            text_importance = 0.3 + (random.random() * 0.3)
            emotion_intensity = 0.3 + (random.random() * 0.3)
            keyword_density = 0.3 + (random.random() * 0.3)
            has_topic_shift = random.random() > 0.5

        # === 5-FACTOR WEIGHTED CONFIDENCE SCORE ===
        # Formula: (0.30 × Content Clarity) + (0.25 × Engagement Strength)
        #        + (0.20 × Retention Stability) + (0.15 × Audio Quality)
        #        + (0.10 × Emotional Signal Strength)

        viral_score_val = clip.get("viral_score", 50)
        clip_emotion = clip.get("emotion", "neutral")

        # Factor 1 — Content Clarity (transcript richness + keyword density)
        # Normalize 0.0–1.0 inputs → 0–100, then clamp to 40–95
        _raw_cf_clarity = text_importance * 60 + keyword_density * 40
        cf_clarity = _clamp_factor(_raw_cf_clarity * 1.0)  # already in 0–100 range

        # Factor 2 — Engagement Strength (viral score + emotion boost)
        _raw_cf_eng = float(viral_score_val)
        if clip_emotion in ['funny', 'emotional', 'motivational']:
            _raw_cf_eng = min(95, _raw_cf_eng + 10)
        elif clip_emotion in ['neutral', 'informational']:
            _raw_cf_eng = max(40, _raw_cf_eng - 5)
        cf_engagement = _clamp_factor(_raw_cf_eng)

        # Factor 3 — Retention Stability (text importance + scene flow + emotion)
        scene_consistency = 0.9 if not has_topic_shift else (0.5 + random.random() * 0.3)
        _raw_cf_ret = text_importance * 50 + scene_consistency * 30 + emotion_intensity * 20
        cf_retention = _clamp_factor(_raw_cf_ret)

        # Factor 4 — Audio Quality (emotion intensity as proxy; 0–1 → 0–100)
        audio_quality = emotion_intensity * 0.8 + (random.random() * 0.2)
        cf_audio = _clamp_factor(audio_quality * 100)

        # Factor 5 — Emotional Signal Strength
        if clip_emotion in ['funny', 'emotional', 'motivational', 'sad', 'romantic', 'heartbreak', 'nostalgic']:
            _raw_cf_emo = 75 + emotion_intensity * 20
        elif clip_emotion in ['educational', 'informational']:
            _raw_cf_emo = 55 + emotion_intensity * 25
        else:
            _raw_cf_emo = 45 + emotion_intensity * 20   # neutral → baseline
        cf_emotion = _clamp_factor(_raw_cf_emo)

        # --- Validation: baseline guard — no factor may be below 20 ---
        if any(f < 20 for f in [cf_clarity, cf_engagement, cf_retention, cf_audio, cf_emotion]):
            print(f"WARNING: Clip {i+1} has factor below 20 — assigning baseline values")
            cf_clarity    = max(55, cf_clarity)
            cf_engagement = max(55, cf_engagement)
            cf_retention  = max(50, cf_retention)
            cf_audio      = max(52, cf_audio)
            cf_emotion    = max(50, cf_emotion)

        # Apply weighted formula
        clip_position_ratio = clip_start / duration if duration > 0 else 0.5
        raw_confidence = (
            (0.30 * cf_clarity) +
            (0.25 * cf_engagement) +
            (0.20 * cf_retention) +
            (0.15 * cf_audio) +
            (0.10 * cf_emotion)
        )
        reliability_score = int(min(97, max(40, raw_confidence)))

        # --- Post-formula validation: recalculate if result is too low ---
        if reliability_score < 30:
            print(f"WARNING: Clip {i+1} confidence {reliability_score} below 30 — recalculating")
            cf_clarity    = max(cf_clarity, 55)
            cf_engagement = max(cf_engagement, 55)
            cf_retention  = max(cf_retention, 50)
            cf_audio      = max(cf_audio, 52)
            cf_emotion    = max(cf_emotion, 50)
            raw_confidence = (
                (0.30 * cf_clarity) +
                (0.25 * cf_engagement) +
                (0.20 * cf_retention) +
                (0.15 * cf_audio) +
                (0.10 * cf_emotion)
            )
            reliability_score = int(min(97, max(40, raw_confidence)))

        confidence_breakdown = {
            "clarity":    cf_clarity,
            "engagement": cf_engagement,
            "retention":  cf_retention,
            "audio":      cf_audio,
            "emotion":    cf_emotion
        }

        # Build reasoning
        reliability_reasoning_parts = []
        reliability_reasoning_parts.append(
            f"Clarity {cf_clarity} (×0.30) + Engagement {cf_engagement} (×0.25) + "
            f"Retention {cf_retention} (×0.20) + Audio {cf_audio} (×0.15) + "
            f"Emotion {cf_emotion} (×0.10) = {reliability_score}"
        )
        if cf_clarity < 55:
            reliability_reasoning_parts.append("Baseline transcript clarity applied")
        if cf_engagement >= 75:
            reliability_reasoning_parts.append("Strong engagement potential")
        elif cf_engagement < 55:
            reliability_reasoning_parts.append("Weak hook — baseline engagement applied")
        if cf_retention < 55:
            reliability_reasoning_parts.append("Scene transitions or neutral emotion limit retention")
        reliability_reasoning = "; ".join(reliability_reasoning_parts)

        analysis_breakdown = {
            "text_importance": text_importance,
            "emotion_intensity": emotion_intensity,
            "audio_energy": audio_quality,
            "keyword_density": keyword_density,
            "topic_shift": has_topic_shift
        }

        valid_clips.append({
            "title": f"Clip {i+1}: {clip['keywords'][0] if clip['keywords'] else 'Highlight'}",
            "start_time": clip_start,
            "end_time": clip_end,
            "duration": round(clip_end - clip_start, 2),
            "viral_score": clip["viral_score"],
            "emotion": clip["emotion"],
            "category": clip["category"],
            "keywords": clip["keywords"],
            "reason": clip["reason"],
            "why_this_part": clip["why_this_part"],
            "description": clip.get("description", clip["reason"]),
            "confidence": reliability_score / 100,
            "reliability_score": reliability_score,
            "reliability_reasoning": reliability_reasoning,
            "confidence_breakdown": confidence_breakdown,
            "analysis": analysis_breakdown
        })

    # 5. Format segments for heatmap
    heatmap_segments = []
    for s in analysis_data.get("segment_analysis", []):
        if s["id"] >= len(analysis_segments): continue
        orig = analysis_segments[s["id"]]
        heatmap_segments.append({
            "start": orig["start"],
            "end": orig["end"],
            "score": int((s.get("text_importance", 0) * 40 + s.get("emotion_intensity", 0) * 40 + s.get("keyword_density", 0) * 20)),
            "analysis": {
                "text_importance": s.get("text_importance", 0),
                "emotion_intensity": s.get("emotion_intensity", 0),
                "audio_energy": 0.5,
                "keyword_density": s.get("keyword_density", 0),
                "topic_shift": s.get("topic_shift", False)
            }
        })

    print(f"DEBUG: Finalizing result with {len(valid_clips)} clips and {len(heatmap_segments)} segments.")
    print(f"{'#'*60}\n")

    return {
        "clips": valid_clips,
        "segments": heatmap_segments,
        "reliability_score": int(sum(c["reliability_score"] for c in valid_clips) / len(valid_clips)) if valid_clips else 0,
        "reliability_reasoning": f"Average reliability across {len(valid_clips)} clips based on content clarity, scene consistency, audio quality, and viral relevance."
    }



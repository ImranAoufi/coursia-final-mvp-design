from fastapi.staticfiles import StaticFiles
from fastapi import BackgroundTasks
import base64
import os
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi import Request
from fastapi import UploadFile, File
from pathlib import Path
import io
import tempfile
from PyPDF2 import PdfReader
from docx import Document
from fastapi import UploadFile, File, Form
from typing import List
from typing import List, Optional
import asyncio
import uuid
import json
import shutil
from fastapi.responses import FileResponse
from fastapi import File, UploadFile, Form
from PIL import Image
import docx
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# OpenAI Client initialisieren
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
app = FastAPI()
app.mount("/generated", StaticFiles(directory=os.path.join(os.getcwd(),
          "generated")), name="generated")

# --- CORS (Frontend darf Backend ansprechen) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # später können wir das genauer einstellen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Testroute ---


@app.get("/")
def read_root():
    return {"message": "Backend is running 🚀"}


class PreviewRequest(BaseModel):
    prompt: str
    num_lessons: int
    videos_per_lesson: int
    include_quiz: bool
    include_workbook: bool
    format: Optional[str] = None
    outcome: str | None = None
    audience: str | None = None
    audienceLevel: str | None = None
    materials: str | None = None
    links: str | None = None  # 👈 Neu


@app.post("/api/preview-course")
async def preview_course(req: PreviewRequest):
    """
    Generate a simple course preview (structure only, no full content).
    Deterministic lesson count chosen from format ranges (no randomness).
    """
    # Log input for easier debugging
    print("🧩 preview_course called with:", req.model_dump())

    # Logical lesson ranges by format
    format_ranges = {
        "Micro": (3, 5),
        "Standard": (6, 10),
        "Masterclass": (12, 15)
    }

    # Default: use provided num_lessons if present
    min_lessons, max_lessons = (req.num_lessons, req.num_lessons)

    # If format provided, override ranges
    if getattr(req, "format", None):
        fmt = req.format.capitalize()
        if fmt in format_ranges:
            min_lessons, max_lessons = format_ranges[fmt]

    # Deterministic choice: use the integer midpoint of the range
    exact_count = (min_lessons + max_lessons) // 2

    prompt = f"""
You are an expert instructional designer.

The user provided this base information:

- Goal / Outcome: {req.outcome or "No outcome provided"}
- Target Audience: {req.audience or "Not specified"} ({req.audienceLevel or "—"})
- Course Size: {req.format or "Standard"}
- Materials or resources: {req.materials or "None"}
- Reference links or files: {req.links or "None"}

Topic prompt from user:
{req.prompt}

Now create a course structure in valid JSON for this topic.

Format: {req.format or "Standard"} Course

Guidelines (deterministic):
- Generate exactly {exact_count} lessons (not a range).
- Each lesson should have about {req.videos_per_lesson} videos.

Each lesson must include:
- "lesson_title"
- "video_titles" (list of strings)
- "quiz": true/false
- "workbook": true/false

Always keep "quiz"={req.include_quiz} and "workbook"={req.include_workbook}.

Return ONLY valid JSON. Do NOT wrap output in markdown code fences or add explanatory text.
"""

    # Use low temperature for deterministic output
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0,
    )

    raw = completion.choices[0].message.content
    print("🧠 Raw OpenAI Output:", raw[:1000])
    return {"preview": raw}


UPLOAD_DIR = Path("uploaded_files")
UPLOAD_DIR.mkdir(exist_ok=True)


@app.post("/api/outcome")
async def save_outcome(request: Request):
    """
    Speichert das Outcome (Ziel des Kurses) vom Frontend.
    Wird aufgerufen, wenn der Nutzer seinen Outcome-Step abgeschlossen hat.
    """
    data = await request.json()
    outcome_text = data.get("outcome")

    print("✅ Outcome received from frontend:", outcome_text)

    # Später kann man es hier speichern oder an Preview weitergeben
    return {"status": "ok", "outcome": outcome_text}


class AudienceRequest(BaseModel):
    audience: str | None = None
    audienceLevel: str | None = None


@app.post("/api/audience")
async def receive_audience(payload: AudienceRequest):
    # Loggen für Debugging - damit du siehst, was ankommt
    print("📥 /api/audience called with:", payload.model_dump())
    # Hier kannst du später speichern, analysieren oder in DB schreiben
    return {"status": "ok", "received": payload.model_dump()}


@app.post("/api/materials")
async def receive_materials(files: list[UploadFile] = File(...)):
    extracted_texts = []

    for file in files:
        filename = file.filename.lower()
        content = await file.read()
        text = ""

        # 1️⃣ PDFs
        if filename.endswith(".pdf"):
            pdf_reader = PdfReader(io.BytesIO(content))
            for page in pdf_reader.pages:
                text += page.extract_text() or ""

        # 2️⃣ Bilder (OCR)
        elif filename.endswith((".png", ".jpg", ".jpeg")):
            image = Image.open(io.BytesIO(content))
            text = pytesseract.image_to_string(image)

        # 3️⃣ Textdateien
        elif filename.endswith(".txt"):
            text = content.decode("utf-8")

        extracted_texts.append({
            "filename": filename,
            "content": text[:2000]  # Safety limit
        })

    print("📄 Extracted texts from uploaded files:", extracted_texts)
    # 🧠 Schritt 2: An OpenAI schicken, um Vorschaukurs zu generieren
    try:
        all_texts = "\n\n".join([t["content"] for t in extracted_texts])
        prompt = f"""
You are an expert course designer. Based on the following uploaded materials, create a structured course outline.

Extracted content:
{all_texts}

Return a JSON structure describing the course, like:
{{
  "course_title": "...",
  "course_description": "...",
  "lessons": [
    {{
      "lesson_title": "...",
      "video_titles": ["..."],
      "quiz": true,
      "workbook": true
    }}
  ]
}}

Return ONLY valid JSON — no markdown, no explanations.
"""

        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )

        ai_output = completion.choices[0].message.content.strip()
        print("🧠 OpenAI Output:", ai_output[:1000])

        return {"status": "ok", "materials": extracted_texts, "course": ai_output}

    except Exception as e:
        print("💥 Error generating course preview:", e)
        return {"status": "error", "error": str(e), "materials": extracted_texts}


@app.post("/api/upload")
async def upload_files(files: list[UploadFile] = File(...)):
    """
    Handle file uploads from the wizard.
    Saves uploaded files to the /uploaded_files directory.
    """
    saved_files = []
    for file in files:
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as f:
            f.write(await file.read())
        saved_files.append(file.filename)

    return {"message": f"{len(saved_files)} file(s) uploaded successfully", "files": saved_files}


class GenerateCourseRequest(BaseModel):
    materials: str
    links: str | None = None
    files: list[str] | None = None  # Dateinamen von /api/upload


@app.post("/api/generate-course")
async def generate_course(
    materials: str = Form(...),
    links: str = Form(""),
    courseSize: str = Form("standard"),
    files: Optional[List[UploadFile]] = File(None)
):
    print("📥 generate_course endpoint triggered!")
    print(f"📏 Course size received: {courseSize}")

    file_names = [f.filename for f in files] if files else []

    format_ranges = {
        "micro": (3, 5),
        "standard": (6, 10),
        "masterclass": (12, 15)
    }
    size = courseSize.lower()
    min_lessons, max_lessons = format_ranges.get(size, (6, 10))
    exact_count = (min_lessons + max_lessons) // 2  # Mittelwert

    prompt = f"""
You are an expert online course creator and curriculum designer.

Create a full course in valid JSON, based on the following user input.

COURSE SIZE: {courseSize}
MATERIALS: {materials}
LINKS: {links}
FILES: {file_names}

---

Generate exactly {exact_count} lessons total.
Each lesson must have its own unique, descriptive title relevant to the course topic.
Never use "Lesson 1" or generic numbering as the title.

Each lesson should include:
- "lesson_title": creative and relevant (not generic)
- "video_titles": a list of short, engaging video titles (about 2–3 videos per lesson)
- "quiz": true
- "workbook": true

Also include:
- "course_title": a compelling overall title
- "course_description": a short, clear summary of what learners will gain

Example JSON structure:
{{
  "course_title": "Mastering Human Communication",
  "course_description": "Learn how to connect, listen, and speak with clarity and empathy.",
  "lessons": [
    {{
      "lesson_title": "The Psychology of Connection",
      "video_titles": ["Understanding Human Signals", "Building Rapport Quickly"],
      "quiz": true,
      "workbook": true
    }},
    {{
      "lesson_title": "Empathy and Active Listening",
      "video_titles": ["Listening Beyond Words", "Empathy in Action"],
      "quiz": true,
      "workbook": true
    }}
  ]
}}

---

Output rules:
- Return only valid JSON (no markdown, no explanations).
- All lesson titles must be natural, meaningful, and unique.
- Keep the number of lessons exactly {exact_count}.
"""

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )

        raw_output = completion.choices[0].message.content.strip()
        print("🧠 Raw OpenAI Output (vollständig):")
        print(raw_output)

        if raw_output.startswith("```"):
            raw_output = raw_output.split("```")[1]
            if raw_output.strip().startswith("json"):
                raw_output = raw_output.split("\n", 1)[1]
            raw_output = raw_output.strip()

        import json
        parsed = json.loads(raw_output)
        print(f"✅ Parsed JSON with {len(parsed.get('lessons', []))} lessons.")
        return {"course": parsed}

    except Exception as e:
        print("❌ Error in generate_course:", e)
        return {"error": str(e)}

    # Extract text and ensure it’s valid JSON
    raw_output = completion.choices[0].message.content.strip()

    # Remove ```json or ``` if present
    if raw_output.startswith("```"):
        raw_output = raw_output.split("```")[1]
        if raw_output.strip().startswith("json"):
            raw_output = raw_output.split("\n", 1)[1]
        raw_output = raw_output.strip()

    # Try to parse to JSON
    import json
    try:
        parsed = json.loads(raw_output)
        return {"course": parsed}
    except json.JSONDecodeError:
        return {"course": {"raw_text": raw_output, "error": "Invalid JSON format from OpenAI"}}

# --- FULL GENERATION BACKGROUND JOBS ---


GENERATED_DIR = Path("generated")
GENERATED_DIR.mkdir(exist_ok=True)

# In-Memory Job Registry (MVP)
JOBS: dict = {}


async def _simulate_full_generation(job_id: str, preview_data: dict):
    """
    Full generation: for each lesson generate scripts, quiz and workbook content using OpenAI.
    Robust parsing, saves files under generated/<job_id>/lesson_X and writes course.json + zip.
    Falls OpenAI-Aufruf fehlschlägt, werden lokale placeholders geschrieben (graceful fallback).
    """
    job_folder = GENERATED_DIR / job_id
    job_folder.mkdir(parents=True, exist_ok=True)

    # ensure job exists
    JOBS[job_id] = JOBS.get(job_id, {})
    JOBS[job_id]["status"] = "running"
    print(f"🔁 Job {job_id} started: preparing generation...")

    try:
        await asyncio.sleep(0.5)  # small kick-off pause

        # --- normalize preview_data (same logic you had) ---
        parsed_preview = {}
        if isinstance(preview_data, str):
            try:
                parsed_preview = json.loads(preview_data)
            except Exception:
                parsed_preview = {"topic": preview_data}
        elif isinstance(preview_data, dict):
            if preview_data.get("preview") and isinstance(preview_data.get("preview"), str):
                try:
                    parsed_preview = json.loads(preview_data.get("preview"))
                except Exception:
                    parsed_preview = {"topic": preview_data.get("preview")}
            elif preview_data.get("course") and isinstance(preview_data.get("course"), dict):
                parsed_preview = preview_data["course"]
            else:
                parsed_preview = preview_data
        else:
            parsed_preview = {}

        course_title = parsed_preview.get("course_title") or parsed_preview.get(
            "topic") or parsed_preview.get("title") or "Untitled Course"
        course_description = parsed_preview.get(
            "course_description") or parsed_preview.get("description") or ""
        preview_lessons = parsed_preview.get(
            "lessons") or parsed_preview.get("lessons_preview") or []

        if not isinstance(preview_lessons, list) or len(preview_lessons) == 0:
            preview_lessons = []
            for i in range(5):
                preview_lessons.append(
                    {"lesson_title": f"Lesson {i+1}", "video_titles": [f"Video {i+1}.1", f"Video {i+1}.2"]})

        course_out = {
            "course_title": course_title,
            "course_description": course_description,
            "lessons": []
        }

        print(
            f"🧠 Generating content for course '{course_title}' with {len(preview_lessons)} lessons...")

        # ---- main loop: call OpenAI per lesson to produce scripts, quiz, workbook ----
        for li, lesson in enumerate(preview_lessons, start=1):
            # normalize
            if isinstance(lesson, str):
                lesson_title = lesson
                video_titles = []
            else:
                lesson_title = lesson.get("lesson_title") or lesson.get(
                    "title") or f"Lesson {li}"
                video_titles = lesson.get(
                    "video_titles") or lesson.get("videos") or []

            # default if no video titles
            if not video_titles:
                video_titles = [f"{lesson_title} — Part 1",
                                f"{lesson_title} — Part 2"]

            lesson_folder = job_folder / f"lesson_{li}"
            lesson_folder.mkdir(parents=True, exist_ok=True)

            # Prompt: ask for structured JSON containing scripts, quiz, workbook
            prompt = f"""
You are an expert instructional designer and professional scriptwriter.
Create full lesson materials for the lesson titled: "{lesson_title}".
Videos: {', '.join(video_titles)}

Return valid JSON ONLY (no markdown fences) in this exact structure:
{{
  "scripts": {{
    "video_1": "Full script text for first video...",
    "video_2": "Full script text for second video..."
  }},
  "quiz": {{
    "questions": [
      {{
        "question": "Question text",
        "options": ["A", "B", "C", "D"],
        "answer": "A"
      }}
    ]
  }},
  "workbook": "Short workbook/exercise text (a few bullet tasks or reflections)."
}}

Keep scripts actionable and specific to the lesson title. Keep quiz questions short and focused. Workbook should include 3-5 reflection/exercise bullets.
"""

            ai_success = False
            try:
                # call OpenAI chat completions (your client)
                completion = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are an expert course creator producing lesson scripts, quizzes and workbooks in strict JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.6,
                    max_tokens=1500,
                )

                raw = completion.choices[0].message.content.strip()
                # strip triple-backticks and leading "json"
                if raw.startswith("```"):
                    parts = raw.split("```")
                    if len(parts) >= 2:
                        raw = parts[1]
                        # remove optional "json" header
                        if raw.strip().lower().startswith("json"):
                            raw = raw.split("\n", 1)[1]
                    raw = raw.strip()

                data = json.loads(raw)  # may raise

                # save scripts, quiz, workbook
                scripts = data.get("scripts", {})
                quiz_obj = data.get("quiz", {})
                workbook_text = data.get("workbook", "")

                video_entries = []
                for idx, vtitle in enumerate(video_titles, start=1):
                    key = f"video_{idx}"
                    script_text = scripts.get(key) or scripts.get(
                        str(idx)) or scripts.get(vtitle) or ""
                    if not script_text:
                        # fallback to small placeholder
                        script_text = f"Script for '{vtitle}'\n\nLesson: {lesson_title}\n\n(Automatically generated placeholder - model returned no script.)"

                    script_path = lesson_folder / f"script_l{li}_v{idx}.txt"
                    script_path.write_text(script_text, encoding="utf-8")

                    video_entries.append({
                        "title": vtitle,
                        "script_file": str(script_path.resolve()),
                        "script_content": script_text  # keep inline too so frontend can use immediately
                    })

                # quiz
                quiz_path = lesson_folder / "quiz.json"
                quiz_path.write_text(json.dumps(
                    quiz_obj or {}, indent=2, ensure_ascii=False), encoding="utf-8")

                # workbook
                workbook_path = lesson_folder / "workbook.txt"
                workbook_path.write_text(workbook_text or "", encoding="utf-8")

                # add lesson to course_out
                lesson_entry = {
                    "lesson_title": lesson_title,
                    "videos": video_entries,
                    "quiz_file": str(quiz_path.resolve()),
                    "workbook_file": str(workbook_path.resolve())
                }
                course_out["lessons"].append(lesson_entry)
                ai_success = True
                print(
                    f"  ✅ Generated lesson {li}: {lesson_title} (videos: {len(video_entries)})")

            except Exception as e:
                print(
                    f"  ⚠️ OpenAI generation failed for lesson {li} ({lesson_title}): {e}")
                # fallback: create placeholders like earlier
                try:
                    # create 2 placeholder scripts
                    scripts_entries = []
                    for vi, vtitle in enumerate(video_titles, start=1):
                        script_text = (
                            f"Script for '{vtitle}'\n\n"
                            f"Lesson: {lesson_title}\n"
                            "This is an automatically generated placeholder script. Replace with full AI output if desired."
                        )
                        script_path = lesson_folder / f"script_l{li}_v{vi}.txt"
                        script_path.write_text(script_text, encoding="utf-8")
                        scripts_entries.append({
                            "title": vtitle,
                            "script_file": str(script_path.resolve()),
                            "script_content": script_text
                        })

                    quiz_obj = {
                        "questions": [
                            {
                                "question": f"What is a key point from '{lesson_title}'?",
                                "options": ["A", "B", "C", "D"],
                                "answer": "A"
                            }
                        ]
                    }
                    quiz_path = lesson_folder / "quiz.json"
                    quiz_path.write_text(json.dumps(
                        quiz_obj, indent=2, ensure_ascii=False), encoding="utf-8")

                    workbook_text = f"Workbook / exercise for lesson '{lesson_title}'. Reflect and answer the questions."
                    workbook_path = lesson_folder / "workbook.txt"
                    workbook_path.write_text(workbook_text, encoding="utf-8")

                    lesson_entry = {
                        "lesson_title": lesson_title,
                        "videos": scripts_entries,
                        "quiz_file": str(quiz_path.resolve()),
                        "workbook_file": str(workbook_path.resolve())
                    }
                    course_out["lessons"].append(lesson_entry)
                    print(
                        f"  ℹ️ Fallback placeholders created for lesson {li}")
                except Exception as e2:
                    print(
                        f"  💥 Failed creating fallback for lesson {li}: {e2}")
                    # still continue to next lesson

        # Save course.json
        course_json_path = job_folder / "course.json"
        course_json_path.write_text(json.dumps(
            course_out, indent=2, ensure_ascii=False), encoding="utf-8")

        # zip
        zip_path = GENERATED_DIR / f"{job_id}.zip"
        if zip_path.exists():
            zip_path.unlink()
        shutil.make_archive(str(zip_path.with_suffix('')),
                            'zip', root_dir=job_folder)

        # try logo + banner (keep your existing calls but ensure they work non-blocking)
        logo_abs_path = None
        banner_abs_path = None
        try:
            dalle = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            logo_prompt = f"Create a minimalist, modern course logo for the course titled '{course_title}'. Simple, flat, high-end."
            logo_result = dalle.images.generate(
                model="gpt-image-1", prompt=logo_prompt, size="1024x1024", n=1)
            logo_b64 = logo_result.data[0].b64_json
            logo_bytes = base64.b64decode(logo_b64)
            logo_path = job_folder / "logo.png"
            logo_path.write_bytes(logo_bytes)
            logo_abs_path = str(logo_path.resolve())
            print("  ✅ Logo generated")
        except Exception as e:
            print("  ⚠️ Logo generation skipped/failed:", e)

        # banner (optional)
        try:
            dalle = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            banner_prompt = f"Create a cinematic hero banner for the course titled '{course_title}', 16:9, modern, minimal."
            # Note: some model endpoints accept only certain sizes; keep try/except
            banner_result = dalle.images.generate(
                model="gpt-image-1", prompt=banner_prompt, size="1536x1024", n=1)
            banner_b64 = banner_result.data[0].b64_json
            banner_bytes = base64.b64decode(banner_b64)
            banner_path = job_folder / "banner.png"
            banner_path.write_bytes(banner_bytes)
            banner_abs_path = str(banner_path.resolve())
            print("  ✅ Banner generated")
        except Exception as e:
            print("  ⚠️ Banner generation skipped/failed:", e)

        # final result
        final_result = {
            "course_title": course_out.get("course_title"),
            "course_description": course_out.get("course_description"),
            "lessons": course_out.get("lessons"),
            "zip": str(zip_path.resolve()),
        }
        if logo_abs_path:
            final_result["logo_path"] = logo_abs_path
            final_result["logo_url"] = f"http://127.0.0.1:8000/generated/{job_id}/logo.png"
        if banner_abs_path:
            final_result["banner_path"] = banner_abs_path
            final_result["banner_url"] = f"http://127.0.0.1:8000/generated/{job_id}/banner.png"

        JOBS[job_id]["status"] = "done"
        JOBS[job_id]["result"] = final_result
        print(
            f"✅ Job {job_id} completed: {len(final_result['lessons'])} lessons. ZIP: {final_result['zip']}")

    except Exception as e:
        JOBS[job_id]["status"] = "error"
        JOBS[job_id]["error"] = str(e)
        print(f"💥 Job {job_id} failed with exception: {e}")


# ============================================================
# 🖼️ Zusatz: Automatische Banner-Erzeugung (nachträglich)
# ============================================================

@app.post("/api/generate-banner")
async def generate_banner(payload: dict):
    """
    Generiert ein hero-style Bannerbild für den Kurs (querformatig, Apple-like).
    """
    job_id = payload.get("job_id")
    course_title = payload.get("course_title", "Unnamed Course")
    course_description = payload.get("course_description", "")

    if not job_id:
        return {"error": "job_id is required"}

    job_folder = GENERATED_DIR / job_id
    job_folder.mkdir(exist_ok=True)

    banner_prompt = f"""
    Create a cinematic, elegant hero banner for an online course.
    Title: '{course_title}'
    Description: '{course_description}'
    Style: Apple keynote aesthetic, soft gradients, elegant typography,
           16:9 aspect ratio, modern flat lighting, ultra high-quality.
    """

    try:
        dalle = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        result = dalle.images.generate(
            model="gpt-image-1",
            prompt=banner_prompt,
            size="1792x1024",
            n=1
        )
        image_b64 = result.data[0].b64_json
        image_bytes = base64.b64decode(image_b64)

        banner_path = job_folder / "banner.png"
        with open(banner_path, "wb") as f:
            f.write(image_bytes)

        print(f"✅ Banner generated for {course_title} at {banner_path}")
        return {"status": "ok", "banner_path": str(banner_path)}

    except Exception as e:
        print("💥 Error generating banner:", e)
        return {"status": "error", "error": str(e)}


# ============================================================
# 🎨 Logo-Erzeugung
# ============================================================

@app.post("/api/generate-logo")
async def generate_logo(payload: dict):
    """
    Generiert ein einzigartiges Logo für den Kurs mit DALL·E.
    Speichert es im generated/<job_id>/ Ordner.
    """
    job_id = payload.get("job_id")
    course_title = payload.get("course_title", "Unnamed Course")

    if not job_id:
        return {"error": "job_id is required"}

    job_folder = GENERATED_DIR / job_id
    job_folder.mkdir(exist_ok=True)

    logo_prompt = f"""
    Create a high-end, minimalist course logo in flat modern style.
    The course title is: '{course_title}'.
    Style: Apple aesthetic, soft gradients, elegant typography, white background, subtle 3D depth.
    Output should be square 1024x1024, focus on the essence of the title.
    """

    try:
        dalle = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        result = dalle.images.generate(
            model="gpt-image-1",
            prompt=logo_prompt,
            size="1024x1024",
            n=1
        )
        image_b64 = result.data[0].b64_json
        image_bytes = base64.b64decode(image_b64)

        logo_path = job_folder / "logo.png"
        with open(logo_path, "wb") as f:
            f.write(image_bytes)

        print(f"✅ Logo generated for {course_title} at {logo_path}")
        return {"status": "ok", "logo_path": str(logo_path)}

    except Exception as e:
        print("💥 Error generating logo:", e)
        return {"status": "error", "error": str(e)}


# ============================================================
# 🚀 Full Course Generation Job
# ============================================================

@app.post("/api/generate-full-course")
async def generate_full_course(request: Request):
    """
    Startet die Full-Generation als Hintergrundjob.
    Erwartet im Request JSON mit preview/course info (optional).
    Liefert sofort jobId zurück; Hintergrundtask füllt JOBS[job_id]["result"] später.
    """
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    # Normalize preview/course payload: accept either {"course": {...}} or raw preview data
    preview = None
    if isinstance(payload, dict):
        if payload.get("course") and isinstance(payload.get("course"), dict):
            preview = payload["course"]
        elif payload.get("preview"):
            # preview might be JSON string or dict
            p = payload.get("preview")
            if isinstance(p, str):
                try:
                    preview = json.loads(p)
                except Exception:
                    preview = {"topic": p}
            elif isinstance(p, dict):
                preview = p
            else:
                preview = payload
        else:
            preview = payload
    else:
        preview = {}

    job_id = str(uuid.uuid4())
    # create job placeholder in memory
    JOBS[job_id] = {"status": "queued", "preview": preview}
    print(
        f"🚀 generate-full-course called — queuing job {job_id} with preview keys: {list(preview.keys()) if isinstance(preview, dict) else 'n/a'}")

    # start background generation task (non-blocking)
    asyncio.create_task(_simulate_full_generation(job_id, preview or {}))

    return {"jobId": job_id, "status": "queued"}


# ============================================================
# 📦 Download & Status Endpoints
# ============================================================

@app.get("/api/job/{job_id}")
async def get_job(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        return {"error": "job not found"}
    return {"job_id": job_id, "status": job.get("status")}


@app.get("/api/job-status/{job_id}")
async def get_job_status(job_id: str):
    """
    Compatibility endpoint for frontend polling (/api/job-status/{job_id})
    """
    job = JOBS.get(job_id)
    if not job:
        return {"error": "job not found"}
    return {"jobId": job_id, "status": job.get("status"), "result": job.get("result")}


@app.get("/generated/{job_id}.zip")
async def download_generated_zip(job_id: str):
    zip_path = GENERATED_DIR / f"{job_id}.zip"
    if not zip_path.exists():
        return {"error": "not found"}
    return FileResponse(path=str(zip_path), filename=f"{job_id}.zip")


# ============================================================
# 📄 Datei-Reader (PDF, DOCX, TXT, OCR)
# ============================================================

@app.post("/api/read-file")
async def read_file(file: UploadFile = File(...)):
    """
    Liest eine hochgeladene Datei und extrahiert den Text-Inhalt.
    Unterstützt PDF, DOCX, TXT, Bilder (OCR).
    """
    try:
        filename = file.filename.lower()
        content = await file.read()
        text = ""

        # 🧾 PDF
        if filename.endswith(".pdf"):
            pdf_reader = PdfReader(io.BytesIO(content))
            for page in pdf_reader.pages:
                text += page.extract_text() or ""

        # 📄 DOCX
        elif filename.endswith(".docx"):
            doc = docx.Document(io.BytesIO(content))
            for para in doc.paragraphs:
                text += para.text + "\n"

        # 📝 TXT
        elif filename.endswith(".txt"):
            text = content.decode("utf-8", errors="ignore")

        # 🖼️ IMAGE (OCR mit pytesseract)
        elif filename.endswith((".png", ".jpg", ".jpeg")):
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as tmp:
                tmp.write(content)
                tmp_path = tmp.name
            image = Image.open(tmp_path)
            text = pytesseract.image_to_string(image)
            os.remove(tmp_path)

        else:
            return {"error": "Unsupported file type"}

        if not text.strip():
            text = "[No readable text found]"

        print(f"✅ Extracted text from {filename}: {len(text)} characters")
        return {"text": text}

    except Exception as e:
        print("💥 Error reading file:", e)
        return {"error": str(e)}


@app.post("/api/upload-video")
async def upload_video(
    video: UploadFile = File(...),
    course_id: str = Form(...),
    lesson_id: str = Form(...)
):
    base_path = Path("generated") / course_id / lesson_id
    base_path.mkdir(parents=True, exist_ok=True)
    video_path = base_path / video.filename

    with open(video_path, "wb") as f:
        f.write(await video.read())

    return {"video_url": f"http://127.0.0.1:8000/{video_path}"}

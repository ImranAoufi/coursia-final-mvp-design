import time
from PIL import Image, ImageDraw, ImageFont
import hmac
import hashlib
from fastapi.responses import JSONResponse, FileResponse
from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
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
- Target Audience: {req.audience or "Not specified"} ({req.audienceLevel or "-"})
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
                video_titles = [f"{lesson_title} - Part 1",
                                f"{lesson_title} - Part 2"]

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
      }},
      {{
        "question": "Another question",
        "options": ["A", "B", "C", "D"],
        "answer": "B"
      }},
      {{
        "question": "Third question",
        "options": ["A", "B", "C", "D"],
        "answer": "C"
      }}
    ]
  }},
  "workbook": "Short workbook/exercise text (a few bullet tasks or reflections)."
}}

IMPORTANT: The quiz MUST contain at least 3 questions and no more than 5 questions. Keep scripts actionable and specific to the lesson title. Keep quiz questions short and focused. Workbook should include 3-5 reflection/exercise bullets.
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
                                "question": f"What is a key concept from '{lesson_title}'?",
                                "options": ["Understanding the fundamentals", "Skipping the basics", "Ignoring best practices", "Avoiding practice"],
                                "answer": "A"
                            },
                            {
                                "question": f"Why is '{lesson_title}' important?",
                                "options": ["It's optional knowledge", "It builds core competencies", "It's just theory", "It has no practical use"],
                                "answer": "B"
                            },
                            {
                                "question": f"What should you do after completing '{lesson_title}'?",
                                "options": ["Forget everything", "Never apply it", "Practice and reinforce learning", "Skip to unrelated topics"],
                                "answer": "C"
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

        # DISABLED: Logo and banner generation via DALL-E (costs money)
        # Lovable AI will handle branding on the frontend for free
        # No logo_path or banner_path will be returned - frontend uses Lovable AI exclusively
        logo_abs_path = None
        banner_abs_path = None
        print("  ℹ️ Logo/banner generation skipped - using Lovable AI on frontend instead")

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
    DISABLED: Banner generation via DALL-E costs money.
    Use Lovable AI on the frontend instead (free).
    """
    return {
        "status": "disabled", 
        "error": "Banner generation is disabled. Use Lovable AI on frontend instead.",
        "banner_path": None
    }


# ============================================================
# 🎨 Logo-Erzeugung
# ============================================================

@app.post("/api/generate-logo")
async def generate_logo(payload: dict):
    """
    DISABLED: Logo generation via DALL-E costs money.
    Use Lovable AI on the frontend instead (free).
    """
    return {
        "status": "disabled", 
        "error": "Logo generation is disabled. Use Lovable AI on frontend instead.",
        "logo_path": None
    }


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


class CoachImproveScriptRequest(BaseModel):
    lesson_id: str
    script: str


@app.post("/api/auto-improve-lesson")
async def auto_improve_lesson(req: CoachImproveScriptRequest):
    """
    Takes a raw lesson script and automatically enhances it
    using GPT-4.1 to produce a structured, motivational,
    high-impact coaching version.
    """
    prompt = f"""
You are a world-class coaching content creator.
Improve the lesson script below with:

- clearer structure
- more emotional engagement
- confident, motivational tone
- short, punchy sentences
- practical instructions
- zero fluff
- keep full meaning
- no emojis

Return JSON:
{{
  "improved_script": ""
}}

Original Script:
{req.script}
"""

    response = client.responses.create(model="gpt-4.1", input=prompt)
    cleaned = response.output_text.strip()

    # Ensure valid JSON
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        data = {"improved_script": cleaned}

    out_dir = f"generated/coach/{req.lesson_id}"
    os.makedirs(out_dir, exist_ok=True)

    with open(f"{out_dir}/improved.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    return {
        "status": "ok",
        "lesson_id": req.lesson_id,
        "improved_script": data.get("improved_script", "")
    }


# ---------------------------------------------------------
# --- Generate Slides (JSON structure only)
# ---------------------------------------------------------
@app.post("/api/generate-slides/{lesson_id}")
async def generate_structured_slides(lesson_id: str, payload: dict):
    """
    Converts a lesson script into a structured set of slides
    following Apple-style minimalism and clarity.
    """
    script = payload.get("script", "")
    title = payload.get("title", "")

    if not script:
        return {"error": "No script provided"}

    prompt = f"""
You are a professional slide designer for online courses.
Convert this lesson script into structured slides with:

- Apple-level minimalism
- Whiteboard clean aesthetic
- Flat icons
- Short titles
- 3-6 bullet points
- Very high clarity

Return JSON:
{{
  "slides": [
    {{
      "SlideTitle": "",
      "KeyPoints": [],
      "IconDescription": "",
      "ColorAccent": "#4A90E2"
    }}
  ]
}}

Lesson Title: {title}
Script:
{script}
"""

    response = client.responses.create(model="gpt-4.1", input=prompt)
    raw = response.output_text.strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        data = {"slides": []}

    output_dir = f"generated/slides/{lesson_id}"
    os.makedirs(output_dir, exist_ok=True)
    json_path = os.path.join(output_dir, "slides.json")

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    return {"status": "ok", "lesson_id": lesson_id, "slides": data}


# ---------------------------------------------------------
# --- Render Slides (PNG creation)
# ---------------------------------------------------------
def generate_slide_png(slide, out_path):
    """Render a single slide (title + bullet points) into PNG."""
    W, H = 1600, 900
    img = Image.new("RGB", (W, H), "white")
    draw = ImageDraw.Draw(img)

    try:
        title_font = ImageFont.truetype("arial.ttf", 60)
        text_font = ImageFont.truetype("arial.ttf", 42)
    except:
        title_font = ImageFont.load_default()
        text_font = ImageFont.load_default()

    # Draw title
    draw.text((80, 80), slide.get("SlideTitle", ""),
              fill="black", font=title_font)

    # Draw bullet points
    y = 200
    for bullet in slide.get("KeyPoints", []):
        draw.text((120, y), f"• {bullet}", fill="black", font=text_font)
        y += 70

    img.save(out_path)


@app.post("/api/render-slides/{lesson_id}")
async def render_slides(lesson_id: str):
    """
    Reads the generated slides.json and renders all slides into PNGs.
    """
    slide_json = f"generated/slides/{lesson_id}/slides.json"
    if not os.path.exists(slide_json):
        return {"error": "Slides not generated yet"}

    with open(slide_json, "r", encoding="utf-8") as f:
        data = json.load(f)

    out_dir = f"generated/slides/{lesson_id}/png"
    os.makedirs(out_dir, exist_ok=True)

    for i, slide in enumerate(data.get("slides", [])):
        out_path = os.path.join(out_dir, f"slide-{i+1}.png")
        generate_slide_png(slide, out_path)

    return {"status": "ok", "count": len(data.get("slides", []))}


# ---------------------------------------------------------
# --- Full Auto Pipeline: Improve + Generate + Render
# ---------------------------------------------------------
@app.post("/api/full-pipeline/{lesson_id}")
async def full_pipeline(lesson_id: str, payload: dict):
    """
    Executes:
      1) Auto-improves script
      2) Generates structured slides
      3) Renders slides to PNGs
    Returns a list of generated PNG URLs.
    """
    raw_script = payload.get("script", "")
    title = payload.get("title", "")

    if not raw_script:
        return {"error": "No script provided"}

    # --- Step 1: Improve Script
    improve_prompt = f"""
You are a world-class coaching content creator.
Improve this script with:
- clarity, energy, structure, emotional depth
Return JSON:
{{ "improved_script": "" }}

Original:
{raw_script}
"""
    improved_response = client.responses.create(
        model="gpt-4.1", input=improve_prompt)
    improved_json = json.loads(improved_response.output_text)
    improved_script = improved_json["improved_script"]

    # --- Step 2: Generate Slides
    slide_prompt = f"""
Design slides in Apple-minimalist style from this improved script.

Format:
{{
  "slides": [
    {{
      "SlideTitle": "",
      "KeyPoints": [],
      "IconDescription": "",
      "ColorAccent": "#4A90E2"
    }}
  ]
}}

Improved Script:
{improved_script}
"""
    slide_response = client.responses.create(
        model="gpt-4.1", input=slide_prompt)
    slide_json = json.loads(slide_response.output_text)

    json_dir = f"generated/slides/{lesson_id}"
    os.makedirs(json_dir, exist_ok=True)
    with open(f"{json_dir}/slides.json", "w", encoding="utf-8") as f:
        json.dump(slide_json, f, indent=2)

    # --- Step 3: Render PNGs
    png_dir = f"generated/slides/{lesson_id}/png"
    os.makedirs(png_dir, exist_ok=True)
    for i, slide in enumerate(slide_json["slides"]):
        out = os.path.join(png_dir, f"slide-{i+1}.png")
        generate_slide_png(slide, out)

    result_urls = [
        f"/api/slide-file/{lesson_id}/slide-{i+1}.png"
        for i in range(len(slide_json["slides"]))
    ]

    return {
        "status": "ok",
        "lesson_id": lesson_id,
        "slides": result_urls,
        "count": len(result_urls)
    }


@app.get("/api/slides-signed-urls/{lesson_id}")
async def slides_signed_urls(lesson_id: str):
    """
    Returns list of slide PNG URLs so the frontend SlideViewer can display them.
    """
    png_dir = f"generated/slides/{lesson_id}/png"

    if not os.path.exists(png_dir):
        return {"slides": []}

    files = sorted([f for f in os.listdir(png_dir) if f.endswith(".png")])

    slides = [
        {
            "filename": fname,
            "url": f"/api/slide-file/{lesson_id}/{fname}"
        }
        for fname in files
    ]

    return {"slides": slides}

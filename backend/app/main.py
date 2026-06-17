from __future__ import annotations

import json
import os
import re
import uuid
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from PIL import Image
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = DATA_DIR / "uploads"
CONFIG_FILE = DATA_DIR / "config.json"
IMAGES_FILE = DATA_DIR / "images.json"

DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"}

app = FastAPI(title="Dataset Cropper API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def read_json(path: Path, default):
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def sanitize_seller(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9_-]+", "_", value)
    value = re.sub(r"_+", "_", value).strip("_")
    if not value:
        raise HTTPException(status_code=400, detail="seller is required")
    return value


def get_image_record(image_id: str) -> dict:
    images = read_json(IMAGES_FILE, [])
    for item in images:
        if item["id"] == image_id:
            return item
    raise HTTPException(status_code=404, detail="Image not found")


def clamp_rect(rect: "Rect", width: int, height: int) -> tuple[int, int, int, int]:
    x = max(0, min(int(round(rect.x)), width - 1))
    y = max(0, min(int(round(rect.y)), height - 1))
    w = max(1, int(round(rect.w)))
    h = max(1, int(round(rect.h)))
    if x + w > width:
        w = width - x
    if y + h > height:
        h = height - y
    return x, y, w, h


class ConfigPayload(BaseModel):
    save_dir: str


class DeleteImagesPayload(BaseModel):
    ids: list[str]


class Rect(BaseModel):
    x: float = Field(ge=0)
    y: float = Field(ge=0)
    w: float = Field(gt=0)
    h: float = Field(gt=0)


class CropPayload(BaseModel):
    image_id: str
    seller: str
    image_number: int = Field(ge=1)
    row_number: int = Field(ge=1)
    rect: Rect
    save_dir: Optional[str] = None
    overwrite: bool = True


class BatchStepPayload(BaseModel):
    image_id: str
    seller: str
    image_number: int = Field(ge=1)
    start_row: int = Field(ge=1)
    count: int = Field(ge=1, le=500)
    rect: Rect
    step_y: float = Field(gt=0)
    save_dir: Optional[str] = None
    overwrite: bool = True


def output_dir_from_payload(save_dir: Optional[str]) -> Path:
    config = read_json(CONFIG_FILE, {})
    chosen = save_dir or config.get("save_dir")
    if not chosen:
        raise HTTPException(status_code=400, detail="Save directory is not set")
    out = Path(chosen).expanduser().resolve()
    out.mkdir(parents=True, exist_ok=True)
    if not out.is_dir():
        raise HTTPException(status_code=400, detail="Invalid save directory")
    return out


def crop_and_save(
    *,
    image_path: Path,
    seller: str,
    image_number: int,
    row_number: int,
    rect: Rect,
    output_dir: Path,
    overwrite: bool,
) -> dict:
    with Image.open(image_path) as img:
        img = img.convert("RGB")
        x, y, w, h = clamp_rect(rect, img.width, img.height)
        cropped = img.crop((x, y, x + w, y + h))

        filename = f"{seller}_{image_number:03d}_row_{row_number:02d}.png"
        out_path = output_dir / filename

        if out_path.exists() and not overwrite:
            base = out_path.stem
            suffix = 2
            while True:
                candidate = output_dir / f"{base}_v{suffix}.png"
                if not candidate.exists():
                    out_path = candidate
                    filename = candidate.name
                    break
                suffix += 1

        cropped.save(out_path, format="PNG")

    return {
        "filename": filename,
        "path": str(out_path),
        "rect": {"x": x, "y": y, "w": w, "h": h},
    }


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/config")
def get_config():
    config = read_json(CONFIG_FILE, {})
    return {"save_dir": config.get("save_dir", "")}


@app.post("/api/config/save-dir")
def set_save_dir(payload: ConfigPayload):
    save_dir = Path(payload.save_dir).expanduser().resolve()
    save_dir.mkdir(parents=True, exist_ok=True)
    if not save_dir.is_dir():
        raise HTTPException(status_code=400, detail="Invalid save directory")
    write_json(CONFIG_FILE, {"save_dir": str(save_dir)})
    return {"save_dir": str(save_dir)}


@app.post("/api/config/choose-save-dir")
def choose_save_dir():
    """
    Opens a native folder picker when the backend is running on a desktop with GUI.
    If the environment is headless, use /api/config/save-dir with a manual path instead.
    """
    try:
        import tkinter as tk
        from tkinter import filedialog

        root = tk.Tk()
        root.withdraw()
        root.attributes("-topmost", True)
        selected = filedialog.askdirectory(title="Select output folder for cropped dataset")
        root.destroy()
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Folder dialog is not available here. Enter path manually. Error: {exc}",
        )

    if not selected:
        return {"save_dir": read_json(CONFIG_FILE, {}).get("save_dir", "")}

    save_dir = Path(selected).expanduser().resolve()
    save_dir.mkdir(parents=True, exist_ok=True)
    write_json(CONFIG_FILE, {"save_dir": str(save_dir)})
    return {"save_dir": str(save_dir)}


@app.get("/api/images")
def list_images():
    images = read_json(IMAGES_FILE, [])
    existing = []
    for item in images:
        if Path(item["path"]).exists():
            existing.append(item)
    if len(existing) != len(images):
        write_json(IMAGES_FILE, existing)
    return {"images": existing}


@app.post("/api/images")
async def upload_images(files: list[UploadFile] = File(...)):
    images = read_json(IMAGES_FILE, [])
    added = []

    for file in files:
        original = file.filename or "image"
        ext = Path(original).suffix.lower()
        if ext not in ALLOWED_EXTS:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {original}")

        image_id = uuid.uuid4().hex
        stored_name = f"{image_id}{ext}"
        stored_path = UPLOAD_DIR / stored_name

        content = await file.read()
        stored_path.write_bytes(content)

        try:
            with Image.open(stored_path) as img:
                width, height = img.size
        except Exception:
            stored_path.unlink(missing_ok=True)
            raise HTTPException(status_code=400, detail=f"Invalid image: {original}")

        record = {
            "id": image_id,
            "original_name": original,
            "stored_name": stored_name,
            "path": str(stored_path),
            "width": width,
            "height": height,
            "url": f"/api/images/{image_id}/file",
        }
        images.append(record)
        added.append(record)

    write_json(IMAGES_FILE, images)
    return {"images": added}


@app.get("/api/images/{image_id}/file")
def get_image_file(image_id: str):
    record = get_image_record(image_id)
    path = Path(record["path"])
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path)


@app.post("/api/images/delete")
def delete_images(payload: DeleteImagesPayload):
    images = read_json(IMAGES_FILE, [])
    ids = set(payload.ids or [])
    if not ids:
        raise HTTPException(status_code=400, detail="No image selected")

    kept = []
    deleted_ids = []

    for item in images:
        if item.get("id") in ids:
            deleted_ids.append(item["id"])
            try:
                Path(item["path"]).unlink(missing_ok=True)
            except Exception:
                pass
        else:
            kept.append(item)

    write_json(IMAGES_FILE, kept)
    return {"deleted_ids": deleted_ids}


@app.post("/api/crop")
def crop(payload: CropPayload):
    record = get_image_record(payload.image_id)
    image_path = Path(record["path"])
    seller = sanitize_seller(payload.seller)
    out_dir = output_dir_from_payload(payload.save_dir)

    result = crop_and_save(
        image_path=image_path,
        seller=seller,
        image_number=payload.image_number,
        row_number=payload.row_number,
        rect=payload.rect,
        output_dir=out_dir,
        overwrite=payload.overwrite,
    )
    return {"saved": result}


@app.post("/api/crop/batch-step")
def crop_batch_step(payload: BatchStepPayload):
    record = get_image_record(payload.image_id)
    image_path = Path(record["path"])
    seller = sanitize_seller(payload.seller)
    out_dir = output_dir_from_payload(payload.save_dir)

    saved = []
    for i in range(payload.count):
        row_no = payload.start_row + i
        rect = Rect(
            x=payload.rect.x,
            y=payload.rect.y + (i * payload.step_y),
            w=payload.rect.w,
            h=payload.rect.h,
        )
        saved.append(
            crop_and_save(
                image_path=image_path,
                seller=seller,
                image_number=payload.image_number,
                row_number=row_no,
                rect=rect,
                output_dir=out_dir,
                overwrite=payload.overwrite,
            )
        )

    return {"saved": saved}

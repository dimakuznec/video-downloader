import logging
import os
import shutil
from fastapi import FastAPI, HTTPException, Form, BackgroundTasks
from yt_dlp import YoutubeDL
from fastapi.middleware.cors import CORSMiddleware
import subprocess
from datetime import datetime

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FFmpeg path setup
FFMPEG_PATH = r"C:\\Users\\kud35\\Downloads\\ffmpeg-master-latest-win64-gpl-shared\\ffmpeg-master-latest-win64-gpl-shared\\bin"
os.environ["PATH"] = FFMPEG_PATH + os.pathsep + os.environ.get("PATH", "")

# Download directory
DOWNLOAD_DIR = os.path.join(os.path.expanduser("~"), "Downloads")  # Системная папка загрузок
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

# Путь к вашему скрипту обхода блокировки
ZAPRET_SCRIPT_PATH = r"C:\Users\kud35\Downloads\zapret-discord-youtube-main\general"

# FastAPI app
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to store download progress
download_progress = {"progress": 0, "message": ""}

# Helper function to fetch video info
def get_video_info(url: str):
    try:
        ydl_opts = {"quiet": True}
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            formats = [
                {
                    "format_id": f["format_id"],
                    "quality": f.get("format_note", "N/A"),
                    "ext": f["ext"],
                }
                for f in info["formats"]
            ]
            return {"title": info["title"], "formats": formats}
    except Exception as e:
        logger.error(f"Error fetching video info: {e}")
        return None

@app.post("/get_video_info/")
async def video_info(url: str = Form(...)):
    logger.info(f"Fetching info for URL: {url}")
    video_info = get_video_info(url)
    if video_info:
        return video_info
    else:
        raise HTTPException(status_code=400, detail="Unable to fetch video information")

@app.post("/download_video/")
async def download_video(
    background_tasks: BackgroundTasks,
    url: str = Form(...),
    video_format_id: str = Form(...),
):
    global download_progress
    download_progress = {"progress": 0, "message": "Загрузка началась"}  # Reset progress

    def download_task(url, video_format_id):
        def progress_hook(d):
            global download_progress
            if d['status'] == 'downloading':
                if 'total_bytes' in d and d['total_bytes'] is not None:
                    download_progress['progress'] = d['downloaded_bytes'] / d['total_bytes'] * 100
                download_progress['message'] = "Видео загружается"
                logger.info(f"Progress: {download_progress['progress']:.2f}%")
            elif d['status'] == 'finished':
                download_progress['progress'] = 100
                download_progress['message'] = "Видео успешно загружено"

        try:
            ydl_opts = {
                "format": f"{video_format_id}+bestaudio[ext=m4a]/best[ext=mp4]",
                "outtmpl": os.path.join(DOWNLOAD_DIR, "%(title)s_%(timestamp)s.%(ext)s"),
                "merge_output_format": "mp4",
                "progress_hooks": [progress_hook],
            }

            # Run bypass script
            subprocess.run([ZAPRET_SCRIPT_PATH], shell=True)

            with YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])

            # Добавление благодарности пользователю
            download_progress['message'] = "Спасибо, что воспользовались нашим сервисом! Загрузка успешно завершена."

        except Exception as e:
            logger.error(f"Download error: {e}")
            download_progress['progress'] = -1
            download_progress['message'] = "Ошибка при загрузке. Однако, проверьте загруженные файлы."

    background_tasks.add_task(download_task, url, video_format_id)
    return {"message": "Загрузка начата в фоне. Пожалуйста, ожидайте."}

@app.get("/progress/")
async def get_progress():
    return download_progress

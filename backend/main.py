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
DOWNLOAD_DIR = os.path.join(os.path.expanduser("~"), "Downloads")
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

# Helper function to update yt-dlp
def update_yt_dlp():
    try:
        subprocess.run(["pip", "install", "--upgrade", "yt-dlp"], check=True)
        logger.info("yt-dlp обновлена успешно!")
    except subprocess.CalledProcessError as e:
        logger.error(f"Ошибка при обновлении yt-dlp: {e}")

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
                    "resolution": f.get("height", "N/A")
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
    download_audio: bool = Form(False),  # Новый параметр для загрузки аудио
):
    global download_progress
    download_progress = {"progress": 0, "message": "Загрузка началась"}  # Reset progress

    def download_task(url, video_format_id, download_audio):
        def progress_hook(d):
            global download_progress
            if d['status'] == 'downloading':
                if 'total_bytes' in d and d['total_bytes'] is not None:
                    download_progress['progress'] = d['downloaded_bytes'] / d['total_bytes'] * 100
                download_progress['message'] = f"Загрузка: {download_progress['progress']:.2f}%"
                logger.info(f"Progress: {download_progress['progress']:.2f}%")
            elif d['status'] == 'finished':
                download_progress['progress'] = 100
                download_progress['message'] = "Успешно загружено"

        try:
            # Обновление yt-dlp перед загрузкой
            update_yt_dlp()

            # Загрузка видео
            ydl_opts_video = {
                "format": f"{video_format_id}+bestaudio/best",
                "outtmpl": os.path.join(DOWNLOAD_DIR, "%(title)s_%(timestamp)s_video.%(ext)s"),
                "progress_hooks": [progress_hook],
                "http_headers": {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0"
                }
            }

            subprocess.run([ZAPRET_SCRIPT_PATH], shell=True)

            video_file = None
            audio_file = None

            with YoutubeDL(ydl_opts_video) as ydl_video:
                info = ydl_video.extract_info(url, download=False)
                ydl_video.download([url])
                video_file = os.path.join(DOWNLOAD_DIR, f"{info['title']}_{info['timestamp']}_video.{info['ext']}")

            if download_audio:
                # Загрузка аудио, если необходимо
                ydl_opts_audio = {
                    "format": "bestaudio",
                    "outtmpl": os.path.join(DOWNLOAD_DIR, "%(title)s_%(timestamp)s_audio.%(ext)s"),
                    "progress_hooks": [progress_hook],
                    "http_headers": {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0"
                    }
                }

                with YoutubeDL(ydl_opts_audio) as ydl_audio:
                    ydl_audio.download([url])
                    audio_file = os.path.join(DOWNLOAD_DIR, f"{info['title']}_{info['timestamp']}_audio.{info['ext']}")

            output_file = os.path.join(DOWNLOAD_DIR, f"final_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4")

            # Объединение видео и аудио с помощью FFmpeg
            subprocess.run([FFMPEG_PATH, '-i', video_file, '-i', audio_file, '-c:v', 'copy', '-c:a', 'aac', output_file], shell=True)

            download_progress['message'] = "Спасибо, что воспользовались нашим сервисом! Загрузка успешно завершена."

        except Exception as e:
            logger.error(f"Download error: {e}")
            download_progress['progress'] = -1
            download_progress['message'] = "Ошибка при загрузке. Однако, проверьте загруженные файлы."

    background_tasks.add_task(download_task, url, video_format_id, download_audio)
    return {"message": "Загрузка начата в фоне. Пожалуйста, ожидайте."}

@app.get("/progress/")
async def get_progress():
    return download_progress

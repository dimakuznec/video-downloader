import logging
import os
from fastapi import FastAPI, HTTPException, Form, BackgroundTasks
from yt_dlp import YoutubeDL
from fastapi.middleware.cors import CORSMiddleware

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FFmpeg path setup
FFMPEG_PATH = r"C:\\Users\\kud35\\Downloads\\ffmpeg-master-latest-win64-gpl-shared\\ffmpeg-master-latest-win64-gpl-shared\\bin"
os.environ["PATH"] = FFMPEG_PATH + os.pathsep + os.environ.get("PATH", "")

# Download directory
DOWNLOAD_DIR = "downloads"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

# Cookies file
COOKIES_FILE = r"cookies.txt"

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
download_progress = {"progress": 0}

# Helper function to fetch video info
def get_video_info(url: str):
    try:
        ydl_opts = {
            "quiet": True,
            "cookiefile": COOKIES_FILE,
            "http_headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
            },
        }
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            formats = [
                {
                    "format_id": f["format_id"],
                    "quality": f.get("format_note", "N/A"),
                    "ext": f["ext"],
                    "vcodec": f.get("vcodec", ""),
                    "acodec": f.get("acodec", ""),
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
    download_progress = {"progress": 0}  # Reset progress before starting download

    def download_task(url, video_format_id):
        def progress_hook(d):
            global download_progress
            if d['status'] == 'downloading':
                download_progress['progress'] = d['downloaded_bytes'] / d['total_bytes'] * 100
                logger.info(f"Downloading: {download_progress['progress']:.2f}% complete")
            elif d['status'] == 'finished':
                logger.info("Download finished! Thank you for using our service!")
                download_progress['progress'] = 100

        try:
            ydl_opts = {
                "format": f"{video_format_id}+bestaudio[ext=m4a]/best[ext=mp4]",
                "outtmpl": os.path.join(DOWNLOAD_DIR, "%(title)s.%(ext)s"),
                "merge_output_format": "mp4",
                "http_headers": {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
                },
                "cookiefile": COOKIES_FILE,
                "progress_hooks": [progress_hook]
            }

            with YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])

        except Exception as e:
            logger.error(f"Download error: {e}")
            download_progress['progress'] = -1  # Установим прогресс в -1 в случае ошибки

    background_tasks.add_task(download_task, url, video_format_id)
    return {"message": "Download started in background. Please wait while we download your video.", "progress": 0}

@app.get("/download_progress/")
async def get_download_progress():
    return download_progress

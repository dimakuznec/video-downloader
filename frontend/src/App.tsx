import {
	Alert,
	Box,
	Button,
	Checkbox,
	FormControlLabel,
	LinearProgress,
	MenuItem,
	Select,
	Snackbar,
	TextField,
	Typography,
} from '@mui/material'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import LanguageSwitcher from './components/languageSwitcher/LanguageSwitcher'
import ThemeSwitcher from './components/ThemeSwitcher/ThemeSwitcher'
import './index.css'

interface Translations {
	title: string
	enterUrl: string
	fetchVideoInfo: string
	selectVideoFormat: string
	selectFormat: string
	download: string
	downloading: string
	cancel: string
	downloadComplete: string
	refresh: string
	downloadAudio: string
}

const translations: Record<string, Translations> = {
	en: {
		title: 'Video Downloader',
		enterUrl: 'Enter video URL',
		fetchVideoInfo: 'Fetch Video Info',
		selectVideoFormat: 'Select Video Format:',
		selectFormat: 'Select Format',
		download: 'Download',
		downloading: 'Downloading...',
		cancel: 'Cancel',
		downloadComplete: 'Thank you for using our service! Download complete.',
		refresh: 'Refresh page',
		downloadAudio: 'Download audio file separately?',
	},
	ru: {
		title: 'Скачиватель Видео',
		enterUrl: 'Введите URL видео',
		fetchVideoInfo: 'Получить информацию о видео',
		selectVideoFormat: 'Выберите формат видео:',
		selectFormat: 'Выберите формат',
		download: 'Скачать',
		downloading: 'Скачивание...',
		cancel: 'Отмена',
		downloadComplete:
			'Спасибо, что воспользовались нашим сервисом! Загрузка завершена.',
		refresh: 'Обновить страницу',
		downloadAudio: 'Скачать аудиофайл отдельно?',
	},
	zh: {
		title: '视频下载器',
		enterUrl: '输入视频网址',
		fetchVideoInfo: '获取视频信息',
		selectVideoFormat: '选择视频格式:',
		selectFormat: '选择格式',
		download: '下载',
		downloading: '下载中...',
		cancel: '取消',
		downloadComplete: '感谢使用我们的服务！下载完成。',
		refresh: '刷新页面',
		downloadAudio: '单独下载音频文件？',
	},
}

interface VideoFormat {
	format_id: string
	quality: string
	ext: string
	resolution: number | string
}

interface VideoInfo {
	title: string
	formats: VideoFormat[]
}

const App = () => {
	const [url, setUrl] = useState<string>('')
	const [videoFormatId, setVideoFormatId] = useState<string>('')
	const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
	const [progress, setProgress] = useState<number>(0)
	const [message, setMessage] = useState<string>('')
	const [loading, setLoading] = useState<boolean>(false)
	const [completed, setCompleted] = useState<boolean>(false)
	const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
	const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
	const [language, setLanguage] = useState<string>('en')
	const [downloadAudio, setDownloadAudio] = useState<boolean>(false)
	const t = translations[language]

	useEffect(() => {
		const savedTheme = localStorage.getItem('theme')
		if (savedTheme === 'dark') {
			setIsDarkMode(true)
			document.body.classList.add('dark-theme')
		}
	}, [])

	const toggleTheme = () => {
		setIsDarkMode(prevMode => {
			const newMode = !prevMode
			if (newMode) {
				localStorage.setItem('theme', 'dark')
			} else {
				localStorage.setItem('theme', 'light')
			}
			document.body.classList.toggle('dark-theme', newMode)
			return newMode
		})
	}

	const fetchVideoInfo = async () => {
		try {
			const response = await axios.post(
				'http://localhost:8000/get_video_info/',
				new URLSearchParams({ url })
			)
			setVideoInfo(response.data)
			toast.success('Video information fetched successfully.')
		} catch (error) {
			toast.error('Error fetching video info.')
		}
	}

	const handleDownload = async () => {
		if (!videoFormatId) {
			toast.error('Please select video format.')
			return
		}

		try {
			setLoading(true)
			setCompleted(false)
			await axios.post(
				'http://localhost:8000/download_video/',
				new URLSearchParams({
					url,
					video_format_id: videoFormatId,
					download_audio: downloadAudio.toString(),
				})
			)

			setProgress(0)
			setMessage('Starting download...')
			toast.info('Please wait while we download your video.')

			const id = setInterval(async () => {
				try {
					const progressResponse = await axios.get(
						'http://localhost:8000/progress/'
					)
					const progressData = progressResponse.data
					setProgress(progressData.progress)
					setMessage(
						`${progressData.message} (${progressData.progress.toFixed(2)}%)`
					)

					if (progressData.progress >= 100 || progressData.completed) {
						clearInterval(id)
						setLoading(false)
						setCompleted(true)
						toast.success(t.downloadComplete)
					} else if (progressData.progress === -1) {
						clearInterval(id)
						setLoading(false)
						toast.error('Download error. Please try another format.')
					}
				} catch (error) {
					clearInterval(id)
					setLoading(false)
					toast.error(
						'Error fetching download progress. Please try another format.'
					)
				}
			}, 500)

			setIntervalId(id)
		} catch (error) {
			setLoading(false)
			toast.error('Error during download. Please try another format.')
		}
	}

	const cancelDownload = () => {
		if (intervalId) {
			clearInterval(intervalId)
		}
		setLoading(false)
		setProgress(0)
		setMessage('Download cancelled.')
		toast.info('Download cancelled.')
	}

	const handleLanguageChange = (selectedLanguage: string) => {
		setLanguage(selectedLanguage)
	}

	return (
		<Box sx={{ maxWidth: 600, margin: 'auto', padding: 4 }}>
			<Typography variant='h4' gutterBottom>
				{t.title}
			</Typography>

			<ThemeSwitcher isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
			<LanguageSwitcher
				currentLanguage={language}
				onLanguageChange={handleLanguageChange}
			/>

			<TextField
				fullWidth
				variant='outlined'
				label={t.enterUrl}
				value={url}
				onChange={e => setUrl(e.target.value)}
				sx={{ mb: 2 }}
			/>

			<Button
				variant='contained'
				color='primary'
				onClick={fetchVideoInfo}
				sx={{ mb: 2 }}
				disabled={!url}
			>
				{t.fetchVideoInfo}
			</Button>

			{videoInfo && (
				<Box>
					<Typography variant='h6'>{videoInfo.title}</Typography>
					<Typography variant='subtitle1' sx={{ mb: 2 }}>
						{t.selectVideoFormat}
					</Typography>
					<Select
						fullWidth
						value={videoFormatId}
						onChange={e => setVideoFormatId(e.target.value)}
						displayEmpty
						sx={{ mb: 2 }}
					>
						<MenuItem value=''>{t.selectFormat}</MenuItem>
						{videoInfo.formats.map(format => (
							<MenuItem key={format.format_id} value={format.format_id}>
								{format.quality} ({format.ext}) - {format.resolution}p
							</MenuItem>
						))}
					</Select>

					<FormControlLabel
						control={
							<Checkbox
								checked={downloadAudio}
								onChange={() => setDownloadAudio(!downloadAudio)}
							/>
						}
						label={t.downloadAudio}
					/>

					<Button
						variant='contained'
						color='primary'
						onClick={handleDownload}
						sx={{ mr: 2 }}
						disabled={loading}
					>
						{loading ? t.downloading : t.download}
					</Button>
					<Button
						variant='outlined'
						color='secondary'
						onClick={cancelDownload}
						disabled={!loading}
					>
						{t.cancel}
					</Button>
				</Box>
			)}

			{loading && (
				<Box sx={{ mt: 2 }}>
					<LinearProgress variant='determinate' value={progress} />
					<Typography sx={{ mt: 1 }}>{message}</Typography>
				</Box>
			)}
			{completed && (
				<Snackbar
					open={completed}
					autoHideDuration={6000}
					onClose={() => setCompleted(false)}
				>
					<Alert severity='success'>{t.downloadComplete}</Alert>
				</Snackbar>
			)}

			<ToastContainer />

			<Button
				variant='contained'
				color='primary'
				onClick={() => window.location.reload()}
				sx={{ mt: 2 }}
			>
				{t.refresh}
			</Button>
		</Box>
	)
}

export default App

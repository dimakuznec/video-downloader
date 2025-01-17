import axios from 'axios'
import { useEffect, useState } from 'react'
import { AiOutlineClose } from 'react-icons/ai'
import { BsMoonFill } from 'react-icons/bs'
import { FaFire } from 'react-icons/fa6'
import { IoPerson } from 'react-icons/io5'
import { MdSunny } from 'react-icons/md'
import { ToastContainer, toast } from 'react-toastify'
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
	features?: string
	about?: string
	contact?: string
	whyChoose?: string
	feature1?: string
	feature2?: string
	feature3?: string
	aboutTitle?: string
	aboutText?: string
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
		features: 'Features',
		about: 'About',
		contact: 'Contact',
		whyChoose: 'Why choose VideoVault?',
		feature1: 'Fast and secure downloads',
		feature2: 'Supports multiple formats',
		feature3: 'User-friendly interface',
		aboutTitle: 'About VideoVault',
		aboutText: 'VideoVault is the ultimate tool for downloading videos.',
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
		features: 'Функции',
		about: 'О нас',
		contact: 'Контакты',
		whyChoose: 'Почему выбирают VideoVault?',
		feature1: 'Быстрая и безопасная загрузка',
		feature2: 'Поддержка множества форматов',
		feature3: 'Удобный интерфейс',
		aboutTitle: 'О VideoVault',
		aboutText: 'VideoVault - лучший инструмент для скачивания видео.',
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
		features: '功能',
		about: '关于',
		contact: '联系方式',
		whyChoose: '为什么选择 VideoVault？',
		feature1: '快速安全的下载',
		feature2: '支持多种格式',
		feature3: '用户友好的界面',
		aboutTitle: '关于 VideoVault',
		aboutText: 'VideoVault 是终极视频下载工具。',
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
	const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
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

	const toggleMenu = () => {
		setIsMenuOpen(prev => !prev)
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
		<div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
			<header className='header'>
				<div className='container header-content'>
					<div className='header-left'>
						<h1 className='logo'>VideoVault</h1>
					</div>
					<button
						id='menu-button'
						className='menu-button'
						aria-label='Menu'
						aria-expanded={isMenuOpen}
						onClick={toggleMenu}
					>
						{isMenuOpen ? (
							<AiOutlineClose />
						) : (
							<span className='menu-icon'></span>
						)}
					</button>
					<nav className={`nav ${isMenuOpen ? 'show' : ''}`} id='nav-menu'>
						<ul className='nav-list'>
							<li>
								<a href='#features' className='nav-link'>
									{t.features}
								</a>
							</li>
							<li>
								<a href='#about' className='nav-link'>
									{t.about}
								</a>
							</li>
							<li>
								<a href='#contact' className='nav-link'>
									{t.contact}
								</a>
							</li>
							<div className='settings'>
								<div className='theme-toggle'>
									<button
										id='theme-button'
										className='theme-button'
										onClick={toggleTheme}
									>
										{isDarkMode ? <BsMoonFill /> : <MdSunny />}
									</button>
								</div>
								<LanguageSwitcher
									currentLanguage={language}
									onLanguageChange={handleLanguageChange}
								/>
								<div className='counter'>
									<p>
										<FaFire />
										online:{' '}
										<span id='current-visitors' className='visitors-count'>
											0
										</span>
									</p>
									<p>
										<IoPerson />
										visited:{' '}
										<span id='total-visits' className='visits-count'>
											0
										</span>
									</p>
								</div>
							</div>
						</ul>
					</nav>
				</div>
			</header>

			<main className='main-content'>
				<div className='content-box'>
					<h4 className='title'>{t.title}</h4>

					<ThemeSwitcher isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
					<LanguageSwitcher
						currentLanguage={language}
						onLanguageChange={handleLanguageChange}
					/>

					<input
						type='text'
						className='input-field'
						placeholder={t.enterUrl}
						value={url}
						onChange={e => setUrl(e.target.value)}
					/>

					<button
						className='primary-button'
						onClick={fetchVideoInfo}
						disabled={!url}
					>
						{t.fetchVideoInfo}
					</button>

					{videoInfo && (
						<div>
							<h6 className='subtitle'>{videoInfo.title}</h6>
							<h6 className='subtitle'>{t.selectVideoFormat}</h6>
							<select
								className='select-field'
								value={videoFormatId}
								onChange={e => setVideoFormatId(e.target.value)}
							>
								<option value=''>{t.selectFormat}</option>
								{videoInfo.formats.map(format => (
									<option key={format.format_id} value={format.format_id}>
										{format.quality} ({format.ext}) - {format.resolution}p
									</option>
								))}
							</select>

							<label className='checkbox-container'>
								<input
									type='checkbox'
									checked={downloadAudio}
									onChange={() => setDownloadAudio(!downloadAudio)}
								/>
								{t.downloadAudio}
							</label>

							<button
								className='primary-button'
								onClick={handleDownload}
								disabled={loading}
							>
								{loading ? t.downloading : t.download}
							</button>
							<button
								className='secondary-button'
								onClick={cancelDownload}
								disabled={!loading}
							>
								{t.cancel}
							</button>
						</div>
					)}

					{loading && (
						<div className='progress-container'>
							<div
								className='progress-bar'
								style={{ width: `${progress}%` }}
							></div>
							<p>{message}</p>
						</div>
					)}
					{completed && (
						<div className='snackbar'>
							<div className='alert-success'>{t.downloadComplete}</div>
						</div>
					)}

					<ToastContainer />

					<button
						className='primary-button'
						onClick={() => window.location.reload()}
					>
						{t.refresh}
					</button>
				</div>

				<section id='features' className='features'>
					<div className='container'>
						<h3 className='section-title'>{t.whyChoose}</h3>
						<ul className='features-list'>
							<li>{t.feature1}</li>
							<li>{t.feature2}</li>
							<li>{t.feature3}</li>
						</ul>
					</div>
				</section>

				<section id='about' className='about'>
					<div className='container'>
						<h3 className='section-title'>{t.aboutTitle}</h3>
						<p>{t.aboutText}</p>
					</div>
				</section>

				<section id='contact' className='contact'>
					<div className='container'>
						<h3 className='section-title'>{t.contact}</h3>
						<p>
							Have questions? Reach out to us at{' '}
							<a href='mailto:support@videovault.com'>support@videovault.com</a>
						</p>
					</div>
				</section>
			</main>

			<footer className='footer'>
				<div className='container'>
					<p>© 2025 VideoVault. All rights reserved.</p>
				</div>
			</footer>
		</div>
	)
}

export default App

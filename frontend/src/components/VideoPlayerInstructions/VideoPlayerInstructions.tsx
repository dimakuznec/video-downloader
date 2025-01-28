import React, { useState } from 'react'
import gomLogo from './../../img/GOMimg.png'
import kmplayerLogo from './../../img/KMPlayer_Icon.png'
import mpcLogo from './../../img/Media_Player_Classic_logo.png'
import vlcLogo from './../../img/VLCimage.jpg'
import './Video-player-layerInstructions.css'

interface VideoPlayerInstructionsProps {
	language: 'en' | 'ru' | 'zh'
}

const VideoPlayerInstructions: React.FC<VideoPlayerInstructionsProps> = ({
	language,
}) => {
	const [step, setStep] = useState(0)

	const translations = {
		en: {
			title: 'Video Player Installation Guide',
			steps: [
				'1. First, check if VLC Media Player is installed. If not, download it [here](https://www.videolan.org/vlc/).',
				"2. If VLC doesn't work or the video doesn't play, try KMPlayer. Download it [here](https://kmplayer.com/).",
				'3. Other recommended video players: GOM Player and Media Player Classic. Ensure you have the latest versions installed.',
				"4. If the video loads without sound or picture, try downloading it in a lower quality. For example, if the video doesn't play in 1440p, try 1080p.",
				'5. We recommend downloading video in WEBM format. If you encounter issues, try MP4 format. This should help with playback on your computer.',
			],
			buttons: {
				previous: 'Previous Step',
				next: 'Next Step',
			},
		},
		ru: {
			title: 'Руководство по установке видеоплеера',
			steps: [
				'1. Сначала проверьте, установлен ли VLC Media Player. Если нет, скачайте его [здесь](https://www.videolan.org/vlc/).',
				'2. Если VLC не работает или видео не воспроизводится, попробуйте KMPlayer. Скачайте его [здесь](https://kmplayer.com/).',
				'3. Другие рекомендуемые видеоплееры: GOM Player и Media Player Classic. Убедитесь, что у вас установлены последние версии.',
				'4. Если видео загружается без звука или изображения, попробуйте скачать его в более низком качестве. Например, если видео не воспроизводится в 1440p, попробуйте 1080p.',
				'5. Мы рекомендуем скачивать видео в формате WEBM. Если возникают проблемы, попробуйте формат MP4. Это должно помочь воспроизвести видео на вашем компьютере.',
			],
			buttons: {
				previous: 'Предыдущий шаг',
				next: 'Следующий шаг',
			},
		},
		zh: {
			title: '视频播放器安装指南',
			steps: [
				'1. 首先检查是否安装了 VLC 媒体播放器。如果没有，请点击[这里](https://www.videolan.org/vlc/)下载。',
				'2. 如果 VLC 不工作或视频无法播放，请尝试 KMPlayer。点击[这里](https://kmplayer.com/)下载。',
				'3. 其他推荐的视频播放器：GOM 播放器和媒体播放器经典版。请确保您安装了最新版本。',
				'4. 如果视频加载时没有声音或画面，请尝试以较低的质量下载。例如，如果视频无法在 1440p 下播放，请尝试 1080p。',
				'5. 我们推荐以 WEBM 格式下载视频。如果遇到问题，请尝试 MP4 格式。这有助于在您的 电脑上播放。',
			],
			buttons: {
				previous: '上一步',
				next: '下一步',
			},
		},
	}

	const currentTranslation = translations[language]

	const nextStep = () => {
		if (step < currentTranslation.steps.length - 1) {
			setStep(step + 1)
		}
	}

	const prevStep = () => {
		if (step > 0) {
			setStep(step - 1)
		}
	}

	const logos = [
		{
			name: 'VLC Media Player',
			src: vlcLogo,
			link: 'https://www.videolan.org/vlc/',
		},
		{
			name: 'KMPlayer',
			src: kmplayerLogo,
			link: 'https://kmplayer.com/',
		},
		{
			name: 'GOM Player',
			src: gomLogo,
			link: 'https://www.gomlab.com/',
		},
		{
			name: 'Media Player Classic',
			src: mpcLogo,
			link: 'https://mpc-hc.org/',
		},
	]

	return (
		<div className='video-player-guide'>
			<h1>{currentTranslation.title}</h1>

			<div className='video-player-logos'>
				{logos.map((logo, index) => (
					<a
						key={index}
						href={logo.link}
						target='_blank'
						rel='noopener noreferrer'
					>
						<img src={logo.src} alt={logo.name} />
						<p>{logo.name}</p>
					</a>
				))}
			</div>

			<div className='video-player-text'>
				<p>{currentTranslation.steps[step]}</p>
			</div>

			<div className='video-player-buttons'>
				<button onClick={prevStep} disabled={step === 0}>
					{currentTranslation.buttons.previous}
				</button>
				<button
					onClick={nextStep}
					disabled={step === currentTranslation.steps.length - 1}
				>
					{currentTranslation.buttons.next}
				</button>
			</div>
		</div>
	)
}

export default VideoPlayerInstructions

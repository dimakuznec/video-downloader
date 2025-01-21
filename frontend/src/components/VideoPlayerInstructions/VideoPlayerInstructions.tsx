import { useState } from 'react'
import gomLogo from './../../img/GOMimg.png'
import kmplayerLogo from './../../img/KMPlayer_Icon.png'
import mpcLogo from './../../img/Media_Player_Classic_logo.png'
import vlcLogo from './../../img/VLCimage.jpg'
import './Video-player-layerInstructions.css'

const VideoPlayerInstructions = () => {
	const [step, setStep] = useState(0)

	const steps = [
		'1. First, check if VLC Media Player is installed. If not, download it [here](https://www.videolan.org/vlc/).',
		"2. If VLC doesn't work or the video doesn't play, try KMPlayer. Download it [here](https://kmplayer.com/).",
		'3. Other recommended video players: GOM Player and Media Player Classic. Ensure you have the latest versions installed.',
		"4. If the video loads without sound or picture, try downloading it in a lower quality. For example, if the video doesn't play in 1440p, try 1080p.",
		'5. We recommend downloading video in WEBM format. If you encounter issues, try MP4 format. This should help with playback on your Windows computer.',
	]

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

	const nextStep = () => {
		if (step < steps.length - 1) {
			setStep(step + 1)
		}
	}

	const prevStep = () => {
		if (step > 0) {
			setStep(step - 1)
		}
	}

	return (
		<div className='video-player-guide'>
			<h1>Video Player Installation Guide</h1>
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
				<p>{steps[step]}</p>
			</div>

			<div className='video-player-buttons'>
				<button onClick={prevStep} disabled={step === 0}>
					Previous Step
				</button>
				<button onClick={nextStep} disabled={step === steps.length - 1}>
					Next Step
				</button>
			</div>
		</div>
	)
}

export default VideoPlayerInstructions

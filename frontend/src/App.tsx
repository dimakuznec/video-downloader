import axios from 'axios'
import { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
	const [url, setUrl] = useState<string>('')
	const [videoFormatId, setVideoFormatId] = useState<string>('')
	const [videoInfo, setVideoInfo] = useState<any>(null)
	const [progress, setProgress] = useState<number>(0)

	const fetchVideoInfo = async () => {
		try {
			const response = await axios.post(
				'http://localhost:8000/get_video_info/',
				new URLSearchParams({ url })
			)
			setVideoInfo(response.data)
		} catch (error: any) {
			toast.error('Error fetching video info.')
		}
	}

	const handleDownload = async () => {
		if (!videoFormatId) {
			toast.error('Please select video format.')
			return
		}

		try {
			const response = await axios.post(
				'http://localhost:8000/download_video/',
				new URLSearchParams({
					url,
					video_format_id: videoFormatId,
				})
			)

			toast.info('Please wait while we download your video.')

			const interval = setInterval(async () => {
				const progressResponse = await axios.get(
					'http://localhost:8000/download_progress/'
				)
				const progressData = progressResponse.data
				setProgress(progressData.progress)

				if (progressData.progress >= 100) {
					clearInterval(interval)
					toast.success('Download complete! Thank you for using our service.')
				} else if (progressData.progress === -1) {
					clearInterval(interval)
					toast.error('Download error.')
				}
			}, 1000)
		} catch (error: any) {
			toast.error('Error during download.')
		}
	}

	return (
		<div>
			<h1>Video Downloader</h1>
			<input
				type='text'
				value={url}
				onChange={e => setUrl(e.target.value)}
				placeholder='Enter video URL'
			/>
			<button onClick={fetchVideoInfo}>Fetch Video Info</button>

			{videoInfo && (
				<div>
					<h2>{videoInfo.title}</h2>
					<label>Select Video Format:</label>
					<select
						onChange={e => setVideoFormatId(e.target.value)}
						value={videoFormatId}
					>
						{videoInfo.formats.map((format: any) => (
							<option key={format.format_id} value={format.format_id}>
								{format.quality} ({format.ext})
							</option>
						))}
					</select>

					<button onClick={handleDownload}>Download</button>
				</div>
			)}

			{progress > 0 && (
				<progress value={progress} max='100'>
					{progress}%
				</progress>
			)}
			<ToastContainer />
		</div>
	)
}

export default App

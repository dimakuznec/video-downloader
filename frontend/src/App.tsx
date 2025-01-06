import {
	Alert,
	Box,
	Button,
	LinearProgress,
	MenuItem,
	Select,
	Snackbar,
	TextField,
	Typography,
} from '@mui/material'
import axios from 'axios'
import { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
	const [url, setUrl] = useState<string>('')
	const [videoFormatId, setVideoFormatId] = useState<string>('')
	const [videoInfo, setVideoInfo] = useState<any>(null)
	const [progress, setProgress] = useState<number>(0)
	const [message, setMessage] = useState<string>('')
	const [loading, setLoading] = useState<boolean>(false)
	const [completed, setCompleted] = useState<boolean>(false)

	const fetchVideoInfo = async () => {
		try {
			const response = await axios.post(
				'http://localhost:8000/get_video_info/',
				new URLSearchParams({ url })
			)
			setVideoInfo(response.data)
			toast.success('Video information fetched successfully.')
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
			setLoading(true)
			setCompleted(false)
			await axios.post(
				'http://localhost:8000/download_video/',
				new URLSearchParams({
					url,
					video_format_id: videoFormatId,
				})
			)

			setProgress(0)
			setMessage('Starting download...')
			toast.info('Please wait while we download your video.')

			const interval = setInterval(async () => {
				try {
					const progressResponse = await axios.get(
						'http://localhost:8000/progress/'
					)
					const progressData = progressResponse.data
					setProgress(progressData.progress)
					setMessage(progressData.message)

					if (progressData.progress >= 100) {
						clearInterval(interval)
						setLoading(false)
						setCompleted(true)
						toast.success('Download complete! Thank you for using our service.')
					} else if (progressData.progress === -1) {
						clearInterval(interval)
						setLoading(false)
						toast.error('Download error.')
					}
				} catch {
					clearInterval(interval)
					setLoading(false)
					toast.error('Error fetching download progress.')
				}
			}, 1000)
		} catch (error: any) {
			setLoading(false)
			toast.error('Error during download.')
		}
	}

	const cancelDownload = () => {
		setLoading(false)
		setProgress(0)
		setMessage('Download cancelled.')
		toast.info('Download cancelled.')
	}

	return (
		<Box sx={{ maxWidth: 600, margin: 'auto', padding: 4 }}>
			<Typography variant='h4' gutterBottom>
				Video Downloader
			</Typography>

			<TextField
				fullWidth
				variant='outlined'
				label='Enter video URL'
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
				Fetch Video Info
			</Button>

			{videoInfo && (
				<Box>
					<Typography variant='h6'>{videoInfo.title}</Typography>
					<Typography variant='subtitle1' sx={{ mb: 2 }}>
						Select Video Format:
					</Typography>
					<Select
						fullWidth
						value={videoFormatId}
						onChange={e => setVideoFormatId(e.target.value)}
						displayEmpty
						sx={{ mb: 2 }}
					>
						<MenuItem value=''>Select Format</MenuItem>
						{videoInfo.formats.map((format: any) => (
							<MenuItem key={format.format_id} value={format.format_id}>
								{format.quality} ({format.ext})
							</MenuItem>
						))}
					</Select>

					<Button
						variant='contained'
						color='primary'
						onClick={handleDownload}
						sx={{ mr: 2 }}
						disabled={loading}
					>
						{loading ? 'Downloading...' : 'Download'}
					</Button>
					<Button
						variant='outlined'
						color='secondary'
						onClick={cancelDownload}
						disabled={!loading}
					>
						Cancel
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
					<Alert severity='success'>Download complete!</Alert>
				</Snackbar>
			)}

			<ToastContainer />
		</Box>
	)
}

export default App

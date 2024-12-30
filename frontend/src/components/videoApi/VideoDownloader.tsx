import { useState } from 'react'
import { downloadVideo, getQualities } from '../videoApi/getQualities'

const VideoDownloader = () => {
	const [url, setUrl] = useState('')
	const [qualities, setQualities] = useState<string[]>([])
	const [selectedQuality, setSelectedQuality] = useState<string>('')
	const [message, setMessage] = useState<string>('')

	const handleGetQualities = async () => {
		if (!url.trim()) {
			setMessage('Пожалуйста, вставьте ссылку на видео!')
			return
		}

		try {
			setMessage('Получение доступных качеств...')
			const availableQualities = await getQualities(url)
			if (availableQualities.length === 0) {
				setMessage('Качества не найдены. Проверьте ссылку на видео.')
			} else {
				setQualities(availableQualities)
				setMessage('Доступные качества успешно загружены!')
			}
		} catch (error: any) {
			setMessage(`Ошибка при получении качеств: ${error.message}`)
		}
	}

	const handleDownload = async () => {
		if (!url.trim()) {
			setMessage('Пожалуйста, вставьте ссылку на видео!')
			return
		}

		if (!selectedQuality) {
			setMessage(
				'Пожалуйста, выберите качество видео, например 720p или 1080p!'
			)
			return
		}

		try {
			setMessage('Скачивание видео...')
			const responseMessage = await downloadVideo(url, selectedQuality)
			setMessage(responseMessage)
		} catch (error: any) {
			setMessage(`Ошибка при скачивании видео: ${error.message}`)
		}
	}

	return (
		<div>
			<h2>Скачивание видео</h2>
			<input
				type='text'
				value={url}
				onChange={e => setUrl(e.target.value)}
				placeholder='Вставьте ссылку на видео'
			/>
			<button onClick={handleGetQualities}>Получить качества</button>

			{qualities.length > 0 && (
				<div>
					<select
						value={selectedQuality}
						onChange={e => setSelectedQuality(e.target.value)}
					>
						<option value=''>Выберите качество</option>
						{qualities.map(quality => (
							<option key={quality} value={quality}>
								{quality}
							</option>
						))}
					</select>
					<button onClick={handleDownload}>Скачать</button>
				</div>
			)}

			{message && <p>{message}</p>}
		</div>
	)
}

export default VideoDownloader

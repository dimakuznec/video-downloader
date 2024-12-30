import React, { useState } from 'react'

interface VideoInputProps {
	onUrlSubmit: (url: string) => void // Проп для передачи функции
}

const VideoInput: React.FC<VideoInputProps> = ({ onUrlSubmit }) => {
	const [url, setUrl] = useState('')
	const [loading, setLoading] = useState(false)
	const [qualities, setQualities] = useState<string[]>([])
	const [error, setError] = useState<string>('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')
		setQualities([])

		try {
			// Вызываем переданную функцию с URL
			onUrlSubmit(url)
		} catch (error: any) {
			setError(error.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='p-4'>
			<form onSubmit={handleSubmit}>
				<input
					type='text'
					placeholder='Вставьте ссылку на видео'
					value={url}
					onChange={e => setUrl(e.target.value)}
					className='border p-2 rounded w-full'
				/>
				<button
					type='submit'
					className='bg-blue-500 text-white px-4 py-2 rounded mt-2'
					disabled={loading}
				>
					{loading ? 'Загружаем...' : 'Найти видео'}
				</button>
			</form>

			{error && <p className='text-red-500'>{error}</p>}

			{qualities.length > 0 && (
				<div>
					<h3>Доступные качества:</h3>
					<ul>
						{qualities.map((quality, index) => (
							<li key={index}>{quality}</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}

export default VideoInput

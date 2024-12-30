export const getQualities = async (url: string) => {
	try {
		const response = await fetch('http://127.0.0.1:8000/qualities', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ url, cookies: [] }), // Передаем пустые cookies, если их нет
		})

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`)
		}

		const data = await response.json()
		return data.formats
	} catch (error: any) {
		throw new Error(error.message)
	}
}

export const downloadVideo = async (url: string, quality: string) => {
	try {
		const response = await fetch('http://127.0.0.1:8000/download', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ url, quality, cookies: [] }), // Передаем пустые cookies, если их нет
		})

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`)
		}

		const data = await response.json()
		return data.message
	} catch (error: any) {
		throw new Error(error.message)
	}
}

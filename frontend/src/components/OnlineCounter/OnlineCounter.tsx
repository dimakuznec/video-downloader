import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { FaFire } from 'react-icons/fa'
import { IoMdPerson } from 'react-icons/io'
import { v4 as uuidv4 } from 'uuid'

const OnlineCounter: React.FC = () => {
	const [onlineUsers, setOnlineUsers] = useState<number>(0)
	const [totalVisits, setTotalVisits] = useState<number>(0)
	const userIdRef = useRef<string>(localStorage.getItem('userId') || uuidv4())

	useEffect(() => {
		// Сохраним идентификатор пользователя в локальном хранилище
		localStorage.setItem('userId', userIdRef.current)

		const joinUser = async () => {
			try {
				// Проверим, сохранен ли ранее идентификатор пользователя
				const response = await axios.post(
					`http://localhost:8000/counter/user_join/${userIdRef.current}`
				)
				setOnlineUsers(response.data.onlineUsers)
				setTotalVisits(response.data.totalVisits)
			} catch (error) {
				console.error('Error joining user:', error)
			}
		}

		const leaveUser = async () => {
			try {
				await axios.post(
					`http://localhost:8000/counter/user_leave/${userIdRef.current}`
				)
			} catch (error) {
				console.error('Error leaving user:', error)
			}
		}

		joinUser()

		window.addEventListener('beforeunload', leaveUser)
		return () => {
			window.removeEventListener('beforeunload', leaveUser)
		}
	}, [])

	useEffect(() => {
		const fetchVisits = async () => {
			try {
				const response = await axios.get('http://localhost:8000/counter/visits')
				setTotalVisits(response.data.totalVisits)
			} catch (error) {
				console.error('Error fetching visits:', error)
			}
		}

		fetchVisits()
	}, [])

	return (
		<div className='online-counter'>
			<p>
				<FaFire />
				Online: <span className='visitors-count'>{onlineUsers}</span>
			</p>
			<p>
				<IoMdPerson />
				Visited: <span className='visits-count'>{totalVisits}</span>
			</p>
		</div>
	)
}

export default OnlineCounter

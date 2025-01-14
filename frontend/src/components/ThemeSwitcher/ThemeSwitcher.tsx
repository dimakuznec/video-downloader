import React from 'react'
import { BsMoonFill } from 'react-icons/bs'
import { MdSunny } from 'react-icons/md'

interface ThemeSwitcherProps {
	isDarkMode: boolean
	toggleTheme: () => void
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
	isDarkMode,
	toggleTheme,
}) => {
	return (
		<button className='theme-button' onClick={toggleTheme}>
			{isDarkMode ? <BsMoonFill /> : <MdSunny />}
		</button>
	)
}

export default ThemeSwitcher

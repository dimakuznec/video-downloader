import React, { useState } from 'react'
import zhFlag from './../../img/china.png'
import ruFlag from './../../img/russia.png'
import enFlag from './../../img/united-states.png'

interface Language {
	code: 'en' | 'ru' | 'zh'
	label: string
	flag: string
}

interface LanguageSwitcherProps {
	currentLanguage: 'en' | 'ru' | 'zh'
	onLanguageChange: (language: 'en' | 'ru' | 'zh') => void
}

const languages: Language[] = [
	{ code: 'en', label: 'English', flag: enFlag },
	{ code: 'ru', label: 'Русский', flag: ruFlag },
	{ code: 'zh', label: '中文', flag: zhFlag },
]

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
	currentLanguage,
	onLanguageChange,
}) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)

	const toggleDropdown = () => {
		setIsDropdownOpen(prev => !prev)
	}

	const handleLanguageSelect = (language: 'en' | 'ru' | 'zh') => {
		onLanguageChange(language)
		setIsDropdownOpen(false) // Закрываем выпадающий список
	}

	return (
		<div className='language-switch'>
			<div
				className='language-select'
				onClick={toggleDropdown}
				role='button'
				tabIndex={0}
			>
				<img
					src={languages.find(lang => lang.code === currentLanguage)?.flag}
					alt={currentLanguage}
				/>
				<span>
					{languages.find(lang => lang.code === currentLanguage)?.label}
				</span>
			</div>

			{isDropdownOpen && (
				<div className='dropdown'>
					{languages.map(lang => (
						<div
							className='dropdown-item'
							key={lang.code}
							onClick={() => handleLanguageSelect(lang.code)}
							role='button'
							tabIndex={0}
						>
							<img src={lang.flag} alt={lang.label} />
							<span>{lang.label}</span>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default LanguageSwitcher

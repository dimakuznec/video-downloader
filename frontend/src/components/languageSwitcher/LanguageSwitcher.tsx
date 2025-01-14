import React from 'react'

interface LanguageSwitcherProps {
	currentLanguage: string
	onLanguageChange: (language: string) => void
}

const languages = ['en', 'ru', 'zh']

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
	currentLanguage,
	onLanguageChange,
}) => {
	return (
		<select
			value={currentLanguage}
			onChange={e => onLanguageChange(e.target.value)}
		>
			{languages.map(lang => (
				<option key={lang} value={lang}>
					{lang.toUpperCase()}
				</option>
			))}
		</select>
	)
}

export default LanguageSwitcher

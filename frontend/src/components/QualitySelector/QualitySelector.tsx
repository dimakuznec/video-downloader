import React from 'react'

interface QualitySelectorProps {
	qualities: string[]
	onQualitySelect: (quality: string) => void
}

const QualitySelector: React.FC<QualitySelectorProps> = ({
	qualities,
	onQualitySelect,
}) => (
	<div className='p-4'>
		<label htmlFor='quality' className='block mb-2'>
			Выберите качество:
		</label>
		<select
			id='quality'
			onChange={e => onQualitySelect(e.target.value)}
			className='border p-2 rounded w-full'
		>
			{qualities.map(quality => (
				<option key={quality} value={quality}>
					{quality}
				</option>
			))}
		</select>
	</div>
)

export default QualitySelector

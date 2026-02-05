import React from 'react';
import Link from "next/link";


const COLOR_MAP = {
	merge: 'bg-red-600 text-white',
	split: 'bg-orange-500 text-white',
	compress: 'bg-blue-600 text-white',
	word: 'bg-indigo-600 text-white',
	edit: 'bg-green-600 text-white',
	utility: 'bg-gray-700 text-white',
	download: 'bg-red-600 text-white',
};

const ToolCard = ({
	icon: IconComponent, // Accepts a React component for the icon (e.g., from Heroicons)
	title,
	description,
	href,
	color = 'utility', // Default color if not specified
	tier,
	featured,
}) => {
	const iconClasses = COLOR_MAP[color] || COLOR_MAP.utility;
	const normalizedTier = tier || (color === 'premium' ? 'premium' : 'freemium');
	const isFeatured = Boolean( featured );

	const isPremium = normalizedTier === 'premium';
	const cardBorder = isPremium 
		? 'border-2 border-amber-400 shadow-xl' 
		: 'border border-gray-100 hover:border-teal-400 hover:shadow-lg';
	const cardSurface = isFeatured
		? 'bg-gradient-to-br from-amber-50 via-white to-rose-50 ring-2 ring-amber-200'
		: 'bg-white';

	const premiumIconClasses = isPremium ? 'bg-amber-400 text-teal-900' : '';
	const tierBadgeClasses = isPremium
		? 'bg-amber-100 text-amber-800 border border-amber-200'
		: 'bg-teal-50 text-teal-700 border border-teal-200';
	const featuredBadgeClasses = 'bg-amber-600 text-white';

	return (
		<Link
			href={href}
			className={`
				flex flex-col items-center p-6 rounded-xl transition duration-300 transform 
				hover:-translate-y-1 group ${cardBorder} ${cardSurface}
			`}
		>
			<div 
				className={`
					w-16 h-16 rounded-full flex items-center justify-center mb-4 
					${isPremium ? premiumIconClasses : iconClasses}
					${isPremium ? '' : 'group-hover:ring-4 group-hover:ring-teal-100'}
				`}
			>
				{IconComponent && <IconComponent className="w-8 h-8" />}
			</div>

			{isFeatured && (
				<span className={ `mb-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${ featuredBadgeClasses }` }>
					Featured
				</span>
			)}

			<h3 
				className={`text-xl font-bold mb-2 text-center transition duration-300 ${isPremium ? 'text-teal-900' : 'text-gray-900 group-hover:text-teal-700'}`}>
				{title}
				<span className={ `ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${ tierBadgeClasses }` }>
					{isPremium ? "Premium" : "Free"}
				</span>
			</h3>
  
			<p className="text-sm text-gray-500 text-center">
				{description}
			</p>

		</Link>
	);
};

export default ToolCard;

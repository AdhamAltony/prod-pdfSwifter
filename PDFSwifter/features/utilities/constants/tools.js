import {
	ArrowDownOnSquareStackIcon,
	ScissorsIcon,
	ArrowsPointingInIcon,
	DocumentTextIcon,
	PhotoIcon,
	LockOpenIcon,
	LockClosedIcon,
	DocumentPlusIcon,
	DocumentMinusIcon,
	ArrowPathRoundedSquareIcon,
	PaintBrushIcon,
	HashtagIcon,
	Squares2X2Icon,
	PencilSquareIcon,
	RectangleGroupIcon,
} from '@heroicons/react/24/outline';


const YouTubeIcon = ( props ) => (
	<svg
		{ ...props }
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		strokeWidth={ 2 }
		stroke="currentColor"
		className={ props?.className || "w-6 h-6" }
	>
		<rect x="2" y="5" width="20" height="14" rx="4" ry="4" stroke="currentColor" strokeWidth={ 2 } fill="currentColor" />
		<path d="M10 8l6 4-6 4V8z" fill="#111827" />
	</svg>
);

const TikTokIcon = ( props ) => (
	<svg
		{ ...props }
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		strokeWidth={ 2 }
		stroke="currentColor"
		className={ props?.className || "w-6 h-6" }
	>
		<path
			d="M9 12a4 4 0 1 0 4 4V8a5 5 0 0 0 5-5"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const InstagramIcon = ( props ) => (
	<svg
		{ ...props }
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		strokeWidth={ 2 }
		stroke="currentColor"
		className={ props?.className || "w-6 h-6" }
	>
		<rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2" fill="none" />
		<circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
		<circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
	</svg>
);

const AVAILABLE_TOOL_HREFS = new Set( [
	'/utilities/compress-pdf',
	'/utilities/rotate-pdf',
	'/utilities/pdf-to-word',
	'/utilities/pdf-to-excel',
	'/utilities/pdf-to-jpg',
	'/utilities/tiktok-download',
	'/utilities/youtube-download',
	'/utilities/instagram-download',
] );

const PREMIUM_TOOL_HREFS = new Set( [] );

const FEATURED_TOOL_HREFS = new Set( [
	'/utilities/tiktok-download',
	'/utilities/youtube-download',
	'/utilities/instagram-download',
] );

const tools = [
	{
		icon: ArrowDownOnSquareStackIcon,
		title: 'Merge PDF',
		description: 'Combine multiple PDFs into one.',
		href: '/utilities/merge-pdf',
		color: 'merge',
	},
	{
		icon: ScissorsIcon,
		title: 'Split PDF',
		description: 'Split a PDF into separate files or ranges.',
		href: '/utilities/split-pdf',
		color: 'split',
	},
	{
		icon: ArrowsPointingInIcon,
		title: 'Compress PDF',
		description: 'Reduce file size without losing quality.',
		href: '/utilities/compress-pdf',
		color: 'compress',
	},
	{
		icon: DocumentTextIcon,
		title: 'PDF to Word',
		description: 'Convert PDFs to editable DOCX.',
		href: '/utilities/pdf-to-word',
		color: 'word',
	},
	{
		icon: DocumentTextIcon,
		title: 'Word to PDF',
		description: 'Convert DOCX to PDF.',
		href: '/utilities/word-to-pdf',
		color: 'word',
	},
	{
		icon: RectangleGroupIcon,
		title: 'PDF to Excel',
		description: 'Extract tables to XLSX.',
		href: '/utilities/pdf-to-excel',
		color: 'excel',
	},
	{
		icon: PhotoIcon,
		title: 'PDF to JPG',
		description: 'Export PDF pages as images.',
		href: '/utilities/pdf-to-jpg',
		color: 'utility',
	},
	{
		icon: PhotoIcon,
		title: 'JPG to PDF',
		description: 'Convert images into a single PDF.',
		href: '/utilities/jpg-to-pdf',
		color: 'utility',
	},
	{
		icon: LockOpenIcon,
		title: 'Unlock PDF',
		description: 'Remove open password (for files you own).',
		href: '/utilities/unlock-pdf',
		color: 'utility',
	},
	{
		icon: LockClosedIcon,
		title: 'Protect PDF',
		description: 'Add password encryption and permissions.',
		href: '/utilities/protect-pdf',
		color: 'edit',
	},
	{
		icon: DocumentPlusIcon,
		title: 'Extract pages',
		description: 'Extract selected pages to a new PDF.',
		href: '/utilities/extract-pages',
		color: 'edit',
	},
	{
		icon: DocumentMinusIcon,
		title: 'Remove pages',
		description: 'Delete specific pages from a PDF.',
		href: '/utilities/remove-pages',
		color: 'edit',
	},
	{
		icon: ArrowPathRoundedSquareIcon,
		title: 'Rotate PDF',
		description: 'Rotate pages to the correct orientation.',
		href: '/utilities/rotate-pdf',
		color: 'edit',
	},
	{
		icon: PaintBrushIcon,
		title: 'Add watermark',
		description: 'Overlay text or image watermarks.',
		href: '/utilities/add-watermark',
		color: 'edit',
	},
	{
		icon: HashtagIcon,
		title: 'Add page numbers',
		description: 'Insert page numbers into your PDF.',
		href: '/utilities/add-page-numbers',
		color: 'edit',
	},
	{
		icon: ArrowsPointingInIcon,
		title: 'Crop PDF',
		description: 'Trim margins and visible area.',
		href: '/utilities/crop-pdf',
		color: 'edit',
	},
	{
		icon: Squares2X2Icon,
		title: 'Organize PDF',
		description: 'Reorder, duplicate, or delete pages.',
		href: '/utilities/organize-pdf',
		color: 'edit',
	},
	{
		icon: PencilSquareIcon,
		title: 'Sign PDF',
		description: 'Draw, type, or upload a signature.',
		href: '/utilities/sign-pdf',
		color: 'edit',
	},
	{
		icon: TikTokIcon,
		title: 'Download TikTok Video',
		description: 'Download TikTok videos without watermark.',
		href: '/utilities/tiktok-download',
		color: 'download',
		inputType: 'url',
	},
	{
		icon: YouTubeIcon,
		title: 'Download YouTube Video',
		description: 'Download videos from YouTube in HD quality.',
		href: '/utilities/youtube-download',
		color: 'download',
		inputType: 'url',
	},
	{
		icon: InstagramIcon,
		title: 'Download Instagram Video',
		description: 'Download Reels and videos from Instagram.',
		href: '/utilities/instagram-download',
		color: 'download',
		inputType: 'url',
	}

];

const toolsWithTier = tools
	.filter( ( tool ) => AVAILABLE_TOOL_HREFS.has( tool.href ) )
	.map( ( tool ) => ( {
	...tool,
	key: tool.href.replace( '/utilities/', '' ),
	tier: 'freemium',
	featured: FEATURED_TOOL_HREFS.has( tool.href ),
} ) )
	.sort( ( a, b ) => Number( b.featured ) - Number( a.featured ) );

export default toolsWithTier;
export const ALL_TOOLS = toolsWithTier;

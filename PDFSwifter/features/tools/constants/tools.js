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

const AVAILABLE_TOOL_HREFS = new Set( [
  '/tools/compress-pdf',
  '/tools/rotate-pdf',
  '/tools/pdf-to-word',
  '/tools/pdf-to-excel',
  '/tools/pdf-to-jpg',
  '/tools/tiktok-download',
  '/tools/instagram-download',
] );

const PREMIUM_TOOL_HREFS = new Set( [] );

const FEATURED_TOOL_HREFS = new Set( [
  '/tools/tiktok-download',
  '/tools/instagram-download',
] );

const tools = [
  {
    icon: ArrowDownOnSquareStackIcon,
    title: 'Merge PDF',
    description: 'Combine multiple PDFs into one.',
    href: '/tools/merge-pdf',
    color: 'merge',
  },
  {
    icon: ScissorsIcon,
    title: 'Split PDF',
    description: 'Split a PDF into separate files or ranges.',
    href: '/tools/split-pdf',
    color: 'split',
  },
  {
    icon: ArrowsPointingInIcon,
    title: 'Compress PDF',
    description: 'Reduce file size without losing quality.',
    href: '/tools/compress-pdf',
    color: 'compress',
  },
  {
    icon: DocumentTextIcon,
    title: 'PDF to Word',
    description: 'Convert PDFs to editable DOCX.',
    href: '/tools/pdf-to-word',
    color: 'word',
  },
  {
    icon: DocumentTextIcon,
    title: 'Word to PDF',
    description: 'Convert DOCX to PDF.',
    href: '/tools/word-to-pdf',
    color: 'word',
  },
  {
    icon: RectangleGroupIcon,
    title: 'PDF to Excel',
    description: 'Extract tables to XLSX.',
    href: '/tools/pdf-to-excel',
    color: 'excel',
  },
  {
    icon: PhotoIcon,
    title: 'PDF to JPG',
    description: 'Export PDF pages as images.',
    href: '/tools/pdf-to-jpg',
    color: 'utility',
  },
  {
    icon: PhotoIcon,
    title: 'JPG to PDF',
    description: 'Convert images into a single PDF.',
    href: '/tools/jpg-to-pdf',
    color: 'utility',
  },
  {
    icon: LockOpenIcon,
    title: 'Unlock PDF',
    description: 'Remove open password (for files you own).',
    href: '/tools/unlock-pdf',
    color: 'utility',
  },
  {
    icon: LockClosedIcon,
    title: 'Protect PDF',
    description: 'Add password encryption and permissions.',
    href: '/tools/protect-pdf',
    color: 'edit',
  },
  {
    icon: DocumentPlusIcon,
    title: 'Extract pages',
    description: 'Extract selected pages to a new PDF.',
    href: '/tools/extract-pages',
    color: 'edit',
  },
  {
    icon: DocumentMinusIcon,
    title: 'Remove pages',
    description: 'Delete specific pages from a PDF.',
    href: '/tools/remove-pages',
    color: 'edit',
  },
  {
    icon: ArrowPathRoundedSquareIcon,
    title: 'Rotate PDF',
    description: 'Rotate pages to the correct orientation.',
    href: '/tools/rotate-pdf',
    color: 'edit',
  },
  {
    icon: PaintBrushIcon,
    title: 'Add watermark',
    description: 'Overlay text or image watermarks.',
    href: '/tools/add-watermark',
    color: 'edit',
  },
  {
    icon: HashtagIcon,
    title: 'Add page numbers',
    description: 'Insert page numbers into your PDF.',
    href: '/tools/add-page-numbers',
    color: 'edit',
  },
  {
    icon: ArrowsPointingInIcon,
    title: 'Crop PDF',
    description: 'Trim margins and visible area.',
    href: '/tools/crop-pdf',
    color: 'edit',
  },
  {
    icon: Squares2X2Icon,
    title: 'Organize PDF',
    description: 'Reorder, duplicate, or delete pages.',
    href: '/tools/organize-pdf',
    color: 'edit',
  },
  {
    icon: PencilSquareIcon,
    title: 'Sign PDF',
    description: 'Draw, type, or upload a signature.',
    href: '/tools/sign-pdf',
    color: 'edit',
  },
  {
    icon: TikTokIcon,
    title: 'Download TikTok Video',
    description: 'Download TikTok videos without watermark.',
    href: '/tools/tiktok-download',
    color: 'download',
    inputType: 'url',
  },
  {
    icon: InstagramIcon,
    title: 'Download Instagram Video',
    description: 'Download Reels and videos from Instagram.',
    href: '/tools/instagram-download',
    color: 'download',
    inputType: 'url',
  }

];

const toolsWithTier = tools
  .filter( ( tool ) => AVAILABLE_TOOL_HREFS.has( tool.href ) )
  .map( ( tool ) => ( {
  ...tool,
  key: tool.href.replace( '/tools/', '' ),
  tier: 'freemium',
  featured: FEATURED_TOOL_HREFS.has( tool.href ),
} ) )
  .sort( ( a, b ) => Number( b.featured ) - Number( a.featured ) );

export default toolsWithTier;
export const ALL_TOOLS = toolsWithTier;

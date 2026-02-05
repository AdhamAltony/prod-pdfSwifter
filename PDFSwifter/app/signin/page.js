
import SigninForm from '@/features/auth/ui/SigninForm';
import AuthPageShell from "@/features/auth/ui/AuthPageShell";

// app/signin/page.jsx
export const metadata = {
  title: 'Sign In - PDFCentral',
  description: 'Sign in to your PDFCentral account to access and manage your PDFs.',
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'Sign In - PDFCentral',
    description: 'Sign in to access your PDFs securely.',
    url: 'https://pdfcentral.com/signin',
    siteName: 'PDFCentral',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign In - PDFCentral',
    description: 'Sign in to access your PDFs securely.',
  },
};


export default function SigninPage() {
  // Server component: render page shell and client form component for interactivity
  return (
  <AuthPageShell
    eyebrow="Account"
    title="Welcome back."
    subtitle="Sign in to access your tools and saved preferences."
    cardTitle="Sign in"
    cardSubtitle="Use your account to continue."
    sideTitle="Built for secure processing"
    sidePoints={[
      "Track recent runs and downloads.",
      "Keep preferences synced across devices.",
      "Fast access to your most-used tools.",
      "Reliability-first tool availability.",
    ]}
  >
    <SigninForm />
  </AuthPageShell>
  );
}

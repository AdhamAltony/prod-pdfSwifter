import SignupForm from '@/features/auth/ui/SignupForm';
import AuthPageShell from "@/features/auth/ui/AuthPageShell";

export const metadata = {
  title: 'Sign Up - PDFCentral',
  description: 'Create a PDFCentral account to manage, edit, and organize your PDFs securely and efficiently.',
  robots: 'noindex, nofollow', 
  openGraph: {
    title: 'Sign Up - PDFCentral',
    description: 'Create a PDFCentral account to manage, edit, and organize your PDFs securely and efficiently.',
    url: 'https://pdfcentral.com/signup',
    siteName: 'PDFCentral',
    images: [
      {
        url: 'https://pdfcentral.com/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign Up - PDFCentral',
    description: 'Create a PDFCentral account to manage, edit, and organize your PDFs securely and efficiently.',
    images: ['https://pdfcentral.com/twitter-image.png'],
  },
};


export default function SignupPage() {
  return (
  <AuthPageShell
    eyebrow="Account"
    title="Create your account."
    subtitle="Create an account to sync tools, preferences, and history."
    cardTitle="Sign up"
    cardSubtitle="Create an account in under a minute."
    sideTitle="Privacy-first by default"
    sidePoints={[
      "Free, unlimited access to every tool.",
      "Sync preferences across devices.",
      "Track recent runs and downloads.",
      "Access reliability-gated tools only.",
    ]}
  >
    <SignupForm />
  </AuthPageShell>
  );
}

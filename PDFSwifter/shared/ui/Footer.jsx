import Image from "next/image";
import Link from "next/link";

const BRAND_NAME = "pdfSwifter";

const Footer = () => {
  const toolLinks = [
    { name: "Merge PDF", href: "/tools/merge-pdf" },
    { name: "Compress PDF", href: "/tools/compress-pdf" },
    { name: "PDF to Word", href: "/tools/pdf-to-word" },
    { name: "Download YouTube Video", href: "/tools/youtube-download" },
  ];

  const companyLinks = [
    { name: "About Us", href: "/about" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Use", href: "/terms" },
    { name: "Security", href: "/security" },
    { name: "Help Center", href: "/help" },
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center mb-6">
              <Image
                src="/pdf-swifter-logo.png"
                alt="pdfSwifter"
                width={128}
                height={128}
                className="h-24 w-24 rounded-2xl object-contain"
                priority
              />
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your centralized hub for secure, fast, and free PDF management. Built for efficiency.
            </p>
            {/* Social links removed as requested */}
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Tools</h4>
            <ul className="space-y-3">
              {toolLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-600 hover:text-teal-700 text-sm transition">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-600 hover:text-teal-700 text-sm transition">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Legal & Support</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-600 hover:text-teal-700 text-sm transition">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.{" "}
            <span className="ml-2 hidden sm:inline">| Built with security and speed in mind.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

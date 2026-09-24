import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sylvane — Cinematic 3D Forest Experience',
  description:
    'An Awwwards-caliber, scroll-driven 3D ancient forest built with Next.js 14, React Three Fiber, custom shaders, and real-time procedural soundscapes.',
  keywords: [
    '3D Forest',
    'WebGL',
    'Three.js',
    'React Three Fiber',
    'Awwwards Site of the Year',
    'Next.js 14',
    'Creative Developer',
    'Cinematic 3D',
  ],
  authors: [{ name: 'Chronolyte AI' }],
  openGraph: {
    title: 'Sylvane — Cinematic 3D Forest Experience',
    description:
      'Immerse yourself in a breathing primeval forest with real-time water reflections, volumetric god rays, and bioluminescent fireflies.',
    url: 'https://sylvane-forest.vercel.app',
    siteName: 'Sylvane Sanctuary',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sylvane — Cinematic 3D Forest Experience',
    description:
      'Immerse yourself in a breathing primeval forest with real-time reflections and volumetric god rays.',
  },
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🌲</text></svg>',
  },
};

export const viewport: Viewport = {
  themeColor: '#030d08',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#030d08] text-white overflow-x-hidden selection:bg-amber-400 selection:text-black">
        {children}
      </body>
    </html>
  );
}

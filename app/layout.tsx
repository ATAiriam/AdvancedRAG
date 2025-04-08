import './globals.css';
import { Inter } from 'next/font/google';
import { ReduxProvider } from '@/redux/provider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Airiam RAG Service',
  description: 'Advanced document retrieval and generation platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ReduxProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ToastProvider position="top-right">
              {children}
            </ToastProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

// vocab-practice/frontend/src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";


export const metadata: Metadata = {
  title: "VocaBoost – Học từ vựng tiếng Anh thông minh",
  description:
    "Nền tảng học từ vựng tiếng Anh hàng đầu với phương pháp AI cá nhân hóa. Chinh phục IELTS, TOEIC và tiếng Anh giao tiếp hiệu quả.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-mono"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}

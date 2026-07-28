import "./globals.css";

export const metadata = {
  title: "FawnTools",
  description: "Modern Web Tools"
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

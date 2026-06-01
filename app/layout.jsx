export const metadata = {
  title: "GGO Insights Platform",
  description: "Autonomous monthly intelligence across GGO PST areas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}

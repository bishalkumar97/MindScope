import "./globals.css";

export const metadata = {
  title: "MindScope | Psychology Survey by Riya",
  description: "Explore the relationship between childhood emotional invalidation, attachment styles, and emotion regulation strategies among young adults.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Animated background orbs */}
        <div className="bg-particles">
          <div className="orb"></div>
          <div className="orb"></div>
          <div className="orb"></div>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}

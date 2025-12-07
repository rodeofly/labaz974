// src/app/layout.tsx

// (Optionnel : les métadonnées pour Next.js)
export const metadata = {
  title: 'Plateforme Blockly Maze',
  description: 'Éditeur et Exécuteur de Labyrinthes basés sur Blockly',
};

// C'est le composant Layout Racine qui enveloppe toutes les pages
export default function RootLayout({
  children, // Les pages (page.tsx, student/page.tsx, professor/page.tsx, etc.)
}: {
  children: React.ReactNode;
}) {
  return (
    // 1. La balise <html> est obligatoire
    <html lang="fr">
      {/* 2. La balise <body> est obligatoire */}
      <body>
        {/* Le contenu de la page */}
        {children}
      </body>
    </html>
  );
}
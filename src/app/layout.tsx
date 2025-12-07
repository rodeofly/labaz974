// src/app/layout.tsx
import './globals.css'; // ⬅️ AJOUTEZ CETTE LIGNE

// (Optionnel : les métadonnées pour Next.js)
export const metadata = {
  title: 'Plateforme Blockly Maze',
  description: 'Éditeur et Exécuteur de Labyrinthes basés sur Blockly',
};

// C'est le composant Layout Racine qui enveloppe toutes les pages
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  );
}
// src/app/professor/editor/[id]/page.tsx
'use client';

// ... (imports existants)
import { Edit3, Code, Save } from 'lucide-react';
import { MAZE_CONFIG } from '@/plugins/maze/config'; // ✅ AJOUTER CET IMPORT

// ... (MOCK_LEVEL_DATA)

// Simuler la fonction getLevelData
// Vous avez besoin de définir cette fonction mockée, car elle est appelée
const getLevelData = (id: string): Level | null => {
    // Dans une vraie application, elle chargerait les données de l'API par 'id'
    // Pour l'instant, elle renvoie le mock si l'ID correspond, sinon null.
    return id === 'lvl_a1' ? MOCK_LEVEL_DATA : null;
};


export default function LevelEditorPage({ params }: EditorPageProps) {
    const { id } = params;
    const [level, setLevel] = useState<Level>(MOCK_LEVEL_DATA);

    // ❌ ANCIEN : levelId et levelData étaient inutiles et en conflit avec l'état 'level'
    // const levelId = params.id; 
    // const levelData: Level | null = getLevelData(levelId); 

    // ✅ NOUVEAU : On utilise directement les données de l'état 'level' (qui est initialisé par le mock)
    // On sécurise l'accès à la grille
    const gridDataForRunner = level.level_data?.grid || MAZE_CONFIG.defaultGrid; 
    const startPosForRunner = level.level_data?.startPos || MOCK_LEVEL_DATA.level_data.startPos; 

    // ✅ On utilise level.plugin_id pour le plugin
    const plugin = useMemo(() => getPlugin(level.plugin_id), [level.plugin_id]);
    const EditorComponent = plugin?.EditorComponent;
    const PluginRunner = plugin?.RenderComponent; // Utiliser RenderComponent du plugin


    // ... (le reste du code)

    if (!EditorComponent || !PluginRunner) { // ✅ Ajouté PluginRunner au check
        return <div className="text-red-500 p-8">Erreur : Plugin {level.plugin_id} non trouvé ou incomplet.</div>;
    }

    const currentLevelData = level.level_data || MOCK_LEVEL_DATA.level_data;
    const gridData = level.level_data?.grid || MOCK_LEVEL_DATA.level_data.grid;

    return (
        <div className="flex-1 flex justify-center items-center">
            {/* L'aperçu du Runner a besoin de la position initiale du joueur */}
            <PluginRunner 
                levelData={{ 
                    // Utilisez la grille de l'état local 'level' ou le mock
                    grid: currentLevelData.grid, 
                    startPos: currentLevelData.startPos 
                }}
                // ✅ AJOUTEZ CES PROPS : elles définissent où et comment le robot est affiché
                playerPos={currentLevelData.startPos}
                playerDir={currentLevelData.startPos.dir}
            />
        </div>

        {/* 2. Zone d'édition Blockly (2/3 de l'écran) */}
        <div className="col-span-2 bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
            <h3 className="bg-gray-200 p-3 text-lg font-medium border-b flex items-center">
                <Code className="w-5 h-5 mr-2" /> Logique Blockly & Meta-données
            </h3>
            <div className="p-4 h-[calc(100%-48px)] flex items-center justify-center bg-gray-50">
                
                {/* ❌ ANCIEN : Contenu statique */}
                {/* <div className="text-center text-gray-500">
                    <p className="italic mb-4">...</p>
                    <code className="text-sm block mt-2 p-3 bg-gray-100 rounded-lg whitespace-pre-wrap text-left border border-gray-300">
                        {plugin?.getToolboxXML()}
                    </code>
                </div> */}

                {/* ✅ NOUVEAU : Utilisation du composant Editor du plugin */}
                {EditorComponent && (
                    <EditorComponent 
                        levelData={currentLevelData}
                        onUpdate={handleLevelDataUpdate}
                    />
                )}
            </div>
        </div>
    );
}
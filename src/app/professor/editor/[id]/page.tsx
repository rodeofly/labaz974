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

    const gridData = level.level_data?.grid || MOCK_LEVEL_DATA.level_data.grid;

    return (
        <div className="flex-1 flex justify-center items-center">
        {/* ❌ ANCIEN : <PluginRunner levelData={{ grid: gridData, startPos: levelData?.data?.startPos }} /> */}
        
        {/* ✅ NOUVEAU : Utilise level.level_data qui contient les deux, ou utilise l'objet reconstruit */}
        <PluginRunner 
            levelData={{ 
                grid: gridData, 
                // Utilisez la position de départ de l'état local 'level'
                startPos: level.level_data.startPos 
            }} 
            // N'oubliez pas de passer playerPos/playerDir pour que le robot apparaisse!
            playerPos={level.level_data.startPos}
            playerDir={level.level_data.startPos.dir}
        />
    </div>
    );
}
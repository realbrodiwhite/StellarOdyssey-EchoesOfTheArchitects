import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "../lib/stores/useAudio";
import { useGame } from "../lib/stores/useGame";
import MainMenu from "../components/game/MainMenu";
import CharacterSelection from "../components/game/CharacterSelection";
import SpaceEnvironment from "../components/game/SpaceEnvironment";
import GameUI from "../components/game/GameUI";
import Combat from "../components/game/Combat";
import Puzzle from "../components/game/Puzzle";
import { Controls } from "../lib/types";

// Define controls for keyboard input
const keyboardControls = [
  { name: Controls.forward, keys: ["KeyW", "ArrowUp"] },
  { name: Controls.backward, keys: ["KeyS", "ArrowDown"] },
  { name: Controls.left, keys: ["KeyA", "ArrowLeft"] },
  { name: Controls.right, keys: ["KeyD", "ArrowRight"] },
  { name: Controls.interact, keys: ["KeyE", "Space"] },
  { name: Controls.inventory, keys: ["KeyI"] },
  { name: Controls.menu, keys: ["Escape"] },
  { name: Controls.hint, keys: ["KeyH"] },
];

const Game = () => {
  const { phase } = useGame();
  const [gameState, setGameState] = useState<"menu" | "character" | "exploration" | "combat" | "puzzle">("menu");
  const { backgroundMusic, isMuted, toggleMute } = useAudio();
  
  // Handle music playback
  useEffect(() => {
    if (backgroundMusic) {
      if (isMuted) {
        backgroundMusic.pause();
      } else {
        backgroundMusic.play().catch(error => {
          console.log("Background music autoplay prevented:", error);
        });
      }
    }
    
    return () => {
      backgroundMusic?.pause();
    };
  }, [backgroundMusic, isMuted]);
  
  // Update game state based on game phase
  useEffect(() => {
    if (phase === "ready") {
      setGameState("menu");
    } else if (phase === "playing") {
      setGameState("exploration");
    }
  }, [phase]);

  // Game component rendering based on game state
  const renderGameComponent = () => {
    switch (gameState) {
      case "menu":
        return <MainMenu onStart={() => setGameState("character")} />;
      case "character":
        return <CharacterSelection onSelect={() => setGameState("exploration")} />;
      case "exploration":
        return (
          <KeyboardControls map={keyboardControls}>
            <Canvas
              shadows
              camera={{ position: [0, 10, 15], fov: 50, near: 0.1, far: 1000 }}
              gl={{ antialias: true, alpha: false }}
            >
              <color attach="background" args={["#000000"]} />
              <Suspense fallback={null}>
                <SpaceEnvironment
                  onEnterCombat={() => setGameState("combat")}
                  onEnterPuzzle={() => setGameState("puzzle")}
                />
              </Suspense>
            </Canvas>
            <GameUI 
              onOpenInventory={() => console.log("Opening inventory")}
              onRequestHint={() => console.log("Hint requested")}
              onToggleSound={toggleMute}
              isSoundOn={!isMuted}
              onReturnToMenu={() => setGameState("menu")}
            />
          </KeyboardControls>
        );
      case "combat":
        return <Combat onCombatEnd={() => setGameState("exploration")} />;
      case "puzzle":
        return <Puzzle onPuzzleSolved={() => setGameState("exploration")} />;
      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <div className="w-full h-full">
      {renderGameComponent()}
    </div>
  );
};

export default Game;

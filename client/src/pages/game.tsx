import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "../lib/stores/useAudio";
import { useGame, GameState as GameStateType } from "../lib/stores/useGame";
import MainMenu from "../components/game/MainMenu";
import CharacterSelection from "../components/game/CharacterSelection";
import SpaceEnvironment from "../components/game/SpaceEnvironment";
import GameUI from "../components/game/GameUI";
import Combat from "../components/game/Combat";
import Puzzle from "../components/game/Puzzle";
import SpaceTransition from "../components/game/SpaceTransition";
import StarQuestManager from "../components/game/StarQuestManager";
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
  // Game state management
  const [transitionType, setTransitionType] = useState<"intro" | "selection">("intro");
  const { backgroundMusic, isMuted, toggleMute } = useAudio();
  const { 
    phase, 
    state: gameState, 
    setState: setGameState,
    start 
  } = useGame();
  
  // Initial animation to show title screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setGameState("menu");
    }, 500);
    
    return () => clearTimeout(timer);
  }, [setGameState]);
  
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
      if (gameState !== "loading" && gameState !== "transition" && gameState !== "character") {
        // We explicitly exclude the character selection state to prevent it from switching back
        setGameState("menu");
      }
    } else if (phase === "playing") {
      // Only change to game if not in character selection or transition
      if (gameState !== "character" && gameState !== "transition") {
        setGameState("game");
      }
    }
  }, [phase, gameState, setGameState]);

  // Handlers for state transitions
  const handleStartGame = () => {
    console.log("New Game button clicked");
    setTransitionType("selection");
    setGameState("transition");
  };

  const handleTransitionComplete = () => {
    console.log("Transition completed");
    if (transitionType === "intro") {
      setGameState("menu");
    } else {
      console.log("Transitioning to character selection");
      setGameState("character");
    }
  };

  const handleCharacterSelected = () => {
    console.log("Character selected, starting game");
    start(); // This will set phase to "playing"
    
    // Small delay to allow character data to be processed
    setTimeout(() => {
      setGameState("game");
      console.log("Game state set to: game");
    }, 300);
  };

  // Game component rendering based on game state
  const renderGameComponent = () => {
    switch (gameState) {
      case "loading":
        return <div className="w-full h-full bg-black flex items-center justify-center text-white font-bold text-2xl">
          Initializing Game...
        </div>;
      
      case "transition":
        return <SpaceTransition 
          type={transitionType}
          title="Cosmic Odyssey"
          onComplete={handleTransitionComplete} 
        />;
        
      case "menu":
        return <MainMenu onStart={handleStartGame} />;
        
      case "character":
        return <CharacterSelection onSelect={handleCharacterSelected} />;
        
      case "game":
        return (
          <KeyboardControls map={keyboardControls}>
            <Canvas
              shadows
              camera={{ position: [0, 2, 8], fov: 60, near: 0.1, far: 1000 }}
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
              onOpenInventory={() => setGameState("inventory")}
              onRequestHint={() => console.log("Hint requested")}
              onToggleSound={toggleMute}
              isSoundOn={!isMuted}
              onReturnToMenu={() => {
                // First confirm with the player
                if (window.confirm("Return to main menu? Progress will be saved.")) {
                  setGameState("menu");
                }
              }}
            />
          </KeyboardControls>
        );
        
      case "combat":
        return <Combat onCombatEnd={() => setGameState("game")} />;
        
      case "puzzle":
        return <Puzzle onPuzzleSolved={() => setGameState("game")} />;
        
      case "inventory":
        // When returning from inventory, go back to the game
        return (
          <div className="inventory-screen">
            {/* Inventory component would go here */}
            <button 
              className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setGameState("game")}
            >
              Return to Game
            </button>
          </div>
        );
        
      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <div className="w-full h-full">
      {renderGameComponent()}
      
      {/* Star Quest story system that activates during gameplay */}
      {gameState === 'game' && <StarQuestManager />}
    </div>
  );
};

export default Game;

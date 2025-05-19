import { Suspense, useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "../lib/stores/useAudio";
import { useGame, GameState as GameStateType } from "../lib/stores/useGame";
import { useGameProgress, GameStage } from "../lib/stores/useGameProgress";
import { useCharacter } from "../lib/stores/useCharacter";
import MainMenu from "../components/game/MainMenu";
import CharacterSelection from "../components/game/CharacterSelection";
import SpaceEnvironment from "../components/game/SpaceEnvironment";
import GameUI from "../components/game/GameUI";
import Combat from "../components/game/Combat";
import Puzzle from "../components/game/Puzzle";
import SpaceTransition from "../components/game/SpaceTransition";
import MissionModal from "../components/game/MissionModal";
import GameProgressController from "../components/game/GameProgressController";
import LoadingScreenTips from "../components/game/LoadingScreenTips";
import IntroCutscene from "../components/game/IntroCutscene";
import LoadingScreen from "../components/game/LoadingScreen";
import { Controls } from "../lib/types";

// Extend the GameStateType to include our new states
type ExtendedGameStateType = GameStateType | "introCutscene";

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
  const { resetCharacter } = useCharacter();
  
  // Skip intro animation and go directly to menu
  useEffect(() => {
    const timer = setTimeout(() => {
      // Skip transition and go directly to menu
      setGameState("menu");
    }, 100);
    
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
    
    // Reset character in preparation for selection
    resetCharacter();
    
    // Go to character selection screen first
    setGameState("character");
    
    console.log("Going to character selection from title screen");
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

  // Target state tracking for loading screen
  const [targetGameState, setTargetGameState] = useState<GameStateType | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const handleCharacterSelected = () => {
    console.log("Character selected, going to intro cutscene");
    
    // Ensure we clean up any existing game state
    if (gameState === "game") {
      console.log("Cleaning up existing game state before intro");
      // Reset any active game components or state
      // This prevents multiple instances from running simultaneously
    }
    
    // Start the game (sets phase to "playing")
    start();
    
    // Show loading screen as transition before intro cutscene
    setGameState("loading");
    setLoadingContext("story");
    setTargetGameState("introCutscene");
    console.log("Starting loading screen before intro cutscene");
  };

  // State for loading context
  const [loadingContext, setLoadingContext] = useState<'combat' | 'exploration' | 'puzzle' | 'story' | 'general'>('general');
  
  // Helper function to determine context based on previous and target state
  const determineLoadingContext = (prevState: GameStateType, targetState: GameStateType): 'combat' | 'exploration' | 'puzzle' | 'story' | 'general' => {
    if (targetState === 'combat') return 'combat';
    if (targetState === 'puzzle') return 'puzzle';
    if (targetState === 'game') return 'exploration';
    if (targetState === 'introCutscene') return 'story';
    // Default fallback
    return 'general';
  };
  
  // Game component rendering based on game state
  const renderGameComponent = () => {
    switch (gameState) {
      case "loading":
        // If we're transitioning specifically from character selection to intro, use our new LoadingScreen
        if (loadingContext === "story" && targetGameState === "introCutscene") {
          return <LoadingScreen 
            message="Initializing mission sequence..."
            duration={3000}
            onComplete={() => {
              console.log("Character loading complete, transitioning to intro cutscene");
              if (targetGameState) {
                setGameState(targetGameState as GameStateType);
                setTargetGameState(null);
              }
            }}
          />;
        }
        
        // Otherwise use the regular loading screen for other transitions
        return <LoadingScreenTips 
          context={loadingContext}
          onComplete={() => {
            console.log("Loading complete, transitioning to", targetGameState);
            // Transition to target state if it's set
            if (targetGameState) {
              setGameState(targetGameState);
              // Reset target state after transition
              setTargetGameState(null);
            } else {
              // Fallback to game state if no target specified
              setGameState("game");
            }
          }}
          minDisplayTime={3000} // Reduced loading time for better game flow
        />;
      
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
        
      case "introCutscene":
        // Prevent multiple state transitions
        if (isTransitioning) return (
          <div className="w-full h-full bg-black"></div>
        );
        
        return <IntroCutscene 
          onComplete={() => {
            console.log("Intro cutscene complete, preparing transition to first mission");
            // Prevent multiple transitions
            setIsTransitioning(true);
            // When cutscene is complete, use a delayed transition to game
            setLoadingContext('exploration');
            setTargetGameState('game');
            // Add transition screen to prevent seeing game before it's ready
            setGameState("loading");
            
            // After transition is complete, reset flag
            setTimeout(() => {
              setIsTransitioning(false);
            }, 1000);
          }}
          onSkip={() => {
            console.log("Intro cutscene skipped, preparing transition to first mission");
            // Prevent multiple transitions
            setIsTransitioning(true);
            // Same behavior when skipped - use loading screen as transition
            setLoadingContext('exploration');
            setTargetGameState('game');
            setGameState("loading");
            
            // After transition is complete, reset flag
            setTimeout(() => {
              setIsTransitioning(false);
            }, 1000);
          }}
        />;
        
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
                  onEnterCombat={() => {
                    // Set combat context and target state
                    setLoadingContext('combat');
                    setTargetGameState('combat');
                    setGameState("loading");
                  }}
                  onEnterPuzzle={() => {
                    // Set puzzle context and target state
                    setLoadingContext('puzzle');
                    setTargetGameState('puzzle');
                    setGameState("loading");
                  }}
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

  // Handle progress through the story sequence (intro → act1 → cutscene1 → act2 → etc.)
  const { currentStage, advanceStage } = useGameProgress();
  
  // Handle progress transitions
  const handleProgressComplete = () => {
    // If we're in the game state, we can continue with the next act or cutscene
    if (gameState === 'game') {
      advanceStage();
    }
  };
  
  // Black screen overlay for transitions
  const [showBlackScreen, setShowBlackScreen] = useState(false);
  
  // Reset black screen to ensure it doesn't persist
  useEffect(() => {
    // When we reach character selection, main menu, or game state,
    // ensure the black screen is turned off
    if (gameState === "menu" || gameState === "character" || gameState === "game") {
      setShowBlackScreen(false);
    }
  }, [gameState]);
  
  // Sequential render approach - either show black screen, intro cutscene, or game content
  const renderContent = () => {
    // Show black overlay during transitions
    if (showBlackScreen) {
      return <div className="absolute inset-0 bg-black z-[100]"></div>;
    }
    
    // Special handling for intro cutscene as a standalone component
    if (gameState === "introCutscene") {
      return (
        <div className="absolute inset-0 bg-black z-50">
          <IntroCutscene 
            onComplete={() => {
              console.log("Intro cutscene complete, preparing transition to first mission");
              // Show transition screen
              setShowBlackScreen(true);
              // Prevent multiple transitions
              setIsTransitioning(true);
              // Move to loading screen for the game
              setLoadingContext('exploration');
              setTargetGameState('game');
              setGameState("loading");
              
              // After transition is complete, reset flag
              setTimeout(() => {
                setIsTransitioning(false);
              }, 1000);
            }}
            onSkip={() => {
              console.log("Intro cutscene skipped, preparing transition to first mission");
              // Show transition screen
              setShowBlackScreen(true);
              // Prevent multiple transitions
              setIsTransitioning(true);
              // Move to loading screen for the game
              setLoadingContext('exploration');
              setTargetGameState('game');
              setGameState("loading");
              
              // After transition is complete, reset flag
              setTimeout(() => {
                setIsTransitioning(false);
              }, 1000);
            }}
          />
        </div>
      );
    }
    
    // For all other states, render the normal game component
    return (
      <>
        {renderGameComponent()}
        
        {/* Game progress and act flow controller - only visible during gameplay */}
        {gameState === 'game' && (
          <div className="relative z-10">
            <GameProgressController onComplete={handleProgressComplete} />
            <MissionModal 
              isOpen={false} 
              onClose={() => {}} 
              onQuestComplete={() => {}}
            />
          </div>
        )}
      </>
    );
  };
  
  return (
    <div className="w-full h-full bg-black overflow-hidden">
      {renderContent()}
    </div>
  );
};

export default Game;

import { useEffect, useState } from "react";
import { GameScreen } from "./GameScreen";
import { ScreenProvider, useScreen } from "./screens/ScreenContext";
import { MainMenu } from "./screens/MainMenu";
import { PauseMenu } from "./screens/PauseMenu";
import { HotbarMenu, InventoryMenu } from "./screens/InventoryMenu";

// Inner component so it can use the useScreen hook
const ScreenHandlerInner = () => {
  const { currentScreen, isOverlayOpen, toggleOverlay } = useScreen();

  // Lazy-mount GameScreen only after the user first enters the game,
  // so Pixi initialises against a visible (correctly-sized) container.
  const [gameStarted, setGameStarted] = useState(false);
  useEffect(() => {
    if (currentScreen === "game") setGameStarted(true);
  }, [currentScreen]);

  // Keyboard shortcuts: Escape = pause, I = inventory
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (currentScreen !== "game") return;

      if (e.code === "Escape") {
        e.preventDefault();
        toggleOverlay("pause");
      }
      if (e.code === "KeyI") {
        toggleOverlay("inventory");
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentScreen, toggleOverlay]);

  return (
    <>
      {/* Main Menu — only shown when screen is "main" */}
      {currentScreen === "main" && <MainMenu />}

      {/* Game canvas — lazy-mounted on first visit, then kept alive so Pixi doesn't restart */}
      {gameStarted && (
        <div style={{ display: currentScreen === "game" ? "block" : "none" }}>
          <GameScreen />
        </div>
      )}

      {/* Overlays — rendered on top of the game canvas */}
      {currentScreen === "game" && isOverlayOpen("pause") && <PauseMenu />}
      {currentScreen === "game" && isOverlayOpen("inventory") && (
        <InventoryMenu />
      )}
      {currentScreen === "game" && !isOverlayOpen("inventory") && (
        <HotbarMenu />
      )}

      {/*
        Add more overlays here, e.g.:
        {currentScreen === "game" && isOverlayOpen("crafting") && <CraftingMenu />}
      */}
    </>
  );
};

export const ScreenHandler = () => (
  <ScreenProvider>
    <ScreenHandlerInner />
  </ScreenProvider>
);

import { useState } from "react";
import { GameScreen } from "./GameScreen";

export const ScreenHandler = () => {
  const [currentMenu, setCurrentMenu] = useState("main");

  return (
    <>
      <div
        style={{ visibility: currentMenu === "main" ? "visible" : "hidden" }}
      >
        <GameScreen />
      </div>
    </>
  );
};

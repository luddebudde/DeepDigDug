import { useEffect, useRef } from "react";
import { game } from "./Game";

export const GameScreen = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    game.init(containerRef.current!);
    return () => {
      game.app?.destroy(true);
      game.app = null;
    };
  }, []);

  return (
    <div
      id={"gameScreen"}
      ref={containerRef}
      style={{ width: "100vw", height: "100vh" }}
    />
  );
};

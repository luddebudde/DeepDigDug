import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Screen = "main" | "game";
export type Overlay = "pause" | "inventory" | string; // extend with any string for custom overlays

interface ScreenContextValue {
  /** The current full-screen view ("main" or "game"). */
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;

  /** Stack of active overlays rendered on top of the game. */
  overlays: Overlay[];
  openOverlay: (overlay: Overlay) => void;
  closeOverlay: (overlay: Overlay) => void;
  toggleOverlay: (overlay: Overlay) => void;
  isOverlayOpen: (overlay: Overlay) => boolean;
  closeAllOverlays: () => void;
}

const ScreenContext = createContext<ScreenContextValue | null>(null);

export const ScreenProvider = ({ children }: { children: ReactNode }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("main");
  const [overlays, setOverlays] = useState<Overlay[]>([]);

  const setScreen = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
    setOverlays([]); // clear overlays when switching screens
  }, []);

  const openOverlay = useCallback((overlay: Overlay) => {
    setOverlays((prev) => (prev.includes(overlay) ? prev : [...prev, overlay]));
  }, []);

  const closeOverlay = useCallback((overlay: Overlay) => {
    setOverlays((prev) => prev.filter((o) => o !== overlay));
  }, []);

  const toggleOverlay = useCallback((overlay: Overlay) => {
    setOverlays((prev) =>
      prev.includes(overlay) ? prev.filter((o) => o !== overlay) : [...prev, overlay]
    );
  }, []);

  const isOverlayOpen = useCallback(
    (overlay: Overlay) => overlays.includes(overlay),
    [overlays]
  );

  const closeAllOverlays = useCallback(() => setOverlays([]), []);

  return (
    <ScreenContext.Provider
      value={{
        currentScreen,
        setScreen,
        overlays,
        openOverlay,
        closeOverlay,
        toggleOverlay,
        isOverlayOpen,
        closeAllOverlays,
      }}
    >
      {children}
    </ScreenContext.Provider>
  );
};

/** Use this hook in any component to control screens and overlays. */
export const useScreen = (): ScreenContextValue => {
  const ctx = useContext(ScreenContext);
  if (!ctx) throw new Error("useScreen must be used inside <ScreenProvider>");
  return ctx;
};

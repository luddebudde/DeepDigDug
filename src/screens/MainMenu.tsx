import { useScreen } from "./ScreenContext";

export const MainMenu = () => {
  const { setScreen } = useScreen();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#111",
        color: "#fff",
        fontFamily: "sans-serif",
        zIndex: 10,
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "2rem" }}>DeepDigDug</h1>

      <button
        onClick={() => setScreen("game")}
        style={buttonStyle}
      >
        New Game
      </button>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: "0.75rem 2rem",
  marginBottom: "1rem",
  fontSize: "1.2rem",
  cursor: "pointer",
  background: "#333",
  color: "#fff",
  border: "2px solid #888",
  borderRadius: "4px",
};

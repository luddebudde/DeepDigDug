import { useScreen } from "./ScreenContext";

export const PauseMenu = () => {
  const { closeOverlay, setScreen } = useScreen();

  return (
    <div style={backdropStyle}>
      <div style={panelStyle}>
        <h2 style={{ marginBottom: "1.5rem" }}>Paused</h2>

        <button style={buttonStyle} onClick={() => closeOverlay("pause")}>
          Resume
        </button>

        <button style={buttonStyle} onClick={() => setScreen("main")}>
          Main Menu
        </button>
      </div>
    </div>
  );
};

const backdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 20,
};

const panelStyle: React.CSSProperties = {
  background: "#222",
  color: "#fff",
  padding: "2rem 3rem",
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  fontFamily: "sans-serif",
};

const buttonStyle: React.CSSProperties = {
  padding: "0.6rem 2rem",
  marginBottom: "0.75rem",
  fontSize: "1rem",
  cursor: "pointer",
  background: "#333",
  color: "#fff",
  border: "2px solid #888",
  borderRadius: "4px",
  width: "100%",
};

import React, { useState } from "react";
import {
  Inventory,
  inventory,
  notifyInventoryChanged,
  Slot,
} from "../inventory/inventory";
import { useInventory } from "../inventory/useInventory";
import { useScreen } from "./ScreenContext";

const panelWidth = 400;
const panelHeight = 600;

const getSlotSize = (inv: Inventory): number => {
  return panelWidth / inv.hotbarSize;
};

export const InventoryMenu = () => {
  const { closeOverlay } = useScreen();
  const [swapCandidateIdx, setSwapCandidateIdx] = useState<number>(0);

  const inv = useInventory();
  const hotbarSize = inv.hotbarSize;
  const slotSize = getSlotSize(inv);

  return (
    <div style={backdropStyle}>
      <div style={{ ...panelStyle, width: panelWidth, height: panelHeight }}>
        <div style={gridStyle}>
          {Array.from({ length: inv.slots }).map((_, i) => {
            const slot: Slot | undefined = inv.content[i];
            return (
              <div
                key={i}
                // onClick={() => {
                //   if (i > inv.hotbarSize) return;
                //   inv.selectedHotbarSlot = i;
                //   notifyInventoryChanged();
                // }}
                // Prepare swap
                onMouseDown={() => {
                  setSwapCandidateIdx(i);
                }}
                // Swap
                onMouseUp={() => {
                  const candidate = inv.content[swapCandidateIdx];

                  if (candidate === undefined) return;
                  inv.content[i] = candidate;
                  inv.content[swapCandidateIdx] = slot;

                  notifyInventoryChanged();
                }}
                style={{
                  ...slotStyle,

                  cursor: slot?.item.png
                    ? `url(${slot.item.png}) 16 16, auto`
                    : "auto",

                  minWidth: slotSize,
                  minHeight: slotSize,
                  borderColor:
                    inv.selectedHotbarSlot === i ? "darkgrey  " : "#666",
                }}
              >
                {slot !== undefined && (
                  <>
                    <img
                      src={slot.item.png}
                      draggable={false}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                    <span
                      // TEXT
                      style={{
                        position: "absolute",
                        top: "0%",
                        right: "50%",
                        transform: "translateX(50%)",
                        fontSize: "1rem",
                      }}
                    >
                      {slot.amount}
                    </span>
                    <span
                      // TEXT
                      style={{
                        color: "white",
                        position: "absolute",
                        bottom: "50%",
                        right: "50%",
                        transform: "translate(50%, 75%)",
                        fontSize: "1rem",
                      }}
                    >
                      {slot.item.name}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const backdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  opacity: 1,
  // background: none,
  alignItems: "top",
  justifyContent: "left",
  zIndex: 20,
  pointerEvents: "none",
  userSelect: "none",
};

const panelStyle: React.CSSProperties = {
  background: "#222",
  color: "#fff",
  padding: "1.5rem",
  borderRadius: "8px",
  fontFamily: "sans-serif",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridAutoFlow: "column",
  gridTemplateRows: `repeat(${inventory.hotbarSize}, 1fr)`,
  gap: "2%",
  direction: "rtl",
  width: "100%",
  height: "100%",
};

const slotStyle: React.CSSProperties = {
  position: "relative",
  width: "60px",
  height: "60px",
  background: "#444",
  border: "2px solid #666",
  borderRadius: "4px",
  pointerEvents: "all",
};

const closeButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#fff",
  fontSize: "1.2rem",
  cursor: "pointer",
};

export const HotbarMenu = () => {
  const { toggleOverlay } = useScreen();
  const inv = useInventory();

  const hotbarSize = inv.hotbarSize;
  const slotSize = getSlotSize(inv);

  return (
    <div style={backdropStyle}>
      <div
        style={{ ...panelStyle, width: panelWidth / 4, height: panelHeight }}
      >
        <div style={gridStyle}>
          {Array.from({ length: hotbarSize }).map((_, i) => {
            const slot: Slot | undefined = inv.content[i];
            return (
              <div
                key={i}
                onDoubleClick={() => {
                  toggleOverlay("inventory");
                }}
                onClick={() => {
                  inv.selectedHotbarSlot = i;
                  notifyInventoryChanged();
                }}
                style={{
                  ...slotStyle,

                  borderColor:
                    inv.selectedHotbarSlot === i ? "darkgrey  " : "#666",
                }}
              >
                {slot !== undefined && (
                  <>
                    <img
                      src={slot.item.png}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                    <span
                      // TEXT
                      style={{
                        position: "absolute",
                        top: "0%",
                        right: "50%",
                        transform: "translateX(50%)",
                        fontSize: "1rem",
                      }}
                    >
                      {slot.amount}
                    </span>
                  </>
                )}
              </div>
            );
          })}{" "}
        </div>
      </div>
    </div>
  );
};

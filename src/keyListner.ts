import {
  add,
  multVar,
  origo,
  sub,
  Vec2,
} from "@repo/math";
import { Dimensions } from "./createCube";
import { Camera } from "./pixi/renderChunk";

export const keys: Record<string, boolean> = {};
export function setupKeyboardListeners(): void {
  window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    // console.log("Ner:", e.code);
    // console.log(e);
    // console.log(e);
  });

  window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
    // console.log("Upp:", e.code);
  });
}

export let mousePos = origo;
export let mouseWorldPos = mousePos;
export const mouseButtons: Record<string, boolean> = {};

export function setupMouseListeners(): void {
  window.addEventListener("mousedown", (e) => {
    if (!(e.target instanceof HTMLCanvasElement)) return;
    if (e.button === 0) mouseButtons["Left"] = true;
    if (e.button === 2) mouseButtons["Right"] = true;
  });

  window.addEventListener("mouseup", (e) => {
    if (e.button === 0) mouseButtons["Left"] = false;
    if (e.button === 2) mouseButtons["Right"] = false;
  });

  window.addEventListener("mousemove", (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
  });

  // Prevent the browser's right-click context menu from popping up,
  // otherwise "Right" will get stuck true after the menu steals mouseup
  window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
}

export const changeMouseWorldPos = (screenSize: Dimensions, camera: Camera) => {
  const center: Vec2 = {
    x: screenSize.width / 2,
    y: screenSize.height / 2,
  };

  const screenOffset: Vec2 = sub(mousePos, center); // mouse relative to screen center
  const worldOffset: Vec2 = multVar(screenOffset, 1 / camera.scale); // undo zoom
  mouseWorldPos = add(worldOffset, camera.pos); // shift into world space
};

export let mouseWheel = 0;
export const setupMouseWheel = () => {
  addEventListener("wheel", (e) => {
    mouseWheel = Math.sign(e.deltaY);
  });
};

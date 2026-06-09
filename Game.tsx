import { Application } from "pixi.js";

export class Game {
  app: Application | null = null;
  private _resolve!: () => void;
  ready: Promise<void> = new Promise<void>((res) => (this._resolve = res));

  async init(container: HTMLElement) {

    this.app = new Application();

    await this.app.init({
      resizeTo: container,
      background: "#222222",
    });

    container.appendChild(this.app.canvas);
    this._resolve();
  }
}

export const game = new Game();

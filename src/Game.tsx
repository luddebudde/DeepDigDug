import { Application } from "pixi.js";

export class Game {
  app: Application | null = null;
  private _resolve!: (app: Application) => void;
  ready: Promise<Application> = new Promise<Application>((res) => (this._resolve = res));

  async init(container: HTMLElement) {

    this.app = new Application();

    await this.app.init({
      resizeTo: container,
      background: "#222222",
    });

    container.appendChild(this.app.canvas);
    this._resolve(this.app);
  }
}

export const game = new Game();

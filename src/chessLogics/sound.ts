import gameStart from "../assets/sounds/chess/game-start.mp3";
import gameEnd from "../assets/sounds/chess/game-end.mp3";

import premove from "../assets/sounds/chess/premove.mp3";
import normalMove from "../assets/sounds/chess/move-normal.mp3";

import capture from "../assets/sounds/chess/capture.mp3";
import castle from "../assets/sounds/chess/castle.mp3";
import check from "../assets/sounds/chess/check.mp3";
import checkWarning from "../assets/sounds/chess/check-warning.mp3";
import promote from "../assets/sounds/chess/promote.mp3";

import lowOnTime from "../assets/sounds/chess/low-on-time.mp3";
import { ActionType } from "./interface";

export default class Sound {
  public static gameStart(): void {
    this.loadSound(gameStart);
  }
  public static gameEnd(): void {
    this.loadSound(gameEnd);
  }
  public static normalMove(): void {
    this.loadSound(normalMove);
  }
  public static capture(): void {
    this.loadSound(capture);
  }
  public static castle(): void {
    this.loadSound(castle);
  }
  public static check(): void {
    this.loadSound(check);
  }
  public static checkWarning(): void {
    this.loadSound(checkWarning);
  }
  public static promote(): void {
    this.loadSound(promote);
  }
  public static premove(): void {
    this.loadSound(premove);
  }
  public static lowOnTime(): void {
    this.loadSound(lowOnTime);
  }

  // prettier-ignore
  public static playMoveSoundByType(actionType: ActionType) {
    switch (actionType) {
      case ActionType.GameStart: Sound.gameStart(); break;
      case ActionType.GameEnd: Sound.gameEnd(); break;
      case ActionType.Normal: Sound.normalMove(); break;
      case ActionType.Capture: Sound.capture(); break;
      case ActionType.Castle: Sound.castle(); break;
      case ActionType.Check: Sound.check(); break;
      case ActionType.CheckWarning: Sound.checkWarning(); break;
      case ActionType.Promote: Sound.promote(); break;
      case ActionType.Premove: Sound.premove(); break;
      case ActionType.LowOnTime: Sound.lowOnTime(); break;
      case ActionType.EnPassant: Sound.capture(); break;
      default: Sound.normalMove(); break;
    }
  }

  private static loadSound(soundName: string): void {
    new Audio(soundName).play();
  }
}

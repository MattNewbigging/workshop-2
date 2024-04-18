import * as THREE from "three";

import { GameLoader } from "../loaders/game-loader";
import { SpaceScene } from "./space-scene";

export class GameState {
  private renderer: THREE.WebGLRenderer;
  private clock = new THREE.Clock();

  private spaceScene: SpaceScene;

  constructor(private gameLoader: GameLoader) {
    // Setup renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.LinearToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = true;

    // Add canvas to dom
    const canvas = this.renderer.domElement;
    const canvasRoot = document.getElementById("canvas-root");
    canvasRoot?.appendChild(canvas);

    this.spaceScene = new SpaceScene(this.renderer, this.gameLoader);

    // Handle any canvas resize events
    window.addEventListener("resize", this.onCanvasResize);
    this.onCanvasResize();

    // Start game
    this.update();
  }

  private onCanvasResize = () => {
    const canvas = this.renderer.domElement;
    const camera = this.spaceScene.getCamera();

    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    camera.aspect = canvas.clientWidth / canvas.clientHeight;

    camera.updateProjectionMatrix();
  };

  private update = () => {
    requestAnimationFrame(this.update);

    const dt = this.clock.getDelta();

    this.spaceScene.update(dt);
  };
}

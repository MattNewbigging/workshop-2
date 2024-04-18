import * as THREE from "three";
import { GameLoader } from "../loaders/game-loader";
import { Player } from "./player";
import { KeyboardListener } from "../listeners/keyboard-listener";
import { AsteroidManager } from "./asteroid-manager";

export class SpaceScene {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera();

  private player: Player;
  private asteroidManager: AsteroidManager;

  constructor(
    private renderer: THREE.WebGLRenderer,
    private gameLoader: GameLoader,
    private keyboardListener: KeyboardListener
  ) {
    this.setupCamera();
    this.setupLights();
    this.setupObjects();
    this.setupSkybox();

    const playerShip = this.gameLoader.modelLoader.get("ship-fighter-05");
    this.player = new Player(playerShip, this.keyboardListener);
    this.player.setup();
    this.scene.add(this.player.ship);

    this.asteroidManager = new AsteroidManager(this.gameLoader, this.scene);
  }

  getCamera() {
    return this.camera;
  }

  update(dt: number) {
    this.player.update(dt);

    // Being far too complicateed even for the lesson - just spawn at top and move straight down
    // Keep circle/alt spawning for further tasks
    //this.asteroidManager.update(dt);

    this.renderer.render(this.scene, this.camera);
  }

  private setupCamera() {
    this.camera.fov = 75;
    this.camera.far = 500;
    const canvas = this.renderer.domElement;
    this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera.position.set(0, 80, 3);
    this.camera.lookAt(0, 0, 0);
  }

  private setupLights() {
    const ambientLight = new THREE.AmbientLight(undefined, 0.25);
    this.scene.add(ambientLight);

    const directLight = new THREE.DirectionalLight(undefined, Math.PI);
    directLight.position.copy(new THREE.Vector3(0.75, 1, 0.75).normalize());
    this.scene.add(directLight);
  }

  private setupObjects() {
    //
  }

  private setupSkybox() {
    const skyboxTexture =
      this.gameLoader.modelLoader.textureLoader.get("skybox");
    if (skyboxTexture) {
      this.scene.background = skyboxTexture;
    }
  }
}

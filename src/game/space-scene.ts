import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GameLoader } from "../loaders/game-loader";

export class SpaceScene {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera();
  private controls: OrbitControls;

  constructor(
    private renderer: THREE.WebGLRenderer,
    private gameLoader: GameLoader
  ) {
    this.setupCamera();
    this.setupLights();
    this.setupObjects();
    this.setupSkybox();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.target.set(0, 1, 0);
  }

  getCamera() {
    return this.camera;
  }

  update(dt: number) {
    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  }

  private setupCamera() {
    this.camera.fov = 75;
    this.camera.far = 500;
    const canvas = this.renderer.domElement;
    this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera.position.set(0, 1.5, 3);
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

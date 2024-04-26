import * as THREE from "three";
import { GameLoader } from "../loaders/game-loader";

import { KeyboardListener } from "../listeners/keyboard-listener";
import { clamp } from "three/src/math/MathUtils";
import { easeInSine, randomRange } from "../utils/math";

interface Player {
  object: THREE.Object3D;
  colliderRadius: number;
  direction: THREE.Vector3;
  velocity: THREE.Vector3;
  speed: number;
  acceleration: number;
  accRampTime: number;
  accRampSpeed: number;
  accRampDir: number;
}

interface Asteroid {
  object: THREE.Object3D;
  colliderRadius: number;
  target: THREE.Vector3;
  speed: number;
}

export class SpaceScene {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera();

  private player: Player;
  private asteroids: Asteroid[] = [];
  private timeToNextAsteroid = 0;
  private colliderRadiusModifer = 0.008;

  constructor(
    private renderer: THREE.WebGLRenderer,
    private gameLoader: GameLoader,
    private keyboardListener: KeyboardListener
  ) {
    this.setupCamera();
    this.setupLights();
    this.setupSkybox();
    this.player = this.setupPlayer();
  }

  getCamera() {
    return this.camera;
  }

  update(dt: number) {
    this.updatePlayer(dt);
    this.updateAsteroids(dt);

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

  private setupSkybox() {
    const skyboxTexture =
      this.gameLoader.modelLoader.textureLoader.get("skybox");
    if (skyboxTexture) {
      this.scene.background = skyboxTexture;
    }
  }

  private setupPlayer(): Player {
    // Make the model face the right way
    const playerShip = this.gameLoader.modelLoader.get("ship-fighter-05");
    playerShip.rotateY(Math.PI);

    this.scene.add(playerShip);

    // Calculate collider radius
    const mesh = playerShip.children[0] as THREE.Mesh;
    mesh.geometry.computeBoundingSphere();
    const boundingSphere = mesh.geometry.boundingSphere;
    const colliderRadius = boundingSphere
      ? boundingSphere.radius * this.colliderRadiusModifer
      : 7.8;

    // Return player object with default values
    return {
      object: playerShip,
      colliderRadius,
      direction: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      speed: 50,
      acceleration: 0,
      accRampTime: 0,
      accRampSpeed: 1.5,
      accRampDir: 0,
    };
  }

  private updatePlayer(dt: number) {
    // Get movement direction from input for this frame
    const forwardPressed = this.keyboardListener.isKeyPressed("w");
    const backwardPressed = this.keyboardListener.isKeyPressed("s");
    const leftPressed = this.keyboardListener.isKeyPressed("a");
    const rightPressed = this.keyboardListener.isKeyPressed("d");

    if (forwardPressed) {
      this.player.direction.z = -1;
    }
    if (backwardPressed) {
      this.player.direction.z = 1;
    }
    if (leftPressed) {
      this.player.direction.x = -1;
    }
    if (rightPressed) {
      this.player.direction.x = 1;
    }

    // Normalise direction so diagonals aren't faster
    this.player.direction.normalize();

    // If any inputs are pressed, accelerate
    if (forwardPressed || backwardPressed || leftPressed || rightPressed) {
      this.player.accRampDir = 1;
    } else {
      // If no inputs are pressed, decelerate
      this.player.accRampDir = -1;
    }

    // Tick the acceleration ramp timer, normalise it to 0..1
    this.player.accRampTime +=
      this.player.accRampDir * dt * this.player.accRampSpeed;
    this.player.accRampTime = clamp(this.player.accRampTime, 0, 1);

    // Work out acceleration with new time value
    this.player.acceleration = easeInSine(this.player.accRampTime);

    // Effective speed takes acceleration and delta time into account
    const effectiveSpeed = this.player.speed * this.player.acceleration * dt;

    // Velocity describes the next point in space for the ship
    this.player.velocity.copy(
      this.player.direction.multiplyScalar(effectiveSpeed)
    );

    // Add velocity to current position to move the ship by that much
    this.player.object.position.add(this.player.velocity);
  }

  private updateAsteroids(dt: number) {
    // Count down spawn timers
    this.timeToNextAsteroid -= dt;

    if (this.timeToNextAsteroid <= 0) {
      this.spawnAsteroid();
      this.timeToNextAsteroid = 1;
    }

    // Update each asteroid
    for (let i = this.asteroids.length; i--; ) {
      const { object, colliderRadius, target, speed } = this.asteroids[i];

      // Move towards target
      const dir = target.clone().sub(object.position).normalize();
      const step = dir.multiplyScalar(speed * dt);
      object.position.add(step);

      // Rotate
      object.rotation.x += dt * 0.5;
      object.rotation.z += dt * 0.25;

      // Destroy if reached target
      const distanceToTarget = object.position.distanceTo(target);
      if (distanceToTarget < 1) {
        this.destroyAsteroid(i);
      }

      // Destroy if hit player
      const distanceToPlayer = object.position.distanceTo(
        this.player.object.position
      );
      const radii = colliderRadius + this.player.colliderRadius;
      if (distanceToPlayer <= radii) {
        this.destroyAsteroid(i);
      }
    }
  }

  private spawnAsteroid() {
    // Get random asteroid of 1-5 available
    const rnd = Math.ceil(Math.random() * 5);
    const asteroid = this.gameLoader.modelLoader.get(`asteroid-0${rnd}`);

    // Collider radius
    const mesh = asteroid.children[0] as THREE.Mesh;
    mesh.geometry.computeBoundingSphere();
    const boundingSphereRadius = mesh.geometry.boundingSphere?.radius ?? 3;
    const colliderRadius = boundingSphereRadius * this.colliderRadiusModifer;

    // Random start position along the top of the screen
    const x = randomRange(-100, 100);
    asteroid.position.set(x, 0, -100);
    this.scene.add(asteroid);

    // Random target position along the bottom of the screen
    const target = new THREE.Vector3(randomRange(-100, 100), 0, 100);

    this.asteroids.push({
      object: asteroid,
      colliderRadius,
      target,
      speed: randomRange(5, 15),
    });
  }

  private destroyAsteroid(index: number) {
    const asteroid = this.asteroids[index];

    // Traverse object hierarchy and dispose of all meshes found
    asteroid.object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.MeshStandardMaterial).dispose();
      }
    });

    this.asteroids.splice(index, 1);
    this.scene.remove(asteroid.object);
  }
}

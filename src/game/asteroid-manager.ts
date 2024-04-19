import * as THREE from "three";
import { GameLoader } from "../loaders/game-loader";
import { randomRange } from "../utils/math";

interface Asteroid {
  object: THREE.Mesh;
  target: THREE.Vector3;
  speed: number;
}

export class AsteroidManager {
  private asteroids: Asteroid[] = [];
  private timeToNextAsteroid = 0;

  constructor(private gameLoader: GameLoader, private scene: THREE.Scene) {}

  update(dt: number) {
    // Count down spawn timers
    this.timeToNextAsteroid -= dt;

    if (this.timeToNextAsteroid <= 0) {
      this.spawnAsteroid();
      this.resetAsteroidSpawnTimer();
    }

    // Move asteroids
    for (let i = this.asteroids.length; i--; ) {
      const { object, target, speed } = this.asteroids[i];

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
        console.log("destroying asteroid at", i);
        this.destroyAsteroid(i);
      }
    }
  }

  private spawnAsteroid() {
    // Get random asteroid of 1-5 available
    const rnd = Math.ceil(Math.random() * 5);
    const asteroid = this.gameLoader.modelLoader.get(
      `asteroid-0${rnd}`
    ) as THREE.Mesh;

    // Random start position along the top of the screen
    const x = randomRange(-100, 100);
    asteroid.position.set(x, 0, -100);
    this.scene.add(asteroid);

    // Random target position along the bottom of the screen
    const target = new THREE.Vector3(randomRange(-100, 100), 0, 100);

    this.asteroids.push({
      object: asteroid,
      target,
      speed: randomRange(5, 15),
    });
  }

  private resetAsteroidSpawnTimer() {
    this.timeToNextAsteroid = 1;
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

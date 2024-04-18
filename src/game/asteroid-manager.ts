import * as THREE from "three";
import { GameLoader } from "../loaders/game-loader";

interface Asteroid {
  object: THREE.Object3D;
  target: THREE.Vector3;
  speed: number;
}

export class AsteroidManager {
  private asteroids: Asteroid[] = [];
  private timeToNextAsteroid = 1;

  constructor(private gameLoader: GameLoader, private scene: THREE.Scene) {}

  update(dt: number) {
    // Count down spawn timers
    this.timeToNextAsteroid -= dt;

    if (this.timeToNextAsteroid <= 0) {
      this.spawnAsteroid();
      this.resetAsteroidSpawnTimer();
    }

    // Move asteroids
    this.asteroids.forEach((asteroid) => {
      // Move towards target
      const dir = asteroid.target
        .clone()
        .sub(asteroid.object.position)
        .normalize();
      const step = dir.multiplyScalar(asteroid.speed * dt);
      asteroid.object.position.add(step);
    });
  }

  private spawnAsteroid() {
    // Get random asteroid of 5 available
    const rnd = Math.ceil(Math.random() * 5);
    const asteroid = this.gameLoader.modelLoader.get(`asteroid-0${rnd}`);

    // Get a random angle
    const angle = Math.random() * Math.PI * 2;

    // Radius should make circle slightly larger than screen
    const radius = 50;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    asteroid.position.set(x, 0, z);
    this.scene.add(asteroid);

    const target = new THREE.Vector3(-x, 0, -z);

    this.asteroids.push({ object: asteroid, target, speed: 10 });
  }

  private resetAsteroidSpawnTimer() {
    this.timeToNextAsteroid = 1;
  }
}

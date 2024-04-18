import * as THREE from "three";
import { KeyboardListener } from "../listeners/keyboard-listener";
import { clamp } from "three/src/math/MathUtils";
import { easeInSine } from "../utils/math";

export class Player {
  direction = new THREE.Vector3();
  velocity = new THREE.Vector3();
  speed = 50;
  acceleration = 0;
  accRampTime = 0;
  accRampSpeed = 1.5;
  accRampDir = 0;

  constructor(
    public ship: THREE.Object3D,
    private keyboardListener: KeyboardListener
  ) {}

  setup() {
    // Face the right way
    this.ship.rotateY(Math.PI);

    this.setupCollider();
  }

  update(dt: number) {
    // Get movement direction from input for this frame
    const forwardPressed = this.keyboardListener.isKeyPressed("w");
    const backwardPressed = this.keyboardListener.isKeyPressed("s");
    const leftPressed = this.keyboardListener.isKeyPressed("a");
    const rightPressed = this.keyboardListener.isKeyPressed("d");

    if (forwardPressed) {
      this.direction.z = -1;
    }
    if (backwardPressed) {
      this.direction.z = 1;
    }
    if (leftPressed) {
      this.direction.x = -1;
    }
    if (rightPressed) {
      this.direction.x = 1;
    }

    // Normalise direction so diagonals aren't faster
    this.direction.normalize();

    // If any inputs are pressed, accelerate
    if (forwardPressed || backwardPressed || leftPressed || rightPressed) {
      this.accRampDir = 1;
    } else {
      // If no inputs are pressed, decelerate
      this.accRampDir = -1;
    }

    // Tick the acceleration ramp timer, normalise it to 0..1
    this.accRampTime += this.accRampDir * dt * this.accRampSpeed;
    this.accRampTime = clamp(this.accRampTime, 0, 1);

    // Work out acceleration with new time value
    this.acceleration = easeInSine(this.accRampTime);

    // Effective speed takes acceleration and delta time into account
    const effectiveSpeed = this.speed * this.acceleration * dt;

    // Velocity describes the next point in space for the ship
    this.velocity.copy(this.direction.multiplyScalar(effectiveSpeed));

    // Add velocity to current position to move the ship by that much
    this.ship.position.add(this.velocity);
  }

  private setupCollider() {
    // Use basic spherical collider for the ship
    const mesh = this.ship.children[0] as THREE.Mesh;
    mesh.geometry.computeBoundingSphere();
  }
}

import * as THREE from 'three';

export const radius = 0.5;
export const player = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 8, 8),
    new THREE.MeshStandardMaterial({ 
        color: 0x00ffff, 
        emissive: 0x00ffff, 
        emissiveIntensity: 0.5,
        wireframe: true 
    })
);
player.position.y = radius;
player.position.z = 3;
player.castShadow = true;

// Private variables (only accessible inside this file)
const keys = { w: false, a: false, s: false, d: false };
const velocity = new THREE.Vector3();
const acceleration = 0.02;
const friction = 0.45;
const maxSpeed = 0.5;

export function initControls() {
    window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

    // Alt-tabbing (or any focus loss) doesn't fire keyup, so held keys get stuck "down".
    // Release everything once the window loses focus.
    window.addEventListener('blur', () => {
        for (const key in keys) keys[key] = false;
    });
}

export function updatePlayer(camera) {
    // 1. Calculate movement direction
    const moveDir = new THREE.Vector3();
    if (keys.w) moveDir.z -= 1;
    if (keys.s) moveDir.z += 1;
    if (keys.a) moveDir.x -= 1;
    if (keys.d) moveDir.x += 1;
    moveDir.normalize();

    // 2. Apply Acceleration & Friction
    velocity.add(moveDir.multiplyScalar(acceleration));
    velocity.multiplyScalar(friction); 
    velocity.clampLength(0, maxSpeed);

    // 3. Move the sphere
    player.position.add(velocity);

    // 4. Roll Logic
    const distanceMoved = velocity.length();
    if (distanceMoved > 0.001) {
        const rotationAxis = new THREE.Vector3(velocity.z, 0, -velocity.x).normalize();
        player.rotateOnWorldAxis(rotationAxis, distanceMoved / radius);
    }

    // 5. Camera Follow
    const idealOffset = new THREE.Vector3(0, 3, 6); 
    idealOffset.add(player.position);
    camera.position.lerp(idealOffset, 0.1);
    camera.lookAt(player.position);
}

// Helper to reset player from main.js
export function resetPlayerPosition(startPosition) {
    player.position.copy(startPosition);
    velocity.set(0, 0, 0); 
}
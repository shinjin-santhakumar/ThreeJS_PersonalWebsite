import * as THREE from 'three';

export let stars;
export const floorSigns = [];

function randomExcluded(min, max, exMin, exMax) { 
    let size = exMax - exMin + 1; 
    let n = Math.floor(Math.random() * (max - min + 1 - size) + min); 
    if (n >= exMin) n += size; return n; 
}

export function initEnvironment(scene) {
    // Grid
    const grid = new THREE.GridHelper(100, 100, 0xff00ff, 0x222222);
    scene.add(grid);

    // Lighting
    const light = new THREE.PointLight(0x00ffff, 10, 50);
    light.position.set(0, 5, 0);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // Stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 500;
    const posArray = new Float32Array(starCount * 3); 

    for (let i = 0; i < starCount * 3; i++) {
        posArray[i] = randomExcluded(-50, 50, -10, 10); 
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, sizeAttenuation: true });
    
    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

export function createGroundText(scene, text, x, z) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    context.font = 'bold 100px "Courier New", monospace';
    const textWidth = context.measureText(text).width;

    canvas.width = textWidth + 100; 
    canvas.height = 256; 

    context.font = 'bold 100px "Courier New", monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.shadowColor = '#ff00ff';
    context.shadowBlur = 20;
    context.fillStyle = '#ffffff';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const planeHeight = 2;
    const planeWidth = (canvas.width / canvas.height) * planeHeight;

    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.8 });
    
    const textMesh = new THREE.Mesh(geometry, material);
    textMesh.rotation.x = (-Math.PI / 2) * 0.55; 
    textMesh.position.set(x, 0.01, z);

    scene.add(textMesh);
    floorSigns.push(textMesh);
}
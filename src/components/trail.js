import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

const trailLength = 60; 
const trailPositions = new Float32Array(trailLength * 3);
const trailColors = new Float32Array(trailLength * 3);
export let trailMaterial;
export let neonTrail;

export function initTrail(scene, player) {
    const headColor = new THREE.Color(0x00ffff); 
    const tailColor = new THREE.Color(0x020205); 

    for (let i = 0; i < trailLength; i++) {
        trailPositions[i * 3] = player.position.x;
        trailPositions[i * 3 + 1] = 0.05;
        trailPositions[i * 3 + 2] = player.position.z;

        const ratio = i / (trailLength - 1); 
        const mixedColor = headColor.clone().lerp(tailColor, ratio);
        
        trailColors[i * 3] = mixedColor.r;
        trailColors[i * 3 + 1] = mixedColor.g;
        trailColors[i * 3 + 2] = mixedColor.b;
    }

    const trailGeometry = new LineGeometry();
    trailGeometry.setPositions(trailPositions);
    trailGeometry.setColors(trailColors);

    trailMaterial = new LineMaterial({
        color: 0xffffff,
        linewidth: 8, 
        vertexColors: true, 
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight), 
        transparent: true,
        opacity: 0.8
    });

    neonTrail = new Line2(trailGeometry, trailMaterial);
    scene.add(neonTrail);
}

export function updateTrail(player) {
    for (let i = trailPositions.length - 1; i >= 3; i--) {
        trailPositions[i] = trailPositions[i - 3];
    }
    trailPositions[0] = player.position.x;
    trailPositions[1] = 0.05; 
    trailPositions[2] = player.position.z;

    neonTrail.geometry.setPositions(trailPositions);
}
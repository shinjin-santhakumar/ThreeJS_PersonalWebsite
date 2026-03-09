import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

const interactiveProjects = []; 
const activationDistance = 3.5;

export function createProjectNode(scene, title, description, x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0.5, z); 

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ffff, wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    const div = document.createElement('div');
    div.className = 'project-label'; 
    div.innerHTML = `
        <h3>${title}</h3>
        <p>${description}</p>
        <button>View on GitHub</button>
    `;
    
    const label = new CSS2DObject(div);
    label.position.set(0, 1.5, 0); 
    group.add(label);

    scene.add(group);
    interactiveProjects.push({ group, htmlElement: div });
}

export function checkProximity(player) {
    interactiveProjects.forEach(project => {
        const distance = player.position.distanceTo(project.group.position);

        if (distance < activationDistance) {
            project.htmlElement.classList.add('visible'); 
            project.group.children[0].rotation.y += 0.05; 
        } else {
            project.htmlElement.classList.remove('visible'); 
            project.group.children[0].rotation.y += 0.01; 
        }
    });
}
import * as THREE from 'three';
import './style.css';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// Import our custom modules
import { player, radius, initControls, updatePlayer, resetPlayerPosition } from './components/player.js';
import { initTrail, updateTrail, trailMaterial } from './components/trail.js';
import { initEnvironment, createGroundText, floorSigns, stars } from './components/environment.js';
import { createExperienceNode, checkExperienceProximity, createProjectNode} from './components/exp.js';
import { createLandingNode, updateLandingNode } from './components/landing.js';


// --- CORE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020205); 
scene.fog = new THREE.FogExp2(0x020205, 0.05); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild(labelRenderer.domElement);

// --- INITIALIZE COMPONENTS ---
scene.add(player);
initControls();
initTrail(scene, player);
initEnvironment(scene);

const landingGroup = createLandingNode(scene, "John Doe", 0 , 0);

// Spawn Level Data
createGroundText(scene, "// PROJECT_ZONE", 7, -1);
createGroundText(scene, "// WORK_EXPERIENCE", 18, -1);


createProjectNode(scene, "Cyber AI", "Machine learning python script", 5, -5);
createProjectNode(scene, "E-Commerce API", "Built with Node.js and Stripe", 10, -5);
createProjectNode(scene, "React Dashboard", "Real-time data visualization", 15, -5);


createExperienceNode(scene, "Frontend Dev", "Tech Corp", "Led React migration, improved performance by 40%.", 15, -5);
createExperienceNode(scene, "Systems Admin", "CyberSec Inc.", "Maintained Linux servers and wrote bash automation scripts.", 20, -5);

// --- UI LOGIC ---
const resetBtn = document.getElementById('reset-btn');
const startPosition = new THREE.Vector3(0, radius, 0); 
const maxSafeDistance = 25; 

resetBtn.addEventListener('click', () => {
    resetPlayerPosition(startPosition);
    camera.position.set(0, 3, 6);
});

// --- RESIZE LOGIC ---
const BASE_SCREEN_WIDTH = 1920;
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);

    let responsiveScale = Math.min(1, window.innerWidth / BASE_SCREEN_WIDTH); 
    responsiveScale = Math.max(0.4, responsiveScale);

    floorSigns.forEach(sign => sign.scale.set(responsiveScale, responsiveScale, responsiveScale));
    trailMaterial.resolution.set(window.innerWidth, window.innerHeight);
});

// --- ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);

    // Update Modules
    updatePlayer(camera);
    updateTrail(player);
    checkExperienceProximity(player);

    updateLandingNode(landingGroup);
    // Update Static Animations
    stars.rotation.y += 0.0005;

    // Distance Check for Reset Button
    if (player.position.distanceTo(startPosition) > maxSafeDistance) {
        resetBtn.style.opacity = '1';
        resetBtn.style.pointerEvents = 'auto'; 
    } else {
        resetBtn.style.opacity = '0';
        resetBtn.style.pointerEvents = 'none'; 
    }

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

animate();
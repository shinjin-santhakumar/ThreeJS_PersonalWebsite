import * as THREE from 'three';
import './style.css';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// Import our custom modules
import { player, radius, initControls, updatePlayer, resetPlayerPosition } from './components/player.js';
import { initTrail, updateTrail, trailMaterial } from './components/trail.js';
import { initEnvironment, createGroundText, floorSigns, stars } from './components/environment.js';
import { createExperienceNode, checkExperienceProximity, createProjectNode, createHobbyNode, createResumeNode } from './components/exp.js';
import { createLandingNode, updateLandingNode } from './components/landing.js';
import { createContactNode, checkContactProximity } from './components/contact.js';


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

const landingGroup = createLandingNode(scene, "Shinjin Santhakumar", 0 , 0);

// Spawn Level Data
createGroundText(scene, "// PROJECT_ZONE", 10, -1);
createGroundText(scene, "// WORK_EXPERIENCE", 10, -10);
createGroundText(scene, "// HOBBY_LOBBY", -10, -1);
createGroundText(scene, "// CONTACT_ME", -10, -10);
createGroundText(scene, "// RESUME", 0, -15);


createProjectNode(scene, "Cyber AI", "Machine learning python script", 5, -5);
createProjectNode(scene, "E-Commerce API", "Built with Node.js and Stripe", 10, -5);
createProjectNode(scene, "React Dashboard", "Real-time data visualization", 15, -5);


createExperienceNode(scene, "Software Engineer Intern", "Appriss Retail", "Led React migration, improved performance by 40%.", 8, -14);
createExperienceNode(scene, "Systems Admin", "CyberSec Inc.", "Maintained Linux servers and wrote bash automation scripts.", 12, -14);

createHobbyNode(scene, "Gaming", "PC, PS4, Xbox, Switch", -10 , -5);

createResumeNode(scene, "https://docs.google.com/document/d/1" , "Resume" , 0, -16);


createContactNode(scene, -10, -14);


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
    const activeTag = document.activeElement ? document.activeElement.tagName : '';
    if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
        updatePlayer(camera);
    }
    updateTrail(player);
    checkExperienceProximity(player);
    checkContactProximity(player);

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
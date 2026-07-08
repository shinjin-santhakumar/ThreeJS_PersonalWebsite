import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import './style.css';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Import our custom modules
import { player, radius, initControls, updatePlayer, resetPlayerPosition } from './components/player.js';
import { initTrail, updateTrail, trailMaterial } from './components/trail.js';
import { initEnvironment, createGroundText, floorSigns, stars } from './components/environment.js';
import { createExperienceNode, checkExperienceProximity, createProjectNode, createHobbyNode, createResumeNode } from './components/exp.js';
import { createLandingNode, updateLandingNode } from './components/landing.js';
import { createContactNode, checkContactProximity } from './components/contact.js';
import { SkyText } from './SkyText.js';


// 1. Setup the Loader and Asset List
const loader = new GLTFLoader();
const ASSETS = {
    // barbell: '/models/barbell.glb',
    // add others here if needed
};

// 2. Define the Geometry Extractor
async function getGeometries(assetMap) {
    const geoLib = {};
    const promises = Object.entries(assetMap).map(async ([name, url]) => {
        const gltf = await loader.loadAsync(url);
        gltf.scene.traverse((node) => {
            if (node.isMesh && !geoLib[name]) {
                geoLib[name] = node.geometry.clone();
                // Tip: If the model is tiny/huge, apply scale here:
                // geoLib[name].scale(2, 2, 2); 
            }
        });
    });
    await Promise.all(promises);
    return geoLib;
}


async function init() {

    // Load geometries first
    const geometries = await getGeometries(ASSETS);

    // --- CORE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020205); 
    scene.fog = new THREE.FogExp2(0x020205, 0.05); 

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // --- POST PROCESSING ---
    const renderScene = new RenderPass(scene, camera);

    // Parameters: resolution, strength, radius, threshold
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.3,  // Strength of the glow (adjust this!)
        0.2,  // Radius of the glow
        0.1   // Threshold (how bright something needs to be to start glowing)
    );

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);




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
    SkyText(scene);

    const landingGroup = createLandingNode(scene, "Shinjin Santhakumar", 0 , 0);

    // Spawn Level Data
    createGroundText(scene, "// PROJECT_ZONE", 10, -1);
    createGroundText(scene, "// WORK_EXPERIENCE", 10, -10);
    createGroundText(scene, "// HOBBY_LOBBY", -10, -1);
    createGroundText(scene, "// CONTACT_ME", -10, -10);
    createGroundText(scene, "// RESUME", 0, -15);


    createProjectNode(scene, "Steamdle: Guess the game", "Created a game similar to wordle but for Steam games", 5, -5, 'https://github.com/shinjin-santhakumar/Steamdle-frontend', 'https://steamdle-frontend.vercel.app/');
    createProjectNode(scene, "Frozen Frontier", "A Unity game made for a game jam", 10, -5, 'https://github.com/shinjin-santhakumar/LunarJam2023' , 'https://thegreenphoenix.itch.io/ff');
    createProjectNode(scene, "Kickstart analytics", "Ultized Flask to create anaytics of successful kickstarter campaigns", 15, -5, 'https://github.com/shinjin-santhakumar/Client-Server-App');


    createExperienceNode(scene, "Softwawre Test Engineer", "Becton Dickenson" , "Ultized Squish and Python to create automatated and manual test cases", 6, -14)
    createExperienceNode(scene, "Software Engineer Intern", "Appriss Retail", "Worked as .NET developer for a SaaS company", 10, -14);
    createExperienceNode(scene, "Web Developer", "Nexxon Inc.", "Created a new webpage for a small company.", 14, -14);
    


    const gameImages = Array.from({ length: 9}, (_, i) => `/games/game${i + 1}.jpg`);
    createHobbyNode(scene, "Gaming", "Favorite games of all time", -15 , -5, gameImages);
    const gymImages = Array.from({ length: 5}, (_, i) => `/gym/gym${i + 1}.jpg`);
    createHobbyNode(scene, "Gyming", "Goated machines", -20 , -5, gymImages);
    const bookImages = Array.from({ length: 8}, (_, i) => `/books/book${i + 1}.jpg`);
    createHobbyNode(scene, "Reading", "Some of my favorite books", -10 , -5, bookImages);

    createHobbyNode(scene, "FPV Drones", "One of my first flights", -5 , -5, [], "/drones/flight1.mp4")



    createResumeNode(scene, "/resume" , "Resume" , 0, -19);
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
        composer.setSize(window.innerWidth, window.innerHeight);
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

        composer.render();
        labelRenderer.render(scene, camera);
    }

    animate();
}

init();
import * as THREE from 'three';
import './style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';





// --- SCENE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020205); // Deep space blue
scene.fog = new THREE.FogExp2(0x020205, 0.05); // Add atmosphere/mystery

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// --- HTML ---
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild(labelRenderer.domElement);


// --- THE ROLLING SPHERE (THE USER) ---
const radius = 0.5;
const sphereGeometry = new THREE.SphereGeometry(radius, 8 , 8);
// Use a Wireframe or a Grid texture to make the rotation visible
const sphereMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x00ffff, 
    emissive: 0x00ffff, 
    emissiveIntensity: 0.5,
    wireframe: true 
});
const player = new THREE.Mesh(sphereGeometry, sphereMaterial);
player.position.y = radius; // Sit on top of the floor
player.castShadow = true;
scene.add(player);

// --- THE SYNTHWAVE GRID FLOOR ---
const grid = new THREE.GridHelper(100, 100, 0xff00ff, 0x222222);
scene.add(grid);

// --- LIGHTING ---
const light = new THREE.PointLight(0x00ffff, 10, 50);
light.position.set(0, 5, 0);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// --- MOVEMENT VARIABLES ---
const keys = { w: false, a: false, s: false, d: false };
const velocity = new THREE.Vector3();
const acceleration = 0.02;
const friction = 0.45;
const maxSpeed = 0.5;

window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);


function randomExcluded(min, max, exMin, exMax) { 
    let size = exMax - exMin + 1; 
    let n = Math.floor(Math.random() * (max - min + 1 - size) + min); 
    if (n >= exMin) n += size; return n; 

}


// 1. Create geometry and define star positions
const starGeometry = new THREE.BufferGeometry();
const starCount = 500;
const posArray = new Float32Array(starCount * 3); // x, y, z for each star

for (let i = 0; i < starCount * 3; i++) {
    // Generate random positions within a range (e.g., -500 to 500)
    posArray[i] =  randomExcluded(-50, 50, -10, 10); //(Math.random() - 0.5) * 100;
    
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// 2. Create material
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 1.5, // Adjust for star size
  sizeAttenuation: true // Makes stars smaller in the distance
});

// 3. Create points object and add to scene
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);


// --- THE ADVANCED GRADIENT TRAIL ---
const trailLength = 60; 
const trailPositions = new Float32Array(trailLength * 3);
const trailColors = new Float32Array(trailLength * 3);

// 1. Define your gradient colors
const headColor = new THREE.Color(0x00ffff); // Cyan (at the player)
const tailColor = new THREE.Color(0x020205); // Magenta (fading away)

// 2. Pre-fill the arrays
for (let i = 0; i < trailLength; i++) {
    // Fill initial positions (so it doesn't glitch at 0,0,0)
    trailPositions[i * 3] = player.position.x;
    trailPositions[i * 3 + 1] = 0.05;
    trailPositions[i * 3 + 2] = player.position.z;

    // Calculate the Gradient Color for this specific point
    const ratio = i / (trailLength - 1); // 0.0 at head, 1.0 at tail
    const mixedColor = headColor.clone().lerp(tailColor, ratio);
    
    trailColors[i * 3] = mixedColor.r;
    trailColors[i * 3 + 1] = mixedColor.g;
    trailColors[i * 3 + 2] = mixedColor.b;
}

// 3. Create the advanced Geometry
const trailGeometry = new LineGeometry();
trailGeometry.setPositions(trailPositions);
trailGeometry.setColors(trailColors);

// 4. Create the advanced Material
const trailMaterial = new LineMaterial({
    color: 0xffffff,
    linewidth: 8, // BOOM! Thick lines in pixels!
    vertexColors: true, // Enables the gradient
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight), // REQUIRED for thickness to calculate correctly
    transparent: true,
    opacity: 0.8
});

const neonTrail = new Line2(trailGeometry, trailMaterial);
scene.add(neonTrail);


// --- RESET BUTTON LOGIC ---
const resetBtn = document.getElementById('reset-btn');
const startPosition = new THREE.Vector3(0, radius, 0); // Where the player started
const maxSafeDistance = 25; // How many units away before the button appears

resetBtn.addEventListener('click', () => {
    // 1. Teleport player back to start
    player.position.copy(startPosition);
    
    // 2. CRITICAL: Kill the momentum!
    // If you don't reset velocity, the sphere will keep rolling immediately after teleporting
    velocity.set(0, 0, 0); 
    
    // 3. Optional: Reset camera immediately 
    // (If you don't do this, the camera has to fly back across the map to catch up)
    camera.position.set(0, 3, 6);
});

// --- GROUND TEXT LOGIC ---
const floorSigns = [];

// A baseline width (e.g., standard desktop monitor)
const BASE_SCREEN_WIDTH = 1920;

function onWindowResize() {
    // 1. Standard camera and renderer updates
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);

    // 2. THE RESPONSIVE MATH
    // If screen is 1920px, scale is 1. If screen is 960px, scale is 0.5.
    // We use Math.min so it doesn't get massively huge on ultrawide monitors
    let responsiveScale = window.innerWidth / BASE_SCREEN_WIDTH;
    responsiveScale = Math.min(1, responsiveScale); 
    
    // Set a minimum scale so it doesn't become invisible on tiny phones
    responsiveScale = Math.max(0.4, responsiveScale);

    // 3. Apply this scale to all your floor signs
    floorSigns.forEach(sign => {
        sign.scale.set(responsiveScale, responsiveScale, responsiveScale);
    });

    // 4. Apply this scale to the trail material
    trailMaterial.resolution.set(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

// Call it once on startup to set the initial size correctly
onWindowResize();


function createGroundText(text, x, z) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // 1. Set the font FIRST so we can measure it accurately
    context.font = 'bold 100px "Courier New", monospace';

    // 2. Measure exactly how wide this specific text is
    const textMetrics = context.measureText(text);
    const textWidth = textMetrics.width;

    // 3. Dynamically size the canvas (add 100px padding for the neon glow)
    canvas.width = textWidth + 100; 
    canvas.height = 256; // Keep height consistent

    // Note: Resizing a canvas clears it, so we must re-apply the font styles!
    context.font = 'bold 100px "Courier New", monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.shadowColor = '#ff00ff';
    context.shadowBlur = 20;
    context.fillStyle = '#ffffff';

    // Draw the text in the exact center
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);

    // 4. Calculate the 3D Plane size based on the canvas aspect ratio
    // If our height is 2 world units, our width needs to be proportional
    const planeHeight = 2;
    const planeWidth = (canvas.width / canvas.height) * planeHeight;

    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    const material = new THREE.MeshBasicMaterial({ 
        map: texture, 
        transparent: true, 
        opacity: 0.8       
    });
    
    const textMesh = new THREE.Mesh(geometry, material);
    textMesh.rotation.x = (-Math.PI / 2)*0.55; 
    textMesh.position.set(x, 0.01, z);

    scene.add(textMesh);
    
    // Save it to our array for responsive scaling later
    floorSigns.push(textMesh);
}

// Call the function to place your signs
createGroundText("// PROJECT_ZONE", 0, -1);
createGroundText("// WORK_EXPERIENCE", 13, -1);



/// --- PROJECT NODES ---
// Array to hold all our project objects for the distance check
const interactiveProjects = []; 

function createProjectNode(title, description, x, z) {
    // 1. Create the Group (This holds both the 3D mesh and 2D label)
    const group = new THREE.Group();
    group.position.set(x, 0.5, z); // Position the whole group in the world

    // 2. Create the 3D Object (The physical "Pedestal" or "Data Cube")
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x00ffff, 
        wireframe: true 
    });
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    // 3. Create the 2D HTML Label
    const div = document.createElement('div');
    div.className = 'project-label'; // Gets the opacity: 0 from CSS
    div.innerHTML = `
        <h3>${title}</h3>
        <p>${description}</p>
        <button>View on GitHub</button>
    `;
    
    const label = new CSS2DObject(div);
    label.position.set(0, 1.5, 0); // Hover slightly above the 3D cube
    group.add(label);

    // 4. Add the group to the scene
    scene.add(group);

    // 5. Save the references so we can use them in the animation loop
    interactiveProjects.push({
        group: group,
        htmlElement: div // We need this to toggle the CSS class
    });
}


// --- CREATE PROJECT NODES ---
// Now you can easily spawn as many projects as you want!
createProjectNode("E-Commerce API", "Built with Node.js and Stripe", 5, -5);
createProjectNode("React Dashboard", "Real-time data visualization", -5, -5);
createProjectNode("Cyber AI", "Machine learning python script", 0, -5);





const activationDistance = 3.5; // How close the sphere needs to be

// --- THE ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);

    // 1. Calculate movement direction based on camera orientation
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

    // 4. THE ROLL LOGIC
    // We rotate the sphere around an axis perpendicular to the movement
    // Rotation = Distance / Radius
    const distanceMoved = velocity.length();
    if (distanceMoved > 0.001) {
        const rotationAxis = new THREE.Vector3(velocity.z, 0, -velocity.x).normalize();
        player.rotateOnWorldAxis(rotationAxis, distanceMoved / radius);
    }

    // 5. Camera Follow (Smooth Lerp)
    const idealOffset = new THREE.Vector3(0, 3, 6); // Stay behind/above
    idealOffset.add(player.position);
    camera.position.lerp(idealOffset, 0.1);
    camera.lookAt(player.position);

    // 6. Project Distance Check (Interaction)
    // Example: If player is near (0, 0.5, -10), trigger "Project 1"


    // --- PROXIMITY CHECK ---
    interactiveProjects.forEach(project => {
        // Calculate distance from player to this specific project group
        const distance = player.position.distanceTo(project.group.position);

        // If the player is inside the radius, show it. Otherwise, hide it.
        if (distance < activationDistance) {
            project.htmlElement.classList.add('visible'); // Fades in!
            
            // Optional: Make the 3D cube spin faster when you are near it!
            project.group.children[0].rotation.y += 0.05; 
        } else {
            project.htmlElement.classList.remove('visible'); // Fades out!
            
            // Normal slow spin
            project.group.children[0].rotation.y += 0.01; 
        }
    });

    // --- UPDATE ADVANCED TRAIL ---
    // 1. Shift all existing points down the array
    for (let i = trailPositions.length - 1; i >= 3; i--) {
        trailPositions[i] = trailPositions[i - 3];
    }

    // 2. Add the current player position to the front
    trailPositions[0] = player.position.x;
    trailPositions[1] = 0.05; 
    trailPositions[2] = player.position.z;

    // 3. Feed the new positions into the geometry
    neonTrail.geometry.setPositions(trailPositions);




    // --- Distance Check for Reset Button ---
    const distanceToOrigin = player.position.distanceTo(startPosition);

    if (distanceToOrigin > maxSafeDistance) {
        // Show the button
        resetBtn.style.opacity = '1';
        resetBtn.style.pointerEvents = 'auto'; // Make it clickable
    } else {
        // Hide the button
        resetBtn.style.opacity = '0';
        resetBtn.style.pointerEvents = 'none'; // Prevent invisible clicks
    }

    stars.rotation.y += 0.0005;

    
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera); // Render the HTML layer!
}
animate();
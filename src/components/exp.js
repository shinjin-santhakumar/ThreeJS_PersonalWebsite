import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { color } from 'three/tsl';

const interactiveExperiences = [];
const interactiveProjects = []; 
const interactiveHobbies = [];
const interactiveResumes = [];
const activationDistance = 3.5;

export function createExperienceNode(scene, role, company, description, x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0.5, z); 
    
    // Use an Octahedron (Diamond) for variety
    const mesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.8),
        
        new THREE.MeshStandardMaterial({ color: 0x00ff00, 
                 emissive: 0x00ffff,       // The actual glowing neon color (Cyan)
         emissiveIntensity: 2.0,   // Crank this up! (Try 2 to 5)     
        wireframe: true })
    );
    group.add(mesh);

    const div = document.createElement('div');
    div.className = 'experience-label'; 
    
    // The text we want to type out
    const fullText = `> ROLE: ${role}\n> COMP: ${company}\n> DESC: ${description}`;

    div.innerHTML = `
        <div class="terminal-header">root@system:~/experiences$ ./view.sh</div>
        <div class="terminal-body"></div><span class="cursor-blink">_</span>
    `;
    
    const label = new CSS2DObject(div);
    label.position.set(0, 1.5, 0); 
    group.add(label);
    
    // Add to the passed-in scene
    scene.add(group);

    interactiveExperiences.push({ 
        group, 
        htmlElement: div,
        textBody: div.querySelector('.terminal-body'),
        fullText: fullText,
        wasActive: false,
        typeTimer: null
    });
}


export function createProjectNode(scene, title, description, x, z, link, playable = "") {
    const group = new THREE.Group();
    group.position.set(x, 0.5, z); 

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
         color: 0x00ffff,
         emissive: 0x00ffff,       // The actual glowing neon color (Cyan)
         emissiveIntensity: 2.0,   // Crank this up! (Try 2 to 5) 
         wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    const div = document.createElement('div');
    div.className = 'experience-label'; 

    const fullText = `> Project: ${title}\n> Description: ${description}`;

    div.innerHTML = `
        <div class="terminal-header">root@system:~/projects$ ./view.sh</div>
        <div class="terminal-body"></div><span class="cursor-blink">_</span>
        <button class="github-btn" onclick="window.open('${link}', '_blank')" hidden>View on GitHub</button>
    `;

    if (playable != "") {
        div.innerHTML += `
            <button class="play-btn" onclick="window.open('${playable}', '_blank')" hidden>Play</button>
        `;
    }

    //<button>View on GitHub</button>
    const label = new CSS2DObject(div);
    label.position.set(0, 1.5, 0); 
    group.add(label);

    scene.add(group);
    interactiveProjects.push({ 
        group, 
        htmlElement: div,
        textBody: div.querySelector('.terminal-body'),
        fullText: fullText,
        button: div.querySelector('.github-btn'),
        button2: div.querySelector('.play-btn'),
        wasActive: false,
        typeTimer: null
    });
}

export function createHobbyNode(scene, title, description, x, z, images = [], customModel = null) {
    // TODO
    const group = new THREE.Group();
    group.position.set(x, 0.5, z); 

    let geometry = new THREE.IcosahedronGeometry(1, 0);
    let material = new THREE.MeshStandardMaterial({ color: 0x00ffff, 
                 emissive: 0x00ffff,       // The actual glowing neon color (Cyan)
         emissiveIntensity: 2.0,   // Crank this up! (Try 2 to 5)  
        wireframe: true });

    if (customModel != null) {
        console.log('Using custom model');
        geometry = customModel;
        material = new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true });
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    const div = document.createElement('div');
    div.className = 'experience-label'; 

    // 1. Build the image carousel HTML if images are provided
    let imagesHtml = '';
    if (images.length > 0) {
        // Generate image tags. Duplicating the list once creates a seamless infinite scroll effect.
        const imgTags = images.map(src => `<img src="${src}" style="height: 80px; object-fit: cover; border-radius: 4px;" />`).join('');
        imagesHtml = `
            <div class="image-carousel" style="overflow: hidden; width: 100%; margin-top: 10px;">
                <div class="image-track" style="display: flex; gap: 10px; width: max-content;">
                    ${imgTags}
                    ${imgTags} 
                </div>
            </div>
        `;
    }

    div.innerHTML = `
        <div class="terminal-header">root@system:~/hobbies$ ./view.sh</div>
        <div class="terminal-body"></div><span class="cursor-blink">_</span>
        ${imagesHtml}
    `;

    // 2. Start the scrolling animation if the track exists
    const imageTrack = div.querySelector('.image-track');
    if (imageTrack) {
        imageTrack.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(calc(-50% - 5px))' } // Shifts exactly one set of images (accounting for the 10px gap)
        ], {
            duration: images.length * 2000, // Adjust speed based on how many images there are
            iterations: Infinity,
            easing: 'linear'
        });
    }

    const fullText = `> Hobby: ${title}\n> Description: ${description}`;

    //<button>View on GitHub</button>
    const label = new CSS2DObject(div);
    label.position.set(0, 1.5, 0); 
    group.add(label);

    scene.add(group);
    
    // 3. Added the image track and images array to the pushed object
    interactiveHobbies.push({ 
        group, 
        htmlElement: div,
        textBody: div.querySelector('.terminal-body'),
        imageTrack: imageTrack, 
        images: images,         
        fullText: fullText,
        wasActive: false,
        typeTimer: null
    });
}

export function createResumeNode(scene, resumeUrl, description, x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0.5, z); 

    // A unique shape for the Resume node
    const geometry = new THREE.DodecahedronGeometry(0.8);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00,
                 emissive: 0x00ffff,       // The actual glowing neon color (Cyan)
         emissiveIntensity: 2.0,   // Crank this up! (Try 2 to 5) 
        wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    const div = document.createElement('div');
    div.className = 'experience-label resume-node'; 

    const fullText = `> Executing: cat resume.pdf\n> Status: Decrypting...\n> Info: ${description}`;

    div.innerHTML = `
        <div class="terminal-header">root@system:~/resume$ ./view_resume.sh</div>
        <div class="terminal-body"></div><span class="cursor-blink">_</span>
        
        <div class="resume-viewer" hidden>
            <iframe src="${resumeUrl}#toolbar=0&navpanes=0" class="hacker-iframe"></iframe>
            <div class="resume-controls">
                <button class="github-btn expand-btn">Expand</button>
                <button class="github-btn popout-btn">New Tab</button>
            </div>
        </div>
    `;

    const label = new CSS2DObject(div);
    label.position.set(0, 1.5, 0); 
    group.add(label);
    scene.add(group);

    // --- Button Logic ---
    const expandBtn = div.querySelector('.expand-btn');
    const popoutBtn = div.querySelector('.popout-btn');

    // Popout opens the PDF in a new browser tab
    popoutBtn.addEventListener('click', () => window.open(resumeUrl, '_blank'));

    // Expand toggles a CSS class to make the CSS2DObject bigger
    expandBtn.addEventListener('click', () => {
        div.classList.toggle('expanded');
        expandBtn.textContent = div.classList.contains('expanded') ? 'Collapse' : 'Expand';
    });

    interactiveResumes.push({ 
        group, 
        htmlElement: div,
        textBody: div.querySelector('.terminal-body'),
        fullText: fullText,
        // We pass the whole viewer container as "button" so your existing proximity check unhides it!
        button: div.querySelector('.resume-viewer'), 
        wasActive: false,
        typeTimer: null
    });
}

// --- TYPING ANIMATION ENGINE ---
export function startTyping(expData) {
    return new Promise((resolve) => {
        expData.textBody.innerHTML = '';
        let i = 0;
        const text = expData.fullText;

        function typeChar() {
            
            if (i < text.length) {
                if (text.charAt(i) === '\n') {
                    expData.textBody.innerHTML += '<br/>';
                } else {
                    expData.textBody.innerHTML += text.charAt(i);
                }
                i++;
                // Speed is randomized slightly to feel like human typing
                const speed = Math.random() * 30 + 10; 
                expData.typeTimer = setTimeout(typeChar, speed);
            } else {
                resolve();
            }
        }
        typeChar();
    });

}

export function stopTyping(expData) {
    clearTimeout(expData.typeTimer);
    expData.textBody.innerHTML = ''; // Clear text when walking away
}

// --- PROXIMITY CHECK (Call this in your animation loop) ---
export function checkExperienceProximity(player) {
    interactiveExperiences.forEach(exp => {
        checkProximity(player, exp);
    });
    interactiveProjects.forEach(project => {
        checkProximity(player, project);
    });
    interactiveHobbies.forEach(hobby => {
        checkProximity(player, hobby);
    });
    interactiveResumes.forEach(resume => checkProximity(player, resume));
}

async function checkProximity(player, object) {
        const distance = player.position.distanceTo(object.group.position);
        if (distance < activationDistance) {
            // Fast, chaotic spin when active
            object.group.children[0].rotation.y += 0.05; 
            object.group.children[0].rotation.x += 0.02;

            // Trigger typing only ONCE when entering radius
            if (!object.wasActive) {
                object.wasActive = true;
                object.htmlElement.classList.add('visible');
                await startTyping(object);

                if (object.button) {
                    object.button.hidden = false;
                }

                if(object.button2){
                    object.button2.hidden = false;
                }
                //object.button.hidden = false;
            }
        } else {
            // Slow idle spin
            object.group.children[0].rotation.y += 0.01;

            // Stop typing and clear when exiting radius
            if (object.wasActive) {
                object.wasActive = false;
                object.htmlElement.classList.remove('visible');
                stopTyping(object);
                if (object.button) {
                    object.button.hidden = true;
                }

                if(object.button2){
                    object.button2.hidden = true;
                }
            }
        }

}
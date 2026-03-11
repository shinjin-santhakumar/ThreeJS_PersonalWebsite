import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export const interactiveContacts = [];
const activationDistance = 3.5;

export function createContactNode(scene, x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0.5, z); 

    // Use a complex Torus Knot for the communication node
    const mesh = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.5, 0.15, 64, 8),
        new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: true })
    );
    group.add(mesh);

    const div = document.createElement('div');
    // We reuse the 'experience-label' class to get the glowing green box for free
    div.className = 'experience-label contact-label'; 
    div.style.width = '350px'; 
    
    // HTML structure with CRT Wrapper and two distinct views (Form vs. Success)
    div.innerHTML = `
        <div class="crt-screen">
            <div class="form-view">
                <div class="terminal-header">root@system:~/contact$ ./establish_uplink.sh</div>
                <form class="hacker-form" id="contact-form">
                    <div class="form-group">
                        <label class="type-target"></label>
                        <input type="text" class="hacker-input" required>
                    </div>
                    <div class="form-group">
                        <label class="type-target"></label>
                        <input type="email" class="hacker-input" required>
                    </div>
                    <div class="form-group">
                        <label class="type-target"></label>
                        <textarea class="hacker-input" rows="3" required></textarea>
                    </div>
                    <button type="submit" class="hacker-btn">[ SEND_PAYLOAD ]</button>
                </form>
            </div>
            
            <div class="success-view" style="display: none; text-align: center; color: #00ff00; padding: 20px 0;">
                <pre style="font-family: monospace; line-height: 1.2; margin-bottom: 15px;">
  .=================.
  | :::       :::   |
  |  >--[ OK ]--<   |
  | :::       :::   |
  '================='
                </pre>
                <div class="terminal-header">> PACKET_DELIVERED_</div>
            </div>
        </div>
    `;
    
    const label = new CSS2DObject(div);
    label.position.set(0, 1.8, 0); 
    group.add(label);
    scene.add(group);

    // Cache DOM elements
    const form = div.querySelector('#contact-form');
    const crtScreen = div.querySelector('.crt-screen');
    const formView = div.querySelector('.form-view');
    const successView = div.querySelector('.success-view');

    // Handle Form Submission with CRT Animation
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Trigger CRT shut off
        crtScreen.classList.add('crt-off');

        // Swap views midway through the animation (when screen is shrunk)
        setTimeout(() => {
            formView.style.display = 'none';
            successView.style.display = 'block';
            
            // Turn CRT back on to reveal success icon
            crtScreen.classList.remove('crt-off');
            crtScreen.classList.add('crt-on');
        }, 500); // 500ms should match half of the CSS animation duration
    });

    interactiveContacts.push({ 
        group, 
        htmlElement: div,
        crtScreen,
        formView,
        successView,
        labels: div.querySelectorAll('.type-target'),
        inputs: div.querySelectorAll('.hacker-input'),
        btn: div.querySelector('.hacker-btn'),
        wasActive: false,
        typeTimer: null
    });
}

// --- SEQUENTIAL TYPING ANIMATION ---
export function startContactTyping(contactData) {
    // 1. Reset everything to invisible/empty before starting
    contactData.labels.forEach(l => l.innerHTML = '');
    contactData.inputs.forEach(i => { 
        i.style.opacity = '0'; 
        i.style.pointerEvents = 'none'; 
        i.value = ''; // clear previous inputs
    });
    contactData.btn.style.opacity = '0';
    contactData.btn.style.pointerEvents = 'none';

    // Ensure we are showing the form, not the success view (if they walked away and came back)
    contactData.formView.style.display = 'block';
    contactData.successView.style.display = 'none';
    contactData.crtScreen.classList.remove('crt-on', 'crt-off');

    const texts = ["> TARGET_NAME: ", "> TARGET_EMAIL: ", "> PAYLOAD_BODY: "];
    let step = 0;
    let charIndex = 0;

    function typeNext() {
        if (step >= texts.length) {
            contactData.btn.style.opacity = '1';
            contactData.btn.style.pointerEvents = 'auto';
            return;
        }

        const currentText = texts[step];
        if (charIndex < currentText.length) {
            contactData.labels[step].innerHTML += currentText.charAt(charIndex);
            charIndex++;
            contactData.typeTimer = setTimeout(typeNext, Math.random() * 30 + 10);
        } else {
            contactData.inputs[step].style.opacity = '1'; 
            contactData.inputs[step].style.pointerEvents = 'auto';
            
            step++;
            charIndex = 0;
            contactData.typeTimer = setTimeout(typeNext, 200); 
        }
    }
    typeNext();
}

export function stopContactTyping(contactData) {
    clearTimeout(contactData.typeTimer);
}

// --- PROXIMITY CHECK ---
export function checkContactProximity(player) {
    interactiveContacts.forEach(contact => {
        const distance = player.position.distanceTo(contact.group.position);
        
        if (distance < activationDistance) {
            contact.group.children[0].rotation.y += 0.05; 
            contact.group.children[0].rotation.z += 0.02;

            if (!contact.wasActive) {
                contact.wasActive = true;
                contact.htmlElement.classList.add('visible');
                startContactTyping(contact);
            }
        } else {
            contact.group.children[0].rotation.y += 0.01;

            if (contact.wasActive) {
                contact.wasActive = false;
                contact.htmlElement.classList.remove('visible');
                stopContactTyping(contact);
            }
        }
    });
}
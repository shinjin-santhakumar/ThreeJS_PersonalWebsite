import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export function SkyText(scene, textContent = "// SHINJIN'S PORTFOLIO", x = 0, y = 5, z = -60) {
    // 1. Create the HTML element
    const textDiv = document.createElement('div');
    textDiv.className = 'sky-text-label';
    textDiv.textContent = textContent;

    // 2. Apply inline styles (or move these to your style.css!)
    textDiv.style.color = '#ff00ff'; // Neon pink to match your aesthetic
    textDiv.style.fontFamily = '"Courier New", Courier, monospace';
    textDiv.style.fontSize = '4rem'; // Make it massive
    textDiv.style.fontWeight = 'bold';
    
    // The neon glow effect
    textDiv.style.textShadow = '0 0 10px #ff00ff, 0 0 20px #ff00ff'; 
    
    // CRITICAL for responsiveness: This forces the div to size itself exactly to the text
    textDiv.style.whiteSpace = 'nowrap'; 
    
    // Prevents the invisible div box from blocking mouse clicks on your actual 3D objects
    textDiv.style.pointerEvents = 'none'; 

    // 3. Convert HTML to a 3D-tracked object
    const skyLabel = new CSS2DObject(textDiv);

    // 4. Position it high in the sky and pushed back
    // (Adjust Y to make it higher/lower, adjust Z to push it further back)
    skyLabel.position.set(x, y, z); 

    // 5. Add to scene
    scene.add(skyLabel);

    // Return it in case we want to animate it later
    return skyLabel;
}
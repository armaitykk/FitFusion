// Define global variables
let discoBall;
let sparkles;
let partyModeActive = false;

// Function to toggle the visibility of the disco ball and sparkles
function togglePartyMode() {
    // Toggle partyModeActive flag
    partyModeActive = !partyModeActive;

    // Toggle 'party-mode' class on the container
    document.querySelector('.container').classList.toggle('party-mode', partyModeActive);

    if (partyModeActive) {
        // Show disco ball
        discoBall.visible = true;
        // Show sparkles
        sparkles.visible = true;
        // Start changing background color
        startBackgroundColorChange();
    } else {
        // Hide disco ball
        discoBall.visible = false;
        // Hide sparkles
        sparkles.visible = false;
        // Stop changing background color
        stopBackgroundColorChange();
    }
}



// Function to start changing background color
function startBackgroundColorChange() {
    const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#8a2be2']; // List of colors in the gradient
    let currentIndex = 0; // Current index of color
    let nextIndex = 1; // Next index of color

    // Function to change background color gradually
    function changeColor() {
        const currentColor = colors[currentIndex];
        const nextColor = colors[nextIndex];

        document.body.style.animation = 'colorChange 5s forwards'; 

        // Define the keyframes for the animation
        const keyframes = `
            @keyframes colorChange {
                0% { background: linear-gradient(to bottom, ${currentColor}, ${nextColor}); }
                100% { background: linear-gradient(to bottom, ${nextColor}, ${currentColor}); }
            }
        `;

        // Create a style element and append the keyframes to it
        const style = document.createElement('style');
        style.innerHTML = keyframes;

        // Append the style element to the document head
        document.head.appendChild(style);

        currentIndex = nextIndex;
        nextIndex = (nextIndex + 1) % colors.length;
    }

    // Call changeColor every 5 seconds
    backgroundInterval = setInterval(changeColor, 5000);
}



// Function to stop changing background color
function stopBackgroundColorChange() {
    clearInterval(backgroundInterval);
}

// Function to create the disco ball and set up the scene
function createDiscoBall() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true }); // Set alpha to true for transparency
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Set clear color to transparent
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(5, 32, 32);

    // Texture for ball from image
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('disco_ball/discoTexture.png');
    const material = new THREE.MeshBasicMaterial({ map: texture, opacity: 1 }); // Set opacity to 1 for full visibility
    discoBall = new THREE.Mesh(geometry, material);
    scene.add(discoBall);
    discoBall.visible = false; // Initially hide the disco ball

    const particleGeometry = new THREE.BufferGeometry();

    // Pastel colors for particle system for
    const pastelColors = [
        0xdbcdf0, // Purple
        0xffd700, // Yellow
        0xc6def1, // Blue
        0xf7d9c4, // Orange
        0xc9e4de, // Green
    ];

    function generateSparkles() {
        const sparkleCount = 30;
        const positions = [];
        const colors = [];

        for (let i = 0; i < sparkleCount; i++) {
            positions.push(
                Math.random() * 10 - 5,
                Math.random() * 10 - 5,
                Math.random() * 10 - 5
            );

            // Random color selection
            const color = pastelColors[Math.floor(Math.random() * pastelColors.length)];
            colors.push(new THREE.Color(color));
        }

        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors.flatMap(color => color.toArray()), 3));
    }

    generateSparkles();

    const particleMaterial = new THREE.PointsMaterial({ vertexColors: true });

    // Particle system creation
    sparkles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(sparkles);
    sparkles.visible = false; // Initially hide the sparkles

    camera.position.set(0, 0, 20);

    // Animation of ball moving and sparkles
    function animate() {
        requestAnimationFrame(animate);
        discoBall.rotation.y += 0.01;
        if (Math.random() > 0.98) {
            generateSparkles();
            sparkles.geometry.attributes.position.needsUpdate = true; // Update for particle position
        }

        renderer.render(scene, camera);
    }
    animate();
}

// Call the function to create the disco ball and set up the scene
createDiscoBall();

// Function to trigger download of the meme
function downloadMeme() {
    const dataURL = document.getElementById('previewImage').src;
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'meme.png';
    link.click();
}

// Function to generate meme
function generateMeme() {
    const imageInput = document.getElementById('imageInput');
    const topText = document.getElementById('topText').value;
    const bottomText = document.getElementById('bottomText').value;
    const memePreview = document.getElementById('memePreview');
    const previewImage = document.getElementById('previewImage');

    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();

        reader.onload = function(e) {
            memePreview.style.display = 'block'; // Show the meme preview area
            previewImage.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const maxWidth = 500; // Maximum width for the meme

                // Calculate scaled height based on maxWidth
                const scaleFactor = maxWidth / previewImage.width;
                canvas.width = maxWidth;
                canvas.height = previewImage.height * scaleFactor;

                ctx.drawImage(previewImage, 0, 0, canvas.width, canvas.height);

                ctx.font = '36px Impact';
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.textAlign = 'center';

                // Render top text
                ctx.fillText(topText, canvas.width / 2, 40);
                ctx.strokeText(topText, canvas.width / 2, 40);

                // Render bottom text
                ctx.fillText(bottomText, canvas.width / 2, canvas.height - 20);
                ctx.strokeText(bottomText, canvas.width / 2, canvas.height - 20);

                // Set the src attribute of the preview image to the canvas data URL
                previewImage.src = canvas.toDataURL('image/png');

                // Show the preview image by setting its display property to 'block'
                previewImage.style.display = 'block';

                // Enable the download button
                document.getElementById('downloadButton').disabled = false;
                document.getElementById('downloadButton').setAttribute('href', canvas.toDataURL('image/png'));
                document.getElementById('downloadButton').setAttribute('download', 'meme.png');
            };

            // Set the src attribute of the preview image to the uploaded image
            previewImage.src = e.target.result;
        };

        // Read the uploaded image file as data URL
        reader.readAsDataURL(imageInput.files[0]);
    }
}

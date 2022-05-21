// I don't have to visualize an L system. I just need co-ordinates where I could populate particles on

const simplex = new SimplexNoise();
var params = {
    size: 24,
    noiseScale: 0.08,
    noiseSpeed: 0.005,
    noiseStrength: 0.04,
    noiseFreeze: false,
    particleCount: 8000,
    particleSize: 0.32,
    particleSpeed: 0.1,
    particleDrag: 0.9,
    particleColor: 0x41a5ff, //0x41a5ff, 0xff6728
    bgColor: 0x000000,
    particleBlending: THREE.AdditiveBlending
};

var gui = new lil.GUI;
var f1 = gui.addFolder('Flow Field');
var f2 = gui.addFolder('Particles');
var f3 = gui.addFolder('Graphics');

f1.add(params, 'size', 1, 100).onFinishChange(particlesInit);
f1.add(params, 'noiseScale', 0, 0.5);
f1.add(params, 'noiseSpeed', 0, 0.05);
f1.add(params, 'noiseStrength', 0, 0.5);
f1.add(params, 'noiseFreeze');

f2.add(params, 'particleCount', 0, 20000).onFinishChange(particlesInit);
f2.add(params, 'particleSize', 0, 1);
f2.add(params, 'particleSpeed', 0, 0.2);
// f2.add(params, 'particleDrag', 0.8, 1.00);
f2.addColor(params, 'particleColor');

f3.addColor(params, 'bgColor');
f3.add(params, 'particleBlending', {
    Additive: THREE.AdditiveBlending,
    Subtractive: THREE.SubtractiveBlending,
    Normal: THREE.NormalBlending
});


////////////////////////////////////////////////////////////////////////////////
// Set up renderer
////////////////////////////////////////////////////////////////////////////////
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, .1, 2000);
camera.lookAt(0, 0, 0);
camera.position.set(params.size * 2, params.size / 2, params.size * 3);

var renderer = new THREE.WebGLRenderer({ antiAlias: true });
document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

function resize() {


    let resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    let dpr = window.devicePixelRatio > 1 ? 2 : 1;

    camera.aspect = resolution.x / resolution.y;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(dpr);
    renderer.setSize(resolution.x, resolution.y);
}
resize();
window.addEventListener('resize', resize, false);


////////////////////////////////////////////////////////////////////////////////
// Particles
////////////////////////////////////////////////////////////////////////////////
var particles = [];

var pointGeometry = new THREE.Geometry();
pointGeometry.vertices.push(new THREE.Vector3(0, 0, 0));

// var material = new THREE.PointsMaterial({
//     color: params.particleColor,
//     size: params.particleSize,
//     sizeAttenuation: true,
//     transparent: true,
//     opacity: 0.35,
//     blending: THREE.AdditiveBlending,
// });

var material = new THREE.PointsMaterial({
    size: 4,
    map: createCircleTexture('#ffffff', 256),
    transparent: true,
    depthWrite: false,
    opacity: 0.35
});

function particlesInit() {
    particles = [];
    scene.remove.apply(scene, scene.children);
    for (var i = 0; i < params.particleCount; i++) {
        var p = new Particle(
            Math.floor(Math.random() * params.size),
            Math.floor(Math.random() * params.size),
            Math.floor(Math.random() * params.size)
        );
        p.init();
        particles.push(p);
    }
}


////////////////////////////////////////////////////////////////////////////////
// Rendering loop
////////////////////////////////////////////////////////////////////////////////
var frameCount = 0;
var gridIndex = 0;
var noise = 0;
var noiseOffset = Math.random() * 100;
var numParticlesOffset = 0;
var p = null

function createCircleTexture(color, size) {
    var matCanvas = document.createElement('canvas');
    matCanvas.width = matCanvas.height = size;
    var matContext = matCanvas.getContext('2d');
    // create texture object from canvas.
    var texture = new THREE.Texture(matCanvas);
    // Draw a circle
    var center = size / 2;
    matContext.beginPath();
    matContext.arc(center, center, size / 2, 0, 2 * Math.PI, false);
    matContext.closePath();
    matContext.fillStyle = color;
    matContext.fill();
    // need to set needsUpdate
    texture.needsUpdate = true;
    // return a texture made from the canvas
    return texture;
}


function render() {

    stats.begin();
    // Update particles based on their coords
    for (var i = 0; i < particles.length; i++) {
        p = particles[i];
        noise = simplex.noise3D(
            p.pos.x * params.noiseScale,
            p.pos.y * params.noiseScale,
            p.pos.z * params.noiseScale + noiseOffset + frameCount * params.noiseSpeed
        ) * Math.PI * 2;

        p.angle.set(noise, noise, noise);
        p.update();
    }

    // Update params
    renderer.setClearColor(params.bgColor);
    material.color.setHex(params.particleColor);
    material.size = params.particleSize;
    material.blending = parseInt(params.particleBlending);
    if (!params.noiseFreeze) frameCount++;

    renderer.render(scene, camera);
    stats.end();
    requestAnimationFrame(render);
}
//particlesInit();
//render();
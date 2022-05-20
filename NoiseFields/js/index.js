// I don't have to visualize an L system. I just need co-ordinates where I could populate particles on

const simplex = new SimplexNoise();
var params = {
    size: 24,
    noiseScale: 0.1,
    noiseSpeed: 0.005,
    noiseStrength: 0.1,
    noiseFreeze: false,
    particleCount: 5000,
    particleSize: 0.22,
    particleSpeed: 0.1,
    particleDrag: 0.9,
    particleColor: 0x41a5ff, //0x41a5ff, 0xff6728
    bgColor: 0x000000,
    particleBlending: THREE.AdditiveBlending
};

//   var gui = new dat.GUI();
//   var f1 = gui.addFolder('Flow Field');
//   var f2 = gui.addFolder('Particles');
//   var f3 = gui.addFolder('Graphics');

//   f1.add(params, 'size', 1, 100);
//   f1.add(params, 'noiseScale', 0, 0.5);
//   f1.add(params, 'noiseSpeed', 0, 0.05);
//   f1.add(params, 'noiseStrength', 0, 0.5);
//   f1.add(params, 'noiseFreeze');

//   f2.add(params, 'particleCount', 0, 40000);
//   f2.add(params, 'particleSize', 0, 1);
//   f2.add(params, 'particleSpeed', 0, 0.2);
//   // f2.add(params, 'particleDrag', 0.8, 1.00);
//   f2.addColor(params, 'particleColor');

//   f3.addColor(params, 'bgColor');
//   f3.add(params, 'particleBlending', {    
//     Additive: THREE.AdditiveBlending,
//     Subtractive: THREE.SubtractiveBlending,
//     Normal: THREE.NormalBlending
//   });


////////////////////////////////////////////////////////////////////////////////
// Set up renderer
////////////////////////////////////////////////////////////////////////////////
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, .1, 2000);
camera.lookAt(0, 0, 0);
camera.position.set(params.size * 2, params.size / 2, params.size * 3);

var renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

function resize() {
    // w = document.body.clientWidth;
    // h = document.body.clientHeight;
    // camera.aspect = w / h;
    // camera.updateProjectionMatrix();
    // renderer.setSize(w, h);


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

var material = new THREE.PointsMaterial({
    color: params.particleColor,
    size: params.particleSize,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
});






////////////////////////////////////////////////////////////////////////////////
// Rendering loop
////////////////////////////////////////////////////////////////////////////////
var frameCount = 0;
var gridIndex = 0;
var noise = 0;
var noiseOffset = Math.random() * 100;
var numParticlesOffset = 0;
var p = null

function render() {
    requestAnimationFrame(render);
    stats.begin();

    // Update particle count
    numParticlesOffset = parseInt(params.particleCount - particles.length);
    if (numParticlesOffset > 0) {
        for (var i = 0; i < numParticlesOffset; i++) {
            var p = new Particle(
                Math.random() * params.size,
                Math.random() * params.size,
                Math.random() * params.size
            );
            p.init();
            particles.push(p);
        }
    } else {
        for (var i = 0; i < -numParticlesOffset; i++) {
            scene.remove(particles[i].mesh);
            particles[i] = null;
            particles.splice(i, 1);
        }
    }

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
}
render();
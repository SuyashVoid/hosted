import { EffectComposer } from 'https://unpkg.com/three@0.126.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.126.0/examples/jsm/postprocessing/RenderPass.js';
import { AfterimagePass } from 'https://unpkg.com/three@0.126.0/examples/jsm/postprocessing/AfterimagePass.js';
// Coolor constants (can be integrated)
var gui;
// Scene global variables
const fpsLimit = 60;
let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / 60;
var scene;
var camera;
var renderer;
// Materials
let composer;
let afterimagePass;
// Stats
var stats = new Stats();
// Particles, Noise and plant displayed
var particles = [];
const simplex = new SimplexNoise();
// Render Constants
var frameCount = 0;
var noise = 0;
var noiseOffset = Math.random() * 3;

function setupGUI() {

    gui = new lil.GUI;
    var f1 = gui.addFolder('Flow Field');
    var f2 = gui.addFolder('Particles');
    var f3 = gui.addFolder('Colors');
    var f3A = f3.addFolder('Particles');

    f1.add(params, 'size', 1, 25).onFinishChange(resetSystem);
    f1.add(params, 'noiseScale', 0, 0.1);
    f1.add(params, 'noiseSpeed', 0, 0.025);
    f1.add(params, 'noiseStrength', 0, 4);
    //f1.add(params, 'noiseFreeze');
    //f2.add(params, 'particleCount', 0, 15000).onFinishChange(resetSystem);
    f2.add(params, 'particleSize', 0, 1);
    f2.add(params, 'lifeLimit', 30, 400);
    f2.add(params, 'particleSpeed', 0, 0.2);
    f2.add(params, 'trailLen', 0.8, 1).onFinishChange(trailLenReflector);
    f3A.addColor(params, 'particleColor');
    f3A.add(params, 'opacity', 0, 1);
    f3A.addColor(params, 'particleColor2');
    f3A.add(params, 'opacity2', 0, 1);
    f3A.addColor(params, 'particleColor3');
    f3A.add(params, 'opacity3', 0, 1);

    var f3B = f3.addFolder('Background');
    f3B.addColor(params, 'bgGradient1');
    f3B.addColor(params, 'bgGradient2');
    f3B.add(params, 'bgAngle', 0, 360, 1)

    f1.close()
        // f2.close()
        // f3.close()
    gui.close()
}

function trailLenReflector() {
    params.tempTrailLen = params.trailLen
}


function setupRenderer() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, .1, 2000);
    camera.lookAt(0, 0, 0);
    // camera.position.set(145, 130, 135);
    camera.position.set(30, 50, 135);
    camera.rotation.set(-0.08, 0.015, 0.05);

    //renderer = new THREE.WebGLRenderer({ antiAlias: true, alpha: true, preserveDrawingBuffer: true });
    renderer = new THREE.WebGLRenderer({ antiAlias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    //renderer.autoClearColor = false;
    document.body.appendChild(renderer.domElement);

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    afterimagePass = new AfterimagePass();
    afterimagePass.uniforms['damp'].value = params.trailLen;
    composer.addPass(afterimagePass);

    stats.showPanel(0);
    document.body.appendChild(stats.dom);
}

function updateBG() {
    document.body.style.backgroundImage = "linear-gradient(" + params.bgAngle + "deg, " + params.bgGradient1 + ", " + params.bgGradient2 + ")";
}

function setupScene() {
    const light = new THREE.PointLight(0xffffff, 1, 0);
    light.position.set(50, 150, 0);

    let octaGeo = new THREE.PlaneGeometry(1000, 100);
    let octaMat = new THREE.MeshPhongMaterial({
        color: 0x5b86e5,
        side: THREE.DoubleSide,
        opacity: 0.5,

    });
    let octa = new THREE.Mesh(octaGeo, octaMat)
    octa.position.set(0, 0, -50)
    octa.rotateX(Math.PI / 2)
    scene.add(light);
    //scene.add(octa);
}

function resize() {
    let resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    let dpr = window.devicePixelRatio > 1 ? 2 : 1;


    renderer.setPixelRatio(dpr);
    renderer.setSize(resolution.x, resolution.y);
    composer.setSize(resolution.x, resolution.y)

    camera.aspect = resolution.x / resolution.y;
    camera.updateProjectionMatrix();
}

function resetSystem() {
    particles = [];
    Wrule = GetAxiomTree();
    pointGeometry = new THREE.Geometry()
    pointGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    scene.remove.apply(scene, scene.children);
    frameCount = 0;
    particlesInit(12, 0, 0, 180, 0.13, true)
    particlesInit(10, 0, 0, 180, 0.13, false)
        // particlesInit(35, 0, 0, 180, 0.38, true)
    particlesInit(-10, 0, 0, 180, 0.13, true)
    particlesInit(-12, 0, 0, 180, 0.13, false)

    // particlesInit(-40, 0, 0, 180, 0.17, false)
    // particlesInit(-42, 0, 0, 180, 0.17, true)

    // particlesInit(42, 0, 0, 180, 0.17, true)
    // particlesInit(40, 0, 0, 180, 0.17, false)
    // particlesInit(-35, 0, 0, 180, 0.38, false)

    controls.setCustomState(new THREE.Vector3(1.13, 10.21, -3.65), new THREE.Vector3(1.5, 12.2, 24.7), 1)


}


function particlesInit(x, y, z, len, packDist, isRight) {
    let dataPoints = giveMeField(x, y, z, len, packDist, isRight)
        //let dataPoints = giveMeField(x, y, z, 30, 0.1)
    for (let i = 0; i < dataPoints.length; i++) {
        var p = new Particle(
            particles.length,
            Math.floor(dataPoints[i].x),
            Math.floor(dataPoints[i].y),
            Math.floor(dataPoints[i].z),
            isRight
        );
        p.init(scene);
        particles.push(p);
        if (i == dataPoints.length) fitCameraToObject(camera, p.mesh, 2, controls)
    }

}


function giveMeField(x, y, z, len, packDist, isRight) {
    const fieldWidth = 4;
    const xDelta = 0
    let toReturn = []
    const particleCount = len / packDist;
    for (let i = 0; i < particleCount; i++) {
        const xRandom = Math.random() * fieldWidth - (fieldWidth / 2)
        let xOffset = 0
        if (i > particleCount * 0.3) {
            xOffset = i * boolToDirection(isRight) * -1 * xDelta / 40;
        }
        let zOffset = -1 * Math.pow(i, 0.91) * packDist;
        toReturn.push(new THREE.Vector3(x + xOffset + xRandom, y, z + zOffset))
    }
    return toReturn;
}


function render() {
    controls.update()


    stats.begin();

    // Update particles only with 60fps in mind
    delta += clock.getDelta();
    if (delta > interval) {

        // Skip the slow start
        if (frameCount < 60) {
            // while (frameCount < 60) {
            //     frameCount++;
            //     updateParticles();
            // }
        }
        trailLengthShortener()
        updateParticles();
        delta = delta % interval;
    }
    updateBG()
    afterimagePass.uniforms['damp'].value = params.trailLen;
    updateMaterial();
    //if (!params.noiseFreeze) frameCount++;
    composer.render();
    stats.end();
    // setTimeout(function() {
    // }, 1000 / 60);
    requestAnimationFrame(render);
}

function trailLengthShortener() {
    let currentState = controls.saveCustomState()
    if (!compareControlStates(currentState, lastState)) {
        params.trailLen = 0.83;
    } else {
        params.trailLen = params.tempTrailLen;
    }
    lastState = currentState
}

function updateParticles() {
    for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        let noised = simplex.noise3D(
            p.pos.x * params.noiseScale,
            p.pos.y * params.noiseScale,
            p.pos.z * params.noiseScale + noiseOffset + frameCount * params.noiseSpeed
        );
        let noise2 = numScale(noised, 0, 1, Math.PI / 6, -Math.PI / 6)
        noise = numScale(Math.sin(p.life / 80), 1, -1, -Math.PI, Math.PI)
        if (i == 1) {
            // console.log(particles[0].pos.x + ", " + particles[0].pos.y)
            // console.log(curveFunction(particles[0].life))
            //console.log("N: " + noise + ", F: " + frameCount)

        }
        //noise = noised * ((Math.PI * 2) - Math.PI);
        p.angle.set(boolToDirection(p.isRight) * (noise2 * 0.9), 0, 0);
        p.update();
    }
}



function updateMaterial() {
    // material.needsUpdate = false
    // mat2.needsUpdate = false
    // mat3.needsUpdate = false
    material.color.setHex(params.particleColor);
    mat2.color.setHex(params.particleColor2);
    mat3.color.setHex(params.particleColor3);
    material.size = params.particleSize;
    mat2.size = params.particleSize;
    mat3.size = params.particleSize;
    material.opacity = params.opacity;
    mat2.opacity = params.opacity2;
    mat3.opacity = params.opacity3;
}

const fitCameraToObject = function(camera, object, offset, controls) {

    offset = offset || 1.25;

    const center = new THREE.Vector3(0, 0, 0);
    const size = new THREE.Vector3(0, 0, 0);

    const boundingBox = new THREE.Box3();

    // get bounding box of object - this will be used to setup controls and camera
    boundingBox.setFromObject(object);

    boundingBox.getCenter(center);

    boundingBox.getSize(size);

    // get the max side of the bounding box (fits to width OR height as needed )
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 4 * Math.tan(fov * 2));

    cameraZ *= offset; // zoom out a little so that objects don't fill the screen

    camera.position.z = cameraZ;

    const minZ = boundingBox.min.z;
    const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;

    camera.far = cameraToFarEdge * 3;
    camera.updateProjectionMatrix();

    if (controls) {
        // set camera to rotate around center of loaded object
        controls.target = center;
        // prevent camera from zooming out far enough to create far plane cutoff
        controls.maxDistance = cameraToFarEdge * 2;
        controls.saveState();
        camera.lookAt(center)

    } else {
        camera.lookAt(center)
    }
}


function setupOrbit() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    lastState = controls.saveCustomState();
    //controls.enableDamping = true;
    // controls.minPan = new THREE.Vector3(30, -35, 7);
    // controls.maxPan = new THREE.Vector3(80, 65, 30)
    // controls.minDistance = 1
    // controls.maxDistance = 107
    // controls.enableRotate = false
    //controls.autoRotate = true;
}


setupGUI()
setupRenderer();
setupMaterials();
setupOrbit();
resize();
window.addEventListener('resize', resize, false);
resetSystem()
setupScene();
let theModule = { camera }
window.myModule = theModule;
render();
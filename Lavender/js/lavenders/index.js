import { EffectComposer } from '../libs/EffectComposer.js';
import { RenderPass } from '../libs/RenderPass.js';
import { AfterimagePass } from '../libs/AfterimagePass.js';
// Coolor constants (can be integrated)
var gui;
// Scene global variables
const fpsLimit = 60;
let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / 60;
let scene;
let camera;
let renderer;
let uniforms;
let shaderMaterial;
let geometry;
let particleSystem;
// Materials
let composer;
let afterimagePass;
// Stats
let stats = new Stats();
// Particles, Noise and plant displayed
let particles = [];
const simplex = new SimplexNoise();
const simplex2 = new SimplexNoise();
const fieldWidth = 4;


// Render Constants
let frameCount = 0;
let noise = 0;
let noiseOffset = Math.random() * 3;

function setupGUI() {

    gui = new lil.GUI;
    var f1 = gui.addFolder('Flow Field');
    var f2 = gui.addFolder('Particles');
    var f2A = f2.addFolder('Stray Particles');
    var f3 = gui.addFolder('Colors');
    var f3A = f3.addFolder('Particles');
    var f4 = gui.addFolder('Field Particles')
    var f5 = gui.addFolder('Field')
    gui.add(params, 'shouldResetCam')


    f1.add(params, 'noiseScale', 0, 0.2);
    //f1.add(params, 'noiseSpeed', 0, 0.025);
    f1.add(params, 'noiseStrength', 0, 3);
    //f2.add(params, 'lifeLimit', 30, 400);
    f2.add(params, 'tempTrailLen', 0.8, 1);
    f2A.add(params, 'strayParticleSpeed', 0, 0.2);
    f2A.add(params, 'strayNoiseScale', 0, 0.25);
    f2A.add(params, 'strayNoiseSpeed', 0, 3);
    f3A.addColor(params, 'particleColor').onChange(updateColors);
    f3A.addColor(params, 'particleColor2').onChange(updateColors);
    f3A.addColor(params, 'particleColor3').onChange(updateColors);

    var f3B = f3.addFolder('Background');
    f3B.addColor(params, 'bgGradient1');
    f3B.addColor(params, 'bgGradient2');
    f3B.add(params, 'bgAngle', 0, 360, 1)

    f4.add(fieldParams, 'xFactor', 0, 15)
    f4.add(fieldParams, 'yFactor', 0, 5)
    f4.add(fieldParams, 'yRandomness', 0, fieldParams.yFactor).onFinishChange(resetSystem)
    f4.add(fieldParams, 'lifeDivider', 100, 1000)
    f4.add(fieldParams, 'lifeVariancy', 0.1, 0.9).onFinishChange(resetSystem)
    f4.add(fieldParams, 'strayParticles', 0, 0.5).onFinishChange(resetSystem)
    f4.add(fieldParams, 'maxFunctionTravel', 0, Math.PI)
    f4.add(fieldParams, 'sizeRandomness', 0.1, 0.9).onFinishChange(updateSizes)

    f5.add(params, 'particleMultiplier', 0.1, 3.5).onFinishChange(resetSystem);
    f5.add(params, 'sizeMultiplier', 0, 3).onChange(updateSizes);
    f5.add(fieldParams, 'fieldCount', 1, 5, 1).onFinishChange(resetSystem);
    f5.add(fieldParams, 'progressiveDecline').onFinishChange(resetSystem);
    f5.add(fieldParams, 'depth', 50, 500, 1).onFinishChange(resetSystem);
    f5.add(fieldParams, 'distance', 10, 70).onFinishChange(resetSystem);
    f5.add(fieldParams, 'perspectiveDelta', 0, 0.3).onFinishChange(resetSystem)

    //f1.close()
    f2.close()
    f3.close()
    f3B.close()
        //f4.close()
        //gui.close()
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

    uniforms = {

        pointTexture: { value: new THREE.TextureLoader().load('textures/disc.png') }

    };
    shaderMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.3,
        depthTest: false,
        vertexColors: true

    });

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
    const firstTime = particles.length == 0
    particles = [];
    Wrule = GetAxiomTree();
    scene.remove.apply(scene, scene.children);
    frameCount = 0;

    geometry = new THREE.BufferGeometry();

    positions = [];
    colors = [];
    sizes = [];
    // particlesInit(12, 0, 0, 200, 0.08, true, 1, 1.2, false)
    // particlesInit(10, 0, 0, 200, 0.08, false, 1, 1.1, true)
    // particlesInit(-10, 0, 0, 200, 0.08, true, 1, 1, true)
    // particlesInit(-12, 0, 0, 200, 0.08, false, 1, 1, false)

    // particlesInit(-40, 0, 0, 180, 0.14, false, 0.4, 0.7, false)
    // particlesInit(-42, 0, 0, 180, 0.14, true, 0.4, 0.7, false)
    // particlesInit(42, 0, 0, 180, 0.14, true, 0.4, 0.7, false)
    // particlesInit(40, 0, 0, 180, 0.14, false, 0.4, 0.7, false)

    fieldSetter(fieldParams.fieldCount, fieldParams.distance, params.progressiveDecline)
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1).setUsage(THREE.DynamicDrawUsage));
    particleSystem = new THREE.Points(geometry, shaderMaterial);
    scene.add(particleSystem);

    // controls.setCustomState(new THREE.Vector3(1.13, 10.21, -3.65), new THREE.Vector3(1.5, 12.2, 24.7), 1)
    if (params.shouldResetCam || firstTime)
        controls.setCustomState(new THREE.Vector3(0.559, 13.43, -2.0), new THREE.Vector3(-0.19, 2.21, 21.02), 1)
    console.log("COUNT: " + particles.length)

}

function fieldSetter(fieldCount, distance, progressiveDecline) {
    const baseDepth = fieldParams.depth
    const basePack = 0.08
    for (let i = 1; i <= fieldCount; i++) {
        let dist = (i - 1) * (distance - (fieldWidth * 3 * i / 4));
        if (i == 1) dist = distance / 4
        let decline = 1;
        if (progressiveDecline) {
            decline = Math.pow(1 - ((i - 1) / (fieldCount + 1)), 0.91);
            //console.log("Dec: " + decline)
        }

        particlesInit(dist + (fieldWidth / 2), 0, 0, baseDepth, basePack, true, 1 * decline / 2, 1 * decline, true)
        particlesInit(dist, 0, 0, baseDepth, basePack, false, 1 * decline / 2, 1 * decline, true)

        particlesInit(-1 * dist, 0, 0, baseDepth, basePack, true, 1 * decline / 2, 1 * decline, true)
        particlesInit(-1 * dist - (fieldWidth / 2), 0, 0, baseDepth, basePack, false, 1 * decline / 2, 1 * decline, true)

    }
}




function particlesInit(x, y, z, len, packDist, isRight, xMultiplier, yMultiplier, unite) {
    let dataPoints = giveMeField(x, y, z, len, packDist / params.particleMultiplier, isRight, unite)

    for (let i = 0; i < dataPoints.length; i++) {
        var p = new Particle(
            particles.length,
            Math.floor(dataPoints[i].x),
            Math.floor(dataPoints[i].y),
            Math.floor(dataPoints[i].z),
            isRight,
            xMultiplier,
            yMultiplier
        );
        p.init();
        //if (p.shouldRun)
        particles.push(p);
        //if (i == dataPoints.length) fitCameraToObject(camera, p.mesh, 2, controls)
    }

}


function giveMeField(x, y, z, len, packDist, isRight, unite) {
    let toReturn = []
    const particleCount = len / packDist;
    for (let i = 0; i < particleCount; i++) {
        let xOffset = 0
        if (i > particleCount * 0.01 && unite) {
            xOffset = i * boolToDirection(x <= 0) * fieldParams.perspectiveDelta / 40 + (-x / 20);
        }
        const xRandom = Math.random() * (fieldWidth + xOffset) - ((fieldWidth + xOffset) / 2)
        let zOffset = -1 * Math.pow(i, 0.91) * packDist;
        // Reduces the number of particles after 60% distance
        if (i > particleCount * 0.3) {
            if (Math.random() > i / particleCount)
                toReturn.push(new THREE.Vector3(x + xOffset + xRandom, y, z + zOffset))
        } else toReturn.push(new THREE.Vector3(x + xOffset + xRandom, y, z + zOffset))

    }
    return toReturn;
}


function render() {
    controls.update()
    stats.begin();

    // Update particles only with 60fps in mind
    delta += clock.getDelta();
    if (delta > interval) {

        if (frameCount < 60) {
            // while (frameCount < 60) {
            //     frameCount++;
            //     updateParticles();
            // }
        }
        trailLengthShortener()
        updateParticles2();
        delta = delta % interval;
    }
    updateBG()
    afterimagePass.uniforms['damp'].value = params.trailLen;
    composer.render();
    stats.end();
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


function updateParticles2() {
    const pos = geometry.attributes.position.array;
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.shouldRun) {
            let noised = simplex.noise4D(
                p.pos.x * params.strayNoiseScale,
                p.pos.y * params.strayNoiseScale,
                p.pos.z * params.strayNoiseScale,
                noiseOffset + frameCount * params.strayNoiseSpeed
            );
            noise = numScale(noised, 0, 1, Math.PI, -Math.PI)
            p.angle.set(0, noise, 0);
        }

        p.noise = simplex2.noise4D(
            p.pos.x * params.noiseScale,
            p.pos.y * params.noiseScale,
            p.pos.z * params.noiseScale,
            noiseOffset + (frameCount * params.noiseSpeed)
        );

        const posit = p.update()
        pos[i * 3] = posit.x;
        pos[i * 3 + 1] = posit.y;
        pos[i * 3 + 2] = posit.z;
    }
    geometry.attributes.position.needsUpdate = true;
}

function updateSizes() {
    const siz = geometry.attributes.size.array;
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.size = Math.random() * fieldParams.sizeRandomness + (1 - fieldParams.sizeRandomness)
        siz[i] = particles[i].size * params.sizeMultiplier
    }
    geometry.attributes.size.needsUpdate = true;
}

function updateColors() {
    const col = geometry.attributes.color.array;
    let color;
    for (let i = 0; i < particles.length; i++) {
        if (particles[i].colorIndex == 0) color = new THREE.Color(params.particleColor);
        else if (particles[i].colorIndex == 1) color = new THREE.Color(params.particleColor2);
        else color = new THREE.Color(params.particleColor3);
        col[i * 3] = color.r;
        col[i * 3 + 1] = color.g;
        col[i * 3 + 2] = color.b;
    }
    geometry.attributes.color.needsUpdate = true;
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
setupOrbit();
resize();
window.addEventListener('resize', resize, false);
resetSystem()
setupScene();
let theModule = { camera }
window.myModule = theModule;
render();
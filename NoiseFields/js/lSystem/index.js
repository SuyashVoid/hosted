// Coolor constants (can be integrated)
let baseHue = 290;
let hueVariance = 50;
let hueRange = 30;
let lightness = 60;
// Control variables
var gui;
let currentPreset = 0;
// Positon of possible particles
var dataPoints = [];
// Scene global variables
var controls;
let plant;
var scene;
var camera;
var renderer;
// Materials
var material;
var plantMaterial;
var mat2;
var mat3;
// Stats
var stats = new Stats();
// Particles, Noise and plant displayed
var particles = [];
var pointGeometry = new THREE.Geometry();
const simplex = new SimplexNoise();
// Render Constants
var frameCount = 0;
var noise = 0;
var noiseOffset = Math.random() * 3;

var params = {
    size: 20,
    noiseScale: 0.08,
    noiseSpeed: 0.005,
    noiseStrength: 0.04,
    noiseFreeze: false,
    particleCount: 7000,
    particleSize: 0.41,
    particleSpeed: 0.06,
    particleDrag: 0.9,
    particleColor: 0xffffff, //0x41a5ff, 0xff6728
    plantColor: 0x22c335,
    bgColor: 0xa9bcab,
    particleBlending: THREE.AdditiveBlending,
    particleSkip: 1,
    animationDuration: 600,
    Preset: 0,
    renderIterations() {
        particlesInit();
    }
};

function setupGUI() {

    gui = new lil.GUI;
    var f1 = gui.addFolder('Flow Field');
    var f2 = gui.addFolder('Particles');
    var f3 = gui.addFolder('Colors');
    var f4 = gui.addFolder('Draw').onFinishChange(resetSystem);

    f1.add(params, 'size', 1, 100).onFinishChange(resetSystem);
    f1.add(params, 'noiseScale', 0, 0.5);
    f1.add(params, 'noiseSpeed', 0, 0.05);
    f1.add(params, 'noiseStrength', 0, 0.5);
    f1.add(params, 'noiseFreeze');
    f2.add(params, 'particleCount', 0, 15000).onFinishChange(resetSystem);
    f2.add(params, 'particleSize', 0, 1);
    f2.add(params, 'particleSpeed', 0, 0.2);
    f2.add(params, 'particleDrag', 0.8, 1.00);
    f3.addColor(params, 'particleColor');
    f3.addColor(params, 'plantColor');

    //f3.addColor(params, 'bgColor');
    f3.add(params, 'particleBlending', {
        Additive: THREE.AdditiveBlending,
        Subtractive: THREE.SubtractiveBlending,
        Normal: THREE.NormalBlending
    });
    f4.add(paramsLSys, 'theta', -180, 180, 1);
    f4.add(paramsLSys, 'scale', 0, 4, 0.1);
    f4.add(rules, 'axiom');
    for (var key in rules.allRules) {
        f4.add(rules.allRules, key);
    }
    gui.add(paramsLSys, 'iterations', 0, 7, 1);
    gui.add(params, 'renderIterations');

    f1.close()
    f2.close()
    f3.close()
    f4.close()
}

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

function setupRenderer() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, .1, 2000);
    camera.lookAt(0, 0, 0);
    // camera.position.set(145, 130, 135);
    camera.position.set(30, 50, 135);
    camera.rotation.set(-0.08, 0.015, 0.05);

    renderer = new THREE.WebGLRenderer({ antiAlias: true, alpha: true });
    document.body.appendChild(renderer.domElement);

    stats.showPanel(0);
    document.body.appendChild(stats.dom);
}


function resize() {
    let resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    let dpr = window.devicePixelRatio > 1 ? 2 : 1;

    camera.aspect = resolution.x / resolution.y;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(dpr);
    renderer.setSize(resolution.x, resolution.y);
}


function setupMaterials() {
    material = new THREE.PointsMaterial({
        size: 1,
        color: params.particleColor,
        map: createCircleTexture('#ffffff', 256),
        transparent: true,
        depthWrite: false,
        opacity: 0.60,
        blending: THREE.AdditiveBlending
    });

    plantMaterial = new THREE.LineBasicMaterial({
        color: params.particleColor,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
    });

    let plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    let colorVariance = Math.floor(Math.random() * hueVariance) * plusOrMinus;
    const hue = (baseHue + colorVariance) % 360;
    mat2 = new THREE.PointsMaterial({
        size: 1,
        map: createCircleTexture('#ffffff', 256),
        transparent: true,
        color: new THREE.Color(`hsl(${360 + hue + hueRange}, 100%, ${lightness}%)`),
        depthWrite: false,
        opacity: 0.55,
        blending: THREE.AdditiveBlending
    });

    plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    colorVariance = Math.floor(Math.random() * hueVariance) * plusOrMinus;
    const hue2 = (baseHue + 50) % 360;
    mat3 = new THREE.PointsMaterial({
        size: 1,
        map: createCircleTexture('#ffffff', 256),
        transparent: true,
        color: new THREE.Color(`hsl(${360 + hue2 + hueRange}, 100%, ${lightness}%)`),
        depthWrite: false,
        opacity: 0.55,
        blending: THREE.AdditiveBlending
    });
}

function resetSystem() {
    particles = [];
    Wrule = GetAxiomTree();
    pointGeometry = new THREE.Geometry()
    pointGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    frameCount = 0;
    particlesInit()
}

function particlesInit(frame) {
    let zVariance = 20;


    let plantGeo = new THREE.Geometry();
    let results = DrawTheTree(plantGeo, 20, 10, 2, 24, Wrule.length);
    dataPoints = results[0];
    plantGeo = results[1];
    if (dataPoints.length > 5000 && dataPoints.length < 9000) params.particleSkip = 2;
    else if (dataPoints.length >= 9000 && dataPoints.length < 130000) params.particleSkip = 3;
    else if (dataPoints.length >= 13000) params.particleSkip = 6;
    let particlesCreated = 0;
    scene.remove.apply(scene, scene.children);
    for (var i = 0; i < dataPoints.length; i += params.particleSkip) {
        //const zOffset = Math.floor((Math.random() * zVariance) - (zVariance / 2));
        const zOffset = Math.floor((Math.random() * zVariance) - (zVariance / 4));

        var p = new Particle(
            Math.floor(dataPoints[i].x),
            Math.floor(dataPoints[i].y),
            Math.floor(dataPoints[i].z + zOffset)
        );
        p.init();
        particles.push(p);
        particlesCreated++
    }
    const diff = params.particleCount - particlesCreated;
    for (var i = 0; diff > 0 && i < diff; i++) {
        const randIndex = Math.floor(Math.random() * dataPoints.length)
            //const zOffset = Math.floor((Math.random() * zVariance) )
        const zOffset = Math.floor((Math.random() * zVariance) - (zVariance / 4))
        var p = new Particle(
            Math.floor(dataPoints[randIndex].x),
            Math.floor(dataPoints[randIndex].y),
            Math.floor(dataPoints[randIndex].z + zOffset)
        );
        p.init();
        particles.push(p);
    }

    plant = new THREE.LineSegments(plantGeo, plantMaterial);
    scene.add(plant)
    fitCameraToObject(camera, plant, 2.22, controls)
}


function render() {
    controls.update()
    stats.begin();
    // Update particles based on their coords
    for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        noise = simplex.noise3D(
            p.pos.x * params.noiseScale,
            p.pos.y * params.noiseScale,
            p.pos.z * params.noiseScale + noiseOffset + frameCount * params.noiseSpeed
        ) * Math.PI * 2;

        p.angle.set(noise, noise, noise);
        p.update();
    }

    // Update params
    renderer.setClearColor(0x000000, 0);
    material.color.setHex(params.particleColor);
    plantMaterial.color.setHex(params.plantColor)
    material.size = params.particleSize;
    mat2.size = params.particleSize;
    mat3.size = params.particleSize;
    material.blending = parseInt(params.particleBlending);
    if (!params.noiseFreeze) frameCount++;

    renderer.render(scene, camera);
    stats.end();
    requestAnimationFrame(render);
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
    controls.enableDamping = true;
    //controls.enableRotate = false
    //controls.rotate(-50 * Math.PI / 180, -50 * Math.PI / 180)
    //camera.position.set(new THREE.Vector3(90, 20, 55))    
}


setupGUI()
setupRenderer();
setupMaterials()
setupOrbit()
resize();
window.addEventListener('resize', resize, false);
resetSystem()
render();
fitCameraToObject(camera, plant, 2.22, controls)
controls.setCustomState(new THREE.Vector3(92, 85, 9), new THREE.Vector3(90, 11, 28.2), 1)
    // camera.position.x = 40;
    //camera.position.y = -10;
    // camera.position.z = 50;
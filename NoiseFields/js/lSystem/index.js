// Coolor constants (can be integrated)
let baseHue = 90;
let hueVariance = 50;
let hueRange = 30;
let lightness = 70;
// Control variables
var gui;
let currentPreset = 0;
// Positon of possible particles
var dataPoints = [];
// Scene global variables
var controls;
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
    x: 0,
    y: 90,
    z: 0,
    size: 20,
    noiseScale: 0.08,
    noiseSpeed: 0.005,
    noiseStrength: 0.04,
    noiseFreeze: false,
    particleCount: 0,
    particleSize: 0.41,
    particleSpeed: 0.06,
    particleDrag: 0.9,
    particleColor: 0xc831d3, //0x41a5ff, 0xff6728
    plantColor: 0x158e50,
    bgColor: 0xa9bcab,
    particleBlending: THREE.AdditiveBlending,
    particleSkip: 2,
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

    gui.add(params, 'x', -90, 90).onFinishChange(resetSystem)
    gui.add(params, 'y', -90, 90).onFinishChange(resetSystem)
    gui.add(params, 'z', -90, 90).onFinishChange(resetSystem)

    f1.close()
    f2.close()
    f3.close()
    f4.close()
    gui.close()
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
    scene.remove.apply(scene, scene.children);
    frameCount = 0;
    particlesInit(10, 0, 0, 25, 0, 0, 20)
    particlesInit(100, 0, 0, -25, 0, 0, 50)
    particlesInit(118, 8, 0, 25, -40, -90, 30)
    particlesInit(-18, 2, 0, 25, 40, -90, -30)

    //controls.setCustomState(new THREE.Vector3(45, 8, 12), new THREE.Vector3(44, -88, 30), 1)

}

function geoRotate(geoX, geoY, geoZ) {
    plantGeo.rotateX(geoX * Math.PI / 180)
    plantGeo.rotateY(geoY * Math.PI / 180)
    plantGeo.rotateZ(geoZ * Math.PI / 180)
}

function particlesInit(x, y, z, angle, geoX, geoY, geoZ) {
    let plantGeo = new THREE.Geometry();
    plantGeo = DrawTheTree(plantGeo, 0, 0, 0, 24, Wrule.length, angle);

    plantGeo.center()
    plantGeo.rotateX(geoX * Math.PI / 180)
    plantGeo.rotateY(geoY * Math.PI / 180)
    plantGeo.rotateZ(geoZ * Math.PI / 180)
    plantGeo.translate(x, y, z)
    let plant = new THREE.LineSegments(plantGeo, plantMaterial);
    scene.add(plant)
        // if (scene.children.length < 2) fitCameraToObject(camera, plant, 2.25, controls)
    for (var i = 0; i < plant.geometry.vertices.length; i += 2 * params.particleSkip) {

        const worldPt = plant.geometry.vertices[i]
        var p = new Particle(
            Math.floor(worldPt.x),
            Math.floor(worldPt.y),
            Math.floor(worldPt.z)
        );
        p.init();
        particles.push(p);
    }


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
    let incrementer = -0.0001
    controls.rotate(0.00002, 0.00001)
    controls.target = new THREE.Vector3(controls.target.x + incrementer, controls.target.y + 0.04, controls.target.z)
        //controls.maxDistance += incrementer
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
    controls.minPan = new THREE.Vector3(30, -35, 7);
    controls.maxPan = new THREE.Vector3(80, 65, 30)
    controls.minDistance = 1
    controls.maxDistance = 107
        //controls.enableRotate = false
        //controls.autoRotate = true;
}


setupGUI()
setupRenderer();
setupMaterials()
setupOrbit()
resize();
window.addEventListener('resize', resize, false);
resetSystem()
render();
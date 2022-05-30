import { EffectComposer } from 'https://unpkg.com/three@0.126.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.126.0/examples/jsm/postprocessing/RenderPass.js';
import { AfterimagePass } from 'https://unpkg.com/three@0.126.0/examples/jsm/postprocessing/AfterimagePass.js';
// Coolor constants (can be integrated)
var gui;
// Scene global variables
var controls;
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
    afterimagePass.uniforms['damp'].value = 0.88;
    composer.addPass(afterimagePass);

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




function resetSystem() {
    particles = [];
    Wrule = GetAxiomTree();
    pointGeometry = new THREE.Geometry()
    pointGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    scene.remove.apply(scene, scene.children);
    frameCount = 0;
    particlesInit(10, 0, 0, 25, 0, 0, 20)
    particlesInit(100, 0, 0, -25, 0, 0, 50)
        // particlesInit(118, 8, 0, 25, -40, -90, 30)
        // particlesInit(-18, 2, 0, 25, 40, -90, -30)

    controls.setCustomState(new THREE.Vector3(45, 8, 12), new THREE.Vector3(44, -88, 30), 1)


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
        p.init(scene);
        particles.push(p);
    }
    //fitCameraToObject(camera, plant, 2, controls)

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
    //renderer.setClearColor(0x000000, 0);
    material.color.setHex(params.particleColor);
    plantMaterial.color.setHex(params.plantColor)
    material.size = params.particleSize;
    mat2.size = params.particleSize;
    mat3.size = params.particleSize;
    material.blending = parseInt(params.particleBlending);
    if (!params.noiseFreeze) frameCount++;
    let incrementer = -0.0001
    controls.rotate(0.00002, 0.00001)
    controls.target = new THREE.Vector3(controls.target.x + incrementer, controls.target.y + 0.01, controls.target.z)
    composer.render();
    //renderer.render(scene, camera);

    //if (frameCount % 10 == 0) renderer.clear()
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
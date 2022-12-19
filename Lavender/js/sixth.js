import * as THREE from 'https://unpkg.com/three@0.126.0//build/three.module.js';
import Stats from 'https://unpkg.com/three@0.126.0/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.0/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://unpkg.com/three@0.126.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.126.0/examples/jsm/postprocessing/RenderPass.js';
import { AfterimagePass } from 'https://unpkg.com/three@0.126.0/examples/jsm/postprocessing/AfterimagePass.js';
const { GUI } = await
import ('https://unpkg.com/three@0.126.0/examples/jsm/libs/dat.gui.module.js');

const randomFloat = () => Math.random() * 2 - 1;

/* Clamps value to within the range. */
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/* Normalises value to range of 0 to 1. */
const norm = (val, min, max) => clamp((val - min) / (max - min), 0, 1);

/* Maps normalised value to range. */
const mapNorm = (val, min, max) => (val * (max - min)) + min;

/* If val is outside of range, increase range. Range is array of two numbers. */
const checkRange = (val, range) => {
    range[0] = Math.min(val, range[0]);
    range[1] = Math.max(val, range[1]);
}

// MQTT --------------------
const server = "wss://poetryai:605k8jiP5ZQXyMEJ@poetryai.cloud.shiftr.io";
// const server = 'wss://foresta-projects:ADOh7ArkqjIE27zR@foresta-projects.cloud.shiftr.io';
const client = mqtt.connect(server, {
    clientId: 'Faadhi-Three'
});

// const client = mqtt.connect(server, "MemoryInitiator");

// CURRENT SENSOR --------------------

const sensor = {

    local: false,

    light: 500,
    wind: 80,
    wetSoil: 0,
    soilTemp: 20,
    rain: 0,
    airTemp: 20,
    co2: 1000,
    voc: 0,
    particle2_5: 0,
    particle10: 0,
    particulates: []

}



const hourMemory = [];




// Value mapping sensor readings -----

const range = {

    light: [0, 1024],
    wind: [70, 105],
    airTemp: [10, 35],
    co2: [400, 1000],
    voc: [0, 50],
    particle2_5: [0, 30],
    particle10: [0, 50],


    noiseVari: [0.1, 0.05],
    noiseSpeed: [0.0001, 0.001],
    force: [0.0001, 0.002],
    maxSpeed: [0.01, 0.05],
    tails: [0.985, 0.95],
    cam: {
        distance: [380, 1100],
        focalLength: [5, 50]
    },
    aisleSeparation: [15, 40],
    baseBrightness: [0.1, 0.2],
    breath: {
        freq: [0.01, 0.15],
        bri: [-0.05, 0.05]
    },

    background: [new THREE.Color(0x20), new THREE.Color(0x200000)]

}




const container = document.createElement('div');
document.body.appendChild(container);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 10000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const stats = new Stats();
container.appendChild(stats.dom);

const clock = new THREE.Clock();

//

let particleSystem;
const particles = [];

const particulateSizes = [
    0.1,
    0.3,
    1,
    2.5,
    5,
    10
];

function randomiseParticulateSensor() {
    for (let i = 0; i < particulateSizes.length; i++)
        sensor.particulates[i] = Math.random();
}

const maxParticles = 10000;
const maxPollen = maxParticles / 50;
const maxAmtPerSize = (maxParticles - maxPollen) / particulateSizes.length;
const particleCount = {};

for (let i of particulateSizes) {

    let name = (i * 10).toString();
    particleCount[name] = maxAmtPerSize;

}

particleCount['total'] = maxParticles;
particleCount['maxAmtPerSize'] = maxAmtPerSize;
particleCount['maxAmtPerSizePerAisle'] = maxAmtPerSize / 24;
particleCount['randomise'] = false;

particleCount['small'] = maxAmtPerSize;
particleCount['medium'] = maxAmtPerSize;
particleCount['large'] = maxAmtPerSize;
particleCount['pollen'] = maxAmtPerSize;


console.log('particleCount: ', particleCount);

// const particleCount = {

// 	total: maxParticles,
// 	maxAmtPerSize: maxAmtPerSize,
// 	small: maxAmtPerSize,
// 	medium: maxAmtPerSize,
// 	large: maxAmtPerSize,
// 	pollen: 0

// }

let particleSize = {
    small: 1,
    medium: 2,
    large: 3,
    pollen: 4
}


const colorCodes = [

    ['#0718fa', '#00ecbc'],
    ['#f43b47', '#a92cbf'],
    ['#f9d423', '#f74a05'],
    ['#2be324', '#f5c000'],
    ['#93e909', '#fafef2'],

]

const colorPalette = colorCodes.map(
    function(index) {

        return [new THREE.Color(index[0]), new THREE.Color(index[1])];

    });

const colorRanges = [ // this changes the colour palette
    0,
    0.25,
    0.5,
    0.75,
    1.1
];

let mouseX = 0,
    mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let flowfield = [];
let prevFlowfield = [];



let ffAngle;
let yoff = 0;
let xoff = 0;
let zoff = 0;
let noisePos = 0;
let tailNoiseOffset = 0.0;
let angle;
let v;
let index;

let autoZoomReverse;

let p = {

    scale: 5,
    colorHue: 0.5,
    colorSaturation: 1.0,
    baseBrightness: 0.2,
    colorBrightness: 0.2,
    pollenBrightness: 0.4,
    breathDepth: range.breath.bri[1],
    currentColorOnly: false,
    particleCount: particleCount.total,


    focalLength: camera.getFocalLength(),
    backgroundColor: range.background[0]
}

const shape = {
    radius: 50,
    radii: [],
    innerLimitRadius: 10,
    edgeMode: 3,
    outerRingSize: 0.75,
    innerRingSize: 0.5,
    aisleSeparation: 15
}

let navi = {
    autoRotate: false,
    rotateSpeed: 0.001,
    autoZoom: false,
    zoomSpeed: 1,
    camDistance: 450
}

let cam = {

    distance: 400,
    focalLength: camera.getFocalLength(),

}

let backgroundColor;

let ff = {
    show: false,
    z: 0,
    init: false,
    clear: false,
    noiseVari: 0.1,
    noiseSpeed: 0.0001,
    force: 0.0001,
    maxSpeed: 0.01,
    axisVec: new THREE.Vector3(0, 0, 1),
    seedVec: new THREE.Vector3(1, 0, 0)

}

let lines;

let flowfieldVectors = [];
let flowVecStartX, flowVecStartY;
let flowVecStart = new THREE.Vector3();
let flowVecEnd = new THREE.Vector3();
let flowVecSize = 5;


// const cols = Math.ceil( ( shape.radius * 2 ) / p.scale);
// const rows = Math.ceil( ( shape.radius * 2 ) / p.scale);
const cols = Math.ceil((shape.radius * 2) / p.scale);
const rows = Math.ceil((shape.radius * 2) / p.scale);
const aisles = 24; // one aisle per hour of the day

updateRadii();

function updateRadii() {

    shape.radii = [];

    for (let i = 0; i < aisles; i++) {
        let n = i / aisles;
        let r = mapNorm(n, shape.radius, shape.innerLimitRadius);
        shape.radii.push(r);
    }

}


console.log(shape.radii);

let tempVector = new THREE.Vector3();
let maxSpeedVec = new THREE.Vector3(ff.maxSpeed, ff.maxSpeed, ff.maxSpeed);
let axisVec = new THREE.Vector3(0, 0, 1);


let composer, afterimagePass;

const color = new THREE.Color();
const tempColors = [];
const pollenColor = new THREE.Color('#e3cd07');

let co2Changed = true;
let breathFreq = 1;
let frameCounter = 0;


let colorChanged = false;
let oldHue;
let zChanged = true;

let distanceVec = new THREE.Vector3();
let originVec = new THREE.Vector3();

init();
animate();



function init() {


    backgroundColor = new THREE.Color(p.backgroundColor);
    updateBackground(backgroundColor);

    for (let i = 0; i < aisles; i++) {
        // lightHistory.unshift( (i/aisles) * 1024 );
        hourMemory.push(sensor);
        tempColors.push([new THREE.Color(), new THREE.Color()]);
    }

    // Flowfield				

    noise.seed(Math.random());

    const points = new Float32Array(rows * cols * aisles * 6);

    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 0.2 });
    const lineGeo = new THREE.BufferGeometry();

    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    lines = new THREE.LineSegments(lineGeo, lineMat);

    scene.add(lines);


    //

    const material = new THREE.ShaderMaterial({

        // uniforms: {
        // 	color: { value: new THREE.Color( 0x9999ff ) },
        // },
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent,

        blending: THREE.AdditiveBlending,
        depthTest: true,
        transparent: true,
        vertexColors: true

    });

    const pos = new Float32Array(maxParticles * 3);
    const colors = new Float32Array(maxParticles * 3);
    const sizes = new Float32Array(maxParticles);

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));



    //

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    const pollenStep = Math.floor(maxParticles / maxPollen);
    let pollenIndex;

    let i = 0;

    for (let j = 0; j < maxParticles; j++) {

        let aisleIndex = Math.floor(Math.random() * aisles);

        pos[i] = randomFloat() * shape.radii[aisleIndex]; // x
        pos[i + 1] = randomFloat() * shape.radii[aisleIndex]; // y
        pos[i + 2] = 0; // z

        let colorIndex = Math.floor(Math.random() * 2);

        let sizeIndex;

        if (j % pollenStep == 0) {

            sizes[j] = particleSize.pollen;
            sizeIndex = 'pollen';
            pollenIndex = true;

        } else {

            pollenIndex = false;
            let randomSize = Math.floor(Math.random() * 3);

            switch (randomSize) {

                case 0:
                    sizes[j] = particleSize.small;
                    sizeIndex = 0;
                    break;

                case 1:
                    sizes[j] = particleSize.medium;
                    sizeIndex = 1;
                    break;

                case 2:
                    sizes[j] = particleSize.large;
                    sizeIndex = 2;
                    break;

            }
        }



        particles[j] = {
            pos: new THREE.Vector3(
                pos[i],
                pos[i + 1],
                pos[i + 2]),
            vel: new THREE.Vector3(),
            acc: new THREE.Vector3(),
            aisleIndex: aisleIndex,
            colorIndex: colorIndex,
            sizeIndex: sizeIndex,
            isPollen: pollenIndex,
            visib: true
        }

        i += 3;
    }

    updateColor(sensor.light);
    updateVOC(sensor.voc);

    //

    camera.position.z = cam.distance;

    container.style.touchAction = 'none';
    container.addEventListener('pointermove', onPointerMove);

    //

    window.addEventListener('resize', onWindowResize);

    // Post-processing for trails

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    afterimagePass = new AfterimagePass();
    afterimagePass.uniforms['damp'].value = 0.95;
    composer.addPass(afterimagePass);

    addGUI();

}

function addGUI() {
    const gui = new GUI();

    const folderFF = gui.addFolder('Flowfield');
    const folderPS = gui.addFolder('Particle Size');
    const folderPC = gui.addFolder('Particle Count');
    const folderNG = gui.addFolder('Navigation');
    const folderCL = gui.addFolder('Colour');
    const folderSH = gui.addFolder('Shape');
    const folderSN = gui.addFolder('Sensor');

    // const folderP  = gui.addFolder('Particles');

    folderFF.add(ff, 'show', 0, 1);
    // folderFF.add(ff, 'z', 0, shape.aisleSeparation * aisles).listen();
    folderFF.add(ff, 'noiseVari', 0, 0.2).listen();
    folderFF.add(ff, 'noiseSpeed', 0, 0.001).listen();
    folderFF.add(ff, 'force', range.force[0], range.force[1]).listen();
    folderFF.add(ff, 'maxSpeed', range.maxSpeed[0], range.maxSpeed[1]).listen();

    folderNG.add(navi, 'autoRotate', 0, 1);
    folderNG.add(navi, 'rotateSpeed', 0, 0.002).step(0.0001);
    folderNG.add(navi, 'autoZoom');
    folderNG.add(navi, 'zoomSpeed', 0, 2).step(0.01);
    folderNG.add(cam, 'distance', 0, 1000).onChange(function() { camera.position.z = cam.distance; }).listen();

    // folderCL.add(p, 'colorHue', 0, 1024).step(0.1).onChange( () => updateColor(p.colorHue) );

    folderCL.add(p, 'currentColorOnly', 0, 1).onChange(() => updateColor(sensor.light));
    folderCL.add(p, 'colorSaturation', 0, 1).step(0.01).onChange(() => updateColor(sensor.light));
    folderCL.add(p, 'colorBrightness', 0, 1).step(0.01).onChange(() => updateColor(sensor.light)).listen();
    folderCL.add(p, 'baseBrightness', 0, 1).step(0.01).onChange(() => updateColor(sensor.light)).listen();
    folderCL.add(p, 'pollenBrightness', 0, 1).step(0.01).onChange(() => updateColor(sensor.light));
    folderCL.add(p, 'breathDepth', 0, 0.5).step(0.01).onChange(() => { range.breath.bri[0] = -p.breathDepth;
        range.breath.bri[1] = p.breathDepth });
    folderCL.addColor(p, 'backgroundColor').onChange(() => { range.background[1].set(p.backgroundColor);
        updateAirTemp(sensor.airTemp); }).listen();

    folderSN.add(sensor, 'local', 0, 1);
    folderSN.add(sensor, 'light', range.light[0], range.light[1]).step(1).onChange(() => updateColor(sensor.light)).listen();
    folderSN.add(sensor, 'wind', range.wind[0], range.wind[1]).step(1).onChange(() => updateWind(sensor.wind)).listen();
    folderSN.add(sensor, 'airTemp', range.airTemp[0], range.airTemp[1]).step(1).onChange(() => updateAirTemp(sensor.airTemp)).listen();
    folderSN.add(sensor, 'co2', range.co2[0], range.co2[1]).step(1).onChange(() => updateCO2(sensor.co2)).listen();
    folderSN.add(sensor, 'voc', range.voc[0], range.voc[1]).step(1).onChange(() => updateVOC(sensor.voc)).listen();
    folderSN.add(sensor, 'particle10', range.particle10[0], range.particle10[1]).step(1).onChange(() => updatePollen(sensor.particle10)).listen();

    folderSH.add(shape, 'edgeMode', 1, 3).step(1);
    // folderSH.add(shape, 'radius', 0, 50).step(0.1);
    folderSH.add(shape, 'outerRingSize', 0.01, 0.99).step(0.01);
    folderSH.add(shape, 'innerRingSize', 0.01, 0.99).step(0.01);

    folderSH.add(shape, 'innerLimitRadius', 0, shape.radius).step(1).onChange(() => updateRadii());

    folderSH.add(shape, 'aisleSeparation', 0, 50).step(0.1).onChange(() => zChanged = true).listen();

    gui.add(cam, 'focalLength', 1, 150).onChange(function() { camera.setFocalLength(cam.focalLength) }).listen();

    gui.add(afterimagePass.uniforms["damp"], 'value', 0.8, 1).step(0.001).listen();
}

function updateBackground(newCol) {

    backgroundColor.set(newCol);
    scene.background = backgroundColor;
    // console.log( 'background updated');

}

function updateParticleSize() {

}



function updateColor(val) {

    for (let i = 0; i < aisles; i++) {


        let hueIndex;

        if (i == 0 || p.currentColorOnly) {
            hueIndex = norm(val, range.light[0], range.light[1]);
        } else {
            hueIndex = norm(hourMemory[i].light, range.light[0], range.light[1]);
        }

        let paletteIndex = 0;

        for (let j = 0; j < (colorRanges.length - 1); j++) {

            if (colorRanges[j] <= hueIndex && hueIndex < colorRanges[j + 1]) {
                paletteIndex = j;
                hueIndex = norm(hueIndex, colorRanges[j], colorRanges[j + 1]);
                break;
            }

        }


        tempColors[i][0].lerpColors(colorPalette[paletteIndex][0], colorPalette[paletteIndex + 1][0], hueIndex);
        tempColors[i][1].lerpColors(colorPalette[paletteIndex][1], colorPalette[paletteIndex + 1][1], hueIndex);
    }


    const colors = particleSystem.geometry.attributes.color.array;
    // let pollenCounter = particleCount.pollen;
    let i = 0;

    for (let j = 0; j < maxParticles; j++) {

        if (!particles[j].visib) {
            colors[i] = 0;
            colors[i + 1] = 0;
            colors[i + 2] = 0;
        } else {

            if (particles[j].isPollen) {

                color.set(pollenColor);
                color.setHSL(color.getHSL(color).h,
                    color.getHSL(color).s * p.colorSaturation,
                    color.getHSL(color).l * p.pollenBrightness);

            } else {

                color.set(tempColors[particles[j].aisleIndex][particles[j].colorIndex]);
                color.setHSL(color.getHSL(color).h,
                    color.getHSL(color).s * p.colorSaturation,
                    color.getHSL(color).l * p.colorBrightness);

            }

            // color.setRGB( color.r * p.colorBrightness,
            // 							color.g * p.colorBrightness,
            // 							color.b * p.colorBrightness );



            colors[i] = color.r;
            colors[i + 1] = color.g;
            colors[i + 2] = color.b;

            particles[j].color = color;

        }

        i += 3;
    }



    particleSystem.geometry.attributes.color.needsUpdate = true;

}



function updateWind(val) {

    val = norm(val, range.wind[0], range.wind[1]);

    ff.noiseVari = mapNorm(val, range.noiseVari[0], range.noiseVari[1]);
    // ff.noiseSpeed = mapNorm( val, range.noiseSpeed[0], range.noiseSpeed[1]);
    ff.force = mapNorm(val, range.force[0], range.force[1]);
    ff.maxSpeed = mapNorm(val, range.maxSpeed[0], range.maxSpeed[1]);

    afterimagePass.uniforms["damp"].value = mapNorm(val, range.tails[0], range.tails[1]);

}

function updateAirTemp(val) {

    val = norm(val, range.airTemp[0], range.airTemp[1]);
    backgroundColor.lerpColors(range.background[0], range.background[1], val);
    updateBackground(backgroundColor);

}

function updateParticle2_5(val) {

    val = norm(val, range.particle2_5[0], range.particle2_5[1]);

}



function updateCO2(val) {

    val = norm(val, range.co2[0], range.co2[1]);

    cam.focalLength = mapNorm(val, range.cam.focalLength[0], range.cam.focalLength[1]);
    cam.distance = mapNorm(val, range.cam.distance[0], range.cam.distance[1]);
    shape.aisleSeparation = mapNorm(val, range.aisleSeparation[0], range.aisleSeparation[1]);
    p.baseBrightness = mapNorm(val, range.baseBrightness[0], range.baseBrightness[1]);
    p.pollenBrightness = p.baseBrightness * 2;

    camera.setFocalLength(cam.focalLength);
    camera.position.z = cam.distance;
    zChanged = true;

    co2Changed = true;


}

function updateVOC(val) {

    val = norm(val, range.voc[0], range.voc[1]);

    breathFreq = mapNorm(val, range.breath.freq[0], range.breath.freq[1]);



}

function morphDensity(t) {



}

function breathe(t) {

    if (t % 5 == 0) {

        const index = norm((4 / (3 * Math.PI)) * Math.sin(3 * frameCounter * 0.01), -1, 1);

        p.colorBrightness = p.baseBrightness + mapNorm(index, range.breath.bri[0], range.breath.bri[1]);

        // p.colorBrightness = p.baseBrightness + mapNorm( norm( noise.perlin2( frameCounter * breathFreq, 0 ), -1, 1), range.breath.bri[0], range.breath.bri[1] );


        updateColor(sensor.light);

    }

}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function onPointerMove(event) {

    if (event.isPrimary === false) return;

    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;

}

//

function animate() {

    requestAnimationFrame(animate);

    if (clock.getElapsedTime() > 360) {

        client.publish('/Commands/Request', '1');
        clock.start();

    }
    const t = frameCounter++;

    if (navi.autoRotate) {
        particleSystem.rotation.x += navi.rotateSpeed;
        particleSystem.rotation.z += navi.rotateSpeed * 1.5;
        // particleSystem.rotateX = 100;
    }
    if (navi.autoZoom) {
        if (autoZoomReverse) {
            camera.position.z += (camera.position.z / 600) * navi.zoomSpeed;
            if (camera.position.z >= cam.distance) autoZoomReverse = false;
        } else {

            camera.position.z -= (camera.position.z / 600) * navi.zoomSpeed + 0.2;
            if (camera.position.z <= 5) autoZoomReverse = true;
        }
    }

    if (co2Changed) morphDensity(t);
    breathe(t);

    render();
    stats.update();
    controls.update();

}

// function moveFFZ(z) {

// 	const points = lines.geometry.attributes.position.array;
// 	let count = 0

// 	// console.log( rows, cols )

// 	for (let f = 0; f < points.length; f+6) {
// 		// console.log('start points loop', count);
// 		// count++;
// 		points[ f + 2 ] = z;
// 		points[ f + 5 ] = z;
// 		// console.log('end points loop', count);
// 	}

// }



function calculateFlowfield() {

    const points = lines.geometry.attributes.position.array;
    let i = 0;

    noisePos += ff.noiseSpeed;

    yoff = 0;

    for (let y = 0; y < rows; y++) {

        xoff = 0;

        for (let x = 0; x < cols; x++) {

            index = x + (y * cols);
            let noiseValue = noise.perlin3(xoff, yoff, zoff);
            // console.log(noiseValue);
            ffAngle = 2 * Math.PI * noiseValue; // find angle in radians with perlin noise.

            flowfield[index] = new THREE.Vector3().copy(ff.seedVec).applyAxisAngle(ff.axisVec, ffAngle); // rotate around z-axis i.e. in 2D

            /////////////////////

            // Visualising the flowfield

            if (!ff.init) {

                flowVecStart = new THREE.Vector3(
                    (x * (p.scale)) - shape.radius,
                    (y * (p.scale)) - shape.radius,
                    0);

                flowfieldVectors.push(flowVecStart);

                points[i] = points[i + 3] = flowVecStart.x;
                points[i + 1] = points[i + 4] = flowVecStart.y;
                points[i + 2] = points[i + 5] = flowVecStart.z;

            }

            if (ff.show) { // show flowfield

                ff.clear = false;

                flowVecEnd.copy(flowfieldVectors[index]).addScaledVector(flowfield[index], flowVecSize);

                points[i + 3] = flowVecEnd.x;
                points[i + 4] = flowVecEnd.y;
                points[i + 2] = points[i + 5] = ff.z;

                lines.geometry.attributes.position.needsUpdate = true;

            } else if (!ff.show && !ff.clear) { // clear flowfield if visible

                points[i + 3] = points[i]
                points[i + 4] = points[i + 1]
                points[i + 5] = points[i + 2]

                lines.geometry.attributes.position.needsUpdate = true;

            }

            i += 6;

            flowfield[index].setLength(Math.random() * ff.force);

            xoff += ff.noiseVari;

        }

        yoff += ff.noiseVari;
        zoff += ff.noiseSpeed;

    }

    if (!ff.init) ff.init = true; // only run init code once
    if (!ff.show && !ff.clear) ff.clear = true; // only run clear code once.


}

function simulate() {

    const pos = particleSystem.geometry.attributes.position.array;

    let i = 0;

    for (let j = 0; j < maxParticles; j++) {

        let posX = Math.floor((pos[i] + shape.radii[particles[j].aisleIndex]) / p.scale);
        let posY = Math.floor((pos[i + 1] + shape.radii[particles[j].aisleIndex]) / p.scale);

        let index = Math.floor(posX + posY * cols);
        index = clamp(index, 0, rows * cols);

        particles[j].acc.copy(flowfield[index]);
        particles[j].vel.add(particles[j].acc);
        particles[j].vel.clampLength(0, ff.maxSpeed);
        particles[j].pos.add(particles[j].vel);

        handleEdges(particles[j].pos, particles[j].vel, j);

        pos[i] = particles[j].pos.x;
        pos[i + 1] = particles[j].pos.y;

        if (zChanged) pos[i + 2] = (aisles - particles[j].aisleIndex) * shape.aisleSeparation;

        // pos [ i + 2 ] -= p.particleSpeed;

        i += 3;

    }

    if (colorChanged) {
        particleSystem.geometry.attributes.color.needsUpdate = true;
        colorChanged = false;

    }
    if (zChanged) zChanged = false;

    particleSystem.geometry.attributes.position.needsUpdate = true;
}

function handleEdges(pos, vel, j) {

    // const inner = shape.innerRingSize * ( particles[ j ].aisleIndex / aisles );
    // const outer = shape.outerRingSize * ( particles[ j ].aisleIndex / aisles );

    const inner = shape.innerRingSize;
    const outer = shape.outerRingSize;
    const radius = shape.radii[particles[j].aisleIndex];

    distanceVec.set(pos.x, pos.y, 0);
    if (distanceVec.distanceTo(originVec) > (radius) || distanceVec.distanceTo(originVec) < (radius * inner)) {
        // if ( distanceVec.distanceTo( originVec ) > ( shape.radius * norm( particles[ j ].aisleIndex, 0, aisles ) ) ) {

        let x, y;
        let rand, r, theta;

        switch (shape.edgeMode) {

            case 1: //random in circle

                rand = 1 - (Math.random() * outer);
                r = radius * Math.sqrt(rand);
                theta = Math.random() * 2 * Math.PI;
                x = r * Math.sin(theta);
                y = r * Math.cos(theta);
                break;

            case 2: // random in square
                rand = Math.random() * outer * norm(noise.perlin3(0, 0, zoff), -1, 1);
                r = radius * Math.sqrt(rand);
                theta = Math.random() * 2 * Math.PI;
                x = r * Math.sin(theta);
                y = r * Math.cos(theta);
                break;

            case 3:

                rand = norm(noise.perlin3(0, 0, zoff * 50) ^ 2, -1, 1) * outer; // what does this line do?
                r = radius * Math.sqrt(rand);
                theta = Math.random() * 2 * Math.PI;
                x = r * Math.sin(theta);
                y = r * Math.cos(theta);
                break;

            case 4:
                x = 0; // x
                y = 0; // y
                break;

        }

        pos.setX(x);
        pos.setY(y);
        vel.set(0, 0, 0);
    }

}

function render() {

    calculateFlowfield();
    simulate();

    ff.z = camera.position.z - (cam.focalLength * 10);

    // renderer.render( scene, camera );
    composer.render();



}



// function messageReceived(topic, payload) {

// 	payload = payload.toString();

//     if (!sensor.local) {

//       switch (topic) {

//       	// case 'Lux':
//       	case 'Light':
//       		sensor.light = payload;
//       		checkRange(sensor.light, range.light);
// 		      updateColor(sensor.light);
// 		      break;

// 	      case 'Temp-degree':
// 	      case 'AirTemp':
// 	      	sensor.airTemp = payload;
// 	      	checkRange(sensor.airTemp, range.airTemp);
// 	      	updateAirTemp(sensor.airTemp);
// 	      	break;

//       	case 'Wind':
//       		sensor.wind = payload;
//       		checkRange(sensor.wind, range.wind);
//       		updateWind(sensor.wind);

//       		break;

//     		case 'Particles2.5':
//       		sensor.particle2_5 = payload;
//       		updateParticleCount();

//       		break;

//       	case 'Particles10':
//       		sensor.particle10 = payload;
//       		checkRange(sensor.particle10, range.particle10);
//       		updatePollen(sensor.particle10);
//       		break;

//       	case 'C02':
//       		sensor.co2 = payload;
//       		checkRange(sensor.co2, range.co2);
//       		updateCO2(sensor.co2);
//       		break;

//       	case 'VOC':
//       		sensor.voc = payload;
//       		checkRange(sensor.voc, range.voc);
//       		updateVOC(sensor.voc);
//       		break;
//       }
//     }

//     if (topic.split('/')[0]) {

//     	let payloadArr = payload.split( ', ' ); // turn comma denominated string into array of values

//     	let l = topic.length;
//     	let hourIndex = Number( topic[ l - 2 ] + topic[ l - 1 ] );	// index is last two characters of topic i.e. hour number.

//     	let hourData = {

//     		light: 			 	payloadArr[0],
// 				wind: 			 	payloadArr[1],
// 				wetSoil: 			payloadArr[2], 
// 				soilTemp: 		payloadArr[3],
// 				rain: 				payloadArr[4],
// 				airTemp:  		payloadArr[5],
// 				co2: 					payloadArr[6],
// 				voc: 					payloadArr[7],

// 				particle0_1: 	Math.random(),
// 				particle0_3: 	Math.random(),
// 				particle1: 		Math.random(),
// 				particle2_5: 	payloadArr[8],
// 				particle5: 		Math.random(),
// 				particle10:  	payloadArr[9]

// 			}

// 			updateMemory(hourData, hourIndex);

//     }

// }

// function updateMemory(data, index) {

// 	if ( hourMemory.length = 24 ) {			

// 		hourMemory.splice( index, 1, data);		// if 24hour memory is filled, replace index (args[1] == 1)

// 		console.log( hourMemory );

// 	} else {

// 		hourMemory.splice( index, 0, data);		// else, don't replace and just add.

// 	}

// }
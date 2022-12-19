var controls;
var material;
var plantMaterial;
var lastState;
var mat2;
var mat3;
var pointGeometry = new THREE.Geometry();
// Control variables
var gui;
let currentPreset = 0;
// Positon of possible particles
var dataPoints = [];
// var params = {
//     x: 0,
//     y: 90,
//     z: 0,
//     size: 7.1,
//     noiseScale: 0.003,
//     noiseSpeed: 0.0004,
//     noiseStrength: 0.03,
//     noiseFreeze: false,
//     particleCount: 0,
//     particleSize: 0.41,
//     particleSpeed: 0.042,
//     particleColor: 0xee00ff,
//     opacity: 0.65,
//     particleColor2: 0x4400ff,
//     opacity2: 0.65,
//     particleColor3: 0xffffff,
//     opacity3: 0.65,
//     bgGradient1: "#36d1dc",
//     bgGradient2: "#5b86e5",
//     bgAngle: 165,
//     particleSkip: 2,
//     trailLen: 0.96,
//     animationDuration: 600,
//     Preset: 0,
//     renderIterations() {
//         particlesInit();
//     }
// };
var params = {
    x: 0,
    y: 90,
    z: 0,
    size: 8.1,
    lifeLimit: 200,
    noiseScale: 0.0587,
    noiseSpeed: 0.003,
    noiseStrength: 0.3412,
    noiseFreeze: false,
    particleCount: 0,
    particleSize: 0.41,
    particleSpeed: 0.042,
    particleColor: 0xee00ff,
    opacity: 0.65,
    particleColor2: 0x4400ff,
    opacity2: 0.65,
    particleColor3: 0xffffff,
    opacity3: 0.65,
    bgGradient1: "#36d1dc",
    bgGradient2: "#5b86e5",
    bgAngle: 165,
    particleSkip: 2,
    trailLen: 0.96,
    tempTrailLen: 0.96,
    animationDuration: 600,
    Preset: 0,
    renderIterations() {
        particlesInit();
    }
};

function setupMaterials() {
    material = new THREE.PointsMaterial({
        size: params.particleSize,
        color: params.particleColor,
        map: createCircleTexture('#ffffff', 256),
        transparent: true,
        depthWrite: false,
        opacity: params.opacity,
        blending: THREE.AdditiveBlending
    });

    mat2 = new THREE.PointsMaterial({
        size: params.particleSize,
        map: createCircleTexture('#ffffff', 256),
        transparent: true,
        color: params.particleColor2,
        depthWrite: false,
        opacity: params.opacity2,
        blending: THREE.AdditiveBlending
    });

    mat3 = new THREE.PointsMaterial({
        size: params.particleSize,
        map: createCircleTexture('#ffffff', 256),
        transparent: true,
        color: params.particleColor3,
        depthWrite: false,
        opacity: params.opacity3,
        blending: THREE.AdditiveBlending
    });
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

class Particle {
    constructor(x, y, z, isRight) {
        this.life = Math.random() * (params.lifeLimit / 10);
        const zVariance = 20;
        const zOffset = Math.floor((Math.random() * zVariance) - (zVariance / 4));
        this.ex = x;
        this.ey = y;
        this.ez = z + zOffset;
        this.shouldRun = Math.random() < 1.2;
        if (!this.shouldRun) {
            z = z + Math.floor(Math.random() * 8);
            this.ez = z;
        } else {
            z += zOffset
        }
        this.pos = new THREE.Vector3(x, y, z);
        this.vel = new THREE.Vector3(0, 0, 0);
        this.acc = new THREE.Vector3(0, 0, 0);
        this.angle = new THREE.Euler(0, 0, 0);
        this.mesh = null;
        //this.shouldChangeHue = Math.random() < 0.66;
        this.randomBoundaryOffset = this.shouldRun ? (-params.size * 0.85) + (Math.random() * (params.size * 0.3)) : -params.size / 1.2;
        //this.randomBoundaryOffset = -params.size / 1.2;
        this.exceeded = false;
        this.accelerated = false;
        this.isRight = isRight
    }

    init(scene) {
        let mat;
        const choseMat = Math.floor(Math.random() * 3);
        if (choseMat == 0) mat = material;
        else if (choseMat == 1) mat = mat2;
        else mat = mat3;

        var point = new THREE.Points(pointGeometry, mat);
        point.geometry.dynamic = true;
        point.geometry.verticesNeedUpdate = true;
        scene.add(point);
        this.mesh = point;
        this.life++;
    }
    update() {
        this.life++;
        if (this.isRight)
            this.acc.set(1, 1.3, 0);
        else
            this.acc.set(-1, 1.3, 0);
        this.acc.applyEuler(this.angle);
        if (!this.shouldRun) {
            this.acc.multiplyScalar(0.0007);
        } else {
            this.acc.multiplyScalar(params.noiseStrength);
        }

        this.acc.clampLength(0, params.particleSpeed);
        this.vel.clampLength(0, params.particleSpeed);
        this.vel.add(this.acc);
        this.pos.add(this.vel);

        // this.acc.multiplyScalar(params.particleDrag);
        // this.vel.multiplyScalar(params.particleDrag);

        //Position Resets

        if (Math.abs(this.pos.x - this.ex) > params.size / 4 + this.randomBoundaryOffset || Math.abs(this.pos.y - this.ey) > params.size + this.randomBoundaryOffset ||
            Math.abs(this.pos.z - this.ez) > params.size + this.randomBoundaryOffset) {
            this.pos = new THREE.Vector3(this.ex, this.ey, this.ez)
            this.life = 0;
            if (!this.accelerated && this.shouldRun) {
                this.randomBoundaryOffset = bottomHeavyRandom(params.size, 1.0);
                this.accelerated = true;
            }
        }
        this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    }
}


// Bottom size is the percentage 
function bottomHeavyRandom(limit, exceedBy) {
    const isBottom = Math.random() > 0.8;
    let toReturn = 0;
    if (isBottom) {
        toReturn = Math.random() * limit
    } else {
        toReturn = limit + Math.random() * (limit * exceedBy)
    }
    return toReturn;
}

function boolToDirection(trueOrFalse) {
    if (trueOrFalse) return 1;
    else return -1;
}

function curveFunction(x) {
    return 0.2 * x * x;
}

function compareControlStates(state1, state2) {
    // console.log("\nS1 Pos: ");
    // printVector(state1.position);
    // console.log("\nS1 Tar: ");
    // printVector(state1.target);
    // console.log("\nS2 Pos: ");
    // printVector(state2.position);
    // console.log("\nS2 Tar: ");
    // printVector(state2.target);

    if (state1.target.equals(state2.target) && state1.position.equals(state2.position) && state1.zoom == state2.zoom) return true
    else return false;
}

function printVector(vector) {
    console.log("X: " + vector.x + " Y: " + vector.y + " Z: " + vector.z)
}

function numScale(number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function compareControlStates(state1, state2) {
    if (state1.target.equals(state2.target) && state1.position.equals(state2.position) && state1.zoom == state2.zoom) return true
    else return false;
}
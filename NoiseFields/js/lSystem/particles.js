var material;
var plantMaterial;
var mat2;
var mat3;

var pointGeometry = new THREE.Geometry();
let baseHue = 90;
let hueVariance = 50;
let hueRange = 30;
let lightness = 90;
// Control variables
var gui;
let currentPreset = 0;
// Positon of possible particles
var dataPoints = [];
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
    particleColor: 0xee00ff, //0x41a5ff, 0xff6728
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
        opacity: 0.12,
        blending: THREE.AdditiveBlending
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
    constructor(x, y, z) {
        const zVariance = 20;
        const zOffset = Math.floor((Math.random() * zVariance) - (zVariance / 4));
        this.ex = x;
        this.ey = y;
        this.ez = z + zOffset;
        this.shouldRun = Math.random() < 0.75;
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
        this.shouldChangeHue = Math.random() < 0.5;
        this.randomBoundaryOffset = this.shouldRun ? Math.random() * params.size : -params.size / 1.2;
        this.exceeded = false;
    }

    init(scene) {
        let mat = material;

        if (this.shouldChangeHue) {
            const choseMat = Math.floor(Math.random() * 3);
            if (choseMat == 0) mat = material;
            else if (choseMat == 1) mat = mat2;
            else mat = mat3;
        }

        var point = new THREE.Points(pointGeometry, mat);
        point.geometry.dynamic = true;
        point.geometry.verticesNeedUpdate = true;
        scene.add(point);
        this.mesh = point;
    }
    update() {
        this.acc.set(1, 1, 1);
        this.acc.applyEuler(this.angle);
        if (!this.shouldRun) {
            this.acc.multiplyScalar(0.001);
        } else {
            this.acc.multiplyScalar(params.noiseStrength);
        }

        this.acc.clampLength(0, params.particleSpeed);
        this.vel.clampLength(0, params.particleSpeed);
        this.vel.add(this.acc);

        this.pos.add(this.vel);

        this.acc.multiplyScalar(params.particleDrag);
        this.vel.multiplyScalar(params.particleDrag);

        //Position Resets

        if (this.pos.x > this.ex + params.size + this.randomBoundaryOffset || this.pos.y > this.ey + params.size + this.randomBoundaryOffset ||
            this.pos.z > this.ez + params.size + this.randomBoundaryOffset) {
            this.pos = new THREE.Vector3(this.ex, this.ey, this.ez)
        }
        this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    }
}
var controls;
var material;
var plantMaterial;
var lastState;
var mat2;
var mat3;
var pointGeometry = new THREE.Geometry();
var positions = [];
var colors = [];
var sizes = [];
// Control variables
var gui;
let currentPreset = 0;
// Positon of possible particles
var dataPoints = [];
var params = {
    x: 0,
    y: 90,
    z: 0,
    size: 8.1,
    lifeLimit: 150,
    noiseScale: 0.06,
    noiseSpeed: 0.003,
    noiseStrength: 0.9,
    noiseFreeze: false,
    particleCount: 0,    
    strayParticleSpeed: 0.041,
    strayNoiseScale: 0.015,
    strayNoiseSpeed: 0.023,
    particleColor: 0x0514e6,
    // opacity: 0.65,
    particleColor2: 0x49c115,
    // opacity2: 0.65,
    particleColor3: 0xbc007e,
    // opacity3: 0.65,
    bgGradient1: "#f6fdfd",
    bgGradient2: "#a082f2",
    bgAngle: 167,
    particleSkip: 2,
    trailLen: 0.975,
    tempTrailLen: 0.9618,
    animationDuration: 600,
    sizeMultiplier: 1.2,
    particleMultiplier: 2.2,
    shouldResetCam: false,
    focus: 1980,
    aperture: 0.0001,
    maxblur: 0.01,
    Preset: 0,

    xFactor: 12.78,
    yFactor: 2.785,
    yRandomness: 1.4067,
    lifeDivider: 680,
    lifeVariancy: 0.7,
    strayParticles: 0.06,
    maxFunctionTravel: 2,
    perspectiveDelta: 0.12,
    sizeRandomness: 0.32,
    fieldCount: 3,
    distance: 45,
    progressiveDecline: true,
    depth: 200,
    renderIterations() {
        particlesInit();
    }
};



class Particle {
    constructor(id, x, y, z, isRight, xMultiplier, yMultiplier) {
        this.id = id;
        this.yMultiplier = yMultiplier
        this.xMultiplier = xMultiplier
        this.baseLife = Math.floor((Math.random() * params.lifeLimit * 0.3) - params.lifeLimit * 0.15);
        this.scaleFactor = Math.random() * 0.2 + 1;
        this.life = Math.random() * params.lifeLimit * 0.45;
        this.ySpeed = Math.random() * params.yRandomness + (params.yFactor - params.yRandomness);
        this.size = Math.random() * params.sizeRandomness + (1 - params.sizeRandomness);
        this.ex = x;
        this.ey = y;
        this.ez = z;
        this.shouldRun = Math.random() < params.strayParticles;
        this.pos = new THREE.Vector3(x, y, z);
        this.vel = new THREE.Vector3(0, 0, 0);
        this.acc = new THREE.Vector3(0, 0, 0);
        this.angle = new THREE.Euler(0, 0, 0);
        this.noise = 0;
        //this.shouldChangeHue = Math.random() < 0.66;
        this.lifeLimitRandomNess = Math.random() * (params.lifeLimit * params.lifeVariancy)
            //this.randomBoundaryOffset = -params.size / 1.2;
        this.isRight = isRight
        this.colorIndex = Math.floor(Math.random() * 3);
    }

    init() {
        let color;
        if (this.colorIndex == 0) color = new THREE.Color(params.particleColor);
        else if (this.colorIndex == 1) color = new THREE.Color(params.particleColor2);
        else color = new THREE.Color(params.particleColor3);
        if (this.shouldRun) {}
        positions.push(this.ex, this.ey, this.ez)
        colors.push(color.r, color.g, color.b)
        sizes.push(this.size * params.sizeMultiplier)
            // var point = new THREE.Points(pointGeometry, mat);     
            // this.mesh = point;

        // //if (this.id == 100) console.log(this.mesh.scale)
        // scene.add(this.mesh);

    }
    update() {

        this.life += (params.lifeLimit / this.scaleFactor) / params.lifeDivider;
        const posVect = new THREE.Vector3
        if (this.shouldRun) {
            this.life += (params.lifeLimit / this.scaleFactor) / (params.lifeDivider * 80);
            if (this.isRight)
                this.acc.set(0.8, this.ySpeed, 0);
            else
                this.acc.set(-0.8, this.ySpeed, 0);
            this.acc.applyEuler(this.angle);
            this.acc.multiplyScalar(params.noiseStrength);

            this.acc.clampLength(0, params.strayParticleSpeed);
            this.vel.clampLength(0, params.strayParticleSpeed);
            this.vel.add(this.acc);
            this.pos.add(this.vel);
            posVect.copy(this.pos)
        } else {
            //let x = (this.life / params.lifeLimit) / 50
            let x = numScale(this.life, 0, params.lifeLimit, 0, params.maxFunctionTravel)
            let y = curveFunction(x)

            if (this.isRight)
                this.pos.x = this.ex + x * params.xFactor * this.scaleFactor * this.xMultiplier;
            else
                this.pos.x = this.ex + x * -params.xFactor * this.scaleFactor * this.xMultiplier;

            this.pos.y = this.ey + y * this.ySpeed * this.scaleFactor * params.yFactor * this.yMultiplier;
            this.pos.z = this.ez

            this.noise = numScale(this.noise, -1, 1, 0, params.noiseStrength)
                //if (this.id == 22) console.log(this.noise)
                // this.pos.x += this.noise
                // this.pos.y += this.noise
                // this.pos.z += this.noise / 2
            const noiseVec = new THREE.Vector3(this.noise, this.noise, this.noise / 2)
                //noiseVec.clampLength(0, params.particleSpeed * 15);
            this.pos.add(noiseVec)
        }





        if (this.life > params.lifeLimit - this.lifeLimitRandomNess) {
            if (this.shouldRun) {
                this.pos.x = this.ex
                this.pos.y = curveFunction(this.ex)
                this.pos.z = this.ez
                this.pos = new THREE.Vector3(this.ex, curveFunction(this.ex), this.ez)
            }
            this.life = this.baseLife;
        }
        return this.pos
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
    return 3 * Math.sin(x);
}

function compareControlStates(state1, state2) {
    if (state1.target.equals(state2.target) && state1.position.equals(state2.position) && state1.zoom == state2.zoom) return true
    else return false;
}

function printVector(vector) {
    console.log("X: " + vector.x + " Y: " + vector.y + " Z: " + vector.z)
}

function numScale(number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}
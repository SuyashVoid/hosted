class Particle {
    constructor(x, y, z) {
        this.ex = x;
        this.ey = y;
        this.ez = z;
        this.shouldRun = Math.random() < 0.8;
        if (!this.shouldRun) {
            this.ez = 0;
            z = Math.floor(Math.random() * 8);
        }
        this.pos = new THREE.Vector3(x, y, z);
        this.vel = new THREE.Vector3(0, 0, 0);
        this.acc = new THREE.Vector3(0, 0, 0);
        this.angle = new THREE.Euler(0, 0, 0);
        this.mesh = null;
        this.shouldChangeHue = Math.random() < 0.5;
        this.randomBoundaryOffset = this.shouldRun ? Math.random() * params.size : -params.size / 1.2;
    }

    init() {
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
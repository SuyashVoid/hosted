class Particle {
    constructor(x, y, z) {
        this.ex = x;
        this.ey = y;
        this.ez = z;
        this.pos = new THREE.Vector3(x, y, z);
        this.vel = new THREE.Vector3(0, 0, 0);
        this.acc = new THREE.Vector3(0, 0, 0);
        this.angle = new THREE.Euler(0, 0, 0);
        this.mesh = null;

    }

    init() {
        var point = new THREE.Points(pointGeometry, material);
        point.geometry.dynamic = true;
        point.geometry.verticesNeedUpdate = true;
        scene.add(point);
        this.mesh = point;
    }
    update() {
        this.acc.set(1, 1, 1);
        this.acc.applyEuler(this.angle);
        this.acc.multiplyScalar(params.noiseStrength);

        this.acc.clampLength(0, params.particleSpeed);
        this.vel.clampLength(0, params.particleSpeed);

        this.vel.add(this.acc);
        this.pos.add(this.vel);

        this.acc.multiplyScalar(params.particleDrag);
        this.vel.multiplyScalar(params.particleDrag);

        //Position Resets
        if (this.pos.x > params.size || this.pos.y > params.size || this.pos.z > params.size) {
            this.pos = new THREE.Vector3(this.ex, this.ey, this.ez)
        }
        this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    }
}
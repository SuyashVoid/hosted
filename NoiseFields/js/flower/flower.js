var params = {
    flowerCount: 12,
    lines: 3,
    stems: 5,
    angleRange: 0.01,
    depth: 5.0,
    noiseSpeed: 0.0003,
    iterations: 3000,
    hue: 300,
    hueVariance: 50,
    hueRange: 90,
    lightness: 60,
    invert: false
};
var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);
let progMax = -210;

class Walker {
    constructor(config) {
        this.simplex = config.simplex;
        this.total = config.total;
        this.x = config.x;
        this.y = config.y;
        this.dir = config.dir;
        this.speed = config.speed;
        this.delta = config.delta;
        this.time = config.time;
        this.angleRange = config.angleRange;
        this.away = config.away;
        this.depth = config.depth;

        this.position = new THREE.Vector3(this.x, this.y, 0);
        this.path = [];

        this.build();
    }

    build() {
        for (let i = 0; i < this.total; i++) {
            this.step(i / this.total);
        }
    }

    step(p) {
        // progress the time for noise
        this.time += this.delta;

        // get noise values for angle and speed
        this.angle = Calc.map(this.simplex.noise2D(this.time, 0), -1, 1, -this.angleRange, this.angleRange);
        this.speed = Calc.map(this.simplex.noise2D(this.time, 1000), -1, 1, 0, 0.01);

        // apply noise values
        this.dir += this.angle;
        this.position.x += Math.cos(this.dir) * this.speed;
        this.position.y += Math.sin(this.dir) * this.speed;

        // grow away or toward the camera
        if (this.away) {
            this.position.z = Calc.map(p, 0, 1, this.depth / 2, -this.depth / 2);
        } else {
            this.position.z = Calc.map(p, 0, 1, -this.depth / 2, this.depth / 2);
        }

        // push new position into the path array
        this.path.push({
            x: this.position.x,
            y: this.position.y,
            z: this.position.z
        });

    }
}

class Flower {
    constructor(scene) {
        this.scene = scene;
        this.setupLines();
        this.reset();
        this.baseX = Math.random() * 50 - 25;
        this.baseY = Math.random() * 50 - 25;
        this.baseZ = Math.random() * 40 - 20;
        this.duration = Math.random() * 0.4 + 1.0;
        this.progressSpeed = Math.random() * 0.005 + 0.004;
        this.easeSpeed = Math.random() * 1.0 + 0.5;
        ///this.basePos = new THREE.Vector3(Math.random() * 100, Math.random() * 100, Math.random() * 100);
    }

    setupLines() {
        this.meshes = [];
        this.meshGroup = new THREE.Object3D();
        this.meshGroupScale = Math.random() * 0.4 + 0.9;
        this.meshGroupScaleTarget = 1;
        this.scene.add(this.meshGroup);
    }

    generate() {
        this.simplex = new SimplexNoise();
        this.count = params.lines;
        this.stems = params.stems;
        this.edge = 0;


        for (let i = 0; i < this.count; i++) {
            // setup a new walker/wanderer
            let centered = Math.random() > 0.5;
            let walker = new Walker({
                simplex: this.simplex,
                total: params.iterations,
                x: centered ? 0 : Calc.rand(-1, 1),
                y: centered ? 0 : Calc.rand(-1, 1),
                dir: i / this.count * (Math.PI * 2 / this.stems),
                speed: 0,
                delta: params.noiseSpeed,
                angleRange: params.angleRange,
                away: 0,
                depth: Math.random() * params.depth + params.depth / 2,
                time: i * 1000
            });

            let geometry = new THREE.Geometry();
            let line = new MeshLine();

            // grab each path point and push it to the geometry
            for (let j = 0, len = walker.path.length; j < len; j++) {
                let p = walker.path[j];
                let x = p.x;
                let y = p.y;
                let z = p.z;
                this.edge = Math.max(this.edge, Math.abs(x), Math.abs(y));
                geometry.vertices.push(new THREE.Vector3(x, y, z));
            }

            // set the thickness of the line and assign the geometry
            line.setGeometry(geometry, p => {
                let size = 1;
                let n = size - Math.abs(Calc.map(p, 0, 1, -size, size)) + 0.1;
                return n;
            });

            // create new material based on the controls
            const plusOrMinus = Math.random() < 0.5 ? -1 : 1;
            const colorVariance = Math.floor(Math.random() * params.hueVariance) * plusOrMinus;
            const hue = (params.hue + colorVariance) % 360;
            let material = new MeshLineMaterial({
                blending: params.invert ? THREE.NormalBlending : THREE.AdditiveBlending,
                color: new THREE.Color(`hsl(${360 + hue + Calc.map(i, 0, this.count, -params.hueRange, params.hueRange)}, 100%, ${params.lightness}%)`),
                depthTest: false,
                opacity: 1,
                transparent: true,
                lineWidth: 0.04,
                resolution: this.resolution
            });


            // create meshes for all of the stems/reflections
            for (let k = 0; k < this.stems; k++) {
                let mesh = new THREE.Mesh(line.geometry, material);
                mesh.rotation.z = Calc.map(k, 0, this.stems, 0, Math.PI * 2);
                this.meshes.push(mesh);
                this.meshGroup.add(mesh);
            }
        }
        this.meshGroup.position.x = this.baseX;
        this.meshGroup.position.y = this.baseY;
        this.meshGroup.position.z = this.baseZ;
    }


    reset() {
        // empty out meshes array
        if (this.meshes) {
            this.meshes.length = 0;
        }

        // remove all children from mesh group
        if (this.meshGroup) {
            while (this.meshGroup.children.length) {
                this.meshGroup.remove(this.meshGroup.children[0]);
            }
        }
        this.progress = 0; // overall progress ticker
        this.progressed = false; // has run once
        this.progressModulo = 0; // resets progress on modulus
        this.progressEffective = 0; // progress amount to use
        this.progressEased = 0; // eased progress
        this.generate();

    }
}

class Generator {

    constructor() {
        this.setupCamera();
        this.setupScene();
        this.setupRenderer();
        this.setupOrbit();
        this.listen();
        this.onResize();
        this.init();
        this.reset();
        this.loop();
    }

    init() {
        this.flowers = [];
        for (let i = 0; i < params.flowerCount; i++) {
            this.flowers.push(new Flower(this.scene));
        }
    }

    setupCamera() {
        this.fov = 75;
        this.camera = new THREE.PerspectiveCamera(this.fov, 0, 0.01, 1000);
        this.camera.position.z = 10;
    }

    setupScene() {
        this.scene = new THREE.Scene();
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        document.body.appendChild(this.renderer.domElement);
    }

    setupOrbit() {
        this.orbit = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.orbit.enableDamping = true;
        this.orbit.dampingFactor = 0.2;
        this.orbit.enableKeys = false;
    }

    worldToScreen(vector, camera) {
        vector.project(camera);
        let cx = window.innerWidth / 2;
        let cy = window.innerHeight / 2;
        vector.x = vector.x * cx + cx;
        vector.y = -(vector.y * cy) + cy;
        return vector;
    }

    resetFlowers() {
        // while (this.scene.children.length > 0) {
        //     this.scene.remove(this.scene.children[0]);
        // }
        this.scene.remove.apply(this.scene, this.scene.children);
        this.init()
        this.reset()
    }

    reset() {
        // reset the camera        
        this.scene.background = params.invert ? new THREE.Color('#fff') : new THREE.Color('#000');
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.camera.position.z = 50;
        this.camera.lookAt(new THREE.Vector3());
        for (let i = 0; i < this.flowers.length; i++) {
            this.flowers[i].reset();
        }

        // requestAnimationFrame(() => {
        //     // scale until the flower roughly fits within the viewport
        //     let tick = 0;
        //     let exit = 50;
        //     let scale = 1;
        //     this.meshGroup.scale.set(scale, scale, scale);
        //     let scr = this.worldToScreen(new THREE.Vector3(0, this.edge, 0), this.camera);
        //     while (scr.y < window.innerHeight * 0.2 && tick <= exit) {
        //         scale -= 0.05;
        //         scr = this.worldToScreen(new THREE.Vector3(0, this.edge * scale, 0), this.camera);
        //         tick++;
        //     }
        //     this.meshGroupScaleTarget = scale;
        // });
    }

    listen() {
        window.addEventListener('resize', () => this.onResize());
    }

    onResize() {
        this.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
        this.dpr = window.devicePixelRatio > 1 ? 2 : 1;

        this.camera.aspect = this.resolution.x / this.resolution.y;
        this.camera.updateProjectionMatrix();

        this.renderer.setPixelRatio(this.dpr);
        this.renderer.setSize(this.resolution.x, this.resolution.y);
    }

    loop() {
        stats.begin();
        for (let iter = 0; iter < this.flowers.length; iter++) {

            const flower = this.flowers[iter];
            // if (flower.progress > progMax) {
            //     progMax = flower.progress;
            //     console.log(progMax)
            // }
            //Subtle rotation of flowers
            flower.meshGroup.rotation.x = Math.cos(Date.now() * 0.001) * 0.1;
            flower.meshGroup.rotation.y = Math.sin(Date.now() * 0.001) * -0.1;

            // handle all the funky progress math        
            flower.progress += flower.progressSpeed;
            if (flower.progress > 1) {
                flower.progressed = true;
            }
            flower.progressModulo = flower.progress % 2;
            flower.progressEffective = flower.progressModulo < flower.duration ? flower.progressModulo : 1 - (flower.progressModulo - 1);
            flower.progressEased = flower.progressed ? Ease.inOutExpo(flower.progressEffective, 0, flower.easeSpeed, flower.duration) : Ease.outExpo(flower.progressEffective, 0, flower.easeSpeed, flower.duration);

            // loop over all meshes and update their opacity and visibility
            let i = flower.meshes.length;
            while (i--) {
                let mesh = flower.meshes[i];
                mesh.material.uniforms.opacity.value = Calc.clamp(flower.progressEffective * 2, 0, 1);
                mesh.material.uniforms.visibility.value = flower.progressEased;
            }

            // ease the scale of the mesh
            flower.meshGroupScale += (flower.meshGroupScaleTarget - flower.meshGroupScale) * 0.3;
            flower.meshGroup.scale.set(flower.meshGroupScale, flower.meshGroupScale, flower.meshGroupScale);
        }

        // update orbit controls
        this.orbit.update();

        // render the scene and queue up another frame
        this.renderer.render(this.scene, this.camera);
        stats.end();
        window.requestAnimationFrame(() => this.loop());
    }
}


var generatorA = new Generator();
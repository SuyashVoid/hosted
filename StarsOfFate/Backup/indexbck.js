const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;

const colors = [
    'white',
    'rgba(0,235,255,0.5)',
    'rgba(74, 0, 224,0.5)'
];
const maxSize = 5;
const minSize = 0;
const downStep = 0.02;
const upStep = 3.3;
const moverRadius = 28;
let numParticles = 1800;

const connectSkip = 1;
const connectSizeLimit = 0.14;
const connectDistMultiplier = 5;

const dirUpStep = 0.04;
const dirDownStep = 0.003;

let particleArray;
var mover = {
    x: null,
    y: null,
}

var mover2 = {
    x: null,
    y: null,
}
var mover3 = {
    x: null,
    y: null,
}
var mover4 = {
    x: null,
    y: null,
}
var recognizedShape = {
    shape: null,
    iter: 0
}
var recognizedBuffer = new Queue();

window.addEventListener('mousemove',
    function(event) {
        mover3.x = event.x;
        mover3.y = event.y;
        //mover4.x = innerWidth - event.x;
        //mover4.y = event.y;
    })

window.addEventListener('mouseout', function() {
    //mover3.x = undefined;
    //mover3.y = undefined;
    //mover4.x = undefined;
    //mover4.y = undefined;
})

class Particle {
    constructor(x, y, baseX, baseY, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.baseX = baseX;
        this.baseY = baseY;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
        this.connectcolor = connectcolors[0];
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update() {
        // Switches direction of particle if it gets too close to edges
        if (this.x + this.size * 2 > canvas.width || this.x - this.size * 2 < 0) this.directionX = -this.directionX;
        if (this.y + this.size * 2 > canvas.height || this.y - this.size * 2 < 0) this.directionY = -this.directionY;
        this.x += this.directionX;
        this.y += this.directionY;

        //Recog shaped animation


        //Moving mechanism
        // if (Math.abs(this.x - mover.x) > moverRadius && Math.abs(this.y - mover.y) > moverRadius) {
        //     if (this.size < maxSize) this.size += 3;
        // } else if (this.size > minSize) this.size -= 0.1;
        if (mover.x - this.x < moverRadius && mover.x - this.x > -moverRadius && mover.y - this.y < moverRadius && mover.y - this.y > -moverRadius) {
            if (this.size < maxSize) this.size += upStep;
            this.connectcolor = connectcolors[0];
        } else if (this.size > 0) {
            if (this.size >= minSize + downStep) this.size -= downStep;
            else this.size = 0;
        }

        // Just copy this for multiple movers and change connect color for different colors
        if (mover2.x - this.x < moverRadius && mover2.x - this.x > -moverRadius && mover2.y - this.y < moverRadius && mover2.y - this.y > -moverRadius) {
            if (this.size < maxSize) this.size += upStep;
            this.connectcolor = connectcolors[1];
        } else if (this.size > 0) {
            if (this.size >= minSize + downStep) this.size -= downStep;
            else this.size = 0;
        }

        if (mover3.x - this.x < moverRadius && mover3.x - this.x > -moverRadius && mover3.y - this.y < moverRadius && mover3.y - this.y > -moverRadius) {
            if (this.size < maxSize) {
                this.size += upStep;
                this.directionX += dirUpStep * Math.sign(this.x - mover3.x);
                this.directionY += dirDownStep * Math.sign(this.y - mover3.y);
            }
            this.connectcolor = connectcolors[2];
        } else if (this.size > 0) {
            if (this.size >= minSize + downStep) {
                this.size -= downStep;
                this.directionX -= dirDownStep * Math.sign(this.x - mover3.x);
                this.directionY -= dirDownStep * Math.sign(this.y - mover3.y);
            } else {
                this.size = 0;
                this.x = this.baseX;
                this.y = this.baseY;
                this.directionX = (Math.random() * .1) - .05;
                this.directionY = (Math.random() * .1) - .05;
            }
        }

        if (mover4.x - this.x < moverRadius && mover4.x - this.x > -moverRadius && mover4.y - this.y < moverRadius && mover4.y - this.y > -moverRadius) {
            if (this.size < maxSize) this.size += upStep;
            this.connectcolor = connectcolors[3];
        } else if (this.size > 0) {
            if (this.size >= minSize + downStep) this.size -= downStep;
            else {
                this.size = 0;
                this.x = this.baseX;
                this.y = this.baseY;
            }
        }

        this.draw();
    }
}

const connectcolors = [
    'rgba(256,256,256,',
    'rgba(0, 0, 0,',
    'rgba(0, 206, 209,',
    'rgba(220, 20, 60,'
];

function connect() {
    for (let i = 0; i < particleArray.length; i += connectSkip) {
        for (let j = 0; j < particleArray.length; j += connectSkip) {
            if (particleArray[i].size > connectSizeLimit && particleArray[j].size > connectSizeLimit) {
                let distX = particleArray[i].x - particleArray[j].x;
                let distY = particleArray[i].y - particleArray[j].y;
                let dist = distX * distX + distY * distY;
                if (dist < (canvas.width / connectDistMultiplier) * (canvas.height / connectDistMultiplier)) {
                    let opacity = (particleArray[i].size + particleArray[j].size) / 30 - (dist / 150000);
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.strokeStyle = particleArray[i].connectcolor + opacity + ')';
                    ctx.moveTo(particleArray[i].x, particleArray[i].y);
                    ctx.lineTo(particleArray[j].x, particleArray[j].y);
                    ctx.stroke();
                }
            }
        }
    }
}

function init() {
    particleArray = [];
    for (let i = 0; i < numParticles; i++) {
        let size = 0;
        let x = (Math.random() * (window.innerWidth - size * 2) - (size * 2)) + size * 2;
        let y = (Math.random() * (window.innerHeight - size * 2) - (size * 2)) + size * 2;
        let directionX = (Math.random() * .1) - .05;
        let directionY = (Math.random() * .1) - .05;
        let color = Math.floor(Math.random() * colors.length);
        particleArray.push(new Particle(x, y, x, y, directionX, directionY, size, colors[color]));
    }
}

function drawShape(shape) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    let offset = shape.startPoint;
    for (let i = 0; i < shape.length - 1; i++) {
        ctx.beginPath();

        ctx.moveTo(shape.get(i).x + offset.x, shape.get(i).y + offset.y);
        ctx.lineTo(shape.get(i + 1).x + offset.x, shape.get(i + 1).y + offset.y);
        ctx.stroke();
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = 0; i < particleArray.length; i++) {
        particleArray[i].update();
    }
    connect();

}

window.addEventListener('resize', function() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    init();
})

init();
animate();
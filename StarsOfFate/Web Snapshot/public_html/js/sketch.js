let particles = [];
var startPosX=window.width/2,startPosY=window.height/2;

function setup() {
  createCanvas(windowWidth, windowHeight)
}

function draw() {
  background(0);
  for (let i = 0; i < 3; i++) {
    particles.push(new Particle(startPosX, startPosY));
  }

  for (let particle of particles) {
    let gravity = createVector(0, 0.2);
	let wind = createVector(0.1,0);
    particle.applyForce(gravity);	
	particle.applyForce(wind);
    particle.update();
    particle.show();
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].finished()) {
      particles.splice(i, 1);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
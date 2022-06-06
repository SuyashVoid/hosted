let particles = [];
var w = window.innerWidth;
var h = window.innerHeight; 

function setup() {
  canvas=createCanvas(w,h);
}

function draw() {
  background(0);
  for (let i = 0; i < 3; i++) {
    particles.push(new Particle(200, 20));
  }

  for (let particle of particles) {
    let gravity = createVector(0, 0.2);
    particle.applyForce(gravity);
    particle.update();
    particle.show();
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].finished()) {
      particles.splice(i, 1);
    }
  }
}

window.onresize = function() {
  // assigns new values for width and height variables
  w = window.innerWidth;
  h = window.innerHeight;  
  canvas.size(w,h);
}
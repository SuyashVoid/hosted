var lineGeo = new THREE.Geometry();
let turtlePos = new THREE.Vector3(0, -len * 4, 0);
lineGeo.vertices.push(turtlePos);


var angle;
var axiom = 'F';
var sentence = axiom;
var len = 20;

var rules = [];
rules[0] = {
    a: 'F',
    b: 'FF+[+F-F-F]-[-F+F+F]'
};

function generate() {
    len *= 0.5;
    var nextSentence = '';
    for (var i = 0; i < sentence.length; i++) {
        var current = sentence.charAt(i);
        var found = false;
        for (var j = 0; j < rules.length; j++) {
            if (current == rules[j].a) {
                found = true;
                nextSentence += rules[j].b;
                break;
            }
        }
        if (!found) {
            nextSentence += current;
        }
    }
    sentence = nextSentence;
    //createP(sentence);
    turtle();
}

function turtle() {
    //translate(width / 2, height);

    for (var i = 0; i < sentence.length; i++) {
        var current = sentence.charAt(i);

        if (current == 'F') {
            line(0, 0, 0, -len);
            translate(0, -len);
        } else if (current == '+') {
            rotate(angle);
        } else if (current == '-') {
            rotate(-angle);
        } else if (current == '[') {
            push();
        } else if (current == ']') {
            pop();
        }
    }
}

function test() {
    turtlePos.addVectors()
    var yAxis = new THREE.Vector3(0, 1, 0);
    var xAxis = new THREE.Vector3(1, 0, 0);
    turtlePos.
    turtlePos.normalize();
}

function render2() {
    stats.begin();
    renderer.render(scene, camera);

    stats.end();
    requestAnimationFrame(render2);
}

scene.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({
    color: 0x00ccff
})));
render2();
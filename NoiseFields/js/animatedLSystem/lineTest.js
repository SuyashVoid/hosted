var Wrule;
var paramsLSys = {
    iterations: 6,
    theta: 25,
    thetaRandomness: 0,
    angle: 0,
    scale: 0.6,
    scaleRandomness: 0,
    constantWidth: true,
    deltarota: 18
}


var rules = {
    axiom: "XF",
    allRules: {
        F: "FF",
        X: "F+[[X]-X]-F[-FX]+X",
        Y: "-FX"
    }
}



function GetAxiomTree() {
    var Waxiom = rules.axiom;
    var level = paramsLSys.iterations;
    while (level > 0) {
        var m = Waxiom.length;
        var T = '';
        for (var j = 0; j < m; j++) {
            var a = Waxiom[j];
            let found = false;
            for (const [key, value] of Object.entries(rules.allRules)) {
                if (a == key) {
                    found = true;
                    T += value;
                }
            }
            if (!found) T += a;
        }
        Waxiom = T;
        level--;
    }
    return Waxiom;
}

function DrawTheTree(geom, x_init, y_init, z_init, startIndex, endIndex) {
    let geometry = geom;
    let points = [];
    let n = Wrule.length;
    let stackA = [];
    let stackV = [];

    let theta = paramsLSys.theta * Math.PI / 180;
    let scale = paramsLSys.scale;
    let angle = paramsLSys.angle * Math.PI / 180;

    let x0 = x_init;
    let y0 = y_init;
    let z0 = z_init;
    let rota = 0,
        rota2 = 0,
        deltarota = params.deltarota * Math.PI / 180;
    let axis_x = new THREE.Vector3(1, 0, 0);
    let axis_y = new THREE.Vector3(0, 1, 0);
    let axis_z = new THREE.Vector3(0, 0, 1);
    let axis_delta = new THREE.Vector3(),
        prev_startpoint = new THREE.Vector3();

    let startpoint = new THREE.Vector3(x0, y0, z0),
        endpoint = new THREE.Vector3();
    let vector_delta = new THREE.Vector3(scale, scale, 0);
    points.push(startpoint.clone())
    let whereToEnd = Math.min(endIndex, n - (n / 5))
    for (let j = 0; j < whereToEnd; j++) {
        let a = Wrule[j];
        if (a == "+") {
            angle -= theta;
        }
        if (a == "-") {
            angle += theta;
        }
        if (a == "F") {
            let a = vector_delta.clone().applyAxisAngle(axis_z, angle);
            endpoint.addVectors(startpoint, a);

            if (j >= startIndex) {
                geometry.vertices.push(startpoint.clone());
                geometry.vertices.push(endpoint.clone());
                points.push(endpoint.clone())
            }

            prev_startpoint.copy(startpoint);
            startpoint.copy(endpoint);
            axis_delta = new THREE.Vector3().copy(a).normalize();
            rota += deltarota; // + (5.0 - Math.random()*10.0);
        }
        if (a == "L") {
            endpoint.copy(startpoint);
            endpoint.add(new THREE.Vector3(0, scale * 1.5, 0));
            let vector_delta2 = new THREE.Vector3().subVectors(endpoint, startpoint);
            vector_delta2.applyAxisAngle(axis_delta, rota2);
            endpoint.addVectors(startpoint, vector_delta2);

            if (j >= startIndex) {
                geometry.vertices.push(startpoint.clone());
                geometry.vertices.push(endpoint.clone());
                points.push(endpoint.clone())
            }


            rota2 += 25 * Math.PI / 180;
        }
        if (a == "%") {}
        if (a == "[") {
            stackV.push(new THREE.Vector3(startpoint.x, startpoint.y, startpoint.z));
            stackA[stackA.length] = angle;
        }
        if (a == "]") {
            let point = stackV.pop();
            startpoint.copy(new THREE.Vector3(point.x, point.y, point.z));
            angle = stackA.pop();
        }
        bush_mark = a;
    }
    return [points, geometry];
}
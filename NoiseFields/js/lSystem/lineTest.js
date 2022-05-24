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

function DrawTheTree(geom, x_init, y_init, z_init) {
    var geometry = geom;
    let points = [];
    var Wrule = GetAxiomTree();
    var n = Wrule.length;
    var stackA = [];
    var stackV = [];

    var theta = paramsLSys.theta * Math.PI / 180;
    var scale = paramsLSys.scale;
    var angle = paramsLSys.angle * Math.PI / 180;

    var x0 = x_init;
    var y0 = y_init;
    var z0 = z_init;
    var rota = 0,
        rota2 = 0,
        deltarota = params.deltarota * Math.PI / 180;
    var axis_x = new THREE.Vector3(1, 0, 0);
    var axis_y = new THREE.Vector3(0, 1, 0);
    var axis_z = new THREE.Vector3(0, 0, 1);
    var axis_delta = new THREE.Vector3(),
        prev_startpoint = new THREE.Vector3();

    var startpoint = new THREE.Vector3(x0, y0, z0),
        endpoint = new THREE.Vector3();
    var vector_delta = new THREE.Vector3(scale, scale, 0);
    points.push(startpoint.clone())

    for (var j = 0; j < n - (n / 5); j++) {
        var a = Wrule[j];
        if (a == "+") {
            angle -= theta;
        }
        if (a == "-") {
            angle += theta;
        }
        if (a == "F") {
            var a = vector_delta.clone().applyAxisAngle(axis_z, angle);
            endpoint.addVectors(startpoint, a);

            geometry.vertices.push(startpoint.clone());
            geometry.vertices.push(endpoint.clone());
            points.push(endpoint.clone())

            prev_startpoint.copy(startpoint);
            startpoint.copy(endpoint);
            axis_delta = new THREE.Vector3().copy(a).normalize();
            rota += deltarota; // + (5.0 - Math.random()*10.0);
        }
        if (a == "L") {
            endpoint.copy(startpoint);
            endpoint.add(new THREE.Vector3(0, scale * 1.5, 0));
            var vector_delta2 = new THREE.Vector3().subVectors(endpoint, startpoint);
            vector_delta2.applyAxisAngle(axis_delta, rota2);
            endpoint.addVectors(startpoint, vector_delta2);

            geometry.vertices.push(startpoint.clone());
            geometry.vertices.push(endpoint.clone());
            points.push(endpoint.clone())

            rota2 += 25 * Math.PI / 180;
        }
        if (a == "%") {}
        if (a == "[") {
            stackV.push(new THREE.Vector3(startpoint.x, startpoint.y, startpoint.z));
            stackA[stackA.length] = angle;
        }
        if (a == "]") {
            var point = stackV.pop();
            startpoint.copy(new THREE.Vector3(point.x, point.y, point.z));
            angle = stackA.pop();
        }
        bush_mark = a;
    }
    return [points, geometry];
}
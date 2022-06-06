const proximityRadius = 200;
let lastVibIntensity = [0, 0, 0, 0];
const topics = ["Phoebe/vib", "Suyash/vib", "Erica/vib", "Urshita/vib"]

var options = {
    clientId: 'Website' + Math.floor((Math.random() * 100) + 1),
    username: 'datt2010-physical-computing',
    password: 'physical2010computing'
}

const client = mqtt.connect('wss://datt2010-physical-computing.cloud.shiftr.io', options);


client.on('connect', function() {
    console.log('connected!');
    client.subscribe('Erica/angles');
    client.subscribe('Suyash/angles');
    client.subscribe('Urshita/angles');
    client.subscribe('Phoebe/angles');
});


const pixelStep = Math.trunc(this.innerWidth * this.innerHeight / 20000); // Move how many pixels every step
const ping = 1; //Update period, every 15ms
var interval1;
var interval2;
var interval3;
var interval4;
var interval5;
var interval6;
var interval7;
var interval8;
client.on('message', function(topic, message) {
    if (topic == "Phoebe/angles") {
        const angles = String(message).split(",");
        let x = Math.floor(scaleVal(parseFloat(angles[1]), -60, 60, 0, innerWidth));
        let y = Math.floor(scaleVal(parseFloat(angles[0]), -20, -80, 0, innerHeight));
        if (interval1 != null) clearInterval(interval1);
        if (interval2 != null) clearInterval(interval2);
        interval1 = setInterval(updateX, ping);
        let direction = Math.sign(x - mover.x);
        interval2 = setInterval(updateY, ping);
        let direction2 = Math.sign(y - mover.y);

        function updateX() {
            if (mover.x + pixelStep >= x && direction > 0) {
                mover.x = x;
                clearInterval(interval1);
            } else if (mover.x - pixelStep <= x && direction < 0) {
                mover.x = x;
                clearInterval(interval1);
            }
            mover.x += pixelStep * direction;
        }

        function updateY() {
            if (mover.y + pixelStep >= y && direction > 0) {
                mover.y = y;
                clearInterval(interval2);
            } else if (mover.y - pixelStep <= y && direction < 0) {
                mover.y = y;
                clearInterval(interval2);
            }
            mover.y += pixelStep * direction2;
        }
    }

    if (topic == "Suyash/angles") {
        const angles = String(message).split(",");
        let x = Math.floor(scaleVal(parseFloat(angles[0]), -60, 60, 0, innerWidth));
        let y = Math.floor(scaleVal(parseFloat(angles[1]), -20, -80, 0, innerHeight));
        if (interval3 != null) clearInterval(interval3);
        if (interval4 != null) clearInterval(interval4);
        interval3 = setInterval(updateX, ping);
        let direction = Math.sign(x - mover2.x);
        interval4 = setInterval(updateY, ping);
        let direction2 = Math.sign(y - mover2.y);

        function updateX() {
            if (mover2.x + pixelStep >= x && direction > 0) {
                mover2.x = x;
                clearInterval(interval3);
            } else if (mover2.x - pixelStep <= x && direction < 0) {
                mover2.x = x;
                clearInterval(interval3);
            }
            mover2.x += pixelStep * direction;
        }

        function updateY() {
            if (mover2.y + pixelStep >= y && direction > 0) {
                mover2.y = y;
                clearInterval(interval4);
            } else if (mover2.y - pixelStep <= y && direction < 0) {
                mover2.y = y;
                clearInterval(interval4);
            }
            mover2.y += pixelStep * direction2;
        }
    }

    if (topic == "Erica/angles") {
        const angles = String(message).split(",");
        let x = Math.floor(scaleVal(parseFloat(angles[0]), -80, 80, 0, innerWidth));
        let y = Math.floor(scaleVal(parseFloat(angles[1]), 10, -80, 0, innerHeight));
        if (interval5 != null) clearInterval(interval5);
        if (interval6 != null) clearInterval(interval6);
        interval5 = setInterval(updateX, ping);
        let direction = Math.sign(x - mover3.x);
        interval6 = setInterval(updateY, ping);
        let direction2 = Math.sign(y - mover3.y);

        function updateX() {
            if (mover3.x + pixelStep >= x && direction > 0) {
                mover3.x = x;
                clearInterval(interval5);
            } else if (mover3.x - pixelStep <= x && direction < 0) {
                mover3.x = x;
                clearInterval(interval5);
            }
            mover3.x += pixelStep * direction;
        }

        function updateY() {
            if (mover3.y + pixelStep >= y && direction > 0) {
                mover3.y = y;
                clearInterval(interval6);
            } else if (mover3.y - pixelStep <= y && direction < 0) {
                mover3.y = y;
                clearInterval(interval6);
            }
            mover3.y += pixelStep * direction2;
        }
    }

    if (topic == "Urshita/angles") {
        const angles = String(message).split(",");
        let x = Math.floor(scaleVal(parseFloat(angles[0]), 60, -60, 0, innerWidth));
        let y = Math.floor(scaleVal(parseFloat(angles[1]), -80, 10, 0, innerHeight));
        if (interval7 != null) clearInterval(interval7);
        if (interval8 != null) clearInterval(interval8);
        interval7 = setInterval(updateX, ping);
        let direction = Math.sign(x - mover4.x);
        interval8 = setInterval(updateY, ping);
        let direction2 = Math.sign(y - mover4.y);

        function updateX() {
            if (mover4.x + pixelStep >= x && direction > 0) {
                mover4.x = x;
                clearInterval(interval7);
            } else if (mover4.x - pixelStep <= x && direction < 0) {
                mover4.x = x;
                clearInterval(interval7);
            }
            mover4.x += pixelStep * direction;
        }

        function updateY() {
            if (mover4.y + pixelStep >= y && direction > 0) {
                mover4.y = y;
                clearInterval(interval8);
            } else if (mover4.y - pixelStep <= y && direction < 0) {
                mover4.y = y;
                clearInterval(interval8);
            }
            mover4.y += pixelStep * direction2;
        }
    }
    checkProximity();
});

function checkProximity() {
    let currentPositions = []
    if (mover.x == null || mover.y == null) currentPositions.push(new Coordinate(-1, -1))
    else currentPositions.push(new Coordinate(mover.x, mover.y))

    if (mover2.x == null || mover2.y == null) currentPositions.push(new Coordinate(-1, -1))
    else currentPositions.push(new Coordinate(mover2.x, mover2.y))

    if (mover3.x == null || mover3.y == null) currentPositions.push(new Coordinate(-1, -1))
    else currentPositions.push(new Coordinate(mover3.x, mover3.y))

    if (mover4.x == null || mover4.y == null) currentPositions.push(new Coordinate(-1, -1))
    else currentPositions.push(new Coordinate(mover4.x, mover4.y))

    //[new Coordinate(mover.x, mover.y), new Coordinate(mover2.x, mover2.y), new Coordinate(mover3.x, mover3.y), new Coordinate(mover4.x, mover4.y)]
    let vibIntensity = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (i != j && !currentPositions[i].isEmpty && !currentPositions[j].isEmpty) {
                if (Coordinate.distFindder(currentPositions[i], currentPositions[j]) < proximityRadius) vibIntensity[i]++;
            }
        }
        //console.log("Intent " + i + ": " + vibIntensity[i])
        if (vibIntensity[i] != lastVibIntensity[i]) client.publish(topics[i], vibIntensity[i] + "")
    }
    lastVibIntensity = vibIntensity.slice() // Copies vibIntensity to lastVibIntensity.
}



function scaleVal(value, inMin, inMax, outMin, outMax) {
    const result = (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

    if (result < outMin) {
        return outMin;
    } else if (result > outMax) {
        return outMax;
    }

    return result;
}
var options = {
    clientId: 'Website' + Math.floor((Math.random() * 100) + 1),
    username: 'datt2010-physical-computing',
    password: 'physical2010computing'
}

const client = mqtt.connect('wss://datt2010-physical-computing.cloud.shiftr.io', options);


client.on('connect', function() {
    console.log('connected!');
    client.subscribe('Suyash/x');
    client.subscribe('Suyash/y');
    client.subscribe('Phoebe/x');
    client.subscribe('Phoebe/y');
    client.subscribe('Erica/x');
    client.subscribe('Erica/y');
    client.subscribe('Urshita/x');
    client.subscribe('Urshita/y');
});


const pixelStep = 2; // Move how many pixels every step
const ping = 5; //Update period, every 15ms
var interval;
var interval2;
var interval3;
var interval4;
var interval5;
var interval6;
var interval7;
var interval8;
client.on('message', function(topic, message) {
    if (topic == "Phoebe/x") {
        //startPosX = scaleValue(parseFloat(message),0,window.width);
        let a = Math.floor(scaleVal(parseFloat(message), -80, 80, 0, innerWidth));
        if (interval != null) clearInterval(interval);
        interval = setInterval(update, ping);
        let direction = Math.sign(a - mover.x);

        function update() {
            if (mover.x + pixelStep >= a || mover.x - pixelStep <= a) {
                mover.x = a;
                clearInterval(interval);
            }
            mover.x += pixelStep * direction;
        }
    }
    if (topic == "Phoebe/y") {
        let b = Math.floor(scaleVal(parseFloat(message), -80, 80, 0, innerHeight));
        if (interval2 != null) clearInterval(interval2)
        interval2 = setInterval(update2, ping);
        let direction = Math.sign(b - mover.y);

        function update2() {
            if (mover.y + pixelStep >= b || mover.y - pixelStep <= b) {
                mover.y = b;
                clearInterval(interval2);
            }
            mover.y += pixelStep * direction;
        }
    }
    if (topic == "Suyash/x") {
        let b = Math.floor(scaleVal(parseFloat(message), -80, 80, 0, innerWidth));
        if (interval3 != null) clearInterval(interval3)
        interval3 = setInterval(update2, ping);
        let direction = Math.sign(b - mover2.x);

        function update2() {
            if (mover2.x + pixelStep >= b || mover2.x - pixelStep <= b) {
                mover2.x = b;
                clearInterval(interval3);
            }
            mover2.x += pixelStep * direction;
        }
    }

    if (topic == "Suyash/y") {
        let b = Math.floor(scaleVal(parseFloat(message), -80, 80, 0, innerHeight));
        if (interval4 != null) clearInterval(interval4)
        interval4 = setInterval(update2, ping);
        let direction = Math.sign(b - mover2.y);

        function update2() {
            if (mover2.y + pixelStep >= b || mover2.y - pixelStep <= b) {
                mover2.y = b;
                clearInterval(interval4);
            }
            mover2.y += pixelStep * direction;
        }
    }

    if (topic == "Erica/x") {
        let b = Math.floor(scaleVal(parseFloat(message), -80, 80, 0, innerWidth));
        if (interval5 != null) clearInterval(interval5)
        interval5 = setInterval(update2, ping);
        let direction = Math.sign(b - mover3.x);

        function update2() {
            if (mover3.x + pixelStep >= b || mover3.x - pixelStep <= b) {
                mover3.x = b;
                clearInterval(interval5);
            }
            mover3.x += pixelStep * direction;
        }
    }

    if (topic == "Erica/y") {
        let b = Math.floor(scaleVal(parseFloat(message), 10, -80, 0, innerHeight));
        if (interval6 != null) clearInterval(interval6)
        interval6 = setInterval(update2, ping);
        let direction = Math.sign(b - mover3.y);

        function update2() {
            if (mover3.y + pixelStep >= b || mover3.y - pixelStep <= b) {
                mover3.y = b;
                clearInterval(interval6);
            }
            mover3.y += pixelStep * direction;
        }
    }

    if (topic == "Urshita/x") {
        let b = Math.floor(scaleVal(parseFloat(message), -80, 80, 0, innerWidth));
        if (interval7 != null) clearInterval(interval7)
        interval7 = setInterval(update2, ping);
        let direction = Math.sign(b - mover4.x);

        function update2() {
            if (mover4.x + pixelStep >= b || mover4.x - pixelStep <= b) {
                mover4.x = b;
                clearInterval(interval7);
            }
            mover4.x += pixelStep * direction;
        }
    }

    if (topic == "Urshita/y") {
        let b = Math.floor(scaleVal(parseFloat(message), -80, 80, 0, innerHeight));
        if (interval8 != null) clearInterval(interval8)
        interval8 = setInterval(update2, ping);
        let direction = Math.sign(b - mover4.y);

        function update2() {
            if (mover4.y + pixelStep >= b || mover4.y - pixelStep <= b) {
                mover4.y = b;
                clearInterval(interval8);
            }
            mover4.y += pixelStep * direction;
        }
    }
});

document.addEventListener("DOMContentLoaded", function(event) { // Removes Ukraine disclaimer
    document.getElementsByClassName('disclaimer')[0].style.display = "none";
});

function scaleVal(value, inMin, inMax, outMin, outMax) {
    const result = (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

    if (result < outMin) {
        return outMin;
    } else if (result > outMax) {
        return outMax;
    }

    return result;
}
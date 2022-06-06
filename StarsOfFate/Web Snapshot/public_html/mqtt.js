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


const pixelStep = 28; // Move how many pixels every step
const ping = 20; //Update period, every 15ms
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
        let y = Math.floor(scaleVal(parseFloat(angles[0]), -20, 80, 0, innerWidth));
        let x = Math.floor(scaleVal(parseFloat(angles[1]), 60, -60, 0, innerHeight));
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
        let y = Math.floor(scaleVal(parseFloat(angles[1]), 40, -60, 0, innerHeight));
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
        let x = Math.floor(scaleVal(parseFloat(angles[0]), -80, 80, 0, innerWidth));
        let y = Math.floor(scaleVal(parseFloat(angles[1]), 10, -80, 0, innerHeight));
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
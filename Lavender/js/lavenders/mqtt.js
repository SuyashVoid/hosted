const topics = ["Lavender/CO2", "Lavender/wind", "Lavender/x", "Lavender/z"]
const host = "lavendertest.cloud.shiftr.io"

var options = {
    clientId: 'LavenderUser',
    username: 'lavendertest',
    password: 'supposedPassword'
}

console.log('connecting to ' + host + ' ...');
const client = mqtt.connect('wss://'+host, options);

client.on('connect', function() {
    console.log('connected!');
    for (var i = 0; i < topics.length; i++) {
        client.subscribe(topics[i]);
    }
});

var options = {
    clientId: 'Website' + Math.floor((Math.random() * 100) + 1),
    username: 'datt2010-physical-computing',
    password: 'physical2010computing'
}
const client = mqtt.connect('wss://datt2010-physical-computing.cloud.shiftr.io', options);
document.addEventListener("DOMContentLoaded", function(event) { 	// Removes Ukraine disclaimer
  document.getElementsByClassName('disclaimer')[0].style.display="none";
});

client.on('connect', function() {
    console.log('connected!');
    client.subscribe('Suyash/x');
    client.subscribe('Suyash/y');    
});

client.on('message', function(topic, message) {    
    if (topic == "Suyash/x") //do something with 'message';
    if (topic == "Suyash/y") //do something with 'message';    
});
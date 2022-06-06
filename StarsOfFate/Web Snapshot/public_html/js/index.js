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
});



client.on('message', function(topic, message) {    
    if (topic == "Suyash/x"){
		//startPosX = scaleValue(parseFloat(message),0,window.width);
		let a = scaleVal(parseFloat(message),-80,80,0,window.width);		
		startPosX = a;
	} 
    if (topic == "Suyash/y"){
		let b = scaleVal(parseFloat(message),-80,80,0,window.height);		
		startPosY = b;
	}
});

document.addEventListener("DOMContentLoaded", function(event) { 	// Removes Ukraine disclaimer
  document.getElementsByClassName('disclaimer')[0].style.display="none";
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
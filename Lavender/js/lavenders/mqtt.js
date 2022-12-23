import { resetSystem, updateColors, updateSizes} from "./index.js";
//poetryai:605k8jiP5ZQXyMEJ@poetryai.cloud.shiftr.io

const host = "poetryai.cloud.shiftr.io"
var options = {
    clientId: 'LavenderUser'+Math.random()*1000,
    username: 'poetryai',
    password: '605k8jiP5ZQXyMEJ'
}
const topics = ["Lavender/wind", "Lavender/temp", "Lavender/co2", "Lavender/light", "Lavender/humidity", "Lavender/rain"]

const topicLimits = {
    "wind": {
        min: 200,
        max: 700
    },
    "temp": {
        min: 0,
        max: 40,        
    },
    // 800 : should give 2.5 value
    "co2": {
        min: 350,
        max: 1000
    },
    "light": {
        min: 0,
        max: 4096
    },
    "humidity": {
        min: 0,
        max: 100
    },
    "rain": {
        min: 0,
        max: 4096
    }
}
const paramLimits = {
    "wind":{
        "strayParticleSpeed": {min: 0.01, max: 0.086},
        "strayNoiseScale": {min: 0.015, max: 0.21},
        "strayNoiseSpeed": {min: 0.23, max: 2.72},
        "lifeDivider": {min: 450, max: 900},
    },
    "temp":{
        
        "particleMultiplier": {min: 1.5, max: 3}
    },    
    "co2":{
        "sizeMultiplier": {min: 1.2, max: 2.9},
        "noiseScale": {min: 0.006, max: 0.2},
        "noiseStrength": {min: 0.9, max: 1.9},
    },
    // Invert lights 
    "light":{
        "bgGradient2": {min: "0x473B68", max: "0xA082F2"}
    },
    "rain":{
        "strayParticles": {min: 0.04, max: 0.1},
        // Particle color 2 :  - 0087fc
        // 0087fc - 0x4805E6
        "particleColor": {min: "0x4805E6", max: "0x0514E6"}
    }
}
 
const resetThreshold = 0.1; // Only reset system (for particle count/ stray particle count) if chnage is greater than this threshold (% of max change 0 being 0%, 1 being 100%)
const humidityThreshold = 88;
let currentHumidity = 30;
console.log('connecting to ' + host + ' ...');
const client = mqtt.connect('wss://'+host, options);

client.on('connect', function() {
    console.log('connected!');
    for (var i = 0; i < topics.length; i++) {
        client.subscribe(topics[i]);
    }
});


client.on('message', function(topic, message) {
    console.log("\nTOPIC: ",topic);
    for(let i = 0; i < topics.length; i++){
        if(topic == topics[i]){            
            const value = parseInt(message);   
            if(topic == "Lavender/humidity"){
                if(value > humidityThreshold && currentHumidity < humidityThreshold){                    
                    params.particleColor2 = 0x0087fc;
                    currentHumidity = value;
                    updateColors();
                }else if(value < humidityThreshold && currentHumidity > humidityThreshold){
                    params.particleColor2 = 0x49c115;
                    currentHumidity = value;
                    updateColors();
                }
            }               
            const param = topics[i].split("/")[1];
            const topicLimit = topicLimits[param];
            for(const parameter in paramLimits[param]){
                const paramLimit = paramLimits[param][parameter];                
                liveUpdate(value,parameter, topicLimit, paramLimit)                                
            }                  
            
        }
    }
    
});


// This function handles special cases of parameters that need to be updated in a different way
function liveUpdate(value, parameter, topicLimit, paramLimit){
    let scaledValue

    if(parameter == "bgGradient2" || parameter == "particleColor"){
        const ratio = scaleVal(value, topicLimit.min, topicLimit.max, 0, 1);
        if(parameter == "bgGradient2")
        scaledValue = lerpColor(paramLimit.min, paramLimit.max, ratio,"css");
        else
        scaledValue = lerpColor(paramLimit.min, paramLimit.max, ratio,"hex");
        params[parameter] = scaledValue;
        updateColors();
    }else{
        scaledValue = scaleVal(value, topicLimit.min, topicLimit.max, paramLimit.min, paramLimit.max);
        if(parameter == "strayParticles" || parameter=="particleMultiplier"){
            if(isInThreshold(params[parameter], scaledValue, paramLimit.max, paramLimit.min)){
                if(scaleVal(value, topicLimit.min, topicLimit.max, 0, 1) < 0.13){
                    if(parameter == "strayParticles"){                        
                            params[parameter] = paramLimit.min;
                            resetSystem();                        
                    }else {
                        params[parameter] = paramLimit.min;
                        resetSystem();
                    }
                    
                }else{
                    if(parameter == "strayParticles"){                        
                            params[parameter] = paramLimit.min;
                            resetSystem();                        
                    }else{
                        params[parameter] = scaledValue;
                        resetSystem();
                    } 
                }
            }
        }else if(parameter == "lifeDivider"){            
            scaledValue = scaleVal(value, topicLimit.min, topicLimit.max, paramLimit.min, paramLimit.max);
            scaledValue = paramLimit.max - scaledValue + paramLimit.min;
            params[parameter] = scaledValue;
        }else
        {
            params[parameter] = scaledValue;
        }
        if(parameter == "sizeMultiplier")updateSizes();

    }
    
    console.log(parameter, scaledValue);
}

function isInThreshold(a, b,max,min){
    return Math.abs(a-b)/Math.abs(max-min)>resetThreshold;
}

function scaleVal(value, inMin, inMax, outMin, outMax) {
    if(value < inMin) value = inMin;
    if(value > inMax) value = inMax;
    const result = (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

    if (result < outMin) {
        return outMin;
    } else if (result > outMax) {
        return outMax;
    }

    return result;
}

function lerpColor(pFrom, pTo, pRatio,outputFormat="hex") {
    const ar = (pFrom & 0xFF0000) >> 16,
          ag = (pFrom & 0x00FF00) >> 8,
          ab = (pFrom & 0x0000FF),

          br = (pTo & 0xFF0000) >> 16,
          bg = (pTo & 0x00FF00) >> 8,
          bb = (pTo & 0x0000FF),

          rr = ar + pRatio * (br - ar),
          rg = ag + pRatio * (bg - ag),
          rb = ab + pRatio * (bb - ab);

          if(outputFormat == "css")
            return `#${((rr << 16) + (rg << 8) + (rb | 0)).toString(16).padStart(6, '0').slice(-6)}`;
            else
            return (rr << 16) + (rg << 8) + (rb | 0);        
};

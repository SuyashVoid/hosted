const bufferSize = 20;
const recordFreq = 1000;
const dequeTimeout = 10;
let iter = [0, 0, 0, 0];
const bufferEnqueueTolerance = 6;
const shapeDistTolerance = 20; // How much distance there should be for 2 points to be considered distinct.
const lineJointhreshold = 160 / 180 * Math.PI; //Just change '20' in degrees as needed.
const comparisionThreshold = 0.8;
let moveHistory = [new Queue(bufferSize), new Queue(bufferSize), new Queue(bufferSize), new Queue(bufferSize)];
let lastPos = [new Coordinate(0, 0), new Coordinate(0, 0), new Coordinate(0, 0), new Coordinate(0, 0)];


//let matcher = setInterval(record, recordFreq);
//let matcher;
let presetObjectified = [];
for (let i = 0; i < presets.length; i++) {
    presetObjectified.push(new lineSet(JSON.parse(presets[i])))
        //presetObjectified.push(JSON.parse(presets[0]))
}




function processBuffer(history) {

    const offsetData = offsetFinder(history)
    const prettyShape = offsetToShape(offsetData[0], offsetData[1]);

    if (prettyShape.length < 3) return;

    const set = shapeToLineSet(prettyShape);
    for (let i = 0; i < presetObjectified.length; i++) {
        const comparision = compareLineSets(presetObjectified[i], set)
        if (comparision > comparisionThreshold) {
            recognizedBuffer.enqueue(prettyShape);
            history.clear();
            break;
        }
    }
    //if (comparision < 0.5) moveHistory.clear();
}

function processRecord(history) {
    const offsetData = offsetFinder(history)
    const prettyShape = offsetToShape(offsetData[0], offsetData[1]);
    if (prettyShape.length < 3) return;
    const set = shapeToLineSet(prettyShape);
    drawLineSet(set, 'rgba(0,0,0,1)');
    drawShape(prettyShape, 'rgba(256,256,256,1)');
    return set;
    //recognizedBuffer.enqueue(prettyShape);
}


// Finds the offset from start point
function offsetFinder(history) {
    let offsets = [];
    let lastOrdinate = history.get(0);
    for (let i = 0; i < bufferSize; i++) {
        const iter = history.get(i);
        if (iter !== undefined) {
            if (lastOrdinate === undefined) lastOrdinate = iter; // Sets the first defined of series as 'lastordinate'            
            offsets.push(new Coordinate(iter.x - lastOrdinate.x, iter.y - lastOrdinate.y));
        }
    }
    return [offsets, lastOrdinate];
}

// Removes point with too little distance b/w them and make a shape object
function offsetToShape(offsets, lastOrdinate) {
    let originOffset = new Coordinate(0, 0);
    let shape = new Shape(offsets[0]);
    shape.startPoint = lastOrdinate;
    for (let i = 0; i < offsets.length - 1; i++) {
        if (Coordinate.distFindder(offsets[i], offsets[i + 1]) > shapeDistTolerance) {
            shape.connect(offsets[i + 1]);
            originOffset.x = Math.min(originOffset.x, offsets[i + 1].x);
            originOffset.y = Math.min(originOffset.y, offsets[i + 1].y);
        } else i++; // Skip next point if dist b/w this and next is too small
    }
    shape.originOffset = originOffset;
    //shape.normalize();
    return shape;
}


// This is different from shape as only 'important' nodes are kept, rest are discarded (very high angles are discarded)
function shapeToLineSet(shape) { // Shape has to have at least 3 points
    let lines = new lineSet();
    if (shape.length < 3) {
        console.log("bye")
        return;
    }
    let nextLine = new Line(shape.getNormalized(0), shape.getNormalized(1));
    for (let i = 0; i < shape.length - 2;) { // Reference assignment might cause problmes look into that if it happens.
        let thisLine = nextLine;
        nextLine = new Line(shape.getNormalized(i + 1), shape.getNormalized(i + 2));
        let angle = Line.getRadians(thisLine, nextLine);
        let pointsSkipped = 1;
        while (angle > lineJointhreshold && i + pointsSkipped < shape.length - 2) {
            thisLine = new Line(shape.getNormalized(i), shape.getNormalized(i + pointsSkipped + 1));
            nextLine = new Line(shape.getNormalized(i + pointsSkipped + 1), shape.getNormalized(i + pointsSkipped + 2));
            angle = Line.getRadians(thisLine, nextLine);
            pointsSkipped++;
        }
        i += pointsSkipped;
        lines.push(thisLine, angle);
    }
    lines.push(nextLine, 0);
    return lines;
}

function compareLineSets(setA, setB, endpointTolerance = 40, lengthTolerance = 100, angleTolerance = 2, edgeCountTolerance = 3) {
    // Endpoint tolerance is max amount of pixels the sart and endpoints can be away from each other for 2 shapes. Shouldn't be too high
    //      E.g if one point is (10,15) and other is (11,13) then their distance from each other is calculated and compared with tolerance. 20 pixels is a good start
    // lengthTolerance is the max amount of difference 2 shapes' length can have from each other
    // angleTolerance is max difference b/w angle sum of both shapes
    //      It is bit tricky as I am just summing up all angles right now and it can somewhat represent the complexity of shape but not exactly how each line and edge
    //      are related to each other since sampling can be quite different for each shape
    // edgeCountTolerance as name suggests is the max number of edge difference tolerable
    //      This one can be a little weird too because the sampling of movement can be quite tricky to match in separate attempts. Shouldn't be too high. 5?

    // This is percent division of what contributes how much to comparision.
    const startWeight = 0.15;
    const endWeight = 0.15;
    const lengthWeight = 0.4;
    const edgeCountWeight = 0.1;
    const angleWeight = 0.2;

    let dataA = setA.perimeter();
    let dataB = setB.perimeter();

    // Endpoints
    let startA = setA.get(0).line.pointA;
    let startB = setB.get(0).line.pointA;
    let endA = setA.get(setA.length - 1).line.pointB;
    let endB = setB.get(setB.length - 1).line.pointB;
    // Lengths
    let lengthA = dataA[0];
    let lengthB = dataB[0];
    // Angles
    let angleA = dataA[1];
    let angleB = dataB[1];
    // 
    let edgesA = dataA.length;
    let edgesB = dataB.length;

    // Here I am checking start of 1st shape with start of 2nd but also the start of 1st with end of 2nd. That way, if it's the same pattern in reverse. It gets recognized
    let startFactor = Math.max(boolToInt(Coordinate.compare(startA, startB, endpointTolerance)), boolToInt(Coordinate.compare(startA, endB, endpointTolerance))) * startWeight;
    let endFactor = Math.max(boolToInt(Coordinate.compare(endA, endB, endpointTolerance)), boolToInt(Coordinate.compare(endA, startB, endpointTolerance))) * endWeight;

    let lengthFactor = boolToInt(Math.abs(lengthA - lengthB) < lengthTolerance) * lengthWeight;
    let angleFactor = boolToInt(Math.abs(angleA - angleB) < angleTolerance) * angleWeight;
    let edgeCountFactor = boolToInt(Math.abs(edgesA - edgesB) < edgeCountTolerance) * edgeCountWeight;

    //console.log(startFactor + ", " + endFactor + ", " + lengthFactor + ", " + angleFactor + ", " + edgeCountFactor)
    return startFactor + endFactor + lengthFactor + angleFactor + edgeCountFactor;

}

function boolToInt(bool) {
    if (bool) return 1;
    else return 0;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function record() {

    if ((mover.x !== undefined && mover.y !== undefined) || (mover.x != null && mover.y != null)) {
        if (Math.abs(mover.x - lastPos[0].x) > bufferEnqueueTolerance || Math.abs(mover.y - lastPos[0].y) > bufferEnqueueTolerance) {
            lastPos[0].x = mover.x;
            lastPos[0].y = mover.y;
            moveHistory[0].enqueue(new Coordinate(lastPos[0]));
        } else iter[0]++;
    }

    if ((mover2.x !== undefined && mover2.y !== undefined) || (mover2.x != null && mover2.y != null)) {
        if (Math.abs(mover2.x - lastPos[1].x) > bufferEnqueueTolerance || Math.abs(mover2.y - lastPos[1].y) > bufferEnqueueTolerance) {
            lastPos[1].x = mover2.x;
            lastPos[1].y = mover2.y;
            moveHistory[1].enqueue(new Coordinate(lastPos[1]));
        } else iter[1]++;
    }

    if ((mover3.x !== undefined && mover3.y !== undefined) || (mover3.x != null && mover3.y != null)) {
        if (Math.abs(mover3.x - lastPos[2].x) > bufferEnqueueTolerance || Math.abs(mover3.y - lastPos[2].y) > bufferEnqueueTolerance) {
            lastPos[2].x = mover3.x;
            lastPos[2].y = mover3.y;
            moveHistory[2].enqueue(new Coordinate(lastPos[2]));
        } else iter[2]++;
    }

    if ((mover4.x !== undefined && mover4.y !== undefined) || (mover4.x != null && mover4.y != null)) {
        if (Math.abs(mover4.x - lastPos[3].x) > bufferEnqueueTolerance || Math.abs(mover4.y - lastPos[3].y) > bufferEnqueueTolerance) {
            lastPos[3].x = mover4.x;
            lastPos[3].y = mover4.y;
            moveHistory[3].enqueue(new Coordinate(lastPos[3]));
        } else iter[3]++;
    }




    for (let i = 0; i < 4; i++) {
        if (iter[i] == dequeTimeout) {
            iter[i] = 0;
            moveHistory[i].clear();
        }
        if (moveHistory[i].length > 15) processBuffer(moveHistory[i]);

    }
    moveHistory.forEach(history => {

    });
}

window.addEventListener('mousedown', function() {
    html2canvas(document.querySelector('#canvas1')).then(function(canvas) {
        saveAs(canvas.toDataURL(), 'StarsOfFate.png');
    });
    // var dataURL = canvas.toDataURL("image/png");

    moveHistory.clear();
})

function saveAs(uri, filename) {

    var link = document.createElement('a');

    if (typeof link.download === 'string') {

        link.href = uri;
        link.download = filename;

        //Firefox requires the link to be in the body
        document.body.appendChild(link);

        //simulate click
        link.click();

        //remove the link when done
        document.body.removeChild(link);

    } else {

        window.open(uri);

    }
}



// function record() {
//     if (mover3.x !== undefined || mover3.y !== undefined)
//         moveHistory.enqueue(new Coordinate(mover3.x, mover3.y));
// }

// window.addEventListener('mousedown', function() {
//     //console.log(processBuffer(moveHistory));
//     moveHistory.clear();
//     ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

//     matcher = setInterval(record, recordFreq)
// })

// window.addEventListener('mouseup', function() {
//     //drawLineSet(presetObjectified[1], 'rgba(0,0,0,1)');
//     this.clearInterval(matcher);
//     console.log(JSON.stringify(processRecord(moveHistory)))
// })
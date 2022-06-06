const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;
const lineJointhreshold = 160 / 180 * Math.PI; //Just change '20' in degrees as needed.
//const lineJointhreshold = 150; //Just change '20' in degrees as needed.

let A = new Coordinate(200, 0)
let B = new Coordinate(0, 300)
let C = new Coordinate(200, 600)
let D = new Coordinate(800, 600)
let E = new Coordinate(1000, 300)
let poly = new Shape(A);

let A2 = new Coordinate(100 + getRandomInt(50), 3)
let B2 = new Coordinate(9 + getRandomInt(20), 293)
let C2 = new Coordinate(64, 442 + getRandomInt(20))
let D2 = new Coordinate(242, 623 + getRandomInt(20))
let E2 = new Coordinate(511 + getRandomInt(20), 627 + getRandomInt(20))
let F2 = new Coordinate(823 + getRandomInt(20), 584)
let G2 = new Coordinate(1017, 311 + getRandomInt(20))
let H2 = new Coordinate(1217, 411)
poly.startPoint = new Coordinate(210 + getRandomInt(20), 210 + getRandomInt(20))
poly.connect(B)
poly.connect(C)
poly.connect(D)
poly.connect(E)

let poly2 = new Shape(A2);
poly2.startPoint = new Coordinate(190, 190)
poly2.connect(B2)
poly2.connect(C2)
poly2.connect(D2)
poly2.connect(E2)
poly2.connect(F2)
poly2.connect(G2)
    //poly2.connect(H2)

let lineData = shapeToLineSet(poly);
let lineData2 = shapeToLineSet(poly2);
//console.log(lineData.perimeter() + ", " + lineData2.perimeter())
drawLineSet(lineData, 'rgba(256,256,256,1)');
drawLineSet(lineData2, 'rgba(256,55,56,1)');

console.log(compareLineSets(lineData, lineData2))

//drawShape(poly, 'rgba(256,256,256,1)');
//drawShape(poly2, 'rgba(256,0,256,1)');




function shapeToLineSet(shape) { // Shape has to have at least 3 points
    let lines = new lineSet();
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

function compareLineSets(setA, setB, endpointTolerance = 40, lengthTolerance = 100, angleTolerance = 2, edgeCountTolerance = 5) {
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

    let startFactor = boolToInt(Coordinate.compare(startA, startB, endpointTolerance)) * startWeight;
    let endFactor = boolToInt(Coordinate.compare(endA, endB, endpointTolerance)) * endWeight;

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

function drawShape(shape, color) {
    //ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    let offset = shape.startPoint;
    for (let i = 0; i < shape.length - 1; i++) {
        ctx.beginPath();
        ctx.arc(shape.get(i).x + offset.x, shape.get(i).y + offset.y, 5, 0, 2 * Math.PI);
        ctx.moveTo(shape.get(i).x + offset.x, shape.get(i).y + offset.y);
        ctx.lineTo(shape.get(i + 1).x + offset.x, shape.get(i + 1).y + offset.y);
        ctx.stroke();
    }
}

function drawLineSet(lineSet, color) {
    //ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.strokeStyle = color;
    for (let i = 0; i < lineSet.length; i++) {
        drawLine(lineSet.get(i).line, new Coordinate(200, 200));
    }
}

function drawLine(line, offset) {
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(line.pointA.x + offset.x, line.pointA.y + offset.y, 5, 0, 2 * Math.PI);
    ctx.moveTo(line.pointA.x + offset.x, line.pointA.y + offset.y);

    ctx.lineTo(line.pointB.x + offset.x, line.pointB.y + offset.y);
    ctx.stroke();
}
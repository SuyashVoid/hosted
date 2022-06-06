class Queue {
    constructor() {
        this.elements = {};
        this.head = 0;
        this.tail = 0;
    }
    enqueue(element) {
        if (this.tail - this.head >= bufferSize) {
            this.dequeue();
        }

        this.elements[this.tail] = element;
        this.tail++;
    }
    dequeue() {
        const item = this.elements[this.head];
        delete this.elements[this.head];
        this.head++;
        return item;
    }
    get(num) {
        return this.elements[this.head + num];
    }
    get length() {
        return this.tail - this.head;
    }
    get isEmpty() {
        return this.length === 0;
    }
}

class Coordinate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get toString() {
        return "(" + this.x + ", " + this.y + ")";
    }
    static distFindder(a, b) {
        // Simple distane b/w 2 points
        return parseFloat(Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)).toFixed(2));
        //return Math.round((Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)) + Number.EPSILON) * 100) / 100
    }
}

class Line {
    constructor(pointA, pointB) {
        this.pointA = pointA;
        this.pointB = pointB;
    }
    get vector() {
        return new Coordinate(this.pointB.x - this.pointA.x, this.pointB.y - this.pointA.y);
    }
    get magnitude() {
        const vec = this.vector;
        return Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2))
    }
    static getAngle(lineA, lineB) { // These 2 lines must have a common point between them for practical use
        const dotProduct = lineA.vector.x * lineB.vector.x + lineA.vector.y * lineB.vector.y;
        const magnitudeProduct = lineA.magnitude * lineB.magnitude;
        let arcCosTheta = dotProduct / magnitudeProduct;
        if (arcCosTheta > 1) arcCosTheta = 1; // Since calculations are approximated somewhat, boundaries can be exceeded by very small margin and causes NaN in acos()
        if (arcCosTheta < -1) arcCosTheta = -1;
        return Math.acos(arcCosTheta)
    }
    static join(lineA, lineB) { // If a,b have points A->B->C, then join to make a line that is A->C
        return new Line(lineA.pointA, lineB.pointB);
    }
}

class lineSet { // It has an array in it which contains a struct/mini-object with line and it's angle with next line as keys.
    constructor() {
        this.dataSet = [];
    }
    push(newLine, newAngle) {
        this.dataSet.push({ line: newLine, angle: newAngle })
    }
    get(num) {
        this.dataSet[num];
    }
}

class Shape {
    constructor(startVertex) {
        this.vertices = [];
        this.vertices.push(startVertex);
        this.originOffset = new Coordinate(0, 0);
        this.startPoint = new Coordinate(0, 0);
    }
    connect(vertex) {
        this.vertices.push(vertex);
    }
    get toString() {
        return this.vertices.toString;
    }
    get length() {
        return this.vertices.length;
    }
    get(num) { // Returns raw values
        return this.vertices[num];
    }
    getOriginal(num) { // Returns the exact co-ordinate where it was recorded.
        return new Coordinate(this.vertices[num].x + this.startPoint.x, this.vertices[num].y + this.startPoint.y);
    }
    getNormalized(num) { // Returns non negative values        
        return new Coordinate(this.vertices[num].x + Math.abs(this.originOffset.x), this.vertices[num].y + Math.abs(this.originOffset.y));
    }
    normalize() {
        for (let i = 0; i < this.vertices.length; i++) {
            const vertex = this.vertices[i];
            vertex.x += Math.abs(this.originOffset.x);
            vertex.y += Math.abs(this.originOffset.y);
        }
    }

}
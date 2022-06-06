class Queue {
    constructor(size = 20) {
        this.elements = [];
        this.size = size;
    }
    enqueue(element) {
        if (this.length >= this.size) {
            this.elements.shift();
        }

        this.elements.push(element);
    }
    dequeue() {
        return this.elements.shift();
    }
    get(num) {
        return this.elements[num];
    }
    get length() {
        return this.elements.length;
    }
    get isEmpty() {
        return this.length === 0;
    }
    clear() {
        this.elements = [];
    }
}

class Coordinate {

    constructor(obj, y) {
        if (typeof obj === "object") { // This is Json construction ( :( no overloading)            
            this.x = obj.x;
            this.y = obj.y;
        } else {
            this.x = obj;
            this.y = y;
        }

    }

    get toString() {
        return "(" + this.x + ", " + this.y + ")";
    }
    static distFindder(a, b) {
        // Simple distane b/w 2 points
        return parseFloat(Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)).toFixed(2));
        //return Math.round((Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)) + Number.EPSILON) * 100) / 100
    }
    static compare(a, b, tolerance) {
        return this.distFindder(a, b) < tolerance;
    }

    get isEmpty() {
        if (this.x == -1 && this.y == -1) return true;
        return false;
    }
}

class Line {
    constructor(pointA, pointB) {
        if (!(pointA instanceof Coordinate)) { // This is Json construction ( :( no overloading)
            this.pointA = new Coordinate(pointA.pointA);
            this.pointB = new Coordinate(pointA.pointB);
        } else {
            this.pointA = pointA;
            this.pointB = pointB;
        }

    }
    get vector() {
        return new Coordinate(this.pointB.x - this.pointA.x, this.pointB.y - this.pointA.y);
    }
    get magnitude() {
        const vec = this.vector;
        return Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2))
    }
    static getRadians(lineA, lineB) { // These 2 lines must have a common point between them for practical use
        const dotProduct = lineA.vector.x * lineB.vector.x + lineA.vector.y * lineB.vector.y;
        const magnitudeProduct = lineA.magnitude * lineB.magnitude;
        let arcCosTheta = dotProduct / magnitudeProduct;
        if (arcCosTheta > 1) arcCosTheta = 1; // Since calculations are approximated somewhat, boundaries can be exceeded by very small margin and causes NaN in acos()
        if (arcCosTheta < -1) arcCosTheta = -1;
        return Math.PI - Math.acos(arcCosTheta)
    }
    static getDegrees(lineA, lineB) {
        return parseFloat((this.getRadians(lineA, lineB) * 180 / Math.PI).toFixed(2))
    }
    static join(lineA, lineB) { // If a,b have points A->B->C, then join to make a line that is A->C
        return new Line(lineA.pointA, lineB.pointB);
    }
}

class lineSet { // It has an array in it which contains a struct/mini-object with line and it's angle with next line as keys.    

    constructor(obj) {
        this.dataSet = [];
        if (obj !== undefined) {
            for (let i = 0; i < obj.dataSet.length; i++) {
                const newLine = new Line(obj.dataSet[i].line);
                const newAngle = obj.dataSet[i].angle;
                this.dataSet.push({ line: newLine, angle: newAngle })
            }
        }
    }

    push(newLine, newAngle) {
        this.dataSet.push({ line: newLine, angle: newAngle })
    }
    get(num) {
        return this.dataSet[num];
    }
    get length() {
        return this.dataSet.length;
    }
    perimeter() {
        let sum = 0;
        let angSum = 0;
        for (let i = 0; i < this.dataSet.length; i++) {
            sum += this.dataSet[i].line.magnitude;
            angSum += Math.PI - this.dataSet[i].angle;
        }
        //angSum /= this.dataSet.length;
        return [sum, angSum];
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
        if (this.length < 3) return
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
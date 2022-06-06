const bufferSize = 10;
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
        this.tail++;
        this.elements[this.tail] = element;
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
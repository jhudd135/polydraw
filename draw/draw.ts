function pythag(a: number, b: number): number {
    return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}
function inRange(min: number, x: number, max: number): boolean {
    return min < x && x < max;
}
function cleanCanvas(canvas: HTMLCanvasElement) {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}
function toDigits(num: number): number[] {
    return (new String(num)).split("").filter(d => d !== ".").map(d => parseInt(d));
}
function drawLine(canvas: HTMLCanvasElement, begin: [number, number], end: [number, number], stroke: string = "black", width: number = 1): void {
    const ctx = canvas.getContext("2d");
    if (stroke) {
        ctx.strokeStyle = stroke;
    }
    if (width) {
        ctx.lineWidth = width;
    }
    ctx.beginPath();
    ctx.moveTo(begin[0], begin[1]);
    ctx.lineTo(end[0], end[1]);
    ctx.stroke();
}
function drawPolygon(canvas: HTMLCanvasElement, points: [number, number][], fill: string = "black"): void {
    const ctx = canvas.getContext("2d");
    if (fill) {
        ctx.fillStyle = fill;
    }
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(...points[i]);
    }
    ctx.fill();
}
function drawPolyline(canvas: HTMLCanvasElement, points: [number, number][], stroke: string = "black"): void {
    const ctx = canvas.getContext("2d");
    if (stroke) {
        ctx.strokeStyle = stroke;
    }
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(...points[i]);
    }
    ctx.stroke();
}
function drawRect(canvas: HTMLCanvasElement, topLeft: [number, number], sideLengths: [number, number] | number, stroke: string = "black", width: number = 1): void {
    let ver = 0, hor = 0;
    if (typeof sideLengths === "number") {
        ver = sideLengths;
        hor = sideLengths;
    } else {
        hor = sideLengths[0];
        ver = sideLengths[1];
    }
    drawLine(canvas, topLeft, [topLeft[0] + hor, topLeft[1]], stroke, width);
    drawLine(canvas, topLeft, [topLeft[0], topLeft[1] + ver], stroke, width);
    drawLine(canvas, [topLeft[0] + hor, topLeft[1] + ver], [topLeft[0] + hor, topLeft[1]], stroke, width);
    drawLine(canvas, [topLeft[0] + hor, topLeft[1] + ver], [topLeft[0], topLeft[1] + ver], stroke, width);
}
function drawArc(canvas: HTMLCanvasElement, center: [number, number], radius: number, startAngle: number, endAngle: number, stroke: string = "black", width: number = 1): void {
    const ctx = canvas.getContext("2d");
    if (stroke) {
        ctx.strokeStyle = stroke;
    }
    if (width) {
        ctx.lineWidth = width;
    }
    ctx.beginPath();
    ctx.ellipse(center[0], center[1], radius, radius, 0, startAngle, endAngle);
    ctx.stroke();
}
function drawCircle(canvas: HTMLCanvasElement, center: [number, number], radius: number, stroke: string = "black", width: number = 1): void {
    drawArc(canvas, center, radius, 0, 2 * Math.PI, stroke, width);
}
function drawText(canvas: HTMLCanvasElement, point: [number, number], text: string, font: string = "10px Arial"): void {
    const ctx = canvas.getContext("2d");
    if (font) {
        ctx.font = font;
    }
    ctx.fillText(text, point[0], point[1]);
}
function borderCanvas(canvas: HTMLCanvasElement): void {
    const lineWidth = 2;
    const ctx = canvas.getContext("2d");
    drawLine(canvas, [0, 0], [canvas.width, 0], "black", lineWidth);
    drawLine(canvas, [0, 0], [0, canvas.height], "black", lineWidth);
    drawLine(canvas, [canvas.width, 0], [canvas.width, canvas.height], "black", lineWidth);
    drawLine(canvas, [0, ctx.canvas.height], [canvas.width, canvas.height], "black", lineWidth);
}
function createTextSpan(text: string, color: string = null): HTMLSpanElement {
    const span = document.createElement("span");
    if (color) {
        span.style.color = color;
    }
    span.appendChild(document.createTextNode(text));
    return span;
}
interface Identified {
    identify(): string;
}
class Cartesian implements Identified {
    x: number;
    y: number;
    static TOPOLAR = (point: Cartesian): Polar => new Polar(Math.atan2(point.y, point.x), pythag(point.x, point.y));
    identify(): string {return "Cartesian";}
    constructor(coords: [number, number] | { x: number, y: number } | Cartesian | number, y: number = 0) {
        if (typeof coords === "number") {
            this.x = coords;
            this.y = y;
        } else if (Object.keys(coords).includes("transform")) {
            this.x = (coords as Cartesian).x;
            this.y = (coords as Cartesian).y;
        } else if (Object.keys(coords).includes("0") && Object.keys(coords).includes("1")) {
            this.x = coords[0];
            this.y = coords[1];
        } else {
            this.x = (coords as { x: number, y: number }).x;
            this.y = (coords as { x: number, y: number }).y;
        }
    }
    transform(coords: [number, number] | { x: number, y: number } | Cartesian | number, y: number = 0): Cartesian {
        const transform = new Cartesian(coords, y);
        return new Cartesian(this.x + transform.x, this.y + transform.y);
    }
    toString(): string {
        return "[x: " + this.x + ", y: " + this.y + "]";
    }
    get arr(): [number, number] {
        return [this.x, this.y];
    }
    eq(other: Cartesian): boolean {
        return (this.x === other.x && this.y === other.y);
    }
}
class Polar implements Identified {
    angle: number;
    radius: number;
    static TOCARTESIAN = (point: Polar): Cartesian => new Cartesian(point.radius * Math.cos(point.angle), point.radius * Math.sin(point.angle));
    constructor(coords: [number, number] | { angle: number, radius: number } | Polar | number, radius: number = 0) {
        if (typeof coords === "number") {
            this.angle = coords;
            this.radius = radius;
        } else if (Object.keys(coords).includes("transform")) {
            this.angle = (coords as Polar).angle;
            this.radius = (coords as Polar).radius;
        } else if (Object.keys(coords).includes("0") && Object.keys(coords).includes("1")) {
            this.angle = coords[0];
            this.radius = coords[1];
        } else {
            this.angle = (coords as { angle: number, radius: number }).angle;
            this.radius = (coords as { angle: number, radius: number }).radius;
        }
    }
    identify(): string {return "Polar";}
    transform(angle: [number, number] | { angle: number, radius: number } | Polar | number, radius: number = 0): Polar {
        const transform = Polar.TOCARTESIAN(new Polar(angle, radius));
        return Cartesian.TOPOLAR(Polar.TOCARTESIAN(this).transform(transform));
    }
    rotate(angle: number): Polar {
        return new Polar(this.angle + angle, this.radius);
    }
    toString(): string {
        return "[angle: " + this.angle + ", radius: " + this.radius + "]";
    }
    scale(scalar: number): Polar {
        return new Polar(this.angle, this.radius * scalar);
    }
}
class Shape implements Identified {
    rotation: number = 0;
    origin: Cartesian;
    root: boolean = true;
    original: Shape = null;
    get evaluated(): boolean {return this.original !== null;}
    identify(): string {return "Shape";}
    constructor(public name: string, origin: Cartesian | [number, number] | { x: number, y: number }, public polygons: Polygon[], public shapes: Shape[]) {
        this.origin = new Cartesian(origin);
        this.shapes.forEach(s => { s.root = false; });
    }
    evaluate(state: { position: Cartesian, rotation: number } = null): Shape {
        const adjustedState = state === null ?
            { position: this.origin, rotation: this.rotation } :
            { position: state.position.transform(Polar.TOCARTESIAN(Cartesian.TOPOLAR(this.origin).rotate(state.rotation))), rotation: state.rotation + this.rotation };
        const result = new Shape(this.name, adjustedState.position, [], []);
        result.original = this;
        result.rotation = adjustedState.rotation;
        result.root = this.root;
        this.polygons.forEach(p => {
            result.polygons.push(p.evaluate(adjustedState));
        });
        this.shapes.forEach(s => {
            result.shapes.push(s.evaluate(adjustedState));
        });
        return result;
    }
    static ALLPOLYGONS = (shape: Shape): Polygon[] => {
        let result = shape.polygons;
        shape.shapes.forEach(s => {
            result = result.concat(Shape.ALLPOLYGONS(s));
        });
        return result;
    };
    renderAll(canvas: HTMLCanvasElement): void {
        const polygons = Shape.ALLPOLYGONS(this.evaluate()).sort((a, b) => a.layer - b.layer);
        polygons.forEach(poly => {
            const points: [number, number][] = poly.points.map(p => [p.x, p.y]);
            if (poly.lineOnly) {
                drawPolyline(canvas, points, poly.color)
            } else {
                drawPolygon(canvas, points, poly.color);
            }
        });
    }
}
class Polygon implements Identified {
    points: Cartesian[]
    original: Polygon = null;
    get evaluated(): boolean {return this.original !== null;}
    identify(): string {return "Polygon";}
    constructor(points: Cartesian[] | [number, number][] | { x: number, y: number }[], public color: string = "", public layer: number = 0, public lineOnly: boolean = false) {
        this.points = points.map(p => new Cartesian(p));
    }
    evaluate(state: { position: Cartesian, rotation: number }): Polygon {
        const adjustedPoints = this.points.map(p => {
            return state.position.transform(Polar.TOCARTESIAN(Cartesian.TOPOLAR(p).rotate(state.rotation)));
        });
        const result = new Polygon(adjustedPoints, this.color, this.layer, this.lineOnly);
        result.original = this;
        return result;
    }
}
class Force {
    static ZEROFORCE = () => new Force(new Polar(0, 0));
    constructor(public force: Polar) {}
    get angle(): number {return this.force.angle;}
    get magnitude(): number {return this.force.radius;}
    get CForce(): Cartesian {return Polar.TOCARTESIAN(this.force);}
    setMagnitude(magnitude: number): Polar {
        this.force.radius = magnitude;
        return this.force;
    }
    sumForce(force: Force): Force {
        return new Force(this.force.transform(force.force));
    }
}
interface KeyHandler {
    change(key: string, down: boolean): void;
    keys: string[];
    state: number | boolean;
}
class Button implements KeyHandler {
    keys: string[];
    state: boolean = false;
    constructor(keys: string[], public handler: (down: boolean) => void) {
        this.keys = [keys[0]];
    }
    change(key: string, down: boolean): void {
        this.state = down;
        this.handler(down);
    }
}
class QAxis implements KeyHandler {
    keys: string[];
    state: number = 0;
    states: [number, number] = [0, 0];
    constructor(keys: string[], public handler: (state: number) => void) {
        this.keys = [keys[0], keys[1]];
    }
    change(key: string, down: boolean): void {
        const idx = this.keys.findIndex(k => k === key);
        this.states[idx] = down ? [-1, 1][idx] : 0;
        this.state = this.states[0] + this.states[1];
        this.handler(this.state);
    }
}
class Input { //singleton
    static INPUT: Input;
    static SETUP = () => {
        Input.INPUT = new Input();
        document.addEventListener("keydown", (event: KeyboardEvent) => {
            if (Game.GAME.camera.canvas === document.activeElement) {
                Input.KEYCHANGE(event.key.toLowerCase(), true);
                event.preventDefault();
            }
        });
        document.addEventListener("keyup", (event: KeyboardEvent) => {
            if (Game.GAME.camera.canvas === document.activeElement) {
                Input.KEYCHANGE(event.key.toLowerCase(), false);
                event.preventDefault();
            }
        });
        document.addEventListener("mousemove", (event: MouseEvent) => {
            Input.INPUT.canvasMouseCoords = [
                event.clientX - Game.GAME.camera.canvas.getBoundingClientRect().left,
                event.clientY - Game.GAME.camera.canvas.getBoundingClientRect().top
            ];
        });
        document.addEventListener("mousedown", (event: MouseEvent) => {
            if (Game.GAME.camera.canvas === document.activeElement) {
                Input.KEYCHANGE("mouse", true);
            }
        });
        document.addEventListener("mouseup", (event: MouseEvent) => {
            if (Game.GAME.camera.canvas === document.activeElement) {
                Input.KEYCHANGE("mouse", false);
            }
        });
    }
    static KEYCHANGE = (key: string, down: boolean) => {
        Array.from(Input.INPUT.keyHandlers.values()).filter(h => h.keys.some(k => key === k)).forEach(h => {
            h.change(key, down);
        });
    }
    keyHandlers: Map<string, KeyHandler> = new Map<string, KeyHandler>();
    canvasMouseCoords: [number, number] = [0, 0];
    get realMouseCoords(): [number, number] {
        const camera = Game.GAME.camera;
        const horMin = camera.position.x - camera.radius[0], verMin = camera.position.y - camera.radius[1];
        return [
            horMin + ((this.canvasMouseCoords[0] / camera.canvas.width) * (2 * camera.radius[0])),
            verMin + ((this.canvasMouseCoords[1] / camera.canvas.height) * (2 * camera.radius[1]))
        ];
    }
    constructor() {
        this.keyHandlers.set("udAX", new QAxis(["arrowup", "arrowdown"], () => {}));
        this.keyHandlers.set("lrAX", new QAxis(["arrowleft", "arrowright"], () => {}));
        this.keyHandlers.set("minB", new Button(["-"], (down: boolean) => {if (down) {Game.GAME.camera.height *= 1.25;}}));
        this.keyHandlers.set("eqB", new Button(["="], (down: boolean) => {if (down) {Game.GAME.camera.height *= 0.8;}}));
        this.keyHandlers.set("aB", new Button(["a"], (down: boolean) => {Game.GAME.userInterface.selectParentShape();}));
        this.keyHandlers.set("mouseB", new Button(["mouse"], (down: boolean) => {Game.GAME.userInterface.selectObjects();}));
    }
}
class Game { //singleton
    static GAME: Game;
    static SETUP = () => {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        console.log("cavnas registered", "width", canvas.width, "height", canvas.height);
        const camera = new Camera(canvas, new Cartesian(0, 0), 500);
        camera.height = 200;
        Game.GAME = new Game(camera);
        Game.GAME.userInterface = new UserInterface(
            document.getElementById("modelJSON") as HTMLTextAreaElement,
            document.getElementById("parentShape") as HTMLDivElement,
            document.getElementById("selection") as HTMLDivElement
        );
    }
    static TIME = 0;
    model: Shape;
    intervalId: number;
    playingInterval: boolean = false;
    time: DOMHighResTimeStamp = performance.now();
    userInterface: UserInterface;
    constructor(public camera: Camera) {
        this.model = new Shape(
            "hull", [0, 0],
            [
                new Polygon([[30, 5], [25, 10], [5, 15], [-20, 15], [-20, 10], [-15, 5], [-15, -5], [-20, -10], [-20, -15], [5, -15], [25, -10], [30, -5]], "DarkGrey", 0),
                new Polygon([[20, 5], [10, 10], [5, 5], [5, -5], [10, -10], [20, -5]], "CornflowerBlue", 1),
                new Polygon([[5, 0], [-5, 5], [-15, 0], [-5, -5]], "DarkRed", 1),
                new Polygon([[-10, 5], [-10, 20], [-30, 15], [-30, 10]], "DimGrey", 1),
                new Polygon([[-10, -5], [-10, -20], [-30, -15], [-30, -10]], "DimGrey", 1),
                new Polygon([[5, 10], [5, 15], [0, 20], [-10, 20], [-20, 15], [-20, 10], [-10, 5], [0, 5]], "Grey", 2),
                new Polygon([[5, -10], [5, -15], [0, -20], [-10, -20], [-20, -15], [-20, -10], [-10, -5], [0, -5]], "Grey", 2),
                new Polygon([[15, 10], [0, 25], [-5, 25], [-10, 20], [-10, -20], [-5, -25], [0, -25], [15, -10]], "DarkRed", -1),
                new Polygon([[20, 15], [20, 20], [0, 20], [0, 15]], "DimGrey", -2),
                new Polygon([[20, -15], [20, -20], [0, -20], [0, -15]], "DimGrey", -2)
            ],
            [
                new Shape("right wing", [-5, 15], [new Polygon([[5, 0], [5, 40], [-5, 35], [-5, 20], [-10, 0], [0, -5]], "DarkGrey", 0)], []),
                new Shape("left wing", [-5, -15], [new Polygon([[5, 0], [5, -40], [-5, -35], [-5, -20], [-10, 0], [0, 5]], "DarkGrey", 0)], [])
            ]
        );
    }
}
class Camera {
    animationFrameId: number;
    playingAnimation: boolean = false;
    time: DOMHighResTimeStamp = performance.now();
    debugCamera: boolean = false;
    positionOffset: Cartesian = new Cartesian(0, 0);
    apertureAngles: [number, number];
    get radius(): [number, number] {
        return [this.height * Math.tan(this.apertureAngles[0]), this.height * Math.tan(this.apertureAngles[1])];
    }
    adjustedRadius(distance: number): [number, number] {
        return [(this.height + distance) * Math.tan(this.apertureAngles[0]), (this.height + distance) * Math.tan(this.apertureAngles[1])];
    }
    realToCanvas(coords: [number, number] | { x: number, y: number } | Cartesian | number, distance: number = 0): Cartesian {
        coords = new Cartesian(coords);
        const adjustedRadius = this.adjustedRadius(distance);
        const horMin = this.position.x - adjustedRadius[0], verMin = this.position.y - adjustedRadius[1];
        return new Cartesian(
            ((coords.x - horMin) / (2 * adjustedRadius[0])) * this.canvas.width,
            ((coords.y - verMin) / (2 * adjustedRadius[1])) * this.canvas.height
        );
    }
    constructor(public canvas: HTMLCanvasElement, public position: Cartesian, public height: number) {
        const radius = [this.canvas.width / 2, this.canvas.height / 2];
        this.apertureAngles = [Math.atan(radius[0] / this.height), Math.atan(radius[1] / this.height)];
    }
    toggleFrames(play: boolean = null): void {
        if (play === null) {
        this.playingAnimation = !this.playingAnimation;
        } else { this.playingAnimation = play; }
        if (this.playingAnimation) {
            this.animationFrameId = window.requestAnimationFrame(Game.GAME.camera.render(Game.GAME.camera));
        } else {
            window.cancelAnimationFrame(this.animationFrameId);
        }
    }
    render(camera: Camera): (time: DOMHighResTimeStamp) => void {
        return (time: DOMHighResTimeStamp) => {
            const deltaTime = (time - camera.time) / 1000;
            camera.time = time;
            camera.positionOffset.x += 0.7 * camera.radius[0] * deltaTime * (Input.INPUT.keyHandlers.get("lrAX").state as number);
            camera.positionOffset.y += 0.7 * camera.radius[1] * deltaTime * (Input.INPUT.keyHandlers.get("udAX").state as number);
            camera.position.x = camera.positionOffset.x;
            camera.position.y = camera.positionOffset.y;
            cleanCanvas(camera.canvas);
            borderCanvas(camera.canvas);
            camera.renderBackground(camera);
            camera.renderShapes(camera);
            camera.renderGUI(camera);
            camera.animationFrameId = window.requestAnimationFrame(camera.render(camera));
        };
    }
    renderBackground(camera: Camera): void {
        const graphSize = Game.GAME.userInterface.gridSize;
        // const model = Game.GAME.userInterface.selectedParentShape;
        // const rotation = model.rotation;
        const xMin = camera.position.x - (2 * camera.radius[0]), xMax = camera.position.x + (2 * camera.radius[0]);
        const yMin = camera.position.y - (2 * camera.radius[1]), yMax = camera.position.y + (2 * camera.radius[1]);
        for (let x = xMin - (xMin % graphSize); x < xMax; x += 5) {
            const color = x % (graphSize * 10) === 0 ? "DimGrey" : "DarkGrey";
            drawLine(camera.canvas, camera.realToCanvas([x, yMin]).arr, camera.realToCanvas([x, yMax]).arr, color);
        }
        for (let y = yMin - (yMin % graphSize); y < yMax; y += 5) {
            const color = y % (graphSize * 10) === 0 ? "DimGrey" : "DarkGrey";
            drawLine(camera.canvas, camera.realToCanvas([xMin, y]).arr, camera.realToCanvas([xMax, y]).arr, color);
        }
    }
    renderShapes(camera: Camera): void {
        const s = Game.GAME.model;
        const polygons = Shape.ALLPOLYGONS(s.evaluate()).sort((a, b) => a.layer - b.layer);
        polygons.forEach(poly => {
            const points = poly.points.map((p): [number,number] => {const cP = camera.realToCanvas(p); return [cP.x, cP.y]});
            drawPolygon(this.canvas, points, poly.color);
        });
    }
    renderGUI(camera: Camera): void {
        //mouse pointer
        drawArc(camera.canvas, Input.INPUT.canvasMouseCoords, 4, 0, 2 * Math.PI, "black", 2);
        if (Game.GAME.userInterface.mouseSnap) {
            drawArc(camera.canvas, camera.realToCanvas(Game.GAME.userInterface.snappedMouseCoords).arr, 4, 0, 2 * Math.PI, "DimGrey", 2);
        }
        Game.GAME.userInterface.renderGUI(camera);
    }
}
enum Tool {
    move
}
class UserInterface {
    gridSize: number = 5;
    selectedParentShape: Shape;
    selectedObjects: (Shape | Polygon)[];
    selectedObject: number = 0;
    selectedTool: Tool;
    mouseSnap: boolean = true;
    constructor(public textArea: HTMLTextAreaElement, public parentShapeDiv: HTMLDivElement, public selectionDiv: HTMLDivElement) {
        this.selectedParentShape = Game.GAME.model;
        this.selectedObjects = [Game.GAME.model];
        this.selectObject(0);
        this.selectParentShape();
    }
    toJSON() {
        this.textArea.value = JSON.stringify(Game.GAME.model);
    }
    fromJSON() {
        let convertObjToShape: (obj: Object) => Shape;
        convertObjToShape = (obj: Object): Shape => {
            const basic = obj as Shape;
            const polygons = basic.polygons.map(p => {
                const poly = p as Polygon;
                return new Polygon(poly.points, poly.color, poly.layer, poly.lineOnly);
            });
            return new Shape(basic.name, basic.origin, polygons, basic.shapes.map(s => convertObjToShape(s)));
        }
        Game.GAME.model = convertObjToShape(JSON.parse(this.textArea.value));
    }
    get snappedMouseCoords(): Cartesian {
        const gridSize = this.gridSize;
        const rMC = Input.INPUT.realMouseCoords;
        const negativeCorrectedModulo = (val: number, mod: number): number => ((val % mod) + mod) % mod;
        const nCMX = negativeCorrectedModulo(rMC[0], gridSize), nCMY = negativeCorrectedModulo(rMC[1], gridSize)
        const x = nCMX < (gridSize / 2) ? rMC[0] - nCMX : rMC[0] - nCMX + gridSize;
        const y = nCMY < (gridSize / 2) ? rMC[1] - nCMY : rMC[1] - nCMY + gridSize;
        return new Cartesian(x, y);
    }
    renderGUI(camera: Camera): void {
        // selected parent shape
        drawArc(camera.canvas, camera.realToCanvas(this.selectedParentShape.origin).arr, 10, 0, 2 * Math.PI, "blue", 2);
        if (0 < this.selectedObjects.length) {
            const selectedObject = this.selectedObjects[this.selectedObject];
            switch ((selectedObject as Identified).identify()) {
                case "Shape":
                    drawArc(camera.canvas, camera.realToCanvas((selectedObject as Shape).origin).arr, 10, 0, 2 * Math.PI, "green", 2);
                    break;
                case "Polygon":
                    const points = (selectedObject as Polygon).points.map(p => camera.realToCanvas(p).arr);
                    drawPolyline(camera.canvas, [...points, points[0]], "red");
                    break;
            }
        }
    }
    checkMouse(shape: Shape, mouseCoords: Cartesian): (Shape | Polygon)[] {
        if (!shape.evaluated) {
            console.log("ERROR checkMouse: shape not evaluated");
            return null;
        }
        let result: (Shape | Polygon)[] = [];
        if (new Cartesian(Math.round(shape.origin.x), Math.round(shape.origin.y)) === mouseCoords) {
            result.push(shape.original);
        }
        shape.polygons.forEach(poly => {
            poly.points.forEach(p => {
                if (new Cartesian(Math.round(p.x), Math.round(p.y)).eq(mouseCoords) && !result.includes(poly)) {
                    result.push(poly.original);
                }
            });
        });
        shape.shapes.forEach(s => {
            result = result.concat(this.checkMouse(s, mouseCoords));
        });
        return result;
    }
    selectObjects(): void {
        const mouseCheck = this.checkMouse(Game.GAME.model.evaluate(), this.snappedMouseCoords);
        if (0 < mouseCheck.length) {
            this.selectedObjects = mouseCheck;
            this.selectObject(0);
        }
    }
    selectObject(idx: number): void {
        const me = this;
        Array.from(this.selectionDiv.children).forEach(element => {
            element.remove();
        });
        this.selectionDiv.appendChild(createTextSpan("(" + this.selectedObjects.length + " option" + (this.selectedObjects.length === 1 ? "" : "s")  + ")"));
        const input = document.createElement("input") as HTMLInputElement;
        input.id = "selectedObject";
        input.type = "number";
        input.min = "1";
        input.max = "" + this.selectedObjects.length;
        input.style.width = "4ch";
        input.value = (idx + 1) + "";
        input.onchange = () => {
            me.selectObject(parseInt(input.value) - 1);
        };
        this.selectionDiv.appendChild(input);
        this.selectedObject = idx;
        const selectedObject = this.selectedObjects[this.selectedObject];
        switch ((selectedObject as Identified).identify()) {
            case "Shape":
                const shape = selectedObject as Shape;
                this.selectionDiv.appendChild(createTextSpan("Shape", "green"));
                // this.selectionDiv.appendChild(createTextSpan())
                break;
            case "Polygon":
                this.selectionDiv.appendChild(createTextSpan("Polygon"));
                break;
        }

    }
    selectParentShape(): void {
        if ((this.selectedObjects[this.selectedObject] as Identified).identify() === "Shape") {
            this.selectedParentShape = this.selectedObjects[this.selectedObject] as Shape;
            this.parentShapeDiv.innerHTML = this.selectedParentShape.name + " at: " + this.selectedParentShape.origin.toString();
        }
    }
}

function startDraw() {
    Game.SETUP();
    Input.SETUP();
    Game.GAME.camera.toggleFrames(true);
}

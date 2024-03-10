function getUniqueDoodlePath(baseStr, width, height) {
    if (!width) { width = 40; }
    if (!height) { height = width; }

    const minLength = (width + height) * .3, maxLength = (width + height) * .5;
    const generator = RandomGenerator.createFromStrSeed(baseStr);
    const length = minLength + generator.getRandomInt(maxLength - minLength);

    const doodler = new DoodleGenerator(width, height, length);
    doodler.setRandomGenerator(generator);

    const randomPath = doodler.createPathString();
    return randomPath;
}

function getUniqueDoodleSvg(baseStr, width, height) {
    if (!width) { width = 40; }
    if (!height) { height = width; }

    const minLength = 70, maxLength = 130;
    const generator = RandomGenerator.createFromStrSeed(baseStr);
    const length = minLength + generator.getRandomInt(maxLength - minLength);

    const doodler = new DoodleGenerator(width, height, length);
    doodler.setRandomGenerator(generator);

    const randomSvg = doodler.createSvgElem();
    return randomSvg;
    // elsewhere: document.body.appendChild(getUniqueDoodleSvg());
}

export {getUniqueDoodlePath, getUniqueDoodleSvg};

/**
 * based on https://stackoverflow.com/a/68513934
 *
 * Usage:
 * - Generate random path:
 * const doodler = new DoodleGenerator(width, height, length);
 * const randomPath = DoodleGenerator.createPathString();
 * - Generate predictable, repeatable path based on a source string:
 * const doodler = new DoodleGenerator(width, height, length);
 * doodler.setRandomGenerator(RandomGenerator.createFromStrSeed(baseStr));
 * const randomPath = DoodleGenerator.createPathString();
 */
class DoodleGenerator {

    #width; #height; #length;
    #minAngle = 60;
    #minDistance; #maxDistance;
    #lastTwoPoints = [];

    constructor(width, height, length) {
        this.#width = width;
        this.#height = height;
        this.#length = length;

        this.#minDistance = Math.min(this.#width, this.#height) / 20;
        this.#maxDistance = Math.min(this.#width, this.#height) / 4;

        this.#lastTwoPoints = [];
    }

    #randomGenerator;
    setRandomGenerator(generator) {
        this.#randomGenerator = generator;
    }
    #getRandomInt(max) {
        if (this.#randomGenerator) {
            return this.#randomGenerator.getRandomInt(max);
        }
        return Math.floor( Math.random() * max );
    }

    createPathString() {
        let pathString = `M ${this.#pointString()} C ${this.#pointString()} ${this.#pointString()} ${this.#pointString()}`;

        for( let i = 0; i < this.#length; i++  ) {
            pathString += `S ${this.#pointString()} ${this.#pointString()} `
        }

        return pathString;
    }

    // <svg fill="none" stroke="black"><path d=""/></svg>
    createSvgElem() {
        const dotPath = this.createPathString(this.#length);

        const pathElem = document.createElement('path');
        pathElem.setAttribute('d', dotPath);

        const svg = document.createElement('svg');
        svg.style.width = this.#width;
        svg.style.height = this.#height;
        svg.appendChild(pathElem);

        return svg;
    }

    #getPoint() {
        let x = this.#getRandomInt(this.#width * 0.6) + this.#width * 0.2;
        let y = this.#getRandomInt(this.#height * 0.6) + this.#height * 0.2;

        let point = [x, y];

        if (this.#lastTwoPoints.length < 2) {
            this.#lastTwoPoints.push(point);
        } else {
            if(DoodleGenerator.getAngle(...this.#lastTwoPoints, point) < this.#minAngle
                || DoodleGenerator.getDistance(this.#lastTwoPoints[1],point) < this.#minDistance
                || DoodleGenerator.getDistance(this.#lastTwoPoints[1],point) > this.#maxDistance){
                point = this.#getPoint();
            } else {
                this.#lastTwoPoints.shift();
                this.#lastTwoPoints.push(point);
            }
        }
        return point;
    }

    #pointString() {
        let point = this.#getPoint();
        return `${point[0]} ${point[1]} `;
    }

    // could be in lib/math2
    static getDistance(pointA, pointB) {
        return Math.sqrt((pointA[0] - pointB[0])**2 + (pointA[1] - pointB[1])**2);
    }

    // could be in lib/math2
    static getAngle(pointA, pointB, pointC) { // angle to pointB
        let a = DoodleGenerator.getDistance(pointA, pointB);
        let b = DoodleGenerator.getDistance(pointB, pointC);
        let c = DoodleGenerator.getDistance(pointC, pointA);
        return Math.acos((a*a + b*b - c*c)/(2*a*b))*(180/Math.PI);
    }
}

/**
 * based on https://stackoverflow.com/a/521323
 */
class RandomGenerator {
    #generator;
    getRandomInt(max) {
        if (!this.#generator) {
            this.seed();
        }
        return Math.floor(this.#generator() * max);
    }

    seed(seedStr) {
        let seeds;
        if (seedStr) {
            seeds = RandomGenerator.#cyrb128(seedStr);
        } else {
            seeds = [Math.random()*2**32>>>0, Math.random()*2**32>>>0, Math.random()*2**32>>>0, Math.random()*2**32>>>0];
        }
        this.#generator = RandomGenerator.#sfc32(seeds[0], seeds[1], seeds[2], seeds[3]);
        // alt: RandomGenerator.#splitmix32(seeds[0]);
    }

    static createFromStrSeed(seedStr) {
        const generator = new RandomGenerator();
        generator.seed(seedStr);
        return generator;
    }

    static #cyrb128(str) {
        let h1 = 1779033703, h2 = 3144134277,
            h3 = 1013904242, h4 = 2773480762;
        for (let i = 0, k; i < str.length; i++) {
            k = str.charCodeAt(i);
            h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
            h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
            h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
            h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
        }
        h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
        h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
        h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
        h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
        h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
        return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
    }

    static #sfc32(a, b, c, d) {
        return function() {
            a |= 0; b |= 0; c |= 0; d |= 0;
            var t = (a + b | 0) + d | 0;
            d = d + 1 | 0;
            a = b ^ b >>> 9;
            b = c + (c << 3) | 0;
            c = (c << 21 | c >>> 11);
            c = c + t | 0;
            return (t >>> 0) / 4294967296;
        }
    }

    static #splitmix32(a) {
        return function() {
          a |= 0; a = a + 0x9e3779b9 | 0;
          var t = a ^ a >>> 16; t = Math.imul(t, 0x21f0aaad);
              t = t ^ t >>> 15; t = Math.imul(t, 0x735a2d97);
          return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
        }
    }
}

export class Feature {
    constructor([x = 0, y = 0, z = 0] = []) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.el = null;
    }
}

export class Point extends Feature {
    render(props) {
        const { x, y } = props;
        this.el = document.createElement('div');
        this.el.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background-color: green;
            border-radius: 50%;
            left: calc(50% - 1px);
            top: calc(50% - 1px);
            transform: translate3d(${x}px, ${y}px, 0);
        `;
        return this;
    }
}

export class Circle {
    constructor(radius, features = []) {
        this.radius = radius;
        this.el = null;

        this.containerEl = null;
        this.containerHeight = null;
        this.containerHeight = null;

        this.features = features;
    }

    getDiameter() {
        // size of minimal side of container
        return Math.min(this.containerHeight, this.containerWidth);
    }

    getRatio() {
        // view dimensions to real values
        return this.getDiameter() / 2 / this.radius;
    }

    renderTo(containerEl) {
        this.containerEl = containerEl;
        // store dimensions to prevent reflow each time it needs to be used
        this.containerHeight = containerEl.clientHeight;
        this.containerWidth = containerEl.clientWidth;
        // TODO: on container resize reassign dimensions, redraw
        return this.render();
    }

    render() {
        // circle always tries to use available space of container
        const diameter = this.getDiameter();
        this.el = document.createElement('div');
        this.el.style.cssText = `
            position: relative;
            width: ${diameter}px;
            height: ${diameter}px;
            border: 1px solid rgba(128, 128, 128, 0.3);
            border-radius: 50%;
            margin: 0 auto;
            perspective-origin: 50% 50%;
        `;
        this.containerEl.appendChild(this.el);

        this.renderFeatures();
        return this;
    }

    renderFeatures() {
        if (this.features.length) {
            const ratio = this.getRatio();
            this.el.innerHTML = '';

            this.features.forEach(feature => {
                const normalizedFeatureCoords = {
                    x: feature.x * ratio,
                    y: feature.y * ratio,
                    z: feature.z * ratio
                };

                if (
                    Math.abs(normalizedFeatureCoords.x) > this.containerWidth / 2 ||
                    Math.abs(normalizedFeatureCoords.y) > this.containerHeight / 2
                ) {
                    // feature will be invisible, don't draw
                    return;
                }

                feature.render(normalizedFeatureCoords);

                this.el.appendChild(feature.el);
            });
        }
    }

    addFeature(feature) {
        this.features.push(feature);
        this.renderFeatures();
        return this;
    }
}

/**
 * @param {Number[]|Number[][]} pointsCoords - points coordinates
 * @param {Number} radius - radius of circle
 * @param {Element} container - container for circle and point
 * @returns {Circle}
 */
export default function renderPointsToCircle(pointsCoords, radius, container) {
    const castedArrayCoords = pointsCoords.length && !(pointsCoords[0] instanceof Array) ?
        [pointsCoords] : pointsCoords;
    const points = castedArrayCoords.map(pointCoords => new Point(pointCoords));
    const circle = new Circle(radius, points);
    return circle.renderTo(container);
}

export function polylineFromFunc(func, x1 = 0, x2 = 1, step = 0.1) {
    let poly = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    poly.setAttribute("stroke", "cyan");
    poly.setAttribute("fill", "none");
    if (x2 < x1) {
        const temp = x1;
        x1 = x2;
        x2 = temp;
    }
    if (step < 0)
        step *= -1.0;
    let points = new Array();
    for (let i = x1; i < x2 + step; i += step)
        points.push(`${i} ${-1.0 * func(i)}`);
    poly.setAttribute("points", points.join(", "));
    return poly;
}
export function enablePan(svg) {
    svg.pan = pan;
    svg.mouseDownCtrl = new AbortController();
    svg.mouseUpCtrl = new AbortController();
    function moveCallback(event) {
        const moveTo = new DOMPoint(event.x, event.y).
            matrixTransform(this.transformMatrix);
        this.pan(new DOMPoint(this.lastEventAt.x - moveTo.x, this.lastEventAt.y - moveTo.y));
        this.lastEventAt = moveTo;
    }
    svg.addEventListener("mousedown", (event) => {
        svg.transformMatrix = svg.getScreenCTM().inverse();
        svg.lastEventAt = new DOMPoint(event.x, event.y).
            matrixTransform(svg.transformMatrix);
        svg.addEventListener("mousemove", moveCallback);
    }, { signal: svg.mouseDownCtrl.signal });
    document.addEventListener("mouseup", function (event) {
        svg.removeEventListener("mousemove", moveCallback);
    }, { signal: svg.mouseUpCtrl.signal });
}
export function disablePan(svg) {
    svg.mouseDownCtrl?.abort();
    svg.mouseUpCtrl?.abort();
    svg.mouseDownCtrl = undefined;
    svg.mouseUpCtrl = undefined;
    svg.pan = undefined;
}
function pan(delta) {
    this.viewBox.baseVal.x += delta.x;
    this.viewBox.baseVal.y += delta.y;
}
export function enableZoom(svg) {
    svg.wheelController = new AbortController();
    svg.zoom = zoom;
    svg.addEventListener("wheel", function (event) {
        const matrix = svg.getScreenCTM().inverse();
        const p = new DOMPoint(event.x, event.y).
            matrixTransform(matrix);
        if (event.deltaY > 0)
            svg.zoom(p, 1.1);
        else if (event.deltaY < 0)
            svg.zoom(p, 1 / 1.1);
    }, { signal: svg.wheelController.signal });
}
export function disableZoom(svg) {
    svg.wheelController?.abort();
    svg.wheelController = undefined;
    svg.zoom = undefined;
}
function zoom(center, factor) {
    if (this instanceof SVGElement) {
        this.viewBox.baseVal.x = (this.viewBox.baseVal.x - center.x) * factor
            + center.x;
        this.viewBox.baseVal.y = (this.viewBox.baseVal.y - center.y) * factor
            + center.y;
        this.viewBox.baseVal.width *= factor;
        this.viewBox.baseVal.height *= factor;
    }
}

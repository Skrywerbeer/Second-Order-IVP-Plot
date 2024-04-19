import { polylineFromFunc, enablePan } from "./svgutils.mjs";

interface EquationParameters {
	mass: number;
	damping: number;
	spring: number;
	position: number;
	velocity: number;
}

function getParameters(): EquationParameters {
	return {
		mass : Number((document.
			getElementById("mass") as HTMLInputElement).value),
		damping : Number((document.
			getElementById("damping") as HTMLInputElement).value),
		spring : Number((document.
			getElementById("spring") as HTMLInputElement).value),
		position : Number((document.
			getElementById("startPosition") as HTMLInputElement).value),
		velocity : Number((document.
			getElementById("startVelocity") as HTMLInputElement).value),
	};
}

function solveODE(parameters: EquationParameters): (input: number) => number {
	const center = -1.0*parameters.damping/(2*parameters.mass);
	const disc = center**2 - (parameters.spring/parameters.mass)**2;
	
	if (disc > 0) {
		const r1 = center + Math.sqrt(disc);
		const r2 = center - Math.sqrt(disc);
		const rootDifference = r2 - r1;
		const factor1 = (parameters.position*r2 - parameters.velocity)/
			rootDifference;
		const factor2 = (parameters.velocity - parameters.position*r1)/
			rootDifference;
		return function (input: number): number {
			return factor1*Math.exp(r1*input) + factor2*Math.exp(r2*input);
		};
	}
	else if (disc < 0) {
		const frequency = center + Math.sqrt(-1.0*disc);
		return function (input: number): number {
			return Math.exp(center*input)*(parameters.position*
				Math.cos(frequency*input) +
				((parameters.velocity - center*parameters.position)/frequency)*
				Math.sin(frequency*input));
		};
	}
	else {
		return function (input: number): number {
			return ((parameters.velocity - parameters.position*center)*input +
				parameters.position)*Math.exp(center*input);
		}
	}
}

const plot = document.getElementById("plot")!;
enablePan(plot);

const lowerBound = -10;
const upperBound = 10;

["mass",
 "damping",
 "spring",
 "startPosition",
 "startVelocity"].forEach((item) => {
	 if (!item)
		 return;
	 document.getElementById(item).addEventListener("input", () => {
		 plot.removeChild(plot.lastChild!);
		 plot.append(polylineFromFunc(solveODE(getParameters()), lowerBound, upperBound, 0.01));
	 })
})
document.getElementById("mass")

plot.append(polylineFromFunc(solveODE(getParameters()), lowerBound, upperBound, 0.01));

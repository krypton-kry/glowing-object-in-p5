const MAX_TRAIL_COUNT = 30;

var theShader;
var shaderTexture;
var trail = [];

let vertShader = `
	precision highp float;

	attribute vec3 aPosition;

	void main() {
		vec4 positionVec4 = vec4(aPosition, 1.0);
		positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
		gl_Position = positionVec4;
	}
`;

let fragShader = `
	precision highp float;
	
	uniform vec2 resolution;
	uniform int trailCount;
	uniform vec2 trail[${MAX_TRAIL_COUNT}];

	void main() {
			vec2 st = gl_FragCoord.xy / resolution.xy;  // Warning! This is causing non-uniform scaling.

			float r = 0.0;
			float g = 0.0;
			float b = 0.0;

			for (int i = 0; i < ${MAX_TRAIL_COUNT}; i++) {
				if (i < trailCount) {
					vec2 trailPos = trail[i];
					float value = float(i) / distance(st, trailPos.xy) * 0.00015;  // Multiplier may need to be adjusted if max trail count is tweaked.
					g += value * 0.5;
					b += value;
				}
			}

			gl_FragColor = vec4(r, g, b, 1.0);
	}
`;

function preload() {
	theShader = new p5.Shader(this.renderer, vertShader, fragShader);
}

function setup() {
	pixelDensity(1);
	
  let canvas = createCanvas(
		min(windowWidth, windowHeight), 
		min(windowWidth, windowHeight), 
		WEBGL);
	
	//canvas.canvas.oncontextmenu = () => false;  // Removes right-click menu.
	//noCursor();
	
	shaderTexture = createGraphics(width, height, WEBGL);
	//shaderTexture.noStroke();
}
function draw() {
	background(0);
	//noStroke();
	
	// Trim end of trail.
	trail.push([mouseX, mouseY]);
	
	let removeCount = 1;
	
	for (let i = 0; i < removeCount; i++) {
		if (trail.length == 0) {
			break;
		}
		
		if (trail.length > MAX_TRAIL_COUNT) {
			trail.splice(0, 1);
		}
	}
	
	translate(-width / 2, -height / 2);
	

	// Display shader.
	shaderTexture.shader(theShader);
		
	let trails = [];
	for (let i = 0; i < trail.length; i++) {
		trails.push(
			map(trail[i][0], 0, width, 0.0, 1.0),
			map(trail[i][1], 0, height, 1.0, 0.0));
	}

	theShader.setUniform("resolution", [width, height]);
	theShader.setUniform("trailCount", trail.length);
	theShader.setUniform("trail", trails);

	shaderTexture.rect(0, 0, width, height);
	texture(shaderTexture);
		
	rect(0, 0, width, height);

}

//Global GL variables
var gl;
var shaderProgram;
var attributes;
var uniforms;

//Matrices
var mPerspective = mat4.create();
var mTransform = mat4.create();

//Properties
var rotationX = 0;
var rotationY = 0;
var rotationZ = 0;

$(document).ready(function () {
    var canvas = document.getElementById('canvas');
    gl = initWebGL(canvas, window.innerWidth - 100, window.innerHeight - 100);
    shaderProgram = linkShaders(gl, "shader-vs", "shader-fs");
    getUniformsAndAttributes();
    createScene();
    window.requestAnimationFrame(drawScene);
});

function createScene() {
    //Make vertices
    var vertices = [
    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0,
    1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0
    ];
    var elemPerVertex = 3;

    //Setup buffer for vertices
    initBuffer(gl, vertices, elemPerVertex, attributes.aVertexPosition);

    //Setup perspective matrix
    mat4.perspective(mPerspective, 45, window.innerWidth / window.innerHeight, 0.1, 100.0);
    gl.uniformMatrix4fv(uniforms.uPerspective, false, new Float32Array(mPerspective));
}

function getUniformsAndAttributes() {
    attributes = getAttributes(gl, shaderProgram);
    uniforms = getUniforms(gl, shaderProgram);
}

function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //Animate rotation
    currentTime = (new Date()).getTime();
    var elapsed = currentTime - lastTime;
    rotationY += (1 * elapsed) / 1000.0;
    rotationZ += (1 * elapsed) / 1000.0;
    lastTime = currentTime;

    //Push old transform matrix
    pushMatrix(mTransform);

    //Create new transform matrix
    mTransform = createTransformationMatrix([0.0, 0.0, -3.0], [rotationX, rotationY, rotationZ], [1.0, 1.0, 1.0]);

    //Set transform matrix
    gl.uniformMatrix4fv(uniforms.uTransform, false, new Float32Array(mTransform));

    //Pop old transform matrix
    mTransform = popMatrix();

    //Draw from buffer
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    window.requestAnimationFrame(drawScene);
}
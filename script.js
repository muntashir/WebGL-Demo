//Global GL variables
var gl;
var shaderProgram;
var attributes;
var uniforms;

//Matrices
var mPerspective = mat4.create();
var mTransform = mat4.create();
var mNormal = mat4.create();

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
    // Front face
    -1.0, -1.0, 1.0,
     1.0, -1.0, 1.0,
     1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,
     1.0, 1.0, -1.0,
     1.0, -1.0, -1.0,

    // Top face
    -1.0, 1.0, -1.0,
    -1.0, 1.0, 1.0,
     1.0, 1.0, 1.0,
     1.0, 1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,

    // Right face
     1.0, -1.0, -1.0,
     1.0, 1.0, -1.0,
     1.0, 1.0, 1.0,
     1.0, -1.0, 1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0
    ];

    var vertexNormals = [
    // Front
     0.0, 0.0, 1.0,
     0.0, 0.0, 1.0,
     0.0, 0.0, 1.0,
     0.0, 0.0, 1.0,

    // Back
     0.0, 0.0, -1.0,
     0.0, 0.0, -1.0,
     0.0, 0.0, -1.0,
     0.0, 0.0, -1.0,

    // Top
     0.0, 1.0, 0.0,
     0.0, 1.0, 0.0,
     0.0, 1.0, 0.0,
     0.0, 1.0, 0.0,

    // Bottom
     0.0, -1.0, 0.0,
     0.0, -1.0, 0.0,
     0.0, -1.0, 0.0,
     0.0, -1.0, 0.0,

    // Right
     1.0, 0.0, 0.0,
     1.0, 0.0, 0.0,
     1.0, 0.0, 0.0,
     1.0, 0.0, 0.0,

    // Left
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0
    ];

    var elemPerVertex = 3;

    //Setup buffer for vertices
    initBuffer(gl, vertexNormals, elemPerVertex, attributes.aVertexNormal);
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
    mTransform = createTransformationMatrix([0.0, 0.0, -4.0], [rotationX, rotationY, rotationZ], [1.0, 1.0, 1.0]);
    mat4.invert(mNormal, mTransform);
    mat4.transpose(mNormal, mNormal);

    //Set transform matrix
    gl.uniformMatrix4fv(uniforms.uTransform, false, new Float32Array(mTransform));
    gl.uniformMatrix4fv(uniforms.uNormal, false, new Float32Array(mNormal));

    //Pop old transform matrix
    mTransform = popMatrix();

    //Draw from buffer
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 24);

    window.requestAnimationFrame(drawScene);
}
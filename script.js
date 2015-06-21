//Global GL variables
var gl;
var shaderProgram;
var texture;
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
    texture = initTexture(gl, "tex.png");
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

    var cubeVertexIndices = [
    0, 1, 2, 0, 2, 3, // front
    4, 5, 6, 4, 6, 7, // back
    8, 9, 10, 8, 10, 11, // top
    12, 13, 14, 12, 14, 15, // bottom
    16, 17, 18, 16, 18, 19, // right
    20, 21, 22, 20, 22, 23 // left
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

    var textureCoordinates = [
    // Front
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Back
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Top
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Bottom
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Right
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Left
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0
    ];

    var elemPerVertex = 3;

    //Setup buffer for vertices
    initBuffer(gl, vertexNormals, elemPerVertex, attributes.aVertexNormal);
    initBuffer(gl, textureCoordinates, 2, attributes.aTextureCoord);
    initBuffer(gl, vertices, elemPerVertex, attributes.aVertexPosition);
    initElementArrayBuffer(gl, cubeVertexIndices);

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
    mNormal = getNormalMatrix(mTransform);

    //Set transform matrix
    gl.uniformMatrix4fv(uniforms.uTransform, false, new Float32Array(mTransform));
    gl.uniformMatrix4fv(uniforms.uNormal, false, new Float32Array(mNormal));

    //Pop old transform matrix
    mTransform = popMatrix();

    //Set texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uniforms.uTexture, 0);

    //Draw from buffer
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

    window.requestAnimationFrame(drawScene);
}
var matrixStack = [];
var currentTime = (new Date()).getTime();
var lastTime = (new Date()).getTime();

function initTexture(gl, url) {
    var texture = gl.createTexture();
    var image = new Image();
    image.src = url;
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    return texture;
}

function getNormalMatrix(m) {
    var mNormal = mat4.create()
    mat4.invert(mNormal, m);
    mat4.transpose(mNormal, mNormal);
    return mNormal;
}

function linkShaders(gl, vertexID, fragmentID) {
    //Get shaders
    var shaderProgram;
    var vertexShader = getShader(gl, vertexID);
    var fragmentShader = getShader(gl, fragmentID);

    //Link and compile shaders
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    //Check if shaders compiled
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }
    gl.useProgram(shaderProgram);
    return shaderProgram;
}

function initElementArrayBuffer(gl, data) {
    //Create and bind buffer
    var buffer = gl.createBuffer();
    if (!buffer) throw new Error('Failed to create buffer');
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);

    //Insert data into buffer
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
};

function initBuffer(gl, data, elemPerVertex, attribute) {
    //Create and bind buffer
    var buffer = gl.createBuffer();
    if (!buffer) throw new Error('Failed to create buffer');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    //Insert data into buffer
    gl.enableVertexAttribArray(attribute);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribute, elemPerVertex, gl.FLOAT, false, 0, 0);
};

function createTransformationMatrix(translation, rotation, scale) {
    var vTranslation = vec3.create();
    vec3.set(vTranslation, translation[0], translation[1], translation[2]);

    var vScale = vec3.create();
    vec3.set(vScale, scale[0], scale[1], scale[2]);

    var mTransform = mat4.create();
    mat4.identity(mTransform);
    mat4.translate(mTransform, mTransform, translation);
    mat4.scale(mTransform, mTransform, scale);
    mat4.rotateX(mTransform, mTransform, rotation[0]);
    mat4.rotateY(mTransform, mTransform, rotation[1]);
    mat4.rotateZ(mTransform, mTransform, rotation[2]);

    return mTransform;
}

function pushMatrix(m) {
    var copiedMatrix = mat4.create();
    mat4.copy(copiedMatrix, m);
    matrixStack.push(copiedMatrix);
}

function popMatrix() {
    if (!matrixStack.length) {
        alert("Stack is empty");
    }
    var poppedMatrix = matrixStack.pop();
    return poppedMatrix;
}

function initWebGL(canvas, width, height) {
    canvas.width = width;
    canvas.height = height;
    gl = null;

    try {
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    } catch (e) {}

    //Clear canvas and enable depth buffer
    if (gl) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    } else {
        alert('WebGL not supported');
        gl = null;
    }

    return gl;
}

function getShader(gl, id) {
    //Get DOM shader
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    //Read text from DOM shader
    var shaderSrc = "";
    var currentChild = shaderScript.firstChild;
    while (currentChild) {
        if (currentChild.nodeType == currentChild.TEXT_NODE) {
            shaderSrc += currentChild.textContent;
        }
        currentChild = currentChild.nextSibling;
    }

    //Create and compile shader
    var shader;

    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, shaderSrc);
    gl.compileShader(shader);

    //Check if shader compiled
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

//Gets all attributes from a shader program
function getAttributes(gl, program) {
    var attributes = {};
    var numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

    for (var i = 0; i < numAttributes; ++i) {
        var attributeString = gl.getActiveAttrib(program, i).name;
        attributes[attributeString] = gl.getAttribLocation(program, attributeString);
    }

    return attributes;
}

//Gets all uniforms from a shader program
function getUniforms(gl, program) {
    var uniforms = {};
    var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for (i = 0; i < numUniforms; ++i) {
        var uniformString = gl.getActiveUniform(program, i).name;
        uniforms[uniformString] = gl.getUniformLocation(program, uniformString);
    }

    return uniforms;
}
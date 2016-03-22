(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


var cameraHeight = 2;
var fallRate = 25;
var forwardPerSec = 5;
var jumpPower = 10;
var mouseSensitivity = .25;


window.addEventListener('load', function(e) {
  var viewportDiv = document.createElement('div');
  document.body.appendChild(viewportDiv);
  viewportDiv.classList.add('viewport');
  var canvas = document.createElement('canvas');
  viewportDiv.appendChild(canvas);
  canvas.width = canvas.height = 1024;
  var context = new nmlorg.gl.Context(canvas);
  var canvasDiv = document.createElement('div');
  viewportDiv.appendChild(canvasDiv);
  canvasDiv.classList.add('canvas-overlay');
  var escapedDiv = document.createElement('div');
  viewportDiv.appendChild(escapedDiv);
  escapedDiv.classList.add('escaped');
  var escapedBoxDiv = document.createElement('div');
  escapedDiv.appendChild(escapedBoxDiv);
  escapedBoxDiv.classList.add('box');
  escapedBoxDiv.textContent = 'Press Esc to toggle between navigation and menu mode.';

  var pos = [0, 0, 0];
  var yaw = 0, pitch = 0, roll = 0;
  var jumpSpeed = 0;

  function mouseMove(e) {
    yaw += deg2rad(e.movementX * mouseSensitivity);
    while (yaw < 0)
      yaw += 2 * Math.PI;
    while (yaw >= 2 * Math.PI)
      yaw -= 2 * Math.PI;

    pitch = Math.max(deg2rad(-85), Math.min(deg2rad(85),
                                            pitch + deg2rad(-e.movementY * mouseSensitivity)));
  }

  document.addEventListener('pointerlockchange', function(e) {
    console.log('pointerlockchange:', e);
    if (document.pointerLockElement === viewportDiv) {
      escapedDiv.classList.add('hidden');
      document.addEventListener('mousemove', mouseMove);
    } else {
      escapedDiv.classList.remove('hidden');
      document.removeEventListener('mousemove', mouseMove);
    }
  });

  document.addEventListener('pointerlockerror', function(e) {
    console.log('pointerlockerror:', e);
  });

  var keyboard = new Set();
  var filters = 0;

  document.addEventListener('keydown', function(e) {
    if (keyboard.has(e.keyCode))
      return;
    keyboard.add(e.keyCode);
    console.log('keydown', e.keyCode, e.keyCode & 0x7f,
                JSON.stringify(String.fromCharCode(e.keyCode & 0x7f)));
    switch (e.keyCode) {
      case 32:  // space
        jumpSpeed = jumpPower;
        break;
      case 48:  // 0
        filters ^= (1 << 0);
        break;
      case 49:  // 1
        filters ^= (1 << 1);
        break;
      case 50:  // 2
        filters ^= (1 << 2);
        break;
      case 51:  // 3
        filters ^= (1 << 3);
        break;
      case 52:  // 4
        filters ^= (1 << 4);
        break;
      case 53:  // 5
        filters ^= (1 << 5);
        break;
      case 54:  // 6
        filters ^= (1 << 6);
        break;
      case 55:  // 7
        filters ^= (1 << 7);
        break;
      case 56:  // 8
        filters ^= (1 << 8);
        break;
      case 57:  // 9
        filters ^= (1 << 9);
        break;
    }
  });

  document.addEventListener('keyup', function(e) {
    switch (e.keyCode) {
      case 27:  // Escape
        if (keyboard.has(27) && (document.pointerLockElement !== viewportDiv))
          viewportDiv.requestPointerLock();
        escapePressed = false;
        break;
    }
    keyboard.delete(e.keyCode);
  });

  var perspectiveProjection = nmlorg.gl.makeFrustum(-1, 1, -1, 1);
  var colorShader = context.loadShader('color');
  colorShader.setCameraProjection(perspectiveProjection);

  var blurShader = context.loadShader('blur');
  var outlineShader = context.loadShader('outline');

  var block = colorShader.makeShape(
      [
          -.45, .95, -.45,
          -.45, .95, .45,
          0, .95, 0,

          -.45, .95, .45,
          .45, .95, .45,
          0, .95, 0,

          .45, .95, .45,
          .45, .95, -.45,
          0, .95, 0,

          .45, .95, -.45,
          -.45, .95, -.45,
          0, .95, 0,

          -.45, .05, -.45,
          -.45, .05, .45,
          0, .05, 0,

          -.45, .05, .45,
          .45, .05, .45,
          0, .05, 0,

          .45, .05, .45,
          .45, .05, -.45,
          0, .05, 0,

          .45, .05, -.45,
          -.45, .05, -.45,
          0, .05, 0,
      ], [
          1, 0, 0, 1,
          1, 0, 0, 1,
          1, 0, 0, .3,

          1, 0, 0, 1,
          1, 0, 0, 1,
          1, 0, 0, .3,

          1, 0, 0, 1,
          1, 0, 0, 1,
          1, 0, 0, .3,

          1, 0, 0, 1,
          1, 0, 0, 1,
          1, 0, 0, .3,

          0, 0, 1, 1,
          0, 0, 1, 1,
          0, 0, 1, .3,

          0, 0, 1, 1,
          0, 0, 1, 1,
          0, 0, 1, .3,

          0, 0, 1, 1,
          0, 0, 1, 1,
          0, 0, 1, .3,

          0, 0, 1, 1,
          0, 0, 1, 1,
          0, 0, 1, .3,
      ]);

  var fb = context.makeDoubleFramebuffer();

  var prev = 0;
  window.requestAnimationFrame(function anim(now) {
    var dt = prev && (now - prev) / 1000;
    prev = now;

    var kA = keyboard.has(65);
    var kD = keyboard.has(68);
    var kS = keyboard.has(83);
    var kW = keyboard.has(87);

    if (kA && kD)
      kA = kD = false;
    if (kS && kW)
      kS = kW = false;

    if (kA || kD || kS || kW) {
      var moveDir = yaw;

      if (kW) {
        if (kA)
          moveDir -= deg2rad(45);
        else if (kD)
          moveDir += deg2rad(45);
      } else if (kS) {
        if (kA)
          moveDir -= deg2rad(90 + 45);
        else if (kD)
          moveDir += deg2rad(90 + 45);
        else
          moveDir += deg2rad(180);
      } else if (kA)
        moveDir -= deg2rad(90);
      else if (kD)
        moveDir += deg2rad(90);

      pos[0] += Math.sin(moveDir) * forwardPerSec * dt;
      pos[2] -= Math.cos(moveDir) * forwardPerSec * dt;
    }

    pos[1] += jumpSpeed * dt;
    if (pos[1] <= 0) {
      pos[1] = 0;
      jumpSpeed = 0;
    } else
      jumpSpeed -= fallRate * dt;

    canvasDiv.innerHTML = 'Position: ' +
        JSON.stringify([round(pos[0], 1), round(pos[1], 1), round(pos[2], 1)]) + '<br>' +
        'Yaw: ' + round(rad2deg(yaw)) + '&deg;<br>' +
        'Pitch: ' + round(rad2deg(pitch)) + '&deg;<br>' +
        'Roll: ' + round(rad2deg(roll)) + '&deg;<br>' +
        'Jump: ' + round(jumpSpeed, 1) + '<br>' +
        '<br>' +
        'Filters:<br>' +
        '&nbsp; [<code>1</code>] Outline objects.<br>' +
        '&nbsp; [<code>2</code>] Blur objects.<br>';

    var camera = new nmlorg.Camera();
    camera.rotateX(-pitch);
    camera.rotateY(yaw);
    camera.translate(-pos[0], -pos[1] - cameraHeight, -pos[2]);
    colorShader.setCameraPosition(camera.getM_().m_);
    fb.activate();
    context.clear();
    for (var y of [-1, 5])
      for (var x = -20; x < 20; x++)
        for (var z = -20; z < 20; z++)
          block.draw([1, 0, 0, x,
                      0, 1, 0, y,
                      0, 0, 1, z,
                      0, 0, 0, 1]);
    fb.deactivate();

    if (filters & (1 << 1))
      fb.applyFilterShader(outlineShader);
    if (filters & (1 << 2))
      fb.applyFilterShader(blurShader);

    context.drawTexture(fb.buffers[0].colorTexture);
    context.drawTexture(fb.buffers[0].depthTexture, .5, .9, .5, .9);

    window.requestAnimationFrame(anim);
  });
});


function deg2rad(value) {
  return Math.PI * value / 180;
}


function rad2deg(value) {
  return 180 * value / Math.PI;
}


function round(value, digits) {
  var mult = Math.pow(10, digits || 0);
  return Math.round(value * mult) / mult;
}

})();

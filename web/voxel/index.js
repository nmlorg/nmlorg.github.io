(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


var mouseSensitivity = .25;
var forwardPerSec = 5;
var backPerSec = 2;
var strafePerSec = 3;


window.addEventListener('load', function(e) {
  var viewportDiv = document.createElement('div');
  document.body.appendChild(viewportDiv);
  viewportDiv.classList.add('viewport');
  var canvasDiv = document.createElement('div');
  viewportDiv.appendChild(canvasDiv);
  canvasDiv.classList.add('canvas');
  var escapedDiv = document.createElement('div');
  viewportDiv.appendChild(escapedDiv);
  escapedDiv.classList.add('escaped');
  var escapedBoxDiv = document.createElement('div');
  escapedDiv.appendChild(escapedBoxDiv);
  escapedBoxDiv.classList.add('box');
  escapedBoxDiv.textContent = 'Press Esc to toggle between navigation and menu mode.';

  var pos = [0, 0, 0];
  var yaw = 0, pitch = 0, roll = 0;

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

  document.addEventListener('keydown', function(e) {
    keyboard.add(e.keyCode);
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

  var prev = 0;
  window.requestAnimationFrame(function anim(now) {
    var dt = prev && (now - prev) / 1000;
    prev = now;

    if (keyboard.has(65) && !keyboard.has(68)) {  // A
      pos[0] += Math.sin(yaw - Math.PI / 2) * strafePerSec * dt;
      pos[2] -= Math.cos(yaw - Math.PI / 2) * strafePerSec * dt;
    } else if (keyboard.has(68) && !keyboard.has(65)) {  // D
      pos[0] += Math.sin(yaw + Math.PI / 2) * strafePerSec * dt;
      pos[2] -= Math.cos(yaw + Math.PI / 2) * strafePerSec * dt;
    }

    if (keyboard.has(83) && !keyboard.has(87)) {  // S
      pos[0] -= Math.sin(yaw) * backPerSec * dt;
      pos[2] += Math.cos(yaw) * backPerSec * dt;
    } else if (keyboard.has(87) && !keyboard.has(83)) {  // W
      pos[0] += Math.sin(yaw) * forwardPerSec * dt;
      pos[2] -= Math.cos(yaw) * forwardPerSec * dt;
    }

    canvasDiv.innerHTML = 'Position: ' +
        JSON.stringify([round(pos[0], 1), round(pos[1], 1), round(pos[2], 1)]) + '<br>' +
        'Yaw: ' + round(rad2deg(yaw)) + '&deg;<br>' +
        'Pitch: ' + round(rad2deg(pitch)) + '&deg;<br>' +
        'Roll: ' + round(rad2deg(roll)) + '&deg;';
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

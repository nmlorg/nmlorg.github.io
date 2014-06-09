/**
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

nmlorg.require('nmlorg.game.mob');
nmlorg.require('nmlorg.io.audio');
nmlorg.require('nmlorg.io.gamepad');
nmlorg.require('nmlorg.io.keyboard');
nmlorg.require('nmlorg.io.orient');


/** @namespace */
nmlorg.game.player = nmlorg.game.player || {};


nmlorg.game.player.Player = function(initial, sideScroll) {
  if (!nmlorg.game.player.sounds)
    nmlorg.game.player.sounds = {
        'step': new nmlorg.io.audio.Sound('/third_party/503990_SOUNDDOGS__fo.mp3'),
    };

  this.keyboard = new nmlorg.io.keyboard.Listener(true);
  this.orient = new nmlorg.io.orient.Listener();
  this.mob = new nmlorg.game.mob.Mobile(initial);
  this.sideScroll = !!sideScroll;
};


nmlorg.game.player.Player.prototype.viewMode = 0;
nmlorg.game.player.Player.prototype.eyeAngle = 0;
nmlorg.game.player.Player.prototype.fovAngle = 45;
nmlorg.game.player.Player.prototype.lastStepSound = 0;


nmlorg.game.player.Player.prototype.eachFrame = function(timeStep) {
  var gamepad = nmlorg.io.gamepad.getFirst();

  if (this.keyboard['1'])
    this.viewMode = 0;
  else if (this.keyboard['2'])
    this.viewMode = 1;
  else if (this.keyboard['3'])
    this.viewMode = 2;

  if (this.keyboard.Q) {
    this.eyeAngle += timeStep * 45;
    if (this.eyeAngle > 90)
      this.eyeAngle = 90;
  }

  if (this.keyboard.Z) {
    this.eyeAngle -= timeStep * 45;
    if (this.eyeAngle < -90)
      this.eyeAngle = -90;
  }

  if (this.keyboard[';']) {
    this.fovAngle -= timeStep * 45;
    if (this.fovAngle < 1)
      this.fovAngle = 1;
  }

  if (this.keyboard['=']) {
    this.fovAngle += timeStep * 45;
    if (this.fovAngle > 170)
      this.fovAngle = 170;
  }

  var walk = 0, slide = 0, turn = 0;
  var left = this.keyboard.Left || this.keyboard.A || (this.orient.y < -10) ||
      gamepad.Left || ((gamepad.rightStickMag > .2) && (gamepad.rightStick < -1 / 6));
  var right = this.keyboard.Right || this.keyboard.D || (this.orient.y > 10) ||
      gamepad.Right || ((gamepad.rightStickMag > .2) && (gamepad.rightStick > 1 / 6));
  var up = this.keyboard.Up || this.keyboard.W || (this.orient.x < -10) ||
      gamepad.Up || ((gamepad.leftStickMag > .2) && (Math.abs(gamepad.leftStick) < 2 / 6));
  var down = this.keyboard.Down || this.keyboard.S || (this.orient.x > 10) ||
      gamepad.Down || ((gamepad.leftStickMag > .2) && (Math.abs(gamepad.leftStick) > 4 / 6));
  var slideLeft = this.keyboard['<'] ||
      ((gamepad.leftStickMag > .2) && (gamepad.leftStick < -1 / 6) && (gamepad.leftStick > -5 / 6));
  var slideRight = this.keyboard['>'] ||
      ((gamepad.leftStickMag > .2) && (gamepad.leftStick > 1 / 6) && (gamepad.leftStick < 5 / 6));

  if (this.sideScroll) {
    left = left || slideLeft;
    right = right || slideRight;

    if (this.mob.pos.z) {
    } else if (up && !down) {
      if (left && !right)
        this.mob.direction = 90 + 45;
      else if (right && !left)
        this.mob.direction = 45;
      else
        this.mob.direction = 90;
      walk = 1;
    } else if (down && !up) {
      if (left && !right)
        this.mob.direction = 180 + 45;
      else if (right && !left)
        this.mob.direction = 360 - 45;
      else
        this.mob.direction = 180 + 90;
      walk = 1;
    } else if (left && !right) {
      this.mob.direction = 180;
      walk = 1;
    } else if (right && !left) {
      this.mob.direction = 0;
      walk = 1;
    }
  } else {
    if (left)
      turn++;

    if (right)
      turn--;

    if (up) {
      walk++;
      if (this.eyeAngle != 0)
        this.eyeAngle -= timeStep * this.eyeAngle / 2;
      if (this.fovAngle != 45)
        this.fovAngle -= timeStep * (this.fovAngle - 45) / 10;
    }

    if (down) {
      walk--;
      if (this.eyeAngle != 0)
        this.eyeAngle -= timeStep * this.eyeAngle / 3;
      if (this.fovAngle != 45)
        this.fovAngle -= timeStep * (this.fovAngle - 45) / 15;
    }

    if (slideLeft)
      slide--;

    if (slideRight)
      slide++;
  }

  var jump = this.keyboard.Space ||
      ((this.orient.dx * this.orient.dx + this.orient.dy * this.orient.dy + this.orient.dz * this.orient.dz) > 16) ||
      gamepad.A;

  var run = this.keyboard.Shift || (gamepad.leftStickMag > .9);

  this.mob.eachFrame(timeStep, walk, slide, turn, jump, run);

  if (!this.mob.walkTime)
    this.lastStepSound = 0;
  else if ((this.mob.walkTime - this.lastStepSound) >= .3) {
    nmlorg.game.player.sounds.step.play();
    if ((this.mob.walkTime - this.lastStepSound) < 1)
      this.lastStepSound += .3;
    else
      this.lastStepSound = this.mob.walkTime;
  }
};


})();

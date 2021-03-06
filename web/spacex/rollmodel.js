(function() {

/** @namespace */
spacex = window.spacex || {};


/**
 * A model of the vehicle's roll/banking angle.
 * @param {spacex.Vehicle} vehicle The vehicle to render.
 * @constructor
 */
spacex.RollModel = function(vehicle) {
  this.vehicle_ = vehicle;
  this.canvas_ = document.createElement('canvas');
  this.canvas_.className = 'rollmodel';
  this.canvas_.width = this.canvas_.height = this.dim_;
  this.ctx_ = this.canvas_.getContext('2d');
};


spacex.RollModel.prototype.dim_ = 1000;
spacex.RollModel.prototype.y_ = 0;


/**
 * Add the model's viewport to the document.
 * @param {HTMLElement} parent An element reachable via document.body.
 */
spacex.RollModel.prototype.attach = function(parent, x, y) {
  parent.appendChild(this.canvas_);
  this.canvas_.style.left = (x || 0) + 'vw';
  this.canvas_.style.top = (y || 0) + 'vw';
  return this;
};


/**
 * Draw the model to its viewport based on the given yaw, pitch, and roll. When level, pitch and
 * roll will be 0. Yaw (compass heading) is not used.
 * @param {number} dt The amount of time to advance, in seconds.
 */
spacex.RollModel.prototype.draw = function(dt) {
  var ctx = this.ctx_;

  this.y_ = (this.y_ + this.dim_ / 10 + this.vehicle_.velocity / 200 * Math.cos(this.vehicle_.pitch * Math.PI / 180) * dt) % (this.dim_ / 10);

  ctx.clearRect(0, 0, this.dim_, this.dim_);
  ctx.save();
    // Move the origin to the center of the viewport.
    ctx.translate(this.dim_ / 2, this.dim_ / 2);
    // Rotate the viewport about the origin (now the center).
    ctx.rotate(-this.vehicle_.roll * Math.PI / 180);
    // Move the origin back to the upper-left corner.
    ctx.translate(-this.dim_ / 2, -this.dim_ / 2);
    // Draw the sky.
    ctx.fillStyle = 'rgba(0, 0, 128, .5)';
    ctx.fillRect(0, 0, this.dim_, this.dim_ / 2);
    // Draw the ground.
    ctx.fillStyle = 'rgba(165, 42, 42, .5)';
    ctx.fillRect(0, this.dim_ / 2, this.dim_, this.dim_ / 2);
    // Draw some surface features to clearly indicate direction of motion.
    ctx.strokeStyle = 'rgba(42, 165, 42, .5)';
    for (var i = 0; i < 10; i++)
      for (var j = -1; j < 5; j++) {
        var y = this.y_ + j * this.dim_ / 10;
        var height = this.dim_ / 10;

        if (y < 0) {
          height += y;
          y = 0;
        }
        ctx.strokeRect(i * this.dim_ / 10, this.dim_ / 2 + y, this.dim_ / 10, height);
      }
  ctx.restore();

  var camera = new spacex.Camera();

  camera.rotateY(-90);
  camera.rotateZ(this.vehicle_.pitch);
  spacex.model.drawVehicle(ctx, camera);

  return this;
};

})();

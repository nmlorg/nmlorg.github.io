/**
 * @author Daniel Reed &lt;<a href="mailto:n@ml.org">n@ml.org</a>&gt;
 */

(function() {

nmlorg.require('nmlorg.game.platforms');


/** @namespace */
nmlorg.game.builder = nmlorg.game.builder || {};


nmlorg.game.builder.Builder = function(platforms) {
  this.pset = new nmlorg.game.platforms.PlatformSet();
  this.platforms = [];

  if (platforms)
    for (var i = 0; i < platforms.length; i++)
      this.add.apply(this, platforms[i]);
};


nmlorg.game.builder.Builder.prototype.right = 0;
nmlorg.game.builder.Builder.prototype.near = 0;
nmlorg.game.builder.Builder.prototype.far = 0;
nmlorg.game.builder.Builder.prototype.defaultThickness = 5;


nmlorg.game.builder.Builder.prototype.add = function(
    left, width, height, thickness, yOff) {
  if (!thickness)
    thickness = this.defaultThickness;
  if (!yOff)
    yOff = 0;

  this.right = Math.max(this.right, left + width);
  this.near = Math.min(this.near, yOff - thickness / 2);
  this.far = Math.max(this.far, yOff + thickness / 2);

  var platform = this.pset.add(width, thickness);

  if (!this.first)
    this.first = platform;

  this.platforms.push(platform.getLeft(-left, -yOff, -height));
};


nmlorg.game.builder.Builder.prototype.build = function() {
  //var ground = this.pset.add(this.right, this.far - this.near).getLeft(0, 0, 0);
  var ground = this.pset.add(this.right, this.defaultThickness).getLeft(0, 0, 0);

  for (var i = 0; i < this.platforms.length; i++)
    nmlorg.game.platforms.connect(ground, this.platforms[i]);

  for (var i = 0; i < this.pset.length; i++) {
    var platform = this.pset[i];
    var loc = this.first.localize(platform.getCenter(0, 0, 0));

    if (loc)
      world.addObject(nmlorg.game.rectangles.getRectangle(
          platform.right - platform.left,
          platform.rear - platform.front)).setPosition(loc.x, loc.y, loc.z);
  }

  this.pset.autoConnect();
  return this.first;
};


})();
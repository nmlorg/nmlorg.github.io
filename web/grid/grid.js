(function() {

/** @namespace */
var nmlorg = window['nmlorg'] = window['nmlorg'] || {};


/**
 * @constructor
 * @param {number} width The width of the canvas in cells.
 * @param {number} height The height of the canvas in cells.
 */
nmlorg.Grid = function(width, height) {
  this.body_ = document.createElement('div');
  this.body_.classList.add('grid');
  this.cellWidth = this.cellHeight = 32;
  this.width = width;
  this.height = height;
  this.bgCtx_ = this.makeCanvasContext();
  this.gridCtx_ = this.makeCanvasContext();
  this.gridCtx_.canvas.classList.add('while-editing');
  this.setGrid();
  this.fgCtx_ = this.makeCanvasContext();
  this.uiCtx_ = this.makeCanvasContext();
  this.cells_ = {};
  this.addMouseHandler_();
};
nmlorg['Grid'] = nmlorg.Grid;


/**
 * Add one or more tiles to the given foreground cell.
 * @param {number} col The column (in cells).
 * @param {number} row The row (in cells).
 * @param {...nmlorg.Tile} tile The tile or tiles to add.
 */
nmlorg.Grid.prototype.addForeground = function(col, row, tile) {
  var offset = row * this.width + col;

  if (!this.cells_[offset])
    this.cells_[offset] = [];
  this.cells_[offset].push(...[...arguments].slice(2));
};


nmlorg.Grid.prototype.addMouseHandler_ = function() {
  var body = this.body_;
  var lastCol = -1, lastRow = -1, layer = 'bg';

  var onMouseMove = function(e) {
    var pos = this.getPositionFromEvent_(e);
    var col = Math.floor(this.width * pos[0]), row = Math.floor(this.height * pos[1]);
    if ((col != lastCol) || (row != lastRow)) {
      if (layer == 'fg') {
        var cell = this.getForeground(lastCol, lastRow);
        if (cell && cell.length)
          this.addForeground(col, row, cell.pop());
      }
      lastCol = col;
      lastRow = row;
      this.draw();
    }
  }.bind(this);

  var onMouseDown = function(e) {
    body.classList.add('editing');
    lastCol = lastRow = -1;
    var pos = this.getPositionFromEvent_(e);
    var x = pos[0] * this.uiCtx_.canvas.width, y = pos[1] * this.uiCtx_.canvas.height;
    if (this.uiCtx_.getImageData(x, y, 1, 1).data[3] > 10)
      layer = 'ui';
    else if (this.fgCtx_.getImageData(x, y, 1, 1).data[3] > 10)
      layer = 'fg';
    else
      layer = 'bg';
    console.log('click layer', layer);
  }.bind(this);

  body.addEventListener('mousedown', function(e) {
    onMouseDown(e);
    this.addEventListener('mousemove', onMouseMove);
  });

  body.addEventListener('touchstart', function(e) {
    if (e.touches.length == 1) {
      onMouseDown(e);
      this.addEventListener('touchmove', onMouseMove);
      e.preventDefault();
    }
  });

  body.addEventListener('mouseup', function(e) {
    this.removeEventListener('mousemove', onMouseMove);
    this.classList.remove('editing');
  });

  body.addEventListener('touchend', function(e) {
    this.removeEventListener('touchmove', onMouseMove);
    this.classList.remove('editing');
  });
};


/**
 * Add the grid's viewport to the document.
 * @param {HTMLElement} parent An element reachable at or from document.body.
 * @returns {nmlorg.Grid}
 */
nmlorg.Grid.prototype.attach = function(parent) {
  parent.appendChild(this.body_);
  this.body_.focus();
  return this;
};
nmlorg.Grid.prototype['attach'] = nmlorg.Grid.prototype.attach;


/**
 * Redraw the foreground canvas.
 */
nmlorg.Grid.prototype.draw = function() {
  var ctx = this.fgCtx_;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (var col = 0; col < this.width; col++) {
    for (var row = 0; row < this.height; row++) {
      var tiles = this.getForeground(col, row);
      if (tiles) {
        var subCells = tiles.length + 3;
        for (var i = 0; i < tiles.length; i++) {
          var tile = tiles[i];
          tile.draw(
              ctx, (col + i / subCells) * this.cellWidth, (row + i / subCells) * this.cellHeight,
              this.cellWidth * 4 / subCells, this.cellHeight * 4 / subCells);
        }
      }
    }
  }
};
nmlorg.Grid.prototype['draw'] = nmlorg.Grid.prototype.draw;


/**
 * Get the given foreground cell's tile stack.
 * @param {number} col The column (in cells).
 * @param {number} row The row (in cells).
 * @returns {?Array.<nmlorg.Tile>}
 */
nmlorg.Grid.prototype.getForeground = function(col, row) {
  var offset = row * this.width + col;

  return this.cells_[offset];
};


nmlorg.Grid.prototype.getPositionFromEvent_ = function(e) {
  if (e instanceof TouchEvent)
    var x = e.touches[0].clientX, y = e.touches[0].clientY;
  else if (e instanceof MouseEvent)
    var x = e.offsetX, y = e.offsetY;
  var rect = e.target.getBoundingClientRect();
  return [x / rect.width, y / rect.height];
};


/**
 * Create a canvas and add it to the rendering stack.
 * @returns {!CanvasRenderingContext2D}
 */
nmlorg.Grid.prototype.makeCanvasContext = function() {
  var canvas = document.createElement('canvas');
  this.body_.appendChild(canvas);
  canvas.width = this.width * this.cellWidth;
  canvas.height = this.height * this.cellHeight;
  return canvas.getContext('2d');
};


/**
 * Redraw the background layer with the given tile in all cells.
 * @param {nmlorg.Tile} tile The tile to draw.
 */
nmlorg.Grid.prototype.setBackground = function(tile) {
  var ctx = this.bgCtx_;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (var col = 0; col < this.width; col++)
    for (var row = 0; row < this.height; row++)
      tile.draw(ctx, col * this.cellWidth, row * this.cellHeight, this.cellWidth, this.cellHeight);
};
nmlorg.Grid.prototype['setBackground'] = nmlorg.Grid.prototype.setBackground;


/**
 * Redraw the editing grid layer.
 */
nmlorg.Grid.prototype.setGrid = function() {
  var ctx = this.gridCtx_;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (var col = 0; col < this.width; col++) {
    for (var row = 0; row < this.height; row++) {
      if ((col + row) % 2)
        ctx.fillStyle = 'rgba(0, 0, 0, .1)';
      else
        ctx.fillStyle = 'rgba(255, 255, 255, .1)';
      ctx.fillRect(col * this.cellWidth, row * this.cellHeight, this.cellWidth, this.cellHeight);
    }
  }
};


/**
 * Replace the given foreground cell with zero or more tiles.
 * @param {number} col The column (in cells).
 * @param {number} row The row (in cells).
 * @param {...nmlorg.Tile} tile The tile or tiles to add.
 */
nmlorg.Grid.prototype.setForeground = function(col, row, tile) {
  var offset = row * this.width + col;

  this.cells_[offset] = [...arguments].slice(2);
};
nmlorg.Grid.prototype['setForeground'] = nmlorg.Grid.prototype.setForeground;

})();
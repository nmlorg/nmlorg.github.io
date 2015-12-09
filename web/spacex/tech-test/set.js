(function() {

/** @namespace */
spacex = window.spacex || {};


/**
 * A spacex.Set object stores only unique values. This is similar to
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set, but treats
 * objects with the same destructured value the same. That is, with window.Set,
 * a = [1, 2]; set.add(a); set.add(a); would end up with only one entry in set, while
 * set.add([1, 2]); set.add([1, 2]); would end up with two; with spacex.Set, both would end up with
 * only one entry in set.
 * @constructor
 */
spacex.Set = function(initial) {
  this.values_ = {};
  if ((typeof initial == 'string') || (initial instanceof String))
    initial = JSON.parse(initial);
  if (initial)
    for (var value of initial)
      this.add(value);
};


spacex.Set.prototype[Symbol.iterator] = function*() {
  for (var k in this.values_)
    yield this.values_[k];
};


spacex.Set.prototype.add = function(value) {
  return this.values_[JSON.stringify(value)] = value;
};


spacex.Set.prototype.delete = function(value) {
  delete this.values_[JSON.stringify(value)];
};


spacex.Set.prototype.has = function(value) {
  return JSON.stringify(value) in this.values_;
};


spacex.Set.prototype.values = function() {
  var values = [];
  for (var value of this)
    values.push(value);
  return values;
};


spacex.Set.prototype.toString = function() {
  return JSON.stringify(this.values());
};

})();

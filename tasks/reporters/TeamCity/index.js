module.exports = function(grunt) {
  var tsm = require('teamcity-service-messages');
  var counters = {
    error: 0,
    info: 0,
    total: 0,
    warning: 0,
    complex: 0,
    maintain: 0
  };

  /**
   * @param {*} val - value to convert to string and pad up to #len spaces on left, for longer string last #len symbols will be taken
   * @param {Number} len - padding size
   * @returns {String} padded/cropped string
   */
  function pad (val, len) {
    return String(Array(len + 1).join(' ') + val).slice(-len);
  }

  /**
   * @param {...*} - list of args to calculate max string length
   * @returns {Number} max string length
   */
  function maxlen () {
    return Array.prototype.slice.call(arguments).reduce(function(p, v) {
      return Math.max(String(v).length, p);
    }, 0);
  }

  var TeamCityReporter = function(filenames, options) {
    this.options = options;
  };

  TeamCityReporter.prototype = {

    violations: function(filepath, violations) {
      violations.forEach(function(data) {
        counters[data.severity]++;
        counters.total++;
        if (data.complex) {
          counters.complex++;
        } else if (data.unmaintainable) {
          counters.maintain++;
        }
      }, this);
    },

    start: function() {
      counters.error = 0;
      counters.info = 0;
      counters.total = 0;
      counters.warning = 0;
      counters.complex = 0;
      counters.maintain = 0;
    },

    finish: function() {
      var len = maxlen(counters.info, counters.warning, counters.error, counters.complex, counters.maintain);
      tsm.buildStatisticValue({ key: 'Complexity Info', value: pad(counters.info, len)});
      tsm.buildStatisticValue({ key: 'Complexity Warning', value: pad(counters.warning, len)});
      tsm.buildStatisticValue({ key: 'Complexity Error', value: pad(counters.error, len)});
      tsm.buildStatisticValue({ key: 'Complexity Complexity', value: pad(counters.complex, len)});
      tsm.buildStatisticValue({ key: 'Complexity Maintainability', value: pad(counters.maintain, len)});
      //grunt.log.writeln(JSON.stringify(data));
    }

  };


  return TeamCityReporter;
};

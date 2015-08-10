/*global module:false*/
var cr = require('complexity-report');

module.exports = function(grunt) {

  var MultiReporter = require('./reporters/multi')(grunt);
  var ConsoleReporter = require('./reporters/Console')(grunt);
  var XMLReporter = require('./reporters/XML')(grunt);
  var pmdReporter = require('./reporters/PmdXML')(grunt, XMLReporter);


  var Complexity = {

    defaultOptions: {
      fail: true,
      failOn: 'error',
      cyclomatic: [3, 7, 12],
      halstead: [8, 13, 20],
      maintainability: 100
    },

    levels: [
      'info',
      'warning',
      'error'
    ],

    buildReporter: function(files, options) {
      var reporter = new MultiReporter(files, options);
      reporter.addReporter(ConsoleReporter);
      if(options.pmdXML) {
        reporter.addReporter(pmdReporter);
      }
      return reporter;
    },

    isComplex: function(data,options,measure,index) {
      index = index || 0;
      return data.complexity[measure] > options[measure][index];
    },

    cyclomatic: function(data,target,levels) {

      levels.forEach(function(level, i) {
        if(data.complexity.cyclomatic > target[i]) {
          data.value = Math.round(data.complexity.cyclomatic * 100) / 100;
          data.complex = true;
          data.severity = level;
          data.rule = 'Complexity';
          data.message = 'Cyclomatic complexity is high';
        }
      });

      return data;
    },

    halstead: function(data,target,levels) {

      levels.forEach(function(level, i) {
        if(data.complexity.halstead.difficulty > target[i]) {
          data.value = Math.round(data.complexity.halstead.difficulty * 100) / 100;
          data.complex = true;
          data.severity = level;
          data.rule = 'Complexity';
          data.message = 'Halstead difficulty is high';
        }
      });

      return data;
    },

    maintainability: function(data,target,levels) {

      var targets = [
        target * 1.4,
        target * 1.2,
        target
      ];

      var violation;

      levels.forEach(function(level, i) {
        if(data.maintainability < targets[i]) {
          violation = {
            value: Math.round(data.maintainability * 100) / 100,
            unmaintainable: true,
            severity: level,
            rule: 'Maintainability',
            message: 'Code is difficult to maintain',
            line: 0,
            name: ''
          };
        }
      });

      return violation;
    },

    reportViolations: function(reporter, analysis, filepath, options) {

      var levels = this.levels;
      var cyclomatic = this.cyclomatic;
      var halstead = this.halstead;
      var maintainability = this.maintainability;

      var violations = analysis.functions.map(function(data) {
        return cyclomatic(data, options.cyclomatic,levels);
      }, this).map(function(data) {
        return halstead(data, options.halstead,levels);
      }, this).map(function(data) {
        data.filepath = filepath;
        return data;
      }, this).filter(function(data) {
        return data.complex;
      }, this);

      var maintain = maintainability(analysis,options.maintainability, levels);
      if(maintain) {
        maintain.filepath = filepath;
        violations = violations.concat(maintain);
      }

      var failures = violations.filter(function(data){
        return data.severity === options.failOn;
      });

      grunt.fail.errorcount += failures.length;

      reporter.violations(filepath, violations);

    },

    analyze: function(reporter, files, options) {
      reporter.start();

      files.map(function(filepath) {
        var content = grunt.file.read(filepath);
        return {
          filepath: filepath,
          analysis: cr.run(content, options)
        };
      }).sort(function (info1, info2) {
        return info1.analysis.maintainability - info2.analysis.maintainability;
      }).forEach(function (info) {
        this.reportViolations(reporter, info.analysis, info.filepath, options);
      }, this);

      reporter.finish();
    }

  };

  grunt.registerMultiTask('complexity', 'Determines complexity of code.', function() {
    var files = this.filesSrc || grunt.file.expandFiles(this.file.src);
    var excluded = this.data.exclude;

    // Exclude any unwanted files from 'files' array
    if (excluded) {
      grunt.file.expand(excluded).forEach(function(){
        files.splice(files.indexOf(this), 1);
      });
    }

    // Set defaults
    var options = this.options(Complexity.defaultOptions);
    var reporter = Complexity.buildReporter(files, options);
    Complexity.analyze(reporter, files, options);

    return options.fail === false || this.errorCount === 0;
  });

  return Complexity;

};

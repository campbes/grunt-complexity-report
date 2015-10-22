module.exports = function(grunt) {
	var icons = {
		error: '⁂ ',
		info: '*',
		warning: '⁑'
	}

	var counters = {
		error: 0,
		info: 0,
		total: 0,
		warning: 0,
		complex: 0,
		maintain: 0
        }

	var DotsReporter = function(filenames, options) {
		this.options = options;
	};

	DotsReporter.prototype = {

		colors: {
			info: 'grey',
			warning: 'yellow',
			error: 'red'
		},

		violations: function(filepath, violations) {
			violations.forEach(function(data) {
				counters[data.severity]++;
				counters.total++;
				if(data.complex) {
					counters.complex++;
				} else if (data.unmaintainable) {
					counters.maintain++;
				}
				this.log(icons[data.severity][this.colors[data.severity]]);
			}, this);
		},

		start: function() {
			grunt.log.writeln('======================================================================'.green);
			grunt.log.writeln(' Complexity report '.green);
			grunt.log.writeln('——————————————————————————————————————————————————————————————————————'.green);
			counters.error = 0;
			counters.info = 0;
			counters.total = 0;
			counters.warning = 0;
			counters.complex = 0;
			counters.maintain = 0;
		},

		finish: function() {
			grunt.log.writeln(' ');
			grunt.log.writeln('——————————————————————————————————————————————————————————————————————'.green);
			grunt.log.write  (' Low: '.green + String('   ' + counters.info).slice(-3).grey);
			grunt.log.write          ('        High: '.green + String('   ' + counters.warning).slice(-3).yellow);
			grunt.log.write                          ('             Critical: '.green + String('   ' + counters.error).slice(-3).red);
			grunt.log.writeln(' ');
			grunt.log.write((' Complexity: ' + String('   ' + counters.complex).slice(-3)).green);
			grunt.log.write                 ((' Maintainability: ' + String('   ' + counters.maintain).slice(-3)).green);
			grunt.log.writeln(' ');
			grunt.log.writeln('======================================================================'.green);
		},

		log: function(message, display) {
//			grunt.log.write(counters.total);
			if (!(counters.total % 60)) {
				grunt.log.writeln(' ');
			}
			message = message || '';
			grunt.log.write(message);
		}

	};


	return DotsReporter;
};

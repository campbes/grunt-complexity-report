module.exports = function(grunt) {
	var headTpl = require('fs').readFileSync(__dirname + '/head.tpl').toString();
	var tailTpl = require('fs').readFileSync(__dirname + '/tail.tpl').toString();
	var template = grunt.template.process;
	var icons = {
		error: '⁂ ',
		info: '*',
		warning: '⁑'
	};

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
		return String(Array(len+1).join(' ') + val).slice(-len);
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
			grunt.log.writeln(headTpl.green);
			counters.error = 0;
			counters.info = 0;
			counters.total = 0;
			counters.warning = 0;
			counters.complex = 0;
			counters.maintain = 0;
		},

		finish: function() {
			var len = maxlen(counters.info, counters.warning, counters.error, counters.complex, counters.maintain);
			var data = {
				info: pad(counters.info, len),
				warning: pad(counters.warning, len),
				error: pad(counters.error, len),
				complex: pad(counters.complex, len),
				maintain: pad(counters.maintain, len)
			};
			var message = template(tailTpl, {
				data: data
			});
			grunt.log.writeln(message.green);
		},

		log: function(message, display) {
			if ((counters.total % 60) === 0) {
				grunt.log.writeln(' ');
			}
			message = message || '';
			grunt.log.write(message);
		}

	};


	return DotsReporter;
};

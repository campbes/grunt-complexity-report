module.exports = function(grunt) {
	var complexityTpl = require('fs').readFileSync(__dirname + '/complexity.tpl').toString();
	var maintainabilityTpl = require('fs').readFileSync(__dirname + '/maintainability.tpl').toString();
	var template = grunt.template.process;


	var ConsoleReporter = function(filenames, options) {
		this.options = options;
	};

	ConsoleReporter.prototype = {

		colors: {
			info: 'grey',
			warning: 'yellow',
			error: 'red'
		},

		violations: function(filepath, violations) {
			var message;
			violations.forEach(function(data) {
				if(data.complex) {
					message = template(complexityTpl, {
						data: data
					});
				} else if (data.unmaintainable) {
					message = template(maintainabilityTpl, {
						data: data
					});
				}
				this.log(message[this.colors[data.severity]]);
			}, this);
		},

		start: function() {
			this.log(' ');
		},

		finish: function() {},

		log: function(message, display) {
			message = message || '';
			grunt.log.writeln(message);
		}

	};


	return ConsoleReporter;
};

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    files: {
      js: [
        "lib/pft.js",
        "lib/pft/objects/logger.js",
        "lib/pft/classes/basePage.js",
        "lib/pft/objects/tester.js",
        "lib/pft/polyfills.js",
      ],
      tests: "test/tests.html"
    },
    clean: {
      build: {
        src: ['dist/**/*'],
        filter: 'isFile',
      },
    },
    uglify: {
      buildBeatified: {
        options: {
          beautify: true,
          mangle: false,
          sourceMap: false,
          banner: '/*! <%= pkg.name %> v<%= pkg.version %>, created by: <%= pkg.author.name %> <%= pkg.author.email %> <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> */\n'
        },
        files: {
          'dist/<%= pkg.name %>.js': ['<%= files.js %>']
        }
      }
    },
    file_append: {
      default_options: {
        files: [
          {
            append: "\nmodule ? module.exports = PFT : ;",
            input: 'dist/<%= pkg.name %>.js',
            output: 'dist/<%= pkg.name %>-module.js'
          }
        ]
      }
    },
    jsdoc : {
      dist : {
        src: ['<%= files.js %>'],
        options: {
          destination: 'dist/doc'
        }
      }
    },
    qunit: {
      all: ['<%= files.tests %>']
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Load the plugin that provides the "clean" task.
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Load the plugin that provides the "file_append" task.
  grunt.loadNpmTasks('grunt-file-append');

  // Load the plugin that provides the "jsdoc" task.
  grunt.loadNpmTasks('grunt-jsdoc');

  // This plugin provides the "qunit" task.
  grunt.loadNpmTasks('grunt-contrib-qunit');

  // Default task(s).
  grunt.registerTask('default', ['clean','qunit','uglify','file_append','jsdoc']);

  // build only
  grunt.registerTask('build', ['clean','ugilify','file_append']);

  // test only
  grunt.registerTask('test', ['qunit']);

};

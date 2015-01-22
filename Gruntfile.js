module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    files: {
      js: [
        "pft.js",
        "pft/shims/page.js",
        "pft/shims/phantom.js",
        "pft/shims/system.js",
        "pft/objects/logger.js",
        "pft/classes/basePage.js",
        "pft/objects/tester.js",
        "pft/polyfills.js",
      ],
    },
    clean: {
      build: {
        src: ['dist/**/*'],
        filter: 'isFile',
      },
    },
    uglify: {
      options: {
        // beautify: true,
        mangle: true,
        compress: {
          "dead_code": false
        },
        sourceMap: true,
      },
      build: {
        options: {
          banner: '/*! <%= pkg.name %> v<%= pkg.version %>, created by: <%= pkg.author %> <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> */'
        },
        files: {
          'dist/<%= pkg.name %>-<%= pkg.version %>.min.js': ['<%= files.js %>']
        }
      },
    },
    file_append: {
      default_options: {
        files: [
          {
            append: "\nmodule.exports = PFT;",
            input: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js',
            output: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
          }
        ]
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Load the plugin that provides the "clean" task.
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Load the plugin that provides the "file_append" task.
  grunt.loadNpmTasks('grunt-file-append');

  // Default task(s).
  grunt.registerTask('default', ['clean','uglify','file_append']);

};
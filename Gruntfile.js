module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    files: {
      js: [
        "lib/pft.js",
        "lib/pft/shims/page.js",
        "lib/pft/shims/phantom.js",
        "lib/pft/shims/system.js",
        "lib/pft/objects/logger.js",
        "lib/pft/classes/basePage.js",
        "lib/pft/objects/tester.js",
        "lib/pft/polyfills.js",
      ],
    },
    clean: {
      build: {
        src: ['dist/**/*'],
        filter: 'isFile',
      },
    },
    uglify: {
      buildMinified: {
        options: {
          mangle: true,
          compress: {
            "dead_code": false
          },
          sourceMap: true,
          banner: '/*! <%= pkg.name %> v<%= pkg.version %>, created by: <%= pkg.author.name %> <%= pkg.author.email %> <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> */'
        },
        files: {
          'dist/<%= pkg.name %>-<%= pkg.version %>.min.js': ['<%= files.js %>']
        }
      },
      buildBeatified: {
        options: {
          beautify: true,
          mangle: false,
          sourceMap: false,
          banner: '/*! <%= pkg.name %> v<%= pkg.version %>, created by: <%= pkg.author.name %> <%= pkg.author.email %> <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> */'
        },
        files: {
          'dist/<%= pkg.name %>-<%= pkg.version %>.js': ['<%= files.js %>']
        }
      }
    },
    file_append: {
      default_options: {
        files: [
          {
            append: "\nmodule.exports = PFT;",
            input: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js',
            output: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
          },
          {
            append: "\nmodule.exports = PFT;",
            input: 'dist/<%= pkg.name %>-<%= pkg.version %>.js',
            output: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
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

  // Default task(s).
  grunt.registerTask('default', ['clean','uglify']);//,'file_append','jsdoc']);

  // no documentation
  grunt.registerTask('nodoc', ['clean','ugilify']);//,'file_append']);

};
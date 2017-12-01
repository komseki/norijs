module.exports = function(grunt) {
    var path = require('path');
    

	grunt.initConfig({
		jshint:{
			options : {
				sub:true
			},
			globals : {
				jQuery : true
			},
			all : ['*.js', '*.hbs', '*.html']
		},
		watch : {
			jshint : {
				files : ['<%= jshint.all %>'],
				tasks: 'default'
			}
		},
		concat : {
			crypto : {
				src : ['js/libs/crypto/*.js'],
				dest : 'js/libs/crypto/crypto-core-md5-min.js'
			}
		},
        /*
		concat : {
			comp : {
				options : {
					separator : '\n',
					banner : "(function( window, document, $, $$ ){\n'use strict';\n",
					footer : "\n})(window, document, jQuery, m5c);"
				},
				src : ['src/js/components/component.js', 'src/js/components/*.js'],
				dest : 'src/js/dist/m5c.client.components.js'
			},
			core : {
				options : {
					separator : '\n',
					banner : "(function( window, document, $ ){\n'use strict';\n",
					footer : "\n})(window, document, jQuery);"
				},
				src : ['src/js/core/polyfill.js', 'src/js/utils/jquery-adapter.js', 'src/js/core/m5c.js', 'src/js/core/core.js', 'src/js/core/ready.js'],
				dest : 'src/js/dist/m5c.client.core.js'
			},
			all : {
				src : [],
				dest : ''
			}
		},
		uglify : {
			comp : {
				files: {
					'src/js/dist/m5c.client.components.min.js' : ['src/js/dist/m5c.client.components.js']
				}
			}
		},
        */
		copy : {
			app : {
                options: { force: true, forceOverwrite: true },
                expand : true,
				src : ['**'],
				dest : 'D:\\work\\20160600_castlemaker\\work\\Android-CastleMaker\\app\\src\\main\\assets\\www',
                filter : function( dest ){
                    var arr = ['backup_*/', 'dist/',
                    'test/', 'node_module/',
                    '.gitignore', 'package.json', 'Gruntfile.js', '.project' ];
                    var reg = /^backup\_.*|^node\_module|^dist|^test|^package\.json$|^Gruntfile\.js$|^\.gitignore$|^\.project$|^mirror\.html$|^debug\.log$/;
                    //
                    return !reg.test(dest);
                }
			},
			svn : {
				options: { force: true, forceOverwrite: true },
                expand : true,
				src : ['**'],
				dest : 'D:\\work\\20150422_IOT정부과제\\00_svn\\M5C\\src\\main\\webapp\\castlemaker',
                filter : function( dest ){
                    var arr = ['backup_*/', 'dist/',
                    'test/', 'node_module/',
                    '.gitignore', 'package.json', 'Gruntfile.js', '.project' ];
                    var reg = /^backup\_.*|^node\_module|^dist|^test|^package\.json$|^Gruntfile\.js$|^\.gitignore$|^\.project$|^debug\.log$/;
                    //
                    return !reg.test(dest);
                }
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	//grunt.loadNpmTasks('grunt-ftp-deploy');
	//grunt.loadNpmTasks('grunt-sftp-deploy');
	//grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
    //
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');

	//grunt.registerTask('merge', ['concat:comp', 'concat:core']);
	//grunt.registerTask('compress', ['uglify:comp']);

	// Default task.
	//grunt.registerTask('default', ['jshint', 'copy']);
    grunt.registerTask( 'app', ['copy:app'] );
	grunt.registerTask( 'svn', ['copy:svn'] );
	grunt.registerTask( 'crypto', ['concat:crypto'] );
	//grunt.registerTask( 'intra', ['ftp-deploy:build'] );

};

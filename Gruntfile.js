module.exports = function(grunt) {

    grunt.initConfig({
        kill: {
            cmd: 'killall node'
        },
        nodemon: {
            dev: {
                script: 'app.js',
                options: {
                    watch: ['controllers/*', 'core/*', 'helpers/*', 'models/*'],
                    delay: 1000,
                    legacyWatch: true
                }
            }
        }
    })

    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-nodemon');

    grunt.registerTask('default', ['nodemon'])
};

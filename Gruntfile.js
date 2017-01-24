module.exports = function(grunt) {

    grunt.initConfig({
        kill: {
            cmd: 'killall node'
        },
        exec: {
            'stop-node': {
                cmd: 'killall node'
            },
            'start-node': {
                cmd: 'node app.js'
            }
        },
        nodemon: {
            dev: {
                script: 'app.js'
            }
        },
        watch: {
            files: ['./controllers/*', './core/*', './helpers/*', './models/*'],
            tasks: ['nodemon']
        }
    })

    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-nodemon');

    grunt.registerTask('default', ['nodemon'])
};

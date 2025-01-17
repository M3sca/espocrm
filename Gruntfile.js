/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM - Open Source CRM application.
 * Copyright (C) 2014-2021 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * EspoCRM is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * EspoCRM is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EspoCRM. If not, see http://www.gnu.org/licenses/.
 ************************************************************************/

/**
* * `grunt` - full build
* * `grunt dev` - build only items needed for development (takes less time)
* * `grunt offline` - build but skip *composer install*
* * `grant release` - full build plus upgrade packages`
* * `grant test` - build for tests running
* * `grant run-tests` - build and run unit and integration tests
*/

const fs = require('fs');
const cp = require('child_process');
const path = require('path');

module.exports = grunt => {

    const pkg = grunt.file.readJSON('package.json');
    const bundleConfig = require('./frontend/bundle-config.json');

    let jsFilesToBundle = getBundleLibList().concat(bundleConfig.jsFiles);
    let jsFilesToCopy = getCopyLibDataList();

    let libFilesToMinify = jsFilesToCopy
        .filter(item => item.minify)
        .reduce((map, item) => (
            map[item.dest] = item.dest,
            map
        ), {});

    let currentPath = path.dirname(fs.realpathSync(__filename));

    let themeList = [];

    fs.readdirSync('application/Espo/Resources/metadata/themes').forEach(file => {
        themeList.push(file.substr(0, file.length - 5));
    });

    let cssminFilesData = {};

    let lessData = {};

    themeList.forEach(theme => {
        let name = camelCaseToHyphen(theme);

        let files = {};

        files['client/css/espo/'+name+'.css'] = 'frontend/less/'+name+'/main.less';
        files['client/css/espo/'+name+'-iframe.css'] = 'frontend/less/'+name+'/iframe/main.less';

        cssminFilesData['client/css/espo/'+name+'.css'] = 'client/css/espo/'+name+'.css';
        cssminFilesData['client/css/espo/'+name+'-iframe.css'] = 'client/css/espo/'+name+'-iframe.css';

        let o = {
            options: {
                yuicompress: true,
            },
            files: files,
        };

        lessData[theme] = o;
    });

    grunt.initConfig({
        pkg: pkg,

        mkdir: {
            tmp: {
                options: {
                    mode: 0755,
                    create: [
                        'build/tmp',
                    ],
                }
            }
        },

        clean: {
            start: ['build/EspoCRM-*'],
            final: ['build/tmp'],
            release: ['build/EspoCRM-' + pkg.version],
            beforeFinal: {
                src: [
                    'build/tmp/custom/Espo/Custom/*',
                    'build/tmp/custom/Espo/Modules/*',
                    '!build/tmp/custom/Espo/Custom/.htaccess',
                    '!build/tmp/custom/Espo/Modules/.htaccess',
                    'build/tmp/install/config.php',
                    'build/tmp/vendor/*/*/.git',
                    'build/tmp/custom/Espo/Custom/*',
                    'build/tmp/client/custom/*',
                    '!build/tmp/client/custom/modules',
                    'build/tmp/client/custom/modules/*',
                ]
            }
        },

        less: lessData,

        cssmin: {
            themes: {
                files: cssminFilesData,
            },
        },

        uglify: {
            options: {
                mangle: true,
                sourceMap: true,
                output: {
                    comments: /^!/,
                },
            },
            bundle: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                },
                files: {
                    'build/tmp/client/espo.min.js': jsFilesToBundle,
                },
            },
            lib: {
                files: libFilesToMinify,
            },
        },

        copy: {
            options: {
                mode: true,
            },
            frontendFolders: {
                expand: true,
                cwd: 'client',
                src: [
                    'src/**',
                    'res/**',
                    'fonts/**',
                    'cfg/**',
                    'modules/**',
                    'img/**',
                    'css/**',
                    'sounds/**',
                    'custom/**',
                ],
                dest: 'build/tmp/client',
            },
            frontendLib: {
                files: jsFilesToCopy,
            },
            frontendCommitedLib: {
                expand: true,
                dot: true,
                cwd: 'client/lib',
                src: '**',
                dest: 'build/tmp/client/lib/',
            },
            backend: {
                expand: true,
                dot: true,
                src: [
                    'application/**',
                    'custom/**',
                    'data/.data',
                    'vendor/**',
                    'html/**',
                    'public/**',
                    'install/**',
                    'bin/**',
                    'bootstrap.php',
                    'cron.php',
                    'daemon.php',
                    'rebuild.php',
                    'clear_cache.php',
                    'preload.php',
                    'upgrade.php',
                    'extension.php',
                    'websocket.php',
                    'command.php',
                    'index.php',
                    'LICENSE.txt',
                    '.htaccess',
                    'web.config',
                ],
                dest: 'build/tmp/',
            },
            final: {
                expand: true,
                dot: true,
                src: '**',
                cwd: 'build/tmp',
                dest: 'build/EspoCRM-<%= pkg.version %>/',
            },
        },

        chmod: {
            php: {
                options: {
                    mode: '644'
                },
                src: [
                    'build/EspoCRM-<%= pkg.version %>/**/*.php',
                    'build/EspoCRM-<%= pkg.version %>/**/*.json',
                    'build/EspoCRM-<%= pkg.version %>/**/*.config',
                    'build/EspoCRM-<%= pkg.version %>/**/.htaccess',
                    'build/EspoCRM-<%= pkg.version %>/client/**/*.js',
                    'build/EspoCRM-<%= pkg.version %>/client/**/*.css',
                    'build/EspoCRM-<%= pkg.version %>/client/**/*.tpl',
                    'build/EspoCRM-<%= pkg.version %>/**/*.html',
                    'build/EspoCRM-<%= pkg.version %>/**/*.txt',
                ],
            },
            folders: {
                options: {
                    mode: '755'
                },
                src: [
                    'build/EspoCRM-<%= pkg.version %>/public/install',
                    'build/EspoCRM-<%= pkg.version %>/public/portal',
                    'build/EspoCRM-<%= pkg.version %>/public/api',
                    'build/EspoCRM-<%= pkg.version %>/public/api/v1',
                    'build/EspoCRM-<%= pkg.version %>/public/api/v1/portal-access',
                    'build/EspoCRM-<%= pkg.version %>',
                ],
            },
            foldersWritable: {
                options: {
                    mode: '775'
                },
                src: [
                    'build/EspoCRM-<%= pkg.version %>/data',
                    'build/EspoCRM-<%= pkg.version %>/custom',
                    'build/EspoCRM-<%= pkg.version %>/custom/Espo',
                    'build/EspoCRM-<%= pkg.version %>/custom/Espo/Custom',
                    'build/EspoCRM-<%= pkg.version %>/client/custom',
                    'build/EspoCRM-<%= pkg.version %>/client/modules',
                    'build/EspoCRM-<%= pkg.version %>/application/Espo/Modules',
                ]
            },
            executable: {
                options: {
                    mode: '754'
                },
                src: [
                    'build/EspoCRM-<%= pkg.version %>/bin/*',
                ],
            },
        },

        replace: {
            version: {
                options: {
                    patterns: [
                        {
                            match: 'version',
                            replacement: '<%= pkg.version %>',
                        }
                    ]
                },
                files: [
                    {
                        src: 'build/tmp/application/Espo/Resources/defaults/config.php',
                        dest: 'build/tmp/application/Espo/Resources/defaults/config.php',
                    }
                ],
            },
            dev: {
                options: {
                    patterns: [
                        {
                            match: /\# \{\#dev\}(.*)\{\/dev\}/gs,
                            replacement: '',
                        }
                    ]
                },
                files: [
                    {
                        src: 'build/tmp/.htaccess',
                        dest: 'build/tmp/.htaccess',
                    }
                ],
            },
        },

    });

    grunt.registerTask('chmod-folders', () => {
        cp.execSync(
            "find . -type d -exec chmod 755 {} + ",
            {
                stdio: 'ignore',
                cwd: 'build/EspoCRM-' + pkg.version,
            }
        );
    });

    grunt.registerTask('composer-install', () => {
        cp.execSync("composer install --no-dev", {stdio: 'ignore'});
    });

    grunt.registerTask('composer-install-dev', () => {
        cp.execSync("composer install", {stdio: 'ignore'});
    });

    grunt.registerTask('upgrade', () => {
        cp.execSync("node diff --all --vendor", {stdio: 'inherit'});
    });

    grunt.registerTask('unit-tests-run', () => {
        cp.execSync("vendor/bin/phpunit ./tests/unit", {stdio: 'inherit'});
    });

    grunt.registerTask('integration-tests-run', () => {
        cp.execSync("vendor/bin/phpunit ./tests/integration", {stdio: 'inherit'});
    });

    grunt.registerTask('zip', () => {
        const archiver = require('archiver');

        let resolve = this.async();

        let folder = 'EspoCRM-' + pkg.version;

        let zipPath = 'build/' + folder +'.zip';

        if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
        }

        let archive = archiver('zip');

        archive.on('error', err => {
            grunt.fail.warn(err);
        });

        let zipOutput = fs.createWriteStream(zipPath);

        zipOutput.on('close', () => {
            console.log("EspoCRM package has been built.");

            resolve();
        });

        archive
            .directory(currentPath + '/build/' + folder, folder)
            .pipe(zipOutput)
            .finalize();
    });

    grunt.registerTask('npm-install', () => {
        cp.execSync("npm install", {stdio: 'ignore'});
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-chmod');

    grunt.registerTask('offline', [
        'clean:start',
        'mkdir:tmp',
        'less',
        'cssmin',
        'uglify:bundle',
        'copy:frontendFolders',
        'copy:frontendLib',
        'copy:frontendCommitedLib',
        'copy:backend',
        'uglify:lib',
        'replace',
        'clean:beforeFinal',
        'copy:final',
        'chmod-folders',
        'chmod:php',
        'chmod:folders',
        'chmod:foldersWritable',
        'chmod:executable',
        'clean:final',
    ]);

    grunt.registerTask('build', [
        'composer-install',
        'npm-install',
        'offline',
    ]);

    grunt.registerTask('default', [
        'build',
    ]);

    grunt.registerTask('release', [
        'build',
        'upgrade',
        'zip',
        'clean:release',
    ]);

    grunt.registerTask('run-tests', [
        'test',
        'unit-tests-run',
        'integration-tests-run',
    ]);

    grunt.registerTask('run-unit-tests', [
        'composer-install-dev',
        'unit-tests-run',
    ]);

    grunt.registerTask('run-integration-tests', [
        'test',
        'integration-tests-run',
    ]);

    grunt.registerTask('dev', [
        'composer-install-dev',
        'less',
    ]);

    grunt.registerTask('test', [
        'composer-install-dev',
        'npm-install',
        'offline',
    ]);
};

function getBundleLibList() {
    const libs = require('./frontend/libs.json');

    let list = [];

    libs.forEach(item => {
        if (!item.bundle) {
            return;
        }

        if (item.files) {
            item.files.forEach(item  => {
                list.push(item.src);
            });

            return;
        }

        if (!item.src) {
            throw new Error("No lib src.");
        }

        list.push(item.src);
    });

    return list;
}

function getCopyLibDataList() {
    const libs = require('./frontend/libs.json');

    let list = [];

    libs.forEach(item => {
        if (item.bundle) {
            return;
        }

        let minify = item.minify;

        if (item.files) {
            item.files.forEach(item  => {
                list.push({
                    src: item.src,
                    dest: 'build/tmp/' + (item.dest || 'client/lib/' + item.src.split('/').pop()),
                    minify: minify,
                });
            });

            return;
        }

        if (!item.src) {
            throw new Error("No lib src.");
        }

        list.push({
            src: item.src,
            dest: 'build/tmp/' + (item.dest || 'client/lib/' + item.src.split('/').pop()),
            minify: minify,
        });
    });

    return list;
}

function camelCaseToHyphen(string){
    if (string === null) {
        return string;
    }

    return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

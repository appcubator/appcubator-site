#!/usr/bin/env node

var fs = require('fs');
var child_process = require('child_process');
var http = require('http');
var formidable = require('formidable');

var DEBUG = true;


var spawnApp = function () {
    var child_app = spawn(app_cmd, app_args, {env: process.env});

    child_app.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
    });

    child_app.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });

    child_app.on('close', function (code) {
      console.log('child process exited with code ' + code);
    });
}

var updateCode = function (tarpath, callback) {
    child_process.exec('tar -xvf '+tarpath, function(err, stdout, stderr) {
        if (err) console.log(err);
        else {
            console.log('Code updated. Tar output:');
            console.log(stdout);
            console.log(stderr);
            callback();
        }
    });
};


var httpProxy = function (LOCAL_PORT, REMOTE_ADDR, REMOTE_PORT) {
    /*
     * Modified from:
     *   A simple proxy server written in node.js.
     *   Peteris Krumins (peter@catonmat.net)
     *   http://www.catonmat.net/http-proxy-in-nodejs/
     *
     */
    var s = http.createServer(function(request, response) {
        var ip = request.connection.remoteAddress;
        console.log(ip + ": " + request.method + " " + request.url);
        if (request.url.indexOf('__update_code__') != -1) {
            var form = new formidable.IncomingForm();

            form.parse(request, function(err, fields, files) {
                var codeTarBuf = new Buffer(recvBuf.join(''), 'binary');
                // Note: it will write this relative to the current working directory which should be appdir
                fs.writeFile('payload2.tar', codeTarBuf, function(err) {
                    if (err) throw err;
                    updateCode('payload2.tar', function(){
                        app.kill();
                        console.log('Sent SIGTERM to app, now waiting.');
                        app.on('exit', function(){
                            console.log('Spawning app.');
                            // app is a global
                            app = spawnApp();
                            response.writeHead(200, {'content-type': 'text/plain'});
                            response.end('OK');
                        });
                    });
                });
            });
        } else {
            var proxy = http.createClient(REMOTE_PORT, REMOTE_ADDR);
            var proxy_request = proxy.request(request.method, request.url, request.headers);
            proxy_request.addListener('response', function(proxy_response) {
                proxy_response.addListener('data', function(chunk) {
                    response.write(chunk, 'binary');
                });
                proxy_response.addListener('end', function() {
                    response.end();
                });
                response.writeHead(proxy_response.statusCode, proxy_response.headers);
            });
            request.addListener('data', function(chunk) {
                proxy_request.write(chunk, 'binary');
            });
            request.addListener('end', function() {
                proxy_request.end();
            });
        }
    }).listen(LOCAL_PORT);
    return s;
}


var USAGE = 'Devmon, spawns app as subprocess and proxies TCP to it.\n'+
            'Listens for code updates and respawns.\n'+
            'Usage: node devmon.js PORT PROXYPORT CWD [ subprocess argv ] \n'+
            '        0      1        2      3      4        5 ... n ';

if (process.argv.length < 6) {
    console.log(USAGE);
    process.exit(1);
}

var spawn = child_process.spawn;
var port = process.argv[2],
    proxyport = process.argv[3],
    cwd = process.argv[4],
    app_cmd = process.argv[5],
    app_args = process.argv.slice(6);

process.chdir(cwd);
console.log('Changed CWD to ' + cwd);
// global
app = spawnApp();
var proxySock = httpProxy(port, '127.0.0.1', proxyport);

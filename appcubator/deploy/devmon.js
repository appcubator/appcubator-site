#!/usr/bin/env node

var net = require('net');
var child_process = require('child_process');
var fs = require('fs');
var DEBUG = false;

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

/* TCP Proxy, from http://gonzalo123.com/2012/09/17/building-a-simple-tcp-proxy-server-with-node-js/ */
var tcpProxy = function (LOCAL_PORT, REMOTE_ADDR, REMOTE_PORT) {
    var server = net.createServer(function (socket) {
        var bytesToRecv, bytesRecvd, recvBuf;
        var updating = false;
        socket.on('data', function (msg) {
            //console.log('  ** START **' + msg.length);
            if(DEBUG) console.log('<< From client to proxy ', msg.toString()); // TODO be careful of request size... protect against hax
            if (msg.toString().indexOf("POST /__update_code__ HTTP/1.1\n\n") == 0) {
                console.log(msg.toString());
                // activate code updating mode
                updating = true;
                recvBuf = [];
                msg = msg.toString().replace(/^[^\n]*\n\n/, ''); // trim upto double \n
                bytesToRecv = parseInt(msg.substr(0, msg.indexOf('\n\n')));
                bytesRecvd = 0;
                msg = msg.replace(/^\d+\n\n/, ''); // trim upto size decl \n
            }
            if (updating) {
                // update code
                recvBuf.push(msg.toString());
                bytesRecvd += msg.length;
                if (bytesRecvd >= bytesToRecv) {
                    var codeTarBuf = new Buffer(recvBuf.join(''), 'base64');
                    // Note: it will write this relative to the current working directory (cwd)
                    fs.writeFile('payload2.tar', codeTarBuf, function(err) {
                        if (err) throw err;
                        //updateCode('payload2.tar', function(){console.log('Code updated successfully!')});
                    });
                    // deactivate code updating mode
                    updating = false;
                    socket.end('0');
                }
            } else {
                // proxy
                var serviceSocket = new net.Socket();
                serviceSocket.connect(parseInt(REMOTE_PORT), REMOTE_ADDR, function () {
                    if(DEBUG) console.log('>> From proxy to remote', msg.toString());
                    serviceSocket.write(msg);
                });
                serviceSocket.on("data", function (data) {
                    if(DEBUG) console.log('<< From remote to proxy', data.toString());
                    socket.write(data);
                    if(DEBUG) console.log('>> From proxy to client', data.toString());
                });
            }
        });
    });

    server.listen(LOCAL_PORT);
    console.log("TCP server accepting connection on port: " + LOCAL_PORT);
    return server;
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

var child_app = spawn(app_cmd, app_args, {env: process.env});
var proxySock = tcpProxy(port, '127.0.0.1', proxyport);

child_app.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});

child_app.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

child_app.on('close', function (code) {
  console.log('child process exited with code ' + code);
});

#!/usr/bin/env node

var net = require('net');

/* TCP Proxy, from http://gonzalo123.com/2012/09/17/building-a-simple-tcp-proxy-server-with-node-js/ */
var tcpProxy = function(LOCAL_PORT, REMOTE_ADDR, REMOTE_PORT) {
    var server = net.createServer(function (socket) {
        socket.on('data', function (msg) {
            console.log('  ** START **');
            console.log('<< From client to proxy ', msg.toString());
            var serviceSocket = new net.Socket();
            serviceSocket.connect(parseInt(REMOTE_PORT), REMOTE_ADDR, function () {
                console.log('>> From proxy to remote', msg.toString());
                serviceSocket.write(msg);
            });
            serviceSocket.on("data", function (data) {
                console.log('<< From remote to proxy', data.toString());
                socket.write(data);
                console.log('>> From proxy to client', data.toString());
            });
        });
    });

    server.listen(LOCAL_PORT);
    console.log("TCP server accepting connection on port: " + LOCAL_PORT);
    return server;
}


var USAGE = 'Devmon, spawns app as subprocess and proxies TCP to it.\n'+
            'Listens for code updates and respawns.\n'+
            'Usage: node devmon.js PORT PROXYPORT [ subprocess argv ] \n'+
            '        0      1        2      3           4 ... n ';

if (process.argv.length < 6) {
    console.log(USAGE);
    process.exit(1);
}


var spawn = require('child_process').spawn;
var port = process.argv[2],
    proxyport = process.argv[3],
    app_cmd = process.argv[4],
    app_args = process.argv.slice(5);

var child_app = spawn(app_cmd, app_args);
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

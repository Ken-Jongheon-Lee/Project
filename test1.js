// JavaScript source code
"use strict"
const
    fs = require("fs"),
    spawn = require('child_process').spawn,
    filename = process.argv[2];




fs.watch('test.txt', function () {

    const stream = fs.createReadStream('test.txt');
    stream.on('data', function (chunk) {
        process.stdout.write(chunk);
    });
    stream.on('error', function (err) {
        process.stderr.write("Error : ", err.message + "\n");
    });
    //console.log("File text1.txt just changed!");
    /*let ls = spawn('cmd.exe', ['/c','my.bat']);
    ls.stdout.pipe(process.stdout);
    let output = '';
    ls.stdout.on('data', function (chunk) {
        output += chunk.toString();*/
});

console.log("now watching for changes...");

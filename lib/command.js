/**
 * Created by shaoyin.zj on 17/2/1.
 */
var program = require('commander');
var packageConf = require("./../package.json");

function command() {
    program
        .version(packageConf.version)
        .usage('-s [source file] -d [destination file] -h [file header] [options]')
        .option('-s, --source [sourceLocation]', 'source file need to parse, now only support xmind file')
        .option('-d, --destination [destinationLocation]', 'destination file that generated, now only can be mardown file')
        .option('-h, --fileHeader [header || unorderedlist]', 'fixed header for each markdown file')
        .option('-l, --leafTopic [header || unorderedlist]', 'value can be header or unorderedlist, default is unorderedlist, used when translate xmind to mardown, define that leaf topic should be translated to header or unorderedlist in markdown')
        .parse(process.argv);

    if(!program.source) {
        console.log("need specify source file location");
        process.exit();
    }
    if(!program.destination) {
        console.log("need specify destination file location");
        process.exit();
    }
    return program;
}

module.exports = command;
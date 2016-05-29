
var fs = require('fs');
var xmlStream = require('xml-stream');

function BloggerExporter() {
    this._bloggerExportFileName = '';
    this.getArgs();
    this._ghostImport = this.createGhostImport();
    this.parseXmlBloggerFile(this._bloggerExportFileName);
}

//retreive process arguments
BloggerExporter.prototype.getArgs = function () {
    var args = process.argv.slice(2);

    if (args.length === 0) {
        console.log("Missing arguments blogger file path");
        process.exit(0);
    }
    this._bloggerExportFileName = args[0];
};

BloggerExporter.prototype.parseXmlBloggerFile = function (bloggerFilePath) {
    if (!bloggerFilePath) {
        throw 'Missing argument bloggerFilePath';
    }
    var stream = fs.createReadStream(bloggerFilePath);
    var xml = new xmlStream(stream);

    xml.collect('category');
    var entryId = 1;
    xml.on('endElement: entry', function (entry) {
        if (!this.isBloggerPost(entry)) {
            return;
        }
        this._ghostImport.post.push(this.createGhostPost(entry, id));

        entryId++;
        console.log(entryId);

        console.log(entry);

        //console.log(entry);
    }.bind(this));
};

BloggerExporter.prototype.createGhostPost = function (entry, postId) {
    var post = {
        id: postId,
    };

};

//Create ghost import object base on description https://github.com/TryGhost/Ghost/wiki/import-format
BloggerExporter.prototype.createGhostImport = function () {
    var ghostImport = {
        meta: {
            exported_on: (new Date ()).getTime(),
            version: "001"
        },
        data: {
            posts: [],
            tags: [],
            posts_tags: [],
            users: [],
            roles_users: []
        }
    };
};

/*
Check if blogger entry is a blogger post
http://schemas.google.com/blogger/2008/kind#post
*/
BloggerExporter.prototype.isBloggerPost = function (entry) {
    if (!entry.category || !entry.category.length) {
        return false;
    }
    if (entry.category.find(function (category) {
        if (category.$.term.indexOf('kind#post') > 0) {
            return true;
        }
    }) === undefined) {
        return false;
    }
    return true;
};

BloggerExporter.prototype.getTags = function (categories) {

};

module.exports = BloggerExporter;
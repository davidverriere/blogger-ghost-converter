
var fs = require('fs');
var xmlStream = require('xml-stream');
var toMarkdown = require('to-markdown');
var slug = require('slug');

function BloggerExporter() {
    this._bloggerExportFileName = '';
    this._language = 'fr_FR';
    this._tagId = 1;
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
    var postId = 1;
    xml.on('end', function () {
        this.createGhostFile();
    }.bind(this));

    xml.on('endElement: entry', function (entry) {
        try {
            if (!this.isBloggerPost(entry)) {
                return;
            }
            this._ghostImport.data.posts.push(this.createGhostPost(entry, postId));
            this.addPostTags(entry, postId);
            postId++;
        }
        catch (e) {
            console.error(e);
        }
    }.bind(this));


};

BloggerExporter.prototype.createGhostFile = function () {

    if (this._ghostImport) {
        fs.writeFileSync('ghost.json', JSON.stringify(this._ghostImport), {});
    }
};

BloggerExporter.prototype.createGhostPost = function (entry, postId) {
    var post = {
        id: postId,
        // the first user created has an id of 1
        author_id: 1
    };
    post.featured = 0;
    post.html = entry.content.$text;
    post.language = this._language;
    post.markdown = toMarkdown(post.html, { absolute: true });
    post.page = 0;
    post.published_at = (new Date(Date.parse(entry.published))).getTime();
    post.created_at = post.published_at;
    // the first user created has an id of 1
    post.published_by = 1;
    post.status = "published";
    post.title = entry.title.$text;
    //slug must be unique
    post.slug = post.title;
    post.updated_at = (new Date(Date.parse(entry.updated))).getTime();
    // the first user created has an id of 1
    post.updated_by = 1;
    return post;
};

BloggerExporter.prototype.addPostTags = function (entry, postId) {
    var categoryPostsTags = entry.category.filter(function (category) {
        return category.$.scheme && category.$.scheme === 'http://www.blogger.com/atom/ns#';
    });
    if (!categoryPostsTags.length)
        return;
    (categoryPostsTags).forEach(function (categoryPostsTag) {
        var tagId = this.getTagId(categoryPostsTag.$.term);
        this._ghostImport.data.posts_tags.push({
            tag_id: tagId,
            post_id: postId
        });
    }, this);
};

//Retreive tag Id from previous added tag, if tag does not exist it is inserted and a new id is created
BloggerExporter.prototype.getTagId = function (tagName) {
    var tag = this._ghostImport.data.tags.find(function (tag) {
        return tag.name === tagName;
    });
    if (tag === undefined) {
        tag = {
            id: this._tagId,
            name: tagName,
            slug: slug(tagName),
            description: ""
        };
        this._tagId++;
        this._ghostImport.data.tags.push(tag);
    }
    return tag.id;
};

//Create ghost import object base on description https://github.com/TryGhost/Ghost/wiki/import-format
BloggerExporter.prototype.createGhostImport = function () {
    var ghostImport = {
        meta: {
            exported_on: (new Date()).getTime(),
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
    return ghostImport;
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


module.exports = BloggerExporter;
var events = require('events');
var eventEmitter = new events.EventEmitter();

function ZookeeperUtils(zk) {
    this.zk = zk;
}

/**
 * build a tree representation, of a zookeeper structure
 *  node: {.name, .value, .children[]}
 * @param basePath  - where to build tree from, i.e. /path/to/base
 * @param callback  - callback with prototype (err, rootNode);
 */
ZookeeperUtils.prototype.buildTree = function (basePath, callback) {
    var zk = this.zk;
    var root = {name: '/', children: []};

    function addToTree(path, value) {
        var pathParts = path.split('/');

        // always starts with a '/' so remove first empty element
        pathParts.shift();

        var current = root;
        for (var p in pathParts) {
            var part = pathParts[p];

            var existing = false;
            var children = current.children;
            for (var c in children) {
                if (part === children[c].name) {
                    // existing child
                    current = children[c];
                    existing = true;
                }
            }

            if (!existing) {
                // new child
                var newLength = children.push({name: part, children: []});
                current = children[newLength - 1];
            }
        }

        current.value = value;
    }

    // function-scoped var to track error message
    var err = undefined;
    function invokeError(error, message) {
        err = message + ' (' + error + ')';
        eventEmitter.emit('error');
        return;
    }

    // hacky way of tracking work scheduled / work-completed
    var requested = 0;
    var processed = 0;

    // Query each sub-path of zookeeper and populate an in-memory
    // tree representation
    function populateNodes(path) {

        if (err) return;

        var searchPath = path;

        zk.a_get_children(path, false, function (error, message, children) {
            if (error) return invokeError(error, message);

            if (children.length > 0) {
                // has children

                for (var c in children) {
                    (function () {
                        populateNodes(searchPath + '/' + children[c]);
                    })();
                }
            } else {
                // is a leaf

                ++requested;
                zk.a_get(searchPath, false, function (error, message, nodeInfo, value) {
                    if (error) return invokeError(error, message);

                    // The node may exist, but have no data
                    var data = value ? value.toString('utf-8') : '<no-data>';

                    addToTree(searchPath, data);

                    eventEmitter.emit('processed');
                });
            }
        });
    }

    populateNodes(basePath);

    eventEmitter.addListener('processed', function () {
        ++processed;
        if (processed === requested) {
            callback(err, root);
        }
    });

    eventEmitter.addListener('error', function () {
       callback(err);
    });
};

ZookeeperUtils.prototype.printNode = function (node, indent) {
    if (!indent) indent = 1;
    var space = new Array(indent).join('  ');
    console.log('%s%s', space, node.name);

    if (node.children.length > 0) {
        indent++;
        for (var c in node.children) {
            this.printNode(node.children[c], indent);
        }
    } else {
        console.log('%s  :%s', space, node.value);
    }
};

module.exports = ZookeeperUtils;
var ZookeeperUtils = require('./ZookeeperUtils.js');

/**
 * Utility class for Kafka
 * @param zk - an active zookeeper connection
 * @constructor
 */
function KafkaUtils(zk) {
    this.zk = zk;
}

/**
 * Can be used to recursively print a zookeeper path (node tree and values)
 * Useful for CLI diffing / debugging
 * @param consumerGroup - the consumer group to print
 */
KafkaUtils.prototype.printConsumerGroup = function (consumerGroup, callback) {
    var utils = new ZookeeperUtils(this.zk);
    utils.buildTree('/consumers/' + consumerGroup, function(err, tree) {
        if (err) {
            console.error(err);
        } else {
            utils.printNode(tree);
        }

        callback();
    });
};


module.exports = KafkaUtils;
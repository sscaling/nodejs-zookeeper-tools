var ZooKeeper = require("zookeeper");
var KafkaUtils = require("./kafkaUtils.js");
var zk = new ZooKeeper({
    connect: "192.168.99.100:2181"
    , timeout: 200000
    , debug_level: ZooKeeper.ZOO_LOG_LEVEL_WARN
    , host_order_deterministic: false
});


zk.connect(function (err) {
    if (err) throw err;
    console.log("zk session established, id=%s", zk.client_id);

    var utils = new KafkaUtils(zk);
    utils.printConsumerGroup('foobar', function () {
        console.log("Closing Zookeeper connection");
        process.nextTick(function () {
            zk.close();
        });
    });
});
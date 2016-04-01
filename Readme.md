# Zookeeper Utils

## Features

* Print Kafka Consumer group state information
* ...

## Installation

	npm install

## Example

Create a new instance of the KafkaUtils class, and invoke one of the methods, e.g.

	var ZooKeeper = require("zookeeper");
	var KafkaUtils = require("./kafkaUtils.js");
	var zk = new ZooKeeper({
	    connect: "localhost:2181"
	    , timeout: 200000
	    , debug_level: ZooKeeper.ZOO_LOG_LEVEL_WARN
	    , host_order_deterministic: false
	});

	zk.connect(function (err) {
	    if (err) throw err;
	    var utils = new KafkaUtils(zk);
	    utils.printConsumerGroup('foobar', function () {
	        console.log("Closing Zookeeper connection");
	        process.nextTick(function () {
	            zk.close();
	        });
	    });
	});



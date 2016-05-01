#!/usr/bin/env node

var java = require("../node_modules/java");

java.classpath.push("../lib/creco-1.0.jar");
var conn = "http://52.11.111.234:8983/solr/adaptq/";
var creco = java.newInstanceSync("com.adaptq.creco.Creco", conn);

console.log("Crawling and indexing initiated...");
creco.crawlAndIndexSync();
console.log("Crawling and indexing complete. Check datadump.");

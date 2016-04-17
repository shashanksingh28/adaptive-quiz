#!/usr/bin/env node

var request = require("../node_modules/request");
var java = require("../node_modules/java");

java.classpath.push("../lib/creco-1.0.jar");
var conn = "http://localhost:8983/solr/adaptq/";
var creco = java.newInstanceSync("com.adaptq.creco.Creco", conn);

exports.fetch = function() {
  console.log("Crawling and indexing initiated...");
  creco.crawlAndIndexSync();
  console.log("Crawling and indexing complete. Check datadump.");
}

exports.search = function(concept, desc, count, get) {
  const CONCEPT_FLD = "concept=";
  const CONCEPT_DESC = "conceptDesc=";
  const QUERY = "q=";
  const SORT = "&sort=";
  const ROWS = "&rows=";
  const RESPONSE_WRITER = "&wt=";
  var descBoost = 3;

  var searchConcept = CONCEPT_FLD + "\"" + concept + "\"";
  var searchDesc = CONCEPT_DESC + "\"" + desc + "\"^" + descBoost;

  var url = conn + "select?"
    + QUERY + searchConcept + " " + searchDesc
    + SORT + "score+desc"
    + RESPONSE_WRITER + "json"
    + ROWS + count;

  request(url, function(error, response, body) {
    get(body);
  });
}

var creco = require("./creco");
creco.fetch();
creco.search("inheritance", "What are inner classes", 5, function(result) {
  console.log(result);
});


var conn = "http://52.35.105.224:8983/solr/adaptq/";

function search(concept, desc, count, get) {
  const CONCEPT_FLD = "concept=";
  const CONCEPT_DESC = "conceptDesc=";
  const QUERY = "q=";
  const SORT = "&sort=";
  const ROWS = "&rows=";
  const RESPONSE_WRITER = "&wt=";
  const CALLBACK="&json.wrf=callback";
  var descBoost = 3;

  var searchConcept = CONCEPT_FLD + "\"" + concept + "\"";
  var searchDesc = CONCEPT_DESC + "\"" + desc + "\"^" + descBoost;

  var url = conn + "select?" + QUERY;
  if (searchConcept != null) {
    url = url + searchConcept;
    if (searchDesc != null) {
      url = url + " ";
    }
  }
  if (searchDesc != null) {
    url = url + searchDesc;
  }
  url = url + SORT + "score+desc" + RESPONSE_WRITER + "json" + ROWS + count + CALLBACK;
  console.log(url);

  $.ajax({
  url: url,
  crossDomain: true,
  dataType:'jsonp',
  jsonpCallback: 'callback'
  }).done(function(data) {
      get(data.response.docs);
  });
}

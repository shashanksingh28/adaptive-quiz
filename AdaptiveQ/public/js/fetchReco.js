var solr_url = "http://54.69.239.219:8983/solr/CPlusPlus/";

function fetchRecos(concept, text, code, count, callback) {
    const CONCEPT_FLD = "heading=";
    const TEXT_FLD = "text=";
    const CODE_FLD = "code=";
    const QUERY = "q=";
    const SORT = "&sort=";
    const ROWS = "&rows=";
    const RESPONSE_WRITER = "&wt=";
    var textBoost = 3;

    var searchConcept = CONCEPT_FLD + "\"" + concept + "\"";
    var searchText = TEXT_FLD + "\"" + text + "\"" + textBoost;
    var searchCode = CODE_FLD + "\"" + code + "\"";

    var url = solr_url + "select?" + QUERY;
    url = url + searchConcept;
    
    if (text != null) {
        url = url + " " + searchText;
    }
    if (code != null) {
      url = url + " " + searchCode;
    }

  url = url + SORT + "score+desc" + RESPONSE_WRITER + "json" + ROWS + count;
  console.log(url);
  $.ajax({
      'url': url,
      'dataType': 'jsonp',
      'jsonp': 'json.wrf',
      'success': callback(url)
    });
}


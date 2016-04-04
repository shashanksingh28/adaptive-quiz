package com.adaptq.creco;

import java.io.IOException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;

import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;

import com.adaptq.creco.model.Nugget;

/**
 * <code>Searcher</code> searches recommendations from Solr database.
 * 
 * @author Ajinkya Patil
 * @version 1.0
 * @since 1.0
 */
public class Searcher {
	public static List<Nugget> search(SolrClient client, String text)
			throws IOException, ParseException, SolrServerException {

		SolrQuery query = new SolrQuery();
		query.setQuery(text);
		QueryResponse response = client.query(query);
		SolrDocumentList results = response.getResults();
		final List<Nugget> recos = new ArrayList<Nugget>();
		for (SolrDocument doc : results) {
			final Nugget nugget = new Nugget();
			nugget.setUrl(doc.get(IndexConstants.KEY).toString());
			nugget.setTitle(doc.get(IndexConstants.HEADER).toString());
			recos.add(nugget);
		}
		return recos;
	}
}
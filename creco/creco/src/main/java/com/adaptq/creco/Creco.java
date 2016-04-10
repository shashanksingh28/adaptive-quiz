package com.adaptq.creco;

import java.io.IOException;
import java.nio.file.Paths;
import java.text.ParseException;
import java.util.List;

import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.HttpSolrClient;

import com.adaptq.creco.model.Nugget;
import com.google.gson.Gson;

/**
 * This is the main class for using Creco. <code>Creco</code> provides
 * recommendations on queries through knowledge extracted from online resources.
 * 
 * @author Ajinkya Patil
 * @version 1.0
 * @since 1.0
 */
public class Creco {
	private SolrClient solrClient;

	@SuppressWarnings("unused")
	private Creco() {
	}

	public Creco(String solrClientAddress) {
		this.solrClient = new HttpSolrClient(solrClientAddress);
	}

	/**
	 * Gets recommendations based on <code>query</code> text
	 * 
	 * @param query
	 *            text from which recommendations are to be generated
	 * @return a string in JSON format
	 * @throws IOException
	 * @throws ParseException
	 * @throws SolrServerException
	 */
	public String search(String query)
			throws IOException, ParseException, SolrServerException {

		if (solrClient == null) {
			System.out.println("ERROR: SolrClient not instantiated!");
			return null;
		}

		List<Nugget> results = Searcher.search(solrClient, query);
		final Gson gson = new Gson();
		return gson.toJson(results);
	}

	/**
	 * This method crawls targets defined by available implemented crawlers. The
	 * crawled data is then indexed.<br>
	 * TODO: Use resources for selecting crawlers
	 * 
	 * @throws IOException
	 * @throws SolrServerException
	 */
	public void crawlAndIndex() throws IOException, SolrServerException {

		if (solrClient == null) {
			System.out.println("ERROR: SolrClient not instantiated!");
			return;
		}

		solrClient.deleteByQuery("*:*");
		solrClient.commit();

		Crawler crawler = null;
		for (int i = 1; i <= 3; i++) {
			crawler = CrawlerFactory.getCrawler(i);
			if (crawler != null) {
				crawler.disperse();
				Indexer.index(solrClient, Paths.get(crawler.getDumpLocation()));
			}
		}
	}
}

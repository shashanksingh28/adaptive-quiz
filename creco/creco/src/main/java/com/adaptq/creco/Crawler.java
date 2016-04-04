package com.adaptq.creco;

import java.io.IOException;
import java.util.List;

import org.jsoup.nodes.Document;

import com.adaptq.creco.model.Nugget;

/**
 * <code>Crawler</code> interface for web crawling.
 * 
 * @author Ajinkya Patil
 * @version 1.0
 * @since 1.0
 */
public interface Crawler {
	/**
	 * Gets the location where crawled content is saved.
	 * 
	 * @return location string of crawled content
	 */
	public String getDumpLocation();

	/**
	 * Starts the crawling from the root source of target.
	 * 
	 * @throws IOException
	 */
	public void disperse() throws IOException;

	/**
	 * Crawls every <code>url</code> within the <code>target</code> url
	 * 
	 * @param url
	 *            url which is either <code>target</code> or the one nested
	 *            inside
	 * @param target
	 *            the target url declared to crawl
	 * @throws IOException
	 */
	public void crawl(final String url, final String target) throws IOException;

	/**
	 * Picks up data from webpage.
	 * 
	 * @param doc
	 *            <code>Document</code> retrieved from <code>url</code>
	 * @param url
	 * @return list of <code>Nugget</code> objects consisting of relevant data
	 */
	public List<Nugget> scavenge(final Document doc, final String url);

}

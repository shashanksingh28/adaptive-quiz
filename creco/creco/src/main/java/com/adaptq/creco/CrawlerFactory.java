package com.adaptq.creco;

/**
 * <code>CrawlerFactory</code> is factory for generating crawler objects.
 * 
 * @author Ajinkya Patil
 * @version 1.0
 * @since 1.0
 */
public class CrawlerFactory {
	/**
	 * Returns crawler object
	 * 
	 * @param crawlerId
	 *            ID associated with crawler
	 * @return <code>Crawler</code> object
	 * @see IndexConstants IndexConstants
	 */
	public static Crawler getCrawler(final int crawlerId) {
		Crawler crawler = null;
		switch (crawlerId) {
		case CrawlersConstants.CRAWLER_JWIKIBOOK:
			crawler = new JavaWikiBookCrawler(CrawlersConstants.LOC_JWIKIBOOK);
			break;
		case CrawlersConstants.CRAWLER_ORACLERBI:
			crawler = new ReallyBigIndexCrawler(
					CrawlersConstants.LOC_ORACLERBI);
			break;
		}
		return crawler;
	}
}

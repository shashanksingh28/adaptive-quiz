package com.adaptq.creco;

import java.io.IOException;
import java.text.ParseException;

import org.apache.solr.client.solrj.SolrServerException;

public class Demo {
	public static void main(String[] args)
			throws IOException, ParseException, SolrServerException {
		String text = "inheritance java classes object";
		Creco reco = new Creco("http://localhost:8983/solr/adaptq");
		reco.crawlAndIndex();
		String output = reco.get(text.replaceAll("[\\W]", " "));
		System.out.println(output);
	}
}

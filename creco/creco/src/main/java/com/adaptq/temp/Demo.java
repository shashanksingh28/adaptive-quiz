package com.adaptq.temp;

import java.io.IOException;
import java.text.ParseException;

import org.apache.solr.client.solrj.SolrServerException;

import com.adaptq.creco.Creco;

public class Demo {
	public static void main(String[] args)
			throws IOException, ParseException, SolrServerException {
		String query = "string";
		Creco reco = new Creco("http://localhost:8983/solr/adaptq");
		//reco.crawlAndIndex();
		String output = reco.search(query.replaceAll("[\\W]", " "));
		System.out.println(output);
	}
}

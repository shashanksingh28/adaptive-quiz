package com.adaptq.creco;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;

import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.common.SolrInputDocument;

public class Indexer {
	public static void index(final SolrClient client, final Path path) throws IOException, SolrServerException {
		File directory = path.toFile();
		File[] files = directory.listFiles();
		for (int i = 0; i < files.length; i++) {
			File f = files[i];
			if (f.isDirectory()) {
				index(client, f.toPath());
			} else if (f.getName().endsWith(".txt")) {
				indexDoc(client, f.toPath());
			}
			if (i % 50 == 0) {
				client.commit();
			}
		}
		client.commit();
	}

	private static void indexDoc(final SolrClient client, final Path path) throws IOException, SolrServerException {
		try (InputStream stream = Files.newInputStream(path)) {
			final BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
			String line = null;
			int metadata = 2;
			StringBuffer contents = new StringBuffer();
			String url = null;
			String title = null;
			while ((line = reader.readLine()) != null) {
				if (metadata == 2) {
					url = line;
					--metadata;
				} else if (metadata == 1) {
					title = line;
					--metadata;
				} else {
					contents.append(" " + line);
				}
			}
			if (url == null || title == null) {
				return;
			}

			final SolrInputDocument doc = new SolrInputDocument();
			doc.addField(IndexConstants.KEY, url);
			doc.addField(IndexConstants.HEADER, title);
			doc.addField(IndexConstants.VALUE, contents.toString());
			client.add(doc);
		}
	}
}

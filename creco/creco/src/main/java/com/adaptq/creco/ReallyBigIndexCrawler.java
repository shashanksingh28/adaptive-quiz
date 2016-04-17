package com.adaptq.creco;

import java.io.BufferedWriter;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import com.adaptq.creco.model.Nugget;

/**
 * Crawler for the Oracle's <a href="https://docs.oracle.com/javase/tutorial/reallybigindex.html">Java Tutorials</a>.
 * 
 * @author Ajinkya Patil
 * @version 1.0
 * @since 1.0
 */
public class ReallyBigIndexCrawler implements Crawler {
	private Set<String> visitedUris;
	private String dumpLocation;
	private static final String TARGET = "https://docs.oracle.com/javase/tutorial/reallybigindex.html";

	public ReallyBigIndexCrawler() {
		visitedUris = new HashSet<String>();
		dumpLocation = "/";
	}

	public ReallyBigIndexCrawler(String location) {
		visitedUris = new HashSet<String>();
		dumpLocation = location;
		System.out.println(
				"Dump location for ReallyBigIndexCrawler: " + Paths.get(dumpLocation).toAbsolutePath().toString());
	}

	@Override
	public void disperse() throws IOException {
		crawl(TARGET, TARGET);
	}

	@Override
	public String getDumpLocation() {
		return dumpLocation;
	}

	@Override
	public void crawl(String url, String target) throws IOException {
		// TODO use regex, add blacklist
		if (url.contains(".pdf") || url.contains("@") || url.contains(":8") || url.contains(".jpg") || url.contains("#")
				|| url.contains("/QandE/") || url.contains(".zip")) {
			return;
		}
		if (!target.equals(url) && !url.contains("docs.oracle.com/javase/tutorial/essential")
				&& !url.contains("docs.oracle.com/javase/tutorial/java")) {
			return;
		}

		final Document doc = Jsoup.connect(url).ignoreHttpErrors(true).get();

		BufferedWriter writer = null;
		if (!target.equals(url)) {
			final List<Nugget> nuggets = scavenge(doc, url);
			for (Nugget nugget : nuggets) {
				if (!nugget.getContents().isEmpty()) {
					final Path path = Paths.get(dumpLocation + File.separator + nugget.getFileName() + ".txt");
					if (!path.toFile().exists()) {
						if (!Files.exists(path.toFile().getParentFile().toPath())) {
							Files.createDirectories(path.toFile().getParentFile().toPath());
						}
						Files.createFile(path);
					}
					writer = Files.newBufferedWriter(path);
					writer.write(nugget.getUrl() + "\n" + nugget.getTitle() + "\n" + nugget.getContents());
					writer.close();
				}
			}
		}

		Elements links = doc.select("dl a[href]");
		for (Element link : links) {
			String href = link.attr("abs:href");
			if (!visitedUris.contains(href)) {
				visitedUris.add(href);
				crawl(href, target);
			}
		}
	}

	@Override
	public List<Nugget> scavenge(Document doc, String url) {
		Element root = doc.getElementById("MainFlow");
		if (root == null) {
			return Collections.emptyList();
		}
		Element pageContent = root.getElementById("PageContent");
		Elements parts = pageContent.children();
		String mainTitle = doc.getElementById("PageTitle").text();
		StringBuffer contents = new StringBuffer();
		List<Nugget> nuggets = new ArrayList<Nugget>();
		for (Element part : parts) {
			String tag = part.tagName();
			if ("p".equals(tag)) {
				contents.append(part.text());
			}
		}
		String file = mainTitle.replaceAll("[\\W]", "_");
		nuggets.add(new Nugget(url, mainTitle, file, contents.toString()));
		return nuggets;
	}
}

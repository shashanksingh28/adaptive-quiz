package com.adaptq.creco;

import java.io.BufferedWriter;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import com.adaptq.creco.model.Nugget;

/**
 * Crawler for the wikibook
 * <a href="https://en.wikibooks.org/wiki/Java_Programming">The Java Programming
 * Language</a>
 * 
 * @author Ajinkya Patil
 * @version 1.0
 * @since 1.0
 */
public class JavaWikiBookCrawler implements Crawler {
	private Set<String> visitedUris;
	private String dumpLocation;
	private static final String TARGET = "https://en.wikibooks.org/wiki/Java_Programming";

	public JavaWikiBookCrawler() {
		visitedUris = new HashSet<String>();
		dumpLocation = "/";
	}

	public JavaWikiBookCrawler(String location) {
		visitedUris = new HashSet<String>();
		dumpLocation = location;
	}

	@Override
	public String getDumpLocation() {
		return dumpLocation;
	}

	@Override
	public void disperse() throws IOException {
		crawl(TARGET, TARGET);
	}

	@Override
	public void crawl(final String url, final String target)
			throws IOException {
		// TODO use regex, add blacklist
		if (url.contains(".pdf") || url.contains("@") || url.contains(":8")
				|| url.contains(".jpg")
				|| !url.contains("en.wikibooks.org/wiki/Java_Programming")
				|| url.contains("#") || url.contains("Print_version")
				|| url.contains("Development_stages")
				|| url.contains("Conventions")) {
			return;
		}

		final Document doc = Jsoup.connect(url).ignoreHttpErrors(true).get();

		BufferedWriter writer = null;
		if (!target.equals(url)) {
			final List<Nugget> nuggets = scavenge(doc, url);
			for (Nugget nugget : nuggets) {
				if (!nugget.getContents().isEmpty()) {
					final Path path = Paths.get(dumpLocation + File.separator
							+ nugget.getFileName() + ".txt");
					if (!path.toFile().exists()) {
						if (!Files.exists(
								path.toFile().getParentFile().toPath())) {
							Files.createDirectories(
									path.toFile().getParentFile().toPath());
						}
						Files.createFile(path);
					}
					writer = Files.newBufferedWriter(path);
					writer.write(nugget.getUrl() + "\n" + nugget.getTitle()
							+ "\n" + nugget.getContents());
					writer.close();
				}
			}
		}

		Elements links = null;
		Elements selects = null;
		if (target.equals(url)) {
			int contentIndex = doc.getElementById("Contents").parent()
					.elementSiblingIndex();
			selects = doc.getElementsByIndexGreaterThan(contentIndex);
			links = selects.select("a[href]");
		} else {
			links = doc.select("#mw-content-text a[href]");
		}

		for (Element link : links) {
			String href = link.attr("abs:href");
			if (!visitedUris.contains(href)) {
				visitedUris.add(href);
				crawl(href, target);
			}
		}
	}

	@Override
	public List<Nugget> scavenge(final Document doc, final String url) {
		Element root = doc.getElementById("mw-content-text");
		Elements parts = root.children();
		boolean isIntro = true;
		boolean isFirst = true;
		StringBuffer intro = new StringBuffer();
		String mainTitle = doc.getElementById("firstHeading").text();
		String header = null;
		StringBuffer contents = new StringBuffer();
		List<Nugget> nuggets = new ArrayList<Nugget>();
		for (Element part : parts) {
			String tag = part.tagName();
			if (isIntro) {
				// Removed code block fetching
				// if (("p".equals(tag) || "table".equals(tag))) {
				if (("p".equals(tag))) {
					if ("p".equals(tag)) {
						intro.append(part.text());
					}
					continue;
				}
			}

			if ("h2".equals(part.tagName())) {
				if (isFirst) {
					String file = mainTitle.replaceAll("[\\W]", "_") + "\\"
							+ mainTitle.replaceAll("[\\W]", "_");
					nuggets.add(
							new Nugget(url, mainTitle, file, intro.toString()));
					isIntro = false;

					header = part.getElementsByClass("mw-headline").first()
							.text();
					isFirst = false;
					continue;
				}
				String partUrl = url + "#" + header.replace(" ", "_");
				String file = mainTitle.replaceAll("[\\W]", "_") + "\\"
						+ header.replaceAll("[\\W]", "_");
				nuggets.add(new Nugget(partUrl, mainTitle + " - " + header,
						file, contents.toString()));
				contents = new StringBuffer("");
				header = part.getElementsByClass("mw-headline").first().text();
				continue;
			}

			if ("p".equals(tag)) {
				contents.append(part.text());
			}
		}
		if (header != null && !header.isEmpty()) {
			String partUrl = url + "#" + header.replace(" ", "_");
			String file = mainTitle.replaceAll("[\\W]", "_") + "\\"
					+ header.replaceAll("[\\W]", "_");
			nuggets.add(new Nugget(partUrl, header, file, contents.toString()));
		}
		return nuggets;
	}
}

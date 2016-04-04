package com.adaptq.creco.model;

public class Nugget {
	private String url;
	private String title;
	private String fileName;
	private String contents;

	public Nugget() {

	}

	public Nugget(String url, String title, String fileName, String contents) {
		this.url = url;
		this.title = title;
		this.fileName = fileName;
		this.contents = contents;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public String getContents() {
		return contents;
	}

	public void setContents(String contents) {
		this.contents = contents;
	}
}

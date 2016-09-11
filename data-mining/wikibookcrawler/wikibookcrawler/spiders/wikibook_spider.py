# -*- coding: utf-8 -*-
import scrapy
import pdb
from bs4.element import NavigableString
from bs4 import BeautifulSoup
import urlparse
from wikibookcrawler.items import WikiBookPageItem
import codecs
from xml.sax.saxutils import escape, unescape

class WikiBookSpider(scrapy.Spider):
    name = "WikiBookSpider"
    allowed_domains = ["en.wikibooks.org"]
    start_urls = ["https://en.wikibooks.org/wiki/C%2B%2B_Programming"]
    # if url already visited before, ignore
    crawled_set = set()
    # if we visit a url without this prefix, ignore
    base_url = "https://en.wikibooks.org/wiki/C%2B%2B_Programming"
    # store output in this directory
    out_dir = "../data"

    def parse(self, response):
        if response.url in WikiBookSpider.crawled_set:
            return
        else:
            WikiBookSpider.crawled_set.add(response.url)
        
        # pdb.set_trace()
        body = response.body.decode('utf-8')
        soup = BeautifulSoup(body, 'html.parser')
        
        # filter edit sections as they are a nuisance
        edit_sections = soup.find_all('span', class_='mw-editsection')
        for section in edit_sections:
            _ = section.extract()

        headlines = soup.find_all('span', class_='mw-headline')
        for headline in headlines:
            # Recursively traverse anchors if any, in this headline
            for a in headline.find_all('a'):
                url =  urlparse.urljoin(WikiBookSpider.base_url, a.get('href'))
                if url not in WikiBookSpider.crawled_set and url.startswith(WikiBookSpider.base_url):
                    yield scrapy.Request(url, callback = self.parse)
            
            # do not consider headlines smaller than h3 as this becomes extra granular
            if headline.parent.name > 'h3':
                continue

            # section to add the item for this headline
            item = WikiBookPageItem()
            item['url'] = response.url + "#" + headline['id']
            heading = headline['id']
            item['heading'] = heading if heading else ""
            item['text'] = ""
            item['code'] = ""
            
            container = headline.parent
            for sibling in container.next_siblings:
                # for some cases it could be pure strings with no tagname. skip them
                if isinstance(sibling, NavigableString):
                    continue
                if sibling.find('span', class_='mw-headline'):
                    if sibling.name < 'h3':
                        # We reached the next headline, so break and save the item we made
                        break
                    else:
                        item['text'] += sibling.get_text() + "\n"
                if sibling.name == 'p':
                    item['text'] += sibling.get_text() + "\n"
                code_segments = sibling.find_all('pre')
                for segment in code_segments:
                    item['code'] += segment.get_text() + "\n"
            
            savePageItem(item, WikiBookSpider.out_dir)

        
def savePageItem(item, out_dir):

    filename = out_dir + "/" + item['url'].split("/")[-1] + ".xml"
    
    with codecs.open(filename, 'wb', 'utf-8') as f:
        f.write("<add><doc>\n")
	f.write("<field name='url'>\n" + item['url'] + "\n</field>\n")
	f.write("<field name='heading'>\n"+item['heading']+"\n</field>\n")
	f.write("<field name='text'>\n"+escape(unescape(item['text'])) + "\n</field>\n")
	f.write("<field name='code'>\n"+escape(unescape(item['code'])) + "\n</field>\n")
	f.write("</doc></add>")

    print filename

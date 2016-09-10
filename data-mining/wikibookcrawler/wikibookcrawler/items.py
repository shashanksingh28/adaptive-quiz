# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# http://doc.scrapy.org/en/latest/topics/items.html

import scrapy

class WikiBookPageItem(scrapy.Item):
    # define the fields for your item here like:
    url = scrapy.Field()
    heading = scrapy.Field()
    text = scrapy.Field()
    code = scrapy.Field()

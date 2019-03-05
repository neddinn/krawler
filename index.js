/* jshint esversion: 6 */
const path = require('path');
const Crawler = require('./lib/crawler');
const Sitemap = require('./lib/sitemap');
const crawler = Crawler('https://enki.com');
const sitemapPath = path.join(process.cwd(), 'sitemap.xml');
const sitemap = Sitemap(sitemapPath);

crawler.start();

crawler.on('done', async (data) => {
  const outcome = await sitemap.end(data);
  if(!outcome) console.warn('Oops, an error occured');
});

crawler.on('data', (data) => {
  sitemap.add(data);
});
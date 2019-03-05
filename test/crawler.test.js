/* jshint esversion: 6 */

const Crawler = require('../lib/crawler');
const crawler = Crawler('https://127.0.0.1/3000');
const cheerio = require('cheerio');
const server = require('./lib/server');



describe('getPageLinks', () => {
  test('should exist and be a function', () => {
    expect(crawler.getPageLinks).toBeDefined();
    expect(typeof crawler.getPageLinks).toBe('function');
  });
  
  test('should return an array of links when they exist in dom', () => {
    const validLink = 'http://google.com';
    const $ = cheerio.load(`<a href="${validLink}"></a>`);
    const links = crawler.getPageLinks($);
    expect(Array.isArray(links)).toBeTruthy();
    expect(links.length).toBe(1);
    expect(links[0]).toBe(validLink);
  });

  test('should not return invalid links from dom', () => {
    const inValidLink1 = 'javascript:';
    const inValidLink2 = 'mailto:';
    const $ = cheerio.load(`<a href="${inValidLink1}"></a><a href="${inValidLink2}"></a>`);
    const links = crawler.getPageLinks($);
    expect(Array.isArray(links)).toBeTruthy();
    expect(links.length).toBe(0);
  });

  test('should return a unique list', () => {
    const link1 = 'http://google.com';
    const link2 = 'http://google.com';
    const $ = cheerio.load(`<a href="${link1}"></a><a href="${link2}"></a>`);
    const links = crawler.getPageLinks($);
    expect(Array.isArray(links)).toBeTruthy();
    expect(links.length).toBe(1);
  });
});

describe('getAssets', () => {
  test('should exist and be a function', () => {
    expect(crawler.getAssets).toBeDefined();
    expect(typeof crawler.getAssets).toBe('function');
  });
  
  test('should return an array of assets when they exist in dom', () => {
    const asset1 = 'http://imag1.jpg';
    const asset2 = 'http://site.css';
    const $ = cheerio.load(`<img src="${asset1}"></img><link href="${asset2}"></link>`);
    const links = crawler.getAssets($);
    expect(Array.isArray(links)).toBeTruthy();
    expect(links.length).toBe(2);
    expect(links[0]).toBe(asset1);
    expect(links[1]).toBe(asset2);
  });

  test('should not return invalid assets from dom', () => {
    const inValidLink1 = 'http://imag1.ppp';
    const $ = cheerio.load(`<a href="${inValidLink1}"></a>`);
    const links = crawler.getAssets($);
    expect(Array.isArray(links)).toBeTruthy();
    expect(links.length).toBe(0);
  });

  test('should return unique assets', () => {
    const asset1 = 'http://imag1.jpg';
    const asset2 = 'http://imag1.jpg';
    const $ = cheerio.load(`<a href="${asset1}"></a><a href="${asset2}"></a>`);
    const links = crawler.getAssets($);
    expect(Array.isArray(links)).toBeTruthy();
    expect(links.length).toBe(1);
    expect(links[0]).toBe(asset1);
  });
});


describe('Crawl', () => {
  test('methods should exist', () => {
    expect(crawler.start).toBeDefined();
    expect(typeof crawler.getPageLinks).toBe('function');
    expect(crawler.on).toBeDefined();
    expect(typeof crawler.getPageLinks).toBe('function');
  });

  test('start crawl site and return data', () => {
    server.listen(3000);
    const crawler = Crawler('http://127.0.0.1:3000/');
    let links = [];
    crawler.start();
    crawler.on('data', (data) => {
      links.push(data);
    });
    crawler.on('done', () => {
      expect(links.length).toBe(5);
      expect(links[0].pageLinks).toBeDefined();
      expect(links[0].pageAssets).toBeDefined();
      expect(links[0].pageLinks.length).toBe(3);
      expect(links[1].pageLinks).toBeDefined();
      expect(links[1].pageAssets).toBeDefined();
      expect(links[1].pageLinks.length).toBe(1);
      expect(links[1].pageLinks[0]).toBe('/index');
      server.close();
    });
  });
});


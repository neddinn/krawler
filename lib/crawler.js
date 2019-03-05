/* jshint esversion: 6 */

const util = require('./helpers/util');
const request = require('request');
const cheerio = require('cheerio');
const URL = require('url-parse');
const EventEmitter = require('events');
const robotsParser = require('robots-txt-parser');
const robots = robotsParser({
    userAgent: 'Googlebot',
    allowOnNeutral: false
  });



class MyEmitter extends EventEmitter {}
module.exports = (startLink) => {
  let linksVisited = {};
  let linksToVisit = [];
  startLink = util.cleanURL(startLink);
  const url = new URL(startLink);
  const baseUrl = url.protocol + "//" + url.hostname;

  let crawler = Object.assign(MyEmitter.prototype, {});

  crawler.crawl = () => {
    if(linksToVisit.length) {
      const link = linksToVisit.shift();
      if(!linksVisited[link]) {
        crawler.visitLink(link);
      }
    } else {
      crawler.emit('done');
    }
  };

  crawler.visitLink = (url) => {
    linksVisited[url] = true;
    if(!robots.canCrawlSync(url)) return crawler.crawl();
    request(url, (error, response, body) => {
      if (!error) {
        const $ = cheerio.load(body);
        const title = $('title').text();
        const relativeLinks = crawler.getRelativeLinks($);
        relativeLinks.forEach((link) => {
          linksToVisit.indexOf(link) === -1 &&
            !linksVisited[link] && linksToVisit.push(link);
        });
        const siteData = {
          url,
          pageLinks: crawler.getPageLinks($),
          pageAssets: crawler.getAssets($),
        };

        crawler.emit('data', siteData);
        crawler.crawl();
      }
      else {
        // handle error
      }
    });
  };

  crawler.getPageLinks = $ => {
    const rawLinks = $("a");
    const regex = /^[a-z]+:(?!\/\/)/i; //e.g mailto
    allLinks = [];
    rawLinks.each(function() {
      let link = $(this).attr('href');
      link = util.cleanURL(link);
      link &&
        !link.match(regex) &&
        allLinks.push(link);
    });
    return Array.from(new Set(allLinks)); //unique links
  };

  crawler.getAssets = $ => {
    const assetTypes = [
      'gif',
      'jpg',
      'jpeg',
      'png',
      'ico',
      'bmp',
      'ogg',
      'webp',
      'mp4',
      'webm',
      'mp3',
      'ttf',
      'woff',
      'json',
      'rss',
      'atom',
      'gz',
      'zip',
      'rar',
      '7z',
      'css',
      'js',
      'gzip',
      'exe',
      'svg'
    ].join('|');
    const assetsPattern = new RegExp(`\\.(${assetTypes})$`, 'i');
    let assetLinks = [];
    const assetAttrs = ['src', 'href'];
    assetAttrs.forEach((attr) => {
      const attrListData = $(`[${attr}]`);
      attrListData.each(function() {
        let link = $(this).attr(attr);
        link = /^https?:\/\//.test(link) ? link : baseUrl + link;
        assetsPattern.test(link) && assetLinks.push(link);
      });
    });
    return Array.from(new Set(assetLinks)); //unique assets
  };

  crawler.getRelativeLinks = $ =>
    $('a[href]')
      .filter(function iteratee() {

        let href = $(this).attr('href');
        // is relative path
        if (/^https?:\/\//.test(href)) {
          if(!href.startsWith(baseUrl)) return false;
        }
        // add more checks
        const filterPatterns = [
          /^#.+|^[a-z]+:(?!\/\/)/i, //e.g javascript: or #about
        ];

        return filterPatterns.every(pattern => !pattern.test(href));
      })
      .map(function iteratee() {
        let href = $(this).attr('href');

        // Uniform leading slash in relative links
        if (!href.startsWith(baseUrl) && !href.startsWith('/')) {
          href = `/${href}`;
        }

        href = href.startsWith(baseUrl) ? href : startLink + href;
        return href;
      }).get();


  crawler.start = () => {
    linksToVisit = [startLink];
    robots.useRobotsFor(startLink)
      .then(() => crawler.crawl())
      .catch(() => crawler.crawl());
  };

  return crawler;
};
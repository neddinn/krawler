/* jshint esversion: 6 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const cpFile = require('cp-file');

module.exports = (filePath) => {
  const tempFile = path.join(os.tmpdir(), `sitemap-${Date.now()}.xml`);
  const stream = fs.createWriteStream(tempFile);

  stream.write('<?xml version="1.0" encoding="utf-8" standalone="yes" ?>');
  stream.write('\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

  add = ({url, pageLinks, pageAssets}) => {
    stream.write('\n  <url>');
    stream.write(`\n    <loc>${url}</loc>`);
    if(pageLinks && pageLinks.length) {
      stream.write(`\n    <links>`);
      pageLinks.forEach(link => {
        stream.write(`\n      <loc>${link}</loc>`);
      });
      stream.write(`\n    </links>`);
    }
    if(pageAssets && pageAssets.length) {
      stream.write(`\n    <assets>`);
      pageAssets.forEach(asset => {
        stream.write(`\n      <loc>${asset}</loc>`);
      });
      stream.write(`\n    </assets>`);
    }
    stream.write('\n  </url>');
  };

  end = async () => {
    stream.write('\n</urlset>');
    stream.end();
    try {
      await cpFile(tempFile, filePath);
      fs.unlinkSync(tempFile);
      
    } catch (e) {
      return false;
    }
    return true;
  };

  return { add, end, };
};
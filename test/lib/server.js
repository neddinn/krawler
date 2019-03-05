var http = require('http');

var http = require('http');
const server = http.createServer(function (req, res) {
  const header = req.url == '/robots.txt' ? 
    {'Content-Type': 'text/plain'} : {'Content-Type': 'text/html'};
  res.writeHead(200, header); 
    var url = req.url;
    switch (req.url) {
      case ('/about'):
        res.write('<a href="/index">index page<h1>'); 
        res.end();
        break;
      case ('/team'):
        res.write('<a href="/index">index page<h1>'); 
        res.end();
        break;
      case ('/admin'):
        res.write('<a href="/index">index page<h1>'); 
        res.end();
        break;
      case ('/robots.txt'):
        res.write('User-agent: * \nDisallow: /admin'); 
        res.end();
        break;
      default:
        res.write('<a href="/about">about us page<h1>'); 
        res.write('<a href="/team">team page<h1>'); 
        res.write('<a href="/admin">admin<h1>'); 
        res.end();
        break;
  }
});


// server.listen(3000);


module.exports = server;

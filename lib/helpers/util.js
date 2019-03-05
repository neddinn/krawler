/* jshint esversion: 6 */

const cleanURL = (link) => {

  link = link.replace(/(#.*)$/, '');
  
  // unify same links with/withouut trailing slash 
  // To allow for getting unique links
  link = link.endsWith('/') ? link.slice(0, -1) : link;
  return link;
};

module.exports = {
  cleanURL,
};
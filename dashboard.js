/*global window:true,document:true,chrome:true,Mustache:true */
(function () {
'use strict';

function parseURL(url) {
  var parser = document.createElement();
  parser.href = url;
  return {
    'protocol': parser.protocol,
    'hostname': parser.hostname,
    'port': parser.port,
    'pathname': parser.pathname,
    'search': parser.search,
    'hash': parser.hash,
    'host': parser.host
  };
}

var data = JSON.parse(window.localStorage.logs);
var logElem = document.getElementById('log');
var template = document.getElementById('template').innerHTML;
var context = {
  logs: data,
  domain: function() {
    return parseURL(this).hostname;
  }
};
logElem.innerHTML = Mustache.render(template, context);

})();

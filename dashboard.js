/*global window:true,document:true,chrome:true,Mustache:true */
(function () {
'use strict';

function parseURL(url) {
  var parser = document.createElement('a');
  parser.href = url.replace(/^view-source:/, '');
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
var timespans = data.map(function (v, i) {
  var domain = v.url && parseURL(v.url).hostname;
  return {domain: domain, time: new Date(v.time)};
});

for (var i = 0; i < timespans.length; ++i) {
  var next;
  if (i+1 < timespans.length) {
    next = timespans[i+1].time;
  } else {
    next = new Date();
  }
  timespans[i].elapsed = next - timespans[i].time;
}
var _summary = {}, summary = [];
for (i = 0; i < timespans.length; ++i) {
  var t = timespans[i];
  if (t.domain) {
    _summary[t.domain] = (_summary[t.domain] || 0) + t.elapsed;
  }
}
for (i in _summary) {
  summary.push({domain: i, elapsed: _summary[i]});
}

var logElem = document.getElementById('log');
var template = document.getElementById('template').innerHTML;
var context = {
  logs: data,
  summary: summary,
  domain: function() {
    return parseURL(this.url).hostname;
  }
};
logElem.innerHTML = Mustache.render(template, context);

})();

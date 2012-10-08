/*global window:true,document:true,chrome:true,Mustache:true,Raphael:true,
         moment:true */
(function ($) {
'use strict';

moment.lang(window.navigator.language);

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

var data = JSON.parse(window.localStorage.logs || '[]');
var now = new Date();
var limit = new Date(now.getTime());
limit.setDate(limit.getDate() - 1);
var timespans = data.map(function (v, i) {
  var domain = v.url && parseURL(v.url).hostname;
  return {domain: domain, time: new Date(v.time)};
}).filter(function (v) {
  return v.time > limit;
});

for (var i = 0; i < timespans.length; ++i) {
  var next;
  if (i+1 < timespans.length) {
    next = timespans[i+1].time;
  } else {
    next = now;
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
summary.sort(function (a, b) { return b.elapsed - a.elapsed; });

var recentLog = data.slice(-20);
recentLog.reverse();
var context = {
  logs: recentLog,
  summary: summary.slice(0, 5),
  domain: function () {
    return parseURL(this.url).hostname;
  },
  elapsed_time: function () {
    return moment.duration(this.elapsed).humanize();
  }
};
$('#daily').append(renderTemplate('#template-mostvisited', context));
$('#log').html(renderTemplate('#template-log', context));

var r = Raphael($('#daily .chart')[0], 780, 400);
r.piechart(200, 200, 150,
           summary.map(function (e) { return e.elapsed; }),
           {legend: summary.map(function (e) { return e.domain; })});
var range = now - limit;
var used = summary.reduce(function (a, b) { return a + b.elapsed; }, 0);
r.piechart(620, 120, 70, [used, range - used], {legend: ['used', 'unused']});


function renderTemplate(template, context) {
  template = $(template).html();
  return Mustache.render(template, context);
}

})(Zepto);

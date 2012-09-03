/*global chrome:true */
(function () {
'use strict';

var dashboardURL = chrome.extension.getURL('dashboard.html');

function log(tab, time) {
  var url = null;
  if (tab) {
    url = tab.url;
    if (url.match(/chrome[\-\w]*:\/\//)) {
      url = null;
    }
  }
  var logs = JSON.parse(window.localStorage['logs'] || '[]');
  logs.push({url: url, time: time});
  window.localStorage['logs'] = JSON.stringify(logs);
}

function tabChanged(tab) {
  var now = new Date();
  if (tab !== null) {
    log(tab, now);
  } else {
    log(null, now);
  }
}

chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.query({ url: dashboardURL }, function (tabs) {
    if (tabs.length) {
      chrome.tabs.update(tabs[0].id, { active: true });
    } else {
      chrome.tabs.create({ url: dashboardURL });
    }
  });
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    tabChanged(tab);
  });
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    tabChanged(null);
  } else {
    chrome.tabs.query({windowId: windowId, active: true}, function (tabs) {
      tabChanged(tabs[0]);
    });
  }
});

})();
/*
 Three Status Types/Hash key-value pair for selectStatus

selectStatus :
  select :
    * clipboardOnly
    * searchOnly
    * copySearchOnly
    * optionOnly
  tab :
    * dontChangeTab
    * changeTab
  input :
    * dontSelectText
    * selectText
  highlight :
    * highlightText
    * dontHighlightText
  language :
    * all languages codes dropdown
*/


chrome.storage.sync.get('selectStatus', function (obj) {
  if(obj.selectStatus == null || obj.selectStatus && obj.selectStatus["select"] == null){
    chrome.storage.sync.set({ 'selectStatus': {"select": "optionOnly", "tab": "changeTab", "input": "dontSelectText", "highlight": "dontHighlightText", "language": "bn"} }, function() {
      console.log("SelecTron Setup done.")
    });
  }
  if(obj.selectStatus == null || obj.selectStatus && obj.selectStatus["input"] == null){
    chrome.storage.sync.set({ 'selectStatus': {"select": obj.selectStatus["select"], "tab": obj.selectStatus["tab"], "input": "dontSelectText", "highlight": obj.selectStatus["highlight"], "language": obj.selectStatus["language"]} }, function() {
      console.log("SelecTron Setup done.")
    });
  }
  if(obj.selectStatus == null || obj.selectStatus && obj.selectStatus["highlight"] == null){
    chrome.storage.sync.set({ 'selectStatus': {"select": obj.selectStatus["select"], "tab": obj.selectStatus["tab"], "input": obj.selectStatus["input"], "highlight": "dontHighlightText", "language": obj.selectStatus["language"]}}, function() {
      console.log("SelecTron Setup done.")
    });
  }
  if(obj.selectStatus == null || obj.selectStatus && obj.selectStatus["language"] == null){
    chrome.storage.sync.set({ 'selectStatus': {"select": obj.selectStatus["select"], "tab": obj.selectStatus["tab"], "input": obj.selectStatus["input"],"highlight": obj.selectStatus["highlight"], "language": "bn"} }, function() {
      console.log("SelecTron Setup done.")
    });
  }

});

chrome.runtime.onMessage.addListener(function(request) {
  var selectStatus = request.status["select"];
  var tabStatus = request.status["tab"]
  var highlightStatus = request.status["highlight"]
  var languageStatus = request.status["language"]
  var text = request.text;
  // Run actions based on current status set in storage
  if(selectStatus == "clipboardOnly") {
    copyText(text);
  } else if(selectStatus == "searchOnly") {
    runSearch(text, tabStatus); 
  }else if(selectStatus == "translateOnly") {
    Translator(text, tabStatus,languageStatus);
  } else if(selectStatus == "copySearchOnly") {
    copyText(text);
    runSearch(text, tabStatus);
  } else if(selectStatus == "optionOnly"){
    showOptionBox(text);
  } else if(selectStatus == "linkOnly"){
    Link(text, tabStatus);
  }

  if (highlightStatus == "highlightText") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: highlightStatus});
    });
  }
});

function copyText(text) {
  var input = document.createElement('textarea');
  document.body.appendChild(input);
  input.value = text;
  input.focus();
  input.select();
  document.execCommand('Copy');
  input.remove();
}

function runSearch(t, tabStatus) {
  var text = t.replace(/ /g,"+");
  var newURL = "https://www.google.com/search?q=" + text;
  if(tabStatus == "dontChangeTab"){
     chrome.tabs.create({url: newURL, active: false}, function(tab) {});
    // chrome.windows.create({'url': newURL, 'type': 'popup'}, function(window) {
    // });
  }else {
    chrome.tabs.create({url: newURL}, function(tab) {});
  }
}

function Translator(t, tabStatus,lang) {
  var text = t.replace(/ /g,"%20");
  var newURL = "https://translate.google.com/?sl=auto&tl="+lang+"&text="+text+"&op=translate";
  chrome.windows.create({'url': newURL}, function(window) {
  });

  // if(tabStatus == "dontChangeTab"){
  //   chrome.tabs.create({url: newURL, selected: false}, function(tab) {});
  // }else {
  //   chrome.tabs.create({url: newURL}, function(tab) {});
  // }
}
function Link(t, tabStatus) {
  var text = t.replace(" ", "");
  chrome.tabs.create({ url: text });
}

function showOptionBox(text) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: "showOptionBox"}, function(response) {
      // Do something here?
    });
  });
}

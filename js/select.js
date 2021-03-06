
if(!window.SelecTron){
  SelecTron = {};
}
SelecTron.Selector = {};

SelecTron.Selector.getSelected = function(){
  // Grab Selection
  var selection = window.getSelection();
  var text = selection.toString();
  var id = Math.random().toString(36).substring(7); // Creating random unique id
  return [text, id, selection];
}

SelecTron.Selector.mouseup = function(e){
  var sel = SelecTron.Selector.getSelected();
  var text = sel[0];
  var id = sel[1];
  var selection = sel[2];


  // Check is not empty and not filled with whitespaces only
  if(text !='' && text.length > 1 && $.trim(text).length != 0){

    // Get current user defined status set in the storage
    chrome.storage.sync.get('selectStatus', function (obj) {
      // Return false if the status is to not select text from input/text boxes.
      if (obj.selectStatus["input"] == "dontSelectText") {
        if ($(e.target).is('input') || $(e.target).is('textarea')) {
          return 0;
        }
      }

      // Then send the status and text to background
      chrome.runtime.sendMessage({
        status: obj.selectStatus,
        text: text,
        id: id
      });

      // Listen for calls from background. Specifically for option box
      chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          if(request.type == "showOptionBox") {

            // Check if in range and then add node for popover
            if (selection && selection.rangeCount > 0){ // Add new node only if something is actually selected
              var range =  selection.getRangeAt(0);
              var newNode = document.createElement("span");
              newNode.setAttribute('id', id);
              //Insert node for the pop up
              range.insertNode(newNode);
              // Create unique content for each popover
              var content = '<div style="cursor:pointer;color:white;text-align:center;"><img id="optionBoxCopy'+id+'"  src="'+chrome.extension.getURL('img/copy.png')+'"/> <img id="optionBoxSearch'+id+'" src="'+chrome.extension.getURL('img/link.png')+'"/> <img id="optionBoxTranslate'+id+'" src="'+chrome.extension.getURL('img/translate.png')+'"/>';
              $('#'+id).webuiPopover({placement:'auto',content: content, width: 100, trigger: "click"});
            }

            // Fire up the popover
            $("#"+id).click();

            // Trigger copy action
            $("#optionBoxCopy"+id).click(function() {
              chrome.runtime.sendMessage({
                status: {"select": "clipboardOnly", "tab": obj.selectStatus["tab"]},
                text: text
              });
              disablePopup(id);
            });

            // Trigger Search action
            $("#optionBoxSearch"+id).click(function() {
              chrome.runtime.sendMessage({
                status: {"select": "searchOnly", "tab": obj.selectStatus["tab"]},
                text: text
              });
              disablePopup(id);
            });

            // Trigger Translate action
            $("#optionBoxTranslate"+id).click(function() {
              chrome.runtime.sendMessage({
                status: {"select": "translateOnly", "tab": obj.selectStatus["tab"]},
                text: text
              });
              disablePopup(id);
            });

            // As title suggests. Ignore
            $("#ignore").click(function() {
              disablePopup(id);
            });
          } else if (request.type == "highlightText") {
            $("body").unmark();
            var options = {
              "element": "mark",
              "className": "",
              "exclude": [],
              "separateWordSearch": false,
              "accuracy": "partially",
              "diacritics": true,
              "synonyms": {},
              "iframes": false,
              "acrossElements": false,
              "caseSensitive": false,
              "ignoreJoiners": false,
              "debug": false,
              "log": window.console
            };
            $("<style>.mark,mark{background:#F77000;color:black;padding:.1em}</style>").appendTo("head");
            $("body").mark(text, options);
          }
        });

      });
    }
  }

  //  Things to do with a document ready function
  $(document).ready(function(){
    // Run the text selector on mouseup
    $(document).on("mouseup", SelecTron.Selector.mouseup);

    chrome.storage.sync.get('selectStatus', function (obj) {
      // Set status to pause on click
      $("#pause").click(function() {
        chrome.storage.sync.set({ 'selectStatus': {"select": "pause", "tab": obj.selectStatus["tab"], "input": obj.selectStatus["input"], "highlight": obj.selectStatus["highlight"]} }, function() {
          console.log("SelecTron Setup done.")
        });
        window.close();
      });
      // Remove pause button if already paused.
      if(obj.selectStatus["select"] == "pause"){
        $("#pause").remove();
      }
    });
  });

  function disablePopup(id){
    window.getSelection().empty();
    $('#'+id).webuiPopover("destroy");
  }

chrome.storage.sync.get('selectStatus', function (obj) {
  var selectStatus = obj.selectStatus["select"];
  var tabStatus = obj.selectStatus["tab"];
  var inputBoxStatus = obj.selectStatus["input"];
  var highlightStatus = obj.selectStatus["highlight"];
  var languageStatus = obj.selectStatus["language"];

  $("#"+selectStatus).prop( "selected", true );
  $("#"+tabStatus).prop( "selected", true );
  $("#"+inputBoxStatus).prop( "selected", true );
  $("#"+highlightStatus).prop( "selected", true );
  $("#"+languageStatus).prop( "selected", true );
  //$("select[name='translationSelect']").val(languageStatus);
  console.log(obj.selectStatus)
});

$(document).ready(function(){
  // Version number for the footer
  $("#versionNum").append("v"+chrome.runtime.getManifest().version);

  // Trigger action on option select settings change
  $("#generalOptionSave").click(function() {
    generalOptionChanges();
  });
});

function addAlert() {
  $("#showAlert").html("<div class=\"alert alert-success\" role=\"alert\">Changes Updated.</div>");
}

// Update select status to local storage API
function generalOptionChanges() {
  var selectStatus = $("select[name='generalOptionVal']").val();
  var tabStatus = $("select[name='addOptionVal']").val();
  var inputStatus = $("select[name='inputBoxSelect']").val();
  var highlightStatus = $("select[name='highlightVal']").val();
  var languageStatus = $("select[name='translationSelect']").val();

  chrome.storage.sync.set({'selectStatus': {"select": selectStatus, "tab": tabStatus, "input": inputStatus, "highlight": highlightStatus, "language": languageStatus}}, function() {
    addAlert();
  });
}

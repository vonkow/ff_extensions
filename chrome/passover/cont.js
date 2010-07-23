var licenses = [];
var getAndStore = function(targ) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange=function() {
		if (xhr.readyState==4 && xhr.status==200) {
			licenses.push(JSON.parse(xhr.responseText));
		}
	}
	xhr.open('GET', targ, true);
	xhr.send(null);
};
var scripts = document.getElementsByTagName('script');
for (var x=0; x<scripts.length; x++) {
	if (scripts[x].getAttribute('data-license')) {
		getAndStore(scripts[x].getAttribute('data-license'));
	}
};
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  if (request.method == "getLicenses") {
    // Send JSON data back to Popup.
    sendResponse({data: licenses});
  } else {
    sendResponse({}); // snub them.
  }
});


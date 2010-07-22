if ('undefined' == typeof(passover)) {
	var passover = {};
};

// Simple Datastore for keeping track of remaining script nodes to parse
// Also stores a bool for whether non-licensed scripts should be killed on sight.
// This bool should be moved into a preferences type datastore, as this isn't persistant.
passover.data = {
	killOffenders : false,
	toParse: 0,
	parsed: []
};

// Does nothing yet, will be used for differentiating between left and right click on the passover buton
passover.handleClick = function(event) {
	//show the menu on right-click
	if (event.target.id == "passover-panel") {
		/*
		if (event.button == 2) {
			document.getElementById(event.target.getAttribute("popup")).openPopup(event.target, "before_start");
		} else if (event.button == 0) {
			//open manage styles on middle click
			passoverExt.test();
		}
		*/
	}
};

// Makes AJAX request for json license file
// Once all licenses have been downloaded, it calls makePage() to populate the info page
passover.getLicense = function(license) {
	var xhr= new XMLHttpRequest();
	xhr.onreadystatechange=function(event) {
		if (this.readyState==4) {
			passover.data.toParse--;
			if (!window['JSON']) {
				passover.data.parsed.push(eval('('+this.responseText+')'));
			} else {
				passover.data.parsed.push(JSON.parse(this.responseText));
			};
			if (!passover.data.toParse) {
				passover.makePage();
			};
		}
	}
	xhr.open('GET', license, true);
	xhr.send(null);
	passover.data.toParse++;
};

passover.makeLine=function(prop, ob, doc) {
};

// Makes a page with all license info from a site. This info should show up in a little popup indstead,
// but I need to learn more XUL
passover.makePage=function() {
	var newTabBrowser = gBrowser.getBrowserForTab(gBrowser.addTab('about:blank'));
	newTabBrowser.addEventListener("load", function() {
		var theDoc = newTabBrowser.contentDocument;
		for (var x=0; x<passover.data.parsed.length; x++) {
			var licData=passover.data.parsed[x].license;
			var licArea = theDoc.createElement('ul');
			for (licProp in licData) {
				var tempP = theDoc.createElement('li');
				if (licData[licProp] instanceof Array) {
					var tempC = theDoc.createTextNode(licProp+ ' :');
					var tempB = theDoc.createElement('br');
					var tempList = theDoc.createElement('ul');
					for (var y=0;y<licData[licProp].length; y++) {
						var tempLP = theDoc.createElement('li');
						var tempLC = licData[licProp][x];
						var tempLT = theDoc.createTextNode(tempLC);
						tempLP.appendChild(tempLT);
						tempList.appendChild(tempLP);
					}
					tempP.appendChild(tempC);
					tempP.appendChild(tempB);
					tempP.appendChild(tempList);
					licArea.appendChild(tempP);

				} else if ('object' == typeof(licData[licProp])) {
					var tempC = theDoc.createTextNode(licProp+ ' :');
					var tempB = theDoc.createElement('br');
					var tempList = theDoc.createElement('ul');
					for (subProp in licData[licProp]) {
						var tempLP = theDoc.createElement('li');
						var tempLC = subProp+' : '+licData[licProp][subProp];
						var tempLT = theDoc.createTextNode(tempLC);
						tempLP.appendChild(tempLT);
						tempList.appendChild(tempLP);
					}
					tempP.appendChild(tempC);
					tempP.appendChild(tempB);
					tempP.appendChild(tempList);
					licArea.appendChild(tempP);
				} else {
					if (licData[licProp].indexOf('http://') != -1) {
						var tempC = theDoc.createTextNode(licProp+' : ');
						var tempA = theDoc.createElement('a');
						tempA.appendChild(theDoc.createTextNode(licData[licProp]));
						tempA.href = licData[licProp];
						tempP.appendChild(tempC);
						tempP.appendChild(tempA);
					} else {
						var tempC = theDoc.createTextNode(licProp+' : '+licData[licProp]);
						tempP.appendChild(tempC);
					};
					licArea.appendChild(tempP);
				}
			};
			theDoc.body.appendChild(licArea);
		};
	}, true);
};

// Checks all script elements on a page for whether they have a data-license attribute or not
// Does nothing at the moment, called on pageload
passover.check=function(event) {
	let doc = event.originalTarget;
	if (doc instanceof HTMLDocument) {
		if (doc.defaultView.frameElement) {
			while (doc.defaultView.frameElement) {
				doc = doc.defaultView.frameElement.ownerDocument;
			}
		}
	};
	var scriptEles = doc.getElementsByTagName('script');
	if (scriptEles.length) {
		if (!scriptEles[0].getAttribute('data-license-full')) {
			for (var x=0; x<scriptEles.length;x++) {
				if (!scriptEles[x].getAttribute('data-license')) {
					//if (passover.data.killOffenders) {
						//scriptEles[x].parentNode.removeChild(scriptEles[x]);
						//x--;
					//}
				}
			}
		} else {
		}
	}
};

// Returns the content of the specified script element,
// When getting content via src, it makes an SJAX request, this could hang on a bad connection.
passover.scanScript = function(ele) {
	if (!ele.src) {
		if (ele.firstChild) {
			var scriptSrc = ele.firstChild.nodeValue;
			return scriptSrc;
		}
	} else {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", ele.src, false);
		xhr.send(null);
		var scriptSrc = xhr.responseText;
		return scriptSrc;
	};
};

// Checks all script elements on a page for data-license attributes, then gets the data and displays it
passover.test = function(event) {
	var doc = gBrowser.contentDocument;
	var scriptEles = doc.getElementsByTagName('script');
	if (scriptEles.length) {
		if (!scriptEles[0].getAttribute('data-license-full')) {
			for (var x=0; x<scriptEles.length; x++) {
				if (scriptEles[x].getAttribute('data-license')) {
					passover.getLicense(scriptEles[x].getAttribute('data-license'));
				} else {
					alert(passover.scanScript(scriptEles[x]));
					//if (passover.data.killOffenders) {
						//scriptEles[x].parentNode.removeChild(scriptEles[x]);
						//x--;
					//}
				}
			}
		} else {
			passover.getLicense(scriptEles[0].getAttribute('data-license-full'));
		}
	}
};

window.addEventListener('load',function(){gBrowser.addEventListener('load',passover.check,true)},true);

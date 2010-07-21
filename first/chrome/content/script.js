if ('undefined' == typeof(passoverExt)) {
	var passoverExt ={};
};

passoverExt.data = {
	killOffenders : false,
	toParse: 0,
	parsed: []
};

passoverExt.handleClick = function(event) {
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

passoverExt.getLicense = function(license) {
	var xhr= new XMLHttpRequest();
	xhr.onreadystatechange=function(event) {
		if (this.readyState==4) {
			passoverExt.data.toParse--;
			if (!window['JSON']) {
				passoverExt.data.parsed.push(eval('('+this.responseText+')'));
			} else {
				passoverExt.data.parsed.push(JSON.parse(this.responseText));
			};
			if (!passoverExt.data.toParse) {
				passoverExt.makePage();
			};
		}
	}
	xhr.open('GET', license, true);
	xhr.send(null);
	passoverExt.data.toParse++;
};

passoverExt.makeLine=function(prop, ob, doc) {
};

passoverExt.makePage=function() {
	var newTabBrowser = gBrowser.getBrowserForTab(gBrowser.addTab('about:blank'));
	newTabBrowser.addEventListener("load", function() {
		var theDoc = newTabBrowser.contentDocument;
		for (var x=0; x<passoverExt.data.parsed.length; x++) {
			var licData=passoverExt.data.parsed[x].license;
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

passoverExt.check=function(event) {
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
					//if (passoverExt.data.killOffenders) {
						//scriptEles[x].parentNode.removeChild(scriptEles[x]);
						//x--;
					//}
				}
			}
		} else {
		}
	}
};

passoverExt.test = function(event) {
	var doc = gBrowser.contentDocument;
	var scriptEles = doc.getElementsByTagName('script');
	if (scriptEles.length) {
		if (!scriptEles[0].getAttribute('data-license-full')) {
			for (var x=0; x<scriptEles.length; x++) {
				if (scriptEles[x].getAttribute('data-license')) {
					passoverExt.getLicense(scriptEles[x].getAttribute('data-license'));
				} else {
					//if (passoverExt.data.killOffenders) {
						//scriptEles[x].parentNode.removeChild(scriptEles[x]);
						//x--;
					//}
				}
			}
		} else {
			passoverExt.getLicense(scriptEles[0].getAttribute('data-license-full'));
		}
	}
};

window.addEventListener('load',function(){gBrowser.addEventListener('load',passoverExt.check,true)},true);

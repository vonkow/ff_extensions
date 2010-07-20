if ('undefined' == typeof(passoverExt)) {
	var passoverExt ={};
};

passoverExt.data = {
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
			passoverExt.data.parsed.push(this.responseText);
			if (!passoverExt.data.toParse) {
				var newTabBrowser = gBrowser.getBrowserForTab(gBrowser.addTab('about:blank'));
				newTabBrowser.addEventListener("load", function() {
					for (var x=0; x<passoverExt.data.parsed.length; x++) {
						//var licData=JSON.parse(passoverExt.data.parsed[x]);
						var licArea = newTabBrowser.contentDocument.createElement('div');
						var licText = newTabBrowser.contentDocument.createTextNode(passoverExt.data.parsed[x]);
						//var licText = newTabBrowser.contentDocument.createTextNode(JSON.stringify(licData));
						licArea.appendChild(licText);
						newTabBrowser.contentDocument.body.appendChild(licArea);
					};
				}, true);
			};
			//alert(this.responseText);
		}
	}
	xhr.open('GET', license, true);
	xhr.send(null);
	passoverExt.data.toParse++;
}

passoverExt.check=function(event) {
	let doc = event.originalTarget;
	if (doc instanceof HTMLDocument) {
		if (doc.defaultView.frameElement) {
			while (doc.defaultView.frameElement) {
				doc = doc.defaultView.frameElement.ownerDocument;
			}
		}
	}
	var scriptEles = doc.getElementsByTagName('script');
	//window.alert(scriptEles.length);
	for (var x=0; x<scriptEles.length;x++) {
		if (!scriptEles[x].getAttribute('data-license')) {
			//scriptEles[x].parentNode.removeChild(scriptEles[x]);
			//x--;
		}
	}
};

passoverExt.test = function(event) {
	var doc = gBrowser.contentDocument;
	var scriptEles = doc.getElementsByTagName('script');
	for (var x=0; x<scriptEles.length; x++) {
		if (scriptEles[x].getAttribute('data-license')) {
			passoverExt.getLicense(scriptEles[x].getAttribute('data-license'));
			//window.alert('good');
		} else {
			//window.alert('bad');
		}
	};
	//window.alert(scriptEles.length);
};

window.addEventListener('load',function(){gBrowser.addEventListener('load',passoverExt.check,true)},true);

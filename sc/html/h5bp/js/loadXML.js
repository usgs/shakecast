
function loadXML(flag, xmldoc) {
	if (window.ActiveXObject) {
		var activexName = ["MSXML2.DOMDocument", "Microsoft.XmlDom"];
		var xmlObj;
		for (var i=0; i < activexName.length; i++) {
			try {
				xmlObj = new ActiveXObject(activexName[i]);
				break;
			} catch (e) {}
		}
		
		if (xmlObj) {
			if (flag) {
				xmlObj.load(xmldoc);
			} else {
				xmlObj.loadXML(xmldoc);
			}
			return xmlObj.documentElement;
		} else {
			alert("Failed to load XML Document.");
			return null;
		}	
	} else if (document.implementation.createDocument) {
		var xmlObj;
		if (flag) {
			xmlObj = document.implementation.createDocument("", "", null);
			if (xmlObj) {
				//xmlObj.async = false;
				xmlObj.load(xmldoc);
				xmlObj.onload=callback;
	alert(xmlObj.documentElement);
				return xmlObj.documentElement;
			} else {
				alert("Failed to load XML Document.");
				return null;
			}
		} else {
			xmlObj = new DOMParser();
			var docRoot = xmlObj.parseFromString(xmldoc, "text/xml");
			return docRoot.documentElement;
		}
	}

	alert("Failed to load XML Document.");
	return null;
}


function XMLRequest() {
	var xmlhttp;
	
	if (window.XMLHttpRequest) {
		xmlhttp = new XMLHttpRequest();
		if (xmlhttp.overrideMimeType) {
			xmlhttp.overrideMimeType("text/xml");
		}
	} else if (window.ActiveXObject) {
		var activexName = ["MSXML2.XMLHTTP.6.0", "MSXML2.XMLHTTP.5.0",
			"MSXML2.XMLHTTP.4.0", "MSXML2.XMLHTTP.3.0", 
			"MSXML2.XMLHTTP", "Microsoft.XMLHTTP"];
		for (var i=0; i< activexName.length; i++) {
			try {
				xmlhttp = new ActiveXObject(activexName[i]);
				break;
			} catch(e) {}
		}
	}
	
	return xmlhttp;
	
}

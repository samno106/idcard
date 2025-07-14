var websocket = null;
var host = "ws://127.0.0.1:90/echo"; 

var strDeviceConnected = "";

// load connection
window.onload = function(){
	connect();
}

window.onbeforeunload = function(event) {
		if (websocket !== null) {
			websocket.close();
			websocket = null;
		}
	}


function connect(){

	try {

		if (websocket != null) {
			websocket.close();
		}
		
		websocket = new WebSocket(host);
	
		websocket.onopen = function() {

			getWebConstants();

			setDefaultSettings();

			timerId = setInterval(getDeviceStatus(), 1000);

		}

		websocket.onmessage = function(event) {
			var retmsg = event.data;
			var jsonMsg;
			
			try {
				jsonMsg = JSON.parse(retmsg);
				
				if (jsonMsg.Type == 'Reply') 
				{
					if (jsonMsg.hasOwnProperty('Commands')) 
					{
						for (var index in jsonMsg.Commands) 
						{
							processReply(jsonMsg.Commands[index]);
						}
					} else 
					{
						processReply(jsonMsg);
					}
				} else if (jsonMsg.Type == 'Notify') 
				{
					processNotify(jsonMsg);
				}
				return;
			} catch (exception) {
				// document.getElementById("msg").innerHTML = "Parse error: " + event.data;
			}
		}

		websocket.onclose = function() {

			if (websocket !== null) {
				
				websocket.close();
				websocket = null;
			}

		}

		websocket.onerror = function(evt) {
			console.log(evt)
			
		}

		
		
		
	} catch (exception) {
		console.log("error");
	}

}

function disConnect() {
	if (websocket != null) {
		websocket.close();
		websocket = null;
	}
}

function AcquireImage() {

	var cmdAcquireImage = {
		Type: "Notify",
		Command: "Get",
		Operand: "ImageMessage",
		Param: 2
	};
	
	sendJson(cmdAcquireImage);
}


function getDeviceStatus() {
		var request = {
			Type: "Request",
			Commands: [
				{Command:"Get", Operand:"OnLineStatus"},  
				{Command:"Get", Operand:"DeviceName"},  
				{Command:"Get", Operand:"DeviceType"},   
				{Command:"Get", Operand:"DeviceSerialNo"},
				{Command:"Get", Operand:"VersionInfo"}
			]
		};
		
		sendJson(request);
}

function setDefaultSettings() {
		var request = {
			Type: "Request",
			Commands: [
				{Command:"Set", Operand:"RFID", Param:"Y"},
				{Command:"Set", Operand:"VIZ", Param:"Y"} 
			]
		};
		
		sendJson(request);
}

function getWebConstants() {
	var request = {
		Type: "Request",
		Commands: [
			{Command:"Get", Operand:"WebConstant", Param:"CardRecogSystem"},
			{Command:"Get", Operand:"WebConstant", Param:"Connect"},
			{Command:"Get", Operand:"WebConstant", Param:"Disconnect"},
			{Command:"Get", Operand:"WebConstant", Param:"Save"},
			{Command:"Get", Operand:"WebConstant", Param:"IDCANCEL"},
			{Command:"Get", Operand:"WebConstant", Param:"DeviceStatus"},
			{Command:"Get", Operand:"WebConstant", Param:"DeviceName"},
			{Command:"Get", Operand:"WebConstant", Param:"DeviceSerialno"},
			{Command:"Get", Operand:"WebConstant", Param:"DeviceNotConnected"},
			{Command:"Get", Operand:"WebConstant", Param:"DescOfWebsocketError"},
			{Command:"Get", Operand:"WebConstant", Param:"DescFailSetRFID"},
			{Command:"Get", Operand:"WebConstant", Param:"DescFailSetVIZ"},
			{Command:"Get", Operand:"WebConstant", Param:"PlaceHolderCardTextInfo"},
			{Command:"Get", Operand:"WebConstant", Param:"DeviceOffLine"},
			{Command:"Get", Operand:"WebConstant", Param:"DeviceReconnected"},
			{Command:"Get", Operand:"WebConstant", Param:"DescFailSendWebsocket"},
			{Command:"Get", Operand:"WebConstant", Param:"WebDescDeviceNotFound"},
			{Command:"Get", Operand:"WebConstant", Param:"WebDescRequireRestartSvc"},
			{Command:"Get", Operand:"WebConstant", Param:"WebDescAskForSupport"},
			{Command:"Get", Operand:"WebConstant", Param:"WebDescRequireReconnect"},
			{Command:"Get", Operand:"WebConstant", Param:"DeviceConnected"}
		]
	};
	sendJson(request);
}

function SaveSettings() {
		bCardDetectedNotification = document.getElementById("CallBack").checked || document.getElementById("CardDetect").checked;
		
		var request = {
			Type: "Request",
			Commands: [
				{Command:"Set", Operand:"VIZ", Param:checkStatusToString("RecogVIZ")},
				{Command:"Set", Operand:"RFID", Param:checkStatusToString("RecogRFID")},
				{Command:"Set", Operand:"Rejection", Param:checkStatusToString("Rejection")},
				{Command:"Set", Operand:"IfEnableCallback", Param:checkStatusToString("CallBack")},
				{Command:"Set", Operand:"IfNotifyCardDetected", Param:checkStatusToString("CardDetect")},
				{Command:"Set", Operand:"MRZOnWhiteImage", Param:checkStatusToString("MRZOnWhite")},
				{Command:"Set", Operand:"IfDetectUVDull", Param:checkStatusToString("UVDull")},
				{Command:"Set", Operand:"IfDetectFibre", Param:checkStatusToString("Fibre")},
				{Command:"Set", Operand:"IfCheckSourceType", Param:checkStatusToString("SourceType")},
				{Command:"Set", Operand:"BarCodeRecog", Param:checkStatusToString("BarCode")}
			]
		};
		
		sendJson(request);
		
		document.getElementById("settings").style.display = "none";
		document.getElementById("control").style.display = "block";
		document.getElementById("cardInfo").style.display = "block";
	}

function sendJson(jsonData) {
	try {
		if (websocket !== null) {
			websocket.send(JSON.stringify(jsonData));
		}
	} catch (exception) {
		//document.getElementById("msg").innerHTML = strDescFailSendWebsocket;
	}
}


function processReply(msgReply) {

	if (msgReply.Command == 'Get') 
	{
		if (msgReply.Succeeded == 'Y') 
		{ 
			if (msgReply.Operand == 'DeviceName') { 
			
				console.log("DeviceName: ",msgReply.Result)

			} else if (msgReply.Operand == 'DeviceSerialNo') {
				
				console.log("deviceSerial: ",msgReply.Result)

			} else if (msgReply.Operand == 'OnLineStatus') {
				
				if (msgReply.Result == strDeviceConnected) {
					
					if (strDeviceConnected === "Device is connected") {
						console.log("OnLineStatus: ", msgReply.Result)
					}
					else
					{
						console.log("OnLineStatus 1: ", msgReply.Result)
					}
					
				}
			} else if(msgReply.Operand=='VersionInfo'){
							   
				if (strDeviceConnected === "Device is connected") {
					console.log("versionsKey: ", msgReply.Result)		
				} else {
					console.log("versionsKey: ", msgReply.Result)	
				}					
				
			} else if (msgReply.Operand == 'DeviceType') {
				if (msgReply.Result == 'Scanner') {
					
					console.log("Scanner: ", msgReply.Result)	
				}
				else{
					console.log("No Scanner: ", msgReply.Result)
					
				}
			
				var domDevType = document.getElementById("DevType");
				for (i = 0; i < domDevType.options.length; ++i) {
					if (msgReply.Result == domDevType.options[i].value) {
						domDevType.options[i].selected = true;
					}
				}
			} else if (msgReply.Operand == 'WebConstant') {
				if (msgReply.Param == 'CardRecogSystem') {
					strTitle = msgReply.Result;
				} else if (msgReply.Param == 'Connect') {
					strConnect = msgReply.Result;
				
					// document.getElementById("connection").value = msgReply.Result;
				} else if (msgReply.Param == 'Disconnect') {
					strDisconnect = msgReply.Result;
	
					// document.getElementById("connection").value = msgReply.Result;
				} else if (msgReply.Param == 'Save') {
					console.log("btnSaveSettings: ", msgReply.Result)
				
				} else if (msgReply.Param == 'IDCANCEL') {
					console.log("IDCANCEL: ", msgReply.Result)
					
				} else if (msgReply.Param == 'DeviceStatus') {
					strDeviceStatus = msgReply.Result;
				} else if (msgReply.Param == 'DeviceName') {
					strDeviceName = msgReply.Result;
					
					console.log("deviceNameKey:", strDeviceName)
				} else if (msgReply.Param == 'Version') {
					strVersion = msgReply.Result;
					console.log("Version:", strDeviceName)
				}else if (msgReply.Param == 'DeviceSerialno') {
					strDeviceSerialno = msgReply.Result;
					console.log("strDeviceSerialno:", strDeviceSerialno)
				} else if (msgReply.Param == 'DeviceNotConnected') {
					strDevNotConnect = msgReply.Result;
				} else if (msgReply.Param == 'DescOfWebsocketError') {
					strDescOfWebsocketError = msgReply.Result;
				} else if (msgReply.Param == 'DescFailSetRFID') {
					strDescFailSetRFID = msgReply.Result;
				} else if (msgReply.Param == 'DescFailSetVIZ') {
					strDescFailSetVIZ = msgReply.Resultl;
				} else if (msgReply.Param == 'PlaceHolderCardTextInfo') {
					strPlaceHolderCardTextInfo = msgReply.Result;
					// document.getElementById("msg").setAttribute("placeholder", strPlaceHolderCardTextInfo);
				} else if (msgReply.Param == 'DescFailSendWebsocket') {
					strDescFailSendWebsocket = msgReply.Result;
				} else if (msgReply.Param == 'DeviceOffLine') {
					strDeviceOffLine = msgReply.Result;
				} else if (msgReply.Param == 'DeviceReconnected') {
					strDeviceReconnected = msgReply.Result;
				} else if (msgReply.Param == 'WebDescDeviceNotFound') {
					strWebDescDeviceNotFound = msgReply.Result;
				} else if (msgReply.Param == 'WebDescRequireRestartSvc') {
					strWebDescRequireRestartSvc = msgReply.Result;
				} else if (msgReply.Param == 'WebDescAskForSupport') {
					strWebDescAskForSupport = msgReply.Result;
				} else if (msgReply.Param == 'WebDescRequireReconnect') {
					strWebDescRequireReconnect = msgReply.Result;
				} else if (msgReply.Param == 'DeviceConnected') {
					strDeviceConnected = msgReply.Result;
				}
			}
		}else if(msgReply.Succeeded == 'N'){
			if(msgReply.Operand == 'TakePhotoOcr'){
				
				console.log("errorMessage:", msgReply.Result)
				
			}
		}
	} else if (msgReply.Command == 'Set') {
		if (msgReply.Succeeded == 'N') { 
			if (msgReply.Operand == 'RFID') {
				console.log("strDescFailSetRFID:", strDescFailSetRFID)
			} else if (msgReply.Operand == 'VIZ') {
				//document.getElementById("msg").innerHTML = strDescFailSetVIZ;
			}
		}
	}
}

function processNotify(msgNotify) {

	if (msgNotify.Command == 'Display') 
	{
		if(msgNotify.Param == strAcquireImageFailed){	
			// clrTextInfo()
			// clrImages(true);					
			// document.getElementById("errorMessageKey").style.display = 'inline';
			// document.getElementById("errorMessage").innerHTML = strAcquireImageFailed;				
		}
		if(msgNotify.Param == strRecogFailed){	
			// clrTextInfo()
			// clrImages(true);					
			// document.getElementById("errorMessageKey").style.display = 'inline';
			// document.getElementById("errorMessage").innerHTML = strRecogFailed;				
		}
		if (msgNotify.Param == strDeviceOffLine) {
			// clrDeviceStatus();
			// document.getElementById('deviceStatus').innerHTML = strWebDescDeviceNotFound; 
			// document.getElementById('deviceStatus').style.color = '#f00';
		} else if (msgNotify.Param == strDeviceReconnected) {
			// getDeviceStatus();
		}
		else if(msgNotify.Param == strInitIDCardFailed){
			// document.getElementById('deviceStatus').innerHTML = strInitIDCardFailedMessage;
			// document.getElementById('deviceStatus').style.color = '#f00';
		}
	} else if (msgNotify.Command == 'Reconnect') 
	{
		// clrDeviceStatus();
		// document.getElementById('deviceStatus').innerHTML = strWebDescRequireReconnect; 
		// document.getElementById('deviceStatus').style.color = '#f00';
		disConnect();
		connect();
	} else if (msgNotify.Command == 'AskSupport') 
	{
		// clrDeviceStatus();
		// document.getElementById('deviceStatus').innerHTML = strWebDescAskForSupport; 
		// document.getElementById('deviceStatus').style.color = '#f00';
	} else if (msgNotify.Command == 'RestartService') 
	{
		/* disConnect(); */
		disConnect();
		// document.getElementById('deviceStatus').innerHTML = strWebDescRequireRestartSvc; 
		// document.getElementById('deviceStatus').style.color = '#f00';
	} else if (msgNotify.Command == 'Save') 
	{
		if (msgNotify.Operand == 'CardContentText') {
			// clrImages(false);
			getContent(msgNotify.Param)

		} else if (msgNotify.Operand == 'Images') {
			// clrImages(false);
			displayImages(msgNotify.Param); 
			// ocrHeadIMG = msgNotify.Param.OcrHead;
			// if(ocrHeadIMG==undefined){
			// 	ocrHeadIMG = msgNotify.Param.SidHead;
			// }
			// drawHeadIMG(ocrHeadIMG)
			
		} else if (msgNotify.Operand == 'DocInfoAllInOne') {

			getContent(msgNotify.Param.Fields)
			// clrTextInfo()
			// clrImages(true);
			// displayCardContent(msgNotify.Param.Fields);
			displayImages(msgNotify.Param.Images);
		}

	} else if (msgNotify.Command == 'CardDetected'){
		// clrTextInfo()
		// clrImages(true);
	}
}

function displayImages(images) {
	tryDisplayImage(images, "White", "imageWhite");
	tryDisplayImage(images, "IR", "imageIR");
	tryDisplayImage(images, "UV", "imageUV");
	tryDisplayImage(images, "OcrHead", "imageOcrHead");
	tryDisplayImage(images, "ChipHead", "imageChipHead");
	tryDisplayImage(images, "SidHead", "imageChipHead");
}

function tryDisplayImage(images, imageName, domId) {
	if (images.hasOwnProperty(imageName)) {
		document.getElementById("defaultImg").style.display = "none";
		document.getElementById("previewImg").style.display = "block";
		document.getElementById("imageWhite").style.display = "block";
		document.getElementById("imageWhite").src = images["White"];
	}
}

function getContent(text){

	console.log("my text: ", text)

	var worker_name = document.getElementById("id_name");
	var worker_first_name = document.getElementById("id_first_name");
	var worker_last_name = document.getElementById("id_last_name");
	var worker_sex = document.getElementById("id_sex");
	var worker_dob = document.getElementById("id_dob");
	var worker_nationality= document.getElementById("id_nationality")


	worker_name.value = text["English name"];
	worker_first_name.value = text["The Family Name in English"];
	worker_last_name.value = text["The Given Name in English"];
	worker_sex.value = text["Sex"];
	worker_dob.value = text["Date of Birth"];
	worker_nationality.value = text["Country code(Nationality)"].slice(0, -1)


	var textExtracted = document.getElementById("textExtracted");
	
	var textExtractedDefault = document.getElementById("textExtractedDefault");

	textExtractedDefault.style.display = "none";

	var domTextArea = document.getElementById('textExtractedBlock');
	var domTextItem;
	var domKeySpan;
	var domSource = null;
	var domValInput;
				
	domTextArea.innerHTML = "";

	for (var key in text) {
		
		html = `<div class="w-full flex gap-2 text-xs">
                                <div class="px-2 py-1 rounded bg-gray-100 w-1/3 flex items-center">
                                    <span class="font-medium">${key}</span>
                                </div>
                                <div class="px-2 py-1 rounded bg-gray-100 w-2/3 flex items-center">
                                    <span class="font-medium">${text[key]}</span>
                                </div>
                            </div>`;
	
		domTextArea.innerHTML += html;
		
	}

	domTextArea.style.display = "block";



}

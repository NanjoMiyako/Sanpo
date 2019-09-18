var g_rndIdo = [];
var g_rndKeido = [];


var g_Ido_Riku = [];
var g_Keido_Riku = [];
var URLCount = 0;

var countMax = 30;
var g_Flg;



/*
var xhr = new XMLHttpRequest();

// ハンドラの登録.
xhr.onreadystatechange = function() {
    switch ( xhr.readyState ) {
        case 0:
            // 未初期化状態.
            console.log( 'uninitialized!' );
            break;
        case 1: // データ送信中.
            console.log( 'loading...' );
            break;
        case 2: // 応答待ち.
            console.log( 'loaded.' );
            break;
        case 3: // データ受信中.
            console.log( 'interactive... '+xhr.responseText.length+' bytes.' );
            break;
        case 4: // データ受信完了.
            if( xhr.status == 200 || xhr.status == 304 ) {
                var data = xhr.responseText; // responseXML もあり
                console.log( 'COMPLETE! :'+data );
                alert(data);
            } else {
                console.log( 'Failed. HttpStatus: '+xhr.statusText );
            }
            break;
    }
};
*/


function output(){
	GetRandomIdoKeido(20.0, 46.0, 123.0, 154.0, countMax);
	
	var spanElem = document.getElementById("forOutput");
	spanElem.innerHTML = "";
	
	var linkList = [];
	var linkElem;
	var brElem;
	for(var i=0; i<g_rndIdo.length; i++){
		linkElem = document.createElement("a");
		linkElem.href = "https://www.finds.jp/ws/rgeocode.php"
		linkElem.href += "?";
		linkElem.href += "lat=";
		linkElem.href += g_rndIdo[i];
		linkElem.href += "&lon=";
		linkElem.href += g_rndKeido[i];
		linkElem.innerHTML = linkElem.href;
		linkList.push(linkElem.href);
		linkElem.target = "_blank";
		
		brElem = document.createElement("br");
		
		spanElem.appendChild(linkElem);
		spanElem.appendChild(brElem);
	}
	
	/*
	xhr.open( 'GET', linkList[0], true );
	// POST 送信の場合は Content-Type は固定.
	//xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
	xhr.abort(); // 再利用する際にも abort() しないと再利用できないらしい.
	*/
	

	/*
	var oReq = new XMLHttpRequest();
	oReq.addEventListener("load", reqListener);
	oReq.open("GET", linkList[0], false);
	oReq.send();
	
	oReq.open("GET", linkList[1], false);
	oReq.send();
	*/
}

function reqListener() {
	console.log(this.responseText);

	var oParser = new DOMParser();
	var oDOM = oParser.parseFromString(this.responseText, "application/xml");
	
	var status = oDOM.getElementsByTagName("status").item(0);
	status = status.childNodes[0].textContent;

	if(status == "400"){//海(エラー)の場合

	}else{//陸地(住所が存在)の場合
		var lat2 = oDOM.getElementsByTagName("latitude").item(0).textContent;
		var lng2 = oDOM.getElementsByTagName("longitude").item(0).textContent;
		g_rndIdo.push(lat2);
		g_rndKeido.push(lng2);
		
		URLCount++;
	}
}




var geocoder;

function GetRandomIdoKeido(minLat, maxLat, minLng, maxLng, countMax){

	var loopCount = 0;
	var maxLoop = 1000;
	while(URLCount < countMax){
		var lat1 = Math.random() * (maxLat - minLat) + minLat;
		var lng1 = Math.random() * (maxLng - minLng) + minLng;
		var link1;
		
		link1 = "https://www.finds.jp/ws/rgeocode.php"
		link1 += "?";
		link1 += "lat=";
		link1 += lat1;
		link1 += "&lon=";
		link1 += lng1;
		
		
		var oReq = new XMLHttpRequest();
		oReq.addEventListener("load", reqListener);
		oReq.open("GET", link1, false);
		oReq.send();
		
		loopCount++;
		if(loopCount >= maxLoop){
			break;
		}
		

	}
}

output();
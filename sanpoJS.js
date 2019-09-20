const MODE_SANPO = 0;
const MODE_KASO_IDO = 1;

//GoogleAPIキー
var GoogleAPIKey = ''
var MapMode;
var g_MapOpts;
var g_Map;
var CurrentLat=null;
var CurrentLng=null;
var distOfSanpo= 10.0;
var g_KasoLat=null;
var g_KasoLng=null;
var PrevLat;
var PrevLng;
var IntervalId;
var g_CurrentCircle;
var g_KasoIdoCircle;
var g_GazoSearchCircle;
var g_LandScapeCircleList = [];

var g_IdoKohoMarker;
var g_IdoKohoLat;
var g_IdoKohoLng;

var g_LandScapeList=[];
var g_MySanpoData;

var g_LandScapeDataImportFlg = false;
var g_MySanpoDataImportFlg = false;

var IntervalSecond = 60000;
var GazoSearchRadius = 30.0;

//グーグルマップのMarkerオブジェクトのマップ
var MarkerMap = new Array();

var g_reader = new FileReader();
var g_File;
var fileElem = document.getElementById("importFile_file");
fileElem.onchange = function(event) {
    g_File = event.target.files[0];
};

function SetGoogleApiKey(){
	GoogleAPIKey = document.getElementById("GoogleApiKey1").value;
	Init();
}
function Init(){


	var srcURL = "https://maps.googleapis.com/maps/api/js?key=";
	srcURL += GoogleAPIKey;
	srcURL +="&callback=initMap";
	var s = document.createElement("script");
	s.src = srcURL;	

	var ele = document.getElementById("InitScriptTag");
	ele.appendChild(s);
	
	 
}

function initMap() {
	g_MapOpts = {
	zoom: 14,//ズームレベル
	center: new google.maps.LatLng(35.6807527,139.7600500)
	};
	g_Map = new google.maps.Map(document.getElementById("map"), g_MapOpts);
  
	CurrentLat=null;
	CurrentLng=null;
  
	MapMode =  MODE_SANPO;
	drawMode();
	
	//仮想移動候補のマークを初期位置にセット
	g_KasoLat = 34.7693884;
	g_KasoLng = 138.0123801;	
	//34.7693884,138.0123801,
	InitKasoKaouIdoKyoriCircle(g_KasoLat,g_KasoLng);
	InitGazoSearchCircle(g_KasoLat,g_KasoLng);
	
	InitCenterCircle(35.6807527,139.7600500);

	
	UpdateSanpoKyori();
	IntervalId = setInterval(function(){
	UpdateSanpoKyori()
	}, IntervalSecond);
	
	//仮想移動候補サークルをクリックしたときの処理
	g_KasoIdoCircle.addListener('click', function(e){
		if(MapMode == MODE_KASO_IDO){
			g_IdoKohoLat = e.latLng.lat();
			g_IdoKohoLng = e.latLng.lng();

			var retVal = IsInIdoKanoHankei(g_IdoKohoLat, g_IdoKohoLng);
			if(retVal == true){
				g_IdoKohoMarker.setPosition(new google.maps.LatLng(g_IdoKohoLat, g_IdoKohoLng));
				var a=1.0
				a++;
				
			}
			
		}
	});
	
	//画像検索範囲サークルをクリックしたときの処理
	g_GazoSearchCircle.addListener('click', function(e){
		if(MapMode == MODE_KASO_IDO){
			g_IdoKohoLat = e.latLng.lat();
			g_IdoKohoLng = e.latLng.lng();

			var retVal = IsInIdoKanoHankei(g_IdoKohoLat, g_IdoKohoLng);
			if(retVal == true){
				g_IdoKohoMarker.setPosition(new google.maps.LatLng(g_IdoKohoLat, g_IdoKohoLng));
				var a=1.0
				a++;
				
			}
			
		}
	});
	

	InitMySanpoData();
	DisplayGetGazoURLList();
	
	
}
function kasoIdo(){
	dist1 = distance(g_KasoLat, g_KasoLng, g_IdoKohoLat, g_IdoKohoLng);
	if(dist1 <= distOfSanpo){
		distOfSanpo -= dist1
		g_KasoLat = g_IdoKohoLat;
		g_KasoLng = g_IdoKohoLng;
		drawKasoKanouIdoKyori(g_KasoLat, g_KasoLng, distOfSanpo);
		drawGazoSearchCircle(g_KasoLat, g_KasoLng);
		
		spanElem = document.getElementById("kanoIdoKyoriSpan");
		spanElem.innerHTML = distOfSanpo;
		spanElem.innerHTML += "(m)";

		alert("移動しました");
		
	}
}
function modeChange(){
	if(MapMode == MODE_SANPO){
		MapMode = MODE_KASO_IDO;
		clearInterval(IntervalId);
		
	}else if(MapMode == MODE_KASO_IDO){
		MapMode = MODE_SANPO;
		IntervalId = setInterval(function(){
			UpdateSanpoKyori()
		}, IntervalSecond);
	}
	drawMode();
}

function UpdateSanpoKyori(){
	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(
			function ( position )
			{
				var data1 = position.coords ;
				var dist = 0.0;
				var spanElem;
				// データの整理
				if(CurrentLat != null){
					PrevLat = CurrentLat;
					PrevLng = CurrentLng;
					
					dist = distance(PrevLat, PrevLng, data1.latitude, data1.longitude);
					distOfSanpo += dist;
					

				}
				if(g_KasoLat == null){
					g_KasoLat = data1.latitude;
					g_KasoLng = data1.longitude;
				}

				spanElem = document.getElementById("kanoIdoKyoriSpan");
				spanElem.innerHTML = distOfSanpo;
				spanElem.innerHTML += "(m)";

				
				CurrentLat = data1.latitude;
				CurrentLng = data1.longitude;
				drawCenterCircle(CurrentLat, CurrentLng);
				drawKasoKanouIdoKyori(g_KasoLat, g_KasoLng, distOfSanpo)
				drawGazoSearchCircle(g_KasoLat, g_KasoLng);
				
				//alert(CurrentLat);
				//alert(CurrentLng);
				
				
				g_Map.setCenter(new google.maps.LatLng(CurrentLat, CurrentLng));
				
				
			},
			function ( error )
			{
				alert("現在位置をセットできませんでした");
			},
			//オプション
			{
				"enableHighAccuracy": false,
				"timeout": 8000,
				"maximumAge": 2000
			}
		);
		

	}else{
		alert("現在位置算出機能がありません");
	}
}

function IsInIdoKanoHankei(lat1, lng1){
	var dist1 = distance(lat1, lng1, g_KasoLat, g_KasoLng);
	
	if(dist1 <= distOfSanpo){
		return true;
	}
	
	return false;
}


/**
 * ２地点間の距離(m)を求める
 * ヒュベニの公式から求めるバージョン
 *
 * @param float $lat1 緯度１
 * @param float $lon1 経度１
 * @param float $lat2 緯度２
 * @param float $lon2 経度２
 * @param boolean $mode 測地系 true:世界(default) false:日本
 * @return float 距離(m)
 */
function distance($lat1, $lon1, $lat2, $lon2, $mode=true)
{

	if($lat1 == $lat2 && $lon1 == $lon2 || $lat1 == ""  || $lon1 == "" || $lat2 == "" || $lon2 == "" ){
		return 0.0;
	}

    // 緯度経度をラジアンに変換
    $radLat1 = deg2rad($lat1); // 緯度１
    $radLon1 = deg2rad($lon1); // 経度１
    $radLat2 = deg2rad($lat2); // 緯度２
    $radLon2 = deg2rad($lon2); // 経度２

    // 緯度差
    $radLatDiff = $radLat1 - $radLat2;

    // 経度差算
    $radLonDiff = $radLon1 - $radLon2;

    // 平均緯度
    $radLatAve = ($radLat1 + $radLat2) / 2.0;

    // 測地系による値の違い
    $a = $mode ? 6378137.0 : 6377397.155; // 赤道半径
    $b = $mode ? 6356752.314140356 : 6356078.963; // 極半径
    //$e2 = ($a*$a - $b*$b) / ($a*$a);
    $e2 = $mode ? 0.00669438002301188 : 0.00667436061028297; // 第一離心率^2
    //$a1e2 = $a * (1 - $e2);
    $a1e2 = $mode ? 6335439.32708317 : 6334832.10663254; // 赤道上の子午線曲率半径

    $sinLat = Math.sin($radLatAve);
    $W2 = 1.0 - $e2 * ($sinLat*$sinLat);
    $M = $a1e2 / (Math.sqrt($W2)*$W2); // 子午線曲率半径M
    $N = $a / Math.sqrt($W2); // 卯酉線曲率半径

    $t1 = $M * $radLatDiff;
    $t2 = $N * Math.cos($radLatAve) * $radLonDiff;
    $dist = Math.sqrt(($t1*$t1) + ($t2*$t2));

    return $dist;
}

function deg2rad(degrees) {
  return degrees * Math.PI / 180;
};

function rad2deg(radian){
        return radian * 360/(2*Math.PI);
}



function drawMode(){
	var spanElem = document.getElementById("modeSpan")
	spanElem.style.fontSize = "20px";
	if(MapMode == MODE_SANPO){
		spanElem.innerHTML = "散歩(移動可能距離補充)"
	}else if(MapMode == MODE_KASO_IDO){
		spanElem.innerHTML = "仮想移動";
	}
}

function InitGazoSearchCircle(centerLat, centerLng){
    var circleOptions = { 
        center: new google.maps.LatLng(centerLat, centerLng),  // 中心点(google.maps.LatLng)
        fillColor: '#dddddd',   // 塗りつぶし色
        fillOpacity: 0.5,       // 塗りつぶし透過度（0: 透明 ⇔ 1:不透明）
        radius: GazoSearchRadius,           // 半径（ｍ）
        strokeColor: '#ff0000', // 外周色
        strokeOpacity: 1,       // 外周透過度（0: 透明 ⇔ 1:不透明）
        strokeWeight: 1         // 外周太さ（ピクセル）
    };
    // 丸を設定
    g_GazoSearchCircle = new google.maps.Circle(circleOptions);
    g_GazoSearchCircle.setMap(g_Map);

}
function drawGazoSearchCircle(centerLat, centerLng){
	g_GazoSearchCircle.setCenter(new google.maps.LatLng(centerLat, centerLng));
}

function drawIdoKohoMarker(centerLat, centerLng){
	g_IdoKohoMarker.setPosition(centerLat, centerLng);
}

function InitKasoKaouIdoKyoriCircle(centerLat, centerLng){
    var circleOptions = { 
        center: new google.maps.LatLng(centerLat, centerLng),  // 中心点(google.maps.LatLng)
        fillColor: '#ff0000',   // 塗りつぶし色
        fillOpacity: 0.5,       // 塗りつぶし透過度（0: 透明 ⇔ 1:不透明）
        radius: 1.0,           // 半径（ｍ）
        strokeColor: '#ff0000', // 外周色
        strokeOpacity: 1,       // 外周透過度（0: 透明 ⇔ 1:不透明）
        strokeWeight: 1         // 外周太さ（ピクセル）
    };
    // 丸を設定
    g_KasoIdoCircle = new google.maps.Circle(circleOptions);
    g_KasoIdoCircle.setMap(g_Map);
    
	g_IdoKohoMarker = new google.maps.Marker({ // マーカーの追加
		icon: {
			fillColor: "#00dd00",                //塗り潰し色
			fillOpacity: 0.8,                    //塗り潰し透過率
			path: google.maps.SymbolPath.CIRCLE, //円を指定
			scale: 8,                           //円のサイズ
			strokeColor: "#00FF00",              //枠の色
			strokeWeight: 1.0                    //枠の透過率
		},
		position: new google.maps.LatLng(centerLat, centerLng), // マーカーを立てる位置を指定
		visible: true
	   });
	   
	g_IdoKohoMarker.setMap(g_Map);
}
function drawKasoKanouIdoKyori(centerLat, centerLng, idoKanoKyori){
	if(idoKanoKyori <= 1.0){
		idoKanoKyori = 1.0;
	}
    // 丸を設定
    g_KasoIdoCircle.setCenter(new google.maps.LatLng(centerLat, centerLng));
    g_KasoIdoCircle.setRadius(idoKanoKyori);
}

function InitCenterCircle(centerLat, centerLng){
    var circleOptions = { 
        center: new google.maps.LatLng(centerLat, centerLng),  // 中心点(google.maps.LatLng)
        fillColor: '#0000ff',   // 塗りつぶし色
        fillOpacity: 0.5,       // 塗りつぶし透過度（0: 透明 ⇔ 1:不透明）
        radius: 5.0,           // 半径（ｍ）
        strokeColor: '#0000ff', // 外周色
        strokeOpacity: 1,       // 外周透過度（0: 透明 ⇔ 1:不透明）
        strokeWeight: 1         // 外周太さ（ピクセル）
    };
 
    // 丸を設定
    g_CurrentCircle = new google.maps.Circle(circleOptions);
    g_CurrentCircle.setMap(g_Map)
}
function drawCenterCircle(centerLat, centerLng){
	g_CurrentCircle.setCenter(new google.maps.LatLng(centerLat, centerLng));
	
}
function drawStar(LeftTopLat, LeftTopLng, width1, height1){

	//ポリゴンオブジェクト
	var bermudaTriangle;
	var dx = width1 / 2.0;
	var dy = height1 / 2.0;
	//ポリゴンを描画する図形の各頂点の緯度・経度を配列で指定
	var triangleCoords = [
	    new google.maps.LatLng(LeftTopLat, LeftTopLng+dx),
		new google.maps.LatLng(LeftTopLat+dy, LeftTopLng+width1),
		new google.maps.LatLng(LeftTopLat+height1, LeftTopLng+dx),
		new google.maps.LatLng(LeftTopLat+dy, LeftTopLng)
	];
	//ポリゴン生成
	bermudaTriangle = new google.maps.Polygon({
	    //ポリゴンのオプション設定
	    paths: triangleCoords, //パス配列
	    strokeColor: '#FF0000', //ストロークの色
	    strokeOpacity: 0.8, //ストロークの透明度
	    strokeWeight: 2, //ストロークの幅
	    fillColor: '#FF0000', //フィルの色
	    fillOpacity: 1.0 //フィルの透明度
	});
	//ポリゴンを地図に追加
	bermudaTriangle.setMap(g_Map);

	var color = ["#FFD700","#FFA500","#FFD700","#FFA500","#FFD700","#FFA500"];
	var count = 0;
	setInterval(function(){
	bermudaTriangle.setOptions({
	fillColor: color[count]
	});
	count = (count + 1) % color.length;
	}, 500);

	marker = new google.maps.Marker({ // マーカーの追加
	      position: new google.maps.LatLng(LeftTopLat, LeftTopLng), // マーカーを立てる位置を指定
	      visible: true
	   });
	   
	marker.setMap(g_Map);
	   
   
}

function reqListener() {
	console.log(this.responseText);

	var oParser = new DOMParser();
	var oDOM = oParser.parseFromString(this.responseText, "application/xml");
}


function ImportLandScapeData(){
      var fileRef = document.getElementById('importFile_file');
	  var content;
	  var landScape1;
	  
      if (1 <= fileRef.files.length) {
			var reader = new FileReader();
			//ファイル読み出し完了後の処理を記述
			reader.onload = function (theFile) {
				var content = theFile.target.result;
				g_LandScapeList = JSON.parse(content);
			
				for(var i=0; i<g_LandScapeList.length; i++){
					landScape1 = g_LandScapeList[i];
					g_LandScapeMarker = new google.maps.Marker({ // マーカーの追加
						icon: {
							fillColor: "#90877C",                //塗り潰し色
							fillOpacity: 0.8,                    //塗り潰し透過率
							path: google.maps.SymbolPath.CIRCLE, //円を指定
							scale: 8,                           //円のサイズ
							strokeColor: "#90877C",              //枠の色
							strokeWeight: 1.0                    //枠の透過率
						},
						position: new google.maps.LatLng(landScape1.latitude, landScape1.longitude), // マーカーを立てる位置を指定
						visible: true
					   });
					
						//画像検索範囲サークルをクリックしたときの処理
						g_LandScapeMarker.addListener('click', function(e){
							landScape2 = GetCorrenspondLandScape(this.position.lat(), this.position.lng());
							var latlng2 = new google.maps.LatLng(this.position.lat(), this.position.lng());
							
							dist1 = distance(this.position.lat(), this.position.lng(), g_KasoLat, g_KasoLng);
							
							
							
							spanElem = document.getElementById("SyuhenGazoSpan");
							imgElem = document.getElementById("SyuhenGazoImg");
							
							/*
							var url1 = landScape2.URL;
							var img = new Image();
							img.crossOrigin = 'anonymous';
							img.src = url1;
							img.onload = function(){
								var a=1;
								a++;
							}
							*/
							
							if(dist1 <= GazoSearchRadius){
								var infoWindowStr = "";
								
								infoWindowStr += "画像を発見!<br>";
								infoWindowStr += "<a href='";
								infoWindowStr += landScape2.URL;
								infoWindowStr += "' target=";
								infoWindowStr += "'_blank'>";
								infoWindowStr += landScape2.title;
								infoWindowStr += "</a>";
								infoWindowStr += "<br>";
								/*
								infoWindowStr += "<img = src='";
								infoWindowStr += landScape2.URL;
								infoWindowStr += "' /><br>"
								*/
								
								var iwopts = {
									content:infoWindowStr,
									position: latlng2
								}
								
								var infowindow = new google.maps.InfoWindow(iwopts);
								infowindow.open(g_Map);
								
								
								/*
								var oReq = new XMLHttpRequest();
								oReq.addEventListener("load", reqListener);
								oReq.open("GET", landScape2.URL, false);
								oReq.send();
								*/
							
								spanElem.innerHTML = "画像を発見!";
								imgElem.src = landScape2.URL;

								
								if(!g_MySanpoData.urlList.includes(landScape2.URL)){
									g_MySanpoData.urlList.push(landScape2.URL);
									DisplayGetGazoURLList();
								}
								
								
							}else{
								spanElem.innerHTML = "";
								imgElem.src = "";
							}
						});
					
					
					   
					g_LandScapeMarker.setMap(g_Map);
					g_LandScapeCircleList.push(g_LandScapeMarker);
				}
				    
				g_LandScapeDataImportFlg = true;
				DisplayDataImportTab();
			}

		//ファイル読み出し
        reader.readAsText(fileRef.files[0], "utf-8");

      }

}

function GetCorrenspondLandScape(latitude1, longitude1){
	var dist1 = distance(latitude1, longitude1, g_LandScapeList[0].latitude, g_LandScapeList[0].longitude);
	var targetLandScape = g_LandScapeList[0];
	var dist2;
	
	for(var i=0; i<g_LandScapeList.length; i++){
		landScape1 = g_LandScapeList[i];
		dist2 = distance(latitude1, longitude1, landScape1.latitude, landScape1.longitude);
		if(dist1 > dist2){
			targetLandScape = landScape1;
			dist1 = dist2;
		} 
	}
	return targetLandScape;
}

function DisplayDataImportTab(){

	var spanElem1 = document.getElementById("LandScapeDataImportFlgSpan");
	var spanElem2 = document.getElementById("MySanpoDataImportFlgSpan");
	
	if(g_LandScapeDataImportFlg == true){
		spanElem1.innerHTML = "インポート済み";
	}else{
		spanElem1.innerHTML = "インポート未完了";
	}


	if(g_MySanpoDataImportFlg == true){
		spanElem2.innerHTML = "インポート済み";
	}else{
		spanElem2.innerHTML = "インポート未完了";
	}
}

function ImportMySanpoData(){
      var fileRef = document.getElementById('importFile_file');
	  var content;
	  
	if (1 <= fileRef.files.length) {
		var reader = new FileReader();
		//ファイル読み出し完了後の処理を記述
		reader.onload = function (theFile) {
			var content = theFile.target.result;
			g_MySanpoData = JSON.parse(content);
			
			g_IdoKohoLat = g_MySanpoData.idoKohoLat;
			g_IdoKohoLng = g_MySanpoData.idoKohoLng;
			g_KasoLat = g_MySanpoData.kasoLat;
			g_KasoLng = g_MySanpoData.kasoLng;
			distOfSanpo = g_MySanpoData.distOfSanpo;
			
			
			drawKasoKanouIdoKyori(g_MySanpoData.kasoLat, g_MySanpoData.kasoLng, distOfSanpo);
			drawIdoKohoMarker(g_MySanpoData.idoKohoLat, g_MySanpoData.idoKohoLng);
			DisplayGetGazoURLList();
			
			g_MySanpoDataImportFlg = true;
			DisplayDataImportTab();
		}
			
		//ファイル読み出し
        reader.readAsText(fileRef.files[0], "utf-8");
	}
}


function ExportMySanpoData(){
	g_MySanpoData.distOfSanpo = distOfSanpo;
	g_MySanpoData.idoKohoLat = g_IdoKohoLat;
	g_MySanpoData.idoKohoLng = g_IdoKohoLng;
	g_MySanpoData.kasoLat = g_KasoLat;
	g_MySanpoData.kasoLng = g_KasoLng;

	//ファイルを作ってダウンロードします。
	var resultJson = JSON.stringify(g_MySanpoData);
	var downLoadLink = document.createElement("a");
	downLoadLink.download = "MySanpoData.json";
	downLoadLink.href = URL.createObjectURL(new Blob([resultJson], {type: "text.plain;charset=utf-8;"}));
	downLoadLink.dataset.downloadurl = ["text/plain", downLoadLink.download, downLoadLink.href].join(":");
	downLoadLink.click();
}

function InitMySanpoData(){

	g_MySanpoData = new MySanpoData([], distOfSanpo, g_IdoKohoLat, g_IdoKohoLng, g_KasoLat,  g_KasoLng)

}



function DisplayGetGazoURLList(){
	var spanElem = document.getElementById("SyutokuZumiImgSpan");
	
	//取得済み画像のspanをクリア
	while(spanElem.firstChild != null){ spanElem.removeChild(spanElem.firstChild); }
	
	var spanElem2 = document.createElement("span");
	spanElem2.innerHTML = "取得件数:"
	spanElem2.innerHTML += g_MySanpoData.urlList.length;
	spanElem2.innerHTML += "　/　"
	spanElem2.innerHTML += g_LandScapeList.length;
	
	var brElem = document.createElement("br");
	
	spanElem.appendChild(spanElem2);
	spanElem.appendChild(brElem);	
	
	for(var i=0; i<g_MySanpoData.urlList.length; i++){
		var title = GetGazoTitleFromURL(g_MySanpoData.urlList[i]);
		
		var linkElem = document.createElement("a");
		linkElem.href = g_MySanpoData.urlList[i];
		linkElem.innerHTML = title;
		linkElem.target = "_blank";
		
		brElem = document.createElement("br");
		
		spanElem.appendChild(linkElem);
		spanElem.appendChild(brElem);
		
	}
	
	
}
function GetGazoTitleFromURL(url1){
	
	for(var i=0; i<g_LandScapeList.length; i++){
		if(url1 == g_LandScapeList[i].URL){
			return g_LandScapeList[i].title;
		}
	}
	
	return "";
}


//マイ散歩データのコンストラクタ
function MySanpoData(urlList, distOfSanpo, idoKohoLat, idoKohoLng, kasoLat,  kasoLng){
	this.urlList = urlList;
	this.distOfSanpo = distOfSanpo;
	this.idoKohoLat = idoKohoLat;
	this.idoKohoLng = idoKohoLng;
	this.kasoLat = kasoLat;
	this.kasoLng = kasoLng;
}

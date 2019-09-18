const MODE_SANPO = 0;
const MODE_KASO_IDO = 1;

//GoogleAPIキー
var GoogleAPIKey = ''
var MapMode;
var g_MapOpts;
var g_Map;
var CurrentLat=null;
var CurrentLng=null;
var distOfSanpo=50.0;
var g_KasoLat=null;
var g_KasoLng=null;
var PrevLat;
var PrevLng;
var IntervalId;
var g_CurrentCircle;
var g_KasoIdoCircle;
var g_GazoSearchCircle;
var g_IdoKohoMarker;
var g_IdoKohoLat;
var g_IdoKohoLng;

var IntervalSecond = 20000;
var GazoSearchRadius = 30.0;

//グーグルマップのMarkerオブジェクトのマップ
var MarkerMap = new Array();

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
	
	g_KasoLat = 34.683;
	g_KasoLng = 138.044;
	InitKasoKaouIdoKyoriCircle(g_KasoLat,g_KasoLng);
	InitGazoSearchCircle(g_KasoLat,g_KasoLng);
	
	InitCenterCircle(35.6807527,139.7600500);

	
	UpdateSanpoKyori();
	IntervalId = setInterval(function(){
	UpdateSanpoKyori()
	}, IntervalSecond);
	
	//マップをクリックしたときの処理
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
				
				alert(CurrentLat);
				alert(CurrentLng);
				
				
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
// (function(){

	function getInfosSuc(data){
		var map = new BMap.Map("container");          // 创建地图实例  
		map.centerAndZoom("上海", 12);
		var params = data.params;
		var szPois = [];
		var html = '';	
		var unquie=[];	
		for(var url in params){
			var localSearch = new BMap.LocalSearch(map);
			localSearch.setSearchCompleteCallback((function(url, infos){
				var hasShowUrls = [];
				return function (searchResult) {
					for(var j=0;j<hasShowUrls.length;j++){
						if (url === hasShowUrls[j]) {
							return;
						};
					}
					hasShowUrls.push(url);
					var poi = searchResult.getPoi(0);/*地理位置信息*/
					if (!poi) return;
					var isHasPoi = false;
					for(var i=0;i<szPois.length;i++){
						if (szPois[i].point.lng === poi.point.lng && szPois[i].point.lat === poi.point.lat) {
							isHasPoi = true;
							break;
						};
					}

					// console.info(szPois);
					if (isHasPoi) {/*同一个小区有多套房子*/
						var point = new BMap.Point(poi.point.lng,poi.point.lat);
						szPois[i].urls.push(url);
						szPois[i].imgs.push(infos.img);
						szPois[i].prices.push(infos.price);
						szPois[i].marker.addEventListener("click", (function(p){
							return function(){   
								/*点击房屋图标后弹出的信息框*/
								var opts = {
								  	width : 200,    
								  	height: 200 * p.urls.length,     
								  	title : poi.title , 
								  	enableMessage:true,
								}
								var message = "";
								p.urls.forEach(function(item,index){
									message += "<div>"+poi.address+"<br><a href="+item+" target='_blank'><img title='点击访问' class='img-responsive showImg' alt='Responsive image' src="+p.imgs[index]+"></img></a></div>"
								})
								var infoWindow = new BMap.InfoWindow(message, opts);       
								map.openInfoWindow(infoWindow,point); //开启信息窗口
							}
						})(szPois[i]));
					}
					else{
						var point = new BMap.Point(poi.point.lng,poi.point.lat);

						var myIcon = new BMap.Icon("../image/house.png", new BMap.Size(30, 30), {});      
						// 创建标注对象并添加到地图   
						var marker = new BMap.Marker(point, {icon: myIcon});    
						map.addOverlay(marker);

						marker.addEventListener("click", function(){    
							/*点击房屋图标后弹出的信息框*/
							var opts = {
							  	width : 200,    
							  	height: 200,     
							  	title : poi.title , 
							  	enableMessage:true,
							}
							var infoWindow = new BMap.InfoWindow(poi.address+"<br><a href="+url+" target='_blank'><img title='点击访问' class='img-responsive showImg' alt='Responsive image' src="+infos.img+"></img></a>", opts);       
							map.openInfoWindow(infoWindow,point); //开启信息窗口
						});

						poi.marker = marker;
						poi.urls = [url];
						poi.imgs = [infos.img]
						poi.prices = [infos.price]
						szPois.push(poi);
				}  
				// console.info(szPois);
				for(var i=0;i<szPois.length;i++){
					if($.inArray(szPois[i].title,unquie)==-1){
						html += '<li class="direction_map" onclick="showArea(this);" surl="'+szPois[i].urls[0]+'" address="'+szPois[i].address+'" lng="'+szPois[i].point.lng+'" lat="'+szPois[i].point.lat+'" stitle="'+szPois[i].title+'" simg="'+szPois[i].imgs[0]+'"><small>'+szPois[i].title+'</small><span class="distance">'+szPois[i].prices[0]+'元</span><div class="number"><span></span><img style="width:100px;height:100px;" src="'+szPois[i].imgs[0]+'"></div></li>';
						// console.info(html);
						// if (szPois[i].point.lng === poi.point.lng && szPois[i].point.lat === poi.point.lat) {
						// 	isHasPoi = true;
						// 	break;
						// };
						unquie.push(szPois[i].title);
					}

				}

				$('#location-results').html(html);
			　　}

			})(url, params[url]));
			localSearch.search(params[url].location);
		}

	}

	function getInfosErr(e){
		alert('获取数据失败');
	}

	var map = new BMap.Map("container");          // 创建地图实例  
	map.centerAndZoom("上海", 12);
	map.enableScrollWheelZoom();   //启用滚轮放大缩小，默认禁用
	map.enableContinuousZoom();    //启用地图惯性拖拽，默认禁用

	var geolocation = new BMap.Geolocation();
	geolocation.getCurrentPosition(function(r){
		if(this.getStatus() == BMAP_STATUS_SUCCESS){
			var mk = new BMap.Marker(r.point);
			map.addOverlay(mk);
			map.panTo(r.point);
			mk.setAnimation(BMAP_ANIMATION_BOUNCE); /*动画跳动*/
		}
		else {
			alert('failed'+this.getStatus());
		}        
	},{enableHighAccuracy: true})
	
	function initAjaxData(){
		$.ajax({
			'type': 'post',
			'url': '/rental/getInfos',
			'contentType': 'application/json;charset=utf-8',
			'data': JSON.stringify({params: null}),
			success: getInfosSuc ,
			async: true,
			error: getInfosErr ,
		});
	}

	initAjaxData();

	// setInterval(initAjaxData,(1000*60*3));
// })();
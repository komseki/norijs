
/**
 * 3D 리소스 리스트
 * {"name":"이름", "type":"타입", "path":"url", "floor":사용안함, "link":"사용안함"}
 * name : 구분 이름
 * 블럭의경우 블럭종류_색상_모델타입_LED_낮/밤 의 이름형식을 갖는다.
 * mould_red // 조형블럭 빨간색 1층 모델링
 * mould_red_day // 조형블럭 빨간색 1층 낮 텍스처
 * mould_red_roof // 조형블럭 빨간색 2층 모델링
 * mould_red_roof_day // 조형블럭 빨간색 2층 낮 텍스쳐
 * mould_red_roof_LED_day // 조형블럭 빨간색 2층 LED상태 낮 텍스쳐
 * 3d_blue_door_day // 3D 블럭 파란색 1층-문형태 낮 텍스쳐
 * 3d_green_wall_LED_day // 3D 블럭 녹색 2층-벽형태 LED상태 낮 텍스쳐
 * 
 */
define( function(){
	//
	return {
		"assets":{
			// assets 경로
			"context" : "assets/story/01/",
			"datas" : [
				{"name":"board", "type":"obj", "path":"board.obj", "floor":0, "link":""},
				{"name":"bg_board_day", "type":"image/png", "path":"board_day.png", "floor":0, "link":"board"},
				{"name":"bg_01_day", "type":"image/png", "path":"bg_01_day.png", "floor":0, "link":"bg_01"},
				{"name":"bg_02_day", "type":"image/png", "path":"bg_02_day.png", "floor":0, "link":"bg_02"},
				{"name":"mountain_day", "type":"image/png", "path":"mountain_day.png", "floor":0, "link":"mountain"},
				{"name":"tree_day", "type":"image/png", "path":"tree_day.png", "floor":0, "link":"tree"},
				
				{"name":"bg_board_night", "type":"image/png", "path":"board_night.png", "floor":0, "link":"board"},
				{"name":"bg_01_night", "type":"image/png", "path":"bg_01_night.png", "floor":0, "link":"bg_01"},
				{"name":"bg_02_night", "type":"image/png", "path":"bg_02_night.png", "floor":0, "link":"bg_02"},
				{"name":"mountain_night", "type":"image/png", "path":"mountain_night.png", "floor":0, "link":"mountain"},
				{"name":"tree_night", "type":"image/png", "path":"tree_night.png", "floor":0, "link":"tree"},
				
				{"name":"sun", "type":"obj", "path":"sun.obj", "floor":0, "link":""},
				{"name":"moon", "type":"obj", "path":"moon.obj", "floor":0, "link":""},
				{"name":"sun_moon", "type":"image/png", "path":"sun_moon.png", "floor":0, "link":"sun|moon"},
				
				{"name":"background_day", "type":"image/jpeg", "path":"bg_day.jpg", "floor":0, "link":"bg_day"},
				{"name":"background_night", "type":"image/jpeg", "path":"bg_night.jpg", "floor":0, "link":"bg_night"},
				
				/* 사용하지 않는 리소스
				{"name":"cloud", "type":"obj", "path":"cloud.obj", "floor":0, "link":""},
				{"name":"cloud_day", "type":"image/png", "path":"cloud_day.png", "floor":0, "link":"cloud"},
				{"name":"cloud_night", "type":"image/png", "path":"cloud_night.png", "floor":0, "link":"cloud"},
				//*/
				
				/*
				//*/
				{"name":"mould_red", "type":"obj", "path":"mould_red.obj", "floor":1, "link":""},
				{"name":"mould_red_day", "type":"image/png", "path":"mould_red_day.png", "floor":1, "link":"mould_red"},
				{"name":"mould_red_night", "type":"image/png", "path":"mould_red_night.png", "floor":1, "link":"mould_red"},
				{"name":"mould_red_roof", "type":"obj", "path":"mould_red_roof.obj", "floor":2, "link":"mould_red_roof"},
				{"name":"mould_red_roof_day", "type":"image/png", "path":"mould_red_roof_day.png", "floor":2, "link":"mould_red_roof"},
				{"name":"mould_red_roof_night", "type":"image/png", "path":"mould_red_roof_night.png", "floor":2, "link":"mould_red_roof"},
				{"name":"mould_red_roof_LED_day", "type":"image/png", "path":"mould_red_roof_LED_day.png", "floor":2, "link":"mould_red_roof"},
				{"name":"mould_red_roof_LED_night", "type":"image/png", "path":"mould_red_roof_LED_night.png", "floor":2, "link":"mould_red_roof"},
				
				{"name":"mould_blue", "type":"obj", "path":"mould_blue.obj", "floor":1, "link":""},
				{"name":"mould_blue_day", "type":"image/png", "path":"mould_blue_day.png", "floor":1, "link":"mould_blue"},
				{"name":"mould_blue_night", "type":"image/png", "path":"mould_blue_night.png", "floor":1, "link":"mould_blue"},
				{"name":"mould_blue_roof", "type":"obj", "path":"mould_blue_roof.obj", "floor":2, "link":"mould_blue_roof"},
				{"name":"mould_blue_roof_day", "type":"image/png", "path":"mould_blue_roof_day.png", "floor":2, "link":"mould_blue_roof"},
				{"name":"mould_blue_roof_night", "type":"image/png", "path":"mould_blue_roof_night.png", "floor":2, "link":"mould_blue_roof"},
				{"name":"mould_blue_roof_LED_day", "type":"image/png", "path":"mould_blue_roof_LED_day.png", "floor":2, "link":"mould_blue_roof"},
				{"name":"mould_blue_roof_LED_night", "type":"image/png", "path":"mould_blue_roof_LED_night.png", "floor":2, "link":"mould_blue_roof"},
				
				{"name":"mould_green", "type":"obj", "path":"mould_green.obj", "floor":1, "link":""},
				{"name":"mould_green_day", "type":"image/png", "path":"mould_green_day.png", "floor":1, "link":"mould_green"},
				{"name":"mould_green_night", "type":"image/png", "path":"mould_green_night.png", "floor":1, "link":"mould_green"},
				{"name":"mould_green_roof", "type":"obj", "path":"mould_green_roof.obj", "floor":2, "link":"mould_green_roof"},
				{"name":"mould_green_roof_day", "type":"image/png", "path":"mould_green_roof_day.png", "floor":2, "link":"mould_green_roof"},
				{"name":"mould_green_roof_night", "type":"image/png", "path":"mould_green_roof_night.png", "floor":2, "link":"mould_green_roof"},
				{"name":"mould_green_roof_LED_day", "type":"image/png", "path":"mould_green_roof_LED_day.png", "floor":2, "link":"mould_green_roof"},
				{"name":"mould_green_roof_LED_night", "type":"image/png", "path":"mould_green_roof_LED_night.png", "floor":2, "link":"mould_green_roof"},
				
				{"name":"mould_navy", "type":"obj", "path":"mould_navy.obj", "floor":1, "link":""},
				{"name":"mould_navy_day", "type":"image/png", "path":"mould_navy_day.png", "floor":1, "link":"mould_navy"},
				{"name":"mould_navy_night", "type":"image/png", "path":"mould_navy_night.png", "floor":1, "link":"mould_navy"},
				{"name":"mould_navy_roof", "type":"obj", "path":"mould_navy_roof.obj", "floor":2, "link":"mould_navy_roof"},
				{"name":"mould_navy_roof_day", "type":"image/png", "path":"mould_navy_roof_day.png", "floor":2, "link":"mould_navy_roof"},
				{"name":"mould_navy_roof_night", "type":"image/png", "path":"mould_navy_roof_night.png", "floor":2, "link":"mould_navy_roof"},
				{"name":"mould_navy_roof_LED_day", "type":"image/png", "path":"mould_navy_roof_LED_day.png", "floor":2, "link":"mould_navy_roof"},
				{"name":"mould_navy_roof_LED_night", "type":"image/png", "path":"mould_navy_roof_LED_night.png", "floor":2, "link":"mould_navy_roof"},
				
				{"name":"mould_orange", "type":"obj", "path":"mould_orange.obj", "floor":1, "link":""},
				{"name":"mould_orange_day", "type":"image/png", "path":"mould_orange_day.png", "floor":1, "link":"mould_orange"},
				{"name":"mould_orange_night", "type":"image/png", "path":"mould_orange_night.png", "floor":1, "link":"mould_orange"},
				{"name":"mould_orange_roof", "type":"obj", "path":"mould_orange_roof.obj", "floor":2, "link":"mould_orange_roof"},
				{"name":"mould_orange_roof_day", "type":"image/png", "path":"mould_orange_roof_day.png", "floor":2, "link":"mould_orange_roof"},
				{"name":"mould_orange_roof_night", "type":"image/png", "path":"mould_orange_roof_night.png", "floor":2, "link":"mould_orange_roof"},
				{"name":"mould_orange_roof_LED_day", "type":"image/png", "path":"mould_orange_roof_LED_day.png", "floor":2, "link":"mould_orange_roof"},
				{"name":"mould_orange_roof_LED_night", "type":"image/png", "path":"mould_orange_roof_LED_night.png", "floor":2, "link":"mould_orange_roof"},
				
				{"name":"mould_purple", "type":"obj", "path":"mould_purple.obj", "floor":1, "link":""},
				{"name":"mould_purple_day", "type":"image/png", "path":"mould_purple_day.png", "floor":1, "link":"mould_purple"},
				{"name":"mould_purple_night", "type":"image/png", "path":"mould_purple_night.png", "floor":1, "link":"mould_purple"},
				{"name":"mould_purple_roof", "type":"obj", "path":"mould_purple_roof.obj", "floor":2, "link":"mould_purple_roof"},
				{"name":"mould_purple_roof_day", "type":"image/png", "path":"mould_purple_roof_day.png", "floor":2, "link":"mould_purple_roof"},
				{"name":"mould_purple_roof_night", "type":"image/png", "path":"mould_purple_roof_night.png", "floor":2, "link":"mould_purple_roof"},
				{"name":"mould_purple_roof_LED_day", "type":"image/png", "path":"mould_purple_roof_LED_day.png", "floor":2, "link":"mould_purple_roof"},
				{"name":"mould_purple_roof_LED_night", "type":"image/png", "path":"mould_purple_roof_LED_night.png", "floor":2, "link":"mould_purple_roof"},
				
				{"name":"mould_yellow", "type":"obj", "path":"mould_yellow.obj", "floor":1, "link":""},
				{"name":"mould_yellow_day", "type":"image/png", "path":"mould_yellow_day.png", "floor":1, "link":"mould_yellow"},
				{"name":"mould_yellow_night", "type":"image/png", "path":"mould_yellow_night.png", "floor":1, "link":"mould_yellow"},
				{"name":"mould_yellow_roof", "type":"obj", "path":"mould_yellow_roof.obj", "floor":2, "link":"mould_yellow_roof"},
				{"name":"mould_yellow_roof_day", "type":"image/png", "path":"mould_yellow_roof_day.png", "floor":2, "link":"mould_yellow_roof"},
				{"name":"mould_yellow_roof_night", "type":"image/png", "path":"mould_yellow_roof_night.png", "floor":2, "link":"mould_yellow_roof"},
				{"name":"mould_yellow_roof_LED_day", "type":"image/png", "path":"mould_yellow_roof_LED_day.png", "floor":2, "link":"mould_yellow_roof"},
				{"name":"mould_yellow_roof_LED_night", "type":"image/png", "path":"mould_yellow_roof_LED_night.png", "floor":2, "link":"mould_yellow_roof"},
				
				
				
				{"name":"3d_red_door", "type":"obj", "path":"3d_red_door.obj", "floor":1, "link":""},
				{"name":"3d_red_door_day", "type":"image/png", "path":"3d_red_door_day.png", "floor":1, "link":"3d_red_door"},
				{"name":"3d_red_door_night", "type":"image/png", "path":"3d_red_door_night.png", "floor":1, "link":"3d_red_door"},
				{"name":"3d_red_door_LED_day", "type":"image/png", "path":"3d_red_door_LED_day.png", "floor":1, "link":"3d_red_door"},
				{"name":"3d_red_door_LED_night", "type":"image/png", "path":"3d_red_door_LED_night.png", "floor":1, "link":"3d_red_door"},
				{"name":"3d_red_wall", "type":"obj", "path":"3d_red_wall.obj", "floor":1, "link":""},
				{"name":"3d_red_wall_day", "type":"image/png", "path":"3d_red_wall_day.png", "floor":2, "link":"3d_red_door"},
				{"name":"3d_red_wall_night", "type":"image/png", "path":"3d_red_wall_night.png", "floor":2, "link":"3d_red_door"},
				{"name":"3d_red_wall_LED_day", "type":"image/png", "path":"3d_red_wall_LED_day.png", "floor":2, "link":"3d_red_door"},
				{"name":"3d_red_wall_LED_night", "type":"image/png", "path":"3d_red_wall_LED_night.png", "floor":2, "link":"3d_red_door"},
				
				{"name":"3d_blue_door", "type":"obj", "path":"3d_blue_door.obj", "floor":1, "link":""},
				{"name":"3d_blue_door_day", "type":"image/png", "path":"3d_blue_door_day.png", "floor":1, "link":"3d_blue_door"},
				{"name":"3d_blue_door_night", "type":"image/png", "path":"3d_blue_door_night.png", "floor":1, "link":"3d_blue_door"},
				{"name":"3d_blue_door_LED_day", "type":"image/png", "path":"3d_blue_door_LED_day.png", "floor":1, "link":"3d_blue_door"},
				{"name":"3d_blue_door_LED_night", "type":"image/png", "path":"3d_blue_door_LED_night.png", "floor":1, "link":"3d_blue_door"},
				{"name":"3d_blue_wall", "type":"obj", "path":"3d_blue_wall.obj", "floor":1, "link":""},
				{"name":"3d_blue_wall_day", "type":"image/png", "path":"3d_blue_wall_day.png", "floor":2, "link":"3d_blue_door"},
				{"name":"3d_blue_wall_night", "type":"image/png", "path":"3d_blue_wall_night.png", "floor":2, "link":"3d_blue_door"},
				{"name":"3d_blue_wall_LED_day", "type":"image/png", "path":"3d_blue_wall_LED_day.png", "floor":2, "link":"3d_blue_door"},
				{"name":"3d_blue_wall_LED_night", "type":"image/png", "path":"3d_blue_wall_LED_night.png", "floor":2, "link":"3d_blue_door"},
				
				{"name":"3d_green_door", "type":"obj", "path":"3d_green_door.obj", "floor":1, "link":""},
				{"name":"3d_green_door_day", "type":"image/png", "path":"3d_green_door_day.png", "floor":1, "link":"3d_green_door"},
				{"name":"3d_green_door_night", "type":"image/png", "path":"3d_green_door_night.png", "floor":1, "link":"3d_green_door"},
				{"name":"3d_green_door_LED_day", "type":"image/png", "path":"3d_green_door_LED_day.png", "floor":1, "link":"3d_green_door"},
				{"name":"3d_green_door_LED_night", "type":"image/png", "path":"3d_green_door_LED_night.png", "floor":1, "link":"3d_green_door"},
				{"name":"3d_green_wall", "type":"obj", "path":"3d_green_wall.obj", "floor":1, "link":""},
				{"name":"3d_green_wall_day", "type":"image/png", "path":"3d_green_wall_day.png", "floor":2, "link":"3d_green_door"},
				{"name":"3d_green_wall_night", "type":"image/png", "path":"3d_green_wall_night.png", "floor":2, "link":"3d_green_door"},
				{"name":"3d_green_wall_LED_day", "type":"image/png", "path":"3d_green_wall_LED_day.png", "floor":2, "link":"3d_green_door"},
				{"name":"3d_green_wall_LED_night", "type":"image/png", "path":"3d_green_wall_LED_night.png", "floor":2, "link":"3d_green_door"},
				
				{"name":"3d_navy_door", "type":"obj", "path":"3d_navy_door.obj", "floor":1, "link":""},
				{"name":"3d_navy_door_day", "type":"image/png", "path":"3d_navy_door_day.png", "floor":1, "link":"3d_navy_door"},
				{"name":"3d_navy_door_night", "type":"image/png", "path":"3d_navy_door_night.png", "floor":1, "link":"3d_navy_door"},
				{"name":"3d_navy_door_LED_day", "type":"image/png", "path":"3d_navy_door_LED_day.png", "floor":1, "link":"3d_navy_door"},
				{"name":"3d_navy_door_LED_night", "type":"image/png", "path":"3d_navy_door_LED_night.png", "floor":1, "link":"3d_navy_door"},
				{"name":"3d_navy_wall", "type":"obj", "path":"3d_navy_wall.obj", "floor":1, "link":""},
				{"name":"3d_navy_wall_day", "type":"image/png", "path":"3d_navy_wall_day.png", "floor":2, "link":"3d_navy_door"},
				{"name":"3d_navy_wall_night", "type":"image/png", "path":"3d_navy_wall_night.png", "floor":2, "link":"3d_navy_door"},
				{"name":"3d_navy_wall_LED_day", "type":"image/png", "path":"3d_navy_wall_LED_day.png", "floor":2, "link":"3d_navy_door"},
				{"name":"3d_navy_wall_LED_night", "type":"image/png", "path":"3d_navy_wall_LED_night.png", "floor":2, "link":"3d_navy_door"},
				
				{"name":"3d_orange_door", "type":"obj", "path":"3d_orange_door.obj", "floor":1, "link":""},
				{"name":"3d_orange_door_day", "type":"image/png", "path":"3d_orange_door_day.png", "floor":1, "link":"3d_orange_door"},
				{"name":"3d_orange_door_night", "type":"image/png", "path":"3d_orange_door_night.png", "floor":1, "link":"3d_orange_door"},
				{"name":"3d_orange_door_LED_day", "type":"image/png", "path":"3d_orange_door_LED_day.png", "floor":1, "link":"3d_orange_door"},
				{"name":"3d_orange_door_LED_night", "type":"image/png", "path":"3d_orange_door_LED_night.png", "floor":1, "link":"3d_orange_door"},
				{"name":"3d_orange_wall", "type":"obj", "path":"3d_orange_wall.obj", "floor":1, "link":""},
				{"name":"3d_orange_wall_day", "type":"image/png", "path":"3d_orange_wall_day.png", "floor":2, "link":"3d_orange_door"},
				{"name":"3d_orange_wall_night", "type":"image/png", "path":"3d_orange_wall_night.png", "floor":2, "link":"3d_orange_door"},
				{"name":"3d_orange_wall_LED_day", "type":"image/png", "path":"3d_orange_wall_LED_day.png", "floor":2, "link":"3d_orange_door"},
				{"name":"3d_orange_wall_LED_night", "type":"image/png", "path":"3d_orange_wall_LED_night.png", "floor":2, "link":"3d_orange_door"},
				
				{"name":"3d_purple_door", "type":"obj", "path":"3d_purple_door.obj", "floor":1, "link":""},
				{"name":"3d_purple_door_day", "type":"image/png", "path":"3d_purple_door_day.png", "floor":1, "link":"3d_purple_door"},
				{"name":"3d_purple_door_night", "type":"image/png", "path":"3d_purple_door_night.png", "floor":1, "link":"3d_purple_door"},
				{"name":"3d_purple_door_LED_day", "type":"image/png", "path":"3d_purple_door_LED_day.png", "floor":1, "link":"3d_purple_door"},
				{"name":"3d_purple_door_LED_night", "type":"image/png", "path":"3d_purple_door_LED_night.png", "floor":1, "link":"3d_purple_door"},
				{"name":"3d_purple_wall", "type":"obj", "path":"3d_purple_wall.obj", "floor":1, "link":""},
				{"name":"3d_purple_wall_day", "type":"image/png", "path":"3d_purple_wall_day.png", "floor":2, "link":"3d_purple_door"},
				{"name":"3d_purple_wall_night", "type":"image/png", "path":"3d_purple_wall_night.png", "floor":2, "link":"3d_purple_door"},
				{"name":"3d_purple_wall_LED_day", "type":"image/png", "path":"3d_purple_wall_LED_day.png", "floor":2, "link":"3d_purple_door"},
				{"name":"3d_purple_wall_LED_night", "type":"image/png", "path":"3d_purple_wall_LED_night.png", "floor":2, "link":"3d_purple_door"},
				
				
				{"name":"3d_yellow_door", "type":"obj", "path":"3d_yellow_door.obj", "floor":1, "link":""},
				{"name":"3d_yellow_door_day", "type":"image/png", "path":"3d_yellow_door_day.png", "floor":1, "link":"3d_yellow_door"},
				{"name":"3d_yellow_door_night", "type":"image/png", "path":"3d_yellow_door_night.png", "floor":1, "link":"3d_yellow_door"},
				{"name":"3d_yellow_door_LED_day", "type":"image/png", "path":"3d_yellow_door_LED_day.png", "floor":1, "link":"3d_yellow_door"},
				{"name":"3d_yellow_door_LED_night", "type":"image/png", "path":"3d_yellow_door_LED_night.png", "floor":1, "link":"3d_yellow_door"},
				{"name":"3d_yellow_wall", "type":"obj", "path":"3d_yellow_wall.obj", "floor":1, "link":""},
				{"name":"3d_yellow_wall_day", "type":"image/png", "path":"3d_yellow_wall_day.png", "floor":2, "link":"3d_yellow_door"},
				{"name":"3d_yellow_wall_night", "type":"image/png", "path":"3d_yellow_wall_night.png", "floor":2, "link":"3d_yellow_door"},
				{"name":"3d_yellow_wall_LED_day", "type":"image/png", "path":"3d_yellow_wall_LED_day.png", "floor":2, "link":"3d_yellow_door"},
				{"name":"3d_yellow_wall_LED_night", "type":"image/png", "path":"3d_yellow_wall_LED_night.png", "floor":2, "link":"3d_yellow_door"},

				{"name":"sensor_proximity", "type":"obj", "path":"sensor_block.obj", "floor":1, "link":""},
				{"name":"sensor_proximity", "type":"image/png", "path":"sensor_proximity.png", "floor":1, "link":""}
			]
		}
	}; // end object;
}); // end function, define function




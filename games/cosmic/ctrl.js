const vp_width = 1280; const vp_height = 720;
var gun_angle = 0.0; var gun_dir_x = 0, gun_dir_y = 0;
var cur_x = 0, cur_y = 0;

var game = {
	paused: true,
	level: 1,
	score : 0,
	player_name : '',
	state : 0,
	self_collision : false,
	missiles_left : 3,
	game_over : function() {
		this.paused = true;
		this.state = 2;
		ui.btn_start_hovered = false;
	}
};

var ui = {
	btn_start_hovered : false
}

var planet1 = {
	locx : vp_width/2,
	locy : vp_height/2,
	radius : 30,
	mass : 0.0,
	isTarget: false,
	exploding: false,
	explosion_t : 0,
	exploded : false
};

var planet2 = {
	locx : 640,
	locy : 200,
	radius : 60,
	mass : .4,
	isTarget: false,
	exploding: false,
	explosion_t : 0,
	exploded : false
};

var planet3 = {
	locx : 1000,
	locy : 500,
	radius : 60,
	mass : .4,
	isTarget: false,
	exploding: false,
	explosion_t : 0,
	exploded : false
};

var planet4 = {
	locx : 650,
	locy : 600,
	radius : 60,
	mass : .1,
	isTarget: true,
	exploding: false,
	explosion_t : 0,
	exploded : false
};

var planet5 = {
	locx : 100,
	locy : 600,
	radius : 60,
	mass : .8,
	isTarget: false,
	exploding: false,
	explosion_t : 0,
	exploded : false
};

var planets = [];

var missile = {
	mx : vp_width/2,
	my: vp_height/2,
	mvx : 0.0,
	mvy : 0.0,
	collided : true,
	collided_with: -1,
	launched : false,
	applyAcceleration : function(accx, accy) {
		this.mvx += accx;
		this.mvy += accy;
		
		this.applyVelocity(this.mvx, this.mvy);
	},
	applyVelocity : function(vx, vy) {
		this.mx += vx,
		this.my += vy
	},
	reset_missile: function() {
		this.mx = vp_width/2,
		this.my = vp_height/2,
		this.mvx = 0.0,
		this.mvy = 0.0
	}
}

function drawUI(ctx)
{
	if(game.state == 0)
	{
		//Game hasn't begun
		ctx.fillStyle = "#222222CC";
		ctx.fillRect(0, 0, vp_width, vp_height);
		
		ctx.fillStyle = "#AAFFFF"
		ctx.font = "60px Consolas";
		ctx.fillText("cosmic",vp_width/2 - 80,vp_height/2 - 10);
		
		//Draw play button
		
		var hovered = false;
		
		if(cur_x >= vp_width/2 - 30 && cur_y >= vp_height/2 + 10 && cur_x <= vp_width/2 - 30 + 100 && cur_y <= vp_height/2 + 10 + 40)
			ui.btn_start_hovered = true;
		else
			ui.btn_start_hovered = false;
		
		var btn_back = "#FFFFFF";
		var btn_fore = "#000000";
		
		if(ui.btn_start_hovered)
		{
			btn_back = "#000000";
			btn_fore = "#FFFFFF";
		}			
		
		ctx.fillStyle = btn_back;
		ctx.fillRect(vp_width/2 - 30, vp_height/2 + 10, 100, 40);
		
		ctx.fillStyle = btn_fore;
		ctx.font = "20px Consolas";
		ctx.fillText("play",vp_width/2, vp_height/2 + 35);
	}
	else if(game.state == 1)
	{
		//Playing state : Draw HUD
		ctx.fillStyle = "#11FF00"
		ctx.font = "25px Consolas";
		ctx.fillText("> level : " + game.level,10,30);
		
		ctx.fillStyle = "#11FF00"
		ctx.font = "25px Consolas";
		ctx.fillText("> score : " + game.score,10,60);
		
		ctx.fillStyle = "#CCFF00"
		ctx.font = "15px Consolas";
		ctx.fillText("[ missiles left : " + game.missiles_left + " ]",10,90);
	}
	else if(game.state == 2)
	{
		//Game over
		ctx.fillStyle = "#222222CC";
		ctx.fillRect(0, 0, vp_width, vp_height);
		
		ctx.fillStyle = "#AA0000"
		ctx.font = "60px Consolas";
		ctx.fillText("GAME OVER",vp_width/2 - 120,vp_height/2 - 10);
		
		//Draw play button
		
		var hovered = false;
		
		if(cur_x >= vp_width/2 - 30 && cur_y >= vp_height/2 + 10 && cur_x <= vp_width/2 - 30 + 100 && cur_y <= vp_height/2 + 10 + 40)
			ui.btn_start_hovered = true;
		else
			ui.btn_start_hovered = false;
		
		var btn_back = "#FFFFFF";
		var btn_fore = "#000000";
		
		if(ui.btn_start_hovered)
		{
			btn_back = "#000000";
			btn_fore = "#FFFFFF";
		}			
		
		ctx.fillStyle = btn_back;
		ctx.fillRect(vp_width/2 - 30, vp_height/2 + 10, 100, 40);
		
		ctx.fillStyle = btn_fore;
		ctx.font = "20px Consolas";
		ctx.fillText("restart",vp_width/2-20, vp_height/2 + 35);
		
		ctx.fillStyle = "#11FF00"
		ctx.font = "25px Consolas";
		ctx.fillText("your score : " + game.score, vp_width/2 - 80, vp_height/2 + 90);
	}
}

function drawPlanets(ctx)
{
	for(var i = 0;i<planets.length;i++)
	{	
		if(planets[i].exploding)
		{
			var grd = ctx.createRadialGradient(planets[i].locx, planets[i].locy, planets[i].radius/5, 
					planets[i].locx, planets[i].locy, planets[i].radius/5 + planets[i].explosion_t);
					
			grd.addColorStop(0, "rgba(255, 255, 255, " + (1-planets[i].explosion_t/150) + ")");
			grd.addColorStop(1, '#FFFFFF00');
			ctx.fillStyle = grd;
			
			ctx.beginPath();
			ctx.arc(planets[i].locx, planets[i].locy, planets[i].radius/5 + planets[i].explosion_t, 0, 2 * Math.PI);
			ctx.fill();	
			
			//split into 7 pieces
			if(planets[i].isTarget)
				ctx.fillStyle = "rgba(170, 34, 68, " + (1-planets[i].explosion_t/150) + ")";
			else
				ctx.fillStyle = "rgba(10, 160, 170, " + (1-planets[i].explosion_t/150) + ")";
			
			for(var j=0;j<7;j++) {
				ctx.beginPath();
				ctx.arc(planets[i].locx + planets[i].explosion_t * Math.cos(2 * Math.PI/7 * j), 
						planets[i].locy + planets[i].explosion_t * Math.sin(2 * Math.PI/7 * j), 
						planets[i].radius, 
						(2 * Math.PI/7) * j, (2 * Math.PI/7) * j + Math.PI/2);
						
				ctx.fill();
			}
			planets[i].explosion_t+=5;
			
			if(planets[i].explosion_t >= 150)
			{
				planets[i].exploding = false;
				planets[i].exploded = true;
			}
		}
		else if(!planets[i].exploded)
		{
			var grd = ctx.createRadialGradient(planets[i].locx, planets[i].locy, planets[i].radius, 
					planets[i].locx, planets[i].locy, planets[i].radius + planets[i].mass * 100);
					
			grd.addColorStop(0, '#444444');
			grd.addColorStop(1, '#222222');
			ctx.fillStyle = grd;
			
			ctx.beginPath();
			ctx.arc(planets[i].locx, planets[i].locy, planets[i].radius + planets[i].mass * 100, 0, 2 * Math.PI);
			ctx.fill();	
			
			if(planets[i].isTarget)
				ctx.fillStyle = "#AA2244";
			else
				ctx.fillStyle = "#0AA0AA"
			
			ctx.beginPath();
			ctx.arc(planets[i].locx, planets[i].locy, planets[i].radius, 0, 2 * Math.PI);
			ctx.fill();
		}		
	}
}

function init()
{
	planets.push(planet1); planets.push(planet2); planets.push(planet3); 
	planets.push(planet4); planets.push(planet5);
	
	addEventListener("mousemove", function(e) {
		if(!game.paused) {
			const gun_locx = vp_width/2; const gun_locy = vp_height/2;
			gun_dir_x = e.pageX - gun_locx;
			gun_dir_y = e.pageY - gun_locy;
			var mag = vectorMagnitude(gun_dir_x, gun_dir_y);
			gun_dir_x/=mag; gun_dir_y/=mag;
			
			if(!missile.launched) {
				angle = Math.atan2(gun_dir_y, gun_dir_x);
				missile.mx = vp_width/2 + 50 * Math.cos(angle);
				missile.my = vp_height/2 + 50 * Math.sin(angle);
			}
			
		}
		else
		{
			cur_x = e.pageX;
			cur_y = e.pageY;
		}
	});
	
	addEventListener("click", function(e) {
		if(!missile.launched && !game.paused) {
			missile.mvx = gun_dir_x * 1.3;
			missile.mvy = gun_dir_y * 1.3;
			missile.launched = true;
			
			if(game.missiles_left > 0)
				game.missiles_left--;
		}
		else if(game.paused && game.state == 0)
		{
			if(ui.btn_start_hovered)
			{
				game.paused = false;
				game.state = 1;
			}
		}
	});
	
	window.requestAnimationFrame(draw);
}

function drawMissile(ctx)
{
	if(game.self_collision && missile.collided)
		return;
	
	ctx.fillStyle = "#AA00AA";
	ctx.beginPath();
	ctx.arc(missile.mx, missile.my, 7, 0, 2 * Math.PI);
	ctx.fill();
}

function vectorDistance(x1, y1, x2, y2)
{
	return(Math.sqrt((x2-x1) * (x2-x1) + (y2-y1) * (y2-y1)));
}

function vectorMagnitude(x, y)
{
	return(Math.sqrt(x*x + y*y));
}

function applyVelocity(targ, vel)
{
	return(targ += vel);
}

function applyAclrn(targ, acclrn)
{
	return(targ += acclrn);
}

function applyPlanetsAcceleration()
{
	if(!missile.launched)
		return;
	
	for(var i=0;i<planets.length;i++)
	{
		if(planets[i].exploded)
			continue;
		
		var acc_dir_x = planets[i].locx - missile.mx;
		var acc_dir_y = planets[i].locy - missile.my;
		
		var dist = vectorDistance(planets[i].locx, planets[i].locy, missile.mx, missile.my);
		
		//Check for collision
		if(dist<=planets[i].radius)
		{
			missile.collided = true;
			missile.collided_with = i;
			missile.launched = false;
			planets[i].exploding = true;
			missile.reset_missile();
			
			if(i==0)
			{
				game.self_collision = true;
				game.missiles_left = 0;
				game.game_over();
			}
			
			if(planets[i].isTarget == false)
			{
				game.score -= 10;
			}
			else
			{
				game.score += 5;
				game.state = 3;
			}
			
			if(game.missiles_left == 0 && game.state == 1)
				game.game_over();
		}
		
		//Get the magnitude of the direction vector
		mag = vectorMagnitude(acc_dir_x, acc_dir_y);
		
		//normalize direction vector
		acc_dir_x/= mag; acc_dir_y/=mag;
		
		//Apply acceleration to the missile
		missile.applyAcceleration(dist/5000 * planets[i].mass * acc_dir_x, 
			dist/5000 * planets[i].mass * acc_dir_y);
	}
}

function drawLauncher(ctx)
{
	//Check for self collision	
	if(game.self_collision && missile.collided)
		return;
	
	ctx.fillStyle = "#AAAAAA";
	angle = Math.atan2(gun_dir_y, gun_dir_x);
	ctx.save();
	ctx.translate(vp_width/2, vp_height/2);
	ctx.rotate(angle);
	ctx.translate(-vp_width/2, -vp_height/2);
	ctx.fillRect(vp_width/2, vp_height/2 - 10, 60, 20);
	ctx.restore();
}

function draw()
{
	var ctx = document.getElementById('myCanvas').getContext('2d');
	ctx.clearRect(0, 0, vp_width, vp_height);
	ctx.fillStyle = "#222222";
	ctx.fillRect(0, 0, vp_width, vp_height);
	
	applyPlanetsAcceleration();
	drawPlanets(ctx);	
	drawMissile(ctx);
	
	drawLauncher(ctx);
	
	drawUI(ctx);
	
	//redraw to animate
	window.requestAnimationFrame(draw);
}

init();
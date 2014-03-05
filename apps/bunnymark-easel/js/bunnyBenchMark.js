$(document).ready(onReady)

$(window).resize(resize)
window.onorientationchange = resize;

var lastTime = 0;
var vendors = ['ms', 'moz', 'webkit', 'o'];
for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                               || window[vendors[x]+'CancelRequestAnimationFrame'];
}
if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
          timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
window.requestAnimFrame = window.requestAnimationFrame;

var width = 480;
var height = 320;

var wabbitTexture;
var pirateTexture;

var bunnys = [];
var gravity = 0.75//1.5 ;

var maxX = width;
var minX = 0;
var maxY = height;
var minY = 0;

var startBunnyCount = 10;
var isAdding = false;
var count = 0;
var container;
var easelLogo;
var clickImage;

var amount = 10;

function onReady()
{
	stage = new (parseInt(getParam("c2d")) ? createjs.Stage : createjs.SpriteStage)("renderer");
	stage.enableDOMEvents(false);
	renderer = stage;

	window.renderertype.innerHTML = "Using: " + (parseInt(getParam("c2d")) ? "C2D" : (stage.isWebGL() ? "WebGL" : "C2D (WebGL not supported)"));
	
	amount = renderer._webGLContext ? 10 : 5;
	
	if(amount == 5)
	{
		renderer.canvas.getContext("2d").mozImageSmoothingEnabled = false
		renderer.canvas.getContext("2d").webkitImageSmoothingEnabled = false;
	}
	renderer.canvas.style.position = "absolute";
	stats = new Stats();
	
	wabbitTexture = new createjs.Bitmap("images/bunny.png");
	wabbitTexture.image.addEventListener("load", _handleTextureLoaded.bind(this));
	
	document.body.appendChild( stats.domElement );
	stats.domElement.style.position = "absolute";
	stats.domElement.style.top = "0px";

	requestAnimFrame(update);

	counter = document.createElement("div");
	counter.className = "counter";
	document.body.appendChild( counter);
	
	easelLogo = document.getElementById("easel");
	clickImage = document.getElementById("clickImage");
	
	count = startBunnyCount;
	counter.innerHTML = count + " BUNNIES";
	
	container = stage;
	// stage.addChild(container);
	
	$(renderer.canvas).mousedown(function(){
		isAdding = true;
	});
	
	$(renderer.canvas).mouseup(function(){
		isAdding = false;
	})
	
	document.addEventListener("touchstart", onTouchStart, true);
	document.addEventListener("touchend", onTouchEnd, true);
	
	renderer.canvas.touchstart = function(){
		isAdding = true;
	}
	
	renderer.canvas.touchend = function(){
		isAdding = false;
	}
	resize();
}

function _handleTextureLoaded (event) {
	for (var i = 0; i < startBunnyCount; i++) 
	{
		var bunny = wabbitTexture.clone();
		bunny.set({x:0, y:0, width:26, height:37});
		bunny.speedX = Math.random() * 10;
		bunny.speedY = (Math.random() * 10) - 5;
		
		bunny.regX = bunny.width*0.5;
		bunny.regY = bunny.height;
		bunnys.push(bunny);
		
		container.addChild(bunny);
	}
}

function onTouchStart(event)
{
	isAdding = true;
}

function onTouchEnd(event)
{
	isAdding = false;
}

function resize()
{

	var windowWidth = $(window).width(),
		windowHeight = $(window).height(),
		width = windowWidth,
		height = windowHeight;

	if(width  > 800) width  = 800;
	if(height > 600) height = 600;
	
	maxX = width;
	minX = 0;
	maxY = height;
	minY = 0;

	var w = windowWidth / 2 - width/2;
	var h = windowHeight / 2 - height/2;
	
	renderer.canvas.style.left = windowWidth / 2 - width/2 + "px"
	renderer.canvas.style.top = windowHeight / 2 - height/2 + "px"

	window.renderertype.style.left = parseInt(renderer.canvas.style.left) + 10 + "px";
	window.renderertype.style.bottom = h + "px";
	
	stats.domElement.style.left = w + "px";
	stats.domElement.style.top = h + "px";
	
	counter.style.left = w + "px";
	counter.style.top = h + 49 + "px";
	
	easelLogo.style.right = w + 5 + "px";
	easelLogo.style.bottom = h + 8  + "px";
	
	clickImage.style.right = w + 138 + "px";
	clickImage.style.bottom = h + 17  + "px";
	
	renderer.canvas.width = width;
	renderer.canvas.height = height;
	renderer.updateViewport && renderer.updateViewport(width, height);
}

function update()
{
	stats.begin();
	
	if(isAdding)
	{
		// add 10 at a time :)
		
		for (var i = 0; i < amount; i++) 
		{
			var bunny = wabbitTexture.clone();
			bunny.set({x:0, y:0, width:26, height:37});
			bunny.speedX = Math.random() * 10;
			bunny.speedY = (Math.random() * 10) - 5;
			
			bunny.regX = bunny.width/2;
			bunny.regY = bunny.height;
			//bunny.alpha = 0.3 + Math.random() * 0.7;
			bunnys.push(bunny);
			bunny.scaleY = 1;
			
			//bunny.rotation = Math.random() - 0.5;
			var random = Math2.randomInt(0, container.children.length-2);
			container.addChild(bunny)//, random);
			
			count++;
		}
		
		// if(count >= 16500)amount = 0;
		/*if(count < 200)
		{
			var random = Math2.randomInt(0, bunnys.length-2);
			console.log(random + "  " + bunnys.length)
			var bunnyRandom = bunnys[random];
				bunnyRandom.setTexture(pirateTexture);
		}
		else if(count == 2000)
		{
			count ++;
			for (var i = 0; i < bunnys.length; i++) 
			{
				var bunny = bunnys[i];
				bunny.setTexture(wabbitTexture)
			}
			
		}*/
		
	
		counter.innerHTML = count + " BUNNIES";
	}
	
	for (var i = 0; i < bunnys.length; i++) 
	{
		var bunny = bunnys[i];
		
		bunny.x += bunny.speedX;
		bunny.y += bunny.speedY;
		bunny.speedY += gravity;
		
		if (bunny.x > maxX)
		{
			bunny.speedX *= -1;
			bunny.x = maxX;
		}
		else if (bunny.x < minX)
		{
			bunny.speedX *= -1;
			bunny.x = minX;
		}
		
		if (bunny.y > maxY)
		{
			bunny.speedY *= -0.85;
			bunny.y = maxY;
			bunny.spin = (Math.random()-0.5) * 0.2
			if (Math.random() > 0.5)
			{
				bunny.speedY -= Math.random() * 6;
			}
		} 
		else if (bunny.y < minY)
		{
			bunny.speedY = 0;
			bunny.y = minY;
		}
		
	}

	renderer.update();
	requestAnimFrame(update);
	stats.end();
}

window.getParam = function (param) {
	var qs = window.location.search.split("+").join(" ");

	var params = {}, tokens,
		re = /[?&]?([^=]+)=([^&]*)/g;

	while (tokens = re.exec(qs)) {
		params[decodeURIComponent(tokens[1])]
			= decodeURIComponent(tokens[2]);
	}

	return params[param];
};

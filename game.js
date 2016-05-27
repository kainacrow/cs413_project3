var gameHeight = 560;
var gameWidth = 560;
var gameScale = 4;
var DIM = 12;
// var horizon_y = gameHeight/gameScale/2;

var gameport = document.getElementById("gameport");

var renderer = PIXI.autoDetectRenderer(gameWidth, gameHeight, {backgroundColor: 0x3bd2f2});
gameport.appendChild(renderer.view);

// var start = new PIXI.Sprite(PIXI.Texture.fromImage("instructions1.png"));
var startText = new PIXI.Text("Press Enter\nto play", {font: "12px Monospace", fill: "#fff", strokeThickness: 3});
startText.position.y = 50;
startText.position.x = 20;

var winText = new PIXI.Text("You have\nsuccessfully\nkilled all\nthe villains\nCongrats!", {font: "12px Monospace", fill: "#fff", strokeThickness: 3});
winText.position.y = 20;
winText.position.x = 20;

var stage = new PIXI.Container();
stage.scale.x = gameScale;
stage.scale.y = gameScale;

var look_left = false;
var look_right = true;

var laser = new PIXI.Sprite(PIXI.Texture.fromImage('laser.png'));
var start = false;

// Scene objects get loaded in the ready function
var player;
var world;
var water;

// Character movement constants:
var moveLeft = 1;
var moveRight = 2;
var moveUp = 3;
var moveDown = 4;
var moveNone = 0;


var enemy;
var enemies = [];

var game = false;
var speed = 30;

// the move function starts of continues movement
function move() {
    if (player.direction == moveNone) {
    player.moving = false;
    // console.log(player.y);
    return;
  }
  
  var dx = 0;
  var dy = 0;
  player.anchor.x = 0.5;
  player.anchor.y = 0.0;
  
   
  if (player.direction == moveLeft) {
    look_left = true;
    look_right = false;
    createjs.Tween.get(player).to({x: player.x - speed}, 500).call(move);
  }
  if (player.direction == moveRight) {
      look_right = true;
      look_left = false;
      createjs.Tween.get(player).to({x: player.x + speed}, 500).call(move);
  }
  if (player.direction == moveUp)
    createjs.Tween.get(player).to({y: player.y - speed}, 500).call(move);
  
  if (player.direction == moveDown)
    createjs.Tween.get(player).to({y: player.y + speed}, 500).call(move);
    
  if(look_left){
      player.scale.x = -1;
  }
  if(look_right){
      player.scale.x = 1;
  }
  
  if (water[(player.gy+dy-1)*12 + (player.gx+dx)] != 0) {
    player.moving = false;
    return;
  }
  
  
  player.gx += dx;
  player.gy += dy;
  player.moving = true;
//   console.log("move");

  player.moving = true;
  
  createjs.Tween.get(player).to({x: player.gx*DIM, y: player.gy*DIM}, 250).call(move);
}




// Keydown events start movement
window.addEventListener("keydown", function (e) {
  e.preventDefault();
  if (!player) return;
  if (player.moving) return;
  if (e.repeat == true) return;
  
  player.direction = moveNone;

  if (e.keyCode == 13){
    start.alpha = 0;
    startText.alpha = 0;
    game = true;
}
  if (e.keyCode == 87)
    player.direction = moveUp;
  else if (e.keyCode == 83)
    player.direction = moveDown;
  else if (e.keyCode == 65)
    player.direction = moveLeft;
  else if (e.keyCode == 68)
    player.direction = moveRight;
  else if (e.keyCode == 32) {
      laser.visible = true;
      shoot();
  }
  

//   console.log(e.keyCode);
  move();
});

// Keyup events end movement
window.addEventListener("keyup", function onKeyUp(e) {
  e.preventDefault();
  if (!player) return;
  player.direction = moveNone;
});

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

// loader
PIXI.loader
    .add('map_json', 'map.json')
    .add('tileset', 'map.png')
    .add('man', 'player.png')
    .add('spritesheet', 'spritesheet.json')
    .load(ready);
    
// ready function
function ready() {

    
    var frames = [];
    for (var i=1; i<4; i++) {
        frames.push(PIXI.Texture.fromImage('man' + i + '.png'))
    }
   
    //createjs.Ticker.setFPS(60);
    var tu = new TileUtilities(PIXI);
    world = tu.makeTiledWorld("map_json", "map.png");
    stage.addChild(world);

    var man = world.getObject("man");
    man.height = 18;
    man.width = 10;

    player = new PIXI.Sprite(PIXI.loader.resources.man.texture);
    player.x = man.x;
    player.y = man.y;
    player.anchor.x = 0.0;
    player.anchor.y = 0.0;
//    player.anchor.y = -21.5;

    // Find the entity layer
    var entity_layer = world.getObject("Entities");
    entity_layer.addChild(player);
        
    laser.visible = false;
    entity_layer.addChild(laser);

    
    for (i = 0 ; i < 5; i ++){
        enemies[i] =  new PIXI.extras.MovieClip(frames);
        enemies[i].animationSpeed = 0.1;
        enemies[i].position.y = Math.floor(Math.random() * 500) + 50;
        enemies[i].position.x = Math.floor(Math.random() * 500) + 50;
        enemies[i].anchor.x = .5;
        enemies[i].anchor.y = .5;
        entity_layer.addChild(enemies[i]);
        enemies[i].play();
    }
    
    laser.x = player.position.x;
    laser.y = player.position.y;
    laser.visible = false;
    entity_layer.addChild(laser);
    left();  
    entity_layer.addChild(startText);
    entity_layer.addChild(winText);
    winText.visible = false;
    
    //water = world.getObject("Water").data;
    
    // player.direction = moveNone;
    // player.moving = false;
    // animate();
    }


function box_point_intersection(box, x, y) {
  if (box.position.x > x) return false;
  if (x > box.position.x + box.width) return false;
  if (box.position.y > y) return false;
  if (y > box.position.y + box.height) return false;
  return true;
}
// previousX = enemies[i].position.x;
function left() {
    for (i = 0 ; i < 5; i ++){
    createjs.Tween.get(enemies[i].position).to({x: enemies[i].position.x +50}, 4000, createjs.Ease.cubicOut);
    }
}
// function right() {
//     for (i = 0; i < 5; i++) {
//         createjs.Tween.get(enemies[i].position).to({x: previousX -50}, 4000, create.js.Ease.cubicOut);
//     }
// }



function shoot() {
    if (laser.visible == true){
        laser.x = player.position.x;
        laser.y = player.position.y;
        createjs.Tween.removeTweens(laser.position);
        if(look_right){
            createjs.Tween.get(laser.position).to({x:laser.position.x +100}, 700);
        }
        if(look_left){
            createjs.Tween.get(laser.position).to({x:laser.position.x -100}, 700);
        }
    }
}
animate();

// animate function
function animate(timestamp) {
    requestAnimationFrame(animate);
    update_camera();
    renderer.render(stage);
    for (i = 0 ; i < 5; i ++){
        if (box_point_intersection(enemies[i], laser.x, laser.y)) {
            //alert("hit");
            createjs.Tween.removeTweens(laser.position);
            //createjs.Tween.removeTweens(enemies[i].position);
            createjs.Tween.get(enemies[i]).to({alpha: 0}, 500);
            laser.visible = false;    
        }
    }
}

function win() {
    var score = 0;
    for (i=0; i<5; i++){
        if (enemies[i].alpha == 0){
            score +=1;
        }
    }
    if (score == 5) {
        winText.position.x = player.position.x;
        winText.position.y = player.position.y;
        return true;
    }
    else{
        return false;
    }
}


// camera movement
function update_camera() {
    stage.x = -player.x*gameScale + gameWidth/2 - player.width/2*gameScale;
    stage.y = -player.y*gameScale + gameHeight/2 + player.height/2*gameScale;
    stage.x = -Math.max(0, Math.min(world.worldWidth*gameScale - gameWidth, -stage.x));
    stage.y = -Math.max(0, Math.min(world.worldHeight*gameScale - gameHeight, -stage.y));
}

var gameHeight = 3560;
var gameWidth = 3560;
var gameScale = 4;
var DIM = 12;
// var horizon_y = gameHeight/gameScale/2;

var gameport = document.getElementById("gameport");

var renderer = PIXI.autoDetectRenderer(gameWidth, gameHeight, {backgroundColor: 0x3bd2f2});
gameport.appendChild(renderer.view);

var stage = new PIXI.Container();
stage.scale.x = gameScale;
stage.scale.y = gameScale;

var look_left = false;
var look_right = true;

var laser = new PIXI.Sprite(PIXI.Texture.fromImage('laser.png'));

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
    createjs.Tween.get(player).to({x: player.x - 10}, 500).call(move);
  }
  if (player.direction == moveRight) {
      look_right = true;
      look_left = false;
      createjs.Tween.get(player).to({x: player.x + 10}, 500).call(move);
  }
  if (player.direction == moveUp)
    createjs.Tween.get(player).to({y: player.y - 10}, 500).call(move);
  
  if (player.direction == moveDown)
    createjs.Tween.get(player).to({y: player.y + 10}, 500).call(move);
    
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

var enemy;
var enemies = [];
    
// ready function
function ready() {

    
    var frames = [];
    for (var i=1; i<4; i++) {
        frames.push(PIXI.Texture.fromImage('man' + i + '.png'))
    }
   
    createjs.Ticker.setFPS(60);
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
        enemies[i].position.y = Math.floor(Math.random() * 550) + 50;
        enemies[i].position.x = Math.floor(Math.random() * 550) + 50;
        enemies[i].anchor.x = .5;
        enemies[i].anchor.y = .5;
        entity_layer.addChild(enemies[i]);
        enemies[i].play();
    }
    
    //water = world.getObject("Water").data;
    
    player.direction = moveNone;
    player.moving = false;
    animate();
    }


function box_point_intersection(box, x, y) {
  if (box.position.x > x) return false;
  if (x > box.position.x + box.width) return false;
  if (box.position.y > y) return false;
  if (y > box.position.y + box.height) return false;
  return true;
}

// function left() {
//     for (i = 0 ; i < 7; i ++){
//     createjs.Tween.get(enemies[i].position).to({x: enemies[i].position.x +20}, 4000, createjs.Ease.cubicOut);
//     }
// }


function shoot() {
    if (laser.visible == true){
        laser.x = player.position.x;
        laser.y = player.position.y+player.height/2;
        createjs.Tween.removeTweens(laser.position);
        if(look_right){
            createjs.Tween.get(laser.position).to({x:laser.position.x +50}, 300);
        }
        if(look_left){
            createjs.Tween.get(laser.position).to({x:laser.position.x -50}, 300);
        }
    }
}

// animate function
function animate() {
    requestAnimationFrame(animate);
    update_camera();
    renderer.render(stage);
    for (i = 0 ; i < 5; i ++){
        if (box_point_intersection(enemies[i], laser.x, laser.y)) {
        createjs.Tween.removeTweens(laser.position);
        createjs.Tween.removeTweens(enemies[i].position);
        createjs.Tween.get([enemies]).to({alpha: 0}, 500);
        laser.visible = false;    
}
    }
}
animate();

// camera movement
function update_camera() {
    stage.x = -player.x*gameScale + gameWidth/2 - player.width/2*gameScale;
    stage.y = -player.y*gameScale + gameHeight/2 + player.height/2*gameScale;
    stage.x = -Math.max(0, Math.min(world.worldWidth*gameScale - gameWidth, -stage.x));
    stage.y = -Math.max(0, Math.min(world.worldHeight*gameScale - gameHeight, -stage.y));
}

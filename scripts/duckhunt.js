/************************************************
	DUCK HUNT JS 
		by Matthew Surabian - MattSurabian.com
		A first draft...
**************************************************/
var levelS = [["Game Starts...",3,2,5,3,13]];
$(document).ready(function(){
	//mute the sounds for debuging	
	//$(".sounds").attr("volume","0");
	Field.bringIt(levelS[Field.currentLevel][0],levelS[Field.currentLevel][1],levelS[Field.currentLevel][2],levelS[Field.currentLevel][3],levelS[Field.currentLevel][4],levelS[Field.currentLevel][5]);
});
var mute= 0;
var debug = 0;
function stopAll(){
document.getElementById('champSound').pause();
document.getElementById('loserSound').pause();
if(document.getElementById('champSound').currentTime)
	document.getElementById('champSound').currentTime=0;
if(document.getElementById('loserSound').currentTime)
	document.getElementById('loserSound').currentTime=0;
}

function playSound(str){
var d=document.getElementById(str);
if(d.currentTime) {d.pause(); d.currentTime=0;}
d.play();
}

function muteAll(){
	//console.log("Muting All");
	if(mute == 0){
		$(".sounds").attr("volume","0");
		$("#mute").html("UNMUTE");
		mute = 1;
	}else{
		$(".sounds").attr("volume","1");
		$("#mute").html("MUTE");
		mute=0;
	}
}
var Field={
	playfield:"#game",
	pieces: ["theFlash","tree","grass","theDog","sniffDog"],
	currentLevel:0,
	currentWave:0,
	pointsPerDuck:100,
	quackID:0,
	sniffID:0,
	checkWaveID:0,
	toWait:false,
	score:0,
	totalKills:0,
	totalMisses:0,
	killsThisLevel:0,
	missesThisLevel:0,
	levelName:"",
	shotsThisWave:0,
	shotsTaken:0,
	duckID:0,
	duckMax:0,
	//level vars
	levelWaves:0,
	goldenWave:-1,
	levelDucks:0,
	levelBullets:0,
	levelTime:0,
	levelTimeID:0,
	duckSpeed:0,
	ducksAlive:0,
	ducksDead:0,
	lastBang:1,
	clearingWave:false,
	levelInProg:false,
	duckFlyProg:false,
	waitingLevel:0,
	dogTimer:0,
	startGame: function(){
		$(Field.playfield).html("");
		
		for(var i=0;i<Field.pieces.length;i++){
			$(Field.playfield).append('<div id="'+Field.pieces[i]+'"></div>');	
		}
		
		$(".messages").css("display","none");
		$(".gameinfo").css("display","none");
		$("#gameField").unbind("mousedown");
		Field.goldenWave = Math.floor((Math.random()*Field.levelWaves));
		if(debug>1) Field.goldenWave=0;
		//show the introduction then load the wave
		Field.introduction(2000);
		Field.dogSniff();
		Field.waitingLevel = setTimeout(Field.level,6000);
	Field.shotsThisWave = 0;
	},
	
	openingScreen: function(){
		return true;	
	},
	updateScore: function(adjust){
		//console.log("in updatscore with: "+adjust);
		Field.score+=adjust;
		$("#scoreboard").html(addCommas(Field.score.toString()));	
	},
	bringIt: function(name,waves,ducks,dSpeed,bullets,time){
		stopAll();
		Field.totalKills=0;
		Field.totalMisses=0;
		clearTimeout(Field.waitingLevel);
		clearTimeout(Field.dogTimer);
		clearTimeout(Field.levelTimeID);
		levelName = name;
		Field.levelTime = time*1000;
		Field.levelWaves = waves;
		Field.levelDucks = ducks;
		Field.levelBullets = bullets;
		Field.currentWave = 0;
		Field.setDuckSpeed(dSpeed);
	
		//startGame the board, then to introduction
		this.startGame();
		
	},
	
	clearDucks: function(){
		$(".deadDuck").remove();
	},
	
	level: function(){
		Field.clearDucks();
		if(Field.levelTimeID !=0){
			clearTimeout(Field.levelTimeID);	
		}
		$(".gameinfo").css("display","block");
		Field.missesThisLevel = 0;
		Field.killsThisLevel = 0;
		$("#ducksKilled").html("");
		Field.nextWave(Field.currentWave);
				
	},
	nextWave: function(num){
		console.log("In nextWave: "+num);
		clearInterval(Field.quackID);	
		if(num < Field.levelWaves){
		Field.shotsThisWave = 0;
		Field.clearDucks();
		Field.bulletsD();
		Field.ducksAlive = Field.levelDucks;
		Field.ducksDead = 0;
		//add the ducks duckMax is for unique IDs
		//even when removed from the DOM old IDs anger the sprite engine
		Field.duckMax = Field.duckID + Field.ducksAlive;
		for(var i=Field.duckID;i<Field.duckMax;i++){
			console.log("Adding 1 duck");
			if(i%2 == 0){
				duckClass="duckA";
				duckPoints="100";
			}else{
				duckClass="duckB";
				duckPoints="200";
			}
			$(Field.playfield).append('<div id="theDuck'+i+'" points="'+duckPoints+'" class="ducks '+duckClass+'"></div>');
		}
		 if(num==Field.goldenWave){ $(Field.playfield).append('<div id="theDuck'+Field.duckMax+'" points="500" class="ducks duckC"></div>'); Field.duckMax++;}
		console.log("After: "+Field.levelDucks);
		console.log("New Ducks: ");
		console.log(document.getElementsByClassName('ducks'));
		Field.duckID = Field.duckMax;
		$("#waves").html("WAVE "+(Field.currentWave+1)+" of "+Field.levelWaves);

		Field.releaseTheDucks();
		}else{
				Field.totalKills += Field.killsThisLevel;
				Field.totalMisses += Field.missesThisLevel;
			if((Field.currentLevel+1) < levelS.length){
				
				var skills = (Field.killsThisLevel/(Field.killsThisLevel+Field.missesThisLevel))*100;
				if(skills<70){
					//console.log("i am in");
					alert( "Your total kills: " + Field.totalKills + "\n" + "Ducks you missed: " + Field.totalMisses + "\n" + "Your score: " + skills);
					$("#loser").css("display","block");
					playSound("loserSound");
					Field.updateScore(-Field.score);
					return false;
				}
				
				Field.currentLevel++;
				setTimeout(function(){
					Field.bringIt(levelS[Field.currentLevel][0],levelS[Field.currentLevel][1],levelS[Field.currentLevel][2],levelS[Field.currentLevel][3],levelS[Field.currentLevel][4],levelS[Field.currentLevel][5]);	
				},2000);
				
				
			}else{
				var skills = (Field.killsThisLevel/(Field.killsThisLevel+Field.missesThisLevel))*100;
				if(skills>70){
				alert( "Your total kills: " + Field.totalKills + "\n" + "Ducks you missed: " + Field.totalMisses + "\n" + "Your score: " + Field.score);
					$("#winner").css("display","block");
					playSound("champSound");
					Field.updateScore(-Field.score);
				}else{
					alert( "Your total kills: " + Field.totalKills + "\n" + "Ducks you missed: " + Field.totalMisses + "\n" + "Your score: " + Field.score);
								$("#loser").css("display","block");
					playSound("loserSound");
					Field.updateScore(-Field.score);
					return false;	
				}
				
			}
			
		}
				
			
	},
	clearWave: function(){
		$("#gameField").unbind("mousedown");
		if(!Field.clearingWave){
			 $("#gameField").animate({
			 	backgroundColor: '#64b0ff'
			 },500);
			Field.clearingWave = true;
			Field.getDucks();
			Field.currentWave++;
			Field.nextWave(Field.currentWave);

			setTimeout(function(){Field.clearingWave=false;},5000);	
		}
	},
	releaseTheDucks: function(){
		//animate the ducks
		$('.ducks').each(function(){
			$(this).sprite({fps: 6, no_of_frames: 3,start_at_frame: 1});
			$(this).spRandom({
	          top: 400,
	          left: 700,
	          right: 0,
	          bottom: 0,
	          speed: Field.duckSpeed,
	          pause: 0
	     	 });
	     	 $(this).bind("mousedown",function(){Field.duckShoot($(this))});
		});	
		$("#gameField").bind("mousedown",Field.gunShot);
		playSound("quacking");
		Field.quackID = setInterval(function(){playSound("quacking");},3000);
		clearTimeout(Field.levelTimeID);
		Field.levelTimeID = setTimeout(Field.duckFly,Field.levelTime);

	},
	cleanScreen: function(name){
		$(name).css("display","none");
	},
	flashScreen: function(){
		var flashTime = 70;
		$("#theFlash").css("display","block");
		setTimeout(this.cleanScreen,flashTime,"#theFlash");
		
	},
	introduction: function(time){
		
			$("#level").html(levelName);
			$("#level").css("display","block");
			
			setTimeout(this.cleanScreen,time,"#level");
	},
	bulletsD: function(){
		var bulletsText = "";
		var shotsLeft = Field.levelBullets - Field.shotsThisWave;
		
		if(shotsLeft>15){
			shotsLeft = 15;	
		}
		
		for(var i=0; i<shotsLeft; i++){
			bulletsText += '<img src="images/bullet.png" align="absmiddle"/>';	
		}	
		$("#ammo").html("<strong>Shots: </strong>"+bulletsText);
		
	},
	gunShot: function(){
		Field.shotsTaken++;
		Field.shotsThisWave++;
		Field.flashScreen();
		Field.bulletsD();	
		if(Field.lastBang == 1){
		playSound("gunSound");
		Field.lastBang = 0;
		}else{
		playSound("gunSound2");
		Field.lastBang = 1;
		}
		
		if(Field.shotsThisWave == Field.levelBullets && Field.ducksAlive>0){
			//you're out of bullets and there are still beasts!
			Field.outOfAmmo();	
		}
	},
	duckShoot: function(obj){
		Field.ducksAlive--;
		Field.ducksDead++;
		Field.killsThisLevel++;
		$("#ducksKilled").append("<img src='images/duckDead.png'/>");
		$._spritely.instances[$(obj).attr("id")].stop_random=true;
		$(obj).stop(true,false);
			$(obj).unbind();
			$(obj).addClass("deadSpin");
		Field.updateScore(parseInt($(obj).attr('points')));
	
      	
		$(obj).spStop(true);
		$(obj).spState(5);
		
		playSound("quak");

      	if(Field.ducksAlive == 0){
    		document.getElementById("quacking").pause();
      		clearInterval(Field.quackID);	
      	}
      	setTimeout(function(){
        $(obj).spState(6);
		$(obj).spStart();
		$(obj).animate({
			top:'420'
		},800,function(){
			playSound("thud");
			$(obj).destroy();
			$(obj).attr("class","deadDuck");
			Field.dogComeUp();
		});
      	},500);
	
		  
	},
	dogComeUp: function(){
		if(	!Field.duckFlyProg){

		$("#theDog").css("backgroundPosition","0px 0px");

		$("#theDog").animate({
			bottom: '110'
		},400,function(){
		playSound("ohyeah");
		setTimeout(function(){$("#theDog").animate({
					bottom: '-10'
					},500,function(){
						if(Field.ducksAlive == 0){
							setTimeout(function(){Field.clearWave();},1000);	
						}	
					});},500);
		});	
		}
	},
	dogSniff: function(){
		//make sure the dog is in the right spot and visible
		
		$("#sniffDog").css("bottom","4px");
		$("#sniffDog").css("left","-400px");
		$('#sniffDog').css("background-image","url(images/dogSniffJump.png)");
		$('#sniffDog').css("background-position","0px 0px");
		$('#sniffDog').fadeIn();
	
		//play the sniffing sound
		Field.sniffID= setInterval(function(){playSound("sniff");},2000);
	
		//animate the dog sprite and the dog itself
		$('#sniffDog').sprite({fps: 6, no_of_frames: 4});
		$('#sniffDog').animate({
			left: '240'
		},5000,'linear',function(){
			//stop sniffing
			document.getElementById("sniff").pause();
			clearInterval(Field.sniffID);
			//stop the sprite
			$('#sniffDog').destroy();
			//barking
			$('#sniffDog').css("background-position","-632px 0px");
			playSound("bark");
		
			//make the dog jump in one second
			Field.dogTimer = setTimeout(function(){
				$('#sniffDog').css("background-image","url(images/jumpDog.png)");
				$('#sniffDog').css("bottom","75px");
				$('#sniffDog').css("background-position","0px 0px");
				$('#sniffDog').sprite({fps: 50, no_of_frames: 2,play_frames: 2});
				$('#sniffDog').fadeOut();
				$('#sniffDog').spStop();
				$('#sniffDog').destroy();
				
			},1000);

	});
	},
	dogLaugh: function(){
		$("#theDog").stop(true,false);
		$("#theDog").css("background-position","-276px 0px");
			$("#theDog").animate({
				bottom: '110'
			},500,function(){
				document.getElementById("quacking").pause();
				clearInterval(Field.quackID);
				playSound("laugh");
			
				setTimeout(function(){
					$("#theDog").animate({
						bottom: -10
					},500,function(){
						Field.duckFlyProg = false;
						setTimeout(function(){Field.clearWave();},1000);	
					});},500);
				
			});	
						
	},
	outOfAmmo: function(){
		$(".ducks").unbind();
		$("#gameField").unbind();	
		Field.clearingWave=false;
		setTimeout(Field.duckFly(),300);
	},
	duckFly: function(){
		if(Field.ducksAlive > 0){
			clearTimeout(Field.levelTimeID);
			Field.duckFlyProg = true;
			$(".ducks").unbind();
			 $("#gameField").unbind();

			 $("#gameField").animate({
			 	backgroundColor: '#B1B1B1'
			 },900);
			 $(".ducks").each(function(){
			 	if(!$(this).hasClass("deadSpin")){
			 	Field.missesThisLevel++;
			 	$("#ducksKilled").append("<img src='images/duckLive.png'/>");
				var self = $(this);
				$._spritely.instances[self.attr("id")].stop_random=true;
				self.spState(2);
				self.animate({
					top:'-200',
					left:'460'	
				},500,function(){
					self.attr("class","deadDuck");
					self.destroy();	
				});
			 	}
			});	
			
			setTimeout(function(){Field.dogLaugh();},200);
			}	
	},
	getDucks: function(){
		var ducksScore = "";
		var liveMax = Field.missesThisLevel;
		var deadMax = Field.killsThisLevel;
		if(Field.ducksLived > 25){
			liveMax = 25;
		}
		if(Field.ducksKilled>25){
			deadMax = 25;	
		}
		for(var i=0;i<liveMax;i++){
			ducksScore += "<img src='images/duckLive.png'/>";	
		}
		for(var i=0;i<deadMax;i++){
			ducksScore += "<img src='images/duckDead.png'/>";	
		}
	
		
		$("#ducksKilled").html(ducksScore);
	},
	setDuckSpeed: function(speedVal){
		switch(speedVal){
			case 0:
			Field.duckSpeed = 1200;
			break;
			case 1:
			Field.duckSpeed = 2800;
			break;
			case 2:
			Field.duckSpeed = 2500;
			break;	
			case 3:
			Field.duckSpeed = 2000;
			break;
			case 4:
			Field.duckSpeed = 1800;
			break;
			case 5:
			Field.duckSpeed = 1500;
			break;
			case 6:
			Field.duckSpeed = 1300;
			break;
			case 7:
			Field.duckSpeed = 1200;
			break;
			case 8:
			Field.duckSpeed = 800;
			break;
			case 9:
			Field.duckSpeed = 600;
			break;
			case 10:
			Field.duckSpeed = 500;
			break;
		}
	}	
}

function makeLevel(){
	var LCwaves = parseInt($("#LCwaves").attr("value"));
	var LCducks = parseInt($("#LCducks").attr("value"));
	var LCbullets = parseInt($("#LCbullets").attr("value"));
	var LCwavetime = parseInt($("#LCwavetime").attr("value"));
	var LCdif = parseInt($("#LCdif").attr("value"));
	$("#sniffDog").stop();
	Field.bringIt("Custom Level",LCwaves,LCducks,LCdif,LCbullets,LCwavetime);		
}

function tryAgain(){

		Field.bringIt(levelS[Field.currentLevel][0],levelS[Field.currentLevel][1],levelS[Field.currentLevel][2],levelS[Field.currentLevel][3],levelS[Field.currentLevel][4],levelS[Field.currentLevel][5]);
}

function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}
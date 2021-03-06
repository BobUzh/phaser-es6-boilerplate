import Gem from './object/Gem';

class Main extends Phaser.State {

	create() {
		//start coordinates gems on the background
		this.START_X_POSITION =48;
		this.START_Y_POSITION =310;
		this.STEP_FOR_ROW = 104;
		this.STEP_FOR_COLUM = 86;

		this.score = 0;
		this.canSwipe=false;
		this.waitSetActive=false;
		this.firstActive = null;
		this.secondActive = null;
		this.typesGems = [ 'red' , 'blue' , 'green' , 'light-blue' , 'yellow' , 'pink' ];
		this.axis = 'x';

		//set background
		this.game.add.image( 0 , 0 , 'background' );

		// central coordinates
		const {centerX,centerY}=this.game.world;

		//add section SCORE
		const score_W = this.game.cache.getImage( 'score' ).width/2;
		const score_H = this.game.cache.getImage( 'score' ).height/2;
		this.game.add.image( centerX-score_W , 0 , 'score' );

		//add TEXT inside section SCORE
		this.textScore = this.game.add.text( centerX , score_H+20 , this.score , {fontSize:'90px' , fill:'#ffffff'} );
		this.textScore.anchor.set(0.5);

		// text  'version 2.0'
		this.game.add.text(centerX+score_W/1.55 , 25 , 'v 2.0' ,{fontSize:'20px' , fill:'black',font: 'Pacifico'})

		//timer
		this.timer = 60;
		this.textTime = this.game.add.text( centerX-score_W*1.5 ,  score_H+20 , '60s' , {  fill: "#2f2f2f", align: "center", fontSize:'90px', font: 'Pacifico',fontWeight:'bold' } );
		this.textTime.anchor.set(0.5);

		//update timer
		this.game.time.events.loop( Phaser.Timer.SECOND , this.updateTime , this );

		//finish timer
		this.game.time.events.add( Phaser.Timer.SECOND*63 , this.gameOver , this );

		//add and play auido background
		this.backgroundSound = this.game.add.audio('backgroundSound',0.5,true);
		this.backgroundSound.play();

		//button audio background , on/off
		this.btnSound = this.game.add.button( centerX+score_W+10, 30 , 'sound' );
		this.btnSound.inputEnabled = true;
		this.btnSound.events.onInputDown.add( this.toggleSound , this );

		//audio for 3match
		this.soundKill = this.game.add.audio('kill',0.5);
		
		//audio for random 3match 
		this.soundRndKill = this.game.add.audio('rndKill',0.5);

		//create shadow(gem) and hide
		this.shadow = this.game.add.image( 0 , 0 , 'shadow' );
		this.shadow.scale.setTo(  1.2 , 1.2 );
		this.shadow.anchor.set(0.45,0.45);
		this.shadow.alpha=0;

		// create group gems
		this.gems = this.game.add.group();

		// array needed 99.99%
		this.arrGems = [
			[ null , null , null , null , null , null , null ],
			[ null , null , null , null , null , null , null ],
			[ null , null , null , null , null , null , null ],
			[ null , null , null , null , null , null , null ],
			[ null , null , null , null , null , null , null ],
			[ null , null , null , null , null , null , null ],
			[ null , null , null , null , null , null , null ]
		];

		//img BIG DONUT in center
		const donut_W = this.game.cache.getImage( 'donut' ).width/2;
		const donut_H = this.game.cache.getImage( 'donut' ).height/2;
		const donut = this.game.add.image( centerX-donut_W , centerY-donut_H+100 , 'donut' );

		// img BIG DONUT start animation
		this.game.add.tween( donut ).to( {y:score_H*2-10} , 750 , Phaser.Easing.Bounce.Out , true , 500 , 0 , true )
									.onComplete.add( ()=> this.game.add.tween( donut ).to( {y:-donut_H*2} , 500 , Phaser.Easing.Linear.Out , true , 500 , 0 , false ) );


		//waiting the end animation BIG DONUT
		setTimeout( this.renderGems.bind(this) , 2000 );

	}

	toggleSound(){

		if(this.backgroundSound.isPlaying ){
			this.backgroundSound.pause();
			this.btnSound.alpha =0.5;

		} else{
			this.backgroundSound.resume();
			this.btnSound.alpha =1;
		}
		
	}

	updateTime() {
		//waiting the end animation BIG DONUT 2s
		setTimeout( ()=>{
			this.timer--;
			this.textTime.setText( this.timer+'s');
			this.game.cache.addText('score',null,this.score);
		}, 2000)
	}
	rndColor() {
		return this.typesGems[Math.floor(Math.random()*this.typesGems.length)]
	}

	gameOver(){
		
		this.backgroundSound.stop();
		this.game.state.start("GameOver");
	}
	shadowAnimate(axis,repeat){
		axis=='y'?this.game.add.tween( this.shadow ).to( {y:this.firstActive.posY}, 200 , Phaser.Easing.Linear.Out , true , 0 , 0 , repeat )
				 :this.game.add.tween( this.shadow ).to( {x:this.firstActive.posX}, 200 , Phaser.Easing.Linear.Out , true , 0 , 0 , repeat )
	}

	renderGems(){
		for (let i=0; i<this.arrGems.length; i++ ){

			for(let j=0; j<this.arrGems[0].length; j++ ){

				let gem = new Gem( this.game , i , j , this.START_X_POSITION + j*this.STEP_FOR_ROW , this.START_Y_POSITION + i*this.STEP_FOR_COLUM , this.rndColor() );
				this.gems.add(gem);

				//small cosmetic 
				gem.setUp();
				
				 // subscribe to two listeners
				gem.events.onInputDown.add( this.activeGem , this );
				gem.events.onInputUp.add( this.stopActiveGem , this);

				//write to the corresponding array gem
				this.arrGems[i][j]=gem;
			}
		}
		// run the search for the indentic color
		this.searchIdentic()
	}

	activeGem(e){
		console.log(e)

		if(!this.waitSetActive){

			this.firstActive = e;
			//can or not search second active gem
			this.canSwipe = true;

			//set shadow under active gem
			this.shadow.x=e.x;
			this.shadow.y=e.y;
			this.shadow.alpha = 1;
		}
	}

	stopActiveGem(){
		this.canSwipe= false;
	}

	animationOnShift(repeat){

		this.firstActive.animationOnShift(this.axis,repeat);
		this.shadowAnimate(this.axis,repeat);
		this.secondActive.animationOnShift(this.axis,repeat);
	}

	changeGems(){

		this.changeTwoElements(this.firstActive,this.secondActive);

			//check for a match
			let arrMatch = [...this.searchMatch(this.secondActive),...this.searchMatch(this.firstActive)];

			if(arrMatch.length > 2){

				this.animationOnShift(false);

				//waiting for the end of the animation shift
				setTimeout(()=>{
					this.killGems(arrMatch);
					this.gravity();
				},250);

			} else {
				this.animationOnShift(true);
				this.changeTwoElements(this.firstActive,this.secondActive);
				this.waitSetActive=false;
			}
	}

	searchMatch(el){

		let arrMatch = [];
		let upperEl =  this.next(el,'Y');
		let lowerEl = this.prev(el,'Y');
		let rightEl = this.next(el,'X');
		let leftEl = this.prev(el,'X');

		if( upperEl && !upperEl.dead &&  upperEl.key==el.color){ 

			arrMatch.push(upperEl);
			if( this.next(upperEl,'Y') && !this.next(upperEl,'Y').dead &&  this.next(upperEl,'Y').key==el.color)

					arrMatch.push(this.next(upperEl,'Y'));

		}
		if( lowerEl && !lowerEl.dead &&  lowerEl.key==el.color){

				arrMatch.push(lowerEl);
				if( this.prev(lowerEl,'Y') && !this.prev(lowerEl,'Y').dead &&  this.prev(lowerEl,'Y').key==el.color)

						arrMatch.push(this.prev(lowerEl,'Y'));
		}

		if( rightEl &&  !rightEl.dead &&  rightEl.key==el.color){

				arrMatch.push(rightEl);
				if( this.next(rightEl,'X')  && !this.next(rightEl,'X').dead &&  this.next(rightEl,'X').key==el.color)

						arrMatch.push(this.next(rightEl,'X'));
		}

		if( leftEl && !leftEl.dead &&  leftEl.key==el.color){

				arrMatch.push(leftEl);
				if( this.prev(leftEl,'X') && !this.prev(leftEl,'X').dead &&  this.prev(leftEl,'X').key==el.color)

						arrMatch.push(this.prev(leftEl,'X'));
		}

		let finalArr =[];
		const arr_x =arrMatch.filter((e)=>e.gridX==el.gridX)

		if (arr_x.length >=2 ){
			finalArr.push(...arr_x,el)
		}

		const arr_y =arrMatch.filter((e)=>e.gridY==el.gridY)

		if( arr_y.length >=2 ){
			finalArr.push(...arr_y,el)
		};

		return finalArr
	}

	changeTwoElements ( el1 , el2 ){

		//change el in grid 
		this.arrGems[ el2.gridX ][ el2.gridY ]= el1;
		this.arrGems[ el1.gridX ][ el1.gridY ]= el2;

		// change value properties 
		[ el1.gridX , el2.gridX ]=[ el2.gridX , el1.gridX ];
		[ el1.gridY , el2.gridY ]=[ el2.gridY , el1.gridY ];
		[ el1.posX  , el2.posX  ]=[ el2.posX  , el1.posX  ];
		[ el1.posY  , el2.posY  ]=[ el2.posY  , el1.posY  ];

	}

	gravity() {

		// console.log('gravity')
		for (let i = 0; i < this.arrGems.length; i++) {

			for (let j = 0; j < this.arrGems[0].length; j++) {

				let currentGem = this.arrGems[i][j];
				let aboveCurrentGem = this.prev(currentGem, 'Y');

				//  if the cell is empty & is there a previous cell & previous cell is not empty 
				if (currentGem.dead && aboveCurrentGem && !aboveCurrentGem.dead) {

					//swap
					this.changeTwoElements(currentGem, aboveCurrentGem);
					aboveCurrentGem.animationFall();

					// i and j one step back
					i --;
					j --;
				}
			}
		}
		// start create new gems
		this.newGems();

	}

	newGems(){
		// if empty cell, new set color new coordinates and render
		this.arrGems.map( (e)=>e.map( (el)=>{
			
			if(el.dead){
				
				el.color = this.rndColor();
				el.loadTexture(el.color);
				el.dead=false;
				el.reset(el.posX,el.posY-200);
				el.animationNewGem();
			}
		}));
		//duration animation fall newGems 1000 , so start search identic color with a delay 1000+
		setTimeout(() => this.searchIdentic(), 1001);

	}

	searchIdentic(){
		console.log('dublicat')

		//are there or not matches?
		let identic = false;

		for( let i=this.arrGems.length-1; i>=0; i-- ){

			for( let j=this.arrGems[0].length-1; j>=0; j-- ){

				//looking if the same colors are nearby
				const arrMatch = this.searchMatch( this.arrGems[i][j]);

				if( arrMatch.length>0 ){

					this.killGems(arrMatch)
					identic=true;

				}
			}
		}
		identic?this.gravity():this.waitSetActive=false ;
	}
	killGems(arr){
		this.shadow.alpha=0;
		this.soundRndKill.play();
		arr.map( (e)=>{
			e.kill();
			e.dead=true;
		});
		this.score += arr.length*10;
		this.textScore.setText(this.score);
	}

	next(gem,axis){

		if ( axis=='X' && gem.gridY < 6 ){

			return this.arrGems[gem.gridX][gem.gridY + 1]

		} else if(axis=='Y' && gem.gridX < 6 ){

			return this.arrGems[gem.gridX +1 ][gem.gridY]

		}

	}
	prev(gem,axis){

		if (axis=='X' && gem.gridY > 0 ){

			return this.arrGems[gem.gridX][gem.gridY - 1 ]

		} else if(axis=='Y' && gem.gridX > 0 ){

			return this.arrGems[gem.gridX - 1 ][gem.gridY]

		}

	}

	searchSecondActive(vector){

		this.waitSetActive = true;

		//find second active gem
		switch(vector) {
			case 'right':
				this.secondActive= this.next( this.firstActive,'X');
				this.axis='x';
				break;
			case 'left':
				this.secondActive= this.prev( this.firstActive,'X');
				this.axis='x';
				break;
			case 'up':
				this.secondActive= this.prev( this.firstActive,'Y');
				this.axis='y';
				break;
			case 'down':
				this.secondActive= this.next( this.firstActive,'Y');
				this.axis='y';
				break;
			default:
				null
		}
				//if second active gem null, animation "can not move"
				if (!this.secondActive){ 

					this.firstActive.canNotMove();
					this.waitSetActive = false;
		
				 } else {
					 this.changeGems();
				 }
	}
	swipe(){
		//check 4 directions and pass them
		if(this.firstActive && this.canSwipe){


			if(this.game.input.x > this.firstActive.x+40 ){

				this.canSwipe=false;
				this.searchSecondActive('right');

			} else if(this.game.input.x<this.firstActive.x-40){

				this.canSwipe=false;
				this.searchSecondActive('left');

			} else if(this.game.input.y>this.firstActive.y+40){

				this.canSwipe=false;
				this.searchSecondActive('down');

			} else if(this.game.input.y<this.firstActive.y-40){

				this.canSwipe=false;
				this.searchSecondActive('up');

			}
		}
	}
	update() {
		
		this.swipe();
		
	}
}

export default Main;

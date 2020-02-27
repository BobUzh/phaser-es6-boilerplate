import Gem from './object/Gem';

class Main extends Phaser.State {

	create() {
		//coordinates gems in background
		this.START_X_POSITION =325;
		this.START_Y_POSITION =310;
		this.STEP_FOR_ROW = 104;
		this.STEP_FOR_COLUM = 86;

		this.score = 0;
		this.canSwipe=false;
		this.waitSetActive=true;
		this.firstActive = null;
		this.secondActive = null;
		this.typesGems = [ 'red' , 'blue' , 'green' , 'light-blue' , 'yellow' , 'pink' ];
		this.axis = 'x';

		//set background
		this.game.add.image( 0 , 0 , 'background' );

		// central coordinates
		const {centerX,centerY}=this.game.world;

		//add img BIG DONUT in center
		const donut_W = this.game.cache.getImage( 'donut' ).width/2;
		const donut_H = this.game.cache.getImage( 'donut' ).height/2;
		const donut = this.game.add.image( centerX-donut_W , centerY-donut_H+100 , 'donut' );

		//add section SCORE
		const score_W = this.game.cache.getImage( 'score' ).width/2;
		const score_H = this.game.cache.getImage( 'score' ).height/2;
		this.game.add.image( centerX-score_W , 0 , 'score' );

		//add TEXT inside section SCORE
		this.textScore = this.game.add.text( centerX , score_H+20 , this.score , {fontSize:'90px' , fill:'#ffffff'} );
		this.textScore.anchor.set(0.5);

		//timer
		this.timer = 60;
		this.textTime = this.game.add.text( centerX-score_W*1.5 ,  score_H+20 , '60s' , {  fill: "#000000", align: "center", fontSize:'90px' } );
		this.textTime.anchor.set(0.5);

		//update timer
		this.game.time.events.loop( Phaser.Timer.SECOND , this.updateTime , this );

		//timer game over 
		this.game.time.events.add( Phaser.Timer.SECOND*63 , this.gameOver , this );

		//add sound background
		this.backgroundSound = this.game.add.audio('backgroundSound',0.5,true);
		this.backgroundSound.play();

		//button sound on/off
		this.btnSound = this.game.add.button( centerX+score_W+10, 30 , 'sound' );
		this.btnSound.inputEnabled = true;
		this.btnSound.events.onInputDown.add( this.toggleSound , this );

		//sound for 3 match
		this.soundKill = this.game.add.audio('kill',0.5);
		
		//sound for random 3 match 
		this.soundRndKill = this.game.add.audio('rndKill',0.5);

		//create shadow and hide
		this.shadow = this.game.add.image( 0 , 0 , 'shadow' );
		this.shadow.scale.setTo(  1.2 , 1.2 );
		this.shadow.anchor.set(0.5);
		this.shadow.alpha=0;

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

		// create group gems
		this.gems = this.game.add.group();

		// img BIG DONUT tween
		this.game.add.tween( donut ).to( {y:score_H*2-10} , 750 , Phaser.Easing.Bounce.Out , true , 500 , 0 , true )
									.onComplete.add( ()=> this.game.add.tween( donut ).to( {x:-donut_W*2} , 500 , Phaser.Easing.Linear.Out , true , 500 , 0 , false ) );


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
		//waiting the end animation BIG DONUT
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

			// this.gems.bringToTop(e)

			//add s shadow under active gem
			this.shadow.x=e.position.x+7;
			this.shadow.y=e.position.y+7;
			this.shadow.alpha = 1;

		}
	}

	stopActiveGem(){
		this.canSwipe= false;
	}

	changeGems(){
		this.changeEl(this.firstActive,this.secondActive);

			//check for a match and return or not return the animation to original position
			let arr = [...this.searchMatch(this.secondActive),...this.searchMatch(this.firstActive)];


			if(arr.length>=2){
				console.log('1');

				this.firstActive.changeWithOpponent(this.axis,false);
				this.shadowAnimate(this.axis,false);
				this.secondActive.changeWithOpponent(this.axis,false);

				setTimeout(()=>{
					this.killGems(arr);
					this.gravity();
				},250);

			} else {
				console.log('2')

				this.firstActive.changeWithOpponent(this.axis,true);
				this.shadowAnimate(this.axis,true);
				this.secondActive.changeWithOpponent(this.axis,true);
				this.changeEl(this.firstActive,this.secondActive);

				this.waitSetActive=false;
			}
		
	}

	searchMatch(el){
		// console.log('sister')

		let arrKill = [];

		if( this.next(el,'Y',1) && !this.next(el,'Y',1).dead &&  this.next(el,'Y',1).key==el.color){ 

			arrKill.push(this.next(el,'Y',1));

			if( this.next(el,'Y',2) && !this.next(el,'Y',2).dead &&  this.next(el,'Y',2).key==el.color)

					arrKill.push(this.next(el,'Y',2));

					
		}
		if( this.prev(el,'Y',1) && !this.prev(el,'Y',1).dead &&  this.prev(el,'Y',1).key==el.color){

				arrKill.push(this.prev(el,'Y',1));

				if( this.prev(el,'Y',2) && !this.prev(el,'Y',2).dead &&  this.prev(el,'Y',2).key==el.color)

						arrKill.push(this.prev(el,'Y',2));

		}

		if( this.next(el,'X',1) &&  !this.next(el,'X',1).dead &&  this.next(el,'X',1).key==el.color){

				arrKill.push(this.next(el,'X',1));

				if( this.next(el,'X',2)  && !this.next(el,'X',2).dead &&  this.next(el,'X',2).key==el.color)

						arrKill.push(this.next(el,'X',2));

		}

		if( this.prev(el,'X',1) && !this.prev(el,'X',1).dead &&  this.prev(el,'X',1).key==el.color){

				arrKill.push(this.prev(el,'X',1));

				if( this.prev(el,'X',2) && !this.prev(el,'X',2).dead &&  this.prev(el,'X',2).key==el.color)

						arrKill.push(this.prev(el,'X',2));

		}

		let finArr =[];
		const x =arrKill.filter((e)=>e.gridX==el.gridX)

		if(x.length>=2){
			finArr.push(...x,el)
		}

		const y =arrKill.filter((e)=>e.gridY==el.gridY)

		if(y.length>=2){
			finArr.push(...y,el)
		};

		return finArr

	}

	changeEl(el1,el2){

		this.arrGems[el2.gridX][el2.gridY]=el1;
		this.arrGems[el1.gridX][el1.gridY]=el2;

		[el1.gridX,el2.gridX]=[el2.gridX,el1.gridX];
		[el1.gridY,el2.gridY]=[el2.gridY,el1.gridY];
		[el1.posX,el2.posX]=[el2.posX,el1.posX];
		[el1.posY,el2.posY]=[el2.posY,el1.posY];

	}

	gravity() {

		// console.log('gravity')
		for (let i = 0; i < this.arrGems.length; i++) {

			for (let j = 0; j < this.arrGems[0].length; j++) {

				let currentGem = this.arrGems[i][j];
				let upThanCurrentGem = this.prev(currentGem, 'Y', 1);

				//  if the cell is empty & is there a previous cell & previous cell is not empty 
				if (currentGem.dead && upThanCurrentGem && !upThanCurrentGem.dead) {

					//swap
					this.changeEl(currentGem, upThanCurrentGem);

					//animation fall of gems
					this.game.add.tween(upThanCurrentGem).to({ y: upThanCurrentGem.posY }, 600, Phaser.Easing.Bounce.Out, true, 0, 0, false);

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

				this.game.add.tween( el ).to( {y:el.posY} , 1000 , Phaser.Easing.Bounce.Out , true , 0 , 0 , false )
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
				const arr = this.searchMatch( this.arrGems[i][j]);

				if( arr.length>0 ){

					this.killGems(arr)
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
		} );
		// arr.map( (e)=>e.dead=true );
		this.score += arr.length*10;
		this.textScore.setText(this.score);
	}

	next(gem,axis,step){

		if (axis=='X' && gem.gridY<7-step){

			return this.arrGems[gem.gridX][gem.gridY+step]

		} else if(axis=='Y' && gem.gridX<7-step){

			return this.arrGems[gem.gridX+step][gem.gridY]

		}

	}
	prev(gem,axis,step){

		if (axis=='X' && gem.gridY>step-1){

			return this.arrGems[gem.gridX][gem.gridY-step]

		} else if(axis=='Y' && gem.gridX>step-1){

			return this.arrGems[gem.gridX-step][gem.gridY]

		}

	}

	searchSecondActive(vector){

		this.waitSetActive = true;

		//find second active gem
		switch(vector) {
			case 'right':
				this.secondActive= this.next( this.firstActive,'X',1 );
				this.axis='x';
				break;
			case 'left':
				this.secondActive= this.prev( this.firstActive,'X',1 );
				this.axis='x';
				break;
			case 'up':
				this.secondActive= this.prev( this.firstActive,'Y',1 );
				this.axis='y';
				break;
			case 'down':
				this.secondActive= this.next( this.firstActive,'Y',1 );
				this.axis='y';
				break;
			default:
				null
		}
				//if second active gem null, animate 
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


			if(this.game.input.x>this.firstActive.x+40){

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

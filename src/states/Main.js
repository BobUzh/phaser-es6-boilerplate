class Main extends Phaser.State {

	create() {

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

		// count score
		this.score = 0;


		//permission is it possible to search for the second active
		this.canSwipe=false;

		//"return to starting position" for tween change of two active
		this.itsOk = false;

		//to assign a new first active
		this.waitSetActive=true;

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
		

		//create shadow and hide behint the screen
		this.shadow = this.game.add.image( -100 , -100 , 'shadow' );

		//types of gems
		this.typesGems = [ 'red' , 'blue' , 'green' , 'light-blue' , 'yellow' , 'pink' ];

		// create group gems
		this.gems = this.game.add.group();
		

		//init two changing gems
		this.firstActive = null;
		this.secondActive = null;

		//add img BIG DONUT in center
		const donut_W = this.game.cache.getImage( 'donut' ).width/2;
		const donut_H = this.game.cache.getImage( 'donut' ).height/2;
		const donut = this.game.add.image( centerX-donut_W , centerY-donut_H+100 , 'donut' );
		
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

	gameOver(){
		
		this.game.state.start("GameOver");
	}

	renderGems(){

		//step x-axis
		const stepRow = 104;
		//step y-axis
		const stepCol = 86;

		//random type selection
		const rnd = ()=>{
			return this.typesGems[Math.floor(Math.random()*this.typesGems.length)]
		}

		// create gems
		for (let i=0; i<this.arrGems.length; i++){

			for(let j=0; j<this.arrGems[0].length; j++){

				// 331 and 307 so that the coordinates get to the imaginary cell in the background img
				let gem = this.gems.create( 325+j*stepRow , 310+i*stepCol , rnd());

				//write the position in the matrix
				gem.gridX = i;
				gem.gridY = j;

				//write the position of the coordinates  on the screen
				gem.posX = gem.x;
				gem.posY = gem.y;

				//view or hide
				gem.dead=false;
				
				//small cosmetic 
				gem.scale.setTo( 1.1 , 1.1 );
				gem.anchor.set(0.5)

				// subscribe to two listeners
				gem.inputEnabled = true;
				gem.events.onInputDown.add( this.activeGem , this );
				gem.events.onInputUp.add( this.stopActiveGem , this );

				//write to the corresponding array gem
				this.arrGems[i][j]=gem;
			}
		}
		// run the search for the indentic color
		this.searchIdentic()
	}


	activeGem(e){

		if(!this.waitSetActive){

		this.firstActive = e;
		
		//can or not search second active gem
		this.canSwipe = true;
		// console.log(e)

		this.gems.bringToTop(e)

		//add s shadow under active gem
		this.shadow.x=e.position.x+7;
		this.shadow.y=e.position.y+7;
		this.shadow.scale.setTo(  1.2 , 1.2 );
		this.shadow.anchor.set(0.5);
		}

	
	}

	stopActiveGem(){
		this.canSwipe= false;

		//after the wrong move this.itsOk = true, set default false;
		this.itsOk = false;
	}

	changeGems(vector,axis){

		this.waitSetActive = true;

		//find second active gem
		if     	( vector=='right'  ){ this.secondActive= this.next( this.firstActive,'X',1 ) }
		else if	( vector=='left'   ){ this.secondActive= this.prev( this.firstActive,'X',1 ) }
		else if	( vector=='top'    ){ this.secondActive= this.prev( this.firstActive,'Y',1 ) }
		else if	( vector=='bottom' ){ this.secondActive= this.next( this.firstActive,'Y',1 ) }

		//if second active gem null, animate 
		if (!this.secondActive){ 

			this.game.add.tween( this.firstActive ).to( {x:this.firstActive.x+10}, 50 , Phaser.Easing.Linear.Out , true , 0 , 1 , true );

			this.firstActive = null;
			this.waitSetActive = false;

		 } else {

			//check for a match and return or not return the animation to original position
			this.checkMatch(this.firstActive,this.secondActive);

			let cssTweenTo = (name)=>{
				if(axis=='X'){ return name== 'first' ? {x:this.secondActive.posX} : {x:this.firstActive.posX} }
				if(axis=='Y'){ return name== 'first' ? {y:this.secondActive.posY} : {y:this.firstActive.posY} }
			}
			
			this.game.add.tween( this.firstActive ).to( cssTweenTo('first'), 200 , Phaser.Easing.Linear.Out , true , 0 , 0 , this.itsOk );

			this.game.add.tween( this.shadow ).to( cssTweenTo('first'), 200 , Phaser.Easing.Linear.Out , true , 0 , 0 , this.itsOk );

			this.game.add.tween( this.secondActive ).to( cssTweenTo('second'), 200 , Phaser.Easing.Linear.Out , true , 0 , 0 , this.itsOk );

			// setTimeout(()=>this.waitSetActive = false,this.itsOk?1000:500);
			// this.firstActive = null;
			// this.secondActive = null;
		}
	}

	searchSister(el){
		// console.log('sister')

		let arrKill = [];

		if( this.next(el,'Y',1) && !this.next(el,'Y',1).dead &&  this.next(el,'Y',1).key==el.key){ 

			arrKill.push(this.next(el,'Y',1));

			if( this.next(el,'Y',2) && !this.next(el,'Y',2).dead &&  this.next(el,'Y',2).key==el.key)

					arrKill.push(this.next(el,'Y',2));

					
		}
		if( this.prev(el,'Y',1) && !this.prev(el,'Y',1).dead &&  this.prev(el,'Y',1).key==el.key){

				arrKill.push(this.prev(el,'Y',1));

				if( this.prev(el,'Y',2) && !this.prev(el,'Y',2).dead &&  this.prev(el,'Y',2).key==el.key)

						arrKill.push(this.prev(el,'Y',2));

		}

		if( this.next(el,'X',1) &&  !this.next(el,'X',1).dead &&  this.next(el,'X',1).key==el.key){

				arrKill.push(this.next(el,'X',1));

				if( this.next(el,'X',2)  && !this.next(el,'X',2).dead &&  this.next(el,'X',2).key==el.key)

						arrKill.push(this.next(el,'X',2));

		}

		if( this.prev(el,'X',1) && !this.prev(el,'X',1).dead &&  this.prev(el,'X',1).key==el.key){

				arrKill.push(this.prev(el,'X',1));

				if( this.prev(el,'X',2) && !this.prev(el,'X',2).dead &&  this.prev(el,'X',2).key==el.key)

						arrKill.push(this.prev(el,'X',2));

		}

		let finArr =[];
		const x =arrKill.filter((e)=>e.gridX==el.gridX)

		if(x.length>=2){
			finArr.push(...x)
		}

		const y =arrKill.filter((e)=>e.gridY==el.gridY)

		if(y.length>=2){
			finArr.push(...y)
		};

		finArr.map((e)=>e.dead=true);

		return finArr

	}

	changeEl(el1,el2){

		this.arrGems[el2.gridX][el2.gridY]=el1;
		this.arrGems[el1.gridX][el1.gridY]=el2;

	}
	changeGrigAxis(el) {

		for (let i=0;i<this.arrGems.length;i++){
			const index = this.arrGems[i].indexOf(el);
			if(index>-1){
			el.gridX=i;
			el.gridY=index;
			el.posX= 325+index*104;
			el.posY= 310+i*86;
				break;
			}
		}
	}

	checkMatch(first,second){

	//looking for a match by the color of my opponent
	const s = second.key;
	const f = first.key;

	//change the key(color) in gems 
	second.key=f;
	first.key=s;
	
	const killArr1 = this.searchSister(second);
	const killArr2 = this.searchSister(first);

	// console.log(killArr1)
	// console.log(killArr2)

	if( !killArr1.length && !killArr2.length )	{
		second.key = s;
		first.key = f;
		this.waitSetActive=false;

		this.itsOk = true;
	}else {

			// wait for the end  animation of change active gems
			setTimeout(()=>{

				second.key = s;
				first.key = f;
				
				this.changeEl(first,second);
		
				this.changeGrigAxis(second);
				this.changeGrigAxis(first);
		


				// // [first,second]=[second,first]
				
				if(killArr1.length){
					// killArr1.map( (e)=> this.boom() );
					killArr1.map((e)=>e.kill());
					first.dead=true;
					first.kill();
					this.soundKill.play();
					this.score += killArr1.length*10;
					this.textScore.setText(this.score);
				}

				if(killArr2.length){
					// killArr2.map( (e)=> this.boom() );
					killArr2.map((e)=>e.kill());
					second.dead=true;
					second.kill();
					this.soundKill.play();
					this.score += killArr2.length*10;
					this.textScore.setText(this.score);
				}
				
				
				
				this.shadow.x=-100;
				this.shadow.y=-100;
				// console.log(this.arrGems)

				this.gravity();
			},200);
			// console.log('aaaaaaaaaaaaaaaaaaaaaaaa')

	}	


	}
	gravity(){

		// console.log('gravity')
		// this.waitSetActive=true;

		//empty cells
		let emptyCell=false;

		for( let i=0; i<this.arrGems.length; i++ ){

			for( let j=0; j<this.arrGems[0].length; j++ ){
				
				//if the cell is empty , change the value
				if( this.arrGems[i][j].dead ){

					emptyCell=true;
				}

				// -- if the cell is empty ---- is there a previous cell --------------- previous cell is not empty ----
				if( this.arrGems[i][j].dead && this.prev(this.arrGems[i][j],'Y',1) && !this.prev(this.arrGems[i][j],'Y',1).dead ){

					const deadGem = this.arrGems[i][j];
					const prevGem = this.prev( deadGem, 'Y' ,1 );

					//swap
					this.changeEl( deadGem , prevGem );

					//I rewrite the positioning in the matrix
					this.changeGrigAxis( prevGem );
					this.changeGrigAxis( deadGem );

					//animation fall of gems
					this.game.add.tween( prevGem ).to( {y:prevGem.posY} , 600 , Phaser.Easing.Bounce.Out , true , 0 , 0 , false );

					// i and j one step back
					i-=1;
					if(i==-1){i=0}
					j-=1;
					
				} 

				// start create new gems and search identic color 3Match
				if( emptyCell  && i==6 && j==6){
				// this.waitSetActive=false;
					
					this.newGems()

					//duration animation fall newGems 1000 , so start search identic color with a delay 1000+
					setTimeout(()=> this.searchIdentic(),1001 );
				}
			}
		}
	}


	newGems(){
		// console.log('new Gams')

		// generate random color
		const rnd = ()=>{
			return this.typesGems[Math.floor(Math.random()*this.typesGems.length)]
		}

		// if empty cell, new set color new coordinates and render
		this.arrGems.map( (e)=>e.map( (el)=>{
			
			if(el.dead){

				const color = rnd();
				el.loadTexture(color);
				el.dead=false;
				
				el.reset(el.posX,el.posY-200);

				this.game.add.tween( el ).to( {y:el.posY} , 1000 , Phaser.Easing.Bounce.Out , true , 0 , 0 , false )
			}
		} ) );

	}

	searchIdentic(){
		// console.log('dublicat')

		//are there or not matches?
		let identic = false;

		for( let i=this.arrGems.length-1; i>=0; i-- ){

			for( let j=this.arrGems[0].length-1; j>=0; j-- ){

				//looking if the same colors are nearby
				const arr = this.searchSister( this.arrGems[i][j] );

				if( arr.length>0 ){

					this.soundRndKill.play();
					arr.map( (e)=>e.kill() );
					this.arrGems[i][j].dead=true;
					this.arrGems[i][j].kill();

					identic=true;

					this.score += arr.length*10;
					this.textScore.setText(this.score);

				}
				if( identic && i==0 && j==0){ 

					//start gravity
					this.gravity() ;
					break
				}
			}
		}

		// console.log('gravity '+identic);
		if(!identic){ this.waitSetActive=false }
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

	searchSecondActive(){

		//check 4 directions and pass them
		if(this.firstActive && this.canSwipe){
			
			
			if(this.game.input.x>this.firstActive.x+40){

				this.canSwipe=false;
				this.changeGems('right','X');

			} else if(this.game.input.x<this.firstActive.x-40){

				this.canSwipe=false;
				this.changeGems('left','X');

			} else if(this.game.input.y>this.firstActive.y+40){

				this.canSwipe=false;
				this.changeGems('bottom','Y');

			} else if(this.game.input.y<this.firstActive.y-40){

				this.canSwipe=false;
				this.changeGems('top','Y');

			}
		}
		// console.log(this.game.input.x)
	}
	update() {
		
		this.searchSecondActive();
		
	}

}

export default Main;

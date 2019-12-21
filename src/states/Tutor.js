class Tutor extends Phaser.State {

	create() {

		//set background
		this.game.add.image(0,0,'background');

		// central coordinates
		const {centerX,centerY}=this.game.world;

		// add and centering logo
		const logo_W = this.game.cache.getImage( 'logo' ).width/2
        this.game.add.image( centerX-logo_W , 0 , 'logo' );

        //init hand image
        this.hand = this.game.add.image(100,100,'hand');
        this.hand.kill();

        //can or not swipe
        this.swipe=false;

        //active gem
        this.active=null;
        
        //tutorial arr
        this.arrTutor = [
			[ 'yellow' , 'red'        , 'light-blue' , 'yellow' , 'red'   , 'pink'       , 'pink'       ],
			[ 'pink'   , 'yellow'     , 'blue'       , 'green'  , 'green' , 'blue'       , 'light-blue' ],
			[ 'green'  , 'light-blue' , 'pink'       , 'blue'   , 'pink'  , 'blue'       , 'light-blue' ],
			[ 'yellow' , 'blue'       , 'light-blue' , 'pink'   , 'pink'  , 'light-blue' , 'blue'       ],
			[ 'green'  , 'green'      , 'pink'       , 'yellow' , 'green' , 'red'        , 'light-blue' ],
			[ 'blue'   , 'pink'       , 'green'      , 'red'    , 'pink'  , 'light-blue' , 'red'        ],
			[ 'pink'   , 'pink'       , 'blue'       , 'blue'   , 'red'   , 'green'      , 'light-blue' ]
        ];

        // create group gems
        this.gems = this.game.add.group();
        
        //render gems
        this.renderGems();

    }
    
    renderGems(){

		//step x-axis
		const stepRow = 104;
		//step y-axis
		const stepCol = 86;

		// create gems
		for (let i=0; i<this.arrTutor.length; i++){

			for(let j=0; j<this.arrTutor[0].length; j++){

				// 331 and 307 so that the coordinates get to the imaginary cell in the background img
				let gem = this.gems.create( 325+j*stepRow , 310+i*stepCol , this.arrTutor[i][j]);
				
				//small cosmetic 
				gem.scale.setTo( 1.1 , 1.1 );
                gem.anchor.set(0.5);
			}
		}
		this.verticalMatch();
    }
    
    verticalMatch(){

        //set the hand to the desired coordinates
        this.hand.reset(this.gems.children[24].x,this.gems.children[24].y);
        this.hand.bringToTop();

        //animation hand
        this.tweenHand=this.game.add.tween( this.hand).to({ x:  this.hand.x -104  }, 1000, Phaser.Easing.Linear.Out, true, 0, -1, false);

        //listen click
        this.gems.children[24].inputEnabled = true;
        this.gems.children[24].events.onInputDown.add( this.activeGem , this );

    }
    horizontalMatch(){

        //listen click
        this.gems.children[15].inputEnabled = true;
        this.gems.children[15].events.onInputDown.add( this.activeGem , this );

    }
    activeGem(e){

        this.swipe=true;
        this.active = e;
    }


	startGame() {
		this.game.state.start("Main");
    }

    swipeHorizontal(){

        this.gems.children[24].inputEnabled = false;

        //stop hand animation
        this.tweenHand.stop();
        this.hand.kill();

        this.swipe = false;

        //cahge two gem
        this.game.add.tween(this.gems.children[24]).to({ x: this.gems.children[24].x - 104 }, 200, Phaser.Easing.Linear.Out, true, 0, 0, false);
        this.game.add.tween(this.gems.children[23]).to({ x: this.gems.children[24].x }, 200, Phaser.Easing.Linear.Out, true, 0, 0, false);

        //kill Match 3
        setTimeout(()=>{
            this.gems.children[24].kill();
            this.gems.children[30].kill();
            this.gems.children[16].kill();

        },500);

        //gravitation
        setTimeout(()=>{
        this.game.add.tween(this.gems.children[2]).to({ y: this.gems.children[24].y }, 200, Phaser.Easing.Linear.Out, true, 0, 0, false);
        this.game.add.tween(this.gems.children[9]).to({ y: this.gems.children[30].y }, 200, Phaser.Easing.Linear.Out, true, 0, 0, false);
        },500);

        //reset killed gems
        setTimeout(()=>{
        this.gems.children[16].reset(this.gems.children[16].x, this.gems.children[16].y-172 );
        this.gems.children[24].loadTexture('blue');
        this.gems.children[24].reset(this.gems.children[24].x, this.gems.children[24].y-172 ,);
        this.gems.children[30].reset(this.gems.children[30].x, this.gems.children[30].y-172);
        },1000);
        
        // new hand animation
        setTimeout(()=>{

            this.hand.reset(this.gems.children[15].x,this.gems.children[15].y);
            this.tweenHand=this.game.add.tween(this.hand).to({ y:  this.hand.y +86  }, 1000, Phaser.Easing.Linear.Out, true, 0, -1, false);

        },1500);

        // start horizontal Match 3 
        setTimeout(()=>{this.horizontalMatch()},2000);
    }

    swipeVertical(){
        //stop hand animation
        this.tweenHand.stop();
        this.hand.kill();
        this.swipe = false;

        //change two gems
        this.game.add.tween(this.gems.children[15]).to({ y: this.gems.children[15].y +86 }, 200, Phaser.Easing.Linear.Out, true, 0, 0, false);
        this.game.add.tween(this.gems.children[22]).to({ y: this.gems.children[15].y }, 200, Phaser.Easing.Linear.Out, true, 0, 0, false);

        //kill Match 3
        setTimeout(()=>{
            this.gems.children[15].kill();
            this.gems.children[23].kill();
            this.gems.children[2].kill();

        },500);

        //gravitation
        setTimeout(()=>{
            this.game.add.tween(this.gems.children[3]).to({ y: this.gems.children[10].y }, 200, Phaser.Easing.Linear.Out, true, 0, 0, false);
            this.game.add.tween(this.gems.children[16]).to({ y: this.gems.children[10].y }, 200, Phaser.Easing.Linear.Out, true, 0, 0, false);
            this.game.add.tween(this.gems.children[1]).to({ y: this.gems.children[10].y }, 200, Phaser.Easing.Linear.Out, true, 0, 0, false);
            this.game.add.tween(this.gems.children[10]).to({ y: this.gems.children[17].y }, 200, Phaser.Easing.Linear.Out, true, 0, 0, false);
            this.game.add.tween(this.gems.children[8]).to({ y: this.gems.children[17].y }, 200, Phaser.Easing.Linear.Out, true, 0, 0, false);
            this.game.add.tween(this.gems.children[24]).to({ y: this.gems.children[17].y }, 200, Phaser.Easing.Linear.Out, true, 0, 0, false);
            this.game.add.tween(this.gems.children[22]).to({ y: this.gems.children[23].y }, 200, Phaser.Easing.Linear.Out, true, 0, 0, false);
            this.game.add.tween(this.gems.children[30]).to({ y: this.gems.children[23].y }, 200, Phaser.Easing.Linear.Out, true, 0, 0, false);
            this.game.add.tween(this.gems.children[17]).to({ y: this.gems.children[23].y }, 200, Phaser.Easing.Linear.Out, true, 0, 0, false);
        },500);

        //reset killed gems
        setTimeout(()=>{
            this.gems.children[15].loadTexture('pink');
            this.gems.children[15].reset(this.gems.children[0].x+104, this.gems.children[0].y );
            this.gems.children[23].reset(this.gems.children[0].x+208, this.gems.children[0].y );
            this.gems.children[2].reset(this.gems.children[0].x+312, this.gems.children[0].y);
        },1000);

        // button PLAY
        setTimeout(()=>{

            // add img btn "play" in center
            const btnPlay_W = this.game.cache.getImage( 'play' ).width/2
            const btnPlay = this.game.add.image( this.game.world.centerX-btnPlay_W , this.game.world.centerY , 'play' );

            // event click on btn
            btnPlay.inputEnabled = true;
            btnPlay.events.onInputDown.add( this.startGame , this );
        },1000)
    }
    
    update() {

        if (this.swipe && this.active==this.gems.children[24] && this.game.input.x < this.active.x - 40) {

            this.swipeHorizontal();
        }

        if (this.swipe && this.active==this.gems.children[15] && this.game.input.y > this.active.y + 40) {

            this.swipeVertical()

        }
    }

}

export default Tutor;

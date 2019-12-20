class GameOver extends Phaser.State {

	create() {

		//set background
		this.game.add.image(0,0,'background');

		// central coordinates
		const {centerX,centerY}=this.game.world;

		//add img big donut in center
		const donut_W = this.game.cache.getImage( 'donut' ).width/2
		const donut_H = this.game.cache.getImage( 'donut' ).height/2
		this.game.add.image( centerX-donut_W , centerY-donut_H+100 , 'donut' );

		//add section SCORE
		const score_W = this.game.cache.getImage( 'score' ).width/2;
		const score_H = this.game.cache.getImage( 'score' ).height/2;
		this.game.add.image( centerX-score_W , centerY , 'score' );

		//text score
		let score = this.game.cache.getText('score');
		this.game.add.text(  centerX-60 , centerY+score_H/2+7  , score ,  {fontSize:'90px' , fill:'#ffffff'} );

		// add and centering logo
		const logo_W = this.game.cache.getImage( 'logo' ).width/2
		this.game.add.image( centerX-logo_W , 0 , 'logo' );

		//add section timeUp
		this.game.add.image( centerX-donut_W+50 , centerY-donut_H+100 , 'timeUp' );

		//add img btn "play" in center
		const btnPlay_W = this.game.cache.getImage( 'play' ).width/2
		const btnPlay = this.game.add.image( centerX-btnPlay_W , centerY+200 , 'play' );

		// event click on btn
		btnPlay.inputEnabled = true;
		btnPlay.events.onInputDown.add( this.restartGame , this );

	}

	restartGame() {
		this.game.state.start("Main");
	}

}

export default GameOver;

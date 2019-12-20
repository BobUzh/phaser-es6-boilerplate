class GameTitle extends Phaser.State {

	create() {

		//set background
		this.game.add.image(0,0,'background');

		// central coordinates
		const {centerX,centerY}=this.game.world;

		// add and centering logo
		const logo_W = this.game.cache.getImage( 'logo' ).width/2
		this.game.add.image( centerX-logo_W , 0 , 'logo' );

		//add img big donut in center
		const donut_W = this.game.cache.getImage( 'donut' ).width/2
		const donut_H = this.game.cache.getImage( 'donut' ).height/2
		this.game.add.image( centerX-donut_W , centerY-donut_H+100 , 'donut' );

		//add img btn "play" in center
		const btnPlay_W = this.game.cache.getImage( 'play' ).width/2
		const btnPlay = this.game.add.image( centerX-btnPlay_W , centerY , 'play' );

		// event click on btn
		btnPlay.inputEnabled = true;
		btnPlay.events.onInputDown.add( this.startGame , this );

	}

	startGame() {
		this.game.state.start("Main");
	}

}

export default GameTitle;

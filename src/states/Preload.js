class Preload extends Phaser.State {

	preload() {

		// this.load.setBaseURL("https://bobuzh.github.io/phaser-test");
		
		this.game.load.image('background', 'assets/images/backgrounds/bg.jpg');
		this.game.load.image('donut', 'assets/images/donut.png');
		this.game.load.image('logo', 'assets/images/donuts_logo.png');
		this.game.load.image('play', 'assets/images/btn-play.png');
        this.game.load.image('score','assets/images/bg-score.png');
        this.game.load.image('sound','assets/images/btn-sfx.png');
        this.game.load.image('red','assets/images/game/gem-01.png');
        this.game.load.image('blue','assets/images/game/gem-02.png');
        this.game.load.image('green','assets/images/game/gem-03.png');
        this.game.load.image('light-blue','assets/images/game/gem-04.png');
        this.game.load.image('yellow','assets/images/game/gem-05.png');
        this.game.load.image('pink','assets/images/game/gem-06.png');
        this.game.load.image('shadow','assets/images/game/shadow.png');
        this.game.load.image('hand','assets/images/game/hand.png');
		this.game.load.image('timeUp','assets/images/text-timeup.png');
		
		this.game.load.audio('kill', 'assets/audio/kill.mp3');
		this.game.load.audio('rndKill', 'assets/audio/select-1.mp3');
		this.game.load.audio('backgroundSound', 'assets/audio/background.mp3');
	}

	create() {
		this.game.state.start("GameTitle");
	}

}

export default Preload;

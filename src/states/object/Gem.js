export default class Gem extends Phaser.Sprite{

    constructor(game,gridX,gridY,x,y,color){
        super(game,x,y,color);
        this.posX=x;
        this.posY=y; 
        this.color=color;

        this.gridX=gridX;
        this.gridY=gridY;
        this.dead = false;
        this.match = false;
    }
    
    setUp(){
		//small cosmetic 
      this.scale.setTo( 1.1 , 1.1 );
      this.anchor.set(0.5);
      this.inputEnabled = true;
    }
     canNotMove(){
        this.game.add.tween( this ).to( {x:this.posX+10}, 50 , Phaser.Easing.Linear.Out , true , 0 , 1 , true );
     }
     animationOnShift(axis,repeat){
        if( axis == 'y' ){

           this.game.add.tween( this ).to( {y:this.posY}, 200 , Phaser.Easing.Linear.Out , true , 0 , 0 , repeat )
        } else {

           this.game.add.tween( this ).to( {x:this.posX}, 200 , Phaser.Easing.Linear.Out , true , 0 , 0 , repeat )
        }
     }
}

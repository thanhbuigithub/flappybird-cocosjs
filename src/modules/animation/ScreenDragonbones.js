/**
 * Created by GSN on 7/9/2015.
 */

    const State = {
    Ready: 1,
    DeadFalling: -1,
    Play: 2,
    Dead: 3
}

var ScreenDragonbones = cc.Layer.extend({
    _itemMenu:null,
    _beginPos:0,
    isMouseDown:false,

    ctor:function() {
        this._super();
        var size = cc.director.getVisibleSize();
        this.pipesSpace = 150;
        this.minPosTopPipe = 200;
        this.maxPosTopPipe = 366;
        this.pipesSpeed = 3;
        this.gravity = -900;
        this.currentSpeed = 300;
        this.maxBirdJumpDistance = 50;
        this.currentPosition = 0;
        this.spawnPipesDelay = 60;
        this.spawnPipesIndex = 0;
        this.score = 0;

        this.bird ={size: {height: 24, width: 34}}

        this.pipe = {size: {height: 320, width: 52}}

        this.state = State.Ready;

        //var btnPlayIdle = gv.commonButton(200, 64, size.width - 120, size.height - 52,"Dead");
        //this.addChild(btnPlayIdle);
        //btnPlayIdle.addClickEventListener(this.startFly.bind(this));
        //
        //var btnTestFinishEvent = gv.commonButton(200, 64, size.width - 120, size.height - 136,"Test Finish Event");
        //btnTestFinishEvent.setTitleFontSize(26);
        //this.addChild(btnTestFinishEvent);
        //btnTestFinishEvent.addClickEventListener(this.testFinishAnimationEvent.bind(this));
        //
        //var btn_change_display = gv.commonButton(200, 64, size.width - 120, size.height - 220,"Change display");
        //btn_change_display.setTitleFontSize(28);
        //this.addChild(btn_change_display);
        //btn_change_display.addClickEventListener(this.testChangeDisplayOnBone.bind(this));
        //
        //var btn_test_load = gv.commonButton(200, 64, size.width - 120, size.height - 304,"Test load ani");
        //this.addChild(btn_test_load);
        //btn_test_load.addClickEventListener(this.testLoadAnimation.bind(this));
        //
        //var btnBack = gv.commonButton(100, 64, size.width - 70, 52,"Back");
        //this.addChild(btnBack);
        //btnBack.addClickEventListener(this.onSelectBack.bind(this));
        //
        //var btnJump = gv.commonButton(200, 64, size.width - 120, size.height - 136,"Jump");
        //this.addChild(btnJump);
        //btnJump.addClickEventListener(this.onSelectJump.bind(this));
        //
        //var btnPipes = gv.commonButton(200, 64, size.width - 120, size.height - 220,"Pipes");
        //this.addChild(btnPipes);
        //btnPipes.addClickEventListener(this.spawnPipes.bind(this));

        //var xPos = (size.width - 220)/2;
        //this.lblLog = gv.commonText(fr.Localization.text("..."), xPos, size.height*0.2);
        //this.addChild(this.lblLog);

        this.nodeAnimation = new cc.Node();
        this.nodeAnimation.setPosition(size.width*0.5, size.height*0.5);
		//this.nodeAnimation.setScaleX(-1);
        this.addChild(this.nodeAnimation);

        this.size = size;
        this.pipesGroup = [];
        this.character = null;
        //this.lblResult = new cc.LabelBMFont("",res.FONT_BITMAP_DICE_NUMBER);
        //
        //this.lblResult.setAnchorPoint(0.5,0.5);
        //this.lblResult.retain();

        this.lblScore = new cc.LabelBMFont("0",res.FONT_BITMAP_SCORE);
        this.lblScore.setLocalZOrder(10);
        this.lblScore.setScale(0.5);
        this.lblScore.y = 200;
        this.lblScore.setAnchorPoint(0.5,0.5);
        this.lblScore.retain();

        this.background = fr.createAnimationById(resAniId.background,this);
        this.nodeAnimation.addChild(this.background);
        this.background.getAnimation().gotoAndPlay("background_0_",0);
        this.background.size = {height: 512, width: 288};

        this.base = fr.createAnimationById(resAniId.background,this);
        this.nodeAnimation.addChild(this.base);
        this.base.getAnimation().gotoAndPlay("base_0_",0);
        this.base.setLocalZOrder(10);
        //this.base.runAction(cc.ScaleTo(0,288/336,1));
        this.base.size = {height: 112, width: 336};
        this.base.y = -this.background.size.height/2+this.base.size.height/2;
        this.base.x = (this.base.size.width-this.background.size.width)*0.5;

        this.nextBase = fr.createAnimationById(resAniId.background,this);
        this.nodeAnimation.addChild(this.nextBase);
        this.nextBase.getAnimation().gotoAndPlay("base_0_",0);
        this.nextBase.setLocalZOrder(10);
        //this.base.runAction(cc.ScaleTo(0,288/336,1));
        this.nextBase.size = {height: 112, width: 336};
        this.nextBase.y = -this.background.size.height/2+this.base.size.height/2;
        this.nextBase.x = this.base.size.width;

        this.message = fr.createAnimationById(resAniId.background,this);
        this.message.getAnimation().gotoAndPlay("message_0_",0);
        this.message.setLocalZOrder(11);

        this.gameover = fr.createAnimationById(resAniId.background,this);
        this.gameover.getAnimation().gotoAndPlay("gameover_0_",0);
        this.gameover.setLocalZOrder(20);
        this.gameover.retain();
        //this.scoreLable = new cc.LabelBMFont(this.scoreLable, );
        //this.scoreLable.string = this.score;
        //this.nodeAnimation.addChild(this.scoreLable);

        this.nodeAnimation.addChild(this.lblScore);

        this.startFly();

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan,
        }, this);


    },
    onTouchBegan: function(touch, event){
        var tar = event.getCurrentTarget();
        if (tar.state === State.Ready || tar.state === State.Play){
            tar.onSelectJump()
        }
        if (tar.state === State.Dead) tar.startFly();
        return false;
    },
    onEnter:function(){
        this._super();
    },
    onRemoved:function()
    {
        fr.unloadAllAnimationData(this);
    },
    updateTest:function(dt)
    {
        this.nodeAnimation.setScale(0.5);
        this.nodeAnimation.runAction(cc.scaleTo(0.5, 1.0).easing(cc.easeBounceOut()));
    },
    onSelectBack:function(sender)
    {
        fr.view(ScreenMenu);
    },
    update: function(dt){
        if(this.state === State.DeadFalling) {
            //this.unscheduleUpdate();
            this.dead();
            return;
        }

        if(this.state === State.Dead) return;

        this.scrollBase();

        if(this.state === State.Ready) return;

        this._updatePosition(dt);

        this.spawnPipesIndex += 1;
        if (this.spawnPipesIndex>=this.spawnPipesDelay) {
            this.spawnPipes();
            this.spawnPipesIndex=0;
        }

        for(var i=0;i<this.pipesGroup.length;i++){
            this.pipesGroup[i].pipes[0].x -= this.pipesSpeed;
            this.pipesGroup[i].pipes[1].x -= this.pipesSpeed;
            if(this.pipesGroup[i].flag===false && this.character.x >= this.pipesGroup[i].pipes[0].x) {
                this.gainScore();
                this.pipesGroup[i].flag = true;
            }
                if (this.pipesGroup[i].pipes[0].x < -170) {
                this.removePipes(i);
                this.pipesGroup.splice(i,1);
            }
        }


        this.detectCollision();
    },
    _updatePosition: function(dt){
        if(this.character.y >= this.currentPosition+this.maxBirdJumpDistance) {
            this.currentSpeed = -0.5 * dt * this.gravity;
            this.currentPosition = this.character.y;
        }

        if(this.character.y <= this.currentPosition-this.maxBirdJumpDistance) {
            this.fall();
            this.currentPosition = this.character.y;
        }

        var distance = this.currentSpeed*dt + 0.5*dt*dt*this.gravity;
        this.character.y += distance;
        this.currentSpeed += this.gravity*dt;
    },
    gainScore: function(){
        this.score++;
        //this.lblScore.removeFromParent();
        this.lblScore.setString(this.score.toString());
        this.lblScore.retain()
    },
    scrollBase: function(){
        this.base.x-=3;
        this.nextBase.x-=3;
        if (this.base.x <= -this.base.size.width*0.5-this.background.size.width*0.5)
            this.base.x = this.base.size.width;
        if (this.nextBase.x <= -this.nextBase.size.width*0.5-this.background.size.width*0.5)
            this.nextBase.x = this.nextBase.size.width;
    },
    detectCollision: function(){
        const top_bird = this.character.y + this.bird.size.height/2;
        const bottom_bird = this.character.y - this.bird.size.height/2;
        const left_bird = this.character.x - this.bird.size.width/2;
        const right_bird = this.character.x + this.bird.size.width/2;

        if (top_bird >= this.background.size.height/2 || bottom_bird <= -this.background.size.height/2+this.base.size.height) {
            this.setDeadState();
            return;
        }

        //pipe
        for(var i=0;i<this.pipesGroup.length;i++){
            const top = this.pipesGroup[i].pipes[0].y - this.pipe.size.height/2;
            const bottom = this.pipesGroup[i].pipes[1].y + this.pipe.size.height/2;
            const left = this.pipesGroup[i].pipes[0].x - this.pipe.size.width/2;
            const right = this.pipesGroup[i].pipes[0].x + this.pipe.size.width/2;

            if (left_bird>right || right_bird < left) continue;
            else if (top_bird<top && bottom_bird>bottom) continue;
            else this.setDeadState();
        }
    },
    setDeadState: function(){
        this.state = State.DeadFalling;
        this.character.stopAllActions();
        this.character.getAnimation().gotoAndPlay("idle_0_",0);
        this.fall();
        this.nodeAnimation.addChild(this.gameover);
        this.character.setLocalZOrder(3);
    },
    onSelectJump: function(){
        if(this.state === State.DeadFalling) return;

        this.message.retain();
        this.message.removeFromParent(false);

        this.currentPosition = this.character.y;
        this.currentSpeed = 600;
        this.state = State.Play;
        this.character.getAnimation().gotoAndPlay("bird_0_",0,-1,1000);
        //this.character.stopAllActions();
        //var jump = cc.moveBy(0.1, cc.p(0,50));
        var rise = cc.rotateTo(0.1, -30).easing(cc.easeCubicActionOut());
        //this.character.runAction(jump);
        this.character.runAction(rise);
    },
    fall: function(){
        this.character.runAction(cc.rotateTo(0.1, 90).easing(cc.easeCubicActionOut()));
    },
    dead: function(){
        if(this.character.y-this.bird.size.width/2 > -this.background.size.height/2 + this.base.size.height)
            this.character.y-=6;
        else this.state = State.Dead;
    },
    //testAnimationBinding:function()
    //{
    //    if(this.character)
    //        this.character.removeFromParent();
    //    this.character = fr.createAnimationById(resAniId.chipu,this);
    //    this.nodeAnimation.addChild(this.character);
    //    this.character.setPosition(cc.p(0,0));
    //    this.character.setScale(2);
    //    this.character.getAnimation().gotoAndPlay("win_0_",-1,-1,1);
    //    this.character.setCompleteListener(function () {
    //        this.testAnimationBinding();
    //    }.bind(this));
    //
    //},
    startFly:function()
    {
        if(this.character)
            this.character.removeFromParent(true);
        if(this.pipesGroup.length > 0)
            for(var i=0;i<this.pipesGroup.length;i++){
                this.removePipes(i)
            }
        this.pipesGroup=[];
        this.state = State.Ready;
        this.reset();

        this.gameover.retain();
        this.gameover.removeFromParent(false);
        this.nodeAnimation.addChild(this.message);
        this.character = fr.createAnimationById(resAniId.bird,this);
        //doi mau, yeu cau phai co file shader, nhung bone co ten bat dau tu color_ se bi doi mau
        this.character.setBaseColor(255,255,0);
        //chinh toc do play animation
        this.character.getAnimation().setTimeScale(0.5);
        this.character.y = this.base.size.height/2;
        this.character.setLocalZOrder(1);
        //this.bird.size = JSON.stringify(this.character.getBoundingBox());
        this.nodeAnimation.addChild(this.character);
        //play animation gotoAndPlay(animationName, fadeInTime, duration, playTimes)
        this.character.getAnimation().gotoAndPlay("bird_0_",0,-1,1000);

        this.scheduleUpdate();
    },
    spawnPipes: function() {
        if(this.state !== State.Play) return;

        var topPipe = fr.createAnimationById(resAniId.pipe,this);
        topPipe.x=170;
        topPipe.y=Math.round(Math.random()*(this.maxPosTopPipe-this.minPosTopPipe) + this.minPosTopPipe);
        topPipe.setLocalZOrder(2);
        var botPipe = fr.createAnimationById(resAniId.pipe,this);
        botPipe.x=170;
        botPipe.y=topPipe.y-320-this.pipesSpace;
        botPipe.setLocalZOrder(2);
        //doi mau, yeu cau phai co file shader, nhung bone co ten bat dau tu color_ se bi doi mau
        //this.pipe.setBaseColor(255,255,0);
        //chinh toc do play animation
        //this.pipe.getAnimation().setTimeScale(0.5);

        this.nodeAnimation.addChild(topPipe);
        this.nodeAnimation.addChild(botPipe);

        //play animation gotoAndPlay(animationName, fadeInTime, duration, playTimes)
        topPipe.getAnimation().gotoAndPlay("pipe_0_",-1);
        topPipe.runAction(cc.rotateTo(0,180))
        botPipe.getAnimation().gotoAndPlay("pipe_0_",-1);

        this.pipesGroup.push({pipes:[topPipe, botPipe],flag: false});

        var index = this.pipesGroup.length - 1;
        //this.movePipes(index)

        //var movePipes = function(){
        //    if (this.state === State.DeadFalling) return;
        //
        //    if (topPipe.x < -170) {
        //        this.removePipes(index);
        //        this.unscheduleUpdate();
        //        return;
        //    }
        //    topPipe.x -= 1;
        //    botPipe.x -= 1;
        //    //var move = cc.moveTo(this.pipesSpeed,-170,pipe.y);
        //    //pipe.runAction(cc.sequence(move,cc.callFunc(function(){this.removePipes(index)}.bind(this),this)));
        //}.bind(this);

        //this.schedule(movePipes, 0.005);
    },
    reset: function(){
        this.currentSpeed = 300;
        this.score = 0;
        this.lblScore.setString(this.score.toString());
        this.lblScore.retain()
    },
    movePipes: function(index){
        //if (this.pipesGroup[index][0].x < -170)
        //    this.unschedule(this.move)
        //
        //this.pipesGroup[index][0].x += 1;
        //this.pipesGroup[index][1].x += 1;
        this.pipesGroup[index].pipes.forEach(function(pipe){
            var move = cc.moveTo(this.pipesSpeed,-170,pipe.y);
            pipe.runAction(cc.sequence(move,cc.callFunc(function(){this.removePipes(index)}.bind(this),this)));
        }.bind(this))
    },
    removePipes: function(index){
        this.pipesGroup[index].pipes.forEach(function(pipe) {
            //pipe.removeFromParent(true);
            pipe.runAction(cc.removeSelf(true));
        }.bind(this))
    }
    //testFinishAnimationEvent:function()
    //{
    //    if(this.character)
    //        this.character.removeFromParent();
    //    this.character = fr.createAnimationById(resAniId.chipu,this);
    //    this.nodeAnimation.addChild(this.character);
    //    this.character.getAnimation().gotoAndPlay("win_0_",-1,-1,1);
    //    this.character.setCompleteListener(this.onFinishAnimations.bind(this));
    //},
    //testChangeDisplayOnBone:function()
    //{
    //    if(this.character)
    //        this.character.removeFromParent();
    //    this.character = fr.createAnimationById(resAniId.eff_dice_number,this);
    //    this.nodeAnimation.addChild(this.character);
    //    this.lblResult.removeFromParent();
    //    this.character.getArmature().getCCSlot("2").setDisplayImage(this.lblResult);
    //    var number = 2 + cc.random0To1()*10;
    //    this.lblResult.setString(Math.floor(number).toString());
    //    this.lblResult.retain();
    //    this.character.getAnimation().gotoAndPlay("run",0);
    //
    //},
    //testLoadAnimation:function()
    //{
    //    var testCount = 100;
    //    var start = Date.now();
    //
    //    for(var i = 0; i< testCount; i++)
    //    {
    //        var ani  = fr.createAnimationById(resAniId.firework_test,this);
    //        this.addChild(ani);
    //        ani.setPosition(cc.random0To1()*cc.winSize.width, cc.random0To1()*cc.winSize.height);
    //        ani.getAnimation().gotoAndPlay("run",cc.random0To1()*5,-1,1);
    //        ani.setCompleteListener(this.onFinishEffect.bind(this));
    //    }
    //    var end = Date.now();
    //    cc.log("time: " + (end - start));
    //    this.lblLog.setString("time: " + (end - start));
    //},
    //
    //onFinishAnimations:function()
    //{
    //    this.character.getAnimation().gotoAndPlay("idle_0_",0);
    //},
    //onFinishEffect:function(animation)
    //{
    //    animation.removeFromParent();
    //}

});
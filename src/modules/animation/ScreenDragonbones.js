/**
 * Created by GSN on 7/9/2015.
 */

    const State = {
    Ready: 1,
    Dead: -1
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
        this.spawnPipesSpeed = 1;
        this.pipesSpeed = 2;
        this.dt = 0;

        this.bird ={size: {height: 24, width: 34}}

        this.pipe = {size: {height: 320, width: 52}}

        this.state = State.Ready;

        var btnPlayIdle = gv.commonButton(200, 64, size.width - 120, size.height - 52,"Idle");
        this.addChild(btnPlayIdle);
        btnPlayIdle.addClickEventListener(this.testPlayAnimation.bind(this));
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

        var btnJump = gv.commonButton(200, 64, size.width - 120, size.height - 136,"Jump");
        this.addChild(btnJump);
        btnJump.addClickEventListener(this.onSelectJump.bind(this));

        var btnPipes = gv.commonButton(200, 64, size.width - 120, size.height - 220,"Pipes");
        this.addChild(btnPipes);
        btnPipes.addClickEventListener(this.spawnPipes.bind(this));

        var xPos = (size.width - 220)/2;
        this.lblLog = gv.commonText(fr.Localization.text("..."), xPos, size.height*0.2);
        this.addChild(this.lblLog);

        this.nodeAnimation = new cc.Node();
        this.nodeAnimation.setPosition(xPos, size.height*0.5);
		this.nodeAnimation.setScaleX(-1);
        this.addChild(this.nodeAnimation);

        this.size = size;
        this.pipesGroup = [];
        this.character = null;
        this.lblResult = new cc.LabelBMFont("",res.FONT_BITMAP_DICE_NUMBER);

        this.lblResult.setAnchorPoint(0.5,0.5);
        this.lblResult.retain();

        this.background = fr.createAnimationById(resAniId.background,this);
        this.nodeAnimation.addChild(this.background);
        this.background.getAnimation().gotoAndPlay("background_0_",0);
        this.background.size = {height: 512, width: 288}

        this.base = fr.createAnimationById(resAniId.background,this);
        this.nodeAnimation.addChild(this.base);
        this.base.getAnimation().gotoAndPlay("base_0_",0);
        this.base.setLocalZOrder(10);
        this.base.y = -256+56;
        this.base.runAction(cc.ScaleTo(0,288/336,1));
        this.base.size = {height: 112, width: 336}

        this.testPlayAnimation();
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
    update: function(){
        if(this.state === State.Dead) this.unscheduleUpdate();

        this.character.y -= 2;

        //this.dt += 0.2;

        for(var i=0;i<this.pipesGroup.length;i++){
            this.pipesGroup[i][0].x -= 3;
            this.pipesGroup[i][1].x -= 3;
            if (this.pipesGroup[i][0].x < -170) {
                this.removePipes(i);
                this.pipesGroup.splice(i,1);
            }
        }

        this.detectCollision();
    },
    detectCollision: function(){
        //cc.log(this.character.getRotation());
        const top_bird = this.character.y + this.bird.size.height/2;
        const bottom_bird = this.character.y - this.bird.size.height/2;
        const left_bird = this.character.x - this.bird.size.width/2;
        const right_bird = this.character.x + this.bird.size.width/2;

        if (top_bird >= this.background.size.height/2 || bottom_bird <= -this.background.size.height/2+this.base.size.height) {
            this.state = State.Dead;
        }

        //pipe
        for(var i=0;i<this.pipesGroup.length;i++){
            const top = this.pipesGroup[i][0].y - this.pipe.size.height/2;
            const bottom = this.pipesGroup[i][1].y + this.pipe.size.height/2;
            const left = this.pipesGroup[i][0].x - this.pipe.size.width/2;
            const right = this.pipesGroup[i][0].x + this.pipe.size.width/2;

            if (left_bird>right || right_bird < left) continue;
            else if (top_bird<top && bottom_bird>bottom) continue;
            else this.state = State.Dead;
        }
    },
    onSelectJump: function(){
        if(this.state === State.Dead) return;

        //this.dt = 0;
        this.character.stopAllActions();
        var jump = cc.moveBy(0.1, cc.p(0,50));
        var rise = cc.rotateTo(0.1, -30).easing(cc.easeCubicActionOut());
        this.character.runAction(jump);
        this.character.runAction(cc.sequence( rise, cc.callFunc(this.fall,this) ));
    },
    fall: function(){
        this.character.runAction(cc.rotateTo(0.2, 30).easing(cc.easeCubicActionOut()));
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
    testPlayAnimation:function()
    {
        if(this.character)
            this.character.removeFromParent(true);
        if(this.pipesGroup.length > 0)
            for(var i=0;i<this.pipesGroup.length;i++){
                this.removePipes(i)
            }
        this.pipesGroup=[];
        this.state = State.Ready;

        this.character = fr.createAnimationById(resAniId.bird,this);
        //doi mau, yeu cau phai co file shader, nhung bone co ten bat dau tu color_ se bi doi mau
        this.character.setBaseColor(255,255,0);
        //chinh toc do play animation
        this.character.getAnimation().setTimeScale(0.5);
        this.character.y = this.base.size.height/2;
        this.nodeAnimation.addChild(this.character);
        //play animation gotoAndPlay(animationName, fadeInTime, duration, playTimes)
        this.character.getAnimation().gotoAndPlay("bird_0_",0);

        this.scheduleUpdate();
        this.schedule(this.spawnPipes, this.spawnPipesSpeed);
    },
    spawnPipes: function() {
        if(this.state === State.Dead) return;

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

        this.pipesGroup.push([topPipe, botPipe]);

        var index = this.pipesGroup.length - 1;
        //this.movePipes(index)

        //var movePipes = function(){
        //    if (this.state === State.Dead) return;
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
    movePipes: function(index){
        //if (this.pipesGroup[index][0].x < -170)
        //    this.unschedule(this.move)
        //
        //this.pipesGroup[index][0].x += 1;
        //this.pipesGroup[index][1].x += 1;
        this.pipesGroup[index].forEach(function(pipe){
            var move = cc.moveTo(this.pipesSpeed,-170,pipe.y);
            pipe.runAction(cc.sequence(move,cc.callFunc(function(){this.removePipes(index)}.bind(this),this)));
        }.bind(this))
    },
    removePipes: function(index){
        this.pipesGroup[index].forEach(function(pipe) {
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
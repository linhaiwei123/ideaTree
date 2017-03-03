cc.Class({
    extends: cc.Component,

    editor: {
        //executeInEditMode: true,
    },

    properties: {
        //地图加载
        _testGroundData: null, //地图原始逻辑数据
        _testMap: null,  //地图原始绑定数据
        _mapSize: cc.Size.ZERO, //地图大小
        _viewPort: cc.Size.ZERO, //地图视口大小
        _mapLayer: null,   //地图原始逻辑数据中数组数据 (一维)
        _startPos: cc.Vec2.ZERO, //地图开始位置
        _convertedBindData: [], //地图数组逻辑数据和渲染数据的映射
        _atlasData: null, //渲染图集
        mapContent: cc.Node,  //地图容器

        //移动控制
        _isMoving: false,
        _moveDirection: null,
        moveDuration: 500, //毫秒
        _startMoveTime: null,
        _startPosition: null,
        _currentCenterPos: null,
        _isEdge: null,
    },

    
    onLoad: function () {
        this._testGroundData = require("testGroundData");
        this._testMap = require("testMap");
        console.log(this._testGroundData);
        console.log(this._testMap);

        //获取地图大小
        
        this._mapSize.width = this._testGroundData.width;
        this._mapSize.height = this._testGroundData.height;
        //获取地图逻辑数据
        this._mapLayer = this._testGroundData.layers[0].data;
        //获取视口大小
        
        this._viewPort.width = 13;
        this._viewPort.height = 9;
        //获取入口位置
        
        this._startPos.x = 10;
        this._startPos.y = 10;
        //获取绑定数据
        
        let originBindData = this._testMap.plist.dict.dict[0].key;
        for(let i = 0,l = originBindData.length; i < l; i++){
            this._convertedBindData[l - i] = originBindData[i].split(".")[0];
        }
        console.log(this._convertedBindData);
        //获取渲染数据
        //this._atlasData = null;
        cc.loader.loadRes("mapImg/test",cc.SpriteAtlas,function(err,src){
            this._atlasData = src;
            console.log(this._atlasData);
            this.render();
        }.bind(this));
        //渲染
        //外部渲染


        //添加移动监听
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        //初始化中央瓦片位置
        this._currentCenterPos = new cc.Vec2(this._startPos);
    },

    render: function(){
        //结合开始位置和视口大小 计算出需要渲染的id,和渲染的位置
        let leftUpPos = cc.Vec2.ZERO;
            leftUpPos.x = this._startPos.x - Math.floor(this._viewPort.width / 2);
            leftUpPos.y = this._startPos.y - Math.floor(this._viewPort.height / 2);
        let rightDownPos = cc.Vec2.ZERO;
            rightDownPos.x = this._startPos.x + Math.floor(this._viewPort.width / 2);
            rightDownPos.y = this._startPos.y + Math.floor(this._viewPort.height / 2);
        
        //绘制
        for(let yIdx = leftUpPos.y; yIdx <= rightDownPos.y; yIdx++){
            for(let xIdx = leftUpPos.x; xIdx <= rightDownPos.x; xIdx++){
                let groundTile = new cc.Node();
                this.mapContent.addChild(groundTile);
                groundTile.name = 'tile#' + xIdx + '#' + yIdx;
                let offset = cc.Vec2.ZERO;
                    offset.x = xIdx - Math.floor(this._mapSize.width / 2);
                    offset.y = -(yIdx - Math.floor(this._mapSize.height / 2));
                let offsetInPixel = cc.Vec2.ZERO;
                    offsetInPixel.x = offset.x * 70;//tile width
                    offsetInPixel.y = offset.y * 70;//tile height
                groundTile.position = offsetInPixel;

                let groundTileSpriteComp = groundTile.addComponent(cc.Sprite);
                let idxInMapData = yIdx * this._mapSize.width + xIdx;
                console.log(this._mapLayer[idxInMapData]);
                let tileSpriteFrame = this._atlasData.getSpriteFrame(this._convertedBindData[this._mapLayer[idxInMapData]]);
                groundTileSpriteComp.spriteFrame = tileSpriteFrame;

                //测试 开始位置设为红色
                // if(xIdx === this._startPos.x && yIdx === this._startPos.y){
                //     groundTile.color = cc.Color.RED;
                // }
            }
        }
        //console.log(this.mapContent.children[0]);

        //将地图依据开始位置定位到屏幕中央
        let startTile = this.mapContent.getChildByName('tile#' + this._startPos.x + "#" + this._startPos.y);
        let startTileWorldPosition = this.mapContent.convertToWorldSpaceAR(startTile.position);
        let mapStartPositionOfView = this.mapContent.parent.convertToNodeSpaceAR(startTileWorldPosition);
        this.mapContent.position = cc.pNeg(mapStartPositionOfView);
    },

    //添加移动回调
    onKeyDown: function(e){
        //判断是否正在移动
        if(this._isMoving)return;
        this._isMoving = true;
        //判断按键 更新中央瓦片位置
        switch(e.keyCode){
            case cc.KEY.w: this._moveDirection = 'up';this._currentCenterPos.y += -1;break;
            case cc.KEY.s: this._moveDirection = 'down';this._currentCenterPos.y += 1;break;
            case cc.KEY.a: this._moveDirection = 'left';this._currentCenterPos.x += -1;break;
            case cc.KEY.d: this._moveDirection = 'right';this._currentCenterPos.x += 1;break;
        }
        //设置移动开始时间
        this._startMoveTime = Date.now();
        //设置移动开始位置
        this._startPosition = this.mapContent.position;
        //移动地图
        //外部移动

        //修改边界瓦片
        this.reLoadEdgeTiles();
    },

    reLoadEdgeTiles: function(){
        //根据 当前块  移动方向 和视口 起始位置 终结位置 偏移位置
        let moveStartPosition = cc.Vec2.ZERO;
        let moveEndPosition = cc.Vec2.ZERO;
        let moveOffset = cc.Vec2.ZERO;
        switch(this._moveDirection){
            case 'left': {
                moveStartPosition = cc.pAdd(cc.pAdd(this._currentCenterPos,cc.v2(1,0)), cc.v2(Math.floor(this._viewPort.width / 2), - Math.floor(this._viewPort.height / 2)));
                moveEndPosition = cc.pAdd(cc.pAdd(this._currentCenterPos,cc.v2(1,0)), cc.v2(Math.floor(this._viewPort.width / 2), Math.floor(this._viewPort.height / 2)));
                moveOffset = cc.v2( - this._viewPort.width,0);
                break;}
            case 'right': {
                moveStartPosition = cc.pAdd(cc.pAdd(this._currentCenterPos,cc.v2(-1,0)), cc.v2(- Math.floor(this._viewPort.width / 2), - Math.floor(this._viewPort.height / 2)));
                moveEndPosition = cc.pAdd(cc.pAdd(this._currentCenterPos,cc.v2(-1,0)), cc.v2(- Math.floor(this._viewPort.width / 2),  Math.floor(this._viewPort.height / 2)));
                moveOffset = cc.v2( this._viewPort.width,0);
                break;}
            case 'up': {
                moveStartPosition = cc.pAdd(cc.pAdd(this._currentCenterPos,cc.v2(0,1)), cc.v2(- Math.floor(this._viewPort.width / 2), Math.floor(this._viewPort.height / 2)));
                moveEndPosition = cc.pAdd(cc.pAdd(this._currentCenterPos,cc.v2(0,1)), cc.v2(Math.floor(this._viewPort.width / 2), Math.floor(this._viewPort.height / 2)));
                moveOffset = cc.v2(0,- this._viewPort.height);
                break;}
            case 'down': {
                moveStartPosition = cc.pAdd(cc.pAdd(this._currentCenterPos,cc.v2(0,-1)), cc.v2(- Math.floor(this._viewPort.width / 2), - Math.floor(this._viewPort.height / 2)));
                moveEndPosition = cc.pAdd(cc.pAdd(this._currentCenterPos,cc.v2(0,-1)), cc.v2(Math.floor(this._viewPort.width / 2), - Math.floor(this._viewPort.height / 2)));
                moveOffset = cc.v2(0,this._viewPort.height);
                break;}
        }

        //移动他们 并更新他们的名字 和 上面的纹理
        for(let xIdx = moveStartPosition.x;xIdx <= moveEndPosition.x; xIdx++){
            for(let yIdx = moveStartPosition.y ; yIdx <= moveEndPosition.y; yIdx++){
                let tile = this.mapContent.getChildByName("tile#" + xIdx + "#" + yIdx);
                let newPositionInPixel = cc.pAdd(tile.position,cc.pMult(cc.v2(moveOffset.x,-moveOffset.y),70));
                tile.position = newPositionInPixel;
                console.log(tile.position);
                let tilePosInfoArray = tile.name.split("#");
                let tileNewXIdx = parseInt(tilePosInfoArray[1]) + moveOffset.x;
                let tileNewYIdx = parseInt(tilePosInfoArray[2]) + moveOffset.y;
                tile.name = "tile#" + tileNewXIdx + "#" + tileNewYIdx;

                let groundTileSpriteComp = tile.getComponent(cc.Sprite);
                let tileSpriteFrame = this._atlasData.getSpriteFrame("ground");
                //边界纹理测试
                if(tileNewXIdx >= 0 && tileNewXIdx < this._mapSize.width && tileNewYIdx >= 0 && tileNewYIdx < this._mapSize.height){
                    let idxInMapData = tileNewYIdx * this._mapSize.width + tileNewXIdx;
                    //console.log(this._mapLayer[idxInMapData]);
                    tileSpriteFrame = this._atlasData.getSpriteFrame(this._convertedBindData[this._mapLayer[idxInMapData]]);
                }
                groundTileSpriteComp.spriteFrame = tileSpriteFrame;
            }
        }

    },

    lateUpdate: function(){
        if(this._isMoving){
            let moveNormalVector = cc.Vec2.ZERO;
            switch(this._moveDirection){
                case 'up': moveNormalVector = cc.v2(0,-1);break;
                case 'down': moveNormalVector = cc.v2(0,1);break;
                case 'left': moveNormalVector = cc.v2(1,0);break;
                case 'right': moveNormalVector = cc.v2(-1,0);break;
            }
            //console.log(Date.now() - this._startMoveTime);
            let moveDeltaNormalDistance = (Date.now() - this._startMoveTime)/this.moveDuration;
            if(moveDeltaNormalDistance >= 1){//逻辑上移动过头了 进行最后一次的原地绘制 然后离开移动的状态
                moveDeltaNormalDistance = 1;
                this._isMoving = false;
            }
            let moveDeltaVector = cc.pMult(moveNormalVector,moveDeltaNormalDistance * 70);
            this.mapContent.position = cc.pAdd(this._startPosition,moveDeltaVector);
        }

    }
    
});

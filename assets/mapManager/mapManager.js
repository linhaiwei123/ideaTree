cc.Class({
    extends: cc.Component,

    editor: {
        //executeInEditMode: true,
    },

    properties: {
        _testGroundData: null,
        _testMap: null,
        _mapSize: cc.Size.ZERO,
        _viewPort: cc.Size.ZERO,
        _mapLayer: null,
        _startPos: cc.Vec2.ZERO,
        _convertedBindData: [],
        _atlasData: null,
        mapContent: cc.Node,
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
        
        this._viewPort.width = 12;
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
    },

    render: function(){
        //结合开始位置和视口大小 计算出需要渲染的id,和渲染的位置
        let leftUpPos = cc.Vec2.ZERO;
            leftUpPos.x = this._startPos.x - this._viewPort.width / 2 | 0;
            leftUpPos.y = this._startPos.y - this._viewPort.height / 2 | 0;
        let rightDownPos = cc.Vec2.ZERO;
            rightDownPos.x = this._startPos.x + this._viewPort.width / 2 | 0;
            rightDownPos.y = this._startPos.y + this._viewPort.height / 2 | 0;
        
        //绘制
        for(let yIdx = leftUpPos.y; yIdx < rightDownPos.y; yIdx++){
            for(let xIdx = leftUpPos.x; xIdx < rightDownPos.x; xIdx++){
                let groundTile = new cc.Node();
                this.mapContent.addChild(groundTile);
                groundTile.name = 'tile' + xIdx + '-' + yIdx;
                let offset = cc.Vec2.ZERO;
                    offset.x = xIdx - this._mapSize.width / 2 | 0;
                    offset.y = -(yIdx - this._mapSize.height / 2 | 0);
                let offsetInPixel = cc.Vec2.ZERO;
                    offsetInPixel.x = offset.x * 70;//tile width
                    offsetInPixel.y = offset.y * 70;//tile height
                groundTile.position = offsetInPixel;

                let groundTileSpriteComp = groundTile.addComponent(cc.Sprite);
                let idxInMapData = yIdx * this._mapSize.width + xIdx;
                console.log(this._mapLayer[idxInMapData]);
                let tileSpriteFrame = this._atlasData.getSpriteFrame(this._convertedBindData[this._mapLayer[idxInMapData]]);
                groundTileSpriteComp.spriteFrame = tileSpriteFrame;
            }
        }
        //console.log(this.mapContent.children[0]);
    }

    
});

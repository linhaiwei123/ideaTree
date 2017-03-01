cc.Class({
    extends: cc.Component,

    editor: {
        executeInEditMode: true,
    },

    properties: {
        _testGroundData: null,
        _testMap: null,
        _mapSize: cc.Size.ZERO,
        _viewPort: cc.Size.ZERO,
        _mapLayer: null,
        _startPos: cc.Vec2.ZERO,
        _convertedBindData: [],
        _renderData: null,
    },

    
    onLoad: function () {
        this._testGroundData = require("testGroundData");
        this._testMap = require("testMap");
        console.log(this._testGroundData);
        console.log(this._testMap);

        //获取地图大小
        
        this._mapSize.width = testGroundData.width;
        this._mapSize.height = testGroundData.height;
        //获取地图逻辑数据
        this._mapLayer = testGroundData.layers[0].data;
        //获取视口大小
        
        this._viewPort.width = 12;
        this._viewPort.height = 9;
        //获取入口位置
        
        this._startPos.x = 6;
        this._startPos.y = 4;
        //获取绑定数据
        
        let originBindData = testMap.plist.dict.dict[0].key;
        for(let i = 0,l = originBindData.length; i < l; i++){
            this._convertedBindData[l - i] = originBindData[i].split(".")[0];
        }
        console.log(this._convertedBindData);
        //获取渲染数据
        this._rendererData = null;
        cc.loader.loadRes("mapImg/test",cc.SpriteAtlas,function(err,src){
            this._rendererData = src;
            console.log(this._rendererData);
            this.render();
        }.bind(this));
        //渲染
        //外部渲染
    },

    render: function(){
        //结合开始位置和视口大小 计算出需要渲染的位置
        
    }

    
});

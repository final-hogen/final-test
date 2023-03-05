
class SDViewer{
  constructor(canvasTag,spineUrl,onloadCallback=null) {
    this.finalSdSize = 600; // ファイナルギアキャラが表示できるサイズ
    this.atlasfile = "spine.atlas";
    this.skelfile = "spine.json";
    this.animation = "room";
    this.animationList = [];
    this.callback = onloadCallback;
    this.renderer = new THREE.WebGLRenderer(
      { alpha: true,
        canvas: canvasTag,
      });
    let size = this.renderer.getSize(new THREE.Vector2());
    let xscale = 1.0*size.width/size.height;
    let height = this.finalSdSize;
    let width = this.finalSdSize*xscale;
    this.camera = new THREE.OrthographicCamera(0,  width, 0, -height, 0.001, 10000);
    this.camera.position.y = 0;
    this.camera.position.z = 500; //0でなければOK
    this.scene = new THREE.Scene();
    this.scene.position.x=width/2;
    this.scene.position.y=-height+25.0*height/this.finalSdSize;

    this.assetManager = new spine.threejs.AssetManager(spineUrl);
    this.assetManager.loadText(this.skelfile);
    this.assetManager.loadTextureAtlas(this.atlasfile);
  
    var that = this;
    this.onloadFunc = function(name, scale){that.onload(name, scale);};
    this.renderFunc = function(){that.render();};
    this.lastFrameTime = Date.now() / 1000;
    requestAnimationFrame(this.onloadFunc);
  }
  setAnimation(name){
    this.sdMesh.state.setAnimation(0, name, true);
  }
  onload(name, scale){
    if (!this.assetManager.isLoadingComplete()){
      requestAnimationFrame(this.onloadFunc);
      return;
    }
    this.camera.updateProjectionMatrix();
    let atlas = this.assetManager.get(this.atlasfile);
    let atlasLoader = new spine.AtlasAttachmentLoader(atlas);
    let skeletonJson = new spine.SkeletonJson(atlasLoader);
    skeletonJson.scale = 1.0;
    var skeletonData = skeletonJson.readSkeletonData(this.assetManager.get(this.skelfile));
    let skeletonMesh = new spine.threejs.SkeletonMesh(skeletonData);
		skeletonMesh.state.setAnimation(0, this.animation, true);
    this.sdMesh = skeletonMesh;
    this.scene.add(this.sdMesh);

		for(const animdat of skeletonData.animations){
			this.animationList.push(animdat.name);
		}
    if(this.callback)this.callback(this);
    this.lastFrameTime = Date.now() / 1000;
    requestAnimationFrame(this.renderFunc);
  }
  render(){
    let now = Date.now() / 1000;
    let delta = now - this.lastFrameTime;
    this.lastFrameTime = now;
    this.sdMesh.update(delta);
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.renderFunc);
  }
}

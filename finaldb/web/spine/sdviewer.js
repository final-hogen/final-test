
class SDViewer{
  constructor(canvasTag,spineUrl=null,onloadCallback=null) {
    this.finalSdSize = 600; // ファイナルギアキャラが表示できるサイズ
    this.atlasfile = "spine.atlas";
    this.skelfile = "spine.json";
    this.animation = "room";
    this.animationList = [];
    this.dataUrl = null;
    this.callback = onloadCallback;
    this.playing = true;
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
    this.camera.updateProjectionMatrix();
    this.scene = new THREE.Scene();
    this.scene.position.x=width/2;
    this.scene.position.y=-height+25.0*height/this.finalSdSize;

    var that = this;
    this.onloadFunc = function(name, scale){that.onload(name, scale);};
    this.renderFunc = function(){that.render();};
    this.lastFrameTime = Date.now() / 1000;
    this.loadUrl(spineUrl);
  }
  loadUrl(url){
    if(!url)return;
    this.dataUrl = url;
    url = encodeURI(url);
    if(this.assetManager)this.assetManager.dispose();
    this.assetManager = new spine.threejs.AssetManager(url);
    this.assetManager.loadText(this.skelfile);
    this.assetManager.loadTextureAtlas(this.atlasfile);
    requestAnimationFrame(this.onloadFunc);
  }
  setHaveAnimation(nameList){
    for( let name of nameList ){
      if(!this.animationList.includes(name))continue;
      this.setAnimation(name);
      return;
    }
    console.log("not have animation:"+nameList.join());
    console.log(this.animationList);
  }
  setAnimation(name){
    this.sdMesh.state.setAnimation(0, name, true);
  }
  setMesh(mesh){
    if(this.sdMesh){
      this.scene.remove(this.sdMesh);
      this.sdMesh = null;
    }
    this.sdMesh = mesh;
    this.scene.add(this.sdMesh);
  }
  play(){
    this.playing = true;
    cancelAnimationFrame(this.renderId);
    this.lastFrameTime = Date.now() / 1000;
    this.renderId = requestAnimationFrame(this.renderFunc);
  }
  pause(){
    this.playing = false;
    cancelAnimationFrame(this.renderId);
  }
  dispose(){
    this.callback = null;
    this.pause();
    if(!this.assetManager)this.assetManager.dispose();
    this.assetManager = null;
    if(this.sdMesh)this.scene.remove(this.sdMesh);
    this.sdMesh = null;
    if(!this.camera)this.camera.dispose();
    this.camera = null;
    if(!this.scene)this.scene.dispose();
    this.scene = null;
    if(!this.renderer)this.renderer.dispose();
    this.renderer = null;
  }
  onload(name, scale){
    if (!this.assetManager.isLoadingComplete()){
      requestAnimationFrame(this.onloadFunc);
      return;
    }
    let atlas = this.assetManager.get(this.atlasfile);
    let atlasLoader = new spine.AtlasAttachmentLoader(atlas);
    let skeletonJson = new spine.SkeletonJson(atlasLoader);
    skeletonJson.scale = 1.0;
    var skeletonData = skeletonJson.readSkeletonData(this.assetManager.get(this.skelfile));
    let skeletonMesh = new spine.threejs.SkeletonMesh(skeletonData);
		skeletonMesh.state.setAnimation(0, this.animation, true);
    this.setMesh(skeletonMesh);

    this.animationList = [];
		for(const animdat of skeletonData.animations){
			this.animationList.push(animdat.name);
		}
    this.play();
    if(this.callback)this.callback(this);
  }
  render(){
    let now = Date.now() / 1000;
    let delta = now - this.lastFrameTime;
    this.lastFrameTime = now;
    if(this.playing)this.sdMesh.update(delta);
    else this.sdMesh.update(0);
    this.renderer.render(this.scene, this.camera);
    if(this.playing){
      this.renderId = requestAnimationFrame(this.renderFunc);
    }
  }
}

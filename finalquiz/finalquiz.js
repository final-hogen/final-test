
// クイズ処理クラス
class FinalQuizLoader extends FinalAjax {
  constructor(targetTag) {
    super(targetTag);
    this.monitorImages = [];
  }
  /**
   * Xpathらっぱ
   */
  getElementsByXPath(expression, parentElement) {
    var r = []
    var x = document.evaluate(expression, parentElement || document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
    for (var i = 0, l = x.snapshotLength; i < l; i++) {
        r.push(x.snapshotItem(i))
    }
    return r;
  }
  isLoadingEed(){
    return (this.loadingImages.length<=0);
  }
  /**
   * 画像の読み込み完了でCSSアクション設定
   */
  startMonitorImages(parentNode){
    var isStart = (this.monitorImages.length<=0);
    var elements = this.getElementsByXPath('.//img',parentNode);
    if(elements.length<=0)return;
    Array.prototype.push.apply(this.monitorImages, elements);
    // 前に監視がなかった場合は監視を開始
    if(isStart){
      var that = this;
      setTimeout(function () {
        that.checkMonitorImages();
      }, 10);
    }
  }
  /**
   * 画像の読み込み状態を監視
   */
  checkMonitorImages(){
    if(this.monitorImages.length<=0)return;
    var continueMonitors = [];
    for(var i=0;i<this.monitorImages.length;++i){
      var image = this.monitorImages[i];
      if(!image.complete){
        continueMonitors.push(image);
      }
    }
    this.monitorImages = continueMonitors;
    if(this.monitorImages.length<=0)return;
    // 継続監視
    var that = this;
    setTimeout(function () {
      that.checkMonitorImages();
     }, 100);
  }
}
class FinalQuiz{
  constructor() {
    this.startTime = performance.now();
    this.timerID = null;
    this.dragged = null;
    this.setDragEvents();
  }
  /**
   * タイマーイベントの開始
   * @param {コールバック*} callBackFunction 
   */
  startTimer(callBackFunction){
    var that = this;
    that.endTimer();
    this.startTime = performance.now();
    that.timerID = setInterval(function(){
      callBackFunction(that.getTime());
    },100);
  }
  /**
   * 経過時間の取得(秒)
   */
  getTime(){
    return (performance.now() - this.startTime)/1000.0;
  }
  /**
   * タイマーストップ
   */
  endTimer(){
    if(this.timerID)clearInterval(this.timerID);
    this.timerID = null;
  }
  /**
   * ドラッグイベントのリスナー設定
   */
  setDragEvents(){
    var that = this;
    document.addEventListener("drag", function(event) {}, false);
    document.addEventListener("dragstart", function(event) {
      that.dragged = event.target;
      event.target.style.opacity = .5;
    }, false);
    
    document.addEventListener("dragend", function(event) {
      event.target.style.opacity = "";
    }, false);
    document.addEventListener("dragover", function(event) {
      event.preventDefault();
    }, false);
    document.addEventListener("dragenter", function(event) {
      if (event.target.className == "dropzone") {
        event.target.style.background = "purple";
      }
    
    }, false);
    document.addEventListener("dragleave", function(event) {
      if (event.target.className == "dropzone") {
        event.target.style.background = "";
      }
    }, false);
    
    document.addEventListener("drop", function(event) {
      event.preventDefault();
      if (event.target.className == "dropzone") {
        event.target.style.background = "";
        dragged.parentNode.removeChild( that.dragged );
        event.target.appendChild( that.dragged );
      }
    }, false);
  }

}

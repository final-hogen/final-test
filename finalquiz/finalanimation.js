
// ファイナルギアCSSアニメJavascript
class FinalAnimation {
  constructor() {
    this.monitorImages = [];
    this.monitorTags = [];
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
  /**
   * 要素位置まで縦スクロール
   */
  scrollToID(targetID){
    var target = document.getElementById(targetID);
    if(!target)return;
    var rect = target.getBoundingClientRect();
    window.scrollTo({
      top: rect.top+window.scrollY,
    //  left: 100,
      behavior: 'smooth'
    });
  }
  /**
   * CSSアクション開始
   */
  actionCSS(parentNode){
    this.actionOnLoad(parentNode);
    this.actionStyle(parentNode);
  }
  /**
   * 画像の読み込み完了でCSSアクション設定
   */
  actionOnLoad(parentNode){
    var isStart = (this.monitorImages.length<=0);
    var elements = this.getElementsByXPath('.//*[@onloadstyle]',parentNode);
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
      }else{
        this.actionImage(image);
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
  /**
   * 画像タグ読み込み後のアクション
   * onloadstyle="display:none;" or 親を動かすときは onloadstyle="x-path:..;display:none;"など
   */
  actionImage(element){
    var newStyle = element.getAttribute('onloadstyle');
    if(!newStyle)return;
    var styleStrings = newStyle.split(';');
    var targetXpath = ".";
    const x_path = 'x-path';
    var styleDatas = {};
    // 対象ごとに詰め替え
    for(var i=0;i<styleStrings.length;++i){
      var string = styleStrings[i];
      if(string.startsWith(x_path)){
        targetXpath = string.slice(string.indexOf(':')-string.length+1);
      }else{
        if(!styleDatas[targetXpath])styleDatas[targetXpath]="";
        styleDatas[targetXpath] += string;
      }
    }
    for (const [key, value] of Object.entries(styleDatas)) {
      var actionElements = this.getElementsByXPath(key,element);
      for(var j=0;j<actionElements.length;++j){
        actionElements[j].style = value;
      }
    }
    element.removeAttribute('onloadstyle');
  }
  /**
   * それ以外のCSSアクション
   */
	actionStyle(parentNode){
    var isStart = (this.monitorTags.length<=0);
    var actionElements = this.getElementsByXPath('.//*[@actionstyle]',parentNode);
    Array.prototype.push.apply(this.monitorTags, actionElements);

    if(isStart){
      var that = this;
      setTimeout(function () {
        that.checkMonitorTags();
      }, 10);
    }
	}
  /**
   * そのたCSSアニメの状態を監視
   */
  checkMonitorTags(){
    if(this.monitorTags.length<=0)return;
    for(var i=0;i<this.monitorTags.length;++i){
      var element = this.monitorTags[i];
      var newStyle = element.getAttribute('actionstyle');
      if(newStyle){
        element.style = newStyle;
        element.removeAttribute('actionstyle');
      }
    }
    this.monitorTags = [];
  }
}


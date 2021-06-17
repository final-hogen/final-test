
// ストーリーCSSアニメJavascript
class StoryAnimation {
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


// ストーリーリーダーJavascript
class StoryReader extends StoryAnimation{
  constructor(jsonData) {
    super();
    this.command_unknown = 'unknown';
    this.command_clear = 'clear';
    this.command_message = 'message';
    this.command_narration = 'narration';
    this.command_scene = 'scene';
    this.fullJsonData = jsonData;
    this.images = jsonData.images;
    this.chapters = jsonData.chapters;
    this.chapterKeys = Object.keys(this.chapters);

    this.currentChapter = this.chapterKeys[0];
    this.currentCommand = 0;
  }
  /**
   * 章の開始
   */
  startChapter(chapterName){
    if(this.chapters[chapterName]===undefined)return;
    this.currentChapter = chapterName;
    this.currentCommand = 0;
  }
  /**
   * 章の終わりか判定
   **/
  isChapterEnd(){
    return (this.currentCommand >= this.chapters[this.currentChapter].commands.length);
  }
  /**
   * 次の章を取得
   */
  getNextChapter(currentChapterName){
    if(!currentChapterName)currentChapterName = this.currentChapter;
    if(!currentChapterName)return this.chapterKeys[0];
    var index = this.chapterKeys.indexOf(currentChapterName);
    if(index<0)return this.chapterKeys[0];
    if(index>=(this.chapterKeys.length-1))return this.chapterKeys[0];
    return this.chapterKeys[index+1];
  }
  /**
   * 画像ぱす取得
   */
  getImagePath(name){
    return this.images[name];
  }
  /**
   * 章のタイトル取得
   */
  getChapterTitle(){
    return this.currentChapter;
  }
  /**
   * 章の説明取得
   */
  getChapterSummary(){
    var chapter = this.chapters[this.currentChapter];
    var summary = chapter["summary"];
    if(!summary)return "";
    return summary;
  }
  /**
   * 次へ進む
   */
  nextCommand(){
    var data = this.chapters[this.currentChapter].commands[this.currentCommand];
    data = this.interpolateCommand(data);
    ++this.currentCommand;
    return data;
  }
  /**
   * デフォルト値などを補間する
   */
  interpolateCommand(command){
    // コマンド名を補間
    if(!command.command){
      if(command.message){
        if(command.name)command.command = this.command_message;
        else command.command = this.command_narration;
      }else if(command.image){
        command.command = this.command_scene;
      }else{
        command.command = this.command_unknown;
      }
    }
    // データを補間
    switch(command.command){
      case this.command_message:
        if(!command.id)command.id = command.name;
        if(!command.image)command.image = command.name;
      break;
    }
    if(command.stop === undefined)command.stop = 1;
    return command;
  }
}
// ストーリーメーカーJavascript
class StoryMaker extends StoryReader{
  constructor(jsonData, commandArea, messageTemplate, sceneTemplate, narrationTemplate,nexchapter_template) {
    super(jsonData);
    this.x_message = './/*[@name="message"]';
    this.x_character_name = './/*[@name="character_name"]';
    this.x_icon_img = './/*[@name="icon_img"]';
    this.x_image = './/*[@name="image"]';
    this.x_balloon = './/*[@name="balloon"]';
    this.x_onclick = '.';
    this.finalVoice = new FinalVoice();
    this.useVoice = false;
    this.commandArea = commandArea;
    this.messageTemplate = messageTemplate.cloneNode(true);
    this.messageTemplate.removeAttribute("id");
    this.sceneTemplate = sceneTemplate.cloneNode(true);
    this.sceneTemplate.setAttribute("id","scene_command");
    this.narrationTemplate = narrationTemplate.cloneNode(true);
    this.narrationTemplate.setAttribute("id","narration_command");
    this.nexchapter_template = nexchapter_template.cloneNode(true);
    this.nexchapter_template.setAttribute("id","nexchapter");
  }
  /**
   * commandを処理する
   */
  jobCommand(){
    if(this.isChapterEnd()){
      var newChapter = this.getNextChapter(null);
      this.setNexchapterPanel(newChapter);
      return;
    }
    var command = this.nextCommand();
    switch(command.command){
      case this.command_message:
        this.setMessage(command.id,command.name,command.image,command.message);
      break;
      case this.command_narration:
        this.setNarration(command.message);
      break;
      case this.command_scene:
        this.setScene(command.image);
      break;
      case this.command_clear:
        this.clearCommannds();
      break;
    }
    if(!command.stop)this.jobCommand();
  }
  /**
   * 今の表示削除
   */
  clearCommannds(){
    this.eraseChild(this.commandArea);
  }
  /**
   * 主に動作確認用にノードが属するID取得
   */
  getNodeID(tag){
    if(Array.isArray(tag))return this.getNodeID(tag[0]);
    if(!tag)return ("getNodeID tag is "+tag);
    var myID = tag.getAttribute("id");
    if(myID)return myID;
    return this.getNodeID(tag.parentNode);
  }
  /**
   * こども抹殺
   */
  eraseChild(parentNode){
    while( parentNode.firstChild ){parentNode.removeChild( parentNode.firstChild );}
  }
  /**
   * 章の開始
   */
  startChapter(chapterName){
    super.startChapter(chapterName);
    this.clearCommannds();
    this.setCapter();
    this.jobCommand();
  }
  /**
   * 章情報設定
   */
  setCapter(){
    var titleTag = document.getElementById("chapter_title");
    titleTag.innerHTML = this.getChapterTitle();
    var summaryTag = document.getElementById("chapter_summary");
    summaryTag.innerHTML = this.getChapterSummary();
  }
  /**
   * ナレーション表示
   * @param {文字*} message 
   */
  setNarration(message){
    var oldNarrationTag = document.getElementById("narration_command");
    if(!message){
      if(oldNarrationTag)oldNarrationTag.parentElement.removeChild(oldNarrationTag);
      return;
    }
    var narrationTag = this.narrationTemplate.cloneNode(true);
    var messageTags = this.getElementsByXPath(this.x_message,narrationTag);
    messageTags[0].innerHTML = message;
    if(!oldNarrationTag){
      if(!narrationTag.parentNode)this.commandArea.appendChild(narrationTag);
    }else{
      oldNarrationTag.parentNode.replaceChild(narrationTag,oldNarrationTag);
    }
    this.actionCSS(narrationTag);
  }
  /**
   * シーン追加または更新
   */
  setScene(imageName){
    var sceneTag = document.getElementById("scene_command");
    if(!imageName){
      if(sceneTag)sceneTag.parentElement.removeChild(sceneTag);
      return;
    }
    if(!sceneTag){
      sceneTag = this.sceneTemplate.cloneNode(true);
    }
    var iconNodes = this.getElementsByXPath(this.x_image,sceneTag);
    iconNodes[0].src = this.getImagePath(imageName);
    if(!sceneTag.parentNode)this.commandArea.appendChild(sceneTag);
    this.actionCSS(sceneTag);
  }
  /**
   * メッセージを追加または更新
   */
  setMessage(id,name,imageName,message){
    var newMessage = this.makeMessage(id,name,imageName);
    if(!message){
      if(newMessage.parentNode)newMessage.parentNode.removeChild(newMessage);
      return;
    }

    this.updateMessage(newMessage,message);
    if(this.useVoice&&message)this.finalVoice.speak(id,message);
    if(!newMessage.parentNode)this.commandArea.appendChild(newMessage);
    this.actionCSS(newMessage);
  }
  /**
   * メッセージを作成または元のを更新
   */
  makeMessage(id,name,imageName){
    var messageTag = document.getElementById(id);
    if(!messageTag){
      messageTag = this.messageTemplate.cloneNode(true);
      messageTag.setAttribute("id", id);
    }
    var characterNameNodes = this.getElementsByXPath(this.x_character_name,messageTag);
    characterNameNodes[0].innerHTML = name;
    var iconNodes = this.getElementsByXPath(this.x_icon_img,messageTag);
    iconNodes[0].src = this.getImagePath(imageName);
    return messageTag;
  }
  /**
   * セリフ部分を更新
   */
  updateMessage(targetMessageTag, message){
    var oldBalloon = this.getElementsByXPath(this.x_balloon,targetMessageTag)[0];
    var templateBalloon = this.getElementsByXPath(this.x_balloon,this.messageTemplate)[0];
    var newBalloon = templateBalloon.cloneNode(true);
    var messageTag = this.getElementsByXPath(this.x_message,newBalloon)[0];
    var parentNode = oldBalloon.parentNode;
    parentNode.replaceChild(newBalloon,oldBalloon);
    messageTag.innerHTML = message;
  }
  /**
   * 次の章への表示
   */
  setNexchapterPanel(nextChapterName){
    this.clearCommannds();
    var nextChapterTag = this.nexchapter_template.cloneNode(true);
    var messageTag = this.getElementsByXPath(this.x_message,nextChapterTag)[0];
    messageTag.innerHTML = nextChapterName;
    var clickTag = this.getElementsByXPath(this.x_onclick,nextChapterTag)[0];
    var onclickString = clickTag.getAttribute('onclick');
    var index = onclickString.indexOf("'")+1;
    onclickString = onclickString.slice(0,index)+nextChapterName+onclickString.slice(index-onclickString.length);
    clickTag.setAttribute('onclick',onclickString);
    this.commandArea.appendChild(nextChapterTag);
  }
}

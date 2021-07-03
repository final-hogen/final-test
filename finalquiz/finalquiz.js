
// クイズ処理クラス
class FinalQuizLoader extends FinalAjax {
  constructor(targetTag) {
    super(targetTag);
  }
}

/**
 * クッキー
 */
class FinalCookie{
  constructor(){
    this.cookies = {};
    var cookieStrings = document.cookie.split(';');
    for(var i=0;i<cookieStrings.length;++i){
      const string = cookieStrings[i];
      if(!string)continue;
      const index = string.indexOf('=');
      if(index<0)this.cookies[string.trim()] = null;
      else this.cookies[string.slice(0,index).trim()] = string.slice(index+1).trim();
    }
  }
  getCookie(name){
    return this.cookies[name];
  }
  setCookie(name,value){
    (this.cookies[name] = value);
    this.save();
  }
  save(){
    var newCookieString = "";
    for (const [key, value] of Object.entries(this.cookies)) {
      newCookieString += key+"="+value+"; ";
    }
    document.cookie = newCookieString;
  }
}

/**
 * 結果画面操作用
 */
class FinalQuizResult{
  constructor(finalQUiz) {
    this.quiz = finalQUiz;
    this.allResultTag = document.getElementById('allquiz_result');
    this.iveliniconTemplateTag = document.getElementById('allquizresult_template');
    this.ivelinAreaTag = document.getElementById('ivelin_area');
    this.trophyNameTag = document.getElementById('trophy_name');
  }
  /**
   * 表示
   */
  show(){
    var quizResult = this.quiz.quizResults;
    var parentNode = this.ivelinAreaTag;
    while( parentNode.firstChild ){parentNode.removeChild( parentNode.firstChild );}

    var successCount = 0;
    var that = this;
    const keys = Object.keys(quizResult);
    for (var i=0;i<keys.length;++i) {
      const result = quizResult[keys[i]];
      if(result)++successCount;
      setTimeout(function () {
        that.addIvelin(result);
      }, i*500);
    }
    this.trophyNameTag.innerHTML = this.getTrophyName(successCount);
    this.allResultTag.className = "";
  }
  /**
   * イブリン追加
   * @param {成功画像ならtrue} isSuccess 
   */
  addIvelin(isSuccess){
    var newIvelinTag = this.iveliniconTemplateTag.cloneNode(true);
    newIvelinTag.removeAttribute('id');
    newIvelinTag.setAttribute('result',(isSuccess)?('success'):('fail'));
    this.ivelinAreaTag.appendChild(newIvelinTag);
  }
  /**
   * 非表示
   */
  close(){
    this.allResultTag.className = "nodisplay";
  }
  /**
   * 称号名取得
   * @param {正解数} successCount 
   */
  getTrophyName(successCount){
    if(successCount>=10)return 'ファイナル神';
    if(successCount>=7)return 'ギアマニア';
    if(successCount>=4)return 'イブリン程度';
    return '一般人';
  }
}

/**
 * クイズクラス
 */
class FinalQuiz{
  constructor() {
    this.cookies = new FinalCookie();
    this.allQuiz = [];
    this.quizNumbers = [];
    this.quizResults = {};
    this.isFirst = true;
    const params = new URL(window.location.href).searchParams;
    const qString = params.get('Q');
    if(qString){
      this.quizNumbers = qString.split(',');
    }
    if(this.quizNumbers.length<=0)this.resetQuiz();
  }
  /**
   * クイズデータ設定
   * @param {クイズJSONデータ} allQuiz 
   */
  setAllQuiz(allQuiz){
    this.allQuiz = allQuiz;
  }
  /**
   * ランダム番号配列の作成
   * @param {必要な番号 0 ～ count-1 } count 
   */
  makeRandomNumbers(count){
    var allNumbers = new Array(count).fill(null).map((_, i) => i);
    var j;
    for(var i=allNumbers.length;allNumbers[j=0|Math.random()*i]=[allNumbers[--i],allNumbers[i]=allNumbers[j]][0],i;);
    return allNumbers;
  }
  /**
   * クイズ再設定
   */
  resetQuiz(){
    this.quizNumbers = this.makeQuizNumbers();
    this.quizResults = {};
    this.isFirst = true;
  }
  /**
   * クイズ番号作成
   */
  makeQuizNumbers(){
    const pickQuizCount = 10;
    var allQuizNumbers = new Array(this.allQuiz.length).fill(null).map((_, i) => i);
    var notClearNumbers = this.getNotClearQuizNumbers();
    var useQuizNumbers = [];
    const pickNotClear = Math.min(pickQuizCount/2,notClearNumbers.length);
    for(var i;i<pickNotClear;++i){
      const QuizNumber = notClearNumbers.splice(Math.random()*notClearNumbers.length,1)[0];
      useQuizNumbers.push(QuizNumber);
      allQuizNumbers.splice(allQuizNumbers.indexOf(QuizNumber),1);
    }
    for(;useQuizNumbers.length<pickQuizCount;){
      const QuizNumber = allQuizNumbers.splice(Math.random()*allQuizNumbers.length,1)[0];
      useQuizNumbers.push(QuizNumber);
    }
    return useQuizNumbers;
  }
  /**
   * クリアしてないのクイズ番号取得
   */
  getNotClearQuizNumbers(){
    var clears = this.getQuizSuccessLog().split('');
    var notClearNumbers = [];
    for(var i=0;i<clears.length;++i){
      if(!clears[i])notClearNumbers.push(i);
    }
    return notClearNumbers;
  }
  /**
   * 最後のクイズか
   */
  isLastQuiz(){
    return (this.quizNumbers.length<=1);
  }
  /**
   * 次のクイズに移動
   */
  nextQuiz(){
    this.isFirst = false;
    this.quizNumbers.splice(0,1);
  }
  /**
   * 今のクイズデータ取得
   */
  getCurrentQuiz(){
    if(this.quizNumbers.length<=0)return null;
    return this.allQuiz[this.quizNumbers[0]];
  }
  /**
   * 今のクイズ番号取得
   */
  getCurrentQuizNumber(){
    if(this.quizNumbers.length<=0)return -1;
    return this.quizNumbers[0];
  }
  /**
   * クイズの正解
   */
  getQuizSuccessLog(){
    var result = this.cookies.getCookie('finalquiz_result');
    if(!result)result="";
    return result.padEnd(this.allQuiz.length,'0');
  }
  /**
   * クイズの正解保存
   * @param {*} number 
   */
  quizSuccess(number){
    this.quizResults['Q'+String(number)] = true;
    number = parseInt(number)||0;
    var result = this.getQuizSuccessLog();
    const left = result.slice(0,number);
    const right = result.slice(number+1);
    result = left+'1'+right;
    this.cookies.setCookie('finalquiz_result',result);
  }
  /**
   * クイズの不正解保存
   * @param {*} number 
   */
  quizFail(number){
    this.quizResults['Q'+String(number)] = false;
  }
}

/**
 * クイズ処理クラス
 */
class FinalQuizEditor{
  constructor(quizClass) {
    this.quiz = quizClass;
    this.quizMaxTime = 15.0;
    this.currentQuiz = quizClass.getCurrentQuiz();
    this.answerString = this.currentQuiz.answers[0].string;
    this.quizEnded = false;
    this.resultPanelTag = document.getElementById('result_panel');
    this.contentAreaTag = document.getElementById('content_area');
    this.lockimageTag = document.getElementById('lockimage');
    this.restTimeTag = document.getElementById('resttime');
    this.timeupImage = document.getElementById('timeupimage');
    this.startTime = performance.now();
    this.monitorImages = [];
    this.timerID = null;
    this.questionStringTag = document.getElementById("question");
    this.selectButtonTags = this.getElementsByXPath(".//*[@class='selectButton']");
    this.startMonitorImages(this.contentAreaTag);
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
   * 画像の読み込み完了チェック開始
   */
  startMonitorImages(parentNode){
    this.monitorImages = this.getElementsByXPath('.//img',parentNode);
    // 監視を開始
    var that = this;
    setTimeout(function () {
      that.checkMonitorImages();
    }, 10);
  }
  /**
   * 画像の読み込み状態を監視
   */
  checkMonitorImages(){
    var continueMonitors = [];
    for(var i=0;i<this.monitorImages.length;++i){
      var image = this.monitorImages[i];
      if(!image.complete){
        continueMonitors.push(image);
      }
    }
    this.monitorImages = continueMonitors;
    if(this.monitorImages.length<=0){
      this.monitorImagesEnd();
    }else{
      // 継続監視
      var that = this;
      setTimeout(function () {
        that.checkMonitorImages();
       }, 100);
    }
  }
  /**
   * 監視の終了
   */
  monitorImagesEnd(){
    if(this.quiz.isFirst){
      this.quizLockwait();
    }else{
      this.quizLockup();
    }
  }
  /**
   * ロック待機
   */
  quizLockwait(){
    this.lockimageTag.style.animationName = 'lockwait';
  }
  /**
   * ロックの解除
   */
  quizLockup(){
    this.lockimageTag.style.animationName = 'lockup';
    var that = this;
    setTimeout(function () {
      that.quizStart();
     }, 500);
  }
  /**
   * ロックして次の問題へ
   */
  quizLockdown(){
    this.lockimageTag.style.animationName = 'lockdown';
    var that = this;
    setTimeout(function () {
      that.quizToNext();
     }, 500);
  }
  /**
   * ロックして次の問題へ
   */
  quizToNext(){
    window.nextQuiz();
  }
  /**
   * 
   */
  quizStart(){
    this.startTimer();
  }
  /**
   * タイマーの開始
   */
  startTimer(){
    if(this.quizEnded)return;
    var that = this;
    that.stopTimer();
    this.startTime = performance.now();
    that.timerID = setInterval(function(){
      that.checkTime(that.getTime());
    },100);
  }
  /**
   * クイズの時間経過処理
   * @param {*} time 
   */
  checkTime(time){
    var displayTime = Math.ceil(this.quizMaxTime-time);
    if(displayTime<=0)displayTime = 0;
    this.restTimeTag.innerText = displayTime;
    if(displayTime<=0)this.quizTimeup();
  }
  /**
   * タイムアップ
   */
  quizTimeup(){
    if(this.quizEnded)return;
    this.quizEnded = true;
    this.quiz.quizFail(this.quiz.getCurrentQuizNumber());
    this.stopTimer();
    if(this.timeupImage)this.timeupImage.style.animationName = "timeupimage";
    this.lockimageTag.style.animationName = 'lockdown';
    var that = this;
    setTimeout(function () {
      that.quizToNext();
     }, 3000);
  }
  /**
   * 回答選択時
   * @param {clickイベントオブジェクト} event 
   */
  select(event){
    if(this.quizEnded)return;

    var answerString = this.getAnswerString(event.target);
    var success = (answerString==this.answerString);
    this.quizEnded = true;
    this.stopTimer();
    if(success){
      this.actionResult('success',event.target);
      this.quiz.quizSuccess(this.quiz.getCurrentQuizNumber());
    }else{
      this.actionResult('fail',event.target);
      this.quiz.quizFail(this.quiz.getCurrentQuizNumber());
    }
    var that = this;
    setTimeout(function () {
      that.quizLockdown();
     }, 2000);
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
  stopTimer(){
    if(this.timerID)clearInterval(this.timerID);
    this.timerID = null;
  }
  /**
   * データセット
   */
  setQuizData(){
    if(this.resultPanelTag){
      this.resultPanelTag.style.animationName = "";
      this.resultPanelTag.setAttribute('result',"");
    }
    const currentQuiz = this.currentQuiz;
    this.questionStringTag.innerHTML = currentQuiz.question;
    if(this.timeupImage)this.timeupImage.style.animationName = "";
  }
  /**
   * 
   * @param {リザルト名 success or fail or null } resultName 
   * @param {リザルトを表示する位置} targetTag 
   */
  actionResult(resultName,targetTag){
    if(!this.resultPanelTag)return;
    this.resultPanelTag.style.animationName = "";
    this.resultPanelTag.setAttribute('result',resultName);
    if(!targetTag)return;
    const targetRect = targetTag.getBoundingClientRect();
    const resultRect = this.resultPanelTag.getBoundingClientRect();
    const moveX = ((targetRect.right+targetRect.left)-(resultRect.right+resultRect.left))/2;
    const moveY = ((targetRect.bottom+targetRect.top)-(resultRect.bottom+resultRect.top))/2;
    const fromX = parseInt(this.resultPanelTag.style.left)||0;
    const fromY = parseInt(this.resultPanelTag.style.top)||0;
    this.resultPanelTag.style.left = (fromX+moveX) + 'px';
    this.resultPanelTag.style.top  = (fromY+moveY) + 'px';
    this.resultPanelTag.style.animationName = 'result_'+resultName;
  }
  /**
   * 答え文字設定
   * @param {*} target 
   * @param {*} answerData 
   */
  setAnswerString(target,answerData){
    var stringTag = this.getElementsByXPath('.//*[@name="string"]',target)[0];
    stringTag.innerHTML = answerData.string;
  }
  /**
   * 答えアイコン設定
   * @param {*} target 
   * @param {*} answerData 
   */
  setAnswerIcon(target,answerData){
    var iconTag = this.getElementsByXPath('.//img[@name="icon"]',target)[0];
    iconTag.src = answerData.icon;
  }
  /**
   * 答え文字取得
   * @param {*} target 
   */
  getAnswerString(target){
    var stringTag = this.getElementsByXPath('.//*[@name="string"]',target)[0];
    return stringTag.innerHTML;
  }
}
/**
 * ドラッグクイズ
 */
class FinalDragQuiz extends FinalQuizEditor{
  constructor(quizClass) {
    super(quizClass);
    this.dragged = null;
    this.setDragEvents();
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
/**
 * 四択クイズ
 */
class Taku4Quiz extends FinalQuizEditor{
  constructor(quizClass){
    super(quizClass);
    this.imageTag = document.getElementById("quizimage");
  }
  /**
   * データセット
   */
  setQuizData(){
    super.setQuizData();
    const currentQuiz = this.currentQuiz;
    this.imageTag.src = currentQuiz.image;
    var randomNumber = this.quiz.makeRandomNumbers(4);
    for( var i=0;i<4; ++i){
      this.setAnswerButtonData(currentQuiz,i,randomNumber[i]);
    }
  }
  /**
   * 回答ボタンセット
   * @param {クイズデータ} quiz 
   * @param {0～3} number 
   * @param {0～3} targetNumber 
   */
  setAnswerButtonData(quiz,number,targetNumber){
    var tag = this.selectButtonTags[targetNumber];
    const data = quiz.answers[number];
    this.setAnswerString(tag,data);
  }
}

/**
 * アイコン付き四択クイズ
 */
class Taku4QuizIcon extends Taku4Quiz{
  /**
   * 回答ボタンセット
   * @param {クイズデータ} quiz 
   * @param {0～3} number 
   * @param {0～3} targetNumber 
   */
  setAnswerButtonData(quiz,number,targetNumber){
    super.setAnswerButtonData(quiz,number,targetNumber);
    this.setAnswerIcon(this.selectButtonTags[targetNumber],quiz.answers[number]);
  }
}

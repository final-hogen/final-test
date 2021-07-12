
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
    (this.cookies['max-age'] = (60*60*24*365));
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
  }
  /**
   * クイズデータ設定
   * @param {クイズJSONデータ} allQuiz 
   */
  setAllQuiz(allQuiz){
    this.allQuiz = allQuiz;
    if(this.quizNumbers.length<=0)this.resetQuiz();
  }
  /**
   * ランダム番号配列の作成
   * @param {必要な番号 0 ～ count-1 } count 
   */
  makeRandomNumbers(count){
    var allNumbers = new Array(count).fill(null).map((_, i) => i);
    allNumbers = this.shuffleArray(allNumbers);
    return allNumbers;
  }
  shuffleArray(array){
    var j;
    for(var i=array.length;array[j=0|Math.random()*i]=[array[--i],array[i]=array[j]][0],i;);
    return array;
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
    for(var i=0;i<pickNotClear;++i){
      const QuizNumber = notClearNumbers.splice(Math.random()*notClearNumbers.length,1)[0];
      useQuizNumbers.push(QuizNumber);
      allQuizNumbers.splice(allQuizNumbers.indexOf(QuizNumber),1);
    }
    for(;useQuizNumbers.length<pickQuizCount;){
      const QuizNumber = allQuizNumbers.splice(Math.random()*allQuizNumbers.length,1)[0];
      useQuizNumbers.push(QuizNumber);
    }
    useQuizNumbers = this.shuffleArray(useQuizNumbers);
    return useQuizNumbers;
  }
  /**
   * クリアしてないのクイズ番号取得
   */
  getNotClearQuizNumbers(){
    var clears = this.getQuizSuccessLog().split('');
    var notClearNumbers = [];
    for(var i=0;i<clears.length;++i){
      if(clears[i]=='0')notClearNumbers.push(i);
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
   * クイズの制覇率(0～1)
   */
  getQuizSuccessRate(){
    const log = this.getQuizSuccessLog();
    if(log.length<=0)return 0;
    var successCount = 0;
    for(var i=0;i<log.length;++i){
      if(log.charAt(i)=='1')++successCount;
    }
    return successCount/log.length;
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
    this.answerString = null;
    if(Array.isArray(this.currentQuiz.answers))this.answerString = this.currentQuiz.answers[0].string;
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
    this.finish(success,event.target);
  }
  /**
   * 完了処理
   * @param {成功か} isSuccess 
   * @param {成功失敗表示場所} displayTarget 
   */
  finish(isSuccess,displayTarget){
    this.quizEnded = true;
    this.stopTimer();
    if(isSuccess){
      this.actionResult('success',displayTarget);
      this.quiz.quizSuccess(this.quiz.getCurrentQuizNumber());
    }else{
      this.actionResult('fail',displayTarget);
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
    if(!stringTag)return null;
    return stringTag.innerHTML;
  }
}
/**
 * ドラッグクイズ
 */
class FinalDragQuiz extends FinalQuizEditor{
  constructor(quizClass) {
    super(quizClass);
    this.listenerFunctions = {};
    this.dragged = null;
    this.quizMaxTime = 30.0;
    this.dragItemTags = this.getElementsByXPath(".//*[@class='dragitem']");
    this.dropLabelTags = this.getElementsByXPath(".//*[@name='droplabel']");
    this.dropTargetTags = this.getElementsByXPath(".//*[@name='droptarget']");
    
    var that = this;
    this.listenerFunctions["drag"] = function(event) {};
    this.listenerFunctions["dragstart"] = function(event) {that.dragStart(event)};
    this.listenerFunctions["dragend"] = function(event) {that.dragEnd(event)};
    this.listenerFunctions["dragover"] = function(event) {that.dragOver(event)};
    this.listenerFunctions["dragenter"] = function(event) {that.dragEnter(event)};
    this.listenerFunctions["dragleave"] = function(event) {that.dragLeave(event)};
    this.listenerFunctions["drop"] = function(event) {that.dragDrop(event)};
    this.setDragEvents(false);
  }
  /**
   * ドラッグイベントのリスナー設定
   */
  setDragEvents(isRemove){
    var listener = document.addEventListener;
    if(isRemove)listener = document.removeEventListener;
    for (const [key, value] of Object.entries(this.listenerFunctions)) {
      listener(key,value,false);
    }
  }
  dragStart(event){
    this.dragged = event.target;
    event.target.style.opacity = .5;
  }
  dragEnd(event){
    event.target.style.opacity = "";
  }
  dragOver(event){
    event.preventDefault();
  }
  /**
   * 親にさかのぼってドロップターゲットを探す
   * @param {最初のターゲット} targetTag 
   */
  checkDropTarget(targetTag){
    if(targetTag.getAttribute('name') == "droptarget")return targetTag;
    if(targetTag.className=='dragitem')return targetTag.parentNode;
    return null;
  }
  dragEnter(event){
    if(!this.dragged)return;
    var target = this.checkDropTarget(event.target);
    if (target) {target.className = 'draghover';}
  }
  dragLeave(event){
    var target = this.checkDropTarget(event.target);
    if (target) {target.className = "";}
  }
  dragDrop(event){
    event.preventDefault();
    if(!this.dragged)return;
    var target = this.checkDropTarget(event.target);
    if (target) {
      this.dragLeave(event);
      this.swapChild(this.dragged.parentNode,target);
    }
    this.dragged = null;
  }
  swapChild(parent1,parent2){
    var chiled1 = parent1.firstElementChild;
    var chiled2 = parent2.firstElementChild;
    if(chiled1){
      parent1.removeChild(chiled1);
      parent2.appendChild(chiled1);
    }
    if(chiled2){
      parent2.removeChild(chiled2);
      parent1.appendChild(chiled2);
    }
  }
  /**
   * データセット
   */
  setQuizData(){
    super.setQuizData();
    const currentQuiz = this.currentQuiz;
    const dragItemCount = this.dragItemTags.length;
    var randomNumber = this.quiz.makeRandomNumbers(dragItemCount);
    for( var i=0;i<dragItemCount; ++i){
      this.setDragItemData(currentQuiz,i,randomNumber[i]);
    }
    const dropItemCount = this.dropLabelTags.length;
    randomNumber = this.quiz.makeRandomNumbers(dropItemCount);
    for(i=0;i<dropItemCount;++i){
      this.setDropLabel(currentQuiz,i,randomNumber[i]);
    }
  }
  /**
   * 回答ボタンセット
   * @param {クイズデータ} quiz 
   * @param {0～3} number 
   * @param {0～3} targetNumber 
   */
  setDragItemData(quiz,number,targetNumber){
    var tag = this.dragItemTags[targetNumber];
    const data = quiz.answers[number];
    this.setAnswerString(tag,data);
    this.setAnswerIcon(tag,data);
  }
  /**
   * ラベルボタンセット
   * @param {クイズデータ} quiz 
   * @param {0～3} number 
   * @param {0～3} targetNumber 
   */
  setDropLabel(quiz,number,targetNumber){
  }
  finish(isSuccess,displayTarget){
    super.finish(isSuccess,displayTarget);
    this.setDragEvents(true);
  }
  checkAnswer(){
    return false;
  }
  quizTimeup(){
    if(this.quizEnded)return;
    var success = this.checkAnswer();
    if(success)return this.done(null);
    this.setDragEvents(true);
    super.quizTimeup();
  }
}
/**
 * 四択クイズ
 */
class Taku4Quiz extends FinalQuizEditor{
  constructor(quizClass){
    super(quizClass);
    this.imageTag = document.getElementById("quizimage");
    this.selectButtonTags = this.getElementsByXPath(".//*[@class='selectButton']");
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

/**
 * 4個並べ替えクイズ
 */
class Sort4Quiz extends FinalDragQuiz{
  constructor(quizClass){
    super(quizClass);
  }
  /**
   * ラベルボタンセット
   * @param {クイズデータ} quiz 
   * @param {0～3} number 
   * @param {0～3} targetNumber 
   */
  setDropLabel(quiz,number,targetNumber){
    var tag = this.dropLabelTags[number];
    if(!tag)return;
    const data = quiz.tags[number];
    tag.innerHTML = data;
  }
  checkAnswer(){
    var checkStrings = [];
    this.dropTargetTags.forEach(tag => {
      checkStrings.push(this.getAnswerString(tag));
    });
    if(this.currentQuiz.answers.length!=checkStrings,length)return false;
    for(var i=0;i<checkStrings.length;++i){
      if(checkStrings[i]!=this.currentQuiz.answers[i].string)return false;
    }
    return true;
  }
  done(event){
    if(this.quizEnded)return;

    var success = this.checkAnswer();
    var displayArea = document.getElementById('sorttarget')
    this.finish(success,displayArea);
  }
}

/**
 * 2個分類クイズ
 */
class Classify2Quiz extends FinalDragQuiz{
  constructor(quizClass){
    super(quizClass);
    this.allAnswers = [];
    for(const key in this.currentQuiz.answers){
      this.currentQuiz.answers[key].forEach(value=>this.allAnswers.push(value));
    }
  }
  setDragItemData(quiz,number,targetNumber){
    var tag = this.dragItemTags[targetNumber];
    const data = this.allAnswers[number];
    this.setAnswerString(tag,data);
    this.setAnswerIcon(tag,data);
  }
  setDropLabel(quiz,number,targetNumber){
    var tag = this.dropLabelTags[number];
    if(!tag)return;
    const labels = Object.keys(quiz.answers);
    const data = labels[number];
    tag.innerHTML = data;
  }
  checkAnswer(){
    var checkStrings = {};
    const classKeys = Object.keys(this.currentQuiz.answers);
    const classTd = this.getElementsByXPath(".//*[@id='classify2target']/tbody/tr/td",null);
    for( var i=0;i<classTd.length;++i){
      const tag = classTd[i];
      const thName = classKeys[i];
      const itemTags = this.getElementsByXPath(".//*[@class='dragitem']",tag);
      var stringList = [];
      itemTags.forEach(itemTag=>{stringList.push(this.getAnswerString(itemTag));});
      checkStrings[thName] = stringList;
    }
    for (const key of classKeys ){
      const answers = this.currentQuiz.answers[key];
      var items = checkStrings[key];
      if(!items)return false;
      if(answers.length!=items.length)return false;
      for(i=0;i<answers.length;++i){
        const index = items.indexOf(answers[i].string);
        if(index<0)return false;
        items.splice(index,1);
      }
      if(items.length>0)return false;
    };
    return true;
  }
  done(event){
    if(this.quizEnded)return;
    var success = this.checkAnswer();
    var displayArea = document.getElementById('classify2target')
    this.finish(success,displayArea);
  }
}

/**
 * 3個分類クイズ
 */
class Combi3Quiz extends FinalDragQuiz{
  constructor(quizClass){
    super(quizClass);
    this.quizMaxTime = 20.0;
    this.combiTags = this.getElementsByXPath(".//*[@class='combibox']",null);
    this.answerkeys = Object.keys(this.currentQuiz.answers);
  }
  setDragItemData(quiz,number,targetNumber){
    var tag = this.dragItemTags[targetNumber];
    const data = quiz.answers[this.answerkeys[number]];
    this.setAnswerString(tag,data);
    if(data.icon)this.setAnswerIcon(tag,data);
  }
  setDropLabel(quiz,number,targetNumber){
    var tag = this.dropLabelTags[targetNumber];
    if(!tag)return;
    const data = this.answerkeys[number];
    tag.innerHTML = data;
  }
  checkAnswer(){
    var checkStrings = {};
    for( var i=0;i<this.combiTags.length;++i){
      const tag = this.combiTags[i];
      const thTag = this.getElementsByXPath(".//*[@name='droplabel']",tag)[0];
      const thName = thTag.innerHTML;
      const itemTag = this.getElementsByXPath(".//*[@class='dragitem']",tag)[0];
      if(!itemTag)return false;
      checkStrings[thName] = this.getAnswerString(itemTag);
    }
    const answers = this.currentQuiz.answers;
    for (const key in answers ){
      if(answers[key].string!=checkStrings[key])return false;
    };
    return true;
  }
  done(event){
    if(this.quizEnded)return;
    var success = this.checkAnswer();
    var displayArea = document.getElementById('combi3target')
    this.finish(success,displayArea);
  }
}

/**
 * 場所当てクイズ
 */
class PlaceQuiz extends FinalQuizEditor{
  constructor(quizClass){
    super(quizClass);
    this.imageTag = document.getElementById("placeimage");
    this.pointTags = this.getElementsByXPath(".//*[@class='placepoint']",null);
    this.answerString = this.makeString(this.currentQuiz.answers[0]);
  }
  makeString(answer){
    return JSON.stringify(answer);
  }
  /**
   * データセット
   */
  setQuizData(){
    super.setQuizData();
    const currentQuiz = this.currentQuiz;
    this.imageTag.src = currentQuiz.image;
    var randomNumber = this.quiz.makeRandomNumbers(currentQuiz.answers.length);
    for( var i=0;i<currentQuiz.answers.length; ++i){
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
    var tag = this.pointTags[targetNumber];
    const data = quiz.answers[number];
    var stringTag = this.getElementsByXPath('.//*[@name="string"]',tag)[0];
    stringTag.innerHTML = this.makeString(data);
    this.setPointOnImage(this.imageTag,tag,data.x,data.y);
  }
  /**
   * ポイントを画像上の指定位置にセット
   * @param {*} imageTag 
   * @param {*} pointTag 
   * @param {*} x 
   * @param {*} y 
   */
  setPointOnImage(imageTag,pointTag,x,y){
    const pointRect = pointTag.getClientRects()[0];
    var left = x-pointRect.width/2;
    var top = y-pointRect.height/2;
    pointTag.style.left = left+"px";
    pointTag.style.top = top+"px";
  }
}

/**
 * 画像当てクイズ
 */
class ImageQuiz extends Taku4QuizIcon{
  constructor(quizClass){
    super(quizClass);
    this.actionClass = new FinalAnimation();
    const styleString = this.imageTag.getAttribute('style');
    const newStyle = this.makeRandomString(styleString);
    if(newStyle)this.imageTag.setAttribute('style',newStyle);
  }
  /**
   * []の範囲でランダム値に置き換え ex: transform: scale(5) translate([-159～160]px, [-160～160]px); 
   * @param {*} source 
   */
  makeRandomString(source){
    if(!source)return source;
    const match = /\[([^\]]*)\]/g;
    var result = [];
    var m;
    while ((m = match.exec(source)) != null) {
      result.push(m[1]);
    }
    var newString = source;
    for(var key of result){
      var splits = key.split('～');
      const min = parseFloat(splits[0]);
      const max = parseFloat(splits[1]);
      const randValue = min+(max-min)*Math.random();
      newString = newString.replace('['+key+']',randValue.toFixed(2));
    }
    return newString;
  }
  quizStart(){
    super.quizStart();
    this.actionClass.actionCSS(this.imageTag.parentNode);
  }
}

/**
 * 拡大画像当てクイズ
 */
class ImageZoomQuiz extends ImageQuiz{
}
/**
 * フィルタ画像当てクイズ
 */
class ImageFilterQuiz extends ImageQuiz{
}
/**
 * 歪み画像当てクイズ
 */
class ImageSkewQuiz extends ImageQuiz{
}
/**
 * パネル表示画像当てクイズ
 */
class ImagePanelQuiz extends ImageQuiz{
  constructor(quizClass){
    super(quizClass);
    var imageAreaTag = document.getElementById('quizimage').parentNode;
    this.panelTags = this.getElementsByXPath('.//*[@class="hidepanel"]//td',imageAreaTag);
  }
  checkTime(time){
    super.checkTime(time);
    var panelCount = Math.floor(this.quizMaxTime-time)+1;
    while(panelCount>=0&&this.panelTags.length>panelCount){
      const randNumber = Math.floor(this.panelTags.length*Math.random());
      var deletePanelTag = this.panelTags.splice(randNumber,1)[0];
      deletePanelTag.style.backgroundColor = 'initial';
    }
  }
}
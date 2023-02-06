/**
 * 種類ごと(武器だけとかパイロットだけとか)のJSON読み込む
 */
class FinalJsonDB extends FinalAjax{
  constructor(target, template) {
    super(target);
    var clone = template.cloneNode(true);
    clone.removeAttribute('id');
    this.templateString = clone.outerHTML;
    this.templateMatches = this.templateString.match( /\{([^\}]*)\}/g);
    this.baseNode = {};
    this.innerObjects = {};
    this.objectConstructor = FinalJsonObject; // 一つのデータを持つクラス必要なら変更
    this.dummyTag = document.createElement("div");
  }
  /**
   * JSON限定読み込み
   * @param {*} fileName 
   */
  loadJson(fileName){
    this.ajaxLoad(fileName,null,'onLoad',null);
  }
  /**
   * 読み込みが終わったら呼ばれる
   * @param {*} data    読み込んだデータ
   * @param {*} param  読み込み開始時に使ったパラメータ
   */
  onLoad(data,param){
    this.setJsonData(data);
    this.convert();
  }
  /**
   * データをセットする
   * @param {*} data 
   */
  setJsonData(data){
    this.baseNode = data;
    this.innerObjects = {};
    for (const [key, value] of Object.entries(data)) {
      this.innerObjects[key] = new this.objectConstructor(value);
    }
  }
  /**
   * データをタグに変換してぶっこむ
   */
  convert(){
    var target = this.baseNode;
    var objects = Object.values(this.innerObjects);
    for(var i in objects){
      var newTagString = objects[i].convertString(this.templateString,this.templateMatches);
      this.dummyTag.innerHTML = newTagString;
      var newTag = this.dummyTag.firstChild;
      this.replaceTarget.appendChild(newTag);
    }
  }
}

/**
 * 一つのデータを扱うクラス
 */
class FinalJsonObject {
  constructor(node) {
    this.baseNode = node;
  }
  /**
   * 武器名/名前 みたいなJSONパスを指定してデータを取り出す
   * @param {*} path 
   * @returns 
   */
  fetchData(path){
    var array = path.split('/');
    var check = this.baseNode;
    for( var i in array ){
      var check2 = check[array[i]];
      if(check2==undefined)return null;
      check = check2;
    }
    return check;
  }
  fetchString(path){
    var result = this.fetchData(path);
    if(result==null)return 'false';
    if(result instanceof Object===true)return 'true';
    return result;
  }
  /**
   * JSON ぱすでデータを保存する
   * @param {*} path 
   * @param {*} value 
   */
  writeData(path,value){
    var array = path.split('/');
    var check = this.baseNode;
    for( var i in array ){
      var check2 = check[array[i]];
      if(check2==undefined)check2 = check[array[i]] = new Object();
      check = check2;
    }
    check = value;
  }
  /**
   * 文字列の　”{JSONパス}”　をデータに置き換える
   * @param {*} templateString 
   * @param {*} matches 
   * @returns 
   */
  convertString(templateString,matches){
    for( var i in matches ){
      var key = matches[i];
      var path = key.substring(1, key.length-1);
      var value = this.fetchString(path);
      templateString = templateString.replaceAll(key,value);
    }
    return templateString;
  }
}

/**
 * 文字を吹き出しに変換するクラス
 */
class FinalAutoMarkup extends FinalAjax{
  constructor(target){
    this.targetNode = target;
    this.textParents = this.getElementsByXPath(".//text()[(normalize-space())]");
  }
  loadJson(fileName){
    this.ajaxLoad(fileName,null,'onLoad',null);
  }
  /**
   * 読み込みが終わったら呼ばれる
   * @param {*} data    読み込んだデータ
   * @param {*} param  読み込み開始時に使ったパラメータ
   */
  onLoad(data,param){
    setJsonData(data);
  }
  setJsonData(data){
    //　.//text()[(normalize-space())]
  }
  setData(key,value){

  }
}

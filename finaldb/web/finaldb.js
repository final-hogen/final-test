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
  loadJson(fileName,callback=null){
    this.ajaxLoad(fileName,null,'onLoad',callback);
  }
  /**
   * 読み込みが終わったら呼ばれる
   * @param {*} data    読み込んだデータ
   * @param {*} param  コールバック関数
   */
  onLoad(data,param){
    this.setJsonData(data);
    this.convert();
    if(param!=null)param();
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
    var objects = Object.values(this.innerObjects);
    objects.sort(this.compareFn);
    this.convertArray(objects);
  }
  /**
   * 名前から変換
   * @param {*} names 
   */
  convertNames(names){
    if(!names || names.length<=0)return;
    var result = [];
    for(const name of names){
      result.push(this.innerObjects[name]);
    }
    this.convertArray(result);
  }
  /**
   * データをタグに変換してぶっこむ
   */
  convertArray(objects){
    var results = new Array();
    for(var i in objects){
      var newTagString = objects[i].convertString(this.templateString,this.templateMatches);
      this.dummyTag.innerHTML = newTagString;
      var newTag = this.dummyTag.firstChild;
      results.push(newTag);
    }
    this.inputTags(results);
  }
  /**
   * タグデータをターゲットに入れる
   * @param {*} tags 
   */
  inputTags(tags){
    tags.forEach(tag=> this.replaceTarget.appendChild(tag));
  }
  static sortOederRare(rare){
    switch(rare){
      case "N":return 0;
      case "R":return 1;
      case "SR":return 2;
      case "SSR":return 3;
      case "UR":return 4;
    }
    return -1;
  }
  /**
   * 比較関数 レア、名前の順に比較
   * @param {*} a 
   * @param {*} b 
   */
  compareFn(a,b){
    var a_rare = FinalJsonDB.sortOederRare(a.fetchString('レアリティ'));
    var b_rare = FinalJsonDB.sortOederRare(b.fetchString('レアリティ'));
    if(a_rare>b_rare)return -1; //a前
    if(a_rare<b_rare)return   1; //b前
    var a_name = a.fetchString('名前');
    var b_name = b.fetchString('名前');
    if(a_name==null&b_name==null)return 0;
    if(a_name==null)return  1;   //b前
    if(b_name==null)return  -1;  //a前
    return a_name.localeCompare(b_name);
  }
}

class FinalJsonDBInsert extends FinalJsonDB
{
  constructor(template){
    super(template,template);
  }
  inputTags(tags){
    tags.forEach(tag=> this.replaceTarget.parentNode.insertBefore(tag,this.replaceTarget));
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
    for( var i=0; i<array.length-1; ++i ){
      var check2 = check[array[i]];
      if(check2==undefined)check[array[i]] = check2 = new Object();
      check = check2;
    }
    check[array[i]] = value;
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
      templateString = this.convertStringSingle(templateString,key);
    }
    return templateString;
  }
  /**
   * 文字列の　”{JSONパス}”　をデータに置き換える
   * @param {*} templateString 
   * @param {*} key     "{esc:exsample}"
   * @returns 
   */
  convertStringSingle(templateString,key){
    var inner = key.substring(1, key.length-1);
    var split = inner.split(":");
    var path = "";
    var com = "";
    if(split.length>1){
      com = split[0];
      path = split[1];
    }else{
      path = split[0];
    }
    var value = this.fetchString(path);
    switch(com){
      case"eu":value = encodeURI(value);break;
      case"et":value = value = value.replaceAll("\n","<br/>");break;
    }
    return templateString.replaceAll(key,value);
  }
}

/**
 * 文字を吹き出しに変換するクラス
 */
class FinalAutoMarkup extends FinalAjax{
  constructor(target, template){
    super(target);
    var clone = template.cloneNode(true);
    clone.removeAttribute('id');
    this.templateString = clone.outerHTML;
    this.textParents = this.getElementsByXPath(".//text()[(normalize-space())]/..",this.replaceTarget);
    this.keyvalues = {};
    this.sortKeys = [];
    this.markupTagStrings = {};
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
    this.setJsonData(data);
    this.convert();
  }
  setJsonData(data){
    var values = Object.values(data);
    for( var i in values){
      var key = values[i]["名前"];
      var value = values[i]["説明"];
      this.setData(key,value);
    }
    this.sortKeys = Object.keys(this.keyvalues);
    this.sortKeys.sort();
    this.sortKeys.reverse();
  }
  setData(key,value){
    this.keyvalues[key]=value;
  }
  /**
   * 文章中のキーワードを見付けてバルーン解説を付ける
   */
  convert(){
    for(var i in this.textParents){
      var chileds = this.textParents[i].childNodes;
      for (var j = 0; j < chileds.length; j++) {
        var chiled = chileds[j];
        if(chiled.nodeType!=Node.TEXT_NODE)continue;
        chiled.parentNode.replaceChild(this.convertTextNode(chiled),chiled);
      }
    }
  }
  /**
   * テキストノードに解説を付けるかもしれない
   * @param {*} sourceNode 
   * @returns 
   */
  convertTextNode(sourceNode){
    if(sourceNode.nodeType!=Node.TEXT_NODE)return sourceNode;
    var srcstring = sourceNode.textContent;
    var srcarray = [srcstring];
    for (let i in this.sortKeys) {
      const key = this.sortKeys[i];
      srcarray= this.splitDescArray(key,srcarray);
    }
    if(srcarray.length<=1)return sourceNode;
    for( let i=0;i<srcarray.length;++i){
      if(!(srcarray[i] instanceof Object))continue;
      const key = srcarray[i].key;
      const value = this.keyvalues[key];
      srcarray[i] = this.makeMarkupString(key,value);
    }
    var dummyTag = document.createElement("div");
    dummyTag.innerHTML = srcarray.join('');
    return dummyTag;
  }
  splitDescArray(key, array){
    let max = array.length-1;
    for(let i=max;i>=0;--i){
      if(array[i] instanceof  Object)continue;
      var split = array[i].split(key);
      if(split.length<=1)continue;
      let jmax = split.length-1;
      for(let j=jmax;j>0;--j){
        split.splice(j,0,{"key":key});
      }
      array.splice(i,1,...split);
    }
    return array;
  }
  /**
   * 解説タグ文字を作る
   * @param {*} key キーワード
   * @param {*} desc  説明
   * @returns 
   */
  makeMarkupString(key,desc){
    if(this.makeMarkupString[key])return this.makeMarkupString[key];
    const keyword = '{keyword}';
    const description = '{description}';
    var resultString = this.templateString.replaceAll(keyword,key);
    resultString = resultString.replaceAll(description,desc);

    this.makeMarkupString[key] = resultString;
    return resultString;
  }
}


// ajaxしょり
class FinalAjax {
  constructor(targetTag) {
    this.replaceTarget = targetTag;
    this.loadingCount = 0;
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
   * 非同期読み込み
   * @param {読み込みURL} url 
   * @param {パラメータオブジェクトない時null} requestParam 
   * @param {コールバック関数文字列} callback 
   * @param {コールバックの時に渡すパラメータ} callbackParam 
   */
  ajaxLoad(url, requestParam, callback, callbackParam){
    if(requestParam)url += '?'+ new URLSearchParams(requestParam).toString();
    const that = this;
    ++that.loadingCount;
    fetch(url,{
      //method : "GET",
      //body : JSON.stringify(requestParam),
      //headers: {"Content-Type": "application/json; charset=utf-8"},
      //mode: 'same-origin',
    })
    .then(async function(res){
      var text = await res.text();
      var contentType = await res.headers.get("Content-Type");
      var result = null;
      if(contentType.includes('json')){
        result = JSON.parse(text); 
      }else if(contentType.includes('html')){
        var paser = new DOMParser();
        //result = paser.parseFromString(text,'application/xml');
        result = paser.parseFromString(text,'text/html').body.firstChild;
      }else if(contentType.includes('xml')){
        var paser = new DOMParser();
        result = paser.parseFromString(text,'application/xml');
      }else if(contentType.includes('text')){
        result = text;
      }else{
        result = await res.blob();
      }
      --that.loadingCount;
      return result
    })
    .then(function(data){
        if(callback) that[callback](data, callbackParam);
    })
    //.catch(function(err){
    //    if(callback) that[callback](null, err);
    //});
  }
  /**
   * ページ切り替え
   * @param {表示するページ}} url 
   */
  loadPage(url){
    this.ajaxLoad(url,null,'onLoadPage',null);
  }
  /**
   * loadPageからの鵜読み込み完了コールバック
   * @param {読み込んだデータ(タグ)} loadData 
   * @param {なし} params 
   */
  onLoadPage(loadData, params){
    if(!loadData)return;
    var target = this.replaceTarget;
    while( target.firstChild ){target.removeChild( target.firstChild );}
    target.appendChild(loadData);
    var scriptTags = this.getElementsByXPath('.//script',loadData);
    try{
      scriptTags.forEach(scriptTag => {
        eval(scriptTag.textContent);
      });
    }catch(e){
      console.log(e);
    }
  }
}

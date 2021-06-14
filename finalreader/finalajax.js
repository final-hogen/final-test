
// ajaxしょり
class FinalAjax {
  constructor(loadPageTag) {
  	this.replaceTarget = loadPageTag;
  }
  ajaxLoad(url, requestParam, callback, callbackParam){
    //var requestUrl = new URL(document.URL);
    //requestUrl.pathname = "./"+url;
    var serchString = new URLSearchParams({"id":"hoho"}).toString();
    /*
    fetch(url).then(function(response) {
      response.text().then(function(text) {
        console.log(text);
      });
    }); */
    fetch(url,{
      //method : "GET",
      //body : JSON.stringify(requestParam),
      //headers: {"Content-Type": "application/json; charset=utf-8"},
      //mode: 'same-origin',
      //headers: {'Content-Type': 'text/html',},
    })
    .then(async function(res){
      var text = await res.text();
      var contentType = await res.headers.get("Content-Type");
      if(contentType.includes('json')){
        return JSON.parse(text); 
      }else if(contentType.includes('html')){
        var paser = new DOMParser();
        //var pase = paser.parseFromString(text,'text/html');
        return paser.parseFromString(text,'text/html');
      }else if(contentType.includes('xml')){
        var paser = new DOMParser();
        return paser.parseFromString(text,'application/xml');
      }else if(contentType.includes('text')){
        return text;
      }
      return await res.blob();
    })
    .then(function(data){
        if(callback) callback(data, callbackParam);
    })
    .catch(function(err){
        if(callback) callback(null, err);
    });
  }
  /**
   * ページ切り替え
   * @param {表示するページ}} url 
   */
  loadPage(url){
    var that = this;
    this.ajaxLoad(url,{},that.onLoadPage,{});
  }
  onLoadPage(loadData, params){
    console.log(loadData.body.firstChild.textContent);
  }
}

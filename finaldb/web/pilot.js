
class FinalPilotData{
  static getNickname(baseNode,excludeName=null){
    var result = {};
    for(var name in baseNode){
      if(name==excludeName)continue;
      result[name] = name;
    }
    const nickNames = [
      ["カーティス","カーティス・ベルナル"],
      ["コディス","カーティス・ベルナル"],
      ["タイシア","タイシア・グラフト"],
      ["シャルン","シャロン"],
      //["ザンテ","ジェンシ"],
      ["ストレンジャー","ザ・ストレンジャー"],
      ["変異体イブリン","イブリン（変異体）"],
      ["ミラベル","ミラベル・デコリー"],
      ["モルガン","モルガン・ヘリング"],
    ];
    for( var keyval of nickNames){
      if(keyval[1]==excludeName)continue;
      result[keyval[0]] = keyval[1];
    }
    return result;
  }
}

class BloodPilotData extends FinalJsonObject
{
  constructor(node,index) {
    super(node,index);
    var blood = this.fetchString("情報/血液型");
    blood = blood.replaceAll("&"," ").replaceAll("＆"," ");
    this.writeData("blood",blood);
  }
}

class SingleFinalJsonDB extends FinalJsonDBInsert
{
  constructor(template, name){
    super(template);
    this.viewPilotName = name;
  }
  convert(){
    this.convertArray([this.getPilotObject()]);
  }
  getPilotObject(){
    return this.innerObjects[this.viewPilotName];
  }
}

class SkinPilotObject extends FinalJsonObject{
  constructor(node,index) {
    super(node,index);
    this.pilotName = window.pilotname;
  }
  fetchString(path){
    switch(path){
      case "パイロット名": return this.pilotName;
      case "checked": if(this.myIndex=="1")return 'checked="checked"'; else return "";
    }
    return super.fetchString(path);
  }
}

class PilotSkinsDB
{
  constructor(pilotObject){
    this.skinNode = {};
    this.pilotName =  pilotObject.fetchData("名前");
    this.setSkins(pilotObject);
  }
  setSkins(pilotObject){
    this.skinNode = pilotObject.fetchData("スキン");;
  }
  convrtTarget(targetArea,template){
    var writer = new FinalJsonDB(targetArea,template);
    writer.objectConstructor = SkinPilotObject;
    writer.setJsonData(this.skinNode);
    writer.convert();
  }
}

class PilotInStory extends FinalJsonDB
{
  constructor(targetTag,template) {
    super(targetTag,template);
    this.storys = {};
    this.nicknames = {};
    this.storyListPath = "https://final-hogen.github.io/final-reader/ストーリー選択.html";
    this.storyPath = "https://final-hogen.github.io/final-reader/?story=";
  }
  load(callback=null)
  {
    this.ajaxLoad(this.storyListPath,null,'onLoadPage',callback);
  }
  onLoadPage(loadData, params){
    this.loadTrs = this.getElementsByXPath(".//tr",loadData);
    for(var tr of this.loadTrs){
      this.paseTrData(tr);
    }
    if(params!=null)params();
  }
  setNickname(baseNode){
    this.nicknames = FinalPilotData.getNickname(baseNode);
  }
  getNicknames(name){
    var result = [];
    for( var nick in this.nicknames ){
      if( this.nicknames[nick]!=name )continue;
      result.push(nick);
    }
    return result;
  }
  checkInName(name){
    var storys = Object.values(this.storys);
    var nicknames = this.getNicknames(name);
    var result = [];
    for(var story of storys ){
      for(var nick of nicknames ){
        if(story["パイロット"].includes(nick)){
          result.push(story);
          break;
        }
      }
    }
    this.setJsonData(result);
    return result;
  }

  paseTrData(trNode){
    var ankerNodes = this.getElementsByXPath(".//a",trNode);
    if(ankerNodes.length<=0)return;

    var title = ankerNodes[0].innerText;
    var href = ankerNodes[0].getAttribute("href");
    var pilotsNodes = this.getElementsByXPath(".//td",trNode);
    var start = href.indexOf("'");
    var end = href.lastIndexOf("'");
    var file = href.substring(start+1,end);
    file = file.replace(".json","");
    var pilots = pilotsNodes[0].innerText;
    var splitPilot = pilots.split(",");
    var result = {"タイトル":title,"パイロット":splitPilot,"ファイル":file};
    this.storys[title] = result;
  }
}

class StatusCircle
{
  static polygonScale = [  // 0から100 xy
    [0,-50],
    [47.5528258147577,-15.4508497187474],
    [29.3892626146237,40.4508497187474],
    [-29.3892626146237,40.4508497187474],
    [-47.5528258147577,-15.4508497187474],
  ];
  static centerPoint = 50;
  constructor(node){
    var SSRcount = 0;
    var Max = {"耐久":0,"攻撃":0,"防御":0,"回避":0,"会心":0};
    var SSRSum = {"耐久":0,"攻撃":0,"防御":0,"回避":0,"会心":0};
    for(let i in node){
      let pilot = node[i];
      let staus = pilot["ステータス"]["ステ合計"];
      let isSSR = pilot["レアリティ"]=="SSR";
      for(let key in Max){
        Max[key] = Math.max(Max[key],staus[key]);
      }
      if(isSSR){
        for(let key in SSRSum){
          SSRSum[key] += parseInt(staus[key]);
        }
        ++SSRcount;
      }
    }
    for(let key in SSRSum){
      SSRSum[key] /= SSRcount;
    }
    this.maxStatus = Max;
    this.aveStatus = SSRSum;
  }
  getPascentArray(status){
    return [
      (status["耐久"])/(this.maxStatus["耐久"]),
      (status["攻撃"])/(this.maxStatus["攻撃"]),
      (status["防御"])/(this.maxStatus["防御"]),
      (status["回避"])/(this.maxStatus["回避"]),
      (status["会心"])/(this.maxStatus["会心"]),
    ];
  }
  getPilotObjectCSS(piotObject){
    let array = this.getPascentArray(piotObject.fetchData("ステータス/ステ合計"));
    return StatusCircle.joinCSS(StatusCircle.makePolygon(array));
  }
  getPilotObjectPolygon(piotObject){
    let array = this.getPascentArray(piotObject.fetchData("ステータス/ステ合計"));
    return StatusCircle.joinSVG(StatusCircle.makePolygon(array));
  }
  getAvePolygon(){
    return StatusCircle.joinSVG(StatusCircle.makePolygon(this.getPascentArray(this.aveStatus)));
  }
  getMaxPolygon(){
    return StatusCircle.joinSVG(makePolygon([1,1,1,1,1]));
  }
  static makePolygon(pacentArray){
    var result = [];
    for(let i in pacentArray){
      let s = [StatusCircle.polygonScale[i][0] * pacentArray[i]+this.centerPoint
        ,StatusCircle.polygonScale[i][1] * pacentArray[i]+this.centerPoint];
        result.push(s);
    }
    return result;
  }
  static joinCSS(polygon){
    var join = [];
    for(let i in polygon){
      let xy = polygon[i];
      var xystr = xy[0]+"% "+xy[1]+"%";
      join.push(xystr);
    }
    return "clip-path: polygon("+join.join(",")+");";
  }
  static joinSVG(polygon){
    var join = [];
    for(let i in polygon){
      let xy = polygon[i];
      var xystr = xy[0]+","+xy[1];
      join.push(xystr);
    }
    return join.join(" ");
  }
}
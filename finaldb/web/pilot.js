
class FinalPilotData{
  static getNickname(baseNode){
    var result = {};
    for(var name in baseNode){
      result[name] = name;
    }
    result["カーティス"] = "カーティス・ベルナル";
    result["コディス"] = "カーティス・ベルナル";
    result["タイシア"] = "タイシア・グラフト";
    result["シャルン"] = "シャロン";
    result["ザンテ"] = "ジェンシ";
    result["ストレンジャー"] = "ザ・ストレンジャー";
    result["変異体イブリン"] = "イブリン（変異体）";
    result["ミラベル"] = "ミラベル・デコリー";
    result["モルガン"] = "モルガン・ヘリング";
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
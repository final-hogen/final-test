
class BloodPilotData extends FinalJsonObject
{
  constructor(node) {
    super(node);
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
    this.convertArray([this.innerObjects[this.viewPilotName]]);
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
    for(var name in baseNode){
      this.nicknames[name] = name;
    }
    this.nicknames["カーティス"] = "カーティス・ベルナル";
    this.nicknames["コディス"] = "カーティス・ベルナル";
    this.nicknames["タイシア"] = "タイシア・グラフト";
    this.nicknames["シャルン"] = "シャロン";
    this.nicknames["ザンテ"] = "ジェンシ";
    this.nicknames["ストレンジャー"] = "ザ・ストレンジャー";
    this.nicknames["変異体イブリン"] = "イブリン（変異体）";
    this.nicknames["ミラベル"] = "ミラベル・デコリー";
    this.nicknames["モルガン"] = "モルガン・ヘリング";
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
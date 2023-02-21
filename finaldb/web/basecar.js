
class BasecarSkillObject extends FinalJsonObject{
  static myConverter = null;
  constructor(node,index,facetemplate) {
    super(node,index);
    this.pilotList = [];
    this.faceTemplate = facetemplate;
    this.typeSet = new Set();
  }
  fetchString(path){
    switch(path){
      case "天性": return Array.from(this.typeSet).join(' ');
    }
    return super.fetchString(path);
  }
  addPilot(object){
    this.pilotList.push(object);
    this.typeSet.add(object.myIndex);
  }
  getConverter(parentNode){
    if(BasecarSkillObject.myConverter){
      BasecarSkillObject.myConverter.replaceTarget = parentNode;
    }else{
      BasecarSkillObject.myConverter = new FinalJsonDB(parentNode,this.faceTemplate);
    }
    return BasecarSkillObject.myConverter;
  }
  setPilotNodes(parentNode){
    this.pilotList.sort(this.comparePilot);
    var converter = this.getConverter(parentNode);
    converter.convertArray(this.pilotList);
  }
  static sortOederRare(rare){
    switch(rare){
      case "N":return 0;
      case "R":return -1;
      case "SR":return -2;
      case "SSR":return -3;
      case "UR":return -4;
    }
    return -1;
  }
  static sortOederType(rare){
    switch(rare){
      case "感情":return 0;
      case "体質":return 1;
      case "敏捷":return 2;
      case "製造":return 3;
      case "知恵":return 4;
      case "固有":return 4;
    }
    return -1;
  }
  comparePilot(a,b){
    var a_type = BasecarSkillObject.sortOederType(a.myIndex);
    var b_type = BasecarSkillObject.sortOederType(b.myIndex);
    if(a_type>b_type)return -1; //a前
    if(a_type<b_type)return   1; //b前
    var a_rare = BasecarSkillObject.sortOederRare(a.fetchString('レアリティ'));
    var b_rare = BasecarSkillObject.sortOederRare(b.fetchString('レアリティ'));
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

class BasecarSkillDB extends FinalJsonDBInsert
{
  constructor(template,facetemplate){
    super(template);
    this.dummyTag = document.createElement("tbody");
    this.pailotXpath = ".//td[@data-facetarget]";
    this.faceTemplate = facetemplate;
  }
  setJsonData(data){
    this.baseNode = data;
    this.innerObjects = {};
    for (const [key, value] of Object.entries(data)) {
      let carskill = value["ベースカー"]["スキル"];
      for ( var [type, skill] of Object.entries(carskill)) {
        if(type!="固有")skill = skill["5"];
        let name = skill["名前"];
        if(this.innerObjects[name]==undefined){
          this.innerObjects[name] = new BasecarSkillObject(skill,name,this.faceTemplate);
        }
        this.innerObjects[name].addPilot(this.getPilotObject(type,value));
      }
    }
  }
  getPilotObject(type,node){
    var result = new FinalJsonObject(node,type);
    return result;
  }
  convertArray(objects){
    var results = new Array();
    for(var i in objects){
      var newTagString = objects[i].convertString(this.templateString,this.templateMatches);
      this.dummyTag.innerHTML = newTagString;
      var newTag = this.dummyTag.firstChild;
      let PilottargetNode = this.getElementsByXPath(this.pailotXpath,newTag)[0];
      objects[i].setPilotNodes(PilottargetNode);
      results.push(newTag);
    }
    this.inputTags(results);
  }
  /**
   * 比較関数 レア、名前の順に比較
   * @param {*} a 
   * @param {*} b 
   */
  compareFn(a,b){
    var a_rare = BasecarSkillDB.sort
    var a_name = a.fetchString('名前');
    var b_name = b.fetchString('名前');
    if(a_name==null&b_name==null)return 0;
    if(a_name==null)return  1;   //b前
    if(b_name==null)return  -1;  //a前
    return a_name.localeCompare(b_name);
  }
}
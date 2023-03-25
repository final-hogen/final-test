
class WeponListObject extends FinalJsonObject{
  constructor(node,index) {
    super(node,index);
    let status = node.基本性能;
    //status = node.専用機性能 || node.基本性能;
    let speed = this.getAveAttackSpeed(status);
    this.energy = (status.エネルギー回復 * speed);
    this.attack = (status.武器倍率 * speed);
  }
  getAveAttackSpeed(status){
    let animations = status.攻撃動作;
    let length = animations.length;
    if(length<=0)return 0;
    let sumSpeed = 0;
    for(let i=0;i<length;++i){
      sumSpeed += animations[i].攻撃速度;
    }
    return (sumSpeed/length);
  }
  fetchData(path){
    if(path=="energy")return this.energy.toFixed(1);
    if(path=="attack")return this.attack.toFixed(2);
    return super.fetchData(path);
  }
}
class PartsObject extends FinalJsonObject{
  fetchString(path){
    if(path=="種類")return super.fetchString(path).substring(0,2);
    if(path=="衝撃耐性/ノックバック")return Math.round(super.fetchString(path)*100);
    return super.fetchString(path);
  }
}

class WeponInfoObject extends FinalJsonObject{
  static attackspeed_template = null;
  static attackproperty_template = null;
  constructor(node,index) {
    super(node,index);
    this.attackspeed = this.makeTemplateData(WeponInfoObject.attackspeed_template);
    this.attackproperty = this.makeTemplateData(WeponInfoObject.attackproperty_template);
  }
  makeTemplateData(template){
    let result = {string:"",matches:null};
    let clone = template.cloneNode(true);
    clone.removeAttribute('id');
    result.string = clone.outerHTML;
    result.matches = result.string.match( /\{([^\}]*)\}/g);
    return result;
  }
  fetchData(path){
    if(path=="attackspeed")return this.makeAttackSpeed();
    if(path=="attackproperty")return this.makeAttackProperty();
    if(path=="攻撃速度")return super.fetchData(path).toFixed(1);
    if(path=="攻撃倍率")return this.makeAttackRate(path);
    if(path=="チャージ時間")return super.fetchData(path)||"なし";
    if(path=="貫通力")return super.fetchData(path)||"無制限";
    return super.fetchData(path);
  }
  makeInnerNode(nodeList,template){
    let oldNode = this.baseNode;
    let result ="";
    for( let node of nodeList){
      this.baseNode = node;
      result += this.convertString(template.string, template.matches);
    }
    this.baseNode = oldNode;;
    return result;
  }
  makeAttackRate(path){
    let node = super.fetchData(path);
    if(!node)return false;
    let view = [];
    for(let value of node){
      view.push(value*100.0);
    }
    return view.join("%, ")+"%";
  }
  makeAttackSpeed(){
    let orignalSpeed = {攻撃速度:this.baseNode.攻撃速度};
    let nodeList = this.baseNode.攻撃動作.concat(orignalSpeed);
    return this.makeInnerNode(nodeList, this.attackspeed);
  }
  makeAttackProperty(){
    let nodeList = {};
    for( let node of this.baseNode.攻撃特性){
      let str = JSON.stringify(node);
      nodeList[str] = node;
    }
    return this.makeInnerNode(Object.values(nodeList), this.attackproperty);
  }
}

function ConvertTemplateSingleNode(node, template, constructor=PartsObject){
  if(!node)return;
  var db = new FinalJsonDBInsert(template);
  db.objectConstructor = constructor;
  db.setJsonData({0:node});
  db.convert();
}


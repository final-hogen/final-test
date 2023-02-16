
class BloodPilotData extends FinalJsonObject
{
  constructor(node) {
    super(node);
    var blood = this.fetchString("情報/血液型");
    blood = blood.replaceAll("&"," ").replaceAll("＆"," ");
    this.writeData("blood",blood);
  }
}

// ajaxしょり
class FinalVoice {
  constructor() {
    this.langScope = 'ja-JP';
    //this.langScope = 'ja-JP|ko-KR|en-GB|de-DE|es-ES|es-US|pl-PL|zh-CN|pt-BR|fr-FR|nl-NL|zh-TW';
    this.useOK = !!window.speechSynthesis;
    this.enableVoices = {}
    this.resetEnableVoices(); //バグ対応
    this.resetEnableVoices();
    var that = this;
    window.speechSynthesis.onvoiceschanged = function(){
      that.resetEnableVoices();
    }
    this.voices = {};
  }
  /**
   * ボイス設定のリセット
   */
  resetVoiceSetting(){
    this.voices = {};
  }
  /**
   * 使えるボイスのリセット
   */
  resetEnableVoices() {
    if(!this.useOK)return;
    var voices = window.speechSynthesis.getVoices();
    for(var i = 0; i < voices.length; i++) {
      var voice = voices[i];
      if(this.langScope && !voice.lang.match(this.langScope))continue;
      this.enableVoices[voice.name] = voice;
    }
    this.enableVoices['unknown']=null;
  }
  makeVoiceData(setVoice,setPitch,setRate){
    return {voice:setVoice,pitch:setPitch,rate:setRate};
  }
  /**
   * ランダムで不使用ボイスを取得
   */
  getRandomVoice(){
    var useVoice = null;
    var enableKeys = Object.keys(this.enableVoices);
    if(enableKeys.length>0){
      var usedKeys = [];
      Object.values(this.voices).forEach(voice=>{if(voice.voice){usedKeys.push(voice.voice.name)}});
      var voices = enableKeys.filter(name => !usedKeys.includes(name) );
      if(voices.length<=0)voices = Object.keys(this.enableVoices);
      var voiceIndex = Math.floor(Math.random() * voices.length);
      var useVoice = this.enableVoices[voices[voiceIndex]];
    }
    var pitch = 1.0+(Math.random()*0.8);
    var rate = 1.0+(Math.random()*0.2);
    return this.makeVoiceData(useVoice,pitch,rate);
  }
  /**
   * 声取得(ない時ランダム設定))
   * @param {キャラ名} name 
   */
  getVoice(name){
    if(this.voices[name])return this.voices[name];
    var newVoice = this.getRandomVoice();
    this.voices[name] = newVoice;
    return newVoice;
  }
  /**
   * 話す
   * @param {キャラ名} name 
   * @param {セリフ} text 
   */
  speak(name, text){
    if(!this.useOK)return;
    text = text.replace(/(<([^>]+)>)/gi, '');
    window.speechSynthesis.cancel();
    var speech = new SpeechSynthesisUtterance(text);
    var voice = this.getVoice(name);
    speech.voice = voice.voice;
    speech.pitch = voice.pitch;
    speech.rate = voice.rate;
    window.speechSynthesis.speak(speech);
  }
}

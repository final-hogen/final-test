
/**
 * テーブルを検索した感じにする
 */
class FinalSearchTable{
  constructor(table,input1,input2){
    this.tableNode = table;
    this.inpu1Node = input1;
    this.inpu2Node = input2;

    var that = this;
    input1.oninput = function(event){that.onInput(event)};
    input2.oninput = function(event){that.onInput(event)};
    this.tagetTrList = FinalSearchTable.getElementsByXPath(".//tr[@data-search-word]",table);
  }
  /**
   * 入力発生イベント
   * @param {*} event 
   */
  onInput(event){
    this.update();
  }
  /**
   * テーブル更新
   */
  update(){
    const text1 = this.inpu1Node.value;
    const text2 = this.inpu2Node.value;
    const split1 = (!text1)?([]):(text1.trim().toUpperCase().split(/[\s\u3000]+/));
    const split2 = (!text2)?([]):(text2.trim().toUpperCase().split(/[\s\u3000]+/));
    for(let trNode of this.tagetTrList){
      this.updateSingle(trNode,split1,split2);
    }
  }
  /**
   * TR 一つ更新
   * @param {*} trNode 
   * @param {*} spilit1 
   * @param {*} split2 
   */
  updateSingle(trNode,split1,split2){
    const searchWord = trNode.getAttribute("data-search-word");
    var result = true;
    if(split1.length>0&&split2.length>0)result = this.check(searchWord,split1)||this.check(searchWord,split2);
    else if(split1.length>0)result = this.check(searchWord,split1);
    else if(split2.length>0)result = this.check(searchWord,split2);

    trNode.setAttribute("data-view",(result)?("true"):("false"));
    if(result)this.setHighlight(trNode,searchWord,split1.concat(split2))
  }
  setHighlight(trNode,searchWord,splitWords){
    var targets = FinalSearchTable.getElementsByXPath(".//td[@data-highlight]",trNode);
    splitWords.sort();
    splitWords.reverse();
    for( const word of splitWords){
      searchWord = searchWord.replaceAll(word,'<span class="highlight">'+word+'</span>')
    }
    for( const target of targets){
      target.innerHTML = searchWord;
    }
  }
  /**
   * and 検索
   * @param {*} search 
   * @param {*} splitwords 
   * @returns 
   */
  check(search,splitwords){
    if(!splitwords)return true;
    for( let word of splitwords){
      if(!word)continue;
      if(search.indexOf(word)<0)return false;
    }
    return true;
  }
  /**
   * xpath 検索
   * @param {*} expression 
   * @param {*} parentElement 
   * @returns 
   */
  static getElementsByXPath(expression, parentElement) {
    var r = []
    var x = document.evaluate(expression, parentElement || document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
    for (var i = 0, l = x.snapshotLength; i < l; i++) {
        r.push(x.snapshotItem(i))
    }
    return r;
  }
}
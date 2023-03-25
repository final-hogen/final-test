
class FinalSortTable{
  constructor(tableNode){
    var that = this;
    this.table = tableNode;
    tableNode.querySelectorAll('th').forEach(th => th.onclick
      =function(){that.sortRows(th)});
    this.tbody = tableNode.rows[1].parentElement;
  }
  sortRows(th){
    let records = this.getRecords(th);
    let that = this;
    records.sort(function(a,b){return that.compareKeys(a.key,b.key)});
    for (let i = 0; i < records.length; i++) {
      this.tbody.appendChild(records[i].row);
    }
  }
  getRecords(th){
    let table = this.table;
    let records = [];
    for (let i = 1; i < table.rows.length; i++) {
      let record = {};
      record.row = table.rows[i];
      record.key = table.rows[i].cells[th.cellIndex].textContent;
      records.push(record);
    }
    return records;
  }
  compareKeys(a, b) {
    if(this.isNumber(a))return this.compareKeysNumber(a,b);
    return a.localeCompare(b);
  }
  compareKeysNumber(a, b){
    const c = b-a;
    if(c>0)return 1;
    if(c<0)return -1;
    return 0;
  }
  isNumber(n){
    const v = n - 0;
    if ( v || v === 0 ) {
      return true;
    }
    return false;
  }
}

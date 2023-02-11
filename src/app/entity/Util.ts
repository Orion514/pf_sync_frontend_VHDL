export class Util {
  getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split('=');
      if(pair[0] == variable){return pair[1];}
    }
    return '';
  }

  cookieToJson() {
    let cookieArr = document.cookie.split(";");
    let obj = {};
    cookieArr.forEach((i) => {
      let arr = i.split("=");
      if(arr[0].slice(0, 1) == ' ') {
        arr[0] = arr[0].slice(1);
      }
      obj[arr[0]] = arr[1];
    });
    return obj;
  }
}

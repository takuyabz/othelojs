window.onload = function () {
  init();
  setInterval(() => {
    game.frame++;
    if (this.game.frame % 5 == 0) {
      game.toggle = !game.toggle;
    }
    // 
    if (this.game.frame % 20 == 0) {
      playingAI();
    }
    show();
  }, 100);
}

function styling(styles) {
  var result = "";
  for (var p in styles) {
    result += `${p}:${styles[p]};`;
  }
  return result;
}

var config = {
  W: 340,
  H: 340,
  N: 8
};

var game = {
  pX: 0,
  pY: 0,
  current: "B",
  validate: false,
  toggle: true,
  frame: 0,
  modeW: "Player", // or AI
  modeB: "Player" // or AI
};

var dv = [
  { x: 0, y: -1 },
  { x: 1, y: -1 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
  { x: -1, y: 1 },
  { x: -1, y: 0 },
  { x: -1, y: -1 },
];

var map = [];

function mapInit() {
  map = new Array(config.N);
  for (i = 0; i < config.N; i++) {
    var row = new Array(config.N);
    for (j = 0; j < config.N; j++) {
      var s = "N";
      if (i == config.N / 2 && j == config.N / 2) {
        s = "W";
      } else if (i + 1 == config.N / 2 && j + 1 == config.N / 2) {
        s = "W";
      } else if (i + 1 == config.N / 2 && j == config.N / 2) {
        s = "B";
      } else if (i == config.N / 2 && j + 1 == config.N / 2) {
        s = "B";
      }
      // s: "N" -> "NONE", "W" -> "WHITE", "B" -> "BLACK"
      row[j] = { y: i, x: j, s: s, p: "", d: null };
    }
    map[i] = row;
  }
}

function stoneVal(s) {
  if (s == "N") {
    return "";
  } else if (s == "W") {
    return "○";
  } else if (s == "B") {
    return "●";
  } else {
    return "";
  }
}

function show() {
  for (i = 0; i < config.N; i++) {
    for (j = 0; j < config.N; j++) {
      map[i][j].d.innerText = stoneVal(map[i][j].s);
      if (i == game.pY && j == game.pX && game.validate == true) {
        map[i][j].d.innerText = stoneVal(game.current);
        map[i][j].d.style.color = "black";
      }
      else if (map[i][j].p != "" && game.toggle) {
        map[i][j].d.style.color = "white";
        map[i][j].d.innerText = stoneVal(map[i][j].p);
      }
    }
  }
}

function canReverse(pY, pX) {
  var validate = false;
  var dvmap = [];

  // 隣接領域に石があるかを確認
  for (i = 0; i < dv.length; i++) {
    var y = parseInt(pY) + parseInt(dv[i].y);
    var x = parseInt(pX) + parseInt(dv[i].x);
    if (y < 0) continue;
    if (x < 0) continue;
    if (y >= config.N) continue;
    if (x >= config.N) continue;

    // 隣接領域に一つ以上石がある
    if (map[y][x].s != "N") {
      dvmap.push({ y: dv[i].y, x: dv[i].x });
    }
  }

  // ひっくり返せるかを確認
  // 条件は、隣に一つ以上異なる石があり、二つ以上先に同じ色がある
  for (i = 0; i < dvmap.length; i++) {
    var start = false;
    for (j = 1; j <= 8; j++) {
      var y = parseInt(pY) + parseInt(dvmap[i].y) * j;
      var x = parseInt(pX) + parseInt(dvmap[i].x) * j;
      if (y < 0) break;
      if (x < 0) break;
      if (y >= config.N) break;
      if (x >= config.N) break;
      if (j == 1) {
        if (map[y][x].s != game.current) {
          start = true;
        }
      }
      if (map[y][x].s == "N") break;
      if (map[y][x].s == game.current && start) {
        validate = true;
        break;
      }
    }
    if (validate) {
      break;
    }
  }

  return validate;
}

function updateValidate() {
  var result = false;
  // 石が置かれていたら 置けない
  if (map[game.pY][game.pX].s != "N") {
    result = false;
  }
  // ひっくり返せなければ　置けない
  else if (!canReverse(game.pY, game.pX)) {
    result = false;
  } else {
    //　石おける
    result = true;
  }
  game.validate = result;
}

function refreshEnableStone() {
  var cnt = 0;
  var cntW, cntB;
  cntW = cntB = 0;
  for (ii = 0; ii < config.N; ii++) {
    for (jj = 0; jj < config.N; jj++) {
      if (map[ii][jj].s == "N" && canReverse(ii, jj)) {
        map[ii][jj].p = game.current;
        cnt++;
      } else {
        map[ii][jj].p = "";
      }
      if (map[ii][jj].s == "W") {
        cntW++;
      }
      if (map[ii][jj].s == "B") {
        cntB++;
      }

      if (game.pY != ii || game.pX != jj) {
        map[ii][jj].d.style.color = "black";
      }
    }
  }
  show();
  var stonesW = document.getElementById("stonesW");
  stonesW.innerText = ("00" + cntW).slice(-2);
  var stonesB = document.getElementById("stonesB");
  stonesB.innerText = ("00" + cntB).slice(-2);


  var modeW = document.getElementById("modeW");
  var modeB = document.getElementById("modeB");
  if (game.current == "B") {
    modeW.style.color = "black";
    modeB.style.color = "red";
  } else {
    modeW.style.color = "red";
    modeB.style.color = "black";
  }

  return cnt;
}

function putStone(row, col) {
  var dvmap = [];

  // 隣接領域に石があるかを確認
  for (i = 0; i < dv.length; i++) {
    var y = parseInt(row) + parseInt(dv[i].y);
    var x = parseInt(col) + parseInt(dv[i].x);
    if (y < 0) continue;
    if (x < 0) continue;
    if (y >= config.N) continue;
    if (x >= config.N) continue;

    // 隣接領域に一つ以上石がある
    if (map[y][x].s != "N") {
      dvmap.push({ y: dv[i].y, x: dv[i].x });
    }
  }

  // ひっくり返せるかを確認
  // 条件は、隣に一つ以上異なる石があり、二つ以上先に同じ色がある
  var dvvmap = [];
  for (i = 0; i < dvmap.length; i++) {
    for (j = 1; j <= 8; j++) {
      var y = parseInt(row) + parseInt(dvmap[i].y) * j;
      var x = parseInt(col) + parseInt(dvmap[i].x) * j;
      if (y < 0) break;
      if (x < 0) break;
      if (y >= config.N) break;
      if (x >= config.N) break;
      if (j == 1 && map[y][x].s == game.current) break;
      if (map[y][x].s == "N") break;
      if (map[y][x].s == game.current) {
        dvvmap.push({ y: dvmap[i].y, x: dvmap[i].x });
        break;
      }
    }
  }

  for (i = 0; i < dvvmap.length; i++) {
    for (j = 1; j <= 8; j++) {
      var y = parseInt(row) + parseInt(dvvmap[i].y) * j;
      var x = parseInt(col) + parseInt(dvvmap[i].x) * j;
      if (y < 0) break;
      if (x < 0) break;
      if (y >= config.N) break;
      if (x >= config.N) break;
      if (map[y][x].s == game.current) break;
      map[y][x].s = game.current;
      // console.log(map[y][x]);
    }
  };
  map[row][col].s = game.current;
}

function playingAI() {
  if (game.current == "W" && game.modeW != "AI") return false;
  if (game.current == "B" && game.modeB != "AI") return false;

  var canMap = [];
  for (i = 0; i < config.N; i++) {
    for (j = 0; j < config.N; j++) {
      if (map[i][j].p != "") {
        // console.log(i,j);
        canMap.push({ y: i, x: j });
      }
    }
  }
  if (canMap.length == 0) return false;
  var n = Math.floor(Math.random() * canMap.length);
  map[canMap[n].y][canMap[n].x].p = "";
  putStone(canMap[n].y, canMap[n].x);
  game.pY = canMap[n].y;
  game.pX = canMap[n].x;
  map[game.pY][game.pX].d.style.color = "red";
  show();
  if (game.current == "W") {
    game.current = "B";
  } else {
    game.current = "W";
  }
  var cnt = refreshEnableStone();
  if (cnt == 0) {
    // 
    alert("PASS!!");
    if (game.current == "W") {
      game.current = "B";
    } else {
      game.current = "W";
    }
    cnt = refreshEnableStone();
    if (cnt == 0) {
      show();
      alert("FINISH");
    }
  }
}

function init() {
  mapInit();
  var stage = document.getElementById("stage");
  var styles = {
    "width": `${config.W}px`,
    "height": `${config.W}px`,
    "padding": "0",
    "margin": "0 auto",
    "border": "1px solid #ccc"
  };
  stage.setAttribute("style", styling(styles));

  var info = document.getElementById("info");
  var styles2 = {
    "width": `${config.W}px`,
    "padding": "0",
    "margin": "1em auto",
    "border": "1px solid #ccc",
    "background-color": "lightgreen",
    "display": "flex",
    "text-align": "center"
  };

  info.setAttribute("style", styling(styles2));

  var info2 = document.getElementById("info2");
  var styles3 = {
    "width": `${config.W}px`,
    "padding": "0",
    "margin": "1em auto",
    "border": "1px solid #ccc",
    "background-color": "lightblue",
    "display": "flex",
    "text-align": "center"
  };

  var modeW = document.getElementById("modeW");
  var modeB = document.getElementById("modeB");
  modeW.setAttribute("style", "cursor:pointer");
  modeB.setAttribute("style", "cursor:pointer");
  modeW.onclick = (ev) => {
    if (game.modeW == "Player") {
      game.modeW = "AI";
    } else {
      game.modeW = "Player";
    }
    ev.target.innerText = game.modeW;
  };

  modeB.onclick = (ev) => {
    if (game.modeB == "Player") {
      game.modeB = "AI";
    } else {
      game.modeB = "Player";
    }
    ev.target.innerText = game.modeB;
  };

  if (game.current == "B") {
    modeW.style.color = "black";
    modeB.style.color = "red";
  } else {
    modeW.style.color = "red";
    modeB.style.color = "black";
  }

  info2.setAttribute("style", styling(styles3));

  for (i = 0; i < config.N; i++) {
    for (j = 0; j < config.N; j++) {
      var item = document.createElement("p");
      map[i][j].d = item;
      var itemW = (config.W - 2 * config.N) / config.N;
      var styles1 = {
        "padding": "0px",
        "margin": "0px",
        "display": "inline-block",
        "width": `${itemW}px`,
        "height": `${itemW}px`,
        "font-size": `${itemW}px`,
        "line-height": `${itemW}px`,
        "vertical-align": "bottom",
        "text-align": "center",
        "border": "1px solid black",
        "background-color": "lightgreen",
        "cursor": "pointer"
      }
      item.onclick = (e) => {
        if (game.current == "W" && game.modeW == "AI") return false;
        if (game.current == "B" && game.modeB == "AI") return false;
        // console.log(map);
        var item = e.target;
        var row = item.dataset.row;
        var col = item.dataset.col;
        if (map[row][col].s == "N" && canReverse(row, col)) {
          putStone(row, col);
          if (game.current == "W") {
            game.current = "B";
          } else {
            game.current = "W";
          }
          var cnt = refreshEnableStone();
          if (cnt == 0) {
            // 
            alert("PASS!!");
            if (game.current == "W") {
              game.current = "B";
            } else {
              game.current = "W";
            }
            cnt = refreshEnableStone();
            if (cnt == 0) {
              show();
              alert("FINISH");
            }
          }
          // console.log(map);
        }
      };
      item.onmouseenter = (e) => {
        if (game.current == "W" && game.modeW == "AI") return false;
        if (game.current == "B" && game.modeB == "AI") return false;
        var item = e.target;
        var row = item.dataset.row;
        var col = item.dataset.col;
        game.pY = row;
        game.pX = col;
        updateValidate();
        show();
      };
      item.dataset.row = i;
      item.dataset.col = j;
      item.setAttribute("style", styling(styles1));
      item.innerText = stoneVal(map[i][j].s);
      stage.appendChild(item);
    }
  }
  refreshEnableStone();
}

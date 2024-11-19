let readerText = null
let delayTime,
  index = Number();
index = 0;
let selectedString,
  no_words,
  fontSet,
  fontSize,
  wording,
  stringArr = [],
  playPauseFlag = 0,
  setWordLimit = Number();
function dragElement(e) {
  var t = 0,
    o = 0,
    n = 0,
    l = 0;
  function r(e) {
    (e = e || window.event).preventDefault(),
      (n = e.clientX),
      (l = e.clientY),
      (document.onmouseup = d),
      (document.onmousemove = i);
  }
  function i(r) {
    (r = r || window.event).preventDefault(),
      (t = n - r.clientX),
      (o = l - r.clientY),
      (n = r.clientX),
      (l = r.clientY),
      (e.style.top = e.offsetTop - o + "px"),
      (e.style.left = e.offsetLeft - t + "px");
  }
  function d() {
    (document.onmouseup = null), (document.onmousemove = null);
  }
  document.getElementById(e.id + "header")
    ? (document.getElementById(e.id + "header").onmousedown = r)
    : (e.onmousedown = r);
}
function changeColor() {
  "green" != document.getElementById("lbthchange").style.color || playPauseFlag
    ? ((playPauseFlag = 0),
      (document.getElementById("lbthchange").style.color = "green"),
      (document.getElementById("lbthchange").innerHTML = "Start"))
    : ((playPauseFlag = 1),
      showWords(),
      (document.getElementById("lbthchange").style.color = "red"),
      (document.getElementById("lbthchange").innerHTML = "Stop"));
}
function createOption(e) {
  let t = document.createElement("option");
  return (t.value = e), (t.innerText = e), t;
}
window.createPopupOnScreen = (e) => {

  if (document.querySelector("#lbth_main") && document.querySelector('#lbthchange')){
      document.getElementById("lbthmydiv").style.display = "block",
      document.getElementById("lbthmydiv").style.cursor = "pointer";
  }else {

    var t = document.createElement("div");
    (t.id = "lbth_main"),
      document.body.prepend(t),
      (document.getElementById("lbth_main").style.zIndex = "99999999"),
      fetch(chrome.runtime.getURL("/scripts/speed-reader/speed-reader.html"))
        .then((e) => e.text())
        .then((e) => {
          t.innerHTML = e;
          let o = document.getElementById("lbthSelectorId");
          for (let e = 2; e <= 8; e++) {
            let t = createOption(100 * e);
            o.append(t);
          }
          no_words = document.getElementById("no_words");
          for (let e = 1; e <= 8; e++) {
            let t = createOption(e);
            no_words.append(t);
          }
          fontSet = document.getElementById("fontSize");
          for (let e = 4; e <= 20; e++) {
            let t = createOption(5 * e);
            fontSet.append(t);
          }
          fontSet.value = 60;
          dragElement(document.getElementById("lbthmydiv")),
            (document.getElementById("lbthchange").onclick = changeColor),
            document.getElementById("lbthchange").click(),
            (document.getElementById("lbthSelectorId").onchange = (e) => {
              let t = e.target.value;
              chrome.storage.local.set({ setTime: t }).then(() => {
                console.log("Value is set to " + t);
              }),
                (delayTime = calLoopTime(t));
            }),
            document
              .getElementById("closePopup")
              .addEventListener("click", () => {
                (document.getElementById("lbthmydiv").style.display = "none"),
                  changeColor();
              }),
            document
              .getElementById("removePopup")
              .addEventListener("click", () => {
                (index = 0),
                  (stringArr = []),
                  sleep(1e3).then((e) => {
                    console.log(e);
                  }),
                  document.getElementById("lbth_main").remove();
              }),
            (document.getElementById("undoImg").src =
              chrome.runtime.getURL("images/undo.png")),
            (document.getElementById("redoImg").src =
              chrome.runtime.getURL("images/redo1.png")),
            (document.getElementById("closePopup").src = chrome.runtime.getURL(
              "images/minimize.png"
            )),
            (document.getElementById("removePopup").src =
              chrome.runtime.getURL("images/close.png")),
            (document.getElementById("closePopup").style.cursor = "pointer"),
            (document.getElementById("removePopup").style.cursor = "pointer"),
            (selectedString = window.getSelection().toString() || readerText.toString()),
            chrome.storage.local.get(["setTime"]).then((e) => {
              console.log("Value currently is " + e.setTime),
                console.log(e),
                e.setTime
                  ? setTimeout(() => {
                      console.log("have m,ore"),
                        (document.getElementById("lbthSelectorId").value =
                          e.setTime),
                        (delayTime = calLoopTime(Number(e.setTime)));
                    }, 1e3)
                  : (console.log("no local wordlimit!"),
                    (delayTime = calLoopTime(200)));
            }),
            (stringArr = stringBreak(selectedString)),
            console.log(stringArr),
            console.log(no_words),
            showWords(),
            (document.getElementById("undoImg").onclick = () =>
              timeChange("back")),
            (document.getElementById("redoImg").onclick = () =>
              timeChange("forward"));
        })
        .catch((e) => {
          console.warn(e);
        }),
      chrome.storage.local.get().then((e) => {
        console.log(e);
      }),
      chrome.storage.local.get(["font"]).then((e) => {
        console.log("Value currently is " + e.font),
          e.font
            ? setTimeout(() => {
                (document.getElementById("myTextModalLabel").style.fontSize =
                  e.font + "px"),
                  (fontSet.value = e.font);
              }, 1e3)
            : console.log("no local font!");
      }),
      chrome.storage.local.get(["wordLimit"]).then((e) => {
        console.log("Value currently is " + e.wordLimit),
          e.wordLimit
            ? setTimeout(() => {
                (setWordLimit = e.wordLimit), (no_words.value = e.wordLimit);
              }, 1e3)
            : console.log("no local wordlimit!");
      });
  }
}
function sleep(e) {
  return new Promise((t) => setTimeout(t, e));
}
console.log(setWordLimit),
//   chrome.runtime.onMessage.addListener(function (e, t, o) {
//     console.log("Request =>", e),
//       window.getSelection()
//         ? createPopupOnScreen()
//         : console.log("please select text");
//   });
  window.speedRead = (text) => {
    readerText = text
    window.getSelection() || readerText
    ? createPopupOnScreen()
    : console.log("please select text");
  }
const stringBreak = (e) => {
  let t = e.split(" "),
    o = [];
  return (
    t.forEach((e) => {
      e && o.push(e);
    }),
    o
  );
};
function calLoopTime(e) {
  return 1e3 / (e / 60);
}
async function showWords() {
  (document.getElementById("lbthmydivheader").style.maxHeight = "250px"),
    (document.getElementById("lbthmydivheader").style.minHeight = "250px"),
    (document.getElementById("lbthmydivheader").style.padding = "25px"),
    (document.getElementById("lbthmydivheader").style.overflowY = "auto"),
    console.log(setWordLimit),
    console.log(index),
    checkWordLimit();
  let e = [];
  if (
    ((e = stringArr.slice(index, index + setWordLimit)),
    console.log(e),
    (data = e.join(" ")),
    console.log(data),
    console.log(typeof data),
    (document.getElementById("myTextModalLabel").innerHTML = data),
    await sleep(delayTime),
    (index += setWordLimit),
    index < stringArr.length && playPauseFlag)
  )
    showWords();
  else if (index >= stringArr.length) {
    document.querySelector("#lbth_main") &&
      ((index = 0),
      (stringArr = []),
      await sleep(1e3),
      document.getElementById("lbth_main").remove());
  }
}
function timeChange(e) {
  const t = e;
  console.log(e);
  var o = index,
    n = delayTime * o;
  if ((console.log("origmal currentTime =>", o, n), "back" === t)) {
    const e = delayTime * o;
    (n -= 1e4),
      console.log("currentTime =>", n),
      -1 === Math.sign(n)
        ? (console.log(stringArr[0]),
          (index = 0),
          (data = stringArr[index]),
          (document.getElementById("myTextModalLabel").innerHTML = data))
        : (console.log(
            stringArr[Math.floor((n * o) / e)],
            o,
            Math.floor((n * o) / e),
            stringArr.length
          ),
          (index = Math.floor((n * o) / e)),
          (data = stringArr[index]),
          (document.getElementById("myTextModalLabel").innerHTML = data));
  } else if ("forward" === t) {
    const e = delayTime * o;
    (n += 1e4),
      console.log("currentTime =>", n),
      n > delayTime * stringArr.length
        ? (console.log(stringArr[stringArr.length - 1]),
          (index = stringArr.length - 1),
          (data = stringArr[index]),
          (document.getElementById("myTextModalLabel").innerHTML = data))
        : n < delayTime * stringArr.length &&
          ((index = Math.floor((n * o) / e)),
          (data = stringArr[index]),
          (document.getElementById("myTextModalLabel").innerHTML = data),
          console.log(Math.floor((n * o) / e)),
          console.log(
            stringArr[Math.floor((n * o) / e) - 1],
            o,
            Math.floor((n * o) / e),
            stringArr.length
          ));
  }
}
function checkWordLimit() {
  console.log(no_words.value);
  setWordLimit = Number(no_words.value)
  wording      = Number(no_words.value)
  chrome.storage.local.set({ wordLimit: wording }).then(() => {
    console.log("Value is set to " + wording)
    no_words.value = wording
  })
  fontSize = Number(fontSet.value)
  console.log("fontSize =>", fontSize, fontSet);
  document.getElementById("myTextModalLabel").style.fontSize = fontSize + "px"
  chrome.storage.local.set({ font: 60  }).then(() => {
    console.log("Value is set to " + fontSize)
    fontSet.value = fontSize
  });
}

// const mediumHighlighter = document.createElement("medium-highlighter");
// document.body.appendChild(mediumHighlighter);

// const setMarkerPosition = (markerPosition) =>
//   mediumHighlighter.setAttribute(
//     "markerPosition",
//     JSON.stringify(markerPosition)
//   );

// const getSelectedText = () => window.getSelection().toString();

// document.addEventListener("click", () => {
//   if (getSelectedText().length > 0) {
//     setMarkerPosition(getMarkerPosition());
//   }
// });

// document.addEventListener("selectionchange", () => {
//   if (getSelectedText().length === 0) {
//     setMarkerPosition({ display: "none" });
//   }
// });

// document.addEventListener("scroll", function(e) {
//   setMarkerPosition({ display: "none" })
// })

// function getMarkerPosition() {
//   const rangeBounds = window
//     .getSelection()
//     .getRangeAt(0)
//     .getBoundingClientRect();
  
//   return {
//     // Substract width of marker button -> 40px / 2 = 20
//     // left: window.getSelection().toString().length,
//     // top: rangeBounds.bottom,
//     left: rangeBounds.left + rangeBounds.width / 2 - 100,
//     top: rangeBounds.top - 30,
//     display: "flex",
//   };
  
// }

window.enableFloatMenu = () => {
  try {
    const value = window.localStorage.getItem("CT_ENABLE_FLOAT_MENU")
    if(value === 'SHOW'){
      const highlighter = document.querySelector('#medium-highlighter')
      if(highlighter){
        highlighter.style.display = 'flex'
      }
      else{
    const mediumHighlighter = document.createElement("medium-highlighter");
    mediumHighlighter.setAttribute('id','medium-highlighter')
    document.body.appendChild(mediumHighlighter);

    const setMarkerPosition = (markerPosition) =>
      mediumHighlighter.setAttribute(
        "markerPosition",
        JSON.stringify(markerPosition)
      );

    const getSelectedText = () => window.getSelection().toString();

    document.addEventListener("click", () => {
      if (getSelectedText().length > 0) {
        setMarkerPosition(getMarkerPosition());
      }
    });

    document.addEventListener("selectionchange", () => {
      if (getSelectedText().length === 0) {
        setMarkerPosition({ display: "none" });
      }
    });

    document.addEventListener("scroll", function(e) {
      setMarkerPosition({ display: "none" })
    })

    function getMarkerPosition() {
      const rangeBounds = window
        .getSelection()
        .getRangeAt(0)
        .getBoundingClientRect();
      
      return {
        // Substract width of marker button -> 40px / 2 = 20
        // left: window.getSelection().toString().length,
        // top: rangeBounds.bottom,
        left: rangeBounds.left + rangeBounds.width / 2 - 100,
        top: rangeBounds.top - 30,
        display: "flex",
      };
      
    }
      }

      return;
    } 

    if(value === 'HIDE'){
        const mediumHighlighter = document.querySelector('#medium-highlighter')
        if(mediumHighlighter){
          mediumHighlighter.style.display = 'none'
        }
        return;
    }
  } catch (e) {
    console.log("Error in set float menu", e)
  }

}

window.enableFloatMenu()
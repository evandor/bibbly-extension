// Hooks added here have a bridge allowing communication between the Web Page and the BEX Content Script.
// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/dom-hooks
import {bexDom} from 'quasar/wrappers'
import {diffChars} from "diff"
import {useUtils} from "src/core/services/Utils";

// import {execute} from 'htmldiff-js';

const {sendMsg} = useUtils()

export default bexDom((bridge) => {

  // function getCEOfCaret() {
  //   const selection = window.getSelection()
  //   if (!selection) {
  //     console.log("no selection")
  //     return null
  //   }
  //   if (selection.rangeCount === 0) {
  //     console.log("no selection range")
  //     return null
  //   }
  //   const range = selection.getRangeAt(0)
  //   const start = range.startContainer;
  //   let startElement;
  //   if (start.nodeType === 1) {
  //     startElement = start;
  //   } else {
  //     startElement = start.parentElement
  //   }
  //   return startElement ? startElement.closest('[contenteditable="true"]') : null
  // }

  document.addEventListener('focusin', function (e: FocusEvent) {
    // console.log('focusin!', e)
    // console.log('focusin!', e.target)
    // console.log('focusin!', e.target?.innerHTML)
    // @ts-ignore
    e.target.dataset.originalHtml = e.target.innerHTML
    // @ts-ignore
    console.log("set data to", e.target.dataset.originalHtml)

  })
  document.addEventListener('focusout', function (e: FocusEvent) {

    const target = e.target!
    console.log('focusout!', e)
    console.log('focusout!', e.target)
    // console.log('focusout!', e.target.innerHTML)

    // @ts-ignore
    const diff = diffChars(target.dataset.originalHtml || '', target.innerHTML);
    // const diff = execute(e.target.dataset.originalHtml || '', e.target.innerHTML);
    console.log("diff", diff)

    let fragment = document.createDocumentFragment();
    let html = ''
    diff.forEach((part: any) => {
      // green for additions, red for deletions
      // grey for common parts
      const color = part.added ? 'green' :
        part.removed ? 'red' : 'grey';
      const span = document.createElement('span');
      span.style.backgroundColor = color;
      //console.log("part.value", part.value)

      var doc = new DOMParser().parseFromString(part.value, "text/html");
      // span.appendChild(doc.innerHTML);
      span.innerHTML = part.value
      console.log("span", span)
      fragment.appendChild(span);
      html += span.outerHTML

    });

    console.log("parsing", html)
    const domFromHtml = new DOMParser().parseFromString(html, "text/html");

    //console.log(fragment);

    // let div=document.createElement("div");
    // div.appendChild(domFromHtml);
    // console.log("===>", div.innerHTML)

    target.innerHTML = domFromHtml.body.innerHTML

    sendMsg('sending-message', {html: document.body.innerHTML})

    //target.appendChild(fragment.textContent)
    // document.body.appendChild(fragment)
    //  document.body.insertAdjacentHTML(
    //    "beforeend",
    //    div.innerHTML
    //  );

  })
  //alert("sendingsending")
  // bridge.send('quasar.detect', {})
  //   .then((answer: any) => {
  //     console.log("answer", answer)
  //   })
  //   .catch((error: any) => {
  //     console.log("error", error)
  //   })
})

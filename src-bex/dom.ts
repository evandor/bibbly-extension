// Hooks added here have a bridge allowing communication between the Web Page and the BEX Content Script.
// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/dom-hooks
import {bexDom} from 'quasar/wrappers'
import { diffChars } from "diff"
// import {execute} from 'htmldiff-js';

export default bexDom((bridge) => {
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
    diff.forEach((part:any) => {
      // green for additions, red for deletions
      // grey for common parts
      const color = part.added ? 'green' :
        part.removed ? 'red' : 'grey';
      const span = document.createElement('span');
      span.style.color = color;
      console.log("part.value", part.value)
      var doc = new DOMParser().parseFromString(part.value, "text/html");
      // span.appendChild(doc.innerHTML);
      span.innerHTML = part.value
      console.log("span", span)
      fragment.appendChild(span);
    });

    console.log(fragment);

    let div=document.createElement("div");
    div.appendChild(fragment);
    console.log("===>", div.innerHTML)

    target.innerHTML = div.innerHTML

    //target.appendChild(fragment.textContent)
   // document.body.appendChild(fragment)
    document.body.insertAdjacentHTML(
      "beforeend",
      div.innerHTML
    );

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

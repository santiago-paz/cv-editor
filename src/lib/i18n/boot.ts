import { LANGS } from "./index";

/* Runs in the page's head, before the first paint, and sets <html lang> to the
   language the person chose, else the browser's, else English. The editor reads
   it back, and the privacy and terms pages show whichever of their languages
   it names. It says what `resolveLang` in index.ts says, in ES5 and with every
   step guarded, since a script that throws would leave the page unset;
   tests/i18n.test.ts runs both and compares. */
export const LANG_SCRIPT =
  `try{var L=${JSON.stringify(LANGS)},c=null;` +
  `try{c=JSON.parse(localStorage.getItem("cv-editor.v1.ui")||"{}").lang}catch(e){}` +
  `if(L.indexOf(c)<0){c=null;var p=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language];` +
  `for(var i=0;i<p.length&&!c;i++){var s=String(p[i]).split("-")[0].toLowerCase();if(L.indexOf(s)>=0)c=s}}` +
  `document.documentElement.lang=c||"en"}catch(e){}`;

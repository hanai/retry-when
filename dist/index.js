(()=>{"use strict";var e={d:(t,r)=>{for(var o in r)e.o(r,o)&&!e.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:r[o]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},t={};e.r(t),e.d(t,{default:()=>r});const r=e=>{const{func:t,when:r,argumentsGenerator:o,delayGenerator:n}=e;let a=0;const u=async(...e)=>{let c,l;try{l=await t(...e)}catch(e){c=e}if(a+=1,r(c,l,{retryCount:a})){const t=n({retryCount:a}),r=o?o(c,l,{args:e,retryCount:a}):e;return new Promise(((e,o)=>{setTimeout((()=>{u(...r).then(e).catch(o)}),t)}))}if(void 0!==c)throw c;return l};return u};module.exports=t})();
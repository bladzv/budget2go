(function(){
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
let e={xmlns:`http://www.w3.org/2000/svg`,width:24,height:24,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":2,"stroke-linecap":`round`,"stroke-linejoin":`round`},t=([e,n,r])=>{
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
let i=document.createElementNS(`http://www.w3.org/2000/svg`,e);return Object.keys(n).forEach(e=>{i.setAttribute(e,String(n[e]))}),r?.length&&r.forEach(e=>{let n=t(e);i.appendChild(n)}),i},n=(n,r={})=>{let i={...e,...r};return t([`svg`,i,n])},r=e=>{
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
for(let t in e)if(t.startsWith(`aria-`)||t===`role`||t===`title`)return!0;return!1},i=(...e)=>e.filter((e,t,n)=>!!e&&e.trim()!==``&&n.indexOf(e)===t).join(` `).trim(),a=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,n)=>n?n.toUpperCase():t.toLowerCase()),o=e=>{
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
let t=a(e);return t.charAt(0).toUpperCase()+t.slice(1)},s=e=>Array.from(e.attributes).reduce((e,t)=>(e[t.name]=t.value,e),{}),c=e=>typeof e==`string`?e:!e||!e.class?``:e.class&&typeof e.class==`string`?e.class.split(` `):e.class&&Array.isArray(e.class)?e.class:``,l=(t,{nameAttr:a,icons:l,attrs:u})=>{
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
let d=t.getAttribute(a);if(d==null)return;let f=l[o(d)];if(!f)return console.warn(`${t.outerHTML} icon name was not found in the provided icons object.`);let p=s(t),m=r(p)?{}:{"aria-hidden":`true`},h={...e,"data-lucide":d,...m,...u,...p},g=c(p),_=c(u),v=i(`lucide`,`lucide-${d}`,...g,..._);v&&Object.assign(h,{class:v});let y=n(f,h);return t.parentNode?.replaceChild(y,t)},u=[[`rect`,{width:`16`,height:`20`,x:`4`,y:`2`,rx:`2`}],[`line`,{x1:`8`,x2:`16`,y1:`6`,y2:`6`}],[`line`,{x1:`16`,x2:`16`,y1:`14`,y2:`18`}],[`path`,{d:`M16 10h.01`}],[`path`,{d:`M12 10h.01`}],[`path`,{d:`M8 10h.01`}],[`path`,{d:`M12 14h.01`}],[`path`,{d:`M8 14h.01`}],[`path`,{d:`M12 18h.01`}],[`path`,{d:`M8 18h.01`}]],d=[[`path`,{d:`M20 6 9 17l-5-5`}]],f=[[`path`,{d:`m6 9 6 6 6-6`}]],p=[[`circle`,{cx:`12`,cy:`12`,r:`10`}],[`line`,{x1:`12`,x2:`12`,y1:`8`,y2:`12`}],[`line`,{x1:`12`,x2:`12.01`,y1:`16`,y2:`16`}]],m=[[`circle`,{cx:`12`,cy:`12`,r:`10`}],[`path`,{d:`m9 12 2 2 4-4`}]],h=[[`rect`,{width:`20`,height:`14`,x:`2`,y:`5`,rx:`2`}],[`line`,{x1:`2`,x2:`22`,y1:`10`,y2:`10`}]],g=[[`path`,{d:`M12 15V3`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`}],[`path`,{d:`m7 10 5 5 5-5`}]],_=[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`}],[`path`,{d:`M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1`}],[`path`,{d:`M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1`}]],v=[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`}],[`path`,{d:`M10 9H8`}],[`path`,{d:`M16 13H8`}],[`path`,{d:`M16 17H8`}]],y=[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`}],[`path`,{d:`M12 12v6`}],[`path`,{d:`m15 15-3-3-3 3`}]],b=[[`circle`,{cx:`12`,cy:`12`,r:`10`}],[`path`,{d:`M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20`}],[`path`,{d:`M2 12h20`}]],x=[[`circle`,{cx:`12`,cy:`12`,r:`10`}],[`path`,{d:`M12 16v-4`}],[`path`,{d:`M12 8h.01`}]],S=[[`rect`,{width:`18`,height:`11`,x:`3`,y:`11`,rx:`2`,ry:`2`}],[`path`,{d:`M7 11V7a5 5 0 0 1 10 0v4`}]],C=[[`path`,{d:`M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401`}]],w=[[`path`,{d:`M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z`}],[`path`,{d:`M16 10h.01`}],[`path`,{d:`M2 8v1a2 2 0 0 0 2 2h1`}]],T=[[`path`,{d:`M5 12h14`}],[`path`,{d:`M12 5v14`}]],E=[[`path`,{d:`M12 17V7`}],[`path`,{d:`M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8`}],[`path`,{d:`M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z`}]],D=[[`circle`,{cx:`12`,cy:`12`,r:`4`}],[`path`,{d:`M12 2v2`}],[`path`,{d:`M12 20v2`}],[`path`,{d:`m4.93 4.93 1.41 1.41`}],[`path`,{d:`m17.66 17.66 1.41 1.41`}],[`path`,{d:`M2 12h2`}],[`path`,{d:`M20 12h2`}],[`path`,{d:`m6.34 17.66-1.41 1.41`}],[`path`,{d:`m19.07 4.93-1.41 1.41`}]],O=[[`path`,{d:`M10 11v6`}],[`path`,{d:`M14 11v6`}],[`path`,{d:`M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6`}],[`path`,{d:`M3 6h18`}],[`path`,{d:`M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2`}]],k=[[`path`,{d:`M16 7h6v6`}],[`path`,{d:`m22 7-8.5 8.5-5-5L2 17`}]],A=[[`path`,{d:`M12 3v12`}],[`path`,{d:`m17 8-5-5-5 5`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`}]],j=[[`path`,{d:`M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1`}],[`path`,{d:`M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4`}]],M=[[`path`,{d:`M18 6 6 18`}],[`path`,{d:`m6 6 12 12`}]],N=({icons:e={},nameAttr:t=`data-lucide`,attrs:n={},root:r=document,inTemplates:i}={})=>{
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.16.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
if(!Object.values(e).length)throw Error(`Please provide an icons object.
If you want to use all the icons you can import it like:
 \`import { createIcons, icons } from 'lucide';
lucide.createIcons({icons});\``);if(r===void 0)throw Error("`createIcons()` only works in a browser environment.");if(Array.from(r.querySelectorAll(`[${t}]`)).forEach(r=>l(r,{nameAttr:t,icons:e,attrs:n})),i&&Array.from(r.querySelectorAll(`template`)).forEach(r=>N({icons:e,nameAttr:t,attrs:n,root:r.content,inTemplates:i})),t===`data-lucide`){let t=r.querySelectorAll(`[icon-name]`);t.length>0&&(console.warn(`[Lucide] Some icons were found with the now deprecated icon-name attribute. These will still be replaced for backwards compatibility, but will no longer be supported in v1.0 and you should switch to data-lucide`),Array.from(t).forEach(t=>l(t,{nameAttr:`icon-name`,icons:e,attrs:n})))}},P={AlertCircle:p,Calculator:u,Check:d,CheckCircle2:m,ChevronDown:f,CreditCard:h,Download:g,FileJson:_,FileText:v,FileUp:y,Globe:b,Info:x,Lock:S,Moon:C,PiggyBank:w,Plus:T,Receipt:E,Sun:D,Trash2:O,TrendingUp:k,Upload:A,Wallet:j,X:M};window.lucide={createIcons:()=>N({icons:P})},(function(){"use strict";window.App=window.App||{};function e(e){return(e==null?``:String(e)).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function t(e,t){return(e==null?``:String(e)).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,``).trim().slice(0,t||200)}function n(e,t){let n=parseFloat(String(e??0).replace(/[^0-9.\-]/g,``));return!isFinite(n)||!t&&n<0?0:Math.round(n*100)/100}function r(e){return(e?String(e):``).trim().replace(/[^a-zA-Z0-9_\-\.]/g,`_`).replace(/_{2,}/g,`_`).replace(/^[_\-\.]+|[_\-\.]+$/g,``).slice(0,100)}let i=`PHP`,a=new Intl.NumberFormat(`en-PH`,{style:`currency`,currency:`PHP`,minimumFractionDigits:2,maximumFractionDigits:2});function o(e,t){try{let n=String(e||`PHP`).toUpperCase().slice(0,10),r=String(t||`en-PH`).slice(0,20);a=new Intl.NumberFormat(r,{style:`currency`,currency:n}),i=n}catch{}}function s(){return i}function c(e){return a.format(e||0)}function l(e){try{return new Date(e).toLocaleDateString(`en-US`,{month:`short`,day:`numeric`,year:`2-digit`})}catch{return String(e).slice(0,10)}}function u(){return typeof crypto<`u`&&typeof crypto.randomUUID==`function`?crypto.randomUUID():Date.now().toString(36)+`-`+Math.random().toString(36).slice(2,9)}function d(){let e=/* @__PURE__ */ new Date,t=e=>String(e).padStart(2,`0`);return`budget_`+e.getFullYear()+t(e.getMonth()+1)+t(e.getDate())+`_`+t(e.getHours())+t(e.getMinutes())+t(e.getSeconds())}App.utils={esc:e,safeStr:t,safeNum:n,sanitizeFilename:r,fmt:c,setCurrency:o,getCurrencyCode:s,fmtDate:l,uid:u,defaultFilename:d}})(),(function(){"use strict";let{safeStr:e,safeNum:t,uid:n}=App.utils,r=/* @__PURE__ */ new Set([`monthly`,`bi-weekly`,`weekly`]),i={monthly:1,"bi-weekly":26/12,weekly:52/12},a={monthly:`Monthly`,"bi-weekly":`Bi-Weekly`,weekly:`Weekly`},o={salary:[],savings:[],budget:[],loans:[]},s=(e=/* @__PURE__ */ new Date)=>`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}`,c=s(),l=c,u={},d=`PHP|en-PH`,f=e=>JSON.parse(JSON.stringify(e)),p=()=>l===c?o:u[l];function m(e){return o=e,l=c,o}function h(){o={salary:[],savings:[],budget:[],loans:[]},u={},c=s(),l=c,d=`PHP|en-PH`}function g(){return f(p())}function _(){return{version:2,activeMonth:c,currency:d,months:{...f(u),[c]:f(o)}}}function v(e){return!e||e.version!==2||!/^\d{4}-(0[1-9]|1[0-2])$/.test(e.activeMonth)||!e.months||!e.months[e.activeMonth]||Object.keys(e.months).some(t=>!/^\d{4}-(0[1-9]|1[0-2])$/.test(t)||t>e.activeMonth)||!Object.values(e.months).every(e=>e&&[`salary`,`savings`,`budget`,`loans`].every(t=>Array.isArray(e[t])))?!1:(u=f(e.months),c=e.activeMonth,o=f(u[c]),delete u[c],l=c,d=typeof e.currency==`string`?e.currency:`PHP|en-PH`,!0)}function y(){return[...Object.keys(u),c].sort()}function b(e){return e!==c&&!u[e]?!1:(l=e,!0)}function x(){return l!==c}function S(e=s()){if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(e)||e<=c)return!1;u[c]=f(o);let t=f(o);t.salary=t.salary.map(e=>({...e,id:n()}));let r=/* @__PURE__ */ new Map;return t.budget=t.budget.filter(e=>e.recurring||e.loanId).map(e=>{let t=n();return e.loanId&&r.set(e.loanId,t),{...e,id:t,paid:!1,lastPaymentId:null}}),t.loans.forEach(e=>{e.budgetEntryId=r.get(e.id)||null}),o=t,c=e,l=e,!0}function C(){return d}function w(e){d=e}function T(){let e=p(),n=e.salary.reduce((e,n)=>e+t(n.amount)*(i[n.frequency]||1),0),r=e.savings.reduce((e,n)=>e+t(n.amount),0),a=e.budget.filter(e=>!e.loanId).reduce((e,n)=>e+t(n.amount),0),o=e.budget.filter(e=>!!e.loanId).reduce((e,n)=>e+t(n.amount),0),s=a+o,c=n-s,l=e.budget.filter(e=>e.paid).reduce((e,n)=>e+t(n.amount),0);return{monthlySalary:n,totalSavings:r,budgetExpenses:a,loanPayments:o,totalDeductions:s,remaining:c,paid:l,pending:s-l}}function E(e){let n=(e.payments||[]).reduce((e,n)=>e+t(n.amount),0),r=t(e.total),a=t(e.paymentAmount),o=a*(i[e.frequency]||1)*Math.max(0,Math.floor(t(e.monthsPaid))),s=n+o,c=Math.max(0,r-s);return{totalPaid:s,paymentHistoryPaid:n,seededPaid:o,remaining:c,progress:r>0?Math.min(100,s/r*100):0,paymentsLeft:a>0?Math.ceil(c/a):0,isDone:c<=0}}function D(){return p().salary.reduce((e,n)=>e+t(n.amount)*(i[n.frequency]||1),0)}function O(){return p().savings.reduce((e,n)=>e+t(n.amount),0)}function k(){return p().budget.reduce((e,n)=>e+t(n.amount),0)}function A(){return p().loans.reduce((e,t)=>e+E(t).remaining,0)}function j(){o.salary.push({id:n(),source:``,amount:0,frequency:`monthly`})}function M(e){o.salary=o.salary.filter(t=>t.id!==e)}function N(n,i,a){let s=o.salary.find(e=>e.id===n);s&&(i===`source`&&(s.source=e(a,100)),i===`amount`&&(s.amount=t(a)),i===`frequency`&&r.has(a)&&(s.frequency=a))}function P(){o.savings.push({id:n(),location:``,amount:0})}function F(e){o.savings=o.savings.filter(t=>t.id!==e)}function ee(n,r,i){let a=o.savings.find(e=>e.id===n);a&&(r===`location`&&(a.location=e(i,100)),r===`amount`&&(a.amount=t(i)))}function I(r,i,a){o.budget.push({id:n(),name:e(r||``,100),amount:t(i),paid:!1,loanId:a||null,lastPaymentId:null,recurring:!1})}function L(e){let t=o.budget.find(t=>t.id===e);if(t&&t.loanId){let e=o.loans.find(e=>e.id===t.loanId);e&&(e.budgetEntryId=null)}o.budget=o.budget.filter(t=>t.id!==e)}function te(n,r,i){let a=o.budget.find(e=>e.id===n);if(a){if(r===`name`&&(a.name=e(i,100)),r===`amount`&&(a.amount=t(i),a.paid&&a.loanId&&a.lastPaymentId)){let e=o.loans.find(e=>e.id===a.loanId),t=e&&e.payments.find(e=>e.id===a.lastPaymentId);t&&(t.amount=a.amount)}r===`recurring`&&(a.recurring=!!i)}}function ne(e){let t=o.budget.find(t=>t.id===e);return t?R(e,!t.paid):null}function R(e,r){let i=o.budget.find(t=>t.id===e);if(!i||i.paid===!!r)return null;if(i.paid=!!r,!i.loanId)return{itemId:e,paymentId:null};let a=o.loans.find(e=>e.id===i.loanId);if(!a)return{itemId:e,paymentId:null};if(r){let r={id:n(),date:(/* @__PURE__ */ new Date()).toISOString(),amount:t(i.amount)};return a.payments.push(r),i.lastPaymentId=r.id,{itemId:e,paymentId:r.id}}let s=i.lastPaymentId;return s&&(a.payments=a.payments.filter(e=>e.id!==s)),i.lastPaymentId=null,{itemId:e,paymentId:s}}function z(){o.loans.push({id:n(),name:``,total:0,frequency:`monthly`,paymentAmount:0,monthsPaid:0,budgetEntryId:null,payments:[]})}function re(e){let t=o.loans.find(t=>t.id===e);t&&t.budgetEntryId&&(o.budget=o.budget.filter(e=>e.id!==t.budgetEntryId)),o.loans=o.loans.filter(t=>t.id!==e)}function B(n,i,a){let s=o.loans.find(e=>e.id===n);s&&(i===`name`&&(s.name=e(a,100)),i===`total`&&(s.total=t(a)),i===`paymentAmount`&&(s.paymentAmount=t(a)),i===`monthsPaid`&&(s.monthsPaid=Math.max(0,Math.floor(t(a)))),i===`frequency`&&r.has(a)&&(s.frequency=a))}function ie(e){let r=o.loans.find(t=>t.id===e);if(!r||r.budgetEntryId)return!1;let i=n();return o.budget.push({id:i,name:(r.name||`Loan`)+` — Payment`,amount:t(r.paymentAmount),paid:!1,loanId:e,lastPaymentId:null,recurring:!0}),r.budgetEntryId=i,!0}App.state={get:p,getExport:g,getDocument:_,loadDocument:v,listMonths:y,viewMonth:b,rollover:S,activeMonth:()=>c,viewedMonth:()=>l,currentMonth:s,isReadOnly:x,getCurrency:C,setCurrency:w,set:m,resetDocument:h,VALID_FREQS:r,FREQ_TO_MONTHLY:i,FREQ_LABELS:a,computeSummary:T,loanStats:E,salaryTotal:D,savingsTotal:O,budgetTotal:k,loansRemainingTotal:A,addSalary:j,deleteSalary:M,updateSalaryField:N,addSavings:P,deleteSavings:F,updateSavingsField:ee,addBudget:I,deleteBudget:L,updateBudgetField:te,toggleBudgetPaid:ne,setBudgetPaid:R,addLoan:z,deleteLoan:re,updateLoanField:B,addLoanToBudget:ie}})(),(function(){"use strict";let e=`b2g-document-v2`,t=null,n=!1;function r(e,t){let n=document.getElementById(`save-status`);n&&(n.textContent=e,n.dataset.state=t)}function i(){try{let t=localStorage.getItem(e);if(!t)return!1;let n=JSON.parse(t);if(!App.state.loadDocument(n))throw Error(`Invalid saved draft`);return r(`Draft restored`,`saved`),!0}catch{return n=!0,r(`Draft unavailable — import a backup or wipe`,`error`),!1}}function a(){if(t&&clearTimeout(t),t=null,n)return!1;try{return localStorage.setItem(e,JSON.stringify(App.state.getDocument())),r(`Saved on this device`,`saved`),!0}catch{return r(`Not saved — export a backup`,`error`),!1}}function o(){n||App.state.isReadOnly()||(r(`Saving…`,`saving`),t&&clearTimeout(t),t=setTimeout(a,300))}function s(){t&&clearTimeout(t),t=null,n=!0;try{localStorage.removeItem(e)}catch{}r(`No local draft`,`idle`),setTimeout(()=>{n=!1},0)}function c(){n=!1}App.persistence={restore:i,requestSave:o,flush:a,clear:s,resume:c},document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`hidden`&&t&&a()}),window.addEventListener(`pagehide`,()=>{t&&a()})})(),(function(){"use strict";let{esc:e,fmt:t,fmtDate:n}=App.utils,r=App.state;function i(){window.lucide&&typeof lucide.createIcons==`function`&&lucide.createIcons()}function a(t){return Object.entries(r.FREQ_LABELS).map(([n,r])=>`<option value="${e(n)}" ${n===t?`selected`:``}>${e(r)}</option>`).join(``)}function o(){let n=document.getElementById(`salary-body`),o=document.getElementById(`salary-total`),s=r.get().salary,c=r.isReadOnly()?`disabled`:``;if(!s.length){n.innerHTML=`
        <tr class="empty-row">
          <td colspan="5">No income entries yet — add your first source below.</td>
        </tr>`,o.textContent=`—`;return}let l=r.salaryTotal(),u=``;s.forEach(n=>{let i=(n.amount||0)*(r.FREQ_TO_MONTHLY[n.frequency]||1);u+=`
        <tr data-id="${e(n.id)}">
          <td data-label="Source / Employer">
            <input
              class="input-inline"
              type="text"
              data-field="source"
              value="${e(n.source)}"
              maxlength="100"
              placeholder="e.g. Acme Corp"
              aria-label="Income source name"
              ${c}
            >
          </td>
          <td data-label="Amount">
            <input
              class="input-inline mono"
              type="number"
              data-field="amount"
              value="${e(n.amount)}"
              min="0"
              step="0.01"
              placeholder="0.00"
              aria-label="Income amount"
              ${c}
            >
          </td>
          <td data-label="Frequency">
            <select class="select-inline" data-field="frequency" aria-label="Pay frequency" ${c}>
              ${a(n.frequency)}
            </select>
          </td>
          <td class="col-hide-sm" data-label="Monthly">
            <span class="mono" data-monthly-equiv style="color:var(--cyan);font-size:12px;">${e(t(i))}</span>
            <span style="font-size:10px;color:var(--muted);">/mo</span>
          </td>
          <td data-label="">
            <button
              class="btn-icon"
              data-action="delete-salary"
              data-id="${e(n.id)}"
              aria-label="Remove income entry"
              ${c}
            >
              <i data-lucide="trash-2" style="width:14px;height:14px;pointer-events:none;"></i>
            </button>
          </td>
        </tr>`}),n.innerHTML=u,o.textContent=t(l)+`/mo`,i()}function s(){let n=document.getElementById(`savings-body`),a=document.getElementById(`savings-total`),o=r.get().savings,s=r.isReadOnly()?`disabled`:``;if(!o.length){n.innerHTML=`
        <tr class="empty-row">
          <td colspan="3">No savings entries yet — add an account below.</td>
        </tr>`,a.textContent=`—`;return}let c=``;o.forEach(t=>{c+=`
        <tr data-id="${e(t.id)}">
          <td data-label="Institution">
            <input
              class="input-inline"
              type="text"
              data-field="location"
              value="${e(t.location)}"
              maxlength="100"
              placeholder="e.g. Chase Savings"
              aria-label="Savings institution name"
              ${s}
            >
          </td>
          <td data-label="Balance">
            <input
              class="input-inline mono"
              type="number"
              data-field="amount"
              value="${e(t.amount)}"
              min="0"
              step="0.01"
              placeholder="0.00"
              aria-label="Balance amount"
              ${s}
            >
          </td>
          <td data-label="">
            <button
              class="btn-icon"
              data-action="delete-savings"
              data-id="${e(t.id)}"
              aria-label="Remove savings entry"
              ${s}
            >
              <i data-lucide="trash-2" style="width:14px;height:14px;pointer-events:none;"></i>
            </button>
          </td>
        </tr>`}),n.innerHTML=c,a.textContent=t(r.savingsTotal()),i()}function c(){let n=document.getElementById(`budget-body`),a=document.getElementById(`budget-total`),o=r.get().budget,s=r.isReadOnly()?`disabled`:``;if(!o.length){n.innerHTML=`
        <tr class="empty-row">
          <td colspan="5">No budget items yet — add an expense or use "→ To Budget" on a loan.</td>
        </tr>`,a.textContent=`—`;return}let c=``;o.forEach(t=>{let n=!!t.loanId,r=t.paid?`row-paid`:``,i=n?`<span class="badge badge-red" style="font-size:10px;">Loan</span>`:`<span class="badge badge-muted" style="font-size:10px;">Expense</span>`;c+=`
        <tr class="${r}" data-id="${e(t.id)}">
          <td class="col-check no-strike" data-label="Paid" style="text-align:center;">
            <label class="paid-control"><input
              type="checkbox"
              class="paid-check"
              data-action="toggle-paid"
              data-id="${e(t.id)}"
              ${t.paid?`checked`:``}
              aria-label="Mark ${e(t.name||`item`)} as fulfilled"
              ${s}
            ><svg class="paid-check-visual" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 10 17.5 19 7" /></svg></label>
          </td>
          <td data-label="Item">
            <input
              class="input-inline"
              type="text"
              data-field="name"
              value="${e(t.name)}"
              maxlength="100"
              placeholder="e.g. Rent, Groceries…"
              aria-label="Budget item name"
              ${n?`style="color:var(--text-secondary);"`:``}
              ${s}
            >
          </td>
          <td data-label="Allocated">
            <input
              class="input-inline mono"
              type="number"
              data-field="amount"
              value="${e(t.amount)}"
              min="0"
              step="0.01"
              placeholder="0.00"
              aria-label="Budget amount"
              ${s}
            >
          </td>
          <td class="col-hide-sm no-strike" data-label="Repeat">${i}
            <label class="repeat-control"><input type="checkbox" data-field="recurring" ${t.recurring||n?`checked`:``} ${n?`disabled`:s} aria-label="Repeat ${e(t.name||`item`)} next month"> Monthly</label>
          </td>
          <td class="no-strike" data-label="">
            <button
              class="btn-icon"
              data-action="delete-budget"
              data-id="${e(t.id)}"
              aria-label="Remove budget item"
              ${s}
            >
              <i data-lucide="trash-2" style="width:14px;height:14px;pointer-events:none;"></i>
            </button>
          </td>
        </tr>`}),n.innerHTML=c,a.textContent=t(r.budgetTotal()),i()}function l(){let o=document.getElementById(`loans-body`),s=document.getElementById(`loans-total`),c=r.get().loans,l=r.isReadOnly()?`disabled`:``,u=window.matchMedia(`(max-width: 639px)`).matches;if(!c.length){o.innerHTML=`
        <tr class="empty-row">
          <td colspan="8">No active loans — add one below.</td>
        </tr>`,s.textContent=`—`;return}let d=``;c.forEach(i=>{let o=r.loanStats(i),s=o.progress.toFixed(1),c=o.isDone?`done`:``,f=i.budgetEntryId?`<button class="btn-to-budget added" disabled aria-label="Already added to budget">
             <i data-lucide="check" style="width:10px;height:10px;pointer-events:none;"></i>
             In Budget
           </button>`:`<button class="btn-to-budget" data-action="loan-to-budget" data-id="${e(i.id)}" aria-label="Add loan payment to budget" ${l}>
             <i data-lucide="plus" style="width:10px;height:10px;pointer-events:none;"></i>
             To Budget
           </button>`,p=o.isDone?`color:var(--success)`:`color:var(--text-secondary)`;d+=`
        <tr data-id="${e(i.id)}" class="loan-row">
          <td data-label="Lender / Loan">
            <input
              class="input-inline"
              type="text"
              data-field="name"
              value="${e(i.name)}"
              maxlength="100"
              placeholder="e.g. Car Loan"
              aria-label="Loan name"
              ${l}
            >
            <button class="loan-details-toggle" data-action="toggle-loan-details" type="button" aria-expanded="false" aria-label="Show loan details"><i data-lucide="chevron-down" style="width:15px;height:15px;pointer-events:none;"></i></button>
          </td>
          <td class="col-hide-sm loan-detail" data-label="Total" ${u?`inert`:``}>
            <input
              class="input-inline mono"
              type="number"
              data-field="total"
              value="${e(i.total)}"
              min="0"
              step="0.01"
              placeholder="0.00"
              aria-label="Total loan amount"
              ${l}
            >
          </td>
          <td class="col-hide-sm loan-detail" data-label="Per Payment" ${u?`inert`:``}>
            <input
              class="input-inline mono"
              type="number"
              data-field="paymentAmount"
              value="${e(i.paymentAmount)}"
              min="0"
              step="0.01"
              placeholder="0.00"
              aria-label="Payment amount"
              ${l}
            >
          </td>
          <td class="col-hide-sm loan-detail" data-label="Months Paid" ${u?`inert`:``}>
            <input
              class="input-inline mono"
              type="number"
              data-field="monthsPaid"
              value="${e(i.monthsPaid||0)}"
              min="0"
              step="1"
              placeholder="0"
              aria-label="Months already paid"
              ${l}
            >
          </td>
          <td class="col-hide-sm loan-detail" data-label="Frequency" ${u?`inert`:``}>
            <select class="select-inline" data-field="frequency" aria-label="Payment frequency" ${l}>
              ${a(i.frequency)}
            </select>
          </td>
          <td data-label="Progress">
            <div class="progress-wrap">
              <div class="progress-track">
                <div
                  class="progress-fill ${c}"
                  data-loan-progress-fill
                  style="width:${Math.min(100,o.progress).toFixed(1)}%"
                ></div>
              </div>
              <div class="progress-labels">
                <span data-loan-progress-pct>${s}%</span>
                <span data-loan-payments-left>${o.paymentsLeft} left</span>
              </div>
            </div>
          </td>
          <td class="col-hide-sm" data-label="Remaining">
            <span class="mono" data-loan-remaining style="font-size:12px;${p}">
              ${e(t(o.remaining))}
            </span>
          </td>
          <td class="no-strike" data-label="">
            <div style="display:flex;align-items:center;gap:4px;justify-content:flex-end;">
              ${f}
              <button
                class="btn-icon"
                data-action="delete-loan"
                data-id="${e(i.id)}"
                aria-label="Remove loan"
                ${l}
              >
                <i data-lucide="trash-2" style="width:14px;height:14px;pointer-events:none;"></i>
              </button>
            </div>
          </td>
        </tr>`;let m=i.payments||[];if(m.length>0){let r=m.slice(-10).map(r=>`
              <span class="payment-chip" title="${e(n(r.date))}">
                ${e(t(r.amount))}
                <span class="payment-chip-date">${e(n(r.date))}</span>
              </span>`).join(``),i=m.length>10?`<span style="font-size:10px;color:var(--muted);">+${m.length-10} more</span>`:``;d+=`
          <tr class="payment-history-row">
            <td colspan="8">
              <div class="payment-chips">
                <span style="font-size:10px;color:var(--muted);margin-right:2px;">Payments:</span>
                ${r}
                ${i}
              </div>
            </td>
          </tr>`}}),o.innerHTML=d,s.textContent=`Owed: `+t(r.loansRemainingTotal()),i()}function u(){let e=r.computeSummary();f(`sum-income`,t(e.monthlySalary)),f(`sum-savings`,t(e.totalSavings)),f(`sum-expenses`,t(e.budgetExpenses)),f(`sum-loan-pmts`,t(e.loanPayments)),f(`sum-deductions`,t(e.totalDeductions)),f(`sum-remaining`,t(e.remaining)),f(`sum-paid`,t(e.paid)),f(`sum-pending`,t(e.pending));let n=document.getElementById(`sum-remaining`);n&&(n.className=`sum-value `+(e.remaining>=0?`color-success`:`color-danger`)),App.persistence&&App.persistence.requestSave()}function d(){let t=document.getElementById(`month-tabs`);if(!t)return;let n=r.listMonths();t.dataset.months!==n.join(`,`)&&(t.dataset.months=n.join(`,`),t.innerHTML=`<span class="month-indicator" aria-hidden="true"></span>`+n.map(t=>`<button class="month-tab" data-month="${e(t)}">${e((/* @__PURE__ */ new Date(t+`-01T12:00:00`)).toLocaleDateString(void 0,{month:`short`,year:`numeric`}))}</button>`).join(``)),t.querySelectorAll(`.month-tab`).forEach(e=>{let t=e.dataset.month===r.viewedMonth();e.classList.toggle(`active`,t),e.setAttribute(`aria-pressed`,String(t))}),requestAnimationFrame(()=>{let e=t.querySelector(`.month-tab.active`),n=t.querySelector(`.month-indicator`);e&&n&&(n.style.left=e.offsetLeft+`px`,n.style.top=e.offsetTop+`px`,n.style.width=e.offsetWidth+`px`,n.style.height=e.offsetHeight+`px`)});let i=document.getElementById(`month-mode-label`);i&&(i.textContent=r.isReadOnly()?`· Past month (read only)`:`· Current draft`);let a=document.getElementById(`savings-heading`);a&&(a.textContent=r.isReadOnly()?`Savings Snapshot`:`Current Savings`);let o=document.getElementById(`loans-heading`);o&&(o.textContent=r.isReadOnly()?`Loan Snapshot`:`Active Loans`);let s=document.getElementById(`currency-note`);s&&(s.textContent=`${r.getCurrency().split(`|`)[0]} budget · changing currency relabels amounts without conversion`);let c=document.getElementById(`btn-start-month`);c&&(c.hidden=r.currentMonth()<=r.activeMonth()),document.querySelectorAll(`.card-footer .btn-add`).forEach(e=>{e.disabled=r.isReadOnly()})}function f(e,t){let n=document.getElementById(e);n&&(n.textContent=t)}function p(){d(),o(),s(),c(),l(),u()}App.render={salary:o,savings:s,budget:c,loans:l,summary:u,all:p,months:d,icons:i}})(),(function(){"use strict";let{safeStr:e,safeNum:t,uid:n,sanitizeFilename:r,defaultFilename:i}=App.utils,a=App.state,o=`budgetos-encrypted-v1`,s=6e5;function c(e,t,n){let r=new Blob([e],{type:n}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.style.display=`none`,a.href=i,a.download=t,document.body.appendChild(a),a.click(),setTimeout(()=>{document.body.removeChild(a),URL.revokeObjectURL(i)},1e3)}function l(e,t){return(r(e||``)||i())+t}function u(e){let t=``;for(let n=0;n<e.length;n++)t+=String.fromCharCode(e[n]);return btoa(t)}function d(e){let t=atob(String(e||``)),n=new Uint8Array(t.length);for(let e=0;e<t.length;e++)n[e]=t.charCodeAt(e);return n}async function f(e,t,n){let r=window.crypto||self.crypto;if(!r||!r.subtle)throw Error(`Web Crypto API is not available in this browser.`);let i=new TextEncoder,a=await r.subtle.importKey(`raw`,i.encode(String(e||``)),`PBKDF2`,!1,[`deriveKey`]);return r.subtle.deriveKey({name:`PBKDF2`,hash:`SHA-256`,salt:t,iterations:s},a,{name:`AES-GCM`,length:256},!1,[n])}async function p(e,t,n){let r=String(t||``);if(r.length<8)throw Error(`Password must be at least 8 characters for encryption.`);let i=window.crypto||self.crypto,a=i.getRandomValues(/* @__PURE__ */ new Uint8Array(16)),c=i.getRandomValues(/* @__PURE__ */ new Uint8Array(12)),l=await f(r,a,`encrypt`),d=new TextEncoder,p=await i.subtle.encrypt({name:`AES-GCM`,iv:c},l,d.encode(String(e||``)));return JSON.stringify({format:o,version:1,alg:`AES-GCM-256`,kdf:{name:`PBKDF2`,hash:`SHA-256`,iterations:s,salt:u(a)},iv:u(c),dataType:n,ciphertext:u(new Uint8Array(p))},null,2)}async function m(t,n){let r;try{r=JSON.parse(t)}catch{throw Error(`Encrypted file is not valid JSON.`)}if(!r||r.format!==o||!r.kdf||!r.iv||!r.ciphertext)throw Error(`Unsupported encrypted file format.`);let i=String(n||``);if(!i)throw Error(`Password is required for encrypted import.`);let a=d(r.kdf.salt),s=d(r.iv),c=d(r.ciphertext),l=await f(i,a,`decrypt`);try{let t=await(window.crypto||self.crypto).subtle.decrypt({name:`AES-GCM`,iv:s},l,c),n=new TextDecoder().decode(t);return{dataType:e(r.dataType,10).toLowerCase(),plainText:n}}catch{throw Error(`Wrong password or corrupted encrypted file.`)}}function h(e){let t=e||{};return{encrypt:!!t.encrypt,password:String(t.password||``)}}function g(e,t){try{localStorage.setItem(`b2g-last-export`,JSON.stringify({filename:String(e||``),encrypted:!!t,at:(/* @__PURE__ */ new Date()).toISOString()}))}catch{}}function _(e,t){let n=h(t),r=JSON.stringify(a.getDocument(),null,2);if(n.encrypt)return p(r,n.password,`json`).then(t=>{let n=l(e,`.bgo`);c(t,n,`application/json;charset=utf-8;`),g(n,!0),App.ui.toast(`Encrypted download started: `+n,`success`)});let i=l(e,`.json`);return c(r,i,`application/json;charset=utf-8;`),g(i,!1),App.ui.toast(`Download started: `+i,`success`),Promise.resolve()}function v(e){var t=e==null?``:String(e);return/^[=\+\-@]/.test(t)&&(t=`'`+t),t.includes(`,`)||t.includes(`"`)||t.includes(`
`)||t.includes(`\r`)?`"`+t.replace(/"/g,`""`)+`"`:t}function y(e){return e.map(v).join(`,`)}function b(){let e=a.getExport(),t=[];return t.push(`## DOCUMENT_JSON`),t.push(`json`),t.push(y([JSON.stringify(a.getDocument())])),t.push(``),t.push(`## SALARY`),t.push(y([`id`,`source`,`amount`,`frequency`])),e.salary.forEach(e=>t.push(y([e.id,e.source,e.amount,e.frequency]))),t.push(``),t.push(`## SAVINGS`),t.push(y([`id`,`location`,`amount`])),e.savings.forEach(e=>t.push(y([e.id,e.location,e.amount]))),t.push(``),t.push(`## BUDGET`),t.push(y([`id`,`name`,`amount`,`paid`,`loanId`,`lastPaymentId`,`recurring`])),e.budget.forEach(e=>t.push(y([e.id,e.name,e.amount,e.paid,e.loanId||``,e.lastPaymentId||``,!!e.recurring]))),t.push(``),t.push(`## LOANS`),t.push(y([`id`,`name`,`total`,`frequency`,`paymentAmount`,`monthsPaid`,`budgetEntryId`])),e.loans.forEach(e=>t.push(y([e.id,e.name,e.total,e.frequency,e.paymentAmount,e.monthsPaid,e.budgetEntryId||``]))),t.push(``),t.push(`## LOAN_PAYMENTS`),t.push(y([`loanId`,`id`,`date`,`amount`])),e.loans.forEach(e=>{(e.payments||[]).forEach(n=>t.push(y([e.id,n.id,n.date,n.amount])))}),t.join(`\r
`)}function x(e,t){let n=h(t),r=b();if(n.encrypt)return p(r,n.password,`csv`).then(t=>{let n=l(e,`.bgo`);c(t,n,`application/json;charset=utf-8;`),g(n,!0),App.ui.toast(`Encrypted download started: `+n,`success`)});let i=l(e,`.csv`);return c(r,i,`text/csv;charset=utf-8;`),g(i,!1),App.ui.toast(`Download started: `+i,`success`),Promise.resolve()}async function S(e,t,n){if(!e)return;let r=n||{},i=!!r.encrypted,a=String(r.password||``),o=(e.name||``).split(`.`).pop().toLowerCase();if(o!==`json`&&o!==`csv`&&o!==`bgo`)throw Error(`Invalid file type. Choose a .json, .csv, or .bgo file.`);if(e.size>5242880)throw Error(`File too large. Maximum size is 5 MB.`);let s=await e.text(),c=i||o===`bgo`?await m(s,a):{dataType:o,plainText:s},l=c.dataType===`json`?w(c.plainText):c.dataType===`csv`?T(c.plainText):null;if(!l)throw Error(`Unsupported payload type.`);return typeof t==`function`&&t(l),l}function C(r){if(!r||typeof r!=`object`)throw Error(`Invalid month data.`);for(let e of[`salary`,`savings`,`budget`,`loans`]){if(!Array.isArray(r[e]))throw Error(`"`+e+`" must be an array.`);if(r[e].length>2e3)throw Error(`Too many `+e+` entries.`)}let i=e=>e&&typeof e==`object`?e:{},o={salary:r.salary.map(r=>{let o=i(r);return{id:e(o.id||n(),50),source:e(o.source,100),amount:t(o.amount),frequency:a.VALID_FREQS.has(o.frequency)?o.frequency:`monthly`}}),savings:r.savings.map(r=>{let a=i(r);return{id:e(a.id||n(),50),location:e(a.location,100),amount:t(a.amount)}}),budget:r.budget.map(r=>{let a=i(r);return{id:e(a.id||n(),50),name:e(a.name,100),amount:t(a.amount),paid:!!a.paid,loanId:a.loanId?e(a.loanId,50):null,lastPaymentId:a.lastPaymentId?e(a.lastPaymentId,50):null,recurring:!!a.recurring||!!a.loanId}}),loans:r.loans.map(r=>{let o=i(r);return{id:e(o.id||n(),50),name:e(o.name,100),total:t(o.total),frequency:a.VALID_FREQS.has(o.frequency)?o.frequency:`monthly`,paymentAmount:t(o.paymentAmount),monthsPaid:Math.max(0,Math.floor(t(o.monthsPaid))),budgetEntryId:o.budgetEntryId?e(o.budgetEntryId,50):null,payments:Array.isArray(o.payments)?o.payments.slice(0,5e3).map(r=>{let a=i(r);return{id:e(a.id||n(),50),date:e(a.date,30),amount:t(a.amount)}}):[]}})};if(r.loans.some(e=>Array.isArray(e&&e.payments)&&e.payments.length>5e3))throw Error(`Too many loan payments.`);return D(o),o}function w(e){let t;try{t=JSON.parse(e)}catch{throw Error(`Not valid JSON.`)}if(!t||typeof t!=`object`||Array.isArray(t))throw Error(`JSON root must be an object.`);if(t.version===2){if(!t.months||typeof t.months!=`object`||Array.isArray(t.months)||Object.keys(t.months).length>120||!t.months[t.activeMonth])throw Error(`Invalid monthly document.`);let e={};for(let[n,r]of Object.entries(t.months)){if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(n))throw Error(`Invalid month key.`);e[n]=C(r)}let n=/* @__PURE__ */ new Set([`PHP|en-PH`,`USD|en-US`,`EUR|de-DE`,`GBP|en-GB`,`JPY|ja-JP`,`SGD|en-SG`]);return{version:2,activeMonth:t.activeMonth,currency:n.has(t.currency)?t.currency:`PHP|en-PH`,months:e}}return{version:2,activeMonth:a.currentMonth(),currency:a.getCurrency(),months:{[a.currentMonth()]:C(t)}}}function T(r){let i=r.split(/\r?\n/),o=null,s={DOCUMENT_JSON:[],SALARY:[],SAVINGS:[],BUDGET:[],LOANS:[],LOAN_PAYMENTS:[]};for(let e of i){let t=e.trim();if(t){if(t.startsWith(`##`)){let e=t.replace(/^##\s*/,``).trim().toUpperCase().replace(/\s+/g,`_`);o=e in s?e:null;continue}o&&s[o].push(O(t))}}function c(e){let t=s[e];if(t.length<2)return[];let n=t[0].map(e=>e.toLowerCase().replace(/[^a-z0-9]/g,``));return t.slice(1).map(e=>{let t={};return n.forEach((n,r)=>{t[n]=e[r]===void 0?``:e[r]}),t})}if(s.DOCUMENT_JSON.length>=2&&s.DOCUMENT_JSON[1][0])return w(s.DOCUMENT_JSON[1][0]);let l=c(`SALARY`),u=c(`SAVINGS`),d=c(`BUDGET`),f=c(`LOANS`),p=c(`LOAN_PAYMENTS`),m={};p.forEach(r=>{let i=e(r.loanid||``,50);i&&(m[i]||(m[i]=[]),m[i].push({id:e(r.id||n(),50),date:e(r.date,30),amount:t(r.amount)}))});let h={salary:l.map(r=>({id:e(r.id||n(),50),source:e(r.source,100),amount:t(r.amount),frequency:a.VALID_FREQS.has(r.frequency)?r.frequency:`monthly`})),savings:u.map(r=>({id:e(r.id||n(),50),location:e(r.location,100),amount:t(r.amount)})),budget:d.map(r=>({id:e(r.id||n(),50),name:e(r.name,100),amount:t(r.amount),paid:r.paid===`true`||r.paid===`1`,loanId:r.loanid?e(r.loanid,50):null,lastPaymentId:r.lastpaymentid?e(r.lastpaymentid,50):null,recurring:r.recurring===`true`||r.recurring===`1`||!!r.loanid})),loans:f.map(r=>{let i=e(r.id||n(),50);return{id:i,name:e(r.name,100),total:t(r.total),frequency:a.VALID_FREQS.has(r.frequency)?r.frequency:`monthly`,paymentAmount:t(r.paymentamount),monthsPaid:Math.max(0,Math.floor(t(r.monthspaid))),budgetEntryId:r.budgetentryid?e(r.budgetentryid,50):null,payments:(m[i]||[]).map(e=>({...e}))}})},g=a.currentMonth();return{version:2,activeMonth:g,currency:a.getCurrency(),months:{[g]:C(h)}}}function E(e){if(!a.loadDocument(e))throw Error(`Could not load imported document.`);App.persistence.resume();let t=a.getCurrency(),n=t.split(`|`);if(n.length===2){App.utils.setCurrency(n[0],n[1]);let e=document.getElementById(`currency-select`);e&&(e.value=t)}App.render.all(),App.persistence.requestSave()}function D(r){function i(t){let n=/* @__PURE__ */ new Map;return t.forEach(t=>{let r=e(t&&t.id,50);r&&n.set(r,(n.get(r)||0)+1)}),n}function a(t,r){let i=e(t,50);if(!i||r.has(i))for(i=n();r.has(i);)i=n();return r.add(i),i}function o(t,n,r,i){t.forEach(t=>{let o=e(t.id,50),s=a(o,r);t.id=s,o&&n.get(o)===1&&i&&i.set(o,s)})}let s=i(r.loans),c=i(r.budget),l=/* @__PURE__ */ new Set,u=/* @__PURE__ */ new Set,d=/* @__PURE__ */ new Set,f=/* @__PURE__ */ new Set,p=/* @__PURE__ */ new Map,m=/* @__PURE__ */ new Map;o(r.salary,i(r.salary),l),o(r.savings,i(r.savings),u),o(r.budget,c,d,m),o(r.loans,s,f,p),r.loans.forEach(n=>{n.payments=Array.isArray(n.payments)?n.payments:[],n.monthsPaid=Math.max(0,Math.floor(t(n.monthsPaid)));let r=/* @__PURE__ */ new Set;n.payments=n.payments.map(n=>({id:a(n&&n.id,r),date:e(n&&n.date,30),amount:t(n&&n.amount)}))}),r.budget.forEach(t=>{if(!t.loanId){t.loanId=null,t.lastPaymentId=null;return}let n=p.get(e(t.loanId,50));if(!n){t.loanId=null,t.lastPaymentId=null;return}t.loanId=n,t.lastPaymentId&&=e(t.lastPaymentId,50)}),r.loans.forEach(t=>{if(!t.budgetEntryId){t.budgetEntryId=null;return}t.budgetEntryId=m.get(e(t.budgetEntryId,50))||null});let h=/* @__PURE__ */ new Map;r.budget.forEach(e=>{e.loanId&&(h.has(e.loanId)?(e.loanId=null,e.lastPaymentId=null):h.set(e.loanId,e.id))}),r.loans.forEach(e=>{e.budgetEntryId=h.get(e.id)||null});let g=new Map(r.loans.map(e=>[e.id,e]));r.budget.forEach(e=>{if(!e.loanId){e.lastPaymentId=null;return}let t=g.get(e.loanId);if(!t){e.loanId=null,e.lastPaymentId=null;return}e.lastPaymentId&&((t.payments||[]).some(t=>t.id===e.lastPaymentId)||(e.lastPaymentId=null))})}function O(e){let t=[],n=``,r=!1;for(let i=0;i<e.length;i++){let a=e[i],o=e[i+1];a===`"`?r&&o===`"`?(n+=`"`,i++):r=!r:a===`,`&&!r?(t.push(n),n=``):n+=a}return t.push(n),t}App.io={exportJSON:_,exportCSV:x,processFile:S,applyImport:E,defaultFilename:i,resolveFilename:l}})(),(function(){"use strict";let{defaultFilename:e}=App.utils,t={success:`check-circle-2`,error:`alert-circle`,info:`info`};function n(e,n){n||=`info`;let r=document.getElementById(`toast-container`);if(!r)return;let i=document.createElement(`div`);i.className=`toast toast-`+n,i.setAttribute(`role`,`alert`);let a=document.createElement(`span`);a.className=`toast-icon`,a.innerHTML=`<i data-lucide="${t[n]||`info`}" style="width:15px;height:15px;"></i>`;let o=document.createElement(`span`);for(o.className=`toast-msg`,o.textContent=e,i.appendChild(a),i.appendChild(o),r.appendChild(i);r.children.length>3;)r.firstElementChild.remove();window.lucide&&typeof lucide.createIcons==`function`&&lucide.createIcons();let s=setTimeout(()=>d(i),4200);i.addEventListener(`click`,()=>{clearTimeout(s),d(i)})}let r=null,i=null;function a(e,t){let n=document.getElementById(`undo-snackbar`),a=document.getElementById(`undo-message`);if(!n||!a)return;r&&clearTimeout(r),i=t,a.textContent=e,n.hidden=!1,n.classList.remove(`closing`);let o=n.querySelector(`.undo-timer`);o&&(o.style.animation=`none`,o.offsetWidth,o.style.animation=``),r=setTimeout(()=>{n.hidden=!0,i=null},6e3)}function o(){let e=document.getElementById(`btn-undo`);e&&e.addEventListener(`click`,()=>{i&&i(),i=null,clearTimeout(r),document.getElementById(`undo-snackbar`).hidden=!0})}let s=null,c=null;function l(e,t){c=document.activeElement,s=e,e.removeAttribute(`hidden`),requestAnimationFrame(()=>(t||e.querySelector(`button, input, select`)).focus())}function u(e){e&&(e.setAttribute(`hidden`,``),s===e&&(s=null,c&&document.contains(c)&&c.focus()))}function d(e){e.classList.add(`out`),setTimeout(()=>{e.parentNode&&e.parentNode.removeChild(e)},320)}let f=()=>document.getElementById(`export-modal`),p=()=>document.getElementById(`export-filename`),m=()=>document.getElementById(`filename-preview`),h=()=>document.getElementById(`export-encrypt`),g=()=>document.getElementById(`export-password-wrap`),_=()=>document.getElementById(`export-password`),v=()=>document.getElementById(`btn-export-json`),y=()=>document.getElementById(`btn-export-csv`),b=()=>document.getElementById(`export-json-label`),x=()=>document.getElementById(`export-csv-label`),S=()=>document.getElementById(`export-json-target`),C=()=>document.getElementById(`export-csv-target`);function w(e,t,n){if(!e)return;e.textContent=``,e.appendChild(document.createTextNode(t+` `));let r=document.createElement(`code`);r.textContent=n,e.appendChild(r)}function T(e,t){return A()+(t?`.bgo`:e)}function E(){let e=!!(h()&&h().checked),t=v(),n=y(),r=b(),i=x(),a=S(),o=C(),s=T(`.json`,e),c=T(`.csv`,e);t&&r&&(r.textContent=e?`Download Encrypted JSON`:`Download JSON`),n&&i&&(i.textContent=e?`Download Encrypted CSV`:`Download CSV`),w(a,`JSON will save as:`,s),w(o,`CSV will save as:`,c),m()&&(m().textContent=T(`.json`,e))}function D(){let e=!!(h()&&h().checked),t=g(),n=_();t&&(t.hidden=!e),n&&(e&&n.focus(),e||(n.value=``)),E()}function O(){let t=f(),n=p(),r=m(),i=h();t&&(l(t,n),r&&(r.textContent=e()+`.json`),n&&(n.value=``),i&&(i.checked=!1),_()&&(_().value=``),D(),E(),window.lucide&&typeof lucide.createIcons==`function`&&lucide.createIcons())}function k(){u(f())}function A(){let t=(p()||{}).value||``;return App.utils.sanitizeFilename(t)||e()}function j(){let e=!!(h()&&h().checked);return{encrypt:e,password:e&&(_()||{}).value||``}}let M=()=>document.getElementById(`import-modal`),N=()=>document.getElementById(`import-is-encrypted`),P=()=>document.getElementById(`import-password-wrap`),F=()=>document.getElementById(`import-password`),ee=()=>document.getElementById(`import-file-meta`),I=()=>document.getElementById(`btn-import-submit`),L=()=>document.getElementById(`drop-zone`),te=()=>document.getElementById(`drop-zone-title`),ne=()=>document.getElementById(`drop-zone-sub`),R=()=>document.getElementById(`privacy-modal`),z=()=>document.getElementById(`privacy-storage`),re=()=>document.getElementById(`privacy-caches`),B=()=>document.getElementById(`privacy-last-export`),ie=()=>document.getElementById(`privacy-last-encrypted`),ae=()=>document.getElementById(`privacy-outbound-count`),V=null,H=null,U=null,oe=!1,W={outboundRequests:0};function se(){if(!V||!V.name)return``;let e=String(V.name).toLowerCase().split(`.`);return e.length>1?e.pop():``}function ce(e){let t=Number(e);if(!Number.isFinite(t)||t<=0)return`0 B`;let n=[`B`,`KB`,`MB`,`GB`],r=t,i=0;for(;r>=1024&&i<n.length-1;)r/=1024,i+=1;return(i===0?String(Math.round(r)):r.toFixed(1))+` `+n[i]}function G(){let e=N(),t=F(),n=ee(),r=I(),i=L(),a=te(),o=ne(),s=!!V,c=se(),l=!!(e&&e.checked),u=String((t||{}).value||``).trim();n&&(n.textContent=s?`Selected: `+V.name:`No file selected.`),i&&i.classList.toggle(`has-file`,s),a&&(s?a.textContent=`Selected: `+V.name:a.innerHTML=`Drop your file here or <strong>click to browse</strong>`),o&&(o.textContent=s?ce(V.size)+` • Click or drop another file to replace`:`Supports .json, .csv, and encrypted .bgo exports`),e&&(e.disabled=!1);let d=l||c===`bgo`,f=d,p=P();p&&(p.hidden=!f);let m=s&&(!d||u.length>0);r&&(r.disabled=!m)}function K(e){V=e||null,H=null;let t=document.getElementById(`import-preview`);t&&(t.hidden=!0);let n=I();n&&(n.textContent=`Preview Import`);let r=N();!V&&r&&(r.checked=!1),F()&&(F().value=``),G()}function le(){!(N()&&N().checked)&&F()&&(F().value=``),G()}function ue(){let e=M();e&&(l(e,L()),K(null),window.lucide&&typeof lucide.createIcons==`function`&&lucide.createIcons())}function q(){u(M())}function de(){let e=se()===`bgo`||!!(N()&&N().checked);return{encrypted:e,password:e&&(F()||{}).value||``}}async function fe(){if(!V)return;let e=I();if(H){try{App.io.applyImport(H);let e=App.persistence.flush();q(),K(null),n(e?`Import complete. Local draft saved.`:`Import complete, but local saving failed. Export a backup.`,e?`success`:`error`)}catch(e){n(`Import failed: `+String(e.message||e),`error`)}return}e&&(e.disabled=!0,e.textContent=`Reading…`);try{let t=await App.io.processFile(V,null,de());H=t;let n=document.getElementById(`import-preview`),r=Object.keys(t.months).length,i=t.months[t.activeMonth];n&&(n.textContent=`${r} month${r===1?``:`s`} · latest ${t.activeMonth} · ${t.currency.split(`|`)[0]} · ${i.salary.length} income · ${i.budget.length} budget items · ${i.loans.length} loans. Import will replace this device's current draft.`,n.hidden=!1),e&&(e.textContent=`Replace Draft and Import`)}catch(t){n(`Import failed: `+String(t.message||t),`error`),e&&(e.textContent=`Preview Import`)}finally{e&&(e.disabled=!1)}}function pe(e){let t=Number(e);if(!Number.isFinite(t)||t<=0)return`0 B`;let n=[`B`,`KB`,`MB`,`GB`],r=t,i=0;for(;r>=1024&&i<n.length-1;)r/=1024,i+=1;return(i===0?String(Math.round(r)):r.toFixed(1))+` `+n[i]}function me(){let e=0;try{for(let t=0;t<localStorage.length;t+=1){let n=localStorage.key(t)||``,r=localStorage.getItem(n)||``;e+=n.length+r.length}}catch{}return e*2}function he(){try{let e=localStorage.getItem(`b2g-last-export`);if(!e)return null;let t=JSON.parse(e);return!t||typeof t!=`object`?null:t}catch{return null}}function ge(e){try{let t=new URL(String(e||``),window.location.href);return t.protocol!==`http:`&&t.protocol!==`https:`?!1:t.origin!==window.location.origin}catch{return!1}}function _e(){if(!oe){if(oe=!0,typeof window.fetch==`function`){let e=window.fetch.bind(window);window.fetch=function(...t){return ge(t[0]&&t[0].url?t[0].url:t[0])&&(W.outboundRequests+=1),e(...t)}}if(window.XMLHttpRequest&&XMLHttpRequest.prototype&&XMLHttpRequest.prototype.open){let e=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(t,n,r,i,a){return ge(n)&&(W.outboundRequests+=1),e.call(this,t,n,r,i,a)}}if(typeof window.WebSocket==`function`){let e=window.WebSocket;function t(t,n){return ge(t)&&(W.outboundRequests+=1),n?new e(t,n):new e(t)}t.prototype=e.prototype,window.WebSocket=t}}}async function ve(){if(z()&&(z().textContent=pe(me())),re()){let e=0;try{window.caches&&typeof caches.keys==`function`&&(e=(await caches.keys()).length)}catch{}re().textContent=String(e)}let e=he();if(B()){if(!e||!e.at)B().textContent=`Never`;else{let t=new Date(e.at);B().textContent=Number.isNaN(t.getTime())?`Unknown`:t.toLocaleString()}}ie()&&(ie().textContent=e&&e.encrypted?`Yes`:`No`),ae()&&(ae().textContent=String(W.outboundRequests))}function ye(){let e=R();e&&(l(e,document.getElementById(`btn-privacy-close`)),ve(),window.lucide&&typeof lucide.createIcons==`function`&&lucide.createIcons())}function be(){u(R())}async function xe(){if(!window.confirm(`This will wipe all local Budget2Go data, preferences, and offline caches. Continue?`))return!1;App.state.resetDocument(),App.persistence.clear();try{localStorage.removeItem(`b2g-theme`),localStorage.removeItem(`b2g-currency`),localStorage.removeItem(`b2g-last-export`)}catch{}try{if(`caches`in window){let e=await caches.keys();await Promise.all(e.filter(e=>e.startsWith(`workbox-`)).map(e=>caches.delete(e)))}}catch{}try{if(`serviceWorker`in navigator){let e=await navigator.serviceWorker.getRegistrations(),t=new URL(`./`,window.location.href).href;await Promise.all(e.filter(e=>e.scope===t).map(e=>e.unregister()))}}catch{}if(document.documentElement.setAttribute(`data-theme`,`dark`),App.utils&&App.utils.setCurrency){App.utils.setCurrency(`PHP`,`en-PH`);let e=document.getElementById(`currency-select`);e&&(e.value=`PHP|en-PH`)}return W.outboundRequests=0,App.render.all(),App.persistence.clear(),n(`All local data wiped from this browser.`,`success`),!0}let Se=()=>document.getElementById(`btn-calc-fab`),Ce=()=>document.getElementById(`calculator-panel`),we=()=>document.getElementById(`btn-calc-close`),Te=()=>document.getElementById(`btn-calc-apply`),Ee=()=>document.getElementById(`calc-display-expr`),De=()=>document.getElementById(`calc-display-result`),Oe=()=>document.getElementById(`calculator-grid`),J=``,Y=``,X=!1;function ke(e){return String(e||``).replace(/\*/g,`×`).replace(/\//g,`÷`).replace(/-/g,`−`)}function Z(e,t){let n=Ee(),r=De();n&&r&&(n.textContent=t==null?``:ke(t),r.textContent=e==null?J||`0`:String(e))}function Q(e){let t=Ce(),n=Se();t&&n&&((typeof e==`boolean`?e:t.hasAttribute(`hidden`))?(t.removeAttribute(`hidden`),n.setAttribute(`aria-expanded`,`true`)):(t.setAttribute(`hidden`,``),n.setAttribute(`aria-expanded`,`false`)))}function Ae(e){let t=String(e||``).replace(/\s+/g,``);if(!t)return[];let n=[],r=0;for(;r<t.length;){let e=t[r];if(/[0-9.]/.test(e)){let i=e;for(r+=1;r<t.length&&/[0-9.]/.test(t[r]);)i+=t[r],r+=1;if((i.match(/\./g)||[]).length>1)throw Error(`Invalid number`);n.push(i);continue}if(/[+\-*/()]/.test(e)){n.push(e),r+=1;continue}throw Error(`Invalid character`)}return n}function je(e){let t=Ae(e);if(!t.length)return 0;let n=[],r=[],i={"+":1,"-":1,"*":2,"/":2};for(t.forEach((e,a)=>{let o=a>0?t[a-1]:null;if(/^[0-9.]+$/.test(e)){n.push(parseFloat(e));return}if(e===`(`){r.push(e);return}if(e===`)`){for(;r.length&&r[r.length-1]!==`(`;)n.push(r.pop());if(!r.length)throw Error(`Mismatched parentheses`);r.pop();return}for((e===`+`||e===`-`)&&(a===0||o===`(`||/[+\-*/]/.test(o))&&n.push(0);r.length&&/[+\-*/]/.test(r[r.length-1])&&i[r[r.length-1]]>=i[e];)n.push(r.pop());r.push(e)});r.length;){let e=r.pop();if(e===`(`||e===`)`)throw Error(`Mismatched parentheses`);n.push(e)}let a=[];if(n.forEach(e=>{if(typeof e==`number`){a.push(e);return}let t=a.pop(),n=a.pop();if(!Number.isFinite(n)||!Number.isFinite(t))throw Error(`Invalid expression`);if(e===`+`&&a.push(n+t),e===`-`&&a.push(n-t),e===`*`&&a.push(n*t),e===`/`){if(t===0)throw Error(`Cannot divide by zero`);a.push(n/t)}}),a.length!==1||!Number.isFinite(a[0]))throw Error(`Invalid expression`);return Math.round(a[0]*1e6)/1e6}function $(e){if(e===`clear`){J=``,Y=``,X=!1,Z();return}if(e===`back`){if(X){J=``,Y=``,X=!1,Z();return}J=J.slice(0,-1),Y=``,Z();return}if(e===`=`){try{let e=J||`0`,t=je(J);Y=e,J=String(t),X=!0,Z(J,Y)}catch{Y=``,Z(`Error`),setTimeout(()=>Z(),700)}return}if(/^[0-9]$/.test(e)){if(X){J=e,Y=``,X=!1,Z();return}J+=e,Y=``,Z();return}if(e===`.`){if(X){J=`0.`,Y=``,X=!1,Z();return}let e=J.split(/[+\-*/()]/).pop()||``;e.indexOf(`.`)===-1&&(J+=e?`.`:`0.`),Y=``,Z();return}if(/^[+\-*/()]$/.test(e)){X&&=!1;let t=J.slice(-1);/[+\-*/]/.test(t)&&/[+\-*/]/.test(e)?J=J.slice(0,-1)+e:J+=e,Y=``,Z()}}function Me(){if(!J)return null;let e=Number(J);return Number.isFinite(e)?e:null}function Ne(){if(!U||!document.contains(U)){n(`Select an amount field first, then use calculator result.`,`info`);return}let e=Me();if(e==null&&J)try{e=je(J)}catch{e=null}if(e==null){n(`Calculator result is not a valid number.`,`error`);return}U.focus(),U.value=String(e),U.dispatchEvent(new Event(`input`,{bubbles:!0})),U.dispatchEvent(new Event(`change`,{bubbles:!0})),n(`Calculator result applied to selected field.`,`success`)}function Pe(){let e=Se(),t=Ce(),n=we(),r=Te(),i=Oe();e&&t&&i&&(e.addEventListener(`click`,()=>Q()),n&&n.addEventListener(`click`,()=>Q(!1)),r&&r.addEventListener(`click`,Ne),document.addEventListener(`focusin`,e=>{let t=e.target;t&&t instanceof HTMLInputElement&&t.type===`number`&&(U=t)}),i.addEventListener(`click`,e=>{let t=e.target.closest(`[data-calc]`);t&&$(t.dataset.calc)}),document.addEventListener(`keydown`,e=>{if(!t.hasAttribute(`hidden`)){if(e.key===`Escape`){Q(!1);return}if(e.key===`Enter`){e.preventDefault(),$(`=`);return}if(e.key===`Backspace`){e.preventDefault(),$(`back`);return}/^[0-9+\-*/().]$/.test(e.key)&&$(e.key)}}),document.addEventListener(`click`,n=>{t.hasAttribute(`hidden`)||n.target===e||e.contains(n.target)||t.contains(n.target)||Q(!1)}),Z())}document.addEventListener(`keydown`,e=>{if(e.key===`Tab`&&s){let t=[...s.querySelectorAll(`button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]`)].filter(e=>!e.closest(`[hidden]`));if(t.length){let n=t[0],r=t[t.length-1];e.shiftKey&&document.activeElement===n?(e.preventDefault(),r.focus()):!e.shiftKey&&document.activeElement===r&&(e.preventDefault(),n.focus())}}e.key===`Escape`&&(f()&&!f().hasAttribute(`hidden`)&&k(),M()&&!M().hasAttribute(`hidden`)&&q(),R()&&!R().hasAttribute(`hidden`)&&be())}),document.addEventListener(`click`,e=>{if(f()&&!f().hasAttribute(`hidden`)&&e.target===f()){k();return}if(M()&&!M().hasAttribute(`hidden`)&&e.target===M()){q();return}R()&&!R().hasAttribute(`hidden`)&&e.target===R()&&be()});function Fe(){let e=window.matchMedia(`(max-width: 860px)`).matches;document.body.classList.toggle(`stack-layout`,e);let t=window.matchMedia(`(max-width: 639px)`).matches;document.querySelectorAll(`.loan-row`).forEach(e=>{e.querySelectorAll(`.loan-detail`).forEach(n=>{n.inert=t&&!e.classList.contains(`details-open`)})})}function Ie(){let e=document.getElementById(`drop-zone`),t=document.getElementById(`file-input`);_e(),e&&t&&(e.addEventListener(`dragover`,t=>{t.preventDefault(),e.classList.add(`drag-over`)}),e.addEventListener(`dragleave`,t=>{e.contains(t.relatedTarget)||e.classList.remove(`drag-over`)}),e.addEventListener(`drop`,t=>{t.preventDefault(),e.classList.remove(`drag-over`);let n=t.dataTransfer&&t.dataTransfer.files[0];n&&K(n)}),e.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),t.click())}),t.addEventListener(`change`,e=>{let n=e.target.files&&e.target.files[0];n&&K(n),t.value=``}),N()&&N().addEventListener(`change`,le),F()&&F().addEventListener(`input`,G),p()&&p().addEventListener(`input`,E),h()&&h().addEventListener(`change`,D),G(),Fe(),window.addEventListener(`resize`,Fe,{passive:!0}))}App.ui={toast:n,showUndo:a,initUndo:o,openModal:O,closeModal:k,getModalFilename:A,getExportOptions:j,openImportModal:ue,closeImportModal:q,openPrivacyModal:ye,closePrivacyModal:be,refreshPrivacyDashboard:ve,wipeAllData:xe,getImportOptions:de,submitImport:fe,initDropZone:Ie,initCalculator:Pe}})(),(function(){"use strict";function e(){if(!window.App||!App.state||!App.render||!App.ui||!App.io){console.error(`[BudgetOS] App not ready — cannot bind events.`);return}var e=App.state,t=App.render,n=App.ui;function r(){return!e.isReadOnly()}function i(i,a,o,s){if(!r())return;let c=e.activeMonth(),l=e.get(),u=l[i].findIndex(e=>e.id===a);if(u<0)return;let d=structuredClone(l[i][u]),f=i===`loans`&&d.budgetEntryId?l.budget.find(e=>e.id===d.budgetEntryId):null,p=f?l.budget.indexOf(f):-1,m=f?structuredClone(f):null;o(),t.all(),n.showUndo(s,()=>{if(e.activeMonth()!==c||e.isReadOnly())return;let n=e.get();if(!n[i].some(e=>e.id===a)){if(n[i].splice(u,0,d),m&&!n.budget.some(e=>e.id===m.id)&&n.budget.splice(p,0,m),i===`budget`&&d.loanId){let e=n.loans.find(e=>e.id===d.loanId);e&&(e.budgetEntryId=d.id)}t.all()}})}function a(e,t){var n=document.getElementById(e);n&&(n.addEventListener(`input`,function(e){t.input&&t.input(e)}),n.addEventListener(`change`,function(e){t.change&&t.change(e)}),t.blur&&n.addEventListener(`blur`,function(e){t.blur(e)},!0),n.addEventListener(`click`,function(e){t.click&&t.click(e)}),n.addEventListener(`keydown`,function(e){t.keydown&&t.keydown(e)}))}function o(e){var t=e.closest(`tr[data-id]`);return t?t.dataset.id:null}function s(e){return window.CSS&&typeof window.CSS.escape==`function`?window.CSS.escape(String(e)):String(e).replace(/["\\]/g,`\\$&`)}function c(e,t){var n=document.getElementById(e),r=document.activeElement,i=null;if(n&&r&&n.contains(r)){var a=o(r),c=r.dataset?r.dataset.field:null;a&&c&&(i={rid:a,field:c,start:typeof r.selectionStart==`number`?r.selectionStart:null,end:typeof r.selectionEnd==`number`?r.selectionEnd:null})}if(t(),i){var l=document.getElementById(e);if(l){var u=`tr[data-id="`+s(i.rid)+`"] [data-field="`+s(i.field)+`"]`,d=l.querySelector(u);if(d&&(d.focus(),i.start!=null&&i.end!=null&&typeof d.setSelectionRange==`function`))try{d.setSelectionRange(i.start,i.end)}catch{}}}}function l(t){var n=o(t);if(n){var r=t.closest(`tr[data-id]`);if(r){var i=r.querySelector(`[data-monthly-equiv]`);if(i){var a=e.get().salary.find(function(e){return e.id===n});if(a){var s=e.FREQ_TO_MONTHLY[a.frequency]||1;i.textContent=App.utils.fmt((a.amount||0)*s)}}}}}function u(t){var n=o(t);if(n){var r=t.closest(`tr[data-id]`);if(r){var i=e.get().loans.find(function(e){return e.id===n});if(i){var a=e.loanStats(i),s=r.querySelector(`[data-loan-progress-fill]`),c=r.querySelector(`[data-loan-progress-pct]`),l=r.querySelector(`[data-loan-payments-left]`),u=r.querySelector(`[data-loan-remaining]`);if(s){var d=Math.min(100,a.progress).toFixed(1);s.style.width=d+`%`,s.classList.toggle(`done`,!!a.isDone)}c&&(c.textContent=a.progress.toFixed(1)+`%`),l&&(l.textContent=a.paymentsLeft+` left`),u&&(u.textContent=App.utils.fmt(a.remaining),u.style.color=a.isDone?`var(--success)`:`var(--text-secondary)`)}}}}a(`salary-body`,{input:function(n){if(r()){var i=n.target.dataset.field;if(i===`source`||i===`amount`){e.updateSalaryField(o(n.target),i,n.target.value);var a=document.getElementById(`salary-total`);a&&(a.textContent=App.utils.fmt(e.salaryTotal())+`/mo`),i===`amount`&&l(n.target),t.summary()}}},change:function(n){if(r()){var i=n.target.dataset.field;i===`frequency`&&(e.updateSalaryField(o(n.target),i,n.target.value),c(`salary-body`,t.salary),t.summary())}},click:function(t){var n=t.target.closest(`[data-action="delete-salary"]`);n&&i(`salary`,n.dataset.id,()=>e.deleteSalary(n.dataset.id),`Income entry removed.`)}}),a(`savings-body`,{input:function(n){if(r()){var i=n.target.dataset.field;if(i===`location`||i===`amount`){e.updateSavingsField(o(n.target),i,n.target.value);var a=document.getElementById(`savings-total`);a&&(a.textContent=App.utils.fmt(e.savingsTotal())),t.summary()}}},click:function(t){var n=t.target.closest(`[data-action="delete-savings"]`);n&&i(`savings`,n.dataset.id,()=>e.deleteSavings(n.dataset.id),`Savings entry removed.`)}});function d(i,a){if(!r())return;let o=e.activeMonth(),s=e.get().budget.find(e=>e.id===i),c=s?structuredClone(s):null,l=s&&s.loanId?e.get().loans.find(e=>e.id===s.loanId):null,u=l&&c.lastPaymentId?l.payments.find(e=>e.id===c.lastPaymentId):null,d=e.setBudgetPaid(i,a);d&&(t.all(),n.showUndo(d.paymentId?`Loan payment recorded.`:`Paid state updated.`,()=>{if(e.activeMonth()!==o||e.isReadOnly())return;let n=e.get().budget.find(e=>e.id===i);if(n&&n.paid===a){if(a)e.setBudgetPaid(i,!1);else{n.paid=!0,n.lastPaymentId=c.lastPaymentId;let t=n.loanId?e.get().loans.find(e=>e.id===n.loanId):null;t&&u&&!t.payments.some(e=>e.id===u.id)&&t.payments.push(structuredClone(u))}t.all()}}))}a(`budget-body`,{input:function(n){if(r()){var i=n.target.dataset.field;if(i===`name`||i===`amount`){e.updateBudgetField(o(n.target),i,n.target.value);var a=document.getElementById(`budget-total`);a&&(a.textContent=App.utils.fmt(e.budgetTotal())),i===`amount`&&t.loans(),t.summary()}}},change:function(n){if(r()){if(n.target.dataset.field===`recurring`){e.updateBudgetField(o(n.target),`recurring`,n.target.checked),t.summary();return}var i=n.target.closest(`[data-action="toggle-paid"]`);i&&d(i.dataset.id,!!i.checked)}},click:function(t){var n=t.target.closest(`[data-action="delete-budget"]`);n&&i(`budget`,n.dataset.id,()=>e.deleteBudget(n.dataset.id),`Budget item removed.`)}}),a(`loans-body`,{input:function(n){if(r()){var i=n.target.dataset.field;if(i===`name`||i===`total`||i===`paymentAmount`||i===`monthsPaid`){e.updateLoanField(o(n.target),i,n.target.value);var a=document.getElementById(`loans-total`);a&&(a.textContent=`Owed: `+App.utils.fmt(e.loansRemainingTotal())),(i===`total`||i===`paymentAmount`||i===`monthsPaid`)&&u(n.target),t.summary()}}},change:function(n){if(r()){var i=n.target.dataset.field;i===`frequency`&&(e.updateLoanField(o(n.target),i,n.target.value),c(`loans-body`,t.loans),t.summary())}},click:function(a){var o=a.target.closest(`[data-action="toggle-loan-details"]`);if(o){var s=o.closest(`tr[data-id]`),c=s.classList.toggle(`details-open`);s.querySelectorAll(`.loan-detail`).forEach(e=>{e.inert=!c}),o.setAttribute(`aria-expanded`,String(c)),o.setAttribute(`aria-label`,c?`Hide loan details`:`Show loan details`);return}var l=a.target.closest(`[data-action="loan-to-budget"]`);if(l){if(!r())return;e.addLoanToBudget(l.dataset.id)&&(t.all(),n.toast(`Loan payment added to Budget — you can edit the amount there.`,`info`));return}var u=a.target.closest(`[data-action="delete-loan"]`);u&&i(`loans`,u.dataset.id,()=>e.deleteLoan(u.dataset.id),`Loan removed.`)}});function f(e,n,i,a){var o=document.getElementById(e);o&&o.addEventListener(`click`,function(){if(r()){i(),a(),t.summary();var e=document.getElementById(n);if(e){var o=e.querySelector(`tr[data-id]:last-child`);if(o){var s=o.querySelector(`input:not([type="checkbox"])`);s&&s.focus()}}}})}f(`btn-add-salary`,`salary-body`,e.addSalary,t.salary),f(`btn-add-savings`,`savings-body`,e.addSavings,t.savings),f(`btn-add-budget`,`budget-body`,function(){e.addBudget()},t.budget),f(`btn-add-loan`,`loans-body`,e.addLoan,t.loans);let p=document.getElementById(`month-tabs`);p&&p.addEventListener(`click`,n=>{let r=n.target.closest(`[data-month]`);r&&e.viewMonth(r.dataset.month)&&t.all()});let m=document.getElementById(`btn-start-month`);m&&m.addEventListener(`click`,()=>{e.rollover()&&(t.all(),n.toast(`New month started. Recurring items copied and paid states reset.`,`success`))});let h=document.getElementById(`btn-summary-toggle`);h&&h.addEventListener(`click`,()=>{let e=document.querySelector(`.summary-bar`).classList.toggle(`expanded`);h.setAttribute(`aria-expanded`,String(e))});var g=document.getElementById(`btn-toggle-import`);g&&g.addEventListener(`click`,n.openImportModal);var _=document.getElementById(`btn-finalize`);_&&_.addEventListener(`click`,n.openModal);var v=document.getElementById(`btn-modal-close`),y=document.getElementById(`btn-modal-cancel`);v&&v.addEventListener(`click`,n.closeModal),y&&y.addEventListener(`click`,n.closeModal);var b=document.getElementById(`btn-import-close`),x=document.getElementById(`btn-import-cancel`),S=document.getElementById(`btn-import-submit`),C=document.getElementById(`btn-open-privacy`),w=document.getElementById(`btn-privacy-close`),T=document.getElementById(`btn-privacy-refresh`),E=document.getElementById(`btn-privacy-ok`),D=document.getElementById(`btn-wipe-data`);b&&b.addEventListener(`click`,n.closeImportModal),x&&x.addEventListener(`click`,n.closeImportModal),S&&S.addEventListener(`click`,n.submitImport),C&&C.addEventListener(`click`,function(){n.openPrivacyModal()}),w&&w.addEventListener(`click`,n.closePrivacyModal),T&&T.addEventListener(`click`,function(){n.refreshPrivacyDashboard()}),E&&E.addEventListener(`click`,n.closePrivacyModal),D&&D.addEventListener(`click`,function(){n.wipeAllData()});var O=document.getElementById(`btn-export-json`);O&&O.addEventListener(`click`,async function(){O.disabled=!0;let e=document.getElementById(`export-json-label`),t=e.textContent;e.textContent=`Preparing…`;try{await App.io.exportJSON(n.getModalFilename(),n.getExportOptions()),e.textContent=`Download started`,n.closeModal()}catch(e){n.toast(e&&e.message?e.message:`Export failed.`,`error`)}finally{O.disabled=!1,e.textContent=t}});var k=document.getElementById(`btn-export-csv`);k&&k.addEventListener(`click`,async function(){k.disabled=!0;let e=document.getElementById(`export-csv-label`),t=e.textContent;e.textContent=`Preparing…`;try{await App.io.exportCSV(n.getModalFilename(),n.getExportOptions()),e.textContent=`Download started`,n.closeModal()}catch(e){n.toast(e&&e.message?e.message:`Export failed.`,`error`)}finally{k.disabled=!1,e.textContent=t}});var A=document.getElementById(`export-filename`);A&&A.addEventListener(`keydown`,function(e){e.key===`Enter`&&App.io.exportJSON(n.getModalFilename(),n.getExportOptions()).then(function(){n.closeModal()}).catch(function(e){n.toast(e&&e.message?e.message:`Export failed.`,`error`)})});var j=document.getElementById(`btn-theme-toggle`);j&&j.addEventListener(`click`,function(){var e=document.documentElement,t=e.getAttribute(`data-theme`)===`light`?`dark`:`light`;e.setAttribute(`data-theme`,t);try{localStorage.setItem(`b2g-theme`,t)}catch{}var n=j.querySelector(`i[data-lucide]`);n&&n.setAttribute(`data-lucide`,t===`light`?`moon`:`sun`),window.lucide&&lucide.createIcons()});var M=document.getElementById(`currency-select`);M&&M.addEventListener(`change`,function(){var n=this.value,r=n.split(`|`);if(r.length===2){let i=e.getCurrency();if(e.listMonths().some(t=>{let n=e.viewedMonth();e.viewMonth(t);let r=e.get(),i=r.salary.length||r.savings.length||r.budget.length||r.loans.length;return e.viewMonth(n),i})&&!window.confirm(`Changing currency only changes labels; amounts are not converted. Continue?`)){this.value=i;return}e.setCurrency(n),App.utils.setCurrency(r[0],r[1]);try{localStorage.setItem(`b2g-currency`,n)}catch{}t.all(),App.persistence.flush()}})}window.App=window.App||{},App.events={init:e}})(),(function(){"use strict";function e(){if(window.App&&App.render&&App.ui){var e=`dark`;try{e=localStorage.getItem(`b2g-theme`)||`dark`}catch{}document.documentElement.setAttribute(`data-theme`,e);var t=document.querySelector(`#btn-theme-toggle i[data-lucide]`);t&&t.setAttribute(`data-lucide`,e===`light`?`moon`:`sun`);var n=App.persistence.restore(),r=n?App.state.getCurrency():`PHP|en-PH`;try{n||(r=localStorage.getItem(`b2g-currency`)||`PHP|en-PH`)}catch{}App.state.setCurrency(r);var i=r.split(`|`);if(i.length===2&&App.utils&&App.utils.setCurrency){App.utils.setCurrency(i[0],i[1]);var a=document.getElementById(`currency-select`);a&&(a.value=r)}App.ui.initDropZone(),App.ui.initCalculator(),App.ui.initUndo(),App.render.all(),App.events&&typeof App.events.init==`function`&&App.events.init(),window.lucide&&typeof lucide.createIcons==`function`?lucide.createIcons():console.warn(`[BudgetOS] Lucide icons CDN not loaded — icons will be missing.`),App.state.currentMonth()>App.state.activeMonth()&&App.ui.toast(`A new month is available. Use Start New Month when you are ready.`,`info`)}}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,e):e()})()})();
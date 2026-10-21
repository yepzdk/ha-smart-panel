var N3=Object.create;var w1=Object.defineProperty;var W3=Object.getOwnPropertyDescriptor;var U2=(L,H)=>(H=Symbol[L])?H:Symbol.for("Symbol."+L),Y=L=>{throw TypeError(L)};var Q2=(L,H,C)=>H in L?w1(L,H,{enumerable:!0,configurable:!0,writable:!0,value:C}):L[H]=C;var N2=(L,H)=>w1(L,"name",{value:H,configurable:!0});var D=L=>[,,,N3(L?.[U2("metadata")]??null)],G2=["class","method","getter","setter","accessor","field","value","get","set"],t1=L=>L!==void 0&&typeof L!="function"?Y("Function expected"):L,I3=(L,H,C,V,M)=>({kind:G2[L],name:H,metadata:V,addInitializer:e=>C._?Y("Already initialized"):M.push(t1(e||null))}),U3=(L,H)=>Q2(H,U2("metadata"),L[3]),t=(L,H,C,V)=>{for(var M=0,e=L[H>>1],i=e&&e.length;M<i;M++)H&1?e[M].call(C):V=e[M].call(C,V);return V},A=(L,H,C,V,M,e)=>{var i,o,p,Z,S,m=H&7,w=!!(H&8),h=!!(H&16),Q=m>3?L.length+1:m?w?1:2:0,D2=G2[m+5],$2=m>3&&(L[Q-1]=[]),$3=L[Q]||(L[Q]=[]),R=m&&(!h&&!w&&(M=M.prototype),m<5&&(m>3||!h)&&W3(m<4?M:{get[C](){return W2(this,e)},set[C](T){return I2(this,e,T)}},C));m?h&&m<4&&N2(e,(m>2?"set ":m>1?"get ":"")+C):N2(M,C);for(var b1=V.length-1;b1>=0;b1--)Z=I3(m,C,p={},L[3],$3),m&&(Z.static=w,Z.private=h,S=Z.access={has:h?T=>Q3(M,T):T=>C in T},m^3&&(S.get=h?T=>(m^1?W2:G3)(T,M,m^4?e:R.get):T=>T[C]),m>2&&(S.set=h?(T,k1)=>I2(T,M,k1,m^4?e:R.set):(T,k1)=>T[C]=k1)),o=(0,V[b1])(m?m<4?h?e:R[D2]:m>4?void 0:{get:R.get,set:R.set}:M,Z),p._=1,m^4||o===void 0?t1(o)&&(m>4?$2.unshift(o):m?h?e=o:R[D2]=o:M=o):typeof o!="object"||o===null?Y("Object expected"):(t1(i=o.get)&&(R.get=i),t1(i=o.set)&&(R.set=i),t1(i=o.init)&&$2.unshift(i));return m||U3(L,M),R&&w1(M,C,R),h?m^4?e:R:M},y=(L,H,C)=>Q2(L,typeof H!="symbol"?H+"":H,C),y1=(L,H,C)=>H.has(L)||Y("Cannot "+C),Q3=(L,H)=>Object(H)!==H?Y('Cannot use the "in" operator on this value'):L.has(H),W2=(L,H,C)=>(y1(L,H,"read from private field"),C?C.call(L):H.get(L)),n=(L,H,C)=>H.has(L)?Y("Cannot add the same private member more than once"):H instanceof WeakSet?H.add(L):H.set(L,C),I2=(L,H,C,V)=>(y1(L,H,"write to private field"),V?V.call(L,C):H.set(L,C),C),G3=(L,H,C)=>(y1(L,H,"access private method"),C);var _="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z";var z2="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16";var B1="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z";var v1="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z";var x1="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z";var q2="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z";var K2="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z";var j2="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z";var i1="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z";var X2="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z";var _1="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z";var Y2="M18,3H6V7H18M19,12A1,1 0 0,1 18,11A1,1 0 0,1 19,10A1,1 0 0,1 20,11A1,1 0 0,1 19,12M16,19H8V14H16M19,8H5A3,3 0 0,0 2,11V17H6V21H18V17H22V11A3,3 0 0,0 19,8Z";var s1="M3,11H5V13H3V11M11,5H13V9H11V5M9,11H13V15H11V13H9V11M15,11H17V13H19V11H21V13H19V15H21V19H19V21H17V19H13V21H11V17H15V15H17V13H15V11M19,19V15H17V19H19M15,3H21V9H15V3M17,5V7H19V5H17M3,3H9V9H3V3M5,5V7H7V5H5M3,15H9V21H3V15M5,17V19H7V17H5Z";var J="M19,18H5V6H19M21,4H3C1.89,4 1,4.89 1,6V18A2,2 0 0,0 3,20H21A2,2 0 0,0 23,18V6C23,4.89 22.1,4 21,4M7,8H13V13H7V8M14,8H17V10H14V8M17,11V16H14V11H17M7,14H13V16H7V14Z";var Z1=globalThis,u1=Z1.ShadowRoot&&(Z1.ShadyCSS===void 0||Z1.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,P1=Symbol(),J2=new WeakMap,a1=class{constructor(H,C,V){if(this._$cssResult$=!0,V!==P1)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=H,this.t=C}get styleSheet(){let H=this.o,C=this.t;if(u1&&H===void 0){let V=C!==void 0&&C.length===1;V&&(H=J2.get(C)),H===void 0&&((this.o=H=new CSSStyleSheet).replaceSync(this.cssText),V&&J2.set(C,H))}return H}toString(){return this.cssText}},C5=L=>new a1(typeof L=="string"?L:L+"",void 0,P1),g=(L,...H)=>{let C=L.length===1?L[0]:H.reduce((V,M,e)=>V+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(M)+L[e+1],L[0]);return new a1(C,L,P1)},H5=(L,H)=>{if(u1)L.adoptedStyleSheets=H.map(C=>C instanceof CSSStyleSheet?C:C.styleSheet);else for(let C of H){let V=document.createElement("style"),M=Z1.litNonce;M!==void 0&&V.setAttribute("nonce",M),V.textContent=C.cssText,L.appendChild(V)}},T1=u1?L=>L:L=>L instanceof CSSStyleSheet?(H=>{let C="";for(let V of H.cssRules)C+=V.cssText;return C5(C)})(L):L;var{is:z3,defineProperty:q3,getOwnPropertyDescriptor:K3,getOwnPropertyNames:j3,getOwnPropertySymbols:X3,getPrototypeOf:Y3}=Object,S1=globalThis,V5=S1.trustedTypes,J3=V5?V5.emptyScript:"",C0=S1.reactiveElementPolyfillSupport,o1=(L,H)=>L,A1={toAttribute(L,H){switch(H){case Boolean:L=L?J3:null;break;case Object:case Array:L=L==null?L:JSON.stringify(L)}return L},fromAttribute(L,H){let C=L;switch(H){case Boolean:C=L!==null;break;case Number:C=L===null?null:Number(L);break;case Object:case Array:try{C=JSON.parse(L)}catch{C=null}}return C}},c1=(L,H)=>!z3(L,H),L5={attribute:!0,type:String,converter:A1,reflect:!1,useDefault:!1,hasChanged:c1};Symbol.metadata??=Symbol("metadata"),S1.litPropertyMetadata??=new WeakMap;var U=class extends HTMLElement{static addInitializer(H){this._$Ei(),(this.l??=[]).push(H)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(H,C=L5){if(C.state&&(C.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(H)&&((C=Object.create(C)).wrapped=!0),this.elementProperties.set(H,C),!C.noAccessor){let V=Symbol(),M=this.getPropertyDescriptor(H,V,C);M!==void 0&&q3(this.prototype,H,M)}}static getPropertyDescriptor(H,C,V){let{get:M,set:e}=K3(this.prototype,H)??{get(){return this[C]},set(i){this[C]=i}};return{get:M,set(i){let o=M?.call(this);e?.call(this,i),this.requestUpdate(H,o,V)},configurable:!0,enumerable:!0}}static getPropertyOptions(H){return this.elementProperties.get(H)??L5}static _$Ei(){if(this.hasOwnProperty(o1("elementProperties")))return;let H=Y3(this);H.finalize(),H.l!==void 0&&(this.l=[...H.l]),this.elementProperties=new Map(H.elementProperties)}static finalize(){if(this.hasOwnProperty(o1("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(o1("properties"))){let C=this.properties,V=[...j3(C),...X3(C)];for(let M of V)this.createProperty(M,C[M])}let H=this[Symbol.metadata];if(H!==null){let C=litPropertyMetadata.get(H);if(C!==void 0)for(let[V,M]of C)this.elementProperties.set(V,M)}this._$Eh=new Map;for(let[C,V]of this.elementProperties){let M=this._$Eu(C,V);M!==void 0&&this._$Eh.set(M,C)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(H){let C=[];if(Array.isArray(H)){let V=new Set(H.flat(1/0).reverse());for(let M of V)C.unshift(T1(M))}else H!==void 0&&C.push(T1(H));return C}static _$Eu(H,C){let V=C.attribute;return V===!1?void 0:typeof V=="string"?V:typeof H=="string"?H.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(H=>this.enableUpdating=H),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(H=>H(this))}addController(H){(this._$EO??=new Set).add(H),this.renderRoot!==void 0&&this.isConnected&&H.hostConnected?.()}removeController(H){this._$EO?.delete(H)}_$E_(){let H=new Map,C=this.constructor.elementProperties;for(let V of C.keys())this.hasOwnProperty(V)&&(H.set(V,this[V]),delete this[V]);H.size>0&&(this._$Ep=H)}createRenderRoot(){let H=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return H5(H,this.constructor.elementStyles),H}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(H=>H.hostConnected?.())}enableUpdating(H){}disconnectedCallback(){this._$EO?.forEach(H=>H.hostDisconnected?.())}attributeChangedCallback(H,C,V){this._$AK(H,V)}_$ET(H,C){let V=this.constructor.elementProperties.get(H),M=this.constructor._$Eu(H,V);if(M!==void 0&&V.reflect===!0){let e=(V.converter?.toAttribute!==void 0?V.converter:A1).toAttribute(C,V.type);this._$Em=H,e==null?this.removeAttribute(M):this.setAttribute(M,e),this._$Em=null}}_$AK(H,C){let V=this.constructor,M=V._$Eh.get(H);if(M!==void 0&&this._$Em!==M){let e=V.getPropertyOptions(M),i=typeof e.converter=="function"?{fromAttribute:e.converter}:e.converter?.fromAttribute!==void 0?e.converter:A1;this._$Em=M;let o=i.fromAttribute(C,e.type);this[M]=o??this._$Ej?.get(M)??o,this._$Em=null}}requestUpdate(H,C,V,M=!1,e){if(H!==void 0){let i=this.constructor;if(M===!1&&(e=this[H]),V??=i.getPropertyOptions(H),!((V.hasChanged??c1)(e,C)||V.useDefault&&V.reflect&&e===this._$Ej?.get(H)&&!this.hasAttribute(i._$Eu(H,V))))return;this.C(H,C,V)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(H,C,{useDefault:V,reflect:M,wrapped:e},i){V&&!(this._$Ej??=new Map).has(H)&&(this._$Ej.set(H,i??C??this[H]),e!==!0||i!==void 0)||(this._$AL.has(H)||(this.hasUpdated||V||(C=void 0),this._$AL.set(H,C)),M===!0&&this._$Em!==H&&(this._$Eq??=new Set).add(H))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(C){Promise.reject(C)}let H=this.scheduleUpdate();return H!=null&&await H,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[M,e]of this._$Ep)this[M]=e;this._$Ep=void 0}let V=this.constructor.elementProperties;if(V.size>0)for(let[M,e]of V){let{wrapped:i}=e,o=this[M];i!==!0||this._$AL.has(M)||o===void 0||this.C(M,void 0,e,o)}}let H=!1,C=this._$AL;try{H=this.shouldUpdate(C),H?(this.willUpdate(C),this._$EO?.forEach(V=>V.hostUpdate?.()),this.update(C)):this._$EM()}catch(V){throw H=!1,this._$EM(),V}H&&this._$AE(C)}willUpdate(H){}_$AE(H){this._$EO?.forEach(C=>C.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(H)),this.updated(H)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(H){return!0}update(H){this._$Eq&&=this._$Eq.forEach(C=>this._$ET(C,this[C])),this._$EM()}updated(H){}firstUpdated(H){}};U.elementStyles=[],U.shadowRootOptions={mode:"open"},U[o1("elementProperties")]=new Map,U[o1("finalized")]=new Map,C0?.({ReactiveElement:U}),(S1.reactiveElementVersions??=[]).push("2.1.2");var W1=globalThis,M5=L=>L,h1=W1.trustedTypes,r5=h1?h1.createPolicy("lit-html",{createHTML:L=>L}):void 0,A5="$lit$",G=`lit$${Math.random().toFixed(9).slice(2)}$`,d5="?"+G,H0=`<${d5}>`,K=document,p1=()=>K.createComment(""),m1=L=>L===null||typeof L!="object"&&typeof L!="function",I1=Array.isArray,V0=L=>I1(L)||typeof L?.[Symbol.iterator]=="function",F1=`[ 	
\f\r]`,d1=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,e5=/-->/g,t5=/>/g,z=RegExp(`>|${F1}(?:([^\\s"'>=/]+)(${F1}*=${F1}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),i5=/'/g,a5=/"/g,p5=/^(?:script|style|textarea|title)$/i,U1=L=>(H,...C)=>({_$litType$:L,strings:H,values:C}),a=U1(1),g0=U1(2),b0=U1(3),j=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),o5=new WeakMap,q=K.createTreeWalker(K,129);function m5(L,H){if(!I1(L)||!L.hasOwnProperty("raw"))throw Error("invalid template strings array");return r5!==void 0?r5.createHTML(H):H}var L0=(L,H)=>{let C=L.length-1,V=[],M,e=H===2?"<svg>":H===3?"<math>":"",i=d1;for(let o=0;o<C;o++){let p=L[o],Z,S,m=-1,w=0;for(;w<p.length&&(i.lastIndex=w,S=i.exec(p),S!==null);)w=i.lastIndex,i===d1?S[1]==="!--"?i=e5:S[1]!==void 0?i=t5:S[2]!==void 0?(p5.test(S[2])&&(M=RegExp("</"+S[2],"g")),i=z):S[3]!==void 0&&(i=z):i===z?S[0]===">"?(i=M??d1,m=-1):S[1]===void 0?m=-2:(m=i.lastIndex-S[2].length,Z=S[1],i=S[3]===void 0?z:S[3]==='"'?a5:i5):i===a5||i===i5?i=z:i===e5||i===t5?i=d1:(i=z,M=void 0);let h=i===z&&L[o+1].startsWith("/>")?" ":"";e+=i===d1?p+H0:m>=0?(V.push(Z),p.slice(0,m)+A5+p.slice(m)+G+h):p+G+(m===-2?o:h)}return[m5(L,e+(L[C]||"<?>")+(H===2?"</svg>":H===3?"</math>":"")),V]},n1=class L{constructor({strings:H,_$litType$:C},V){let M;this.parts=[];let e=0,i=0,o=H.length-1,p=this.parts,[Z,S]=L0(H,C);if(this.el=L.createElement(Z,V),q.currentNode=this.el.content,C===2||C===3){let m=this.el.content.firstChild;m.replaceWith(...m.childNodes)}for(;(M=q.nextNode())!==null&&p.length<o;){if(M.nodeType===1){if(M.hasAttributes())for(let m of M.getAttributeNames())if(m.endsWith(A5)){let w=S[i++],h=M.getAttribute(m).split(G),Q=/([.?@])?(.*)/.exec(w);p.push({type:1,index:e,name:Q[2],strings:h,ctor:Q[1]==="."?E1:Q[1]==="?"?D1:Q[1]==="@"?$1:H1}),M.removeAttribute(m)}else m.startsWith(G)&&(p.push({type:6,index:e}),M.removeAttribute(m));if(p5.test(M.tagName)){let m=M.textContent.split(G),w=m.length-1;if(w>0){M.textContent=h1?h1.emptyScript:"";for(let h=0;h<w;h++)M.append(m[h],p1()),q.nextNode(),p.push({type:2,index:++e});M.append(m[w],p1())}}}else if(M.nodeType===8)if(M.data===d5)p.push({type:2,index:e});else{let m=-1;for(;(m=M.data.indexOf(G,m+1))!==-1;)p.push({type:7,index:e}),m+=G.length-1}e++}}static createElement(H,C){let V=K.createElement("template");return V.innerHTML=H,V}};function C1(L,H,C=L,V){if(H===j)return H;let M=V!==void 0?C._$Co?.[V]:C._$Cl,e=m1(H)?void 0:H._$litDirective$;return M?.constructor!==e&&(M?._$AO?.(!1),e===void 0?M=void 0:(M=new e(L),M._$AT(L,C,V)),V!==void 0?(C._$Co??=[])[V]=M:C._$Cl=M),M!==void 0&&(H=C1(L,M._$AS(L,H.values),M,V)),H}var R1=class{constructor(H,C){this._$AV=[],this._$AN=void 0,this._$AD=H,this._$AM=C}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(H){let{el:{content:C},parts:V}=this._$AD,M=(H?.creationScope??K).importNode(C,!0);q.currentNode=M;let e=q.nextNode(),i=0,o=0,p=V[0];for(;p!==void 0;){if(i===p.index){let Z;p.type===2?Z=new l1(e,e.nextSibling,this,H):p.type===1?Z=new p.ctor(e,p.name,p.strings,this,H):p.type===6&&(Z=new N1(e,this,H)),this._$AV.push(Z),p=V[++o]}i!==p?.index&&(e=q.nextNode(),i++)}return q.currentNode=K,M}p(H){let C=0;for(let V of this._$AV)V!==void 0&&(V.strings!==void 0?(V._$AI(H,V,C),C+=V.strings.length-2):V._$AI(H[C])),C++}},l1=class L{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(H,C,V,M){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=H,this._$AB=C,this._$AM=V,this.options=M,this._$Cv=M?.isConnected??!0}get parentNode(){let H=this._$AA.parentNode,C=this._$AM;return C!==void 0&&H?.nodeType===11&&(H=C.parentNode),H}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(H,C=this){H=C1(this,H,C),m1(H)?H===d||H==null||H===""?(this._$AH!==d&&this._$AR(),this._$AH=d):H!==this._$AH&&H!==j&&this._(H):H._$litType$!==void 0?this.$(H):H.nodeType!==void 0?this.T(H):V0(H)?this.k(H):this._(H)}O(H){return this._$AA.parentNode.insertBefore(H,this._$AB)}T(H){this._$AH!==H&&(this._$AR(),this._$AH=this.O(H))}_(H){this._$AH!==d&&m1(this._$AH)?this._$AA.nextSibling.data=H:this.T(K.createTextNode(H)),this._$AH=H}$(H){let{values:C,_$litType$:V}=H,M=typeof V=="number"?this._$AC(H):(V.el===void 0&&(V.el=n1.createElement(m5(V.h,V.h[0]),this.options)),V);if(this._$AH?._$AD===M)this._$AH.p(C);else{let e=new R1(M,this),i=e.u(this.options);e.p(C),this.T(i),this._$AH=e}}_$AC(H){let C=o5.get(H.strings);return C===void 0&&o5.set(H.strings,C=new n1(H)),C}k(H){I1(this._$AH)||(this._$AH=[],this._$AR());let C=this._$AH,V,M=0;for(let e of H)M===C.length?C.push(V=new L(this.O(p1()),this.O(p1()),this,this.options)):V=C[M],V._$AI(e),M++;M<C.length&&(this._$AR(V&&V._$AB.nextSibling,M),C.length=M)}_$AR(H=this._$AA.nextSibling,C){for(this._$AP?.(!1,!0,C);H!==this._$AB;){let V=M5(H).nextSibling;M5(H).remove(),H=V}}setConnected(H){this._$AM===void 0&&(this._$Cv=H,this._$AP?.(H))}},H1=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(H,C,V,M,e){this.type=1,this._$AH=d,this._$AN=void 0,this.element=H,this.name=C,this._$AM=M,this.options=e,V.length>2||V[0]!==""||V[1]!==""?(this._$AH=Array(V.length-1).fill(new String),this.strings=V):this._$AH=d}_$AI(H,C=this,V,M){let e=this.strings,i=!1;if(e===void 0)H=C1(this,H,C,0),i=!m1(H)||H!==this._$AH&&H!==j,i&&(this._$AH=H);else{let o=H,p,Z;for(H=e[0],p=0;p<e.length-1;p++)Z=C1(this,o[V+p],C,p),Z===j&&(Z=this._$AH[p]),i||=!m1(Z)||Z!==this._$AH[p],Z===d?H=d:H!==d&&(H+=(Z??"")+e[p+1]),this._$AH[p]=Z}i&&!M&&this.j(H)}j(H){H===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,H??"")}},E1=class extends H1{constructor(){super(...arguments),this.type=3}j(H){this.element[this.name]=H===d?void 0:H}},D1=class extends H1{constructor(){super(...arguments),this.type=4}j(H){this.element.toggleAttribute(this.name,!!H&&H!==d)}},$1=class extends H1{constructor(H,C,V,M,e){super(H,C,V,M,e),this.type=5}_$AI(H,C=this){if((H=C1(this,H,C,0)??d)===j)return;let V=this._$AH,M=H===d&&V!==d||H.capture!==V.capture||H.once!==V.once||H.passive!==V.passive,e=H!==d&&(V===d||M);M&&this.element.removeEventListener(this.name,this,V),e&&this.element.addEventListener(this.name,this,H),this._$AH=H}handleEvent(H){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,H):this._$AH.handleEvent(H)}},N1=class{constructor(H,C,V){this.element=H,this.type=6,this._$AN=void 0,this._$AM=C,this.options=V}get _$AU(){return this._$AM._$AU}_$AI(H){C1(this,H)}};var M0=W1.litHtmlPolyfillSupport;M0?.(n1,l1),(W1.litHtmlVersions??=[]).push("3.3.3");var n5=(L,H,C)=>{let V=C?.renderBefore??H,M=V._$litPart$;if(M===void 0){let e=C?.renderBefore??null;V._$litPart$=M=new l1(H.insertBefore(p1(),e),e,void 0,C??{})}return M._$AI(L),M};var Q1=globalThis,B=class extends U{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let H=super.createRenderRoot();return this.renderOptions.renderBefore??=H.firstChild,H}update(H){let C=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(H),this._$Do=n5(C,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return j}};B._$litElement$=!0,B.finalized=!0,Q1.litElementHydrateSupport?.({LitElement:B});var r0=Q1.litElementPolyfillSupport;r0?.({LitElement:B});(Q1.litElementVersions??=[]).push("4.2.2");var $=L=>(H,C)=>{C!==void 0?C.addInitializer(()=>{customElements.define(L,H)}):customElements.define(L,H)};var e0={attribute:!0,type:String,converter:A1,reflect:!1,hasChanged:c1},t0=(L=e0,H,C)=>{let{kind:V,metadata:M}=C,e=globalThis.litPropertyMetadata.get(M);if(e===void 0&&globalThis.litPropertyMetadata.set(M,e=new Map),V==="setter"&&((L=Object.create(L)).wrapped=!0),e.set(C.name,L),V==="accessor"){let{name:i}=C;return{set(o){let p=H.get.call(this);H.set.call(this,o),this.requestUpdate(i,p,L,!0,o)},init(o){return o!==void 0&&this.C(i,void 0,L,o),o}}}if(V==="setter"){let{name:i}=C;return function(o){let p=this[i];H.call(this,o),this.requestUpdate(i,p,L,!0,o)}}throw Error("Unsupported decorator location: "+V)};function c(L){return(H,C)=>typeof C=="object"?t0(L,H,C):((V,M,e)=>{let i=M.hasOwnProperty(e);return M.constructor.createProperty(e,V),i?Object.getOwnPropertyDescriptor(M,e):void 0})(L,H,C)}function u(L){return c({...L,state:!0,attribute:!1})}var X=(L,H,C)=>(C.configurable=!0,C.enumerable=!0,Reflect.decorate&&typeof H!="object"&&Object.defineProperty(L,H,C),C);function l5(L,H){return(C,V,M)=>{let e=i=>i.renderRoot?.querySelector(L)??null;if(H){let{get:i,set:o}=typeof V=="object"?C:M??(()=>{let p=Symbol();return{get(){return this[p]},set(Z){this[p]=Z}}})();return X(C,V,{get(){let p=i.call(this);return p===void 0&&(p=e(this),(p!==null||this.hasUpdated)&&o.call(this,p)),p}})}return X(C,V,{get(){return e(this)}})}}var s=L=>a`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d=${L}></path></svg>`;var v5={title:"Smart panels",menu:"Menu",tabs_label:"Smart panel pages",tab_setup:"Setup",tab_manage:"Manage",cancel:"Cancel",close:"Close",dismiss:"Dismiss",loading:"Loading",retry:"Try again",error_no_connection:"Home Assistant did not answer. Check your connection and try again.",settings_title:"Wi-Fi and Home Assistant address",settings_intro:"New panels join this Wi-Fi network and connect to this Home Assistant address. Both end up in the setup QR code.",settings_load_error:"Could not load the settings: {message}",field_ssid:"Network name",field_ssid_helper:"The name (SSID) of the Wi-Fi network the panels use.",field_security:"Security",security_wpa:"WPA/WPA2",security_wep:"WEP",security_none:"None (open network)",field_security_helper:"Pick WPA/WPA2 also for networks that allow both WPA2 and WPA3.",field_password:"Password",field_password_helper_saved:"Leave empty to keep the saved password.",field_password_helper_new:"The password of the Wi-Fi network.",password_saved:"Password saved",password_show:"Show password",password_hide:"Hide password",field_hidden:"Hidden network",field_hidden_helper:"Turn this on if the network does not show its name.",field_ha_url:"Home Assistant address",field_ha_url_helper:"The address panels use to reach Home Assistant. Default: {url}",use_default:"Use default",save:"Save",settings_saved:"Settings saved",settings_save_error:"Could not save the settings: {message}",error_required:"Enter a value.",error_wifi_ssid_required:"Enter the network name.",error_ha_url_required:"Enter the Home Assistant address.",error_invalid_url:"Enter a full address that starts with http:// or https://.",error_password_required:"Enter the Wi-Fi password, or set security to None.",error_too_long:"This is too long.",error_unknown:"This value is not valid.",error_other_field:"{field}: {message}",qr_title:"Setup QR code",qr_warning:"This QR code contains your Wi-Fi password. Keep printouts and downloads private.",qr_unsaved:"Save your changes to update the QR code.",qr_load_error:"Could not create the QR code: {message}",qr_print_error:"Could not print the QR code: {message}",qr_not_ready_title:"No QR code yet",qr_not_ready:"To create the QR code, fill in {fields}, then save.",qr_not_ready_generic:"Save the Wi-Fi settings to create the QR code.",qr_alt:"QR code to set up a smart panel",qr_hint:"Scan it from the welcome screen of the device. The steps below show how.",qr_print:"Print",qr_download:"Download SVG",qr_file_name:"smart-panel-setup.svg",missing_wifi_ssid:"the network name",missing_wifi_password:"the password",missing_ha_url:"the Home Assistant address",print_title:"Set up a smart panel",print_network:"Wi-Fi network: {ssid}",print_step_reset:"Factory reset the device.",print_step_tap:"Tap the welcome screen 6 times.",print_step_scan:"Scan this QR code and join the network.",print_step_finish:"Finish every setup screen, then log in to Home Assistant with the dashboard user.",print_secret:"This page contains the Wi-Fi password. Destroy it when the panel is set up.",guide_title:"Set up a panel",guide_wpa3:"Networks that only allow WPA3 are not supported by Android QR setup. Use a network that also allows WPA2.",step_reset_title:"Factory reset the device",step_reset:"On the device, open Settings > System > Reset options > Erase all data. The menu names differ a little between manufacturers.",step_reset_panel:"Already a panel? Use Factory reset on the {manage} tab instead.",step_tap_title:"Tap the welcome screen 6 times",step_tap:"On the first setup screen, tap the same empty spot 6 times. The device opens a QR code scanner.",step_scan_title:"Scan the QR code",step_scan:"Scan the QR code above and join the network when asked. The device downloads the panel app and makes it the device owner.",step_finish_title:"Finish every setup screen",step_finish:"Go through all remaining setup screens until the Home Assistant app opens.",step_login_title:"Log in with the dashboard user",step_login:"The Home Assistant address is already filled in. Log in with the user whose dashboard the panel should show.",step_fullscreen_title:"Turn on fullscreen",step_fullscreen:"In the Home Assistant app, open Settings > Companion app and turn on Fullscreen.",step_add_title:"Add the panel",step_add:"Open the {manage} tab and select Add panel.",panels_title:"Panels",add_panel:"Add panel",panels_load_error:"Could not load the panels: {message}",empty_title:"No panels yet",empty_description:"Set up a device with the QR code on the Setup tab. When it shows your dashboard, add it here.",go_to_setup:"Go to setup",online:"Online",offline:"Offline",last_seen:"Last seen {time}",last_seen_now:"Last seen just now",never_seen:"No status report yet",device_details:"{manufacturer} {model}, Android {version}",waiting_report:"Waiting for the first status report. If none arrives, update the panel app, then select Refresh status.",row_screen:"Screen",row_brightness:"Brightness",row_auto_brightness:"Automatic brightness",row_auto_brightness_helper:"Uses the light sensor of the device.",row_auto_brightness_unknown:"Move the brightness slider to turn this off.",row_maintenance:"Maintenance mode",row_maintenance_on:"On. The app is unpinned and the status bar is shown.",row_maintenance_off:"Off. The panel is locked to Home Assistant.",row_panel_app:"Panel app",row_ha_app:"Home Assistant app",state_on:"On",state_off:"Off",state_unknown:"Unknown",brightness_auto:"Automatic",not_installed:"Not installed",update_available:"Update available: {version}",update:"Update",update_panel_app_label:"Update the panel app",update_ha_app_label:"Update the Home Assistant app",reload:"Reload",refresh:"Refresh status",restart:"Restart",more_actions:"More actions",open_page:"Open a page",open_page_helper:"A path in Home Assistant, like /lovelace/0.",open:"Open",error_path_required:"Enter a path.",error_path_invalid:"Enter a path that starts with / and has no spaces or commas.",factory_reset:"Factory reset",remove:"Remove",sent_screen_on:"Turning the screen on.",sent_screen_off:"Turning the screen off.",sent_brightness:"Brightness sent.",sent_auto_brightness:"Turning on automatic brightness.",sent_navigate:"Opening the page.",sent_reload:"Reloading Home Assistant on the panel.",sent_maintenance_on:"Turning on maintenance mode.",sent_maintenance_off:"Turning off maintenance mode.",sent_restart:"The panel is restarting.",sent_update_panel_app:"The panel app update has started.",sent_update_ha_app:"The Home Assistant app update has started.",sent_factory_reset:"The panel is being erased. You can remove it from this list.",sent_refresh:"Asked the panel for its status.",failed_screen_on:"Could not turn the screen on: {message}",failed_screen_off:"Could not turn the screen off: {message}",failed_brightness:"Could not set the brightness: {message}",failed_auto_brightness:"Could not turn on automatic brightness: {message}",failed_navigate:"Could not open the page: {message}",failed_reload:"Could not reload: {message}",failed_maintenance_on:"Could not turn on maintenance mode: {message}",failed_maintenance_off:"Could not turn off maintenance mode: {message}",failed_restart:"Could not restart the panel: {message}",failed_update_panel_app:"Could not update the panel app: {message}",failed_update_ha_app:"Could not update the Home Assistant app: {message}",failed_factory_reset:"Could not factory reset the panel: {message}",failed_refresh:"Could not ask the panel for its status: {message}",failed_remove:"Could not remove the panel: {message}",restart_title:"Restart panel?",restart_text:"{name} restarts and opens Home Assistant again when it is back on.",reset_title:"Factory reset panel?",reset_text:"All data on {name} is erased and it returns to the first setup screen. You can't undo this. To use it again, set it up with the QR code on the Setup tab.",reset_confirm_label:"Type {name} to confirm",remove_title:"Remove panel?",remove_text:"{name} is removed from Smart Panel and stops reporting its status. Nothing changes on the device. You can add it again later.",removed:"{name} removed.",add_title:"Add panel",add_intro:"Pick the device. Devices that run the minimal Home Assistant app, like the panels, are listed first.",add_load_error:"Could not load the devices: {message}",add_empty_title:"No devices to add",add_empty:"Every device with the Home Assistant app is added already. Set up a new panel on the Setup tab first.",add_likely:"Likely a panel",add_device_details:"{model}, app {version}",add_error:"Could not add the panel: {message}",add:"Add",added:"{name} added."},r=(L,H={})=>v5[L].replace(/\{(\w+)\}/g,(C,V)=>V in H?String(H[V]):C),O1=(L,H={})=>L in v5?r(L,H):void 0;var N=g`
  :host {
    font-family: var(--ha-font-family-body);
    font-size: var(--ha-font-size-m);
    line-height: var(--ha-line-height-normal);
    color: var(--primary-text-color);
    -webkit-font-smoothing: var(--ha-font-smoothing);
    -moz-osx-font-smoothing: var(--ha-moz-osx-font-smoothing);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  h1,
  h2,
  h3,
  p {
    margin: 0;
  }

  .icon {
    width: 24px;
    height: 24px;
    flex: none;
    fill: currentColor;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .secondary {
    color: var(--secondary-text-color);
  }

  a {
    color: var(--ha-color-text-link, var(--primary-color));
  }

  a:focus-visible {
    outline: var(--ha-border-width-md) solid var(--ha-color-focus);
    outline-offset: 2px;
    border-radius: var(--ha-border-radius-sm);
  }
`,V1=g`
  .card {
    background: var(--ha-card-background, var(--card-background-color));
    border: var(--ha-card-border-width, 1px) solid
      var(--ha-card-border-color, var(--divider-color));
    border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg));
    box-shadow: var(--ha-card-box-shadow, none);
    color: var(--primary-text-color);
    min-width: 0;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--ha-space-2);
    padding: var(--ha-space-4) var(--ha-space-4) 0;
  }

  .card-header h2 {
    flex: 1;
    min-width: 0;
    font-size: var(--ha-card-header-font-size, var(--ha-font-size-xl));
    font-weight: var(--ha-font-weight-medium);
    line-height: var(--ha-line-height-condensed);
    color: var(--ha-card-header-color, var(--primary-text-color));
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: var(--ha-space-4);
    padding: var(--ha-space-4);
  }

  .card-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--ha-space-2);
    padding: var(--ha-space-2) var(--ha-space-4) var(--ha-space-4);
  }
`,W=g`
  .btn {
    --btn-fill: var(--ha-color-fill-primary-loud-resting);
    --btn-fill-hover: var(--ha-color-fill-primary-loud-hover);
    --btn-fill-active: var(--ha-color-fill-primary-loud-active);
    --btn-text: var(--ha-color-on-primary-loud);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--ha-space-2);
    min-height: 40px;
    padding: var(--ha-space-1) var(--ha-space-4);
    border: var(--ha-border-width-sm) solid transparent;
    border-radius: var(--ha-button-border-radius, var(--ha-border-radius-pill));
    background-color: var(--btn-fill);
    color: var(--btn-text);
    font-family: inherit;
    font-size: var(--ha-font-size-m);
    font-weight: var(--ha-font-weight-medium);
    line-height: var(--ha-line-height-condensed);
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    transition: background-color var(--ha-animation-duration-fast) ease-out;
    -webkit-tap-highlight-color: transparent;
  }

  .btn .icon {
    width: 18px;
    height: 18px;
  }

  .btn:hover {
    background-color: var(--btn-fill-hover);
  }

  .btn:active {
    background-color: var(--btn-fill-active);
  }

  .btn:focus-visible {
    outline: var(--ha-border-width-md) solid var(--ha-color-focus);
    outline-offset: 2px;
  }

  .btn.danger {
    --btn-fill: var(--ha-color-fill-danger-loud-resting);
    --btn-fill-hover: var(--ha-color-fill-danger-loud-hover);
    --btn-fill-active: var(--ha-color-fill-danger-loud-active);
    --btn-text: var(--ha-color-on-danger-loud);
  }

  .btn.filled {
    --btn-fill: var(--ha-color-fill-primary-normal-resting);
    --btn-fill-hover: var(--ha-color-fill-primary-normal-hover);
    --btn-fill-active: var(--ha-color-fill-primary-normal-active);
    --btn-text: var(--ha-color-on-primary-normal);
  }

  .btn.plain {
    --btn-fill: transparent;
    --btn-fill-hover: var(--ha-color-fill-primary-quiet-hover);
    --btn-fill-active: var(--ha-color-fill-primary-quiet-active);
    --btn-text: var(--ha-color-on-primary-normal);
  }

  .btn.plain.danger {
    --btn-fill: transparent;
    --btn-fill-hover: var(--ha-color-fill-danger-quiet-hover);
    --btn-fill-active: var(--ha-color-fill-danger-quiet-active);
    --btn-text: var(--ha-color-on-danger-normal);
  }

  .btn.small {
    min-height: 32px;
    padding: var(--ha-space-1) var(--ha-space-3);
  }

  .btn:disabled,
  .btn[aria-disabled="true"] {
    --btn-fill: var(--ha-color-fill-disabled-loud-resting);
    --btn-fill-hover: var(--btn-fill);
    --btn-fill-active: var(--btn-fill);
    --btn-text: var(--ha-color-on-disabled-loud);
    cursor: default;
  }

  .btn.plain:disabled,
  .btn.plain[aria-disabled="true"] {
    --btn-fill: transparent;
    --btn-text: var(--ha-color-on-disabled-quiet);
  }

  /* A running action keeps its look; only the spinner says it is busy. */
  .btn[aria-busy="true"] {
    cursor: progress;
  }

  .icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 48px;
    height: 48px;
    padding: 0;
    border: none;
    border-radius: var(--ha-border-radius-circle);
    background: transparent;
    color: inherit;
    cursor: pointer;
    transition: background-color var(--ha-animation-duration-fast) ease-out;
    -webkit-tap-highlight-color: transparent;
  }

  .icon-button.small {
    width: 40px;
    height: 40px;
  }

  .icon-button:hover {
    background-color: var(--ha-color-fill-neutral-quiet-hover);
  }

  .icon-button:focus-visible {
    outline: var(--ha-border-width-md) solid var(--ha-color-focus);
    outline-offset: -2px;
  }
`,f1=g`
  .field {
    display: flex;
    flex-direction: column;
    gap: var(--ha-space-1);
    min-width: 0;
  }

  .field > label,
  .field .label,
  .check-text .label {
    font-weight: var(--ha-font-weight-medium);
    line-height: var(--ha-line-height-condensed);
  }

  .required::after {
    content: " *";
  }

  .control {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input {
    width: 100%;
    min-height: 40px;
    padding: var(--ha-space-2) var(--ha-space-3);
    border: var(--ha-border-width-sm) solid var(--ha-color-border-neutral-normal);
    border-radius: var(--ha-border-radius-md);
    background-color: var(--card-background-color);
    color: var(--primary-text-color);
    font-family: inherit;
    font-size: var(--ha-font-size-l);
    line-height: var(--ha-line-height-condensed);
    transition: border-color var(--ha-animation-duration-fast) ease-out;
  }

  .input::placeholder {
    color: var(--secondary-text-color);
    opacity: 1;
  }

  .input:hover {
    border-color: var(--ha-color-border-neutral-loud);
  }

  .input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: inset 0 0 0 1px var(--primary-color);
  }

  .input[aria-invalid="true"] {
    border-color: var(--ha-color-border-danger-normal);
  }

  .input[aria-invalid="true"]:focus {
    box-shadow: inset 0 0 0 1px var(--ha-color-border-danger-normal);
  }

  .input:disabled {
    background-color: var(--ha-color-form-background-disabled);
    color: var(--ha-color-text-disabled);
  }

  .control .input.has-end {
    padding-inline-end: 48px;
  }

  .control .end {
    position: absolute;
    inset-inline-end: 0;
    color: var(--secondary-text-color);
  }

  select.input {
    appearance: none;
    padding-inline-end: 40px;
    cursor: pointer;
  }

  .control .chevron {
    position: absolute;
    inset-inline-end: var(--ha-space-3);
    pointer-events: none;
    color: var(--secondary-text-color);
  }

  .helper {
    font-size: var(--ha-font-size-s);
    line-height: var(--ha-line-height-normal);
    color: var(--secondary-text-color);
  }

  .field-error {
    display: flex;
    align-items: flex-start;
    gap: var(--ha-space-1);
    font-size: var(--ha-font-size-s);
    line-height: var(--ha-line-height-normal);
    color: var(--ha-color-on-danger-quiet, var(--error-color));
  }

  .field-error .icon {
    width: 16px;
    height: 16px;
    margin-top: 2px;
  }

  .check {
    display: flex;
    align-items: flex-start;
    gap: var(--ha-space-3);
    cursor: pointer;
  }

  .check input {
    flex: none;
    width: 18px;
    height: 18px;
    margin: 1px 0 0;
    accent-color: var(--primary-color);
    cursor: pointer;
  }

  .check input:focus-visible {
    outline: var(--ha-border-width-md) solid var(--ha-color-focus);
    outline-offset: 2px;
  }

  .check-text {
    display: flex;
    flex-direction: column;
    gap: var(--ha-space-1);
  }

  /* Switch: a checkbox with role="switch", for settings that apply at once. */
  .switch {
    appearance: none;
    position: relative;
    flex: none;
    width: 48px;
    height: 24px;
    margin: 8px 0;
    border: var(--ha-border-width-sm) solid var(--ha-color-border-neutral-normal);
    border-radius: var(--ha-border-radius-pill);
    background-color: var(--ha-color-fill-disabled-quiet-resting);
    cursor: pointer;
    transition: background-color var(--ha-animation-duration-fast) ease;
  }

  .switch::before {
    content: "";
    position: absolute;
    top: 2px;
    inset-inline-start: 2px;
    width: 18px;
    height: 18px;
    border-radius: var(--ha-border-radius-circle);
    background-color: var(--ha-color-on-neutral-normal);
    transition: inset-inline-start var(--ha-animation-duration-fast) ease;
  }

  .switch:hover {
    background-color: var(--ha-color-fill-disabled-quiet-hover);
  }

  .switch:checked {
    border-color: var(--ha-color-border-primary-loud);
    background-color: var(--ha-color-fill-primary-normal-resting);
  }

  .switch:checked:hover {
    background-color: var(--ha-color-fill-primary-normal-hover);
  }

  .switch:checked::before {
    inset-inline-start: 26px;
    background-color: var(--ha-color-on-primary-normal);
  }

  .switch:focus-visible {
    outline: var(--ha-border-width-md) solid var(--ha-color-focus);
    outline-offset: 2px;
  }

  .switch:disabled {
    opacity: 0.3;
    cursor: default;
  }

  /* Slider */
  .slider {
    --slider-fill: var(--primary-color);
    --slider-track: var(--disabled-color);
    appearance: none;
    width: 100%;
    min-width: 100px;
    height: 24px;
    margin: 0;
    background: transparent;
    cursor: pointer;
  }

  .slider::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: var(--ha-border-radius-pill);
    background: linear-gradient(
      to right,
      var(--slider-fill) var(--slider-percent, 0%),
      var(--slider-track) var(--slider-percent, 0%)
    );
  }

  .slider::-moz-range-track {
    height: 4px;
    border-radius: var(--ha-border-radius-pill);
    background: var(--slider-track);
  }

  .slider::-moz-range-progress {
    height: 4px;
    border-radius: var(--ha-border-radius-pill);
    background: var(--slider-fill);
  }

  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    margin-top: -8px;
    border: none;
    border-radius: var(--ha-border-radius-circle);
    background: var(--slider-fill);
  }

  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border: none;
    border-radius: var(--ha-border-radius-circle);
    background: var(--slider-fill);
  }

  .slider:focus {
    outline: none;
  }

  .slider:focus-visible::-webkit-slider-thumb {
    outline: var(--ha-border-width-md) solid var(--ha-color-focus);
    outline-offset: 2px;
  }

  .slider:focus-visible::-moz-range-thumb {
    outline: var(--ha-border-width-md) solid var(--ha-color-focus);
    outline-offset: 2px;
  }

  .slider:disabled {
    opacity: 0.5;
    cursor: default;
  }
`,L1=g`
  .alert {
    --alert-color: var(--info-color);
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--ha-space-2);
    padding: var(--ha-space-2);
    border-radius: var(--ha-border-radius-sm);
    color: var(--primary-text-color);
    overflow-wrap: anywhere;
  }

  .alert::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-color: var(--alert-color);
    opacity: 0.12;
    pointer-events: none;
  }

  .alert > .icon {
    color: var(--alert-color);
  }

  .alert .message {
    flex: 1;
    min-width: 0;
  }

  .alert .alert-action {
    position: relative;
    flex: none;
  }

  .alert.error {
    --alert-color: var(--error-color);
  }

  .alert.warning {
    --alert-color: var(--warning-color);
  }

  .alert.success {
    --alert-color: var(--success-color);
  }
`,M1=g`
  .spinner {
    display: inline-block;
    flex: none;
    width: var(--spinner-size, 18px);
    height: var(--spinner-size, 18px);
    border: var(--spinner-width, 2px) solid currentColor;
    border-inline-end-color: transparent;
    border-radius: var(--ha-border-radius-circle);
    animation: spin 750ms linear infinite;
  }

  .spinner.large {
    --spinner-size: 48px;
    --spinner-width: 4px;
    color: var(--primary-color);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation-duration: 2s;
    }
  }

  .loading {
    display: flex;
    justify-content: center;
    padding: var(--ha-space-8) var(--ha-space-4);
  }
`;var i0=()=>{let L=document.activeElement;for(;L?.shadowRoot?.activeElement;)L=L.shadowRoot.activeElement;return L instanceof HTMLElement?L:null},x5,s5,Z5,u5,S5,c5,h5,b,G1,z1,q1,K1,j1;h5=[$("smart-panel-dialog")];var E=class extends(c5=B,S5=[c({type:Boolean})],u5=[c()],Z5=[c({type:Boolean})],s5=[c({type:Boolean})],x5=[l5("dialog")],c5){constructor(){super(...arguments);n(this,G1,t(b,8,this,!1)),t(b,11,this);n(this,z1,t(b,12,this,"")),t(b,15,this);n(this,q1,t(b,16,this,!1)),t(b,19,this);n(this,K1,t(b,20,this,!1)),t(b,23,this);n(this,j1,t(b,24,this)),t(b,27,this);y(this,"_returnFocus",null)}updated(C){C.has("open")&&(this.open&&!this._dialog.open?(this._returnFocus=i0(),this._dialog.showModal(),this.querySelector("[data-autofocus]")?.focus()):!this.open&&this._dialog.open&&this._dialog.close())}disconnectedCallback(){super.disconnectedCallback(),this._restoreFocus()}render(){return a`
      <dialog
        aria-labelledby="title"
        class=${this.confirmation?"confirmation":"standard"}
        @cancel=${this._onCancel}
        @close=${this._onClose}
        @click=${this._onClick}
      >
        <div class="surface">
          <header>
            ${this.confirmation?d:a`<button
                  class="icon-button"
                  type="button"
                  aria-label=${r("close")}
                  title=${r("close")}
                  ?disabled=${this.guarded}
                  @click=${this._requestClose}
                >
                  ${s(x1)}
                </button>`}
            <h2 id="title">${this.heading}</h2>
          </header>
          <div class="body">
            <slot></slot>
          </div>
          <footer>
            <slot name="actions"></slot>
          </footer>
        </div>
      </dialog>
    `}_requestClose(){this._dialog.close()}_onCancel(C){this.guarded&&C.preventDefault()}_onClick(C){C.target===this._dialog&&!this.confirmation&&!this.guarded&&this._dialog.close()}_onClose(){this._restoreFocus(),this.dispatchEvent(new CustomEvent("closed"))}_restoreFocus(){let C=this._returnFocus;this._returnFocus=null,C?.isConnected&&C.focus()}};b=D(c5),G1=new WeakMap,z1=new WeakMap,q1=new WeakMap,K1=new WeakMap,j1=new WeakMap,A(b,4,"open",S5,E,G1),A(b,4,"heading",u5,E,z1),A(b,4,"confirmation",Z5,E,q1),A(b,4,"guarded",s5,E,K1),A(b,4,"_dialog",x5,E,j1),E=A(b,0,"SmartPanelDialog",h5,E),y(E,"styles",[N,W,g`
      dialog {
        width: min(var(--dialog-width, 580px), calc(100vw - 32px));
        max-width: none;
        max-height: calc(100vh - 80px);
        padding: 0;
        border: none;
        border-radius: var(--ha-dialog-border-radius, var(--ha-border-radius-3xl));
        background: var(--ha-dialog-surface-background, var(--card-background-color));
        color: var(--primary-text-color);
        box-shadow: var(--dialog-box-shadow, var(--wa-shadow-l, none));
        overflow: hidden;
      }

      dialog.confirmation {
        --dialog-width: 420px;
      }

      dialog[open] {
        display: flex;
        animation: dialog-in var(--ha-animation-duration-normal) ease-out;
      }

      dialog::backdrop {
        background-color: var(--mdc-dialog-scrim-color, rgba(0, 0, 0, 0.32));
        backdrop-filter: var(--ha-dialog-scrim-backdrop-filter, none);
      }

      @keyframes dialog-in {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
      }

      .surface {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-height: inherit;
      }

      header {
        display: flex;
        align-items: center;
        gap: var(--ha-space-1);
        min-height: 48px;
        padding: var(--ha-space-4) var(--ha-space-2) var(--ha-space-2);
      }

      .confirmation header {
        padding: var(--ha-space-6) var(--ha-space-6) var(--ha-space-2);
      }

      h2 {
        flex: 1;
        min-width: 0;
        font-size: var(--ha-font-size-xl);
        font-weight: var(--ha-font-weight-medium);
        line-height: var(--ha-line-height-condensed);
        overflow-wrap: anywhere;
      }

      .standard h2 {
        padding-inline-end: var(--ha-space-4);
      }

      .body {
        flex: 1;
        min-height: 0;
        overflow: auto;
        padding: var(--ha-space-2) var(--ha-space-6) var(--ha-space-4);
      }

      footer {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: var(--ha-space-3);
        padding: var(--ha-space-3) var(--ha-space-4) var(--ha-space-4);
      }

      /* Small screens: a standard dialog fills the screen. */
      @media (max-width: 450px), (max-height: 500px) {
        dialog.standard {
          width: 100vw;
          height: 100vh;
          max-height: none;
          border-radius: 0;
          padding-top: var(--safe-area-inset-top, 0px);
          padding-bottom: var(--safe-area-inset-bottom, 0px);
        }
      }
    `]),t(b,1,E);var O5=L=>L.callWS({type:"smart_panel/settings"}),f5=(L,H)=>L.callWS({type:"smart_panel/settings/update",...H}),g5=L=>L.callWS({type:"smart_panel/qr"}),b5=(L,H)=>L.connection.subscribeMessage(H,{type:"smart_panel/panels/subscribe"}),k5=async L=>(await L.callWS({type:"smart_panel/candidates"})).candidates,w5=(L,H)=>L.callWS({type:"smart_panel/panels/add",mobile_app_entry_id:H}),y5=(L,H)=>L.callWS({type:"smart_panel/panels/remove",panel_id:H}),B5=(L,H,C,V={})=>L.callWS({type:"smart_panel/command",panel_id:H,command:C,...V}),F=L=>typeof L=="object"&&L!==null&&"message"in L&&typeof L.message=="string"&&L.message!==""?L.message:r("error_no_connection");var _5=new Intl.RelativeTimeFormat("en",{numeric:"auto"}),a0=[["year",365*24*3600],["month",720*3600],["week",168*3600],["day",24*3600],["hour",3600],["minute",60]],P5=(L,H)=>{let C=Math.round((L.getTime()-H.getTime())/1e3);for(let[V,M]of a0)if(Math.abs(C)>=M)return _5.format(Math.round(C/M),V);return _5.format(C,"second")},T5=new Intl.DateTimeFormat("en",{dateStyle:"medium",timeStyle:"short"}),F5=new Intl.NumberFormat("en",{style:"percent"}),R5=new Intl.ListFormat("en",{type:"conjunction"});var o0=3e4,A0=400,d0=6e3,p0=45e3,m0=/^\/[^\s,]*$/,E5,D5,$5,N5,W5,I5,U5,Q5,G5,z5,q5,K5,j5,X5,Y5,l,X1,Y1,J1,C2,H2,V2,L2,M2,r2,e2,t2,i2,a2;Y5=[$("smart-panel-card")];var O=class extends(X5=B,j5=[c({attribute:!1})],K5=[c({attribute:!1})],q5=[c({attribute:!1})],z5=[u()],G5=[u()],Q5=[u()],U5=[u()],I5=[u()],W5=[u()],N5=[u()],$5=[u()],D5=[u()],E5=[u()],X5){constructor(){super(...arguments);n(this,X1,t(l,8,this)),t(l,11,this);n(this,Y1,t(l,12,this)),t(l,15,this);n(this,J1,t(l,16,this,new Date)),t(l,19,this);n(this,C2,t(l,20,this,new Set)),t(l,23,this);n(this,H2,t(l,24,this,{})),t(l,27,this);n(this,V2,t(l,28,this)),t(l,31,this);n(this,L2,t(l,32,this)),t(l,35,this);n(this,M2,t(l,36,this)),t(l,39,this);n(this,r2,t(l,40,this)),t(l,43,this);n(this,e2,t(l,44,this)),t(l,47,this);n(this,t2,t(l,48,this,"")),t(l,51,this);n(this,i2,t(l,52,this,"")),t(l,55,this);n(this,a2,t(l,56,this)),t(l,59,this);y(this,"_requestedTimer");y(this,"_brightnessTimer");y(this,"_successTimer")}disconnectedCallback(){super.disconnectedCallback(),window.clearTimeout(this._requestedTimer),window.clearTimeout(this._brightnessTimer),window.clearTimeout(this._successTimer)}willUpdate(C){let V=C.get("panel");V&&V.last_seen!==this.panel.last_seen&&this._pending.size===0&&(this._requested={})}get _status(){let C=this.panel.status;return C?{...C,...this._requested}:null}render(){let C=this.panel,V=this._status;return a`
      <article class="card" aria-labelledby="name">
        <div class="card-header">
          <span class="device-icon">${s(J)}</span>
          <div class="heading">
            <h3 id="name">${C.name}</h3>
            <p class="secondary">
              ${this._renderLastSeen()}${V?a`<span class="separator" aria-hidden="true"> · </span>${r("device_details",{manufacturer:V.manufacturer,model:V.model,version:V.android_version})}`:d}
            </p>
          </div>
          <span class="badge ${C.online?"online":"offline"}">
            <span class="dot" aria-hidden="true"></span>
            ${C.online?r("online"):r("offline")}
          </span>
        </div>

        <div class="rows">
          ${V?d:a`<div class="alert">
                ${s(i1)}
                <span class="message">${r("waiting_report")}</span>
              </div>`}
          ${this._renderScreen(V)} ${this._renderBrightness(V)}
          ${this._renderAutoBrightness(V)} ${this._renderMaintenance(V)}
          ${this._renderPanelApp(V)} ${this._renderHaApp(V)}
        </div>

        <div class="card-actions">
          ${this._renderActionButton("reload",r("reload"))}
          ${this._renderActionButton("refresh",r("refresh"))}
          ${this._renderActionButton("restart",r("restart"),()=>this._openDialog("restart"))}
        </div>

        <details class="more">
          <summary>${r("more_actions")} ${s(v1)}</summary>
          <div class="more-content">
            ${this._renderOpenPage()}
            <div class="danger-actions">
              <button
                class="btn plain danger small"
                type="button"
                @click=${()=>this._openDialog("factory_reset")}
              >
                ${r("factory_reset")}
              </button>
              <button
                class="btn plain small"
                type="button"
                @click=${()=>this._openDialog("remove")}
              >
                ${r("remove")}
              </button>
            </div>
          </div>
        </details>

        <div class="feedback">
          <p class="success" role="status">${this._success??d}</p>
          ${this._error?a`<div class="alert error" role="alert">
                ${s(_)}
                <span class="message">${this._error}</span>
                <button
                  class="icon-button small alert-action"
                  type="button"
                  aria-label=${r("dismiss")}
                  title=${r("dismiss")}
                  @click=${this._dismissError}
                >
                  ${s(x1)}
                </button>
              </div>`:d}
        </div>
      </article>
      ${this._renderRestartDialog()} ${this._renderResetDialog()}
      ${this._renderRemoveDialog()}
    `}_renderLastSeen(){let C=this.panel.last_seen;if(!C)return a`${r("never_seen")}`;let V=new Date(C),M=Math.abs(this.now.getTime()-V.getTime())<p0?r("last_seen_now"):r("last_seen",{time:P5(V,this.now)});return a`<time datetime=${C} title=${T5.format(V)}
      >${M}</time
    >`}_renderRow(C,V,M,e){return a`<div class="row">
      <div class="row-text">
        <span class="row-label" id="${C}-label">${V}</span>
        <span class="row-description secondary" id="${C}-description"
          >${M}</span
        >
      </div>
      <div class="row-control">${e}</div>
    </div>`}_renderSwitch(C,V,M,e,i){return a`
      ${e?a`<span class="spinner" aria-hidden="true"></span>`:d}
      <input
        class="switch"
        type="checkbox"
        role="switch"
        .checked=${V}
        ?disabled=${M||e}
        aria-labelledby="${C}-label"
        aria-describedby="${C}-description"
        aria-busy=${e?"true":"false"}
        @change=${o=>i(o.target.checked)}
      />
    `}_renderScreen(C){let V=this._isPending("screen_on","screen_off"),M=C?C.screen_off?r("state_off"):r("state_on"):r("state_unknown");return this._renderRow("screen",r("row_screen"),M,this._renderSwitch("screen",C?!C.screen_off:!1,!C,V,e=>this._run(e?"screen_on":"screen_off",{},{screen_off:!e})))}_renderBrightness(C){let V=this._brightnessDraft??C?.brightness??null,M=this._isPending("brightness"),e;!C||V===null?e=r("state_unknown"):C.brightness_auto&&this._brightnessDraft===void 0?e=r("brightness_auto"):e=F5.format(V/255);let i=`${(V??0)/255*100}%`;return a`<div class="row brightness">
      <div class="row-text">
        <label class="row-label" for="brightness">${r("row_brightness")}</label>
        <span class="row-description secondary" id="brightness-description"
          >${e}</span
        >
      </div>
      <div class="row-control slider-control">
        ${M?a`<span class="spinner" aria-hidden="true"></span>`:d}
        <input
          id="brightness"
          class="slider"
          type="range"
          min="0"
          max="255"
          step="1"
          style="--slider-percent: ${i}"
          .value=${String(V??0)}
          ?disabled=${!C}
          aria-describedby="brightness-description"
          aria-valuetext=${e}
          @input=${this._onBrightnessInput}
          @change=${this._onBrightnessChange}
        />
      </div>
    </div>`}_renderAutoBrightness(C){let V=this._isPending("auto_brightness"),M=!!(C?.brightness_auto&&C.brightness===null);return this._renderRow("auto-brightness",r("row_auto_brightness"),M?r("row_auto_brightness_unknown"):r("row_auto_brightness_helper"),this._renderSwitch("auto-brightness",!!C?.brightness_auto,!C||M,V,e=>{e?this._run("auto_brightness",{},{brightness_auto:!0}):C?.brightness!=null&&this._run("brightness",{value:C.brightness},{brightness_auto:!1})}))}_renderMaintenance(C){let V=this._isPending("maintenance_on","maintenance_off"),M=C?C.maintenance?r("row_maintenance_on"):r("row_maintenance_off"):r("state_unknown");return this._renderRow("maintenance",r("row_maintenance"),M,this._renderSwitch("maintenance",!!C?.maintenance,!C,V,e=>this._run(e?"maintenance_on":"maintenance_off",{},{maintenance:e})))}_renderPanelApp(C){let V=this.panel.latest_app_version,M=!!(C&&V&&V!==C.app_version),e=a`${C?.app_version??r("state_unknown")}${M?a`<span class="update-note"
          >${r("update_available",{version:V})}</span
        >`:d}`;return this._renderRow("panel-app",r("row_panel_app"),e,this._renderUpdateButton("update_panel_app",r("update_panel_app_label"),M))}_renderHaApp(C){let V=C?C.ha_app_version??r("not_installed"):r("state_unknown");return this._renderRow("ha-app",r("row_ha_app"),V,this._renderUpdateButton("update_ha_app",r("update_ha_app_label"),!1))}_renderUpdateButton(C,V,M){let e=this._isPending(C);return a`<button
      class="btn small ${M?"filled":"plain"}"
      type="button"
      aria-label=${V}
      aria-busy=${e?"true":"false"}
      @click=${()=>this._run(C)}
    >
      ${e?a`<span class="spinner" aria-hidden="true"></span>`:d}
      ${r("update")}
    </button>`}_renderActionButton(C,V,M=()=>this._run(C)){let e=this._isPending(C);return a`<button
      class="btn plain small"
      type="button"
      aria-busy=${e?"true":"false"}
      @click=${M}
    >
      ${e?a`<span class="spinner" aria-hidden="true"></span>`:d}
      ${V}
    </button>`}_renderOpenPage(){let C=this._isPending("navigate");return a`<form class="field open-page" novalidate @submit=${this._openPage}>
      <label for="path">${r("open_page")}</label>
      <div class="open-page-row">
        <input
          id="path"
          class="input"
          type="text"
          inputmode="url"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          .value=${this._path}
          aria-invalid=${this._pathError?"true":"false"}
          aria-describedby="path-help"
          @input=${this._onPathInput}
        />
        <button class="btn filled" type="submit" aria-busy=${C?"true":"false"}>
          ${C?a`<span class="spinner" aria-hidden="true"></span>`:d}
          ${r("open")}
        </button>
      </div>
      ${this._pathError?a`<span id="path-help" class="field-error"
            >${s(_)} ${r(this._pathError)}</span
          >`:a`<span id="path-help" class="helper">${r("open_page_helper")}</span>`}
    </form>`}_renderDialogError(){return this._dialogError?a`<div class="alert error dialog-error" role="alert">
          ${s(_)}
          <span class="message">${this._dialogError}</span>
        </div>`:d}_renderRestartDialog(){let C=this._isPending("restart");return a`<smart-panel-dialog
      confirmation
      .open=${this._dialog==="restart"}
      .heading=${r("restart_title")}
      .guarded=${C}
      @closed=${this._closeDialog}
    >
      ${this._renderDialogError()}
      <p>${r("restart_text",{name:this.panel.name})}</p>
      <button
        slot="actions"
        class="btn plain"
        type="button"
        ?disabled=${C}
        @click=${this._closeDialog}
      >
        ${r("cancel")}
      </button>
      <button
        slot="actions"
        class="btn"
        type="button"
        data-autofocus
        aria-busy=${C?"true":"false"}
        @click=${this._confirmRestart}
      >
        ${C?a`<span class="spinner" aria-hidden="true"></span>`:d}
        ${r("restart")}
      </button>
    </smart-panel-dialog>`}_renderResetDialog(){let C=this._isPending("factory_reset"),V=this._resetConfirm===this.panel.name;return a`<smart-panel-dialog
      confirmation
      .open=${this._dialog==="factory_reset"}
      .heading=${r("reset_title")}
      .guarded=${C}
      @closed=${this._closeDialog}
    >
      <form id="reset-form" class="dialog-form" novalidate @submit=${this._confirmReset}>
        ${this._renderDialogError()}
        <p>${r("reset_text",{name:this.panel.name})}</p>
        <div class="field">
          <label for="reset-confirm"
            >${r("reset_confirm_label",{name:this.panel.name})}</label
          >
          <input
            id="reset-confirm"
            class="input"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            data-autofocus
            .value=${this._resetConfirm}
            @input=${this._onResetConfirmInput}
          />
        </div>
      </form>
      <button
        slot="actions"
        class="btn plain"
        type="button"
        ?disabled=${C}
        @click=${this._closeDialog}
      >
        ${r("cancel")}
      </button>
      <button
        slot="actions"
        class="btn danger"
        type="submit"
        form="reset-form"
        ?disabled=${!V}
        aria-busy=${C?"true":"false"}
      >
        ${C?a`<span class="spinner" aria-hidden="true"></span>`:d}
        ${r("factory_reset")}
      </button>
    </smart-panel-dialog>`}_renderRemoveDialog(){let C=this._isPending("remove");return a`<smart-panel-dialog
      confirmation
      .open=${this._dialog==="remove"}
      .heading=${r("remove_title")}
      .guarded=${C}
      @closed=${this._closeDialog}
    >
      ${this._renderDialogError()}
      <p>${r("remove_text",{name:this.panel.name})}</p>
      <button
        slot="actions"
        class="btn plain"
        type="button"
        data-autofocus
        ?disabled=${C}
        @click=${this._closeDialog}
      >
        ${r("cancel")}
      </button>
      <button
        slot="actions"
        class="btn danger"
        type="button"
        aria-busy=${C?"true":"false"}
        @click=${this._confirmRemove}
      >
        ${C?a`<span class="spinner" aria-hidden="true"></span>`:d}
        ${r("remove")}
      </button>
    </smart-panel-dialog>`}_isPending(...C){return C.some(V=>this._pending.has(V))}_setPending(C,V){let M=new Set(this._pending);V?M.add(C):M.delete(C),this._pending=M}async _run(C,V={},M={}){if(this._pending.has(C))return!1;this._setPending(C,!0),this._error=void 0,this._showSuccess(void 0);let e=this._requested;this._requested={...this._requested,...M};try{return await B5(this.hass,this.panel.panel_id,C,V),this._showSuccess(r(`sent_${C}`)),Object.keys(M).length&&(window.clearTimeout(this._requestedTimer),this._requestedTimer=window.setTimeout(()=>{this._requested={}},o0)),!0}catch(i){this._requested=e;let o=r(`failed_${C}`,{message:F(i)});return this._dialog?this._dialogError=o:this._error=o,!1}finally{this._setPending(C,!1)}}_showSuccess(C){window.clearTimeout(this._successTimer),this._success=C,C&&(this._successTimer=window.setTimeout(()=>{this._success=void 0},d0))}_dismissError(){this._error=void 0}_onBrightnessInput(C){this._brightnessDraft=Number(C.target.value),window.clearTimeout(this._brightnessTimer)}_onBrightnessChange(C){let V=Number(C.target.value);this._brightnessDraft=V,window.clearTimeout(this._brightnessTimer),this._brightnessTimer=window.setTimeout(()=>{this._brightnessDraft=void 0,this._run("brightness",{value:V},{brightness:V,brightness_auto:!1})},A0)}_onPathInput(C){this._path=C.target.value,this._pathError=void 0}async _openPage(C){C.preventDefault();let V=this._path.trim();if(V?m0.test(V)||(this._pathError="error_path_invalid"):this._pathError="error_path_required",this._pathError){this.renderRoot.querySelector("#path")?.focus();return}await this._run("navigate",{path:V})}_openDialog(C){this._dialogError=void 0,this._resetConfirm="",this._dialog=C}_closeDialog(){let C=this._dialog;C&&this._pending.has(C)||(this._dialog=void 0)}_onResetConfirmInput(C){this._resetConfirm=C.target.value}async _confirmRestart(){await this._run("restart")&&(this._dialog=void 0)}async _confirmReset(C){C.preventDefault(),this._resetConfirm===this.panel.name&&await this._run("factory_reset",{confirm:"wipe"})&&(this._dialog=void 0)}async _confirmRemove(){if(this._pending.has("remove"))return;this._setPending("remove",!0),this._dialogError=void 0;let C=this.panel.name;try{await y5(this.hass,this.panel.panel_id),this._dialog=void 0,this.dispatchEvent(new CustomEvent("panel-removed",{detail:{name:C},bubbles:!0,composed:!0}))}catch(V){this._dialogError=r("failed_remove",{message:F(V)})}finally{this._setPending("remove",!1)}}};l=D(X5),X1=new WeakMap,Y1=new WeakMap,J1=new WeakMap,C2=new WeakMap,H2=new WeakMap,V2=new WeakMap,L2=new WeakMap,M2=new WeakMap,r2=new WeakMap,e2=new WeakMap,t2=new WeakMap,i2=new WeakMap,a2=new WeakMap,A(l,4,"hass",j5,O,X1),A(l,4,"panel",K5,O,Y1),A(l,4,"now",q5,O,J1),A(l,4,"_pending",z5,O,C2),A(l,4,"_requested",G5,O,H2),A(l,4,"_brightnessDraft",Q5,O,V2),A(l,4,"_success",U5,O,L2),A(l,4,"_error",I5,O,M2),A(l,4,"_dialog",W5,O,r2),A(l,4,"_dialogError",N5,O,e2),A(l,4,"_resetConfirm",$5,O,t2),A(l,4,"_path",D5,O,i2),A(l,4,"_pathError",E5,O,a2),O=A(l,0,"SmartPanelCard",Y5,O),y(O,"styles",[N,V1,W,f1,L1,M1,g`
      :host {
        display: block;
        height: 100%;
      }

      .card {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .card-header {
        align-items: flex-start;
        gap: var(--ha-space-3);
      }

      .device-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: none;
        width: 40px;
        height: 40px;
        border-radius: var(--ha-border-radius-circle);
        background-color: var(--ha-color-fill-neutral-quiet-resting);
        color: var(--secondary-text-color);
      }

      .heading {
        flex: 1;
        min-width: 0;
      }

      .heading h3 {
        font-size: var(--ha-font-size-l);
        font-weight: var(--ha-font-weight-medium);
        line-height: var(--ha-line-height-condensed);
        overflow-wrap: anywhere;
      }

      .heading p {
        font-size: var(--ha-font-size-s);
        margin-top: var(--ha-space-1);
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: var(--ha-space-2);
        flex: none;
        height: 28px;
        padding: 0 var(--ha-space-3);
        border: 1px solid var(--divider-color);
        border-radius: var(--ha-border-radius-pill);
        font-size: var(--ha-font-size-s);
        font-weight: var(--ha-font-weight-medium);
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: var(--ha-border-radius-circle);
        background-color: var(--disabled-color);
      }

      .online .dot {
        background-color: var(--success-color);
      }

      .rows {
        display: flex;
        flex-direction: column;
        padding: var(--ha-space-3) var(--ha-space-4) var(--ha-space-2);
      }

      .rows > .alert {
        margin-bottom: var(--ha-space-2);
      }

      .row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--ha-space-1) var(--ha-space-4);
        min-height: 56px;
        padding: var(--ha-space-2) 0;
      }

      .row + .row {
        border-top: 1px solid var(--divider-color);
      }

      .row-text {
        display: flex;
        flex-direction: column;
        flex: 1 1 160px;
        min-width: 0;
      }

      .row-label {
        font-weight: var(--ha-font-weight-medium);
      }

      .row-description {
        font-size: var(--ha-font-size-s);
      }

      .update-note {
        display: block;
        color: var(--primary-text-color);
        font-weight: var(--ha-font-weight-medium);
      }

      .row-control {
        display: flex;
        align-items: center;
        gap: var(--ha-space-2);
        color: var(--secondary-text-color);
      }

      .slider-control {
        flex: 1 1 200px;
        max-width: 320px;
      }

      .card-actions {
        padding-top: 0;
        padding-bottom: var(--ha-space-2);
        margin-inline-start: calc(-1 * var(--ha-space-3));
        margin-inline-end: 0;
        padding-inline-start: var(--ha-space-4);
      }

      .more {
        margin: 0 var(--ha-space-4);
        border-top: 1px solid var(--divider-color);
      }

      .more summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 48px;
        font-weight: var(--ha-font-weight-medium);
        list-style: none;
        cursor: pointer;
        border-radius: var(--ha-border-radius-sm);
      }

      .more summary::-webkit-details-marker {
        display: none;
      }

      .more summary .icon {
        color: var(--secondary-text-color);
        transition: transform var(--ha-animation-duration-fast) ease-out;
      }

      .more[open] summary .icon {
        transform: rotate(180deg);
      }

      .more summary:focus-visible {
        outline: var(--ha-border-width-md) solid var(--ha-color-focus);
        outline-offset: 2px;
      }

      .more-content {
        display: flex;
        flex-direction: column;
        gap: var(--ha-space-4);
        padding-bottom: var(--ha-space-4);
      }

      .open-page-row {
        display: flex;
        gap: var(--ha-space-2);
      }

      .open-page-row .input {
        flex: 1;
        min-width: 0;
      }

      .danger-actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--ha-space-2);
        margin-inline-start: calc(-1 * var(--ha-space-3));
      }

      .feedback {
        display: flex;
        flex-direction: column;
        gap: var(--ha-space-2);
        margin-top: auto;
        padding: 0 var(--ha-space-4) var(--ha-space-4);
      }

      .feedback .success:empty {
        display: none;
      }

      .feedback .success {
        color: var(--secondary-text-color);
        font-size: var(--ha-font-size-s);
      }

      .dialog-form {
        display: flex;
        flex-direction: column;
        gap: var(--ha-space-4);
      }

      .dialog-error {
        margin-bottom: var(--ha-space-4);
      }

      .dialog-form .dialog-error {
        margin-bottom: 0;
      }
    `]),t(l,1,O);var n0=L=>{history.pushState(null,"",L),window.dispatchEvent(new CustomEvent("location-changed",{detail:{replace:!1}}))},e1=L=>{let H=L.currentTarget;L.defaultPrevented||L.button!==0||L.metaKey||L.ctrlKey||L.shiftKey||L.altKey||!(H instanceof HTMLAnchorElement)||(L.preventDefault(),n0(H.getAttribute("href")??""))};var l0=3e4,J5,C3,H3,V3,L3,M3,r3,e3,t3,i3,a3,o3,A3,d3,x,o2,A2,d2,p2,m2,n2,l2,v2,x2,s2,Z2,u2;d3=[$("smart-panel-manage")];var k=class extends(A3=B,o3=[c({attribute:!1})],a3=[c({attribute:!1})],i3=[u()],t3=[u()],e3=[u()],r3=[u()],M3=[u()],L3=[u()],V3=[u()],H3=[u()],C3=[u()],J5=[u()],A3){constructor(){super(...arguments);n(this,o2,t(x,8,this)),t(x,11,this);n(this,A2,t(x,12,this,"")),t(x,15,this);n(this,d2,t(x,16,this)),t(x,19,this);n(this,p2,t(x,20,this)),t(x,23,this);n(this,m2,t(x,24,this,new Date)),t(x,27,this);n(this,n2,t(x,28,this,"")),t(x,31,this);n(this,l2,t(x,32,this,!1)),t(x,35,this);n(this,v2,t(x,36,this)),t(x,39,this);n(this,x2,t(x,40,this)),t(x,43,this);n(this,s2,t(x,44,this)),t(x,47,this);n(this,Z2,t(x,48,this,!1)),t(x,51,this);n(this,u2,t(x,52,this)),t(x,55,this);y(this,"_unsubscribe");y(this,"_clock")}connectedCallback(){super.connectedCallback(),this.hass&&this._subscribe(),this._clock=window.setInterval(()=>{this._now=new Date},l0)}disconnectedCallback(){super.disconnectedCallback(),window.clearInterval(this._clock),this._unsubscribeNow()}willUpdate(C){C.has("hass")&&this.hass&&!this._unsubscribe&&this.isConnected&&this._subscribe()}_subscribe(){if(this._unsubscribe)return;this._subscribeError=void 0;let C=b5(this.hass,V=>{this._panels=V.panels,this._now=new Date});this._unsubscribe=C,C.catch(V=>{this._unsubscribe===C&&(this._unsubscribe=void 0,this._subscribeError=F(V))})}_unsubscribeNow(){let C=this._unsubscribe;this._unsubscribe=void 0,C?.then(V=>V()).catch(()=>{})}_retry(){this._subscribe()}render(){return a`
      <div class="header">
        <h2>${r("panels_title")}</h2>
        ${this._panels?.length?a`<button class="btn" type="button" @click=${this._openAdd}>
              ${s(_1)} ${r("add_panel")}
            </button>`:d}
      </div>
      <p class="visually-hidden" role="status">${this._announcement}</p>
      ${this._renderContent()} ${this._renderAddDialog()}
    `}_renderContent(){return this._subscribeError?a`<div class="alert error" role="alert">
        ${s(_)}
        <span class="message"
          >${r("panels_load_error",{message:this._subscribeError})}</span
        >
        <button class="btn plain small alert-action" type="button" @click=${this._retry}>
          ${r("retry")}
        </button>
      </div>`:this._panels?this._panels.length===0?a`<div class="empty">
        <span class="empty-icon">${s(J)}</span>
        <h3>${r("empty_title")}</h3>
        <p class="secondary">${r("empty_description")}</p>
        <div class="empty-actions">
          <a class="btn plain" href=${this.setupHref} @click=${e1}
            >${r("go_to_setup")}</a
          >
          <button class="btn" type="button" @click=${this._openAdd}>
            ${s(_1)} ${r("add_panel")}
          </button>
        </div>
      </div>`:a`<ul class="panels">
      ${this._panels.map(C=>a`<li>
          <smart-panel-card
            .hass=${this.hass}
            .panel=${C}
            .now=${this._now}
            @panel-removed=${this._onRemoved}
          ></smart-panel-card>
        </li>`)}
    </ul>`:a`<div class="loading">
        <span class="spinner large" role="progressbar" aria-label=${r("loading")}></span>
      </div>`}_renderAddDialog(){return a`<smart-panel-dialog
      .open=${this._addOpen}
      .heading=${r("add_title")}
      .guarded=${this._adding}
      @closed=${this._closeAdd}
    >
      <form id="add-form" class="add-form" novalidate @submit=${this._add}>
        ${this._renderCandidates()}
      </form>
      <button
        slot="actions"
        class="btn plain"
        type="button"
        ?disabled=${this._adding}
        @click=${this._closeAdd}
      >
        ${r("cancel")}
      </button>
      <button
        slot="actions"
        class="btn"
        type="submit"
        form="add-form"
        ?disabled=${!this._selected}
        aria-busy=${this._adding?"true":"false"}
      >
        ${this._adding?a`<span class="spinner" aria-hidden="true"></span>`:d}
        ${r("add")}
      </button>
    </smart-panel-dialog>`}_renderCandidates(){return this._candidatesError?a`<div class="alert error" role="alert">
        ${s(_)}
        <span class="message"
          >${r("add_load_error",{message:this._candidatesError})}</span
        >
        <button
          class="btn plain small alert-action"
          type="button"
          @click=${this._loadCandidates}
        >
          ${r("retry")}
        </button>
      </div>`:this._candidates?this._candidates.length===0?a`<div class="empty small">
        <h3>${r("add_empty_title")}</h3>
        <p class="secondary">${r("add_empty")}</p>
      </div>`:a`
      ${this._addError?a`<div class="alert error" role="alert">
            ${s(_)}
            <span class="message">${this._addError}</span>
          </div>`:d}
      <fieldset>
        <legend class="secondary">${r("add_intro")}</legend>
        ${this._candidates.map(C=>a`<label class="candidate">
            <input
              type="radio"
              name="candidate"
              .value=${C.mobile_app_entry_id}
              .checked=${this._selected===C.mobile_app_entry_id}
              @change=${this._onSelect}
            />
            <span class="candidate-text">
              <span class="candidate-name">${C.name}</span>
              <span class="secondary"
                >${r("add_device_details",{model:C.model,version:C.app_version})}</span
              >
            </span>
            ${C.likely_panel?a`<span class="likely">${r("add_likely")}</span>`:d}
          </label>`)}
      </fieldset>
    `:a`<div class="loading">
        <span class="spinner large" role="progressbar" aria-label=${r("loading")}></span>
      </div>`}_openAdd(){this._addOpen=!0,this._addError=void 0,this._selected=void 0,this._loadCandidates()}async _loadCandidates(){this._candidates=void 0,this._candidatesError=void 0;try{let C=await k5(this.hass);this._candidates=C,this._selected=C.find(e=>e.likely_panel)?.mobile_app_entry_id,await this.updateComplete;let V=this.renderRoot.querySelectorAll('input[name="candidate"]');(Array.from(V).find(e=>e.checked)??V[0])?.focus()}catch(C){this._candidatesError=F(C)}}_closeAdd(){this._adding||(this._addOpen=!1)}_onSelect(C){this._selected=C.target.value,this._addError=void 0}async _add(C){C.preventDefault();let V=this._candidates?.find(M=>M.mobile_app_entry_id===this._selected);if(!(!V||this._adding)){this._adding=!0,this._addError=void 0;try{await w5(this.hass,V.mobile_app_entry_id),this._addOpen=!1,this._announcement=r("added",{name:V.name})}catch(M){this._addError=r("add_error",{message:F(M)})}finally{this._adding=!1}}}_onRemoved(C){this._announcement=r("removed",{name:C.detail.name})}};x=D(A3),o2=new WeakMap,A2=new WeakMap,d2=new WeakMap,p2=new WeakMap,m2=new WeakMap,n2=new WeakMap,l2=new WeakMap,v2=new WeakMap,x2=new WeakMap,s2=new WeakMap,Z2=new WeakMap,u2=new WeakMap,A(x,4,"hass",o3,k,o2),A(x,4,"setupHref",a3,k,A2),A(x,4,"_panels",i3,k,d2),A(x,4,"_subscribeError",t3,k,p2),A(x,4,"_now",e3,k,m2),A(x,4,"_announcement",r3,k,n2),A(x,4,"_addOpen",M3,k,l2),A(x,4,"_candidates",L3,k,v2),A(x,4,"_candidatesError",V3,k,x2),A(x,4,"_selected",H3,k,s2),A(x,4,"_adding",C3,k,Z2),A(x,4,"_addError",J5,k,u2),k=A(x,0,"SmartPanelManage",d3,k),y(k,"styles",[N,V1,W,L1,M1,g`
      :host {
        display: block;
        container-type: inline-size;
      }

      .header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--ha-space-2) var(--ha-space-4);
        min-height: 40px;
        margin-bottom: var(--ha-space-4);
      }

      .header h2 {
        font-size: var(--ha-font-size-xl);
        font-weight: var(--ha-font-weight-medium);
        line-height: var(--ha-line-height-condensed);
      }

      .panels {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: var(--ha-space-4);
        margin: 0;
        padding: 0;
        list-style: none;
      }

      @container (min-width: 880px) {
        .panels {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--ha-space-6);
        }
      }

      @container (min-width: 1400px) {
        .panels {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--ha-space-2);
        max-width: 500px;
        margin: 0 auto;
        padding: var(--ha-space-12) var(--ha-space-4);
        text-align: center;
      }

      .empty.small {
        padding: var(--ha-space-6) 0;
      }

      .empty-icon .icon {
        width: 64px;
        height: 64px;
        color: var(--secondary-text-color);
      }

      .empty h3 {
        font-size: var(--ha-font-size-xl);
        font-weight: var(--ha-font-weight-medium);
        line-height: var(--ha-line-height-condensed);
      }

      .empty-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--ha-space-2);
        margin-top: var(--ha-space-4);
      }

      .add-form {
        display: flex;
        flex-direction: column;
        gap: var(--ha-space-4);
      }

      fieldset {
        display: flex;
        flex-direction: column;
        gap: var(--ha-space-2);
        min-width: 0;
        margin: 0;
        padding: 0;
        border: none;
      }

      legend {
        margin-bottom: var(--ha-space-2);
        padding: 0;
      }

      .candidate {
        display: flex;
        align-items: center;
        gap: var(--ha-space-3);
        padding: var(--ha-space-3);
        border: 1px solid var(--divider-color);
        border-radius: var(--ha-border-radius-md);
        cursor: pointer;
      }

      .candidate:has(input:checked) {
        border-color: var(--primary-color);
        box-shadow: inset 0 0 0 1px var(--primary-color);
      }

      .candidate input {
        flex: none;
        width: 18px;
        height: 18px;
        margin: 0;
        accent-color: var(--primary-color);
        cursor: pointer;
      }

      .candidate input:focus-visible {
        outline: var(--ha-border-width-md) solid var(--ha-color-focus);
        outline-offset: 2px;
      }

      .candidate-text {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
        overflow-wrap: anywhere;
      }

      .candidate-text .secondary {
        font-size: var(--ha-font-size-s);
      }

      .candidate-name {
        font-weight: var(--ha-font-weight-medium);
      }

      .likely {
        flex: none;
        padding: 2px var(--ha-space-2);
        border-radius: var(--ha-border-radius-pill);
        background-color: var(--ha-color-fill-primary-normal-resting);
        color: var(--ha-color-on-primary-normal);
        font-size: var(--ha-font-size-s);
        font-weight: var(--ha-font-weight-medium);
      }
    `]),t(x,1,k);var g1=L=>`data:image/svg+xml;charset=utf-8,${encodeURIComponent(L)}`,p3=L=>{let H=document.createElement("a");H.href=g1(L),H.download=r("qr_file_name"),H.click()},v0=`
  @page { margin: 20mm; }
  body { font-family: system-ui, sans-serif; color: #000; background: #fff; margin: 0; }
  h1 { font-size: 20pt; margin: 0 0 4pt; }
  .network { font-size: 12pt; margin: 0 0 16pt; }
  ol { font-size: 12pt; line-height: 1.5; margin: 0 0 16pt; padding-left: 18pt; }
  img { display: block; width: 80mm; height: 80mm; margin: 0 0 16pt; }
  .secret { font-size: 10pt; }
`,m3=async(L,H,C)=>{L.querySelectorAll("iframe[data-print-frame]").forEach(Z=>Z.remove());let V=document.createElement("iframe");V.dataset.printFrame="",V.setAttribute("aria-hidden","true"),V.tabIndex=-1,V.style.cssText="position:fixed;right:0;bottom:0;width:0;height:0;border:0;",L.append(V);let M=V.contentWindow,e=V.contentDocument;if(!M||!e)throw V.remove(),new Error("The print frame has no document");let i=(Z,S,m="")=>{let w=e.createElement(S);return w.textContent=m,Z.appendChild(w),w};e.documentElement.lang="en",e.title=r("print_title"),i(e.head,"style",v0),i(e.body,"h1",r("print_title")),i(e.body,"p",r("print_network",{ssid:C})).className="network";let o=i(e.body,"ol");for(let Z of["print_step_reset","print_step_tap","print_step_scan","print_step_finish"])i(o,"li",r(Z));let p=i(e.body,"img");p.alt=r("qr_alt"),p.src=g1(H),i(e.body,"p",r("print_secret")).className="secret";try{await p.decode()}catch(Z){throw V.remove(),Z}M.addEventListener("afterprint",()=>V.remove(),{once:!0}),M.focus(),M.print()};var x0=["wifi_ssid","wifi_security","wifi_password","wifi_hidden","ha_url"],s0=[["WPA","security_wpa"],["WEP","security_wep"],["NONE","security_none"]],n3=L=>x0.includes(L),l3=L=>({wifi_ssid:L.wifi_ssid,wifi_password:"",wifi_security:L.wifi_security,wifi_hidden:L.wifi_hidden,ha_url:L.ha_url}),v3=(L,H)=>O1(`error_${L}_${H}`)??O1(`error_${H}`)??r("error_unknown"),x3=(L,H,C)=>{let[V,M=""]=L.split(`{${H}}`);return a`${V}${C}${M}`},s3,Z3,u3,S3,c3,h3,O3,f3,g3,b3,k3,w3,y3,B3,_3,v,S2,c2,h2,O2,f2,g2,b2,k2,w2,y2,B2,_2,P2;_3=[$("smart-panel-setup")];var f=class extends(B3=B,y3=[c({attribute:!1})],w3=[c({attribute:!1})],k3=[u()],b3=[u()],g3=[u()],f3=[u()],O3=[u()],h3=[u()],c3=[u()],S3=[u()],u3=[u()],Z3=[u()],s3=[u()],B3){constructor(){super(...arguments);n(this,S2,t(v,8,this)),t(v,11,this);n(this,c2,t(v,12,this,"")),t(v,15,this);n(this,h2,t(v,16,this)),t(v,19,this);n(this,O2,t(v,20,this)),t(v,23,this);n(this,f2,t(v,24,this)),t(v,27,this);n(this,g2,t(v,28,this,{})),t(v,31,this);n(this,b2,t(v,32,this,!1)),t(v,35,this);n(this,k2,t(v,36,this,!1)),t(v,39,this);n(this,w2,t(v,40,this)),t(v,43,this);n(this,y2,t(v,44,this,!1)),t(v,47,this);n(this,B2,t(v,48,this)),t(v,51,this);n(this,_2,t(v,52,this)),t(v,55,this);n(this,P2,t(v,56,this)),t(v,59,this);y(this,"_loadStarted",!1)}willUpdate(C){C.has("hass")&&this.hass&&!this._loadStarted&&(this._loadStarted=!0,this._loadSettings(),this._loadQr())}async _loadSettings(){this._loadError=void 0;try{let C=await O5(this.hass);this._settings=C,this._form=l3(C)}catch(C){this._loadError=F(C)}}async _loadQr(){this._qrError=void 0;try{this._qr=await g5(this.hass)}catch(C){this._qr=void 0,this._qrError=F(C)}}get _dirty(){let C=this._form,V=this._settings;return!C||!V?!1:C.wifi_ssid!==V.wifi_ssid||C.wifi_security!==V.wifi_security||C.wifi_hidden!==V.wifi_hidden||C.ha_url!==V.ha_url||C.wifi_security!=="NONE"&&C.wifi_password!==""}render(){return a`
      <div class="layout">
        ${this._renderSettings()} ${this._renderQr()} ${this._renderGuide()}
      </div>
    `}_renderSettings(){return a`
      <section class="card settings" aria-labelledby="settings-title">
        <div class="card-header">
          <h2 id="settings-title">${r("settings_title")}</h2>
        </div>
        ${this._form?this._renderForm(this._form):this._loadError?a`<div class="card-content">
                <div class="alert error" role="alert">
                  ${s(_)}
                  <span class="message"
                    >${r("settings_load_error",{message:this._loadError})}</span
                  >
                  <button
                    class="btn plain small alert-action"
                    type="button"
                    @click=${this._loadSettings}
                  >
                    ${r("retry")}
                  </button>
                </div>
              </div>`:a`<div class="loading">
                <span class="spinner large" role="progressbar" aria-label=${r("loading")}></span>
              </div>`}
      </section>
    `}_renderForm(C){let V=this._settings,M=Object.entries(this._errors).filter(([i])=>!n3(i)),e=V.wifi_password_set?r("field_password_helper_saved"):r("field_password_helper_new");return a`
      <form class="card-content" novalidate @submit=${this._save}>
        <p class="secondary">${r("settings_intro")}</p>

        ${this._saveError?a`<div class="alert error" role="alert">
              ${s(_)}
              <span class="message"
                >${r("settings_save_error",{message:this._saveError})}</span
              >
            </div>`:d}
        ${M.length?a`<div class="alert error" role="alert">
              ${s(_)}
              <span class="message">
                ${M.map(([i,o])=>a`<span class="block"
                      >${r("error_other_field",{field:i,message:v3(i,o)})}</span
                    >`)}
              </span>
            </div>`:d}

        <div class="field">
          <label for="wifi_ssid" class="required">${r("field_ssid")}</label>
          <input
            id="wifi_ssid"
            name="wifi_ssid"
            class="input"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            required
            .value=${C.wifi_ssid}
            aria-invalid=${this._errors.wifi_ssid?"true":"false"}
            aria-describedby="wifi_ssid-help"
            @input=${this._onInput}
          />
          ${this._renderHelp("wifi_ssid",r("field_ssid_helper"))}
        </div>

        <div class="field">
          <label for="wifi_security">${r("field_security")}</label>
          <div class="control">
            <select
              id="wifi_security"
              name="wifi_security"
              class="input"
              aria-invalid=${this._errors.wifi_security?"true":"false"}
              aria-describedby="wifi_security-help"
              @change=${this._onInput}
            >
              ${s0.map(([i,o])=>a`<option value=${i} ?selected=${C.wifi_security===i}>
                    ${r(o)}
                  </option>`)}
            </select>
            <span class="chevron">${s(v1)}</span>
          </div>
          ${this._renderHelp("wifi_security",r("field_security_helper"))}
        </div>

        ${C.wifi_security==="NONE"?d:a`<div class="field">
              <div class="label-row">
                <label
                  for="wifi_password"
                  class=${V.wifi_password_set?"":"required"}
                  >${r("field_password")}</label
                >
                ${V.wifi_password_set?a`<span class="saved-badge">
                      ${s(B1)} ${r("password_saved")}
                    </span>`:d}
              </div>
              <div class="control">
                <input
                  id="wifi_password"
                  name="wifi_password"
                  class="input has-end"
                  type=${this._showPassword?"text":"password"}
                  autocomplete="off"
                  autocapitalize="off"
                  spellcheck="false"
                  .value=${C.wifi_password}
                  aria-invalid=${this._errors.wifi_password?"true":"false"}
                  aria-describedby="wifi_password-help"
                  @input=${this._onInput}
                />
                <button
                  class="icon-button small end"
                  type="button"
                  aria-label=${this._showPassword?r("password_hide"):r("password_show")}
                  title=${this._showPassword?r("password_hide"):r("password_show")}
                  aria-controls="wifi_password"
                  aria-pressed=${this._showPassword?"true":"false"}
                  @click=${this._toggleShowPassword}
                >
                  ${s(this._showPassword?j2:K2)}
                </button>
              </div>
              ${this._renderHelp("wifi_password",e)}
            </div>`}

        <label class="check">
          <input
            name="wifi_hidden"
            type="checkbox"
            .checked=${C.wifi_hidden}
            aria-describedby="wifi_hidden-help"
            @change=${this._onInput}
          />
          <span class="check-text">
            <span class="label">${r("field_hidden")}</span>
            ${this._renderHelp("wifi_hidden",r("field_hidden_helper"))}
          </span>
        </label>

        <div class="field">
          <label for="ha_url" class="required">${r("field_ha_url")}</label>
          <input
            id="ha_url"
            name="ha_url"
            class="input"
            type="url"
            inputmode="url"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            required
            .value=${C.ha_url}
            aria-invalid=${this._errors.ha_url?"true":"false"}
            aria-describedby="ha_url-help"
            @input=${this._onInput}
          />
          <div class="help-row">
            ${this._renderHelp("ha_url",r("field_ha_url_helper",{url:V.ha_url_default}))}
            ${C.ha_url!==V.ha_url_default?a`<button
                  class="btn plain small"
                  type="button"
                  @click=${this._useDefaultUrl}
                >
                  ${r("use_default")}
                </button>`:d}
          </div>
        </div>

        <div class="form-actions">
          <span class="save-status" role="status">
            ${this._saved&&!this._dirty?a`${s(B1)} ${r("settings_saved")}`:d}
          </span>
          <button
            class="btn"
            type="submit"
            aria-busy=${this._saving?"true":"false"}
          >
            ${this._saving?a`<span class="spinner" aria-hidden="true"></span>`:d}
            ${r("save")}
          </button>
        </div>
      </form>
    `}_renderHelp(C,V){let M=this._errors[C];return M?a`<span id="${C}-help" class="field-error">
          ${s(_)} ${v3(C,M)}
        </span>`:a`<span id="${C}-help" class="helper">${V}</span>`}_renderQr(){let C=this._qr,V;this._qrError?V=a`<div class="alert error" role="alert">
        ${s(_)}
        <span class="message">${r("qr_load_error",{message:this._qrError})}</span>
        <button class="btn plain small alert-action" type="button" @click=${this._loadQr}>
          ${r("retry")}
        </button>
      </div>`:C?!C.ready||!C.svg?V=this._renderQrMissing(C.missing):V=a`
        <div class="alert warning">
          ${s(z2)}
          <span class="message">${r("qr_warning")}</span>
        </div>
        ${this._dirty?a`<div class="alert">
              ${s(i1)}
              <span class="message">${r("qr_unsaved")}</span>
            </div>`:d}
        <div class="qr-frame">
          <img src=${g1(C.svg)} alt=${r("qr_alt")} />
        </div>
        <p class="secondary">${r("qr_hint")}</p>
        ${this._printError?a`<div class="alert error" role="alert">
              ${s(_)}
              <span class="message"
                >${r("qr_print_error",{message:this._printError})}</span
              >
            </div>`:d}
      `:V=a`<div class="loading">
        <span class="spinner large" role="progressbar" aria-label=${r("loading")}></span>
      </div>`;let M=!!(C?.ready&&C.svg);return a`
      <section class="card qr" aria-labelledby="qr-title">
        <div class="card-header">
          <h2 id="qr-title">${r("qr_title")}</h2>
        </div>
        <div class="card-content">${V}</div>
        ${M?a`<div class="card-actions">
              <button class="btn filled" type="button" @click=${this._print}>
                ${s(Y2)} ${r("qr_print")}
              </button>
              <button class="btn plain" type="button" @click=${this._download}>
                ${s(q2)} ${r("qr_download")}
              </button>
            </div>`:d}
      </section>
    `}_renderQrMissing(C){let V=C.map(M=>O1(`missing_${M}`)??M);return a`
      <div class="qr-empty">
        <span class="qr-empty-icon">${s(s1)}</span>
        <h3>${r("qr_not_ready_title")}</h3>
        <p class="secondary">
          ${V.length?r("qr_not_ready",{fields:R5.format(V)}):r("qr_not_ready_generic")}
        </p>
      </div>
    `}_renderGuide(){let C=a`<a href=${this.manageHref} @click=${e1}
      >${r("tab_manage")}</a
    >`,V=[["step_reset_title",a`${r("step_reset")}
          <span class="block">${x3(r("step_reset_panel"),"manage",C)}</span>`],["step_tap_title",r("step_tap")],["step_scan_title",r("step_scan")],["step_finish_title",r("step_finish")],["step_login_title",r("step_login")],["step_fullscreen_title",r("step_fullscreen")],["step_add_title",x3(r("step_add"),"manage",C)]];return a`
      <section class="card guide" aria-labelledby="guide-title">
        <div class="card-header">
          <h2 id="guide-title">${r("guide_title")}</h2>
        </div>
        <div class="card-content">
          <ol class="steps">
            ${V.map(([M,e])=>a`<li>
                <h3>${r(M)}</h3>
                <p class="secondary">${e}</p>
              </li>`)}
          </ol>
          <div class="alert">
            ${s(i1)}
            <span class="message">${r("guide_wpa3")}</span>
          </div>
        </div>
      </section>
    `}_onInput(C){let V=C.target,M=V.name;if(!this._form||!n3(M))return;let e=V instanceof HTMLInputElement&&V.type==="checkbox"?V.checked:V.value;if(this._form={...this._form,[M]:e},this._saved=!1,M in this._errors){let{[M]:i,...o}=this._errors;this._errors=o}}_toggleShowPassword(){this._showPassword=!this._showPassword}_useDefaultUrl(){if(!this._form||!this._settings)return;this._form={...this._form,ha_url:this._settings.ha_url_default},this._saved=!1;let{ha_url:C,...V}=this._errors;this._errors=V,this.renderRoot.querySelector("#ha_url")?.focus()}async _save(C){C.preventDefault();let V=this._form;if(!V||this._saving)return;let M={wifi_ssid:V.wifi_ssid,wifi_security:V.wifi_security,wifi_hidden:V.wifi_hidden,ha_url:V.ha_url.trim()};V.wifi_security!=="NONE"&&V.wifi_password!==""&&(M.wifi_password=V.wifi_password),this._saving=!0,this._saved=!1,this._saveError=void 0;try{let e=await f5(this.hass,M);if("errors"in e){this._errors=e.errors,await this.updateComplete,this.renderRoot.querySelector('[aria-invalid="true"]')?.focus();return}this._settings=e.settings,this._form=l3(e.settings),this._errors={},this._showPassword=!1,this._saved=!0,this._loadQr()}catch(e){this._saveError=F(e)}finally{this._saving=!1}}async _print(){if(this._qr?.svg){this._printError=void 0;try{await m3(this.renderRoot,this._qr.svg,this._settings?.wifi_ssid??"")}catch(C){this._printError=F(C)}}}_download(){this._qr?.svg&&p3(this._qr.svg)}};v=D(B3),S2=new WeakMap,c2=new WeakMap,h2=new WeakMap,O2=new WeakMap,f2=new WeakMap,g2=new WeakMap,b2=new WeakMap,k2=new WeakMap,w2=new WeakMap,y2=new WeakMap,B2=new WeakMap,_2=new WeakMap,P2=new WeakMap,A(v,4,"hass",y3,f,S2),A(v,4,"manageHref",w3,f,c2),A(v,4,"_settings",k3,f,h2),A(v,4,"_loadError",b3,f,O2),A(v,4,"_form",g3,f,f2),A(v,4,"_errors",f3,f,g2),A(v,4,"_saving",O3,f,b2),A(v,4,"_saved",h3,f,k2),A(v,4,"_saveError",c3,f,w2),A(v,4,"_showPassword",S3,f,y2),A(v,4,"_qr",u3,f,B2),A(v,4,"_qrError",Z3,f,_2),A(v,4,"_printError",s3,f,P2),f=A(v,0,"SmartPanelSetup",_3,f),y(f,"styles",[N,V1,W,f1,L1,M1,g`
      :host {
        display: block;
        container-type: inline-size;
      }

      .layout {
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: var(--ha-space-4);
        align-items: start;
      }

      @container (min-width: 880px) {
        .layout {
          grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
          gap: var(--ha-space-6);
        }

        .guide {
          grid-column: 1 / -1;
        }
      }

      .block {
        display: block;
      }

      .label-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--ha-space-2);
      }

      .saved-badge {
        display: inline-flex;
        align-items: center;
        gap: var(--ha-space-1);
        font-size: var(--ha-font-size-s);
        color: var(--secondary-text-color);
      }

      .saved-badge .icon {
        width: 16px;
        height: 16px;
        color: var(--success-color);
      }

      .help-row {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }

      /* Line the label of the plain button up with the text above it. */
      .help-row .btn {
        margin-inline-start: calc(-1 * var(--ha-space-3));
      }

      .form-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
        gap: var(--ha-space-4);
      }

      .save-status {
        display: inline-flex;
        align-items: center;
        gap: var(--ha-space-1);
        color: var(--secondary-text-color);
      }

      .save-status .icon {
        width: 18px;
        height: 18px;
        color: var(--success-color);
      }

      .qr-frame {
        align-self: center;
        width: 100%;
        max-width: 288px;
        padding: var(--ha-space-3);
        border-radius: var(--ha-border-radius-md);
        /* A QR code needs dark modules on a light ground to scan, also in dark mode. */
        background: #ffffff;
      }

      .qr-frame img {
        display: block;
        width: 100%;
        height: auto;
        aspect-ratio: 1;
        image-rendering: pixelated;
      }

      .qr-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--ha-space-2);
        padding: var(--ha-space-6) var(--ha-space-4);
        text-align: center;
      }

      .qr-empty-icon .icon {
        width: 64px;
        height: 64px;
        color: var(--secondary-text-color);
      }

      .qr-empty h3 {
        font-size: var(--ha-font-size-l);
        font-weight: var(--ha-font-weight-medium);
      }

      .steps {
        margin: 0;
        padding: 0;
        list-style: none;
        counter-reset: step;
      }

      /* Two columns that read top to bottom, so the steps keep their order. */
      @container (min-width: 880px) {
        .steps {
          column-count: 2;
          column-gap: var(--ha-space-8);
        }
      }

      .steps li {
        position: relative;
        max-width: 70ch;
        padding-inline-start: 40px;
        padding-bottom: var(--ha-space-4);
        break-inside: avoid;
        counter-increment: step;
      }

      .steps li::before {
        content: counter(step);
        position: absolute;
        inset-inline-start: 0;
        top: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: var(--ha-border-radius-circle);
        background-color: var(--ha-color-fill-primary-normal-resting);
        color: var(--ha-color-on-primary-normal);
        font-size: var(--ha-font-size-m);
        font-weight: var(--ha-font-weight-medium);
      }

      .steps h3 {
        font-size: var(--ha-font-size-l);
        font-weight: var(--ha-font-weight-medium);
        line-height: 28px;
      }
    `]),t(v,1,f);var Z0=[{page:"setup",label:"tab_setup",icon:s1},{page:"manage",label:"tab_manage",icon:J}],P3,T3,F3,R3,E3,D3,P,T2,F2,R2,E2;D3=[$("smart-panel-app")];var I=class extends(E3=B,R3=[c({attribute:!1})],F3=[c({type:Boolean,reflect:!0})],T3=[c({attribute:!1})],P3=[c({attribute:!1})],E3){constructor(){super(...arguments);n(this,T2,t(P,8,this)),t(P,11,this);n(this,F2,t(P,12,this,!1)),t(P,15,this);n(this,R2,t(P,16,this)),t(P,19,this);n(this,E2,t(P,20,this)),t(P,23,this)}get _page(){let C=this.route?.path??"";return C==="/manage"||C.startsWith("/manage/")?"manage":"setup"}_href(C){return`${this.route?.prefix??`/${this.panel?.url_path??"smart-panel"}`}/${C}`}willUpdate(C){C.has("hass")&&this.toggleAttribute("dark",!!this.hass?.themes?.darkMode)}render(){if(!this.hass)return d;let C=this.narrow||this.hass.dockedSidebar==="always_hidden",V=this._page;return a`
      <header class="toolbar">
        ${C?a`<button
              class="icon-button menu"
              type="button"
              aria-label=${r("menu")}
              title=${r("menu")}
              @click=${this._toggleMenu}
            >
              ${s(X2)}
            </button>`:d}
        <h1 class="title">${this.panel?.title||r("title")}</h1>
        ${this.narrow?d:this._renderTabs(V,"top-bar")}
        ${this.narrow?d:a`<span class="balance"></span>`}
      </header>
      <main class="content">
        <div class="page">
          ${V==="manage"?a`<smart-panel-manage
                .hass=${this.hass}
                .setupHref=${this._href("setup")}
              ></smart-panel-manage>`:a`<smart-panel-setup
                .hass=${this.hass}
                .manageHref=${this._href("manage")}
              ></smart-panel-setup>`}
        </div>
      </main>
      ${this.narrow?this._renderTabs(V,"bottom-bar"):d}
    `}_renderTabs(C,V){return a`<nav class="tabs ${V}" aria-label=${r("tabs_label")}>
      ${Z0.map(M=>a`<a
          class="tab"
          href=${this._href(M.page)}
          aria-current=${M.page===C?"page":"false"}
          @click=${e1}
        >
          ${s(M.icon)}
          <span class="tab-name">${r(M.label)}</span>
        </a>`)}
    </nav>`}_toggleMenu(){this.dispatchEvent(new CustomEvent("hass-toggle-menu",{bubbles:!0,composed:!0}))}};P=D(E3),T2=new WeakMap,F2=new WeakMap,R2=new WeakMap,E2=new WeakMap,A(P,4,"hass",R3,I,T2),A(P,4,"narrow",F3,I,F2),A(P,4,"route",T3,I,R2),A(P,4,"panel",P3,I,E2),I=A(P,0,"SmartPanelApp",D3,I),y(I,"styles",[N,W,g`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        background-color: var(--primary-background-color);
        color-scheme: light;
      }

      :host([dark]) {
        color-scheme: dark;
      }

      .toolbar {
        display: flex;
        align-items: center;
        flex: none;
        gap: var(--ha-space-2);
        height: calc(var(--header-height, 56px) + var(--safe-area-inset-top, 0px));
        padding: var(--safe-area-inset-top, 0px)
          calc(var(--ha-space-3) + var(--safe-area-inset-right, 0px)) 0
          calc(var(--ha-space-3) + var(--safe-area-inset-left, 0px));
        background-color: var(--app-header-background-color);
        color: var(--app-header-text-color, var(--primary-text-color));
        border-bottom: var(--app-header-border-bottom, 1px solid var(--divider-color));
      }

      :host([narrow]) .toolbar {
        padding-inline: calc(var(--ha-space-1) + var(--safe-area-inset-left, 0px))
          calc(var(--ha-space-1) + var(--safe-area-inset-right, 0px));
      }

      .menu {
        color: var(--sidebar-icon-color, var(--secondary-text-color));
      }

      .title {
        flex: 1;
        min-width: 0;
        margin-inline-start: var(--ha-space-3);
        font-size: var(--ha-font-size-xl);
        font-weight: var(--ha-font-weight-normal);
        line-height: var(--ha-line-height-condensed);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      :host([narrow]) .title {
        margin-inline-start: var(--ha-space-2);
      }

      .balance {
        flex: 1;
      }

      .tabs {
        display: flex;
        align-self: stretch;
      }

      .tab {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--ha-space-2);
        padding: 0 var(--ha-space-8);
        color: var(--app-header-text-color, var(--primary-text-color));
        font-size: var(--ha-font-size-m);
        font-weight: var(--ha-font-weight-medium);
        text-decoration: none;
        white-space: nowrap;
        transition: background-color var(--ha-animation-duration-fast) ease-out;
        -webkit-tap-highlight-color: transparent;
      }

      .tab .icon {
        color: var(--sidebar-icon-color, var(--secondary-text-color));
      }

      .tab:hover {
        background-color: var(--ha-color-fill-neutral-quiet-hover);
      }

      .tab:focus-visible {
        outline: var(--ha-border-width-md) solid var(--ha-color-focus);
        outline-offset: -2px;
        border-radius: 0;
      }

      .tab[aria-current="page"],
      .tab[aria-current="page"] .icon {
        color: var(--primary-color);
      }

      .top-bar .tab[aria-current="page"]::after {
        content: "";
        position: absolute;
        inset-inline: 0;
        bottom: 0;
        height: 2px;
        background-color: var(--primary-color);
      }

      .bottom-bar {
        flex: none;
        justify-content: space-around;
        min-height: var(--header-height, 56px);
        padding: 0 var(--ha-space-4) var(--safe-area-inset-bottom, 0px);
        background-color: var(--app-header-background-color);
        border-top: 1px solid var(--divider-color);
      }

      .bottom-bar .tab {
        flex: 1;
        flex-direction: column;
        gap: var(--ha-space-1);
        min-height: var(--header-height, 56px);
        padding: 0 var(--ha-space-1);
        font-size: var(--ha-font-size-s);
      }

      .content {
        flex: 1;
        min-height: 0;
        overflow: auto;
        padding: var(--ha-space-6)
          calc(var(--ha-space-6) + var(--safe-area-inset-right, 0px))
          calc(var(--ha-space-6) + var(--safe-area-inset-bottom, 0px))
          calc(var(--ha-space-6) + var(--safe-area-inset-left, 0px));
      }

      :host([narrow]) .content {
        padding: var(--ha-space-4)
          calc(var(--ha-space-4) + var(--safe-area-inset-right, 0px))
          var(--ha-space-4)
          calc(var(--ha-space-4) + var(--safe-area-inset-left, 0px));
      }

      .page {
        max-width: 1680px;
        margin: 0 auto;
      }
    `]),t(P,1,I);export{I as SmartPanelApp};
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/

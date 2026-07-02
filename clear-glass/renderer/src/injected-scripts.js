/**
 * renderer/src/injected-scripts.js — page-context scripts injected into
 * the <webview> via executeJavaScript(). These run inside the loaded
 * page's own JS context, not the renderer's — extracted verbatim from
 * browser.html's inline <script> ("Element picker" + "Inline DOM mesh
 * script" sections). Kept as plain strings on purpose: they cross a
 * process/context boundary and can't be ES modules.
 */

export const PICKER_SCRIPT = `
(function() {
  if (window.__cgPicker) window.__cgPicker.destroy();
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:2147483647;cursor:crosshair;';
  document.body.appendChild(overlay);
  const hl = document.createElement('div');
  hl.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483646;border:2px solid #00f5ff;background:rgba(0,245,255,0.06);box-shadow:0 0 12px #00f5ff44;transition:all .06s;';
  document.body.appendChild(hl);
  let last = null;
  overlay.onmousemove = (e) => {
    overlay.style.pointerEvents = 'none';
    const el = document.elementFromPoint(e.clientX, e.clientY);
    overlay.style.pointerEvents = 'all';
    if (!el || el === last) return; last = el;
    const r = el.getBoundingClientRect();
    hl.style.cssText += ';top:'+r.top+'px;left:'+r.left+'px;width:'+r.width+'px;height:'+r.height+'px;';
  };
  overlay.onclick = (e) => {
    e.preventDefault(); e.stopPropagation();
    overlay.style.pointerEvents = 'none';
    const el = document.elementFromPoint(e.clientX, e.clientY);
    overlay.style.pointerEvents = 'all';
    if (!el) return;
    const r = el.getBoundingClientRect();
    const data = {
      tag: el.tagName.toLowerCase(),
      id_attr: el.id,
      classes: el.className,
      text: el.innerText?.slice(0,100),
      href: el.href,
      value: el.value,
      rect: {top:r.top,left:r.left,width:r.width,height:r.height},
    };
    try { require('electron').ipcRenderer.sendToHost('dom:pick-result', data); } catch {}
    try { window.postMessage({ __cgBridge: true, channel: 'dom:pick-result', payload: data }, '*'); } catch {}
    window.__cgPicker.destroy();
  };
  window.__cgPicker = {
    destroy() { overlay.remove(); hl.remove(); window.__cgPicker = null; }
  };
})();
`;

export const DOM_MESH_SCRIPT = `(function(){if(window.__cgDomMesh)return;const mesh=new Map();let c=0;function nid(el){if(!el.__cgId)el.__cgId='cg-'+(++c);return el.__cgId;}function meta(el){const r=el.getBoundingClientRect?el.getBoundingClientRect():{};return{id:el.__cgId||null,tag:el.tagName?.toLowerCase()||'#text',id_attr:el.id||null,classes:el.className&&typeof el.className==='string'?el.className.trim().split(/\\s+/).filter(Boolean):[],text:el.innerText?.slice(0,200)||null,rect:{top:r.top,left:r.left,width:r.width,height:r.height},visible:r.width>0&&r.height>0,children:el.childElementCount||0};}function ser(el,d=0,max=4){if(!el||el.nodeType!==1)return null;const m=meta(el);m.id=nid(el);if(d<max){m.children=[];for(const c of el.children){const s=ser(c,d+1,max);if(s)m.children.push(s);}}else m.children=el.childElementCount;return m;}window.__cgDomMesh={query(s){return[...document.querySelectorAll(s)].map(el=>({...meta(el),id:nid(el)}));},getTree(max=4){return ser(document.documentElement,0,max);},highlight(s,c='#00f5ff'){document.querySelectorAll('[data-cgh]').forEach(e=>{e.style.outline='';delete e.dataset.cgh;});document.querySelectorAll(s).forEach(e=>{e.style.outline='2px solid '+c;e.dataset.cgh='1';});},};})();`;

/**
 * renderer/src/dom-panel.js — DOM Archaeology panel. Extracted from
 * browser.html's inline <script> ("DOM Archaeology" section).
 */

import { gateButton, gateOn } from './gate-runtime.js';
import { state } from './state.js';
import { DOM_MESH_SCRIPT } from './injected-scripts.js';

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function initDomPanel() {
  const wv = document.getElementById('wv');
  const domPanel = document.getElementById('dom-panel');
  const domTree = document.getElementById('dom-tree');
  const domSearch = document.getElementById('dom-search');

  function renderNodeRecursive(node, container, depth) {
    if (!node) return;
    const indent = '  '.repeat(depth);
    const div = document.createElement('div');
    div.className = 'dom-node';

    const id = node.id_attr ? `<span class="dom-id"> #${node.id_attr}</span>` : '';
    const cls = node.classes?.length ? `<span class="dom-cls"> .${node.classes.slice(0, 2).join('.')}</span>` : '';
    const txt = node.text ? `<span class="dom-text"> "${node.text.slice(0, 40)}"</span>` : '';

    div.innerHTML = `${indent}<span class="dom-tag">&lt;${node.tag}&gt;</span>${id}${cls}${txt}`;
    div.addEventListener('click', () => {
      if (node.id_attr) wv.executeJavaScript(`window.__cgDomMesh?.highlight('#${node.id_attr}')`, true).catch(() => {});
    });
    container.appendChild(div);

    if (Array.isArray(node.children)) {
      for (const child of node.children) renderNodeRecursive(child, container, depth + 1);
    }
  }

  function renderDomNode(node, container) {
    if (!node) return;
    container.innerHTML = '';
    renderNodeRecursive(node, container, 0);
  }

  function renderDomResult(nodes) {
    domTree.innerHTML = '';
    if (!nodes?.length) {
      domTree.textContent = 'No matches';
      return;
    }
    for (const node of nodes) renderNodeRecursive(node, domTree, 0);
  }

  async function refreshDomTree() {
    domTree.textContent = 'Loading...';
    try {
      const tree = await wv.executeJavaScript('window.__cgDomMesh?.getTree(4)', true);
      if (!tree) {
        await wv.executeJavaScript(DOM_MESH_SCRIPT, true);
        const tree2 = await wv.executeJavaScript('window.__cgDomMesh?.getTree(4)', true);
        renderDomNode(tree2, domTree);
      } else {
        renderDomNode(tree, domTree);
      }
    } catch (err) {
      domTree.textContent = 'Error: ' + err.message;
    }
  }

  gateButton('btn-dom', {
    label: 'DOM Archaeology',
    run: () => {
      state.domPanelVisible = !state.domPanelVisible;
      domPanel.classList.toggle('visible', state.domPanelVisible);
      if (state.domPanelVisible) refreshDomTree();
    },
  });

  gateButton('dom-panel-close', {
    label: 'Close DOM panel',
    run: () => {
      state.domPanelVisible = false;
      domPanel.classList.remove('visible');
    },
  });

  gateButton('dom-refresh', { label: 'Refresh DOM tree', run: refreshDomTree });

  gateOn(
    'dom-search',
    'input',
    {
      label: 'DOM search',
      run: debounce(async () => {
        const q = domSearch.value.trim();
        if (!q) {
          refreshDomTree();
          return;
        }
        try {
          const res = await wv.executeJavaScript(`window.__cgDomMesh?.query(${JSON.stringify(q)})`, true);
          renderDomResult(res);
        } catch {}
      }, 300),
    }
  );

  wv.addEventListener('dom-ready', () => {
    if (state.domPanelVisible) refreshDomTree();
  });

  return { refreshDomTree };
}

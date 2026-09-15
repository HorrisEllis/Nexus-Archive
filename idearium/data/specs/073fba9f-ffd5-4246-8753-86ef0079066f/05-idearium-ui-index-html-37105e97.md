---
chunk_uuid: 37105e97-5964-4cda-b22d-d202ba7f8b5f
spec_uuid: 073fba9f-ffd5-4246-8753-86ef0079066f
section: idearium-ui-index-html
title: idearium/ui/index.html
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:073fba9f:idearium-ui-index-html
contract_id: spec-contract:073fba9f:idearium-ui-index-html:37105e97
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:05:08.595Z
---

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>IDEARIUM — Nexus Idea OS</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
:root {
  --bg:     #07090e;
  --bg1:    #0b0f18;
  --bg2:    #0f1520;
  --bg3:    #141c2e;
  --panel:  #0d1219;
  --b0:     rgba(56,189,248,0.06);
  --b1:     rgba(56,189,248,0.14);
  --b2:     rgba(56,189,248,0.28);
  --sky:    #38bdf8;
  --sky2:   #7dd3fc;
  --mint:   #34d399;
  --amber:  #fbbf24;
  --coral:  #f87171;
  --violet: #a78bfa;
  --rose:   #fb7185;
  --text:   #c4d4ee;
  --text2:  #607898;
  --text3:  #334560;
  --mono:   'IBM Plex Mono', monospace;
  --sans:   'IBM Plex Sans', sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--bg);color:var(--text);font-family:var(--sans);font-size:13px;height:100vh;overflow:hidden}
body{display:flex;flex-direction:column;position:relative}

/* ════════════════════════════════════════════════════
   STARRY NIGHT — ambient field behind everything
   low-opacity swirl + twinkle, never competes with data
   ════════════════════════════════════════════════════ */
#starfield{position:fixed;inset:0;z-index:0;pointer-events:none;background:
  radial-gradient(ellipse 1200px 800px at 70% 8%, rgba(35,55,110,.35) 0%, rgba(10,16,38,.18) 45%, transparent 75%),
  var(--bg)}
#starfield canvas{position:absolute;inset:0;width:100%;height:100%}
.swirl-layer{position:absolute;inset:-20%;opacity:.16;mix-blend-mode:screen;filter:blur(30px) saturate(130%)}
.swirl-a{background:conic-gradient(from 0deg at 24% 30%, transparent 0deg, #3a5694 40deg, transparent 100deg, transparent 360deg);animation:spin 130s linear infinite}
.swirl-b{background:conic-gradient(from 180deg at 76% 62%, transparent 0deg, #7dd3fc 30deg, transparent 90deg, transparent 360deg);animation:spin 95s linear infinite reverse}
.swirl-c{background:conic-gradient(from 90deg at 50% 85%, transparent 0deg, #a78bfa 25deg, transparent 70deg, transparent 360deg);animation:spin 160s linear infinite}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.shoot{position:absolute;width:2px;height:2px;background:#fff;border-radius:50%;box-shadow:0 0 8px 2px #fff;top:12%;left:-5%;opacity:0;animation:shoot 14s linear infinite;animation-delay:6s}
.shoot::after{content:'';position:absolute;right:0;top:0;width:110px;height:1px;background:linear-gradient(to left, rgba(255,255,255,.8), transparent)}
@keyframes shoot{0%{transform:translate(0,0);opacity:0}3%{opacity:.9}30%{transform:translate(680px,200px);opacity:0}100%{opacity:0}}

/* everything else sits above the field */
.topbar, .app-shell, .modal-overlay, .toast-area{position:relative;z-index:2}

/* TOPBAR */
.topbar{height:38px;background:rgba(11,15,24,.88);backdrop-filter:blur(6px);border-bottom:1px solid var(--b1);display:flex;align-items:center;padding:0 14px;gap:16px;flex-shrink:0}
.logo{font-family:var(--mono);font-size:12px;font-weight:600;color:var(--sky);letter-spacing:.18em;cursor:pointer}
.logo span{color:var(--text3)}
.tb-sep{width:1px;height:18px;background:var(--b1)}
.tb-stat{font-family:var(--mono);font-size:10px;color:var(--text2);display:flex;align-items:center;gap:4px}
.tb-stat .v{font-weight:500}
.tb-stat .v.hi{color:var(--coral)}
.tb-stat .v.ok{color:var(--mint)}
.tb-stat .v.sky{color:var(--sky)}
.tb-conn{font-family:var(--mono);font-size:9px;padding:2px 8px;border-radius:3px;border:1px solid var(--b1);color:var(--text3);cursor:pointer;display:flex;align-items:center;gap:5px}
.tb-conn .dot{width:6px;height:6px;border-radius:50%;background:var(--text3)}
.tb-conn.online{border-color:rgba(52,211,153,.3);color:var(--mint)}
.tb-conn.online .dot{background:var(--mint);box-shadow:0 0 6px var(--mint)}
.tb-conn.offline{border-color:rgba(248,113,113,.25);color:var(--coral)}
.tb-conn.offline .dot{background:var(--coral)}
.tb-right{margin-left:auto;display:flex;align-items:center;gap:8px}
.tb-btn{font-family:var(--mono);font-size:10px;padding:3px 9px;border-radius:3px;border:1px solid var(--b1);background:none;color:var(--text2);cursor:pointer;transition:all .15s}
.tb-btn:hover{border-color:var(--b2);color:var(--text)}
.tb-btn.active{background:rgba(56,189,248,.1);border-color:var(--b2);color:var(--sky)}

/* APP SHELL — nav rail + view area */
.app-shell{flex:1;display:flex;flex-direction:column;overflow:hidden}

/* ── TOP TABS (replaces old vertical rail) ── */
.tabbar{flex-shrink:0;height:44px;background:rgba(11,15,24,.75);border-bottom:1px solid var(--b1);display:flex;align-items:stretch;padding:0 6px;gap:2px;position:relative;z-index:25}
.tab-btn{background:none;border:none;color:var(--text3);font-family:var(--mono);font-size:12px;letter-spacing:.03em;padding:0 14px;height:100%;cursor:pointer;display:flex;align-items:center;gap:7px;border-bottom:2px solid transparent;transition:color .15s,border-color .15s;white-space:nowrap}
.tab-btn:hover{color:var(--text2)}
.tab-btn.active{color:var(--sky);border-bottom-color:var(--sky)}
.tab-icon{font-size:13px;opacity:.85}
.tab-group{position:relative;display:flex}
.tab-caret{font-size:8px;margin-left:1px;opacity:.7}
.tab-dropdown{position:absolute;top:100%;left:0;min-width:180px;background:var(--bg2);border:1px solid var(--b1);border-top:none;border-radius:0 0 10px 10px;box-shadow:0 12px 28px rgba(0,0,0,.45);display:none;flex-direction:column;padding:5px;z-index:30}
.tab-group:hover .tab-dropdown,.tab-group.open .tab-dropdown{display:flex}
.tab-sub{background:none;border:none;color:var(--text2);font-family:var(--mono);font-size:12px;padding:8px 10px;text-align:left;cursor:pointer;border-radius:6px;display:flex;align-items:center;gap:9px;width:100%}
.tab-sub:hover{background:var(--b0);color:var(--text)}
.tab-sub.active{color:var(--sky);background:rgba(56,189,248,.09)}
.tab-spacer{flex:1}
.tab-badge{font-size:9px;padding:1px 6px;border-radius:20px;background:var(--b0);color:var(--text2);letter-spacing:.04em}

.view-area{flex:1;overflow:hidden;display:flex;flex-direction:column;position:relative}
.view{position:absolute;inset:0;display:none;flex-direction:column;overflow:hidden}
.view.active{display:flex}

/* ════════════════════════════════════════════════════
   WELCOME VIEW
   ════════════════════════════════════════════════════ */
.welcome{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;overflow-y:auto}
.welcome-mark{font-family:var(--mono);font-size:11px;letter-spacing:.3em;color:var(--text3);margin-bottom:14px}
.welcome-title{font-family:var(--mono);font-size:34px;font-weight:600;letter-spacing:.12em;color:var(--sky);text-shadow:0 0 30px rgba(56,189,248,.25);margin-bottom:8px}
.welcome-title span{color:var(--text)}
.welcome-sub{font-size:13px;color:var(--text2);max-width:520px;text-align:center;line-height:1.7;margin-bottom:36px}
.pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:920px;width:100%}
.pillar{background:rgba(13,18,25,.7);border:1px solid var(--b0);border-radius:10px;padding:18px;cursor:pointer;transition:all .2s;text-align:left;position:relative;overflow:hidden}
.pillar:hover{border-color:var(--b2);background:rgba(56,189,248,.04);transform:translateY(-2px)}
.pillar-step{font-family:var(--mono);font-size:9px;color:var(--text3);letter-spacing:.1em}
.pillar-icon{font-size:20px;margin:8px 0 10px}
.pillar-name{font-size:14px;font-weight:500;color:var(--text);margin-bottom:5px}
.pillar-desc{font-size:11px;color:var(--text2);line-height:1.55}
.pillar.flow::after{content:'→';position:absolute;right:-9px;top:50%;transform:translateY(-50%);color:var(--text3);font-size:16px;z-index:5}
.pillar:nth-child(3)::after,.pillar:nth-child(6)::after{display:none}
.welcome-foot{margin-top:30px;font-family:var(--mono);font-size:9px;color:var(--text3);letter-spacing:.08em}

/* ════════════════════════════════════════════════════
   SHARED panel/list/detail primitives (Ideas view baseline)
   ════════════════════════════════════════════════════ */
.body2{flex:1;display:grid;grid-template-columns:1fr 340px;overflow:hidden;gap:1px;background:var(--b0)}
.left{display:flex;flex-direction:column;overflow:hidden;background:rgba(7,9,14,.55)}
.right{display:flex;flex-direction:column;overflow:hidden;background:rgba(11,15,24,.6)}

.ph{height:30px;background:rgba(15,21,32,.7);border-bottom:1px solid var(--b0);display:flex;align-items:center;padding:0 12px;gap:8px;flex-shrink:0}
.ph-title{font-family:var(--mono);font-size:9px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--text2)}
.ph-badge{margin-left:auto;font-family:var(--mono);font-size:9px;padding:1px 6px;border-radius:2px;border:1px solid var(--b1);color:var(--text3)}
.ph-badge.live{border-color:rgba(52,211,153,.25);color:var(--mint)}
.ph-badge.live::before{content:'● ';font-size:7px}

.toolbar{height:36px;border-bottom:1px solid var(--b0);display:flex;align-items:center;padding:0 10px;gap:6px;flex-shrink:0}
.mode-btn{font-family:var(--mono);font-size:9px;padding:3px 8px;border-radius:3px;border:1px solid var(--b1);background:none;color:var(--text3);cursor:pointer;transition:all .15s;white-space:nowrap}
.up-chip{font-family:var(--mono);font-size:10px;padding:4px 10px;border-radius:99px;border:1px solid var(--b1);background:none;color:var(--text3);cursor:pointer;transition:all .15s}
.up-chip:hover{border-color:var(--sky);color:var(--text)}
.mode-btn:hover{color:var(--text2);border-color:var(--b1)}
.mode-btn.active{border-color:rgba(56,189,248,.35);color:var(--sky);background:rgba(56,189,248,.06)}
.search-input{flex:1;background:none;border:none;outline:none;font-family:var(--mono);font-size:11px;color:var(--text);caret-color:var(--sky)}
.search-input::placeholder{color:var(--text3)}

.idea-list{flex:1;overflow-y:auto;padding:8px}
.idea-list::-webkit-scrollbar{width:3px}
.idea-list::-webkit-scrollbar-thumb{background:var(--b1);border-radius:2px}

.idea-card{background:var(--bg2);border:1px solid var(--b0);border-radius:6px;padding:10px 12px;margin-bottom:6px;cursor:pointer;transition:border-color .2s,background .2s;position:relative;overflow:hidden}
.idea-card:hover{border-color:var(--b1);background:var(--bg3)}
.idea-card.selected{border-color:var(--b2);background:rgba(56,189,248,.04)}
.idea-card.local{border-color:rgba(251,191,36,.25)}
.idea-card.archived{opacity:.55}

.idea-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:6px 0 0 6px}
.idea-card.t-high::before{background:var(--coral)}
.idea-card.t-med::before{background:var(--amber)}
.idea-card.t-low::before{background:var(--mint)}

.ic-top{display:flex;align-items:flex-start;gap:8px;margin-bottom:6px}
.ic-name{font-size:13px;font-weight:500;color:var(--text);flex:1;line-height:1.3}
.ic-status{font-family:var(--mono);font-size:9px;padding:2px 6px;border-radius:2px;flex-shrink:0;white-space:nowrap}
.ic-intent{font-size:11px;color:var(--text2);margin-bottom:7px;line-height:1.5}
.ic-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.ic-tag{font-family:var(--mono);font-size:9px;color:var(--text3);background:var(--bg3);border:1px solid var(--b0);padding:1px 5px;border-radius:2px}
.ic-gap{font-family:var(--mono);font-size:9px;color:var(--coral);display:flex;align-items:center;gap:3px}
.ic-uuid{font-family:var(--mono);font-size:9px;color:var(--text3)}

.tension-row{display:flex;align-items:center;gap:6px;margin-top:6px}
.tension-label{font-family:var(--mono);font-size:9px;color:var(--text3);width:50px}
.tension-track{flex:1;height:3px;background:var(--bg);border-radius:2px;overflow:hidden}
.tension-fill{height:100%;border-radius:2px;transition:width .8s ease}
.tension-pct{font-family:var(--mono);font-size:9px;width:28px;text-align:right}
.stab-mini{display:flex;gap:2px;flex-shrink:0}
.stab-mini i{width:3px;height:10px;border-radius:1px;background:var(--b1)}

.detail-area{flex:1;overflow-y:auto;padding:12px}
.detail-area::-webkit-scrollbar{width:3px}
.detail-area::-webkit-scrollbar-thumb{background:var(--b1);border-radius:2px}
.detail-empty{display:flex;align-items:center;justify-content:center;height:100%;font-family:var(--mono);font-size:11px;color:var(--text3);text-align:center;padding:30px}

.ds{margin-bottom:16px}
.ds-label{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--text3);margin-bottom:6px}
.ds-value{font-size:12px;color:var(--text);line-height:1.6}
.ds-mono{font-family:var(--mono);font-size:10px;color:var(--text2);line-height:1.7;white-space:pre-wrap;word-break:break-all}

.tag-row{display:flex;gap:5px;flex-wrap:wrap}
.tag-pill{font-family:var(--mono);font-size:9px;padding:2px 7px;border-radius:3px;background:rgba(56,189,248,.08);border:1px solid rgba(56,189,248,.15);color:var(--sky2)}

.gap-item{border:1px solid var(--b0);border-radius:4px;padding:7px 9px;margin-bottom:5px;background:var(--bg2)}
.gap-item.open{border-color:rgba(248,113,113,.2)}
.gap-sev{font-family:var(--mono);font-size:9px;margin-right:6px}
.gap-desc{font-size:11px;color:var(--text2);margin-top:3px;line-height:1.5}
.gap-id{font-family:var(--mono);font-size:9px;color:var(--text3)}

.link-item{display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--b0);font-size:11px}
.link-item:last-child{border-bottom:none}
.link-type{font-family:var(--mono);font-size:9px;padding:1px 5px;border-radius:2px}
.link-type.resonance{background:rgba(56,189,248,.1);color:var(--sky2)}
.link-type.tension{background:rgba(248,113,113,.1);color:var(--coral)}
.link-type.causal{background:rgba(167,139,250,.1);color:var(--violet)}
.link-type.temporal{background:rgba(251,191,36,.1);color:var(--amber)}
.link-type.semantic{background:rgba(52,211,153,.1);color:var(--mint)}

.action-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.action-btn{font-family:var(--mono);font-size:10px;padding:4px 10px;border-radius:3px;border:1px solid var(--b1);background:none;color:var(--text2);cursor:pointer;transition:all .15s}
.action-btn:hover{border-color:var(--b2);color:var(--text)}
.action-btn.primary{border-color:rgba(56,189,248,.3);color:var(--sky)}
.action-btn.danger{border-color:rgba(248,113,113,.25);color:var(--coral)}

/* MODAL (shared) */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:300;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .2s}
.modal-overlay.open{opacity:1;pointer-events:all}
.modal{background:var(--bg1);border:1px solid var(--b2);border-radius:8px;width:520px;max-height:86vh;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:12px}
.modal-title{font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--sky)}
.field-group{display:flex;flex-direction:column;gap:4px}
.field-label{font-family:var(--mono);font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.1em}
.field-input,.field-textarea,.field-select{background:var(--bg2);border:1px solid var(--b1);border-radius:4px;padding:7px 10px;font-family:var(--mono);font-size:11px;color:var(--text);outline:none;transition:border-color .15s;width:100%}
.field-input:focus,.field-textarea:focus,.field-select:focus{border-color:var(--b2)}
.field-input::placeholder,.field-textarea::placeholder{color:var(--text3)}
.field-textarea{resize:vertical;min-height:60px;font-family:var(--sans);font-size:12px}
.modal-actions{display:flex;justify-content:flex-end;gap:8px}
.modal-btn{font-family:var(--mono);font-size:10px;padding:6px 14px;border-radius:4px;border:1px solid var(--b1);background:none;color:var(--text2);cursor:pointer;transition:all .15s}
.modal-btn.confirm{background:rgba(56,189,248,.1);border-color:rgba(56,189,248,.35);color:var(--sky)}
.modal-btn:hover{border-color:var(--b2);color:var(--text)}

.gap-log{border-top:1px solid var(--b0);flex-shrink:0}
.gap-log-inner{max-height:140px;overflow-y:auto;padding:6px 10px}
.gap-log-inner::-webkit-scrollbar{width:3px}
.gap-log-inner::-webkit-scrollbar-thumb{background:var(--b1);border-radius:2px}
.gap-log-line{font-family:var(--mono);font-size:10px;color:var(--text2);display:flex;gap:8px;padding:2px 0;border-bottom:1px solid rgba(56,189,248,.04)}
.gl-ts{color:var(--text3);width:52px;flex-shrink:0}
.gl-type{width:90px;flex-shrink:0}
.gl-type.gap{color:var(--coral)}
.gl-type.snap{color:var(--sky)}
.gl-type.idea{color:var(--mint)}
.gl-type.spec{color:var(--violet)}
.gl-type.err{color:var(--rose)}

.snap-bar{height:32px;border-top:1px solid var(--b0);display:flex;align-items:center;padding:0 12px;gap:8px;background:var(--bg2);flex-shrink:0}
.snap-input{flex:1;background:none;border:none;outline:none;font-family:var(--mono);font-size:11px;color:var(--text);caret-color:var(--sky)}
.snap-input::placeholder{color:var(--text3)}
.snap-btn{font-family:var(--mono);font-size:9px;padding:3px 9px;border-radius:3px;border:1px solid rgba(56,189,248,.25);background:rgba(56,189,248,.06);color:var(--sky);cursor:pointer;transition:all .15s}
.snap-btn:hover{background:rgba(56,189,248,.12);border-color:rgba(56,189,248,.4)}
.snap-btn:disabled{opacity:.4;cursor:not-allowed}
.snap-latest{font-family:var(--mono);font-size:9px;color:var(--text3)}

/* phase colors — real IDEA_PHASES */
.st-seed{background:rgba(56,189,248,.1);color:var(--sky2)}
.st-expanding{background:rgba(52,211,153,.1);color:var(--mint)}
.st-tensioned{background:rgba(251,191,36,.12);color:var(--amber)}
.st-specced{background:rgba(167,139,250,.12);color:var(--violet)}
.st-building{background:rgba(56,189,248,.1);color:var(--sky)}
.st-build_failed{background:rgba(248,113,113,.12);color:var(--coral)}
.st-complete{background:rgba(52,211,153,.16);color:var(--mint)}
.st-archived{background:rgba(100,116,139,.1);color:#64748b}

/* severity colors — real GAP_SEVERITIES */
.sev-fatal{color:var(--rose)}
.sev-high{color:var(--coral)}
.sev-medium{color:var(--amber)}
.sev-low{color:var(--text3)}

.toast-area{position:fixed;bottom:50px;right:14px;display:flex;flex-direction:column;gap:5px;z-index:400}
.toast{background:var(--bg2);border:1px solid var(--b1);border-radius:4px;padding:6px 12px;font-family:var(--mono);font-size:10px;color:var(--text2);opacity:0;transform:translateX(16px);animation:ti .2s ease forwards,to .2s ease forwards 2.4s;pointer-events:none}
@keyframes ti{to{opacity:1;transform:none}}
@keyframes to{to{opacity:0;transform:translateX(16px)}}
.toast.ok{border-color:rgba(52,211,153,.3);color:var(--mint)}
.toast.err{border-color:rgba(248,113,113,.3);color:var(--coral)}

.offline-banner{background:rgba(248,113,113,.06);border-bottom:1px solid rgba(248,113,113,.2);color:var(--coral);font-family:var(--mono);font-size:10px;padding:6px 14px;display:none;align-items:center;gap:10px;flex-shrink:0}
.offline-banner.show{display:flex}
.offline-banner code{background:rgba(0,0,0,.3);padding:1px 5px;border-radius:3px;color:var(--sky2)}
.offline-banner button{margin-left:auto;font-family:var(--mono);font-size:9px;padding:3px 9px;border-radius:3px;border:1px solid rgba(248,113,113,.3);background:none;color:var(--coral);cursor:pointer}

/* ════════════════════════════════════════════════════
   BRAINSTORM
   ════════════════════════════════════════════════════ */
.brain-wrap{flex:1;display:flex;flex-direction:column;overflow:hidden}
.brain-input-row{padding:14px;border-bottom:1px solid var(--b0);display:flex;flex-direction:column;gap:8px;flex-shrink:0}
.brain-textarea{width:100%;min-height:70px;background:var(--bg2);border:1px solid var(--b1);border-radius:6px;padding:10px 12px;font-family:var(--sans);font-size:13px;color:var(--text);outline:none;resize:vertical}
.brain-textarea:focus{border-color:var(--b2)}
.brain-row-actions{display:flex;gap:8px;align-items:center}
.brain-tags-input{flex:1;background:var(--bg2);border:1px solid var(--b1);border-radius:4px;padding:6px 10px;font-family:var(--mono);font-size:10px;color:var(--text);outline:none}
.brain-grid{flex:1;overflow-y:auto;padding:14px;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;align-content:start}
.brain-card{background:var(--bg2);border:1px solid var(--b0);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:8px}
.brain-card-text{font-size:12px;color:var(--text);line-height:1.55}
.brain-card-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:auto}
.brain-ts{font-family:var(--mono);font-size:9px;color:var(--text3)}

/* ════════════════════════════════════════════════════
   SPEC LIBRARY / BUILDER / COMPILER
   ════════════════════════════════════════════════════ */
.spec-toolbar{height:36px;border-bottom:1px solid var(--b0);display:flex;align-items:center;padding:0 10px;gap:8px;flex-shrink:0}
.spec-list{flex:1;overflow-y:auto;padding:8px}
.spec-card{background:var(--bg2);border:1px solid var(--b0);border-radius:6px;padding:10px 12px;margin-bottom:6px;cursor:pointer;transition:all .15s}
.spec-card:hover{border-color:var(--b1)}
.spec-card.selected{border-color:var(--b2);background:rgba(56,189,248,.04)}
.spec-card-top{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.spec-name{font-size:12px;font-weight:500;flex:1}
.confidence-ring{width:30px;height:30px;flex-shrink:0}
.section-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:8px}
.section-chip{font-family:var(--mono);font-size:8px;padding:4px 5px;border-radius:3px;border:1px solid var(--b0);text-align:center;color:var(--text3);background:var(--bg3)}
.section-chip.done{border-color:rgba(52,211,153,.3);color:var(--mint);background:rgba(52,211,153,.06)}
.section-chip.missing{border-color:var(--b1);color:var(--text3)}
.spec-builder{flex:1;display:flex;flex-direction:column;overflow:hidden}
.builder-section-tabs{display:flex;gap:4px;padding:8px 10px;border-bottom:1px solid var(--b0);flex-wrap:wrap;flex-shrink:0}
.sec-tab{font-family:var(--mono);font-size:9px;padding:4px 8px;border-radius:3px;border:1px solid var(--b1);background:none;color:var(--text3);cursor:pointer}
.sec-tab.active{color:var(--sky);border-color:var(--b2);background:rgba(56,189,248,.06)}
.sec-tab.filled{color:var(--mint)}
.builder-body{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
.builder-textarea{width:100%;min-height:220px;background:var(--bg2);border:1px solid var(--b1);border-radius:6px;padding:12px;font-family:var(--mono);font-size:11px;color:var(--text);outline:none;resize:vertical;line-height:1.6}

/* ════════════════════════════════════════════════════
   ARCHITECT — blueprint tree
   ════════════════════════════════════════════════════ */
.architect-wrap{flex:1;overflow:auto;padding:20px}
.blueprint-tree{display:flex;flex-direction:column;gap:0}
.bp-node{display:flex;align-items:flex-start;gap:10px;position:relative;padding:6px 0 6px 20px}
.bp-node::before{content:'';position:absolute;left:4px;top:0;bottom:0;width:1px;background:var(--b1)}
.bp-dot{width:8px;height:8px;border-radius:50%;background:var(--sky);flex-shrink:0;margin-top:5px;box-shadow:0 0 8px rgba(56,189,248,.5);position:relative;z-index:1}
.bp-dot.gray{background:var(--text3);box-shadow:none}
.bp-label{font-family:var(--mono);font-size:11px;color:var(--text)}
.bp-meta{font-family:var(--mono);font-size:9px;color:var(--text3);margin-left:8px}
.bp-children{margin-left:18px}

/* ════════════════════════════════════════════════════
   REPO / FILE BROWSER / IDE
   ════════════════════════════════════════════════════ */
.repo-wrap{flex:1;display:grid;grid-template-columns:260px 1fr;overflow:hidden}
.file-tree{overflow-y:auto;padding:6px;border-right:1px solid var(--b0)}
.tree-node{font-family:var(--mono);font-size:11px;color:var(--text2);padding:3px 8px;border-radius:4px;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:6px}
.tree-node:hover{background:var(--b0);color:var(--text)}
.tree-node.dir{color:var(--sky2);font-weight:500}
.tree-node.file.active{background:rgba(56,189,248,.1);color:var(--sky)}
.tree-indent{display:inline-block}
.ide-pane{display:flex;flex-direction:column;overflow:hidden}
.ide-tabs{height:30px;border-bottom:1px solid var(--b0);display:flex;align-items:center;padding:0 10px;gap:8px;flex-shrink:0;font-family:var(--mono);font-size:10px;color:var(--text2)}
.ide-code{flex:1;overflow:auto;padding:14px;font-family:var(--mono);font-size:11.5px;line-height:1.65;color:var(--text);white-space:pre;background:rgba(5,7,11,.4)}
.ide-code .ln{color:var(--text3);display:inline-block;width:34px;text-align:right;margin-right:14px;user-select:none}
.ide-editor{flex:1;overflow:auto;padding:14px;font-family:var(--mono);font-size:11.5px;line-height:1.65;color:var(--text);background:rgba(5,7,11,.4);border:none;outline:none;resize:none;white-space:pre;tab-size:2}
.ide-editor:focus{background:rgba(5,7,11,.6)}
.ide-tab-btn{background:var(--bg3,#1a1f2b);border:1px solid var(--b1,#2a2f3b);border-radius:4px;color:var(--text2);font-family:var(--mono);font-size:10px;padding:2px 8px;cursor:pointer;margin-left:auto}
.ide-tab-btn:hover{border-color:var(--accent,#5af);color:var(--text)}
.ide-tab-btn.danger:hover{border-color:var(--red,#e25);color:var(--red,#e25)}
.ide-tab-dirty{color:var(--amber,#e8a233);font-size:9px;margin-left:4px}
.repo-empty{display:flex;align-items:center;justify-content:center;height:100%;font-family:var(--mono);font-size:11px;color:var(--text3);text-align:center;padding:30px;flex-direction:column;gap:12px}

/* ════════════════════════════════════════════════════
   VERSIONIUM
   ════════════════════════════════════════════════════ */
.versionium-wrap{flex:1;display:grid;grid-template-columns:1fr 360px;overflow:hidden}

/* ── PROJECTS ── */
.projects-wrap{flex:1;display:flex;flex-direction:column;overflow:hidden;padding:16px;gap:12px}
.project-drop{border:1.5px dashed var(--b2);border-radius:12px;padding:24px;text-align:center;color:var(--text2);font-family:var(--mono);font-size:12px;cursor:pointer;transition:all .15s;flex-shrink:0}
.project-drop:hover,.project-drop.drag{border-color:var(--sky);background:var(--b0);color:var(--text)}
.project-drop .pd-big{font-size:20px;margin-bottom:6px;display:block}
.project-toolbar{display:flex;gap:8px;align-items:center;flex-shrink:0}
.project-toolbar input{flex:1;background:var(--bg2);border:1px solid var(--b1);color:var(--text);border-radius:7px;padding:8px 10px;font-family:var(--mono);font-size:12px}
.project-list{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:6px}
.project-card{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg2);border:1px solid var(--b1);border-radius:8px;font-family:var(--mono);font-size:12px}
.project-card .pc-icon{font-size:16px;opacity:.8;flex-shrink:0}
.project-card .pc-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text)}
.project-card .pc-meta{color:var(--text3);font-size:10.5px;white-space:nowrap;flex-shrink:0}
.project-card button{background:none;border:1px solid var(--b1);color:var(--text2);border-radius:6px;padding:5px 9px;cursor:pointer;font-family:var(--mono);font-size:11px;flex-shrink:0}
.project-card button:hover{color:var(--text);border-color:var(--b2)}
.project-card button.danger:hover{color:var(--rose);border-color:var(--rose)}
.commit-list{overflow-y:auto;padding:10px}
.commit-card{background:var(--bg2);border:1px solid var(--b0);border-radius:6px;padding:10px 12px;margin-bottom:8px;position:relative;padding-left:24px;cursor:pointer}
.commit-card:hover{border-color:var(--b1)}
.commit-card::before{content:'◆';position:absolute;left:8px;top:12px;color:var(--sky);font-size:9px}
.commit-card::after{content:'';position:absolute;left:11px;top:24px;bottom:-8px;width:1px;background:var(--b1)}
.commit-card:last-child::after{display:none}
.commit-id{font-family:var(--mono);font-size:10px;color:var(--sky2)}
.commit-msg{font-size:12px;color:var(--text);margin:4px 0}
.commit-stats{font-family:var(--mono);font-size:9px;color:var(--text3);display:flex;gap:10px;flex-wrap:wrap}

/* ── Spec Build Wizard (scoped, imported) ── */
#view-spec-wizard *{box-sizing:border-box;margin:0;padding:0}#view-spec-wizard{
    --bg:#0d0d10;--bg2:#16161c;--bg3:#1e1e27;--bg4:#26263200;
    --border:#2e2e3a;--border2:#3a3a4a;
    --text:#e8e8f0;--text2:#9090a8;--text3:#5a5a70;
    --accent:#7c6af7;--accent2:#5d4de0;--accent-glow:rgba(124,106,247,0.15);
    --green:#3dba7a;--amber:#e8a233;--red:#e25555;--blue:#4a9eed;
    --radius:8px;--radius2:12px;
    font-family:'SF Mono','Cascadia Code','Fira Code',monospace;
  }#view-spec-wizard .app{display:grid;grid-template-columns:260px 1fr 340px;height:100%;overflow:hidden;background:var(--bg);color:var(--text)}#view-spec-wizard /* ── SIDEBAR ── */
  .sidebar{background:var(--bg2);border-right:1px solid var(--border);overflow-y:auto;padding:1rem 0}#view-spec-wizard .sidebar-header{padding:0 1rem 1rem;border-bottom:1px solid var(--border);margin-bottom:0.5rem}#view-spec-wizard .sidebar-header h1{font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--text3);font-weight:600}#view-spec-wizard .sidebar-header p{font-size:13px;color:var(--text);margin-top:4px;font-weight:500}#view-spec-wizard .section-nav{list-style:none;padding:0.25rem 0}#view-spec-wizard .section-nav li{}#view-spec-wizard .nav-item{display:flex;align-items:center;gap:8px;padding:6px 1rem;cursor:pointer;font-size:12px;color:var(--text2);border-left:2px solid transparent;transition:all 0.15s}#view-spec-wizard .nav-item:hover{color:var(--text);background:var(--bg3)}#view-spec-wizard .nav-item.active{color:var(--accent);border-left-color:var(--accent);background:var(--accent-glow)}#view-spec-wizard .nav-item.complete{color:var(--green)}#view-spec-wizard .nav-item.complete .dot{background:var(--green)}#view-spec-wizard .nav-item.active .dot{background:var(--accent)}#view-spec-wizard .dot{width:6px;height:6px;border-radius:50%;background:var(--border2);flex-shrink:0}#view-spec-wizard .nav-group{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);padding:8px 1rem 4px;font-weight:600}#view-spec-wizard /* ── MAIN ── */
  .main{overflow-y:auto;padding:2rem}#view-spec-wizard .section-block{display:none}#view-spec-wizard .section-block.visible{display:block}#view-spec-wizard .section-title{font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--accent);font-weight:600;margin-bottom:1.5rem}#view-spec-wizard .field-group{margin-bottom:1.25rem}#view-spec-wizard .field-label{font-size:12px;color:var(--text2);margin-bottom:5px;display:flex;align-items:center;gap:6px}#view-spec-wizard .field-label .req{color:var(--red);font-size:10px}#view-spec-wizard .field-label .hint{color:var(--text3);font-size:11px;font-style:italic}#view-spec-wizard input[type=text], #view-spec-wizard input[type=number], #view-spec-wizard select, #view-spec-wizard textarea{
    width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);
    color:var(--text);font-family:inherit;font-size:13px;padding:7px 10px;outline:none;
    transition:border-color 0.15s;
  }#view-spec-wizard input[type=text]:focus, #view-spec-wizard input[type=number]:focus, #view-spec-wizard select:focus, #view-spec-wizard textarea:focus{border-color:var(--accent)}#view-spec-wizard textarea{resize:vertical;min-height:80px;line-height:1.5}#view-spec-wizard select option{background:var(--bg2)}#view-spec-wizard .checkbox-group{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}#view-spec-wizard .checkbox-item{display:flex;align-items:center;gap:6px;background:var(--bg3);border:1px solid var(--border);
    border-radius:var(--radius);padding:5px 10px;cursor:pointer;font-size:12px;color:var(--text2);transition:all 0.15s}#view-spec-wizard .checkbox-item:hover{border-color:var(--accent);color:var(--text)}#view-spec-wizard .checkbox-item.checked{border-color:var(--accent);background:var(--accent-glow);color:var(--accent)}#view-spec-wizard .checkbox-item input{display:none}#view-spec-wizard .list-editor{border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}#view-spec-wizard .list-item{display:flex;align-items:stretch;border-bottom:1px solid var(--border)}#view-spec-wizard .list-item:last-child{border-bottom:none}#view-spec-wizard .list-item input, #view-spec-wizard .list-item textarea{border:none;border-radius:0;flex:1;background:transparent;padding:6px 10px;font-size:12px}#view-spec-wizard .list-item-num{display:flex;align-items:center;padding:0 8px;font-size:11px;color:var(--text3);background:var(--bg2);border-right:1px solid var(--border);min-width:30px;justify-content:center}#view-spec-wizard .list-item-del{display:flex;align-items:center;padding:0 8px;cursor:pointer;color:var(--text3);border-left:1px solid var(--border);font-size:16px;background:var(--bg2)}#view-spec-wizard .list-item-del:hover{color:var(--red)}#view-spec-wizard .add-btn{display:flex;align-items:center;gap:6px;background:none;border:none;color:var(--accent);font-size:12px;font-family:inherit;cursor:pointer;padding:6px 10px;width:100%;border-top:1px solid var(--border)}#view-spec-wizard .add-btn:hover{background:var(--accent-glow)}#view-spec-wizard .module-card{background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius2);margin-bottom:1rem;overflow:hidden}#view-spec-wizard .module-card-header{display:flex;align-items:center;gap:8px;padding:10px 12px;cursor:pointer;border-bottom:1px solid var(--border)}#view-spec-wizard .module-card-header:hover{background:rgba(255,255,255,0.02)}#view-spec-wizard .module-card-toggle{color:var(--text3);transition:transform 0.2s;font-size:14px}#view-spec-wizard .module-card.open .module-card-toggle{transform:rotate(90deg)}#view-spec-wizard .module-id-badge{font-size:10px;background:var(--accent-glow);color:var(--accent);padding:2px 8px;border-radius:4px;border:1px solid var(--accent)}#view-spec-wizard .module-name-label{font-size:13px;color:var(--text);flex:1}#view-spec-wizard .module-card-del{color:var(--text3);cursor:pointer;font-size:14px;padding:4px}#view-spec-wizard .module-card-del:hover{color:var(--red)}#view-spec-wizard .module-card-body{padding:12px;display:none}#view-spec-wizard .module-card.open .module-card-body{display:block}#view-spec-wizard .module-field{margin-bottom:1rem}#view-spec-wizard .module-field-label{font-size:11px;color:var(--text3);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.08em}#view-spec-wizard .event-group{background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:0.75rem;overflow:hidden}#view-spec-wizard .event-group-header{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border)}#view-spec-wizard .event-namespace{font-size:12px;color:var(--amber);flex:1}#view-spec-wizard .event-entries{padding:6px 12px}#view-spec-wizard .event-row{display:flex;align-items:center;gap:6px;padding:3px 0}#view-spec-wizard .event-row input{flex:1;background:transparent;border:none;border-bottom:1px solid var(--border);border-radius:0;font-size:12px;color:var(--text)}#view-spec-wizard .event-row input:focus{border-bottom-color:var(--accent);background:transparent;border-radius:0}#view-spec-wizard .event-del{color:var(--text3);cursor:pointer;font-size:12px}#view-spec-wizard .event-del:hover{color:var(--red)}#view-spec-wizard .constraint-row{display:grid;grid-template-columns:80px 1fr auto;gap:8px;margin-bottom:6px;align-items:start}#view-spec-wizard .type-badge{font-size:11px;padding:4px 8px;border-radius:4px;text-align:center;cursor:pointer;border:1px solid transparent}#view-spec-wizard .type-badge.hard{background:rgba(226,85,85,0.15);color:var(--red);border-color:var(--red)}#view-spec-wizard .type-badge.soft{background:rgba(74,158,237,0.15);color:var(--blue);border-color:var(--blue)}#view-spec-wizard .type-badge.warning{background:rgba(232,162,51,0.15);color:var(--amber);border-color:var(--amber)}#view-spec-wizard .gate-row{margin-bottom:6px}#view-spec-wizard .gate-row input{font-size:12px;font-family:inherit;color:var(--green)}#view-spec-wizard .schema-card{background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:0.75rem;overflow:hidden}#view-spec-wizard .schema-header{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border)}#view-spec-wizard .schema-id{font-size:12px;color:var(--blue);font-weight:600;flex:1}#view-spec-wizard .schema-body{padding:8px 12px}#view-spec-wizard .field-row{display:flex;align-items:center;gap:6px;padding:3px 0}#view-spec-wizard .field-row input:first-child{width:140px;flex:none;color:var(--text);font-size:12px}#view-spec-wizard .field-row input:last-child{flex:1;color:var(--text2);font-size:12px}#view-spec-wizard .nav-btns{display:flex;gap:8px;margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--border)}#view-spec-wizard .btn{padding:7px 16px;border-radius:var(--radius);font-family:inherit;font-size:13px;cursor:pointer;border:1px solid;transition:all 0.15s}#view-spec-wizard .btn-primary{background:var(--accent);border-color:var(--accent2);color:#fff}#view-spec-wizard .btn-primary:hover{background:var(--accent2)}#view-spec-wizard .btn-secondary{background:var(--bg3);border-color:var(--border2);color:var(--text2)}#view-spec-wizard .btn-secondary:hover{border-color:var(--accent);color:var(--text)}#view-spec-wizard .btn-danger{background:rgba(226,85,85,0.1);border-color:var(--red);color:var(--red)}#view-spec-wizard .btn-danger:hover{background:var(--red);color:#fff}#view-spec-wizard /* ── OUTPUT ── */
  .output-pane{background:var(--bg2);border-left:1px solid var(--border);overflow-y:auto;display:flex;flex-direction:column}#view-spec-wizard .output-header{display:flex;align-items:center;gap:8px;padding:12px 1rem;border-bottom:1px solid var(--border);flex-shrink:0}#view-spec-wizard .output-header h2{font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);flex:1}#view-spec-wizard .output-controls{display:flex;gap:6px}#view-spec-wizard .output-btn{background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text2);font-family:inherit;font-size:11px;padding:4px 10px;cursor:pointer}#view-spec-wizard .output-btn:hover{border-color:var(--accent);color:var(--text)}#view-spec-wizard .output-body{flex:1;overflow:auto}#view-spec-wizard pre{font-family:inherit;font-size:11.5px;line-height:1.7;padding:1rem;color:var(--text);white-space:pre;overflow-x:auto}#view-spec-wizard .spec-key{color:#7c6af7}#view-spec-wizard .spec-string{color:#a8d8a8}#view-spec-wizard .spec-number{color:#f0c27a}#view-spec-wizard .spec-comment{color:#4a4a60}#view-spec-wizard .spec-event{color:#4a9eed}#view-spec-wizard .spec-gate{color:#3dba7a}#view-spec-wizard .spec-dash{color:#9090a8}#view-spec-wizard .stats-bar{display:flex;gap:12px;padding:8px 1rem;border-bottom:1px solid var(--border);flex-shrink:0}#view-spec-wizard .stat{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text3)}#view-spec-wizard .stat-val{color:var(--text);font-weight:600}#view-spec-wizard .stat-dot{width:6px;height:6px;border-radius:50%}#view-spec-wizard .dep-row{display:grid;grid-template-columns:1fr 100px 80px auto;gap:6px;margin-bottom:6px;align-items:center}#view-spec-wizard .axiom-list textarea{min-height:60px;font-size:12px;line-height:1.6}#view-spec-wizard .empty-modules{display:flex;flex-direction:column;align-items:center;padding:2rem;color:var(--text3);text-align:center;gap:8px;border:1px dashed var(--border);border-radius:var(--radius2)}#view-spec-wizard .empty-modules p{font-size:12px}#view-spec-wizard .progress-bar{height:2px;background:var(--border);margin-top:1px}#view-spec-wizard .progress-fill{height:100%;background:var(--accent);transition:width 0.3s}#view-spec-wizard .spec-depth-indicator{display:flex;align-items:center;gap:6px;margin-top:6px}#view-spec-wizard .depth-bar{flex:1;height:4px;background:var(--border);border-radius:2px;overflow:hidden}#view-spec-wizard .depth-fill{height:100%;border-radius:2px;transition:width 0.3s}#view-spec-wizard .depth-label{font-size:10px;color:var(--text3);min-width:32px;text-align:right}#view-spec-wizard .tag-input{display:flex;flex-wrap:wrap;gap:5px;padding:5px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);min-height:38px;cursor:text}#view-spec-wizard .tag{display:inline-flex;align-items:center;gap:4px;background:var(--accent-glow);border:1px solid var(--accent);color:var(--accent);font-size:11px;padding:2px 8px;border-radius:4px}#view-spec-wizard .tag-x{cursor:pointer;color:var(--text3)}#view-spec-wizard .tag-x:hover{color:var(--red)}#view-spec-wizard .tag-input-field{background:transparent;border:none;color:var(--text);font-family:inherit;font-size:12px;outline:none;min-width:80px}

</style>
</head>
<body>

<div id="starfield">
  <div class="swirl-layer swirl-a"></div>
  <div class="swirl-layer swirl-b"></div>
  <div class="swirl-layer swirl-c"></div>
  <div class="shoot"></div>
  <canvas id="star-canvas"></canvas>
</div>

<!-- TOPBAR -->
<div class="topbar">
  <div class="logo" onclick="setView('welcome')">IDEA<span>RIUM</span></div>
  <div class="tb-sep"></div>
  <div class="tb-stat">ideas <span class="v sky" id="stat-ideas">—</span></div>
  <div class="tb-stat">open gaps <span class="v hi" id="stat-gaps">—</span></div>
  <div class="tb-stat">specs <span class="v" id="stat-specs">—</span></div>
  <div class="tb-stat">snr <span class="v ok" id="stat-snr">—</span></div>
  <div class="tb-right">
    <div class="tb-conn offline" id="conn-indicator" onclick="nexusConnect(true)"><span class="dot"></span><span id="conn-label">connecting…</span></div>
  </div>
</div>

<!-- OFFLINE BANNER -->
<div class="offline-banner" id="offline-banner">
  <span>NEXUS unreachable — start the Idearium service: <code>node service/idearium-service.js</code> (port 4800), or via orchestrator on :9000.</span>
  <button onclick="nexusConnect(true)">retry</button>
</div>

<!-- APP SHELL -->
<div class="app-shell">
  <nav class="tabbar" id="tabbar">
    <button class="tab-btn active" data-view="welcome" onclick="setView('welcome')"><span class="tab-icon">⌂</span>Welcome</button>

    <div class="tab-group" data-group="create">
      <button class="tab-btn tab-group-btn" data-views="brainstorm,ideas" onclick="toggleTabGroup(event,this)"><span class="tab-icon">✎</span>Create<span class="tab-caret">▾</span></button>
      <div class="tab-dropdown">
        <button class="tab-sub" data-view="brainstorm" onclick="setView('brainstorm')"><span class="tab-icon">✎</span>Brainstorm</button>
        <button class="tab-sub" data-view="ideas" onclick="setView('ideas')"><span class="tab-icon">◇</span>Ideas</button>
      </div>
    </div>

    <div class="tab-group" data-group="build">
      <button class="tab-btn tab-group-btn" data-views="spec,architect" onclick="toggleTabGroup(event,this)"><span class="tab-icon">▦</span>Build<span class="tab-caret">▾</span></button>
      <div class="tab-dropdown">
        <button class="tab-sub" data-view="spec" onclick="setView('spec')"><span class="tab-icon">▦</span>Spec Library</button>
        <button class="tab-sub" data-view="architect" onclick="setView('architect')"><span class="tab-icon">⌘</span>Architect</button>
      </div>
    </div>

    <button class="tab-btn" data-view="projects" onclick="setView('projects')"><span class="tab-icon">🗂</span>Projects<span class="tab-badge" id="proj-count-badge"></span></button>
    <button class="tab-btn" data-view="versionium" onclick="setView('versionium')"><span class="tab-icon">◆</span>Versionium</button>

    <div class="tab-spacer"></div>
  </nav>

  <main class="view-area">

    <!-- ══════════ WELCOME ══════════ -->
    <section class="view active" id="view-welcome">
      <div class="welcome">
        <div class="welcome-mark">NEXUS · IDEA OS · LAYER 9</div>
        <div class="welcome-title">IDEA<span>RIUM</span></div>
        <div class="welcome-sub">Log ideas, brainstorm, visit repository or idea, spec and library builder, then architect.</div>
        <div class="pillars">
          <div class="pillar flow" onclick="setView('brainstorm')">
            <div class="pillar-step">01 · CAPTURE</div>
            <div class="pillar-icon">✎</div>
            <div class="pillar-name">Brainstorm</div>
            <div class="pillar-desc">Freeform, tagged, timestamped capture. No structure required yet — just get it down.</div>
          </div>
          <div class="pillar flow" onclick="openModal()">
            <div class="pillar-step">02 · LOG</div>
            <div class="pillar-icon">◇</div>
            <div class="pillar-name">Log an Idea</div>
            <div class="pillar-desc">Promote a thought into a tracked node with phase, tension, and causal ancestry.</div>
          </div>
          <div class="pillar" onclick="setView('ideas')">
            <div class="pillar-step">03 · VISIT</div>
            <div class="pillar-icon">⌥</div>
            <div class="pillar-name">Ideas → Repository</div>
            <div class="pillar-desc">Open an idea or spec and click "open repository" to see its linked repo — repos aren't a separate destination anymore.</div>
          </div>
          <div class="pillar flow" onclick="openSpecChoice()">
            <div class="pillar-step">04 · SPEC</div>
            <div class="pillar-icon">▦</div>
            <div class="pillar-name">Spec &amp; Library Builder</div>
            <div class="pillar-desc">SEAM-chunked sections, compiled with confidence scoring and gap analysis.</div>
          </div>
          <div class="pillar" onclick="setView('architect')">
            <div class="pillar-step">05 · ARCHITECT</div>
            <div class="pillar-icon">⌘</div>
            <div class="pillar-name">Architect</div>
            <div class="pillar-desc">Compiled specs become a blueprint — the structure the system is actually built from.</div>
          </div>
          <div class="pillar" onclick="setView('versionium')">
            <div class="pillar-step">— VERSIONIUM</div>
            <div class="pillar-icon">◆</div>
            <div class="pillar-name">Full Snapshot System</div>
            <div class="pillar-desc">Every commit captures tension + phase across all ideas. Diff and restore any moment.</div>
          </div>
          <div class="pillar" onclick="setView('projects')">
            <div class="pillar-step">— PROJECTS</div>
            <div class="pillar-icon">🗂</div>
            <div class="pillar-name">Project Shelf</div>
            <div class="pillar-desc">Drop whole zip archives here — build outputs, snapshots, anything you want kept and findable, separate from the idea/spec system.</div>
          </div>
        </div>
        <div class="welcome-foot" id="welcome-foot">awaiting connection to nexus idearium service · :4800</div>
      </div>
    </section>

    <!-- ══════════ BRAINSTORM ══════════ -->
    <section class="view" id="view-brainstorm">
      <div class="ph"><span class="ph-title">Brainstorm</span><span class="ph-badge" id="brain-count-badge">0 entries</span></div>
      <div class="brain-wrap">
        <div class="brain-input-row">
          <textarea class="brain-textarea" id="brain-text" placeholder="type a raw thought... no structure needed yet"></textarea>
          <div class="brain-row-actions">
            <input class="brain-tags-input" id="brain-tags" placeholder="tags, comma, separated">
            <button class="modal-btn confirm" onclick="addBrainstorm()">+ capture</button>
          </div>
        </div>
        <div class="brain-grid" id="brain-grid"></div>
      </div>
    </section>

    <!-- ══════════ IDEAS ══════════ -->
    <section class="view" id="view-ideas">
      <div class="ph">
        <span class="ph-title">Ideas</span>
        <button class="tb-btn" style="margin-left:10px" onclick="openModal()">+ idea</button>
        <span class="ph-badge live" id="list-badge" style="margin-left:auto">by tension</span>
      </div>
      <div class="body2">
        <div class="left">
          <div class="toolbar">
            <input class="search-input" id="search" placeholder="search ideas..." oninput="renderIdeaList()">
            <button class="mode-btn active" onclick="sortBy('tension',this)">tension ↓</button>
            <button class="mode-btn" onclick="sortBy('updated',this)">recent</button>
            <button class="mode-btn" onclick="sortBy('name',this)">a-z</button>
          </div>
          <div class="idea-list" id="idea-list"></div>
          <div class="snap-bar">
            <span style="font-family:var(--mono);font-size:9px;color:var(--text3)">push</span>
            <input class="snap-input" id="snap-msg" placeholder="commit message..." onkeydown="if(event.key==='Enter')doSnapshot()">
            <span class="snap-latest" id="snap-latest"></span>
            <button class="snap-btn" id="snap-btn" onclick="doSnapshot()">snapshot ◆</button>
          </div>
          <div class="gap-log">
            <div class="ph" style="border-top:1px solid var(--b0)"><span class="ph-title">Event Stream</span><span class="ph-badge" id="sse-badge">connecting</span></div>
            <div class="gap-log-inner" id="event-log"></div>
          </div>
        </div>
        <div class="right">
          <div class="ph"><span class="ph-title" id="detail-title">Select an idea</span></div>
          <div class="detail-area" id="detail-area"><div class="detail-empty">← select an idea to inspect</div></div>
        </div>
      </div>
    </section>

    <!-- ══════════ SPEC LIBRARY / BUILDER / COMPILER ══════════ -->
    <section class="view" id="view-spec">
      <div class="ph"><span class="ph-title">Spec Library</span><span class="ph-badge" id="spec-count-badge">0 specs</span></div>
      <div class="body2">
        <div class="left">
          <div class="spec-toolbar">
            <input class="search-input" id="spec-search" placeholder="search specs..." oninput="renderSpecList()">
            <button class="mode-btn" onclick="newSpecPrompt()">+ new spec</button>
            <button class="mode-btn" onclick="openUploadProjectModal()">+ upload project</button>
          </div>
          <div class="spec-list" id="spec-list"></div>
        </div>
        <div class="right" style="grid-column: 1 / -1; display:none"></div>
        <div class="right">
          <div class="ph"><span class="ph-title" id="spec-detail-title">Select a spec</span></div>
          <div class="spec-builder" id="spec-builder">
            <div class="detail-empty">← select or create a spec to open the builder</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════ ARCHITECT ══════════ -->
    <section class="view" id="view-architect">
      <div class="ph"><span class="ph-title">Architect</span><span class="ph-badge">blueprint, derived from compiled specs</span></div>
      <div class="architect-wrap" id="architect-wrap">
        <div class="detail-empty">no specced/built ideas yet — compile a spec in the Library to see its blueprint here</div>
      </div>
    </section>

    <!-- ══════════ REPOSITORY / FILE BROWSER / IDE ══════════ -->
    <section class="view" id="view-repo">
      <div class="ph">
        <span class="ph-title">Repository</span>
        <span class="ph-badge" id="repo-context" style="margin-left:10px"></span>
        <button class="tb-btn" style="margin-left:10px" onclick="pickLocalRepo()">open local nexus folder…</button>
        <button class="tb-btn" style="margin-left:6px" onclick="document.getElementById('repo-drop-input').click()">drop repo files…</button>
        <button class="tb-btn" style="margin-left:6px" onclick="exportApiRepo()">export .zip</button>
        <button class="tb-btn" style="margin-left:6px;color:var(--coral)" onclick="archiveApiRepo()">archive repo</button>
        <input type="file" id="repo-drop-input" multiple style="display:none" onchange="ingestDroppedFiles(this.files)">
        <span class="ph-badge" id="repo-badge" style="margin-left:auto">no folder loaded</span>
      </div>
      <div class="repo-wrap">
        <div class="file-tree" id="file-tree"><div class="repo-empty">no repository loaded<br><br><button class="modal-btn confirm" onclick="pickLocalRepo()">open local nexus folder</button></div></div>
        <div class="ide-pane">
          <div class="ide-tabs" id="ide-tabs">no file open</div>
          <div class="ide-code" id="ide-code">// click a file in the tree to open it here</div>
          <textarea class="ide-editor" id="ide-editor" style="display:none" spellcheck="false"></textarea>
        </div>
      </div>
    </section>

    <!-- ══════════ SPEC BUILD WIZARD ══════════ -->
    <section class="view" id="view-spec-wizard">
      <div class="app">

<!-- ── SIDEBAR ── -->
<nav class="sidebar" id="sidebar">
  <div class="sidebar-header">
    <button onclick="setView('welcome')" style="background:none;border:1px solid var(--border);color:var(--text2);font:inherit;font-size:10px;padding:4px 8px;border-radius:4px;cursor:pointer;margin-bottom:10px">← back</button>
    <h1>spec-compiler</h1>
    <p>Build Wizard</p>
    <div class="progress-bar"><div class="progress-fill" id="progress-fill" style="width:0%"></div></div>
  </div>

  <ul class="section-nav" id="nav">
    <li class="nav-group">Core</li>
    <li><div class="nav-item active" data-sec="meta"><span class="dot"></span>meta</div></li>
    <li><div class="nav-item" data-sec="axioms"><span class="dot"></span>axioms</div></li>
    <li><div class="nav-item" data-sec="deps"><span class="dot"></span>deps</div></li>
    <li><div class="nav-item" data-sec="constraints"><span class="dot"></span>constraints</div></li>
    <li class="nav-group">Modules</li>
    <li><div class="nav-item" data-sec="modules"><span class="dot"></span>modules</div></li>
    <li class="nav-group">Events &amp; Schema</li>
    <li><div class="nav-item" data-sec="events"><span class="dot"></span>events</div></li>
    <li><div class="nav-item" data-sec="schemas"><span class="dot"></span>schemas</div></li>
    <li class="nav-group">Enforcement</li>
    <li><div class="nav-item" data-sec="enforcement"><span class="dot"></span>enforcement gates</div></li>
    <li><div class="nav-item" data-sec="seams"><span class="dot"></span>seams</div></li>
  </ul>
</nav>

<!-- ── MAIN ── -->
<main class="main" id="main">

<!-- META -->
<section class="section-block visible" id="sec-meta">
  <div class="section-title">meta — spec identity</div>

  <div class="field-group">
    <div class="field-label">name <span class="req">*</span></div>
    <input type="text" id="meta-name" placeholder="my-system-name" oninput="refresh()">
  </div>
  <div class="field-group">
    <div class="field-label">version <span class="req">*</span></div>
    <input type="text" id="meta-version" placeholder="1.0.0" oninput="refresh()">
  </div>
  <div class="field-group">
    <div class="field-label">author</div>
    <input type="text" id="meta-author" placeholder="james-brooks" oninput="refresh()">
  </div>
  <div class="field-group">
    <div class="field-label">uuid <span class="hint">— leave blank to auto-generate</span></div>
    <input type="text" id="meta-uuid" placeholder="auto-generated" oninput="refresh()">
  </div>
  <div class="field-group">
    <div class="field-label">status</div>
    <select id="meta-status" onchange="refresh()">
      <option value="active">active</option>
      <option value="bootstrapping">bootstrapping</option>
      <option value="draft">draft</option>
      <option value="deprecated">deprecated</option>
      <option value="archived">archived</option>
    </select>
  </div>
  <div class="field-group">
    <div class="field-label">description</div>
    <textarea id="meta-description" placeholder="Describe the system purpose, key properties, and invariants..." oninput="refresh()"></textarea>
  </div>
  <div class="field-group">
    <div class="field-label">tagline <span class="hint">— one-liner</span></div>
    <input type="text" id="meta-tagline" placeholder="Compress intent. Decompress deterministically." oninput="refresh()">
  </div>
  <div class="field-group">
    <div class="field-label">target runtime</div>
    <div class="checkbox-group" id="meta-runtime">
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-runtime')"><input type="checkbox" value="node">node</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-runtime')"><input type="checkbox" value="browser">browser</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-runtime')"><input type="checkbox" value="deno">deno</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-runtime')"><input type="checkbox" value="bun">bun</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-runtime')"><input type="checkbox" value="worker">worker</label>
    </div>
  </div>
  <div class="field-group">
    <div class="field-label">language stack</div>
    <div class="checkbox-group" id="meta-lang">
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-lang')"><input type="checkbox" value="javascript">javascript</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-lang')"><input type="checkbox" value="typescript">typescript</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-lang')"><input type="checkbox" value="python">python</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-lang')"><input type="checkbox" value="rust">rust</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-lang')"><input type="checkbox" value="go">go</label>
    </div>
  </div>
  <div class="field-group">
    <div class="field-label">paradigm</div>
    <div class="checkbox-group" id="meta-paradigm">
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-paradigm')"><input type="checkbox" value="SISO">SISO</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-paradigm')"><input type="checkbox" value="functional">functional</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-paradigm')"><input type="checkbox" value="deterministic">deterministic</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-paradigm')"><input type="checkbox" value="cortex-first">cortex-first</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-paradigm')"><input type="checkbox" value="event-driven">event-driven</label>
      <label class="checkbox-item" onclick="toggleCheck(this,'meta-paradigm')"><input type="checkbox" value="reactive">reactive</label>
    </div>
  </div>

  <div class="nav-btns">
    <button class="btn btn-primary" onclick="goTo('axioms')">next → axioms</button>
  </div>
</section>

<!-- AXIOMS -->
<section class="section-block" id="sec-axioms">
  <div class="section-title">axioms — invariants the system must never violate</div>
  <p style="font-size:12px;color:var(--text2);margin-bottom:1rem">One axiom per line. Each becomes a bullet in the spec. These drive invariants-engine checks.</p>
  <div id="axioms-list" class="list-editor"></div>
  <button class="add-btn" onclick="addAxiom()">+ add axiom</button>
  <div class="nav-btns">
    <button class="btn btn-secondary" onclick="goTo('meta')">← back</button>
    <button class="btn btn-primary" onclick="goTo('deps')">next → deps</button>
  </div>
</section>

<!-- DEPS -->
<section class="section-block" id="sec-deps">
  <div class="section-title">deps — external dependencies</div>
  <div style="display:grid;grid-template-columns:1fr 110px 90px 70px auto;gap:6px;margin-bottom:6px;font-size:10px;color:var(--text3);padding:0 4px;text-transform:uppercase;letter-spacing:0.08em">
    <span>name</span><span>version</span><span>purpose</span><span>required</span><span></span>
  </div>
  <div id="deps-list"></div>
  <button class="add-btn" onclick="addDep()">+ add dependency</button>
  <div class="nav-btns">
    <button class="btn btn-secondary" onclick="goTo('axioms')">← back</button>
    <button class="btn btn-primary" onclick="goTo('constraints')">next → constraints</button>
  </div>
</section>

<!-- CONSTRAINTS -->
<section class="section-block" id="sec-constraints">
  <div class="section-title">constraints — hard rules enforced by gates</div>
  <div id="constraints-list"></div>
  <button class="add-btn" onclick="addConstraint()">+ add constraint</button>
  <div class="nav-btns">
    <button class="btn btn-secondary" onclick="goTo('deps')">← back</button>
    <button class="btn btn-primary" onclick="goTo('modules')">next → modules</button>
  </div>
</section>

<!-- MODULES -->
<section class="section-block" id="sec-modules">
  <div class="section-title">modules — system components</div>
  <p style="font-size:12px;color:var(--text2);margin-bottom:1rem">Each module becomes a KGNode. specDepth is computed from which fields are present.</p>
  <div id="modules-list"></div>
  <button class="btn btn-primary" onclick="addModule()" style="width:100%;margin-top:8px">+ add module</button>
  <div class="nav-btns">
    <button class="btn btn-secondary" onclick="goTo('constraints')">← back</button>
    <button class="btn btn-primary" onclick="goTo('events')">next → events</button>
  </div>
</section>

<!-- EVENTS -->
<section class="section-block" id="sec-events">
  <div class="section-title">events — the only communication channel between modules</div>
  <p style="font-size:12px;color:var(--text2);margin-bottom:1rem">Group events by namespace. Each entry: <code style="color:var(--green);font-size:11px">event.name &#123; field1, field2 &#125;</code></p>
  <div id="events-list"></div>
  <button class="add-btn" onclick="addEventGroup()">+ add event namespace</button>
  <div class="nav-btns">
    <button class="btn btn-secondary" onclick="goTo('modules')">← back</button>
    <button class="btn btn-primary" onclick="goTo('schemas')">next → schemas</button>
  </div>
</section>

<!-- SCHEMAS -->
<section class="section-block" id="sec-schemas">
  <div class="section-title">schemas — typed data structures</div>
  <div id="schemas-list"></div>
  <button class="add-btn" onclick="addSchema()">+ add schema</button>
  <div class="nav-btns">
    <button class="btn btn-secondary" onclick="goTo('events')">← back</button>
    <button class="btn btn-primary" onclick="goTo('enforcement')">next → enforcement</button>
  </div>
</section>

<!-- ENFORCEMENT -->
<section class="section-block" id="sec-enforcement">
  <div class="section-title">enforcement — gate definitions</div>
  <p style="font-size:12px;color:var(--text2);margin-bottom:1rem">Declarative rules for the invariants engine. GATE-XXX-NNN format IDs recommended.</p>
  <div id="enforcement-list"></div>
  <button class="add-btn" onclick="addGate()">+ add gate</button>
  <div class="nav-btns">
    <button class="btn btn-secondary" onclick="goTo('schemas')">← back</button>
    <button class="btn btn-primary" onclick="goTo('seams')">next → seams</button>
  </div>
</section>

<!-- SEAMS -->
<section class="section-block" id="sec-seams">
  <div class="section-title">seams — cross-module contracts</div>
  <p style="font-size:12px;color:var(--text2);margin-bottom:1rem">Seams define the interface boundary between modules. They become seam_records in Cortex.</p>
  <div id="seams-list"></div>
  <button class="add-btn" onclick="addSeam()">+ add seam</button>
  <div class="nav-btns">
    <button class="btn btn-secondary" onclick="goTo('enforcement')">← back</button>
    <button class="btn btn-primary" onclick="copyOutput()" style="background:var(--green);border-color:var(--green)">⬇ copy .spec output</button>
  </div>
</section>

</main>

<!-- ── OUTPUT PANE ── -->
<aside class="output-pane">
  <div class="output-header">
    <h2>live .spec output</h2>
    <div class="output-controls">
      <button class="output-btn" onclick="saveToIdearium()">save to idearium</button>
      <button class="output-btn" onclick="copyOutput()">copy</button>
      <button class="output-btn" onclick="downloadSpec()">download</button>
    </div>
  </div>
  <div class="stats-bar" id="stats-bar">
    <div class="stat"><div class="stat-dot" style="background:var(--accent)"></div><span>specDepth </span><span class="stat-val" id="stat-depth">0.0</span></div>
    <div class="stat"><div class="stat-dot" style="background:var(--green)"></div><span>modules </span><span class="stat-val" id="stat-mods">0</span></div>
    <div class="stat"><div class="stat-dot" style="background:var(--blue)"></div><span>events </span><span class="stat-val" id="stat-evts">0</span></div>
    <div class="stat"><div class="stat-dot" style="background:var(--amber)"></div><span>gaps </span><span class="stat-val" id="sw-stat-gaps">0</span></div>
  </div>
  <div class="output-body">
    <pre id="output-pre"><span class="spec-comment"># spec-compiler wizard output
# fill in the fields on the left to build your .spec</span>
</pre>
  </div>
</aside>

</div>

<script>
const S = {
  meta:{ name:'',version:'1.0.0',author:'',uuid:'',status:'active',description:'',tagline:'',runtime:[],lang:[],paradigm:[] },
  axioms:[],
  deps:[],
  constraints:[],
  modules:[],
  events:[],  // [{namespace, entries:[]}]
  schemas:[], // [{id, fields:[{name,type}]}]
  gates:[],   // enforcement gates
  seams:[],
};

let moduleCounter=0, depCounter=0, constraintCounter=0, gateCounter=0, schemaCounter=0, seamCounter=0, eventCounter=0;

// ── Section routing ──
function goTo(sec){
  document.querySelectorAll('.section-block').forEach(b=>b.classList.remove('visible'));
  document.getElementById('sec-'+sec).classList.add('visible');
  document.querySelectorAll('.nav-item').forEach(n=>{
    n.classList.remove('active');
    if(n.dataset.sec===sec) n.classList.add('active');
  });
  document.querySelector('.main').scrollTop=0;
  updateProgress();
}
document.querySelectorAll('.nav-item').forEach(n=>n.addEventListener('click',()=>goTo(n.dataset.sec)));

// ── Checkboxes ──
function toggleCheck(el,group){
  el.classList.toggle('checked');
  const val = el.querySelector('input').value;
  if(group==='meta-runtime'){
    if(el.classList.contains('checked')) S.meta.runtime.push(val);
    else S.meta.runtime=S.meta.runtime.filter(v=>v!==val);
  } else if(group==='meta-lang'){
    if(el.classList.contains('checked')) S.meta.lang.push(val);
    else S.meta.lang=S.meta.lang.filter(v=>v!==val);
  } else if(group==='meta-paradigm'){
    if(el.classList.contains('checked')) S.meta.paradigm.push(val);
    else S.meta.paradigm=S.meta.paradigm.filter(v=>v!==val);
  }
  refresh();
}

// ── Meta field sync ──
['meta-name','meta-version','meta-author','meta-uuid','meta-description','meta-tagline'].forEach(id=>{
  const key = id.replace('meta-','');
  document.getElementById(id).addEventListener('input',e=>{
    S.meta[key]=e.target.value; refresh();
  });
});
document.getElementById('meta-status').addEventListener('change',e=>{
  S.meta.status=e.target.value; refresh();
});

// ── Axioms ──
function renderAxioms(){
  const list = document.getElementById('axioms-list');
  if(!S.axioms.length){ list.innerHTML=''; return; }
  list.innerHTML = S.axioms.map((a,i)=>`
    <div class="list-item">
      <span class="list-item-num">${i+1}</span>
      <input type="text" value="${esc(a)}" placeholder="Nothing silently fails..." oninput="S.axioms[${i}]=this.value;refresh()">
      <span class="list-item-del" onclick="S.axioms.splice(${i},1);renderAxioms();refresh()">×</span>
    </div>`).join('');
}
function addAxiom(){ S.axioms.push(''); renderAxioms(); refresh(); }
renderAxioms();

// ── Deps ──
function renderDeps(){
  const el = document.getElementById('deps-list');
  el.innerHTML = S.deps.map((d,i)=>`
    <div style="display:grid;grid-template-columns:1fr 110px 90px 70px auto;gap:6px;margin-bottom:6px;align-items:center">
      <input type="text" value="${esc(d.name)}" placeholder="js-yaml" oninput="S.deps[${i}].name=this.value;refresh()">
      <input type="text" value="${esc(d.version)}" placeholder=">=4.1.0" oninput="S.deps[${i}].version=this.value;refresh()">
      <input type="text" value="${esc(d.purpose)}" placeholder="yaml parse" oninput="S.deps[${i}].purpose=this.value;refresh()">
      <select onchange="S.deps[${i}].required=(this.value==='true');refresh()">
        <option value="true" ${d.required?'selected':''}>required</option>
        <option value="false" ${!d.required?'selected':''}>optional</option>
      </select>
      <span class="list-item-del" onclick="S.deps.splice(${i},1);renderDeps();refresh()" style="padding:0 6px;cursor:pointer;color:var(--text3);font-size:16px">×</span>
    </div>`).join('');
}
function addDep(){ S.deps.push({name:'',version:'',purpose:'',required:true}); renderDeps(); refresh(); }

// ── Constraints ──
function renderConstraints(){
  const el = document.getElementById('constraints-list');
  el.innerHTML = S.constraints.map((c,i)=>`
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:10px;margin-bottom:8px">
      <div style="display:grid;grid-template-columns:90px 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:center">
        <input type="text" value="${esc(c.id)}" placeholder="CC-001" oninput="S.constraints[${i}].id=this.value;refresh()" style="font-size:12px;color:var(--amber)">
        <input type="text" value="${esc(c.description)}" placeholder="description..." oninput="S.constraints[${i}].description=this.value;refresh()">
        <input type="text" value="${esc(c.enforced_by)}" placeholder="[GATE-XXX-001]" oninput="S.constraints[${i}].enforced_by=this.value;refresh()">
        <div style="display:flex;gap:4px">
          <span class="type-badge ${c.type}" onclick="cycleConstraintType(${i})">${c.type}</span>
          <span class="list-item-del" onclick="S.constraints.splice(${i},1);renderConstraints();refresh()" style="padding:4px 6px;cursor:pointer;color:var(--text3);font-size:14px">×</span>
        </div>
      </div>
    </div>`).join('');
}
function cycleConstraintType(i){
  const types=['hard','soft','warning'];
  const cur = types.indexOf(S.constraints[i].type);
  S.constraints[i].type = types[(cur+1)%types.length];
  renderConstraints(); refresh();
}
function addConstraint(){
  const n = S.constraints.length+1;
  S.constraints.push({id:`CC-00${n}`,description:'',type:'hard',enforced_by:''});
  renderConstraints(); refresh();
}

// ── Modules ──
function renderModules(){
  const el = document.getElementById('modules-list');
  if(!S.modules.length){
    el.innerHTML='<div class="empty-modules"><p>no modules yet — click + add module to begin</p></div>';
    return;
  }
  el.innerHTML = S.modules.map((m,i)=>`
    <div class="module-card ${m._open?'open':''}" id="mod-${i}">
      <div class="module-card-header" onclick="toggleModule(${i})">
        <span class="module-card-toggle">▶</span>
        <span class="module-id-badge">${m.id||'MOD-?'}</span>
        <span class="module-name-label">${m.name||'unnamed module'}</span>
        <span style="font-size:11px;color:var(--text3)">${specDepth(m).toFixed(1)}</span>
        <span class="module-card-del" onclick="event.stopPropagation();deleteModule(${i})">×</span>
      </div>
      <div class="module-card-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
          <div class="module-field">
            <div class="module-field-label">id</div>
            <input type="text" value="${esc(m.id)}" placeholder="MOD-NAME" oninput="S.modules[${i}].id=this.value;refreshModule(${i})" style="color:var(--amber)">
          </div>
          <div class="module-field">
            <div class="module-field-label">name</div>
            <input type="text" value="${esc(m.name)}" placeholder="module-name" oninput="S.modules[${i}].name=this.value;refreshModule(${i})">
          </div>
        </div>
        <div class="module-field">
          <div class="module-field-label">uuid</div>
          <input type="text" value="${esc(m.uuid)}" placeholder="auto-generated" oninput="S.modules[${i}].uuid=this.value;refreshModule(${i})" style="font-size:11px;color:var(--text3)">
        </div>
        <div class="module-field">
          <div class="module-field-label">description</div>
          <textarea oninput="S.modules[${i}].description=this.value;refreshModule(${i})">${esc(m.description)}</textarea>
        </div>

        <div class="module-field">
          <div class="module-field-label">exports <span style="color:var(--text3);font-size:10px">— one per line: Fn(arg: Type) → ReturnType</span></div>
          <div class="list-editor" id="mod-exports-${i}">
            ${(m.exports||[]).map((e,j)=>`
              <div class="list-item">
                <span class="list-item-num">${j+1}</span>
                <input type="text" value="${esc(e)}" placeholder="fn(arg: Type) → Return" oninput="S.modules[${i}].exports[${j}]=this.value;refreshModule(${i})" style="color:var(--green);font-size:12px">
                <span class="list-item-del" onclick="S.modules[${i}].exports.splice(${j},1);renderModules();refresh()">×</span>
              </div>`).join('')}
          </div>
          <button class="add-btn" onclick="addModuleItem(${i},'exports')">+ export</button>
        </div>

        <div class="module-field">
          <div class="module-field-label">gate_pipeline <span style="color:var(--text3);font-size:10px">— GATE-ID: input → transform → output</span></div>
          <div class="list-editor" id="mod-gates-${i}">
            ${(m.gate_pipeline||[]).map((g,j)=>`
              <div class="list-item">
                <span class="list-item-num">${j+1}</span>
                <input type="text" value="${esc(g)}" placeholder="GATE-XXX-001: event → transform → result" oninput="S.modules[${i}].gate_pipeline[${j}]=this.value;refreshModule(${i})" style="color:var(--blue);font-size:12px">
                <span class="list-item-del" onclick="S.modules[${i}].gate_pipeline.splice(${j},1);renderModules();refresh()">×</span>
              </div>`).join('')}
          </div>
          <button class="add-btn" onclick="addModuleItem(${i},'gate_pipeline')">+ gate</button>
        </div>

        <div class="module-field">
          <div class="module-field-label">behavioral_contracts</div>
          <div class="list-editor" id="mod-contracts-${i}">
            ${(m.behavioral_contracts||[]).map((c,j)=>`
              <div class="list-item">
                <span class="list-item-num">${j+1}</span>
                <input type="text" value="${esc(c)}" placeholder="Contract statement..." oninput="S.modules[${i}].behavioral_contracts[${j}]=this.value;refreshModule(${i})" style="font-size:12px">
                <span class="list-item-del" onclick="S.modules[${i}].behavioral_contracts.splice(${j},1);renderModules();refresh()">×</span>
              </div>`).join('')}
          </div>
          <button class="add-btn" onclick="addModuleItem(${i},'behavioral_contracts')">+ contract</button>
        </div>

        <div class="module-field">
          <div class="module-field-label">error_paths</div>
          <div class="list-editor" id="mod-errors-${i}">
            ${(m.error_paths||[]).map((e,j)=>`
              <div class="list-item">
                <span class="list-item-num">${j+1}</span>
                <input type="text" value="${esc(e)}" placeholder="condition → consequence" oninput="S.modules[${i}].error_paths[${j}]=this.value;refreshModule(${i})" style="color:var(--red);font-size:12px">
                <span class="list-item-del" onclick="S.modules[${i}].error_paths.splice(${j},1);renderModules();refresh()">×</span>
              </div>`).join('')}
          </div>
          <button class="add-btn" onclick="addModuleItem(${i},'error_paths')">+ error path</button>
        </div>

        <div class="module-field">
          <div class="module-field-label">deps <span style="color:var(--text3);font-size:10px">— refs to other modules by name</span></div>
          <div class="list-editor" id="mod-deps-${i}">
            ${(m.deps||[]).map((d,j)=>`
              <div class="list-item">
                <span class="list-item-num">${j+1}</span>
                <input type="text" value="${esc(typeof d==='object'?d.name:d)}" placeholder="module-name" oninput="S.modules[${i}].deps[${j}]={name:this.value};refreshModule(${i})" style="font-size:12px">
                <span class="list-item-del" onclick="S.modules[${i}].deps.splice(${j},1);renderModules();refresh()">×</span>
              </div>`).join('')}
          </div>
          <button class="add-btn" onclick="addModuleItem(${i},'deps')">+ dep</button>
        </div>

        <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.08em">specDepth</span>
            <span style="font-size:11px;color:var(--accent)">${specDepth(m).toFixed(2)}</span>
            <span style="font-size:10px;color:var(--text3)">${specDepthLabel(specDepth(m))}</span>
          </div>
          <div class="depth-bar"><div class="depth-fill" style="width:${specDepth(m)*100}%;background:${depthColor(specDepth(m))}"></div></div>
        </div>
      </div>
    </div>`).join('');
}
function toggleModule(i){ S.modules[i]._open=!S.modules[i]._open; renderModules(); }
function deleteModule(i){ S.modules.splice(i,1); renderModules(); refresh(); }
function refreshModule(i){ renderModules(); refresh(); }
function addModuleItem(i,field){
  if(!S.modules[i][field]) S.modules[i][field]=[];
  if(field==='deps') S.modules[i][field].push({name:''});
  else S.modules[i][field].push('');
  renderModules(); refresh();
}
function addModule(){
  const n = ++moduleCounter;
  S.modules.push({
    id:`MOD-${String.fromCharCode(64+n)}`,name:'',uuid:'',description:'',
    exports:[],gate_pipeline:[],behavioral_contracts:[],error_paths:[],deps:[],
    _open:true
  });
  renderModules(); refresh();
}
function specDepth(m){
  let d=0;
  if(m.id) d=Math.max(d,0.0);
  if(m.name) d=Math.max(d,0.1);
  if(m.description) d=Math.max(d,0.2);
  if(m.exports?.length) d=Math.max(d,0.3);
  if(m.gate_pipeline?.length) d=Math.max(d,0.5);
  if(m.behavioral_contracts?.length) d=Math.max(d,0.7);
  if(m.error_paths?.length) d=Math.max(d,0.85);
  if(m.deps?.length&&m.error_paths?.length&&m.behavioral_contracts?.length&&m.gate_pipeline?.length&&m.exports?.length) d=1.0;
  return d;
}
function specDepthLabel(d){
  if(d>=1.0) return 'FULL';
  if(d>=0.85) return 'error_paths';
  if(d>=0.7) return 'contracts';
  if(d>=0.5) return 'gates';
  if(d>=0.3) return 'exports';
  if(d>=0.2) return 'description';
  if(d>=0.1) return 'name';
  return 'id_only';
}
function depthColor(d){
  if(d>=0.85) return 'var(--green)';
  if(d>=0.5) return 'var(--amber)';
  return 'var(--red)';
}

// ── Events ──
function renderEvents(){
  const el = document.getElementById('events-list');
  if(!S.events.length){ el.innerHTML=''; return; }
  el.innerHTML = S.events.map((g,gi)=>`
    <div class="event-group">
      <div class="event-group-header">
        <span class="event-namespace">
          <input type="text" value="${esc(g.namespace)}" placeholder="namespace" oninput="S.events[${gi}].namespace=this.value;refresh()" style="background:transparent;border:none;color:var(--amber);font-family:inherit;font-size:12px;outline:none">
        </span>
        <span class="list-item-del" onclick="S.events.splice(${gi},1);renderEvents();refresh()" style="cursor:pointer;color:var(--text3);font-size:14px">×</span>
      </div>
      <div class="event-entries">
        ${(g.entries||[]).map((e,ei)=>`
          <div class="event-row">
            <input type="text" value="${esc(e)}" placeholder="event.name { field1, field2 }" oninput="S.events[${gi}].entries[${ei}]=this.value;refresh()" style="background:transparent;border:none;border-bottom:1px solid var(--border);color:var(--text);font-family:inherit;font-size:12px;outline:none;width:100%;padding:3px 0">
            <span class="event-del" onclick="S.events[${gi}].entries.splice(${ei},1);renderEvents();refresh()">×</span>
          </div>`).join('')}
        <button class="add-btn" onclick="S.events[${gi}].entries.push('');renderEvents();refresh()" style="border-top:none;padding:4px 0;font-size:11px">+ event</button>
      </div>
    </div>`).join('');
}
function addEventGroup(){ S.events.push({namespace:'',entries:['']}); renderEvents(); refresh(); }

// ── Schemas ──
function renderSchemas(){
  const el = document.getElementById('schemas-list');
  el.innerHTML = S.schemas.map((s,si)=>`
    <div class="schema-card">
      <div class="schema-header">
        <input type="text" value="${esc(s.id)}" placeholder="SchemaName" oninput="S.schemas[${si}].id=this.value;refresh()" style="background:transparent;border:none;color:var(--blue);font-family:inherit;font-size:13px;font-weight:600;outline:none;flex:1">
        <span class="list-item-del" onclick="S.schemas.splice(${si},1);renderSchemas();refresh()" style="cursor:pointer;color:var(--text3);font-size:14px">×</span>
      </div>
      <div class="schema-body">
        <div style="display:grid;grid-template-columns:160px 1fr;gap:6px;margin-bottom:4px;font-size:10px;color:var(--text3);text-transform:uppercase;padding:0 2px">
          <span>field name</span><span>type</span>
        </div>
        ${(s.fields||[]).map((f,fi)=>`
          <div class="field-row">
            <input type="text" value="${esc(f.name)}" placeholder="fieldName" oninput="S.schemas[${si}].fields[${fi}].name=this.value;refresh()" style="width:160px;flex:none;color:var(--text);font-size:12px">
            <input type="text" value="${esc(f.type)}" placeholder="string | number | boolean | Type[]" oninput="S.schemas[${si}].fields[${fi}].type=this.value;refresh()" style="flex:1;color:var(--text2);font-size:12px">
            <span class="list-item-del" onclick="S.schemas[${si}].fields.splice(${fi},1);renderSchemas();refresh()" style="cursor:pointer;color:var(--text3);font-size:14px;padding:0 6px">×</span>
          </div>`).join('')}
        <button class="add-btn" onclick="S.schemas[${si}].fields.push({name:'',type:''});renderSchemas();refresh()" style="font-size:11px">+ field</button>
      </div>
    </div>`).join('');
}
function addSchema(){ S.schemas.push({id:'',fields:[{name:'',type:''}]}); renderSchemas(); refresh(); }

// ── Enforcement Gates ──
function renderGates(){
  const el = document.getElementById('enforcement-list');
  el.innerHTML = S.gates.map((g,i)=>`
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:10px;margin-bottom:8px">
      <div style="display:grid;grid-template-columns:110px 130px 1fr auto;gap:8px;margin-bottom:8px;align-items:center">
        <input type="text" value="${esc(g.id)}" placeholder="GATE-XXX-001" oninput="S.gates[${i}].id=this.value;refresh()" style="color:var(--amber);font-size:12px">
        <input type="text" value="${esc(g.name)}" placeholder="gate-name" oninput="S.gates[${i}].name=this.value;refresh()" style="font-size:12px">
        <input type="text" value="${esc(g.description)}" placeholder="What this gate enforces..." oninput="S.gates[${i}].description=this.value;refresh()">
        <span class="list-item-del" onclick="S.gates.splice(${i},1);renderGates();refresh()" style="cursor:pointer;color:var(--text3);font-size:14px">×</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 90px;gap:8px">
        <div>
          <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">check</div>
          <input type="text" value="${esc(g.check)}" placeholder="what to verify..." oninput="S.gates[${i}].check=this.value;refresh()" style="font-size:12px;color:var(--green)">
        </div>
        <div>
          <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">on_failure</div>
          <input type="text" value="${esc(g.on_failure)}" placeholder="build failure | log warning | continue" oninput="S.gates[${i}].on_failure=this.value;refresh()" style="font-size:12px">
        </div>
        <div>
          <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">severity</div>
          <select onchange="S.gates[${i}].severity=this.value;refresh()" style="font-size:12px">
            <option value="fatal" ${g.severity==='fatal'?'selected':''}>fatal</option>
            <option value="warning" ${g.severity==='warning'?'selected':''}>warning</option>
            <option value="info" ${g.severity==='info'?'selected':''}>info</option>
          </select>
        </div>
      </div>
    </div>`).join('');
}
function addGate(){
  const n = ++gateCounter;
  S.gates.push({id:`GATE-XXX-00${n}`,name:'',description:'',severity:'fatal',check:'',on_failure:'build failure'});
  renderGates(); refresh();
}

// ── Seams ──
function renderSeams(){
  const el = document.getElementById('seams-list');
  el.innerHTML = S.seams.map((s,i)=>`
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:10px;margin-bottom:8px">
      <div style="display:grid;grid-template-columns:150px 1fr auto;gap:8px;margin-bottom:8px">
        <input type="text" value="${esc(s.name)}" placeholder="SEAM_NAME" oninput="S.seams[${i}].name=this.value;refresh()" style="color:var(--blue);font-size:12px;font-weight:600">
        <input type="text" value="${esc(s.description)}" placeholder="What this seam connects..." oninput="S.seams[${i}].description=this.value;refresh()">
        <span class="list-item-del" onclick="S.seams.splice(${i},1);renderSeams();refresh()" style="cursor:pointer;color:var(--text3);font-size:14px">×</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div>
          <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">provider module</div>
          <input type="text" value="${esc(s.provider)}" placeholder="module-name" oninput="S.seams[${i}].provider=this.value;refresh()" style="font-size:12px">
        </div>
        <div>
          <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">consumer module</div>
          <input type="text" value="${esc(s.consumer)}" placeholder="module-name" oninput="S.seams[${i}].consumer=this.value;refresh()" style="font-size:12px">
        </div>
      </div>
      <div style="margin-top:8px">
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">contract (exported interface)</div>
        <textarea oninput="S.seams[${i}].contract=this.value;refresh()" style="min-height:60px;font-size:12px;color:var(--green)">${esc(s.contract||'')}</textarea>
      </div>
    </div>`).join('');
}
function addSeam(){
  S.seams.push({name:'',description:'',provider:'',consumer:'',contract:''});
  renderSeams(); refresh();
}

// ── Progress ──
function updateProgress(){
  const sections=['meta','axioms','deps','constraints','modules','events','schemas','enforcement','seams'];
  let filled=0;
  if(S.meta.name&&S.meta.version) filled++;
  if(S.axioms.some(a=>a)) filled++;
  if(S.deps.some(d=>d.name)) filled++;
  if(S.constraints.length) filled++;
  if(S.modules.length) filled++;
  if(S.events.length) filled++;
  if(S.schemas.length) filled++;
  if(S.gates.length) filled++;
  if(S.seams.length) filled++;
  document.getElementById('progress-fill').style.width = (filled/sections.length*100)+'%';

  // mark complete in nav
  document.querySelectorAll('.nav-item').forEach(n=>{
    const sec = n.dataset.sec;
    if(!sec) return;
    let done=false;
    if(sec==='meta') done=!!(S.meta.name&&S.meta.version);
    if(sec==='axioms') done=S.axioms.some(a=>a);
    if(sec==='deps') done=S.deps.some(d=>d.name);
    if(sec==='constraints') done=S.constraints.length>0;
    if(sec==='modules') done=S.modules.length>0;
    if(sec==='events') done=S.events.length>0;
    if(sec==='schemas') done=S.schemas.length>0;
    if(sec==='enforcement') done=S.gates.length>0;
    if(sec==='seams') done=S.seams.length>0;
    if(!n.classList.contains('active')) n.classList.toggle('complete',done);
  });
}

// ── YAML output ──
function genUUID(name){
  const slug = (name||'unknown').replace(/[^a-z0-9]/gi,'-').toLowerCase().slice(0,20);
  return `${slug}-v1-0000-${new Date().getFullYear()}-0000-000000000001`;
}
function esc(s){ return (s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escYaml(s){ return (s||'').replace(/\\/g,'\\\\').replace(/"/g,'\\"'); }

function buildYAML(){
  const m = S.meta;
  const ind=(n,s)=>' '.repeat(n)+s;
  const lines=[];
  lines.push('spec:','');
  lines.push(ind(2,'meta:'));
  if(m.name) lines.push(ind(4,`name:        ${m.name}`));
  if(m.version) lines.push(ind(4,`version:     ${m.version}`));
  if(m.author) lines.push(ind(4,`author:      ${m.author}`));
  lines.push(ind(4,`uuid:        ${m.uuid||genUUID(m.name)}`));
  lines.push(ind(4,`status:      ${m.status||'active'}`));
  if(m.description){
    lines.push(ind(4,'description: >'));
    m.description.split('\n').forEach(l=>lines.push(ind(6,l)));
  }
  if(m.tagline) lines.push(ind(4,`tagline:     "${escYaml(m.tagline)}"`));
  if(m.runtime?.length) lines.push(ind(4,`target_runtime: [${m.runtime.join(', ')}]`));
  if(m.lang?.length) lines.push(ind(4,`language_stack: [${m.lang.join(', ')}]`));
  if(m.paradigm?.length) lines.push(ind(4,`paradigm: [${m.paradigm.join(', ')}]`));

  if(S.deps.some(d=>d.name)){
    lines.push(ind(4,'deps:'));
    S.deps.filter(d=>d.name).forEach(d=>{
      lines.push(ind(6,`- name: ${d.name}`));
      if(d.version) lines.push(ind(8,`version: "${escYaml(d.version)}"`));
      if(d.required!==undefined) lines.push(ind(8,`required: ${d.required}`));
      if(d.purpose) lines.push(ind(8,`purpose: ${d.purpose}`));
    });
  }

  if(S.constraints.some(c=>c.id)){
    lines.push(ind(4,'constraints:'));
    S.constraints.filter(c=>c.id).forEach(c=>{
      lines.push(ind(6,`- id: ${c.id}`));
      if(c.description) lines.push(ind(8,`description: ${c.description}`));
      lines.push(ind(8,`type: ${c.type||'hard'}`));
      if(c.enforced_by) lines.push(ind(8,`enforced_by: [${c.enforced_by}]`));
    });
  }

  if(S.axioms.some(a=>a)){
    lines.push(ind(4,'axioms:'));
    S.axioms.filter(a=>a).forEach(a=>lines.push(ind(6,`- "${escYaml(a)}"`)));
  }

  lines.push('');

  if(S.modules.length){
    lines.push(ind(2,'modules:'),'');
    S.modules.forEach(mod=>{
      lines.push(ind(4,`- id:    ${mod.id||'MOD-UNNAMED'}`));
      if(mod.name) lines.push(ind(6,`name:  ${mod.name}`));
      lines.push(ind(6,`uuid:  ${mod.uuid||genUUID(mod.name||mod.id)}`));
      if(mod.description){
        lines.push(ind(6,'description: >'));
        mod.description.split('\n').forEach(l=>lines.push(ind(8,l)));
      }
      const fns = [
        ['exports',mod.exports,e=>`"${escYaml(e)}"`],
        ['gate_pipeline',mod.gate_pipeline,g=>`"${escYaml(g)}"`],
        ['behavioral_contracts',mod.behavioral_contracts,c=>c],
        ['error_paths',mod.error_paths,e=>e],
      ];
      fns.forEach(([key,arr,fmt])=>{
        if(arr?.some(x=>(typeof x==='string'?x:x.name))){
          lines.push(ind(6,`${key}:`));
          arr.filter(x=>(typeof x==='string'?x:x.name)).forEach(x=>lines.push(ind(8,`- ${fmt(typeof x==='string'?x:x.name)}`)));
        }
      });
      if(mod.deps?.some(d=>d.name)){
        lines.push(ind(6,'deps:'));
        mod.deps.filter(d=>d.name).forEach(d=>lines.push(ind(8,`- name: ${d.name}`)));
      }
      lines.push('');
    });
  }

  if(S.events.some(g=>g.namespace)){
    lines.push(ind(2,'events:'));
    S.events.filter(g=>g.namespace).forEach(g=>{
      lines.push(ind(4,`${g.namespace}:`));
      (g.entries||[]).filter(e=>e).forEach(e=>lines.push(ind(6,`- ${e}`)));
    });
    lines.push('');
  }

  if(S.schemas.some(s=>s.id)){
    lines.push(ind(2,'schemas:'),'');
    S.schemas.filter(s=>s.id).forEach(s=>{
      lines.push(ind(4,`- id:    ${s.id}`));
      if(s.fields?.some(f=>f.name)){
        lines.push(ind(6,'fields:'));
        s.fields.filter(f=>f.name).forEach(f=>{
          const pad = ' '.repeat(Math.max(1,20-f.name.length));
          lines.push(ind(8,`${f.name}:${pad}${f.type||'string'}`));
        });
      }
      lines.push('');
    });
  }

  if(S.gates.some(g=>g.id)){
    lines.push(ind(2,'enforcement:'));
    lines.push(ind(4,'gates:'));
    S.gates.filter(g=>g.id).forEach(g=>{
      lines.push(ind(6,`- id: ${g.id}`));
      if(g.name) lines.push(ind(8,`name: ${g.name}`));
      if(g.description) lines.push(ind(8,`description: ${g.description}`));
      lines.push(ind(8,`severity: ${g.severity||'fatal'}`));
      if(g.check) lines.push(ind(8,`check: ${g.check}`));
      if(g.on_failure) lines.push(ind(8,`on_failure: ${g.on_failure}`));
    });
    lines.push('');
  }

  if(S.seams.some(s=>s.name)){
    lines.push(ind(2,'seams:'),'');
    S.seams.filter(s=>s.name).forEach(s=>{
      lines.push(ind(4,`- name: ${s.name}`));
      if(s.description) lines.push(ind(6,`description: ${s.description}`));
      if(s.provider) lines.push(ind(6,`provider: ${s.provider}`));
      if(s.consumer) lines.push(ind(6,`consumer: ${s.consumer}`));
      if(s.contract){
        lines.push(ind(6,'contract: >'));
        s.contract.split('\n').forEach(l=>lines.push(ind(8,l)));
      }
      lines.push('');
    });
  }

  return lines.join('\n');
}

function syntaxHighlight(yaml){
  return yaml
    .replace(/^(\s*)(#.*)$/gm,(_,sp,c)=>`${sp}<span class="spec-comment">${c}</span>`)
    .replace(/^(\s*)([\w_]+)(\s*:)(\s*)/gm,(_,sp,k,colon,after)=>`${sp}<span class="spec-key">${k}</span>${colon}${after}`)
    .replace(/"([^"]+)"/g,`<span class="spec-string">"$1"</span>`)
    .replace(/(GATE-[A-Z0-9-]+)/g,`<span class="spec-gate">$1</span>`)
    .replace(/^\s+- /gm,m=>`${m}`);
}

function computeStats(){
  const avgDepth = S.modules.length ? S.modules.reduce((s,m)=>s+specDepth(m),0)/S.modules.length : 0;
  const evtCount = S.events.reduce((s,g)=>s+(g.entries||[]).filter(e=>e).length,0);
  const gaps = S.modules.filter(m=>specDepth(m)<0.5).length;
  return { depth:avgDepth.toFixed(2), mods:S.modules.length, evts:evtCount, gaps };
}

function refresh(){
  const yaml = buildYAML();
  document.getElementById('output-pre').innerHTML = syntaxHighlight(yaml);
  const stats = computeStats();
  document.getElementById('stat-depth').textContent = stats.depth;
  document.getElementById('stat-mods').textContent = stats.mods;
  document.getElementById('stat-evts').textContent = stats.evts;
  document.getElementById('sw-stat-gaps').textContent = stats.gaps;
  updateProgress();
}

function copyOutput(){
  const yaml = buildYAML();
  navigator.clipboard.writeText(yaml).then(()=>{
    const btn = event.target;
    const orig = btn.textContent;
    btn.textContent = 'copied!';
    setTimeout(()=>btn.textContent=orig,1500);
  }).catch(()=>{
    const ta = document.createElement('textarea');
    ta.value=yaml; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
  });
}

function downloadSpec(){
  const name = (S.meta.name||'my-spec').replace(/[^a-z0-9-]/gi,'-').toLowerCase();
  const blob = new Blob([buildYAML()],{type:'text/plain'});
  const a = document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=name+'.spec';
  a.click();
}

refresh();

async function saveToIdearium(){
  if (!S.meta.name) { toast('meta → name is required before saving','err'); goTo('meta'); return; }
  try {
    const res = await api('/api/specs', { method:'POST', body: JSON.stringify({ name: S.meta.name }) });
    const specUuid = res.spec && res.spec.uuid;
    if (specUuid) {
      const yaml = buildYAML();
      const spec = res.spec;
      const sections = spec.sections.map(s => s.id === 'intent' ? { ...s, content: yaml, complete: true } : s);
      await api('/api/specs/' + specUuid, { method:'PATCH', body: JSON.stringify({ sections }) });
    }
    toast('saved "' + S.meta.name + '" to Idearium', 'ok');
    await loadSpecs();
    setView('spec');
  } catch(e) { toast('save failed: ' + e.message, 'err'); }
}
</script>
      </div>
    </section>

    <!-- ══════════ PROJECTS ══════════ -->
    <section class="view" id="view-projects">
      <div class="ph"><span class="ph-title">Projects</span><span class="ph-badge" id="proj-header-badge">0 projects</span></div>
      <div class="projects-wrap">
        <div class="project-drop" id="project-drop" onclick="document.getElementById('project-file-input').click()">
          <span class="pd-big">⇪</span>
          <span id="project-drop-text">drop zips here, or click to choose files — select as many at once as you like</span>
          <input type="file" id="project-file-input" multiple accept=".zip" style="display:none" onchange="uploadProjectFiles(this.files)">
        </div>
        <div class="project-toolbar">
          <input id="project-search" placeholder="filter projects…" oninput="renderProjectList()">
        </div>
        <div class="project-list" id="project-list"><div class="detail-empty">loading…</div></div>
      </div>
    </section>

    <!-- ══════════ VERSIONIUM ══════════ -->
    <section class="view" id="view-versionium">
      <div class="ph"><span class="ph-title">Versionium</span><span class="ph-badge" id="snap-count-badge">0 snapshots</span></div>
      <div class="versionium-wrap">
        <div class="commit-list" id="commit-list"><div class="detail-empty">no snapshots yet — push one from the Ideas view</div></div>
        <div class="right">
          <div class="ph"><span class="ph-title">Snapshot Detail</span></div>
          <div class="detail-area" id="versionium-detail"><div class="detail-empty">← select a snapshot</div></div>
        </div>
      </div>
    </section>

  </main>
</div>

<!-- ADD IDEA MODAL -->
<div class="modal-overlay" id="modal">
  <div class="modal">
    <div class="modal-title">+ New Idea</div>
    <div class="field-group">
      <div class="field-label">text — the idea itself</div>
      <textarea class="field-textarea" id="f-text" placeholder="track what caused what, with meaning and conditions"></textarea>
    </div>
    <div class="field-group">
      <div class="field-label">tags (comma separated)</div>
      <input class="field-input" id="f-tags" placeholder="causality, nexus, versionium">
    </div>
    <div class="field-group">
      <div class="field-label">compartment (optional)</div>
      <input class="field-input" id="f-compartment" placeholder="e.g. cortex, guardian, bridge">
    </div>
    <div class="modal-actions">
      <button class="modal-btn" onclick="closeModal()">cancel</button>
      <button class="modal-btn confirm" onclick="submitIdea()">add idea</button>
    </div>
  </div>
</div>

<!-- New Spec — template picker (architecture/schemas/checklists/axioms/
     compartments/genesis/...), build-engine selector (WARP as build logic),
     and a "map to repo now" fast path for map-first templates
     (compartments/axioms) that promotes immediately instead of waiting for
     every chunk to build. Opened from Brainstorm ("+ spec" on a captured
     thought) and from the Spec Library ("+ new spec"). -->
<div class="modal-overlay" id="new-spec-modal">
  <div class="modal">
    <div class="modal-title">+ New Spec</div>
    <div class="field-group">
      <div class="field-label">name <span class="req">*</span></div>
      <input class="field-input" id="ns-name" placeholder="what is this?">
    </div>
    <div class="field-group">
      <div class="field-label">description</div>
      <textarea class="field-textarea" id="ns-description" rows="2" placeholder="optional — more context for the agent-built chunks"></textarea>
    </div>
    <div class="field-group">
      <div class="field-label">architecture &amp; features — select any combination</div>
      <div id="ns-templates" style="display:flex;flex-direction:column;gap:4px;max-height:220px;overflow-y:auto;border:1px solid var(--b1);border-radius:4px;padding:8px;background:var(--bg2)"></div>
      <div class="field-hint" style="font-size:10px;color:var(--text3);margin-top:4px">each checked template seeds its own sections deterministically (no agent) — pick architecture + axioms + schemas + checklists + compartments together for one composed spec</div>
    </div>
    <div class="field-group">
      <div class="field-label">build logic</div>
      <select class="field-select" id="ns-build-engine">
        <option value="auto">Auto — WARP cache when available, silent fallback to direct agent</option>
        <option value="warp">WARP (required) — fails loud if WARP isn't loaded, never silently downgrades</option>
        <option value="direct">Direct agent — skip WARP's cache on purpose (e.g. forced fresh rebuild)</option>
      </select>
    </div>
    <div class="modal-actions" style="flex-wrap:wrap">
      <button class="modal-btn" onclick="closeNewSpecModal()">cancel</button>
      <button class="modal-btn confirm" id="ns-map-btn" style="display:none" onclick="submitNewSpec(true)">create + map to repo now</button>
      <button class="modal-btn confirm" onclick="submitNewSpec(false)">create spec</button>
    </div>
  </div>
</div>

<!-- Upload Project — name/goal prompt (declares the temp compartment's
     end-state) -> dropzone -> "Import Repository", generates manifest.json/
     project.json/.git via lib/project-container.js, then opens the repo
     view scoped to the new repo. Opened from the Spec Library, next to
     "+ new spec" — a project is a real repo compartment from the start,
     same as a spec-first repo, just seeded from an existing zip instead
     of built chunk-by-chunk. -->
<div class="modal-overlay" id="upload-project-modal">
  <div class="modal">
    <div class="modal-title">Upload Project</div>

    <div id="up-step-prompt">
      <div class="field-group">
        <div class="field-label">name <span class="req">*</span></div>
        <input class="field-input" id="up-name" placeholder="e.g. checkout-service">
      </div>
      <div class="field-group">
        <div class="field-label">goal <span class="req">*</span></div>
        <textarea class="field-textarea" id="up-goal" rows="2" placeholder="what should be true once this is imported and worked on?"></textarea>
        <div class="field-hint" style="font-size:10px;color:var(--text3);margin-top:4px">becomes the compartment's declared end-state — evaluated against the real repo, manifest, and commit once import finishes</div>
      </div>
      <div class="field-group">
        <div class="field-label">example goals — click to use</div>
        <div id="up-chips" style="display:flex;flex-wrap:wrap;gap:6px"></div>
      </div>
      <div class="modal-actions">
        <button class="modal-btn" onclick="closeUploadProjectModal()">cancel</button>
        <button class="modal-btn confirm" onclick="submitUploadProjectStart()">continue →</button>
      </div>
    </div>

    <div id="up-step-drop" style="display:none">
      <div class="field-hint" id="up-container-note" style="font-size:10px;color:var(--text3);margin-bottom:8px"></div>
      <div class="project-drop" id="up-drop" onclick="document.getElementById('up-file-input').click()">
        <span class="pd-big">⬇</span>
        <span id="up-drop-text">drop a .zip archive, or click to choose one</span>
      </div>
      <input type="file" id="up-file-input" accept=".zip" style="display:none" onchange="stageUploadProjectFile(this.files[0])">
      <div class="modal-actions">
        <button class="modal-btn" onclick="cancelUploadProject()">cancel</button>
        <button class="modal-btn confirm" id="up-import-btn" disabled onclick="submitUploadProjectImport()">import repository</button>
      </div>
    </div>
  </div>
</div>

<!-- Generic themed text-prompt — replaces native prompt() for spec name /
     gap description / archive reason, so they match the rest of the UI
     instead of dropping into an OS dialog. -->
<div class="modal-overlay" id="prompt-modal">
  <div class="modal">
    <div class="modal-title" id="prompt-modal-title">input</div>
    <div class="field-group">
      <div class="field-label" id="prompt-modal-label"></div>
      <textarea class="field-textarea" id="prompt-modal-input" rows="2"></textarea>
    </div>
    <div class="modal-actions">
      <button class="modal-btn" onclick="closePromptModal(null)">cancel</button>
      <button class="modal-btn confirm" onclick="closePromptModal(document.getElementById('prompt-modal-input').value)">ok</button>
    </div>
  </div>
</div>

<!-- Spec builder choice — quick (existing section grid) vs full wizard
     (meta/axioms/deps/modules/events/schemas/enforcement/seams, matches the
     real .spec dialect used across the ecosystem, not the generic 9 sections). -->
<div class="modal-overlay" id="spec-choice-modal">
  <div class="modal">
    <div class="modal-title">Build a Spec</div>
    <div class="modal-actions" style="flex-direction:column;gap:8px;align-items:stretch">
      <button class="modal-btn confirm" onclick="closeSpecChoice(); setView('spec')">quick — section grid (intent, api_callto, module_hooks…)</button>
      <button class="modal-btn confirm" onclick="closeSpecChoice(); setView('spec-wizard')">full wizard — meta, axioms, deps, modules, events, schemas, enforcement, seams</button>
      <button class="modal-btn" onclick="closeSpecChoice()">cancel</button>
    </div>
  </div>
</div>



<div class="toast-area" id="toast-area"></div>

<script src="js/app.js"></script>
</body>
</html>
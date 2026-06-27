'use strict';
/**
 * eravos/registry-components.js
 * UUID: nexus-eravos-registry-v1-0000-2026-0627-jamesbrooks-001
 * What ERAVOS declares when it registers with orchestrator.
 */

const SYSTEM_ID = 'eravos';
const VERSION   = '3.0.0';

module.exports = {
  systemId: SYSTEM_ID,
  version:  VERSION,
  port:     3751,
  label:    'ERAVOS',
  purpose:  'Sovereign canvas system. Organisms, wires, audio, spatial composition.',
  components: [
    {
      id:       'eravos.canvas',
      namespace: 'eravos',
      name:      'eravos.canvas',
      version:   '3.0.0',
      uuid:     'nexus-eravos-comp-canvas-v1-001',
      grammar:  ['eravos', 'canvas', 'open canvas'],
      route:    { method:'GET', path:'/' },
      description: 'Main ERAVOS canvas — organisms, wires, transport',
      hooks: {
        out: [{ id:'eravos.canvas.ready', tags:['ui','canvas','ready'] }]
      }
    },
    {
      id:       'eravos.organism.spawn',
      namespace: 'eravos',
      name:      'eravos.organism.spawn',
      version:   '3.0.0',
      uuid:     'nexus-eravos-comp-spawn-v1-001',
      grammar:  ['eravos spawn', 'spawn organism', 'eo spawn'],
      route:    { method:'POST', path:'/api/organisms' },
      description: 'Spawn an organism by id onto the canvas',
      hooks: {
        in:  [{ id:'eravos.organism.spawn.receive',
                intent:['compose','visualize','sequence','spawn'],
                contract:'nexus-interaction-contract-v1::eravos',
                tags:['spawn','organism'] }],
        out: [{ id:'eravos.organism.spawn.complete',
                wires_to:['cortex.raid.feedback'],
                tags:['spawned','complete'] }]
      }
    },
    {
      id:       'eravos.organism.list',
      namespace: 'eravos',
      name:      'eravos.organism.list',
      version:   '3.0.0',
      uuid:     'nexus-eravos-comp-list-v1-001',
      grammar:  ['eravos organisms', 'eo list', 'eravos list'],
      route:    { method:'GET', path:'/api/organisms' },
      description: 'List all mounted organisms',
    },
    {
      id:       'eravos.wire.connect',
      namespace: 'eravos',
      name:      'eravos.wire.connect',
      version:   '3.0.0',
      uuid:     'nexus-eravos-comp-wire-v1-001',
      grammar:  ['eravos wire', 'ew connect'],
      route:    { method:'POST', path:'/api/wires' },
      description: 'Connect two organism hooks with a wire',
      hooks: {
        in:  [{ id:'eravos.wire.connect.receive', intent:['connect','wire'], tags:['wire'] }],
        out: [{ id:'eravos.wire.connect.complete', tags:['wired'] }]
      }
    },
    {
      id:       'eravos.catalog.list',
      namespace: 'eravos',
      name:      'eravos.catalog.list',
      version:   '3.0.0',
      uuid:     'nexus-eravos-comp-catalog-v1-001',
      grammar:  ['eravos catalog', 'ec list'],
      route:    { method:'GET', path:'/api/catalog' },
      description: 'List available organisms from the registry',
    },
    {
      id:       'eravos.pack.install',
      namespace: 'eravos',
      name:      'eravos.pack.install',
      version:   '3.0.0',
      uuid:     'nexus-eravos-comp-pack-v1-001',
      grammar:  ['eravos install', 'ep install'],
      route:    { method:'POST', path:'/api/pack/install' },
      description: 'Install a .zip organism pack',
      hooks: {
        in:  [{ id:'eravos.pack.install.receive',
                intent:['install','deploy','deliver'],
                tags:['pack','install'] }],
        out: [{ id:'eravos.pack.install.complete', tags:['installed'] }]
      }
    },
    {
      id:       'eravos.transport.play',
      namespace: 'eravos',
      name:      'eravos.transport.play',
      version:   '3.0.0',
      uuid:     'nexus-eravos-comp-play-v1-001',
      grammar:  ['eravos play', 'play'],
      route:    { method:'POST', path:'/api/transport/play' },
      description: 'Start ERAVOS playback',
    },
    {
      id:       'eravos.transport.stop',
      namespace: 'eravos',
      name:      'eravos.transport.stop',
      version:   '3.0.0',
      uuid:     'nexus-eravos-comp-stop-v1-001',
      grammar:  ['eravos stop', 'stop'],
      route:    { method:'POST', path:'/api/transport/stop' },
      description: 'Stop ERAVOS playback',
    },
  ],
  events: {
    emits: [
      'eravos.booted','eravos.organism.spawned','eravos.organism.removed',
      'eravos.wire.connected','eravos.wire.disconnected',
      'eravos.pack.queued','eravos.pack.installed',
      'eravos.transport.play','eravos.transport.stop',
    ],
    handles: [
      'guardian.organism-queue.push',
      'raid.dispatch.eravos',
      'orchestrator.shutdown',
    ],
  },
};

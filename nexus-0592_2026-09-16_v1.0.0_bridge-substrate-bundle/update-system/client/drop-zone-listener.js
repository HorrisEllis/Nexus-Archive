/**
 * DropZoneListener
 * Browser-side. Watches a drop zone element, stages changes locally,
 * and only calls back to actually publish() on the server when the
 * user hits "push" — matches the "can make changes but must hit push"
 * requirement. Nothing leaves the client until commit() is called.
 *
 * Framework-agnostic: pass any DOM element as the zone.
 *
 * Usage:
 *   const dz = new DropZoneListener(document.getElementById('drop-zone'));
 *   dz.on('stage:changed', (files) => renderPendingList(files));
 *   pushButton.onclick = () => dz.commit((stagedFiles) => {
 *     // send stagedFiles to your server, which calls UpdateService.publish()
 *   });
 */
class DropZoneListener {
  constructor(zoneEl) {
    this.zoneEl = zoneEl;
    this._staged = new Map(); // filename -> { file, addedAt }
    this._listeners = {};

    zoneEl.addEventListener('dragover', (e) => { e.preventDefault(); this._emit('dragover'); });
    zoneEl.addEventListener('dragleave', () => this._emit('dragleave'));
    zoneEl.addEventListener('drop', (e) => {
      e.preventDefault();
      this._emit('dragleave');
      const files = Array.from(e.dataTransfer.files);
      files.forEach(f => this._stage(f));
    });
  }

  on(event, fn) {
    (this._listeners[event] = this._listeners[event] || []).push(fn);
    return this;
  }

  _emit(event, payload) {
    (this._listeners[event] || []).forEach(fn => fn(payload));
  }

  _stage(file) {
    this._staged.set(file.name, { file, addedAt: Date.now() });
    this._emit('stage:changed', this.getStaged());
    this._emit('file:added', file);
  }

  removeStaged(filename) {
    this._staged.delete(filename);
    this._emit('stage:changed', this.getStaged());
  }

  getStaged() {
    return Array.from(this._staged.values()).map(s => ({ name: s.file.name, size: s.file.size, addedAt: s.addedAt }));
  }

  clearStaged() {
    this._staged.clear();
    this._emit('stage:changed', this.getStaged());
  }

  /**
   * User hit "push". Hands the staged files to your own publish callback,
   * then clears the stage on success. Nothing here talks to WebRTC directly —
   * your callback is responsible for reading files and calling
   * UpdateService.publish() server-side (or sending them there first).
   */
  async commit(publishCallback) {
    const files = Array.from(this._staged.values()).map(s => s.file);
    if (!files.length) return { pushed: 0 };
    this._emit('push:start', files);
    try {
      await publishCallback(files);
      this.clearStaged();
      this._emit('push:success', files);
      return { pushed: files.length };
    } catch (err) {
      this._emit('push:failed', err);
      throw err;
    }
  }
}

module.exports = { DropZoneListener };

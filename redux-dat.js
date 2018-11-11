import { createStore as reduxCreateStore } from './redux.js'

function createStore(reducer, initialState, ownAddress, peerAddresses = []) {
  return new ReduxDatStore(reducer, initialState, ownAddress, peerAddresses)
}

class ReduxDatStore {

  constructor(reducer, initialState, ownAddress, peerAddresses = []) {
    this._reducer = reducer
    this._initialState = initialState
    this._ownArchive = new DatArchive(ownAddress)
    this._peerArchives = peerAddresses.map(peer => new DatArchive(peer))
    this._subscribers = []
    this._state = {}
    this._listenToPeers()
  }

  getState() {
    return this._state
  }

  subscribe(fun) {
    this._subscribers.push(fun)
  }

  async dispatch(action) {
    let actions = JSON.parse(await this._ownArchive.readFile('actions.json'))
    actions.push(Object.assign({}, action, {time: new Date().getTime()}))
    this._ownArchive.writeFile('actions.json', JSON.stringify(actions))
  }

  _notifySubscribers() {
    this._subscribers.forEach(fun => fun())
  }

  _listenToPeers() {
    [this._ownArchive, ...this._peerArchives].forEach(archive => {
      /* Not working... Beaker Browser bug?
      let evts = peerArchive.watch('actions.json')
      evts.addEventListener('change', this._onPeerArchiveChange)
      */
      archive.watch(null, ({path}) => {
        if (path == '/actions.json') this._onPeerArchiveChange()
      })

    })
  }

  async _onPeerArchiveChange() {
    const reduxStore = reduxCreateStore(this._reducer)
    let actions = []
    for (let archive of [...this._peerArchives, this._ownArchive]) {
      actions = [...actions, ...JSON.parse(await archive.readFile('actions.json'))]
    }
    actions = actions.sort((a, b) => a.time - b.time)
    actions.forEach(action => reduxStore.dispatch(action))
    this._state = reduxStore.getState()
    this._notifySubscribers()
  }

}

export {createStore}

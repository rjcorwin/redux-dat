# \<redux-dat\>

## How this works
This works by every peer having their own Dat Archive that they place actions into, every peer listening to each other's Dat Archives' changes, and when an action has been added to a Dat Archive, each peer combines the action streams in the Dat Archives into one and uses a standard Redux store to calculate the state.

## Installation and usage
```
npm install --save redux-dat
```

The API is very similar to the standard Redux API. The difference is that instead of passing in an initialState, you pass in URLs of Dat Archives because state will be derived from the actions contained in those archives. Another difference is that dispatching an action is asynchronous by the time your subscribe callback is called. A subtle but sometimes important difference. Same goes for when your peers dispatch an action.
```
const store = createStore(reducer, ownArchiveUrl, [firstPeerArchiveUrl, secondPeerArchiveUrl])
store.subscribe(someRenderFunction)
store.dispatch({type: 'INCREMENT'})
```
Tips:
- See tests for usage.
- Note that every peer needs to have all the Peer Archive URLs and their own Archive URL before instantiating the store. You'll need to figure out how to facilitate the key exchanges in your own app.

## Test
```
npm install
npm start
```
Open http://localhost:8081/test/redux-dat_test.html in [Beaker Browser](https://beakerbrowser.com/). Note that you must authorize manually each archive the test suite creates.

## Thoughts on strategies for replicating actions between Redux store peers
There are a couple of strategies I've been thinking about. Depending on the application you probably want a different one so this library might give you the option to choose a strategy in the future. For now, it uses "Chronological consensus of action order".

- First come first serve action order.
  - Can lead to peers having different state because actions are in different order if for example the network is slow.
- Chronological consensus of action order.
  - Everyone is able to calculate consensus but you may find yourself on a fork of history committing actions in a parallel universe only to find when consensus catches up, the opponent you thought you were jumping over never existed. Or worse, you made your opponent jump.
  - The parallel universe issue can be perhaps mitigated by smart UI that after a `TURN` action, the UI prevents further `TURN` actions locally until a new `TURN` action has been replicated from a peer... If the UI forces every peer to take turns in a consistent order, that will prevent parallel universes from emerging.
- Consensus maker is the peer with the first ID in a sort of IDs.
  - Everyone must agree on IDs of peers from the beginning.
  - Not great if the consensus maker leaves.
- Consensus maker is the first to solve random math problem.
  - Blockchain like...
- Consensus maker is the one with the slowest network.
  - I hear this is the classic way to do P2P games over networks.

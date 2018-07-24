# Cahoots for Beaker
Cahoots is a single-page Beaker web/dat app for people to discuss and vote for the group consensus.  Just build the application and read from Beaker.
 
### Building
```sh
npm install
npm run build
# point beaker at the dist directory
```

### Consensus
- select writeable storage -- a Dat space
- select either existing ballot item, or create a new 



## Todo
- invite others
- figure out configuration
- events don't propogate (watch() broken)
- browse local issues
- clear local storage....
- remove voter
- ballots write to server directory.... can overwrite
- smoother updates -- file specific watch, strategic update in UI.... file watch only works when browser watches entire directory, not with dat archive watch.
- voter directory -- store locally dat archive names
- running using dat-gateway/dat-archive-web returns 200. dat-archive-web needs forked gateway
- handle poorly formed ballots
- npm run watch doesn't build correctly?
- Test DAT stuff
- tests leave open file handles

### Install
```sh
npm install
npm run build
# point your web browser at dist
python -m http.server
```

### Todo
- figure out configuration
- ballots write to server directory.... can overwrite
- smoother updates -- file specific watch, strategic update in UI.... file watch only works when browser watches entire directory, not with dat archive watch.
- local proposal doesn't show up in browser
- voter directory -- store locally dat archive names

- running using dat-gateway/dat-archive-web returns 200. dat-archive-web needs forked gateway
- handle poorly formed ballots
- npm run watch doesn't build correctly?
- Test HTTP stuff
- tests leave open file handles

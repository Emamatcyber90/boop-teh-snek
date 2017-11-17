const { ipcRenderer: ipc, webFrame } = require('electron');
const { Socket, OPCodes } = require('../socket');
webFrame.setZoomLevelLimits(1, 1);

const snek = document.getElementById('snek');
const counter = document.getElementById('boops');

const state = {
  boops: 0,
  id: undefined,
  connected: 0,
};

// eslint-disable-next-line no-console
const log = (...args) => console.log(...args);

const ws = new Socket('ws://localhost:1337');
ws.on('message', ({ op, d }) => {
  log(op, d);
  switch (op) {
    case OPCodes.HELLO:
      state.id = d.id;
      break;
    case OPCodes.STATE:
      Object.assign(state, d);
      update();
      break;
    case OPCodes.BOOP:
      boop(d);
  }
});

function update() {
  ipc.send('STATE', state);
  if (state.connected > 0)
    ws.send(OPCodes.BOOP, state.boops);
}

ipc.on('ACTIVITY', (d) => {
  log('ACTIVITY', d);
  ws.send(OPCodes.CONNECT, d.id);
});

function boop(boops) {
  if (boops)
    state.boops = boops;
  else if (!this.joined)
    state.boops++;
  counter.innerHTML = `${state.boops} BOOPS`;
  update();
}

snek.onmousedown = () => {
  snek.style['font-size'] = '550%';
  boop();
};

snek.onmouseup = () => {
  snek.style['font-size'] = '500%';
};

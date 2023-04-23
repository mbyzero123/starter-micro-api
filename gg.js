const crypto = require('crypto');
const rlp = require('rlp');
const util = require('ethereumjs-util');
const Web3 = require('web3');
const os = require('os');
const cluster = require('cluster');

const web3 = new Web3('https://non-exists-host.non-exists-tld');

function generatePrivateKey() {
  let privateKey;
  do {
    privateKey = crypto.randomBytes(32);
  } while (!util.privateToAddress(privateKey).toString('hex').startsWith('000000000'));
  return privateKey;
}

async function run() {
  if (cluster.isMaster) {
    const numCPUs = os.cpus().length;
    console.log(`Master ${process.pid} is running with ${numCPUs} CPUs`);
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
      console.log(`Starting a new worker`);
      cluster.fork();
    });
  } else {
    const privateKey = generatePrivateKey();
    const address = util.privateToAddress(privateKey).toString('hex');
    const wallet = `0x${address}\t${privateKey.toString('hex')}`;
    console.log(wallet);
    const fs = require('fs');
    fs.appendFileSync('wallet.txt', wallet + '\n');
  }
}

run().catch(console.error);

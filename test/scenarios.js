// Offline-queue scenarios.
//
// Runs the compiled SDK (build/src) on plain Node: the React Native native modules are
// replaced by ./stubs, react-native-fs is backed by the real filesystem so append/write
// semantics are the real ones, and connectivity plus fetch are driven by each scenario.
//
//   npm install && npm test
const fs = require('fs');
const path = require('path');
const os = require('os');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'eanalytics-test-'));
process.env.STUB_FS_DIR = TMP;

require('./stubs');

const FILE = path.join(TMP, 'eulerian.txt');

const EAnalytics = require('./build/src/eAnalytics').default;
const PropertiesTracker = require('./build/src/utils/propertiesTracker').default;
const StoredPropertiesTracker = require('./build/src/utils/storedPropertiesTracker').default;
const EaGeneric = require('./build/src/models/eaGeneric').default;
const { EATpView, EATpClick } = require('./build/src/models/eaMerchandising');

// --- network control ------------------------------------------------------
let sent = [];        // every request the SDK attempted
let failNext = false; // make the collector reject the next request

global.fetch = async (url, opts) => {
  sent.push({ url, method: (opts && opts.method) || 'GET', body: opts && opts.body });
  if (failNext) return { ok: false, json: async () => ({}) };
  return { ok: true, json: async () => ({ status: 'ok' }) };
};

const online = (v) => { global.__ONLINE = v; };
const readLines = () => (fs.existsSync(FILE) ? fs.readFileSync(FILE, 'utf8').split('\n').filter(l => l.trim() !== '') : []);
const reset = () => { fs.writeFileSync(FILE, ''); sent = []; failNext = false; online(true); };

// --- assertions -----------------------------------------------------------
let pass = 0, fail = 0;
function check(label, actual, expected) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) { pass++; console.log(`   PASS  ${label}  = ${a}`); }
  else { fail++; console.log(`   FAIL  ${label}\n         expected: ${e}\n         actual:   ${a}`); }
}

const genericEvent = async (p) => (await EaGeneric.Builder.create(p)).build();

async function main() {
  await EAnalytics.init('am1.example.net', false);
  await new Promise(r => setTimeout(r, 50)); // let init's own track(null) settle
  reset();

  console.log('\n[1] Offline: three generic events must all be queued');
  online(false);
  for (const p of ['/uno', '/due', '/tre']) {
    await PropertiesTracker.run(await genericEvent(p), 'generic');
  }
  check('queued lines', readLines().length, 3);
  check('network requests', sent.length, 0);

  console.log('\n[2] Back online: the 4th event flushes the queue in a single POST');
  online(true);
  await PropertiesTracker.run(await genericEvent('/quattro'), 'generic');
  check('network requests', sent.length, 1);
  check('events in payload', JSON.parse(sent[0].body).length, 4);
  check('paths sent', JSON.parse(sent[0].body).map(e => e.path), ['/uno', '/due', '/tre', '/quattro']);
  check('queue left', readLines().length, 0);

  console.log('\n[3] Online but the collector rejects: the event is queued for retry');
  reset();
  failNext = true;
  await PropertiesTracker.run(await genericEvent('/ko'), 'generic');
  check('send attempts', sent.length, 1);
  check('queue left', readLines().length, 1);

  console.log('\n[4] The next retry, with the network back, drains the queue');
  failNext = false;
  sent = [];
  await StoredPropertiesTracker.run();
  check('network requests', sent.length, 1);
  check('queue left', readLines().length, 0);

  console.log('\n[5] A corrupted line must not block the queue forever');
  reset();
  fs.writeFileSync(FILE, '{non-json\n' + JSON.stringify({ path: '/buono' }) + '\n');
  await StoredPropertiesTracker.run();
  check('queue left', readLines().length, 0);
  check('good event sent', JSON.parse(sent[0].body).map(e => e.path), ['/buono']);

  console.log('\n[6] Mixed generic + tpview queue: deletion order');
  reset();
  const tp = (await EATpView.Builder.create('/promo'))
    .setSiteName('mysite').setCampaign('promo-estate').setPlacement('home-hero')
    .addProduct('REF-1', 0).addProduct('REF-2', 1).build();
  online(false);
  await PropertiesTracker.run(await genericEvent('/prima'), 'generic');
  await PropertiesTracker.run(tp, 'tpview');
  await PropertiesTracker.run(await genericEvent('/dopo'), 'generic');
  check('queued lines', readLines().length, 3);
  online(true);
  sent = [];
  await StoredPropertiesTracker.run();
  check('queue left', readLines().length, 0);
  check('network requests', sent.length, 3);
  check('methods', sent.map(r => r.method), ['POST', 'GET', 'POST']);
  check('generic order preserved',
    [...JSON.parse(sent[0].body), ...JSON.parse(sent[2].body)].map(e => e.path), ['/prima', '/dopo']);

  console.log('\n[7] The restored tpview must keep its fields');
  const get = sent[1].url;
  check('campaign/placement in URL',
    get.includes('mysite/promo-estate/home-hero/mysite/generic/'), true);
  check('products in URL',
    get.includes('evprdr0=REF-1') && get.includes('evprdpos0=0')
    && get.includes('evprdr1=REF-2') && get.includes('evprdpos1=1'), true);
  check('no empty fields (///)', get.includes('///'), false);

  console.log('\n[8] Same round-trip for tpclick');
  reset();
  const tc = (await EATpClick.Builder.create('/promo'))
    .setSiteName('mysite').setCampaign('promo-estate').setPlacement('home-hero')
    .setProduct('REF-9', 3, 12).build();
  online(false);
  await PropertiesTracker.run(tc, 'tpclick');
  check('queued lines', readLines().length, 1);
  online(true);
  sent = [];
  await StoredPropertiesTracker.run();
  check('queue left', readLines().length, 0);
  check('methods', sent.map(r => r.method), ['GET']);
  check('fields kept',
    sent[0].url.includes('mysite/promo-estate/home-hero/mysite/generic/'), true);
  check('product kept',
    sent[0].url.includes('ecprdr=REF-9') && sent[0].url.includes('ecpos=3')
    && sent[0].url.includes('ecnbr=12'), true);

  console.log(`\n===== ${pass} PASS, ${fail} FAIL =====`);
  fs.rmSync(TMP, { recursive: true, force: true });
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });

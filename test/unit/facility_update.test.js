const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function load(relative, dependencies) {
  const sandbox = { module: { exports: {} }, console, require: (name) => {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../..', relative), 'utf8'), sandbox);
  return sandbox.module.exports;
}

function serviceHarness({ current = { id: 9, provider_id: 2, facility_id: 3 }, facility = { id: 4 }, duplicate = null } = {}) {
  const queries = [];
  const mappings = {
    transaction: (callback) => callback({}),
    query: () => {
      const calls = [];
      queries.push(calls);
      const query = {
        findById: (...args) => { calls.push(['findById', ...args]); return query; },
        where: (...args) => { calls.push(['where', ...args]); return query; },
        whereNot: (...args) => { calls.push(['whereNot', ...args]); return query; },
        first: () => Promise.resolve(duplicate),
        patch: (payload) => { calls.push(['patch', payload]); return Promise.resolve(1); },
        then: (resolve, reject) => Promise.resolve(current).then(resolve, reject),
      };
      return query;
    },
  };
  const dependencies = Object.fromEntries(['photos', 'court', 'courtType', 'providerSetting'].map(name => [`../models/${name}`, {}]));
  dependencies['../models/providers'] = { query: () => ({ findById: () => ({ forUpdate: async () => ({ id: 2 }) }) }) };
  dependencies['../models/facilities'] = { query: () => ({ findById: async () => facility }) };
  dependencies['../models/facilityProviders'] = mappings;
  const { providerMediaService } = load('services/providerMediaService.js', dependencies);
  return { update: () => providerMediaService.updateFacilityProvider({ providerId: 2, id: 9, facilityId: 4, detail: '' }), queries };
}

test('updates only the requested venue mapping and permits clearing detail', async () => {
  const harness = serviceHarness();
  const result = await harness.update();
  assert.equal(result.facility_id, 4);
  assert.equal(result.detail, '');
  assert.deepEqual(harness.queries[0], [['findById', 9], ['where', 'provider_id', 2]]);
  const update = harness.queries[2];
  assert.equal(update[0][1].provider_id, 2);
  assert.equal(update[0][1].id, 9);
  assert.equal(update[1][1].detail, '');
});

test('missing or other venue mapping is never patched', async () => {
  const harness = serviceHarness({ current: null });
  assert.equal(await harness.update(), null);
  assert.equal(harness.queries.length, 1);
});

test('rejects duplicate selection without writing', async () => {
  const harness = serviceHarness({ duplicate: { id: 10 } });
  await assert.rejects(harness.update(), error => error.statusCode === 409);
  assert.equal(harness.queries.length, 2);
});

test('rejects missing and venue restricted facilities', async () => {
  for (const facility of [null, { id: 4, provider_id: 8 }]) {
    const harness = serviceHarness({ facility });
    await assert.rejects(harness.update(), error => error.statusCode === 400);
    assert.equal(harness.queries.length, 1);
  }
});

test('controller validates payload, trims detail and returns service errors', async () => {
  const calls = [];
  const { providerMediaController } = load('controller/providerMediaController.js', {
    '../services/providerMediaService': { providerMediaService: { updateFacilityProvider: async (payload) => {
      calls.push(payload);
      if (payload.facilityId === 5) throw Object.assign(new Error('Already selected'), { statusCode: 409 });
      return payload.facilityId === 6 ? null : payload;
    } } },
    '../services/promotionUserService': { promotionUserService: {} },
  });
  async function request(body) {
    const reply = { code: 200, status(code) { this.code = code; return this; }, send(body) { this.body = body; return this; } };
    await providerMediaController.updateFacilityProvider({ params: { providerId: '2', id: '9' }, body }, reply);
    return reply;
  }
  for (const body of [{}, { facility_id: -1, detail: '' }, { facility_id: 4, detail: {} }, { facility_id: 4, detail: 'x'.repeat(256) }]) {
    assert.equal((await request(body)).code, 400);
  }
  assert.equal(calls.length, 0);
  assert.equal((await request({ facility_id: '4', detail: '  new detail  ' })).code, 200);
  assert.equal(calls[0].detail, 'new detail');
  assert.equal((await request({ facility_id: 5, detail: '' })).code, 409);
  assert.equal((await request({ facility_id: 6, detail: '' })).code, 404);
});

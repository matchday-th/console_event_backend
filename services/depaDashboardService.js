const Match = require('../models/match');
const InsuranceCode = require('../models/insuranceCode');


function applyDateRange(builder, columnName, timeStart, timeEnd) {
  if (timeStart) {
    builder.where(columnName, '>=', timeStart);
  }

  if (timeEnd) {
    builder.where(columnName, '<=', timeEnd);
  }
}

function toNumber(value) {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

async function getDashboardSnapshot(knex, timeStart, timeEnd) {

const insurance_code = await InsuranceCode.query(knex)
  .countDistinct('user_id as unique_users')
  .count({ sale_count: 'id' })
  .where('insurance_company_id', 1 )
  .where(knex.raw('DATE(updated_at) <= CURDATE()'))
  .where('deleted', 0)

  const [counts] = await knex('providers as p')
  .leftJoin('pos_subscriptions as ps', 'ps.provider_id', 'p.id')
  .whereNot('p.removed', 1)
  .select(
    knex.raw('SUM(CASE WHEN ps.end_date < NOW() THEN 1 ELSE 0 END) AS sp_free_count'),
    knex.raw('SUM(CASE WHEN ps.end_date > NOW() THEN 1 ELSE 0 END) AS sp_paid_count')
  );

  const bookingQuery = Match.query(knex)
    .count('* as booking_count')
    .sum({ total_gmv: 'total_price' })
    .where('cancel', 0)
    .where('deleted', 0)
    .where(knex.raw('DATE(updated_at) <= CURDATE()'))


  const [bookingRows] = await Promise.all([
    bookingQuery,
  ]);

  const booking = bookingRows[0] || {};

  return {
    booking_count: toNumber(booking?.booking_count || 0),
    total_gmv: toNumber(booking?.total_gmv || 0),
    insurance_sale_count: toNumber(insurance_code[0]?.sale_count || 0),
    unique_users: toNumber(insurance_code[0]?.unique_users || 0),
    sp_free_count: toNumber(counts.sp_free_count || 0),
    sp_paid_count: toNumber(counts.sp_paid_count || 0),
  };
}

module.exports.depaDashboardService = { getDashboardSnapshot };

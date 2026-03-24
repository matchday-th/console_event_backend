const PromotionUser = require("../models/promotionUser");

const PROMO_NAME_COLUMN = "promotion.name";
const PROVIDER_ID_COLUMN = "promotion.provider_id";
const USED_DATE_COLUMN = "promotion_users.created_at";
const MATCH_CANCELLED_COLUMN = "match.cancel";
const MATCH_DELETED_COLUMN = "match.deleted";
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

async function getPromotionUsersIndex({
  page = 1,
  pageSize = 20,
  promoname,
  providerId,
  matchCancelled,
  matchDeleted,
  createdFrom,
  createdTo,
} = {}) {
  const normalizedFrom =
    typeof createdFrom === "string" && DATE_ONLY_PATTERN.test(createdFrom)
      ? `${createdFrom} 00:00:00`
      : createdFrom;
  const normalizedTo =
    typeof createdTo === "string" && DATE_ONLY_PATTERN.test(createdTo)
      ? `${createdTo} 23:59:59`
      : createdTo;

  const query = PromotionUser.query()
    .alias("promotion_users")
    .withGraphJoined("[promotion, match]");

  if (promoname) {
    const keyword = String(promoname).trim().toLowerCase();
    if (keyword) {
      query.whereRaw("LOWER(??) like ?", [PROMO_NAME_COLUMN, `%${keyword}%`]);
    }
  }

  if (providerId !== undefined && providerId !== null && String(providerId).length > 0) {
    query.where(PROVIDER_ID_COLUMN, providerId);
  }

  if (matchCancelled !== undefined) {
    query.where(MATCH_CANCELLED_COLUMN, matchCancelled);
  } else {
    query.where(MATCH_CANCELLED_COLUMN, 0);
  }

  if (matchDeleted !== undefined) {
    query.where(MATCH_DELETED_COLUMN, matchDeleted);
  } else {
    query.where(MATCH_DELETED_COLUMN, 0);
  }

  if (normalizedFrom && normalizedTo) {
    query.whereBetween(USED_DATE_COLUMN, [normalizedFrom, normalizedTo]);
  } else if (normalizedFrom) {
    query.where(USED_DATE_COLUMN, ">=", normalizedFrom);
  } else if (normalizedTo) {
    query.where(USED_DATE_COLUMN, "<=", normalizedTo);
  }

  query.orderBy(USED_DATE_COLUMN, "desc");

  const pageIndex = Math.max(0, Number(page) - 1);
  const size = Math.max(1, Number(pageSize));
  const { results, total } = await query.page(pageIndex, size);

  return { results, total };
}

module.exports.promotionUserService = {
  getPromotionUsersIndex,
};

const { Model } = require('objection');
const CourtType = require('./courtType');
const MatchOptionPrice = require('./matchOptionPrice');
const MatchDiscount = require('./matchDiscount');
const PaymentDetail = require('./paymentDetail');
const Court = require('./court');
const User = require('./user');
const Member = require('./member');
const Staff = require('./staff');
const MatchService = require('./matchService');
const Bill = require('./bill');
const BillOrder = require('./billOrder');
const Payment = require('./payment');
const PaymentReceipt = require('./paymentReceipt');
const UsedInventory = require('./usedInventory');
const PromotionUser = require('./promotionUser');

class Match extends Model {
    static get tableName() {
        return 'matches';
    }

    static get relationMappings() {
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'matches.user_id',
                    to: 'users.id'
                }
            },
            member: {
                relation: Model.BelongsToOneRelation,
                modelClass: Member,
                join: {
                    from: 'matches.member_id',
                    to: 'members.id'
                }
            },
            staff: {
                relation: Model.BelongsToOneRelation,
                modelClass: Staff,
                join: {
                    from: 'matches.staff_id',
                    to: 'staff.id'
                }
            },
            court: {
                relation: Model.BelongsToOneRelation,
                modelClass: Court,
                join: {
                    from: 'matches.court_id',
                    to: 'courts.id'
                }
            },
            court_type: {
                relation: Model.BelongsToOneRelation,
                modelClass: CourtType,
                join: {
                    from: 'matches.provider_sport_id',
                    to: 'court_types.provider_sport_id'
                }
            },
            match_services: {
                relation: Model.HasManyRelation,
                modelClass: MatchService,
                join: {
                    from: 'matches.id',
                    to: 'match_services.match_id'
                }
            },
            match_option_price: {
                relation: Model.HasOneRelation,
                modelClass: MatchOptionPrice,
                join: {
                    from: 'matches.id',
                    to: 'match_option_prices.match_id'
                }
            },
            match_discount: {
                relation: Model.HasOneRelation,
                modelClass: MatchDiscount,
                join: {
                    from: 'matches.id',
                    to: 'match_discounts.match_id'
                }
            },
            bill: {
                relation: Model.HasOneRelation,
                modelClass: Bill,
                join: {
                    from: 'matches.id',
                    to: 'bills.match_id'
                }
            },
            bill_order: {
                relation: Model.HasOneRelation,
                modelClass: BillOrder,
                join: {
                    from: 'matches.id',
                    to: 'bill_orders.match_id'
                }
            },
            payments: {
                relation: Model.HasManyRelation,
                modelClass: Payment,
                join: {
                    from: 'matches.id',
                    to: 'payments.match_id'
                }
            },
            payment_receipts: {
                relation: Model.HasManyRelation,
                modelClass: PaymentReceipt,
                join: {
                    from: 'matches.id',
                    to: 'payment_receipts.match_id'
                }
            },
            payment_details: {
                relation: Model.HasManyRelation,
                modelClass: PaymentDetail,
                join: {
                from: 'matches.id',
                to: 'payment_details.match_id',
                },
            },
            used_inventories: {
                relation: Model.HasManyRelation,
                modelClass: UsedInventory,
                join: {
                    from: 'matches.id',
                    to: 'used_inventories.match_id'
                }
            },
            promotion_users: {
                relation: Model.HasManyRelation,
                modelClass: PromotionUser,
                join: {
                    from: 'matches.id',
                    to: 'promotion_users.match_id'
                }
            }
        };
    }
}

module.exports = Match;

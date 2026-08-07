const Providers = require("../models/providers");

// MySQL DATETIME, in the server's local time -- matches what the backend's
// `node ace provider:access` writes, so both sources look the same in the UI.
function nowForMysql() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
           `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

async function getProviders({ page, perPage, search }) {
    let query = Providers.query()
            .select('id', 'fullname', 'url_nickname', 'phone_number',
                    'access_revoked_at', 'access_revoked_reason')
            .where(function() {
                    this.where('removed', 0).orWhereNull('removed');
                })

    if (search) {
        query = query.where('fullname', 'like', `%${search}%`);
    }

    return await query.page(page - 1, perPage);
}

async function getProviderIdFullnameList() {
    return await Providers.query()
        .select('id', 'fullname')
        .orderBy('fullname', 'asc');
}

// Kick / reinstate a provider. Setting access_revoked_at makes every live token
// for this provider fail on its next request (App/Middleware/AuthGate in the
// arena backends reads the same column).
//
// IMPORTANT: this is a session terminator, not a permanent block. A provider who
// logs in with the CURRENT password clears the flag automatically, so the
// operating procedure is: change the password first, THEN kick. Hand out the new
// password to reinstate them.
async function setProviderAccess({ id, revoked, reason }) {
    const patch = revoked
        ? { access_revoked_at: nowForMysql(), access_revoked_reason: reason || null }
        : { access_revoked_at: null, access_revoked_reason: null };

    const updated = await Providers.query().findById(id).patch(patch);
    if (!updated) return null;

    return await Providers.query()
        .findById(id)
        .select('id', 'fullname', 'access_revoked_at', 'access_revoked_reason');
}

module.exports.providerLoginService = { getProviders, getProviderIdFullnameList, setProviderAccess }

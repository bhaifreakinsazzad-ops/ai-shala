const { getRuntimeConfig } = require('../lib/config');

const config = getRuntimeConfig();

function isExpired(dateValue) {
  if (!dateValue) return false;
  const expiresAt = new Date(dateValue).getTime();
  return Number.isFinite(expiresAt) && expiresAt <= Date.now();
}

function isSameUtcDay(a, b) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear()
    && a.getUTCMonth() === b.getUTCMonth()
    && a.getUTCDate() === b.getUTCDate()
  );
}

async function normalizeUserState(supabase, user) {
  if (!user) return user;

  const updates = {};
  const now = new Date();
  const lastReset = new Date(user.last_reset_at || 0);

  if (!isSameUtcDay(lastReset, now)) {
    updates.daily_usage = 0;
    updates.image_daily_usage = 0;
    updates.last_reset_at = now.toISOString();
  }

  if (user.subscription !== 'free' && isExpired(user.subscription_ends_at)) {
    updates.subscription = 'free';
    updates.subscription_ends_at = null;
    updates.daily_limit = config.freeDailyLimit;
    updates.image_daily_limit = config.freeImageDailyLimit;
  }

  if (Object.keys(updates).length === 0) {
    return user;
  }

  updates.updated_at = now.toISOString();

  const { data: refreshedUser, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select('*')
    .single();

  if (error || !refreshedUser) {
    return user;
  }

  return refreshedUser;
}

module.exports = { normalizeUserState };

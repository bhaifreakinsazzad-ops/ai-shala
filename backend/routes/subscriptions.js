const express = require('express');
const router = express.Router();
const { supabase, authenticateToken } = require('../middleware/auth');
const { getRuntimeConfig } = require('../lib/config');

const config = getRuntimeConfig();

const PLANS = [
  {
    id: 'free',
    name: 'ফ্রি',
    nameEn: 'Free',
    price_bdt: 0,
    period: null,
    daily_limit: 50,
    image_daily_limit: 5,
    features: [
      'দৈনিক ৫০টি AI মেসেজ',
      '৭ দিনের ফ্রি ট্রায়াল',
      '২৫+ ফ্রি AI মডেল',
      'দৈনিক ৫টি ছবি তৈরি',
      'সব বেসিক টুলস',
      'বাংলা ও English সাপোর্ট',
    ],
    color: 'gray',
    popular: false,
  },
  {
    id: 'pro',
    name: 'প্রো',
    nameEn: 'Pro',
    price_bdt: 299,
    period: 'month',
    daily_limit: 999999,
    image_daily_limit: 999999,
    features: [
      'আনলিমিটেড AI মেসেজ',
      '৪০+ AI মডেল (সব ফ্রি মডেল)',
      'আনলিমিটেড ছবি তৈরি',
      'সব প্রিমিয়াম টুলস',
      'প্রায়োরিটি রেসপন্স',
      'API অ্যাক্সেস',
      'চ্যাট হিস্ট্রি এক্সপোর্ট',
      'প্রায়োরিটি সাপোর্ট',
    ],
    color: 'green',
    popular: true,
  },
  {
    id: 'premium',
    name: 'প্রিমিয়াম',
    nameEn: 'Premium',
    price_bdt: 699,
    period: 'month',
    daily_limit: 999999,
    image_daily_limit: 999999,
    features: [
      'সব Pro ফিচার',
      'GPT-4o, Claude সহ সব মডেল',
      'AI এজেন্ট অ্যাক্সেস',
      'ডেডিকেটেড সাপোর্ট',
      'কাস্টম সিস্টেম প্রম্পট',
      'ব্যবসায়িক রিপোর্ট',
      'টিম শেয়ারিং (৩ জন)',
    ],
    color: 'purple',
    popular: false,
  },
];

const PAYMENT_METHODS = new Set(['bkash', 'nagad', 'rocket', 'bank']);

const PAYMENT_INSTRUCTIONS = {
  bkash: {
    name: 'bKash',
    logo: 'https://seeklogo.com/images/B/bkash-logo-F50D4A45FC-seeklogo.com.png',
    steps: [
      'আপনার bKash অ্যাপ খুলুন',
      '"Send Money" সিলেক্ট করুন',
      `নম্বর দিন: ${config.paymentPhone}`,
      'পরিমাণ লিখুন এবং "Confirm" করুন',
      'ট্রানজেকশন আইডি (TrxID) নোট করুন',
      'নিচে ফর্মে TrxID সাবমিট করুন',
    ],
    number: config.paymentPhone,
    type: 'personal',
  },
  nagad: {
    name: 'Nagad',
    logo: 'https://nagad.com.bd/wp-content/uploads/2021/09/Logo.png',
    steps: [
      'Nagad অ্যাপ বা *167# ডায়াল করুন',
      '"Send Money" বেছে নিন',
      `নম্বরে পাঠান: ${config.paymentPhone}`,
      'পরিমাণ এন্টার করুন ও কনফার্ম করুন',
      'ট্রানজেকশন আইডি সংরক্ষণ করুন',
      'নিচের ফর্মে জমা দিন',
    ],
    number: config.paymentPhone,
    type: 'personal',
  },
  rocket: {
    name: 'Rocket (DBBL)',
    steps: [
      '*322# ডায়াল করুন বা Rocket অ্যাপ খুলুন',
      '"Send Money" অপশন বেছে নিন',
      `নম্বর: ${config.paymentPhone}`,
      'পরিমাণ দিয়ে কনফার্ম করুন',
      'TrxID নোট করুন এবং নিচে সাবমিট করুন',
    ],
    number: config.paymentPhone,
    type: 'personal',
  },
  bank: {
    name: 'ব্যাংক ট্রান্সফার',
    steps: [
      'আপনার ব্যাংক অ্যাপ বা ব্রাঞ্চে যান',
      'নিচের অ্যাকাউন্টে পাঠান',
      'ট্রান্সফার স্লিপ/রেফারেন্স নম্বর রাখুন',
      'নিচের ফর্মে জমা দিন',
    ],
    bankName: 'Dutch-Bangla Bank',
    accountNumber: 'Contact admin for bank details',
    type: 'bank',
  },
};

function getPlan(planId) {
  return PLANS.find((plan) => plan.id === planId);
}

function parseAmount(amount) {
  const parsed = Number.parseFloat(amount);
  return Number.isFinite(parsed) ? parsed : NaN;
}

// Get plans
router.get('/plans', (req, res) => {
  res.json({ plans: PLANS });
});

// Get payment instructions
router.get('/payment-methods', (req, res) => {
  const methods = Object.entries(PAYMENT_INSTRUCTIONS).map(([id, info]) => ({
    id,
    ...info,
  }));
  res.json({
    methods,
    paymentPhone: config.paymentPhone,
    note: 'পেমেন্ট করার পর ২-২৪ ঘণ্টার মধ্যে অ্যাকাউন্ট আপগ্রেড হবে।',
  });
});

// Submit payment request
router.post('/payment-request', authenticateToken, async (req, res) => {
  try {
    const { plan_id, payment_method, transaction_id, amount, sender_number } = req.body;
    const normalizedMethod = String(payment_method || '').trim().toLowerCase();
    const normalizedTransactionId = String(transaction_id || '').trim();
    const numericAmount = parseAmount(amount);

    if (!plan_id || !normalizedMethod || !normalizedTransactionId || !amount) {
      return res.status(400).json({ error: 'সব তথ্য প্রয়োজন' });
    }

    if (!PAYMENT_METHODS.has(normalizedMethod)) {
      return res.status(400).json({ error: 'Unsupported payment method' });
    }

    const plan = getPlan(plan_id);
    if (!plan || plan.id === 'free') {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    if (!Number.isFinite(numericAmount) || numericAmount !== plan.price_bdt) {
      return res.status(400).json({ error: `Amount must be exactly ${plan.price_bdt} BDT` });
    }

    if ((normalizedMethod === 'bkash' || normalizedMethod === 'nagad' || normalizedMethod === 'rocket') && !String(sender_number || '').trim()) {
      return res.status(400).json({ error: 'Sender number is required for mobile payments' });
    }

    const { data: existing } = await supabase
      .from('payment_requests')
      .select('id')
      .eq('transaction_id', normalizedTransactionId)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: 'এই ট্রানজেকশন আইডি আগে জমা দেওয়া হয়েছে' });
    }

    const { data: request, error } = await supabase
      .from('payment_requests')
      .insert([{
        user_id: req.user.id,
        user_email: req.user.email,
        user_name: req.user.name,
        plan_id,
        plan_name: plan.name,
        payment_method: normalizedMethod,
        transaction_id: normalizedTransactionId,
        amount: numericAmount,
        sender_number: sender_number || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Payment request error:', error);
      return res.status(500).json({ error: 'পেমেন্ট রিকোয়েস্ট সাবমিট করতে সমস্যা' });
    }

    res.json({
      success: true,
      message: 'পেমেন্ট রিকোয়েস্ট পাওয়া গেছে! ২-২৪ ঘণ্টার মধ্যে অ্যাকাউন্ট আপগ্রেড হবে।',
      requestId: request.id,
    });
  } catch (err) {
    console.error('Payment request error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's payment requests
router.get('/my-payments', authenticateToken, async (req, res) => {
  try {
    const { data: payments, error } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: 'Failed to fetch payments' });
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

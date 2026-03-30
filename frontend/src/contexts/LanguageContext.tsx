import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Lang = 'bn' | 'en'

const translations = {
  bn: {
    // Brand
    brand: 'AI শালা',
    tagline: "বাংলাদেশের প্রথম AI সুপার অ্যাপ",

    // Nav
    navFeatures: 'ফিচার',
    navModels: 'মডেল',
    navPricing: 'মূল্য',
    login: 'লগইন',
    startFree: 'ফ্রিতে শুরু করুন',

    // Hero
    heroTitle1: 'সব AI',
    heroTitle2: 'এক জায়গায়',
    heroSub: '৪০+ AI মডেল, ছবি তৈরি, ২০+ টুলস — সম্পূর্ণ বাংলায়।',
    heroFree: '৭ দিন সম্পূর্ণ বিনামূল্যে।',
    heroLearnMore: 'আরো জানুন',

    // Stats
    stat1Label: 'AI মডেল',
    stat2Label: 'টুলস',
    stat3Value: '৭ দিন',
    stat3Label: 'ফ্রি ট্রায়াল',
    stat4Value: '১০০%',
    stat4Label: 'বাংলা সাপোর্ট',

    // Features section
    featuresTitle: 'কেন AI শালা?',
    featuresSub: 'বাংলাদেশের জন্য বানানো, বাংলায় কথা বলে',
    feat1Title: 'AI চ্যাট',
    feat1Desc: '৪০+ AI মডেল দিয়ে চ্যাট করুন। LLaMA, Gemini, Mistral সব এক জায়গায়।',
    feat2Title: 'ছবি তৈরি',
    feat2Desc: 'বাংলায় প্রম্পট লিখুন, মুহূর্তে সুন্দর ছবি পান। সম্পূর্ণ বিনামূল্যে।',
    feat3Title: '২০+ AI টুলস',
    feat3Desc: 'লেখা, অনুবাদ, কোড, CV, কভার লেটার — সব বাংলায় পাবেন।',
    feat4Title: 'অতি দ্রুত',
    feat4Desc: 'Groq এর শক্তিতে সেকেন্ডে রেসপন্স। কোনো অপেক্ষা নেই।',
    feat5Title: 'নিরাপদ',
    feat5Desc: 'আপনার তথ্য সম্পূর্ণ সুরক্ষিত। কোনো তৃতীয় পক্ষে শেয়ার হয় না।',
    feat6Title: 'বাংলায় সাপোর্ট',
    feat6Desc: 'সম্পূর্ণ বাংলায় ইন্টারফেস। বাংলাদেশের জন্য বানানো।',

    // Models section
    modelsTitle: 'AI মডেলসমূহ',
    modelsSub: 'সব মডেল সম্পূর্ণ বিনামূল্যে ব্যবহার করুন',
    modelsMore: 'এবং আরো ৩০+ মডেল...',

    // Pricing
    pricingTitle: 'সহজ মূল্য পরিকল্পনা',
    pricingSub: 'bKash, Nagad দিয়ে পেমেন্ট করুন',
    pricingPopular: 'জনপ্রিয়',
    plan1Name: 'ফ্রি',
    plan1Price: '৳০',
    plan1Period: '',
    plan1F1: 'দৈনিক ৫০ মেসেজ',
    plan1F2: '৭ দিনের ট্রায়াল',
    plan1F3: '২৫+ AI মডেল',
    plan1F4: '৫টি ছবি/দিন',
    plan1Cta: 'শুরু করুন',
    plan2Name: 'প্রো',
    plan2Price: '৳২৯৯',
    plan2Period: '/মাস',
    plan2F1: 'আনলিমিটেড মেসেজ',
    plan2F2: '৪০+ AI মডেল',
    plan2F3: 'আনলিমিটেড ছবি',
    plan2F4: 'সব প্রিমিয়াম টুলস',
    plan2F5: 'API অ্যাক্সেস',
    plan2Cta: 'প্রো নিন',
    plan3Name: 'প্রিমিয়াম',
    plan3Price: '৳৬৯৯',
    plan3Period: '/মাস',
    plan3F1: 'সব প্রো ফিচার',
    plan3F2: 'GPT-4o + Claude',
    plan3F3: 'ডেডিকেটেড সাপোর্ট',
    plan3F4: 'কাস্টম প্রম্পট',
    plan3F5: 'টিম শেয়ারিং',
    plan3Cta: 'প্রিমিয়াম নিন',
    paymentMethods: '💳 bKash · Nagad · Rocket · ব্যাংক ট্রান্সফার গ্রহণযোগ্য',

    // CTA
    ctaTitle: 'আজই শুরু করুন,',
    ctaTitleHighlight: 'সম্পূর্ণ ফ্রিতে',
    ctaSub: '৭ দিনের ফ্রি ট্রায়াল। কোনো ক্রেডিট কার্ড লাগবে না।',
    ctaBtn: 'এখনই রেজিস্টার করুন',

    // Footer
    footerMade: 'Made with 💚 in Bangladesh · © 2025 AI Shala',

    // Login page
    loginSubtitle: 'আপনার অ্যাকাউন্টে প্রবেশ করুন',
    emailLabel: 'ইমেইল',
    emailPlaceholder: 'আপনার ইমেইল',
    passwordLabel: 'পাসওয়ার্ড',
    passwordPlaceholder: 'আপনার পাসওয়ার্ড',
    loginBtn: 'লগইন করুন',
    loggingIn: 'লগইন হচ্ছে...',
    loginError: 'লগইন করতে সমস্যা হয়েছে',
    noAccount: 'অ্যাকাউন্ট নেই?',
    registerFree: 'ফ্রিতে রেজিস্টার করুন',

    // Register page
    registerSubtitle: 'ফ্রিতে অ্যাকাউন্ট খুলুন',
    registerFreeTag: '৭ দিন সম্পূর্ণ বিনামূল্যে',
    nameLabel: 'আপনার নাম *',
    namePlaceholder: 'আপনার পূর্ণ নাম লিখুন',
    emailReq: 'ইমেইল *',
    phoneLabel: 'মোবাইল নম্বর (ঐচ্ছিক)',
    phonePlaceholder: '01XXXXXXXXX',
    passwordReq: 'পাসওয়ার্ড *',
    passwordMin: 'কমপক্ষে ৬ অক্ষর',
    confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন *',
    confirmPlaceholder: 'আবার পাসওয়ার্ড লিখুন',
    registerBtn: 'অ্যাকাউন্ট তৈরি করুন',
    registering: 'রেজিস্টার হচ্ছে...',
    pwMismatch: 'পাসওয়ার্ড মিলছে না',
    pwTooShort: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে',
    registerError: 'রেজিস্ট্রেশনে সমস্যা হয়েছে',
    haveAccount: 'আগেই আছেন?',
    loginLink: 'লগইন করুন',

    // Layout / Sidebar
    sidebarChat: 'AI চ্যাট',
    sidebarImage: 'ছবি তৈরি',
    sidebarTools: 'AI টুলস',
    sidebarDashboard: 'ড্যাশবোর্ড',
    sidebarPayment: 'সাবস্ক্রিপশন',
    sidebarAdmin: 'অ্যাডমিন',
    sidebarLogout: 'লগআউট',
    subFree: 'ফ্রি',
    subPro: 'প্রো',
    subPremium: 'প্রিমিয়াম',
    loading: 'লোড হচ্ছে...',

    // Chat page
    chatNewChat: 'নতুন চ্যাট',
    chatNoConvs: 'কোনো চ্যাট নেই',
    chatWelcome: 'AI শালায় স্বাগতম!',
    chatWelcomeSub: 'একটি নতুন চ্যাট শুরু করুন অথবা নিচের উদাহরণ ব্যবহার করুন',
    chatPrompt1: 'বাংলায় একটি গল্প লিখুন',
    chatPrompt2: 'Python কোড লিখে দিন',
    chatPrompt3: 'আমার CV তৈরি করুন',
    chatPrompt4: 'এই English টা অনুবাদ করুন',
    chatToday: 'আজকের ব্যবহার',
    chatSendError: 'মেসেজ পাঠাতে সমস্যা হয়েছে',
    chatPlaceholder: 'মেসেজ লিখুন...',

    // Image page
    imageTitle: 'AI ছবি তৈরি',
    imagePlaceholder: 'ছবির বিবরণ লিখুন...',
    imageGenerateBtn: 'ছবি তৈরি করুন',
    imageGenerating: 'তৈরি হচ্ছে...',
    imageStyleLabel: 'স্টাইল',
    imageSizeLabel: 'সাইজ',
    imageSubtitle: 'Pollinations.ai দিয়ে সম্পূর্ণ বিনামূল্যে ছবি তৈরি করুন',
    imageTodayCount: 'আজকের ছবি',
    imageGetUnlimited: 'আনলিমিটেড পেতে',
    imageGeneratingMsg: 'ছবি তৈরি হচ্ছে...',
    imageTimeSec: '১০-৩০ সেকেন্ড',
    imagePlaceholderMsg: 'আপনার ছবি এখানে দেখাবে',
    imageHistory: 'আগের ছবিগুলো',
    imageLimitReached: 'দৈনিক সীমা শেষ',
    imageStyleRealistic: 'রিয়েলিস্টিক',
    imageStyleAnime: 'অ্যানিমে',
    imageStyleCartoon: 'কার্টুন',
    imageStyleOilPainting: 'তৈলচিত্র',
    imageStyleWatercolor: 'জলরং',
    imageStyleDigitalArt: 'ডিজিটাল আর্ট',
    imageStyleSketch: 'স্কেচ',
    imageStyleBangladeshi: 'বাংলাদেশি',
    imageSizeSquare: 'বর্গ',
    imageSizeLandscape: 'ল্যান্ডস্কেপ',
    imageSizePortrait: 'পোর্ট্রেট',

    // Tools page
    toolsTitle: 'AI টুলস',
    toolsAllCats: 'সব',
    toolSelectPrompt: 'বাম পাশ থেকে একটি টুল বেছে নিন',
    toolInputLabel: 'ইনপুট লিখুন',
    toolInputPlaceholder: 'এখানে আপনার লেখা দিন...',
    toolRunning: 'চলছে...',
    toolRun: 'টুল চালান',
    toolResult: 'ফলাফল',
    toolCopied: 'কপি হয়েছে!',
    toolCopy: 'কপি করুন',
    toolError: 'টুল চালাতে সমস্যা হয়েছে',
    toolGetPro: 'প্রো নিন',
    toolTranslateTo: 'অনুবাদ করুন এই ভাষায়',
    toolCodeLang: 'প্রোগ্রামিং ভাষা',
    toolPlatform: 'প্ল্যাটফর্ম',
    toolQuestionCount: 'প্রশ্নের সংখ্যা',
    toolQuestions: 'টি প্রশ্ন',

    // Dashboard
    dashTitle: 'আমার ড্যাশবোর্ড',
    dashTodayUsage: 'আজকের ব্যবহার',
    dashProfile: 'প্রোফাইল',
    dashPayments: 'সাম্প্রতিক পেমেন্ট',
    dashWelcome: 'স্বাগতম,',
    dashFreeTrial: 'ফ্রি ট্রায়াল চলছে',
    dashDaysLeft: 'দিন বাকি',
    dashUpgrade: 'আপগ্রেড করুন',
    dashSubscriptionLabel: 'সাবস্ক্রিপশন মেয়াদ',
    dashRenew: 'নবায়ন করুন',
    dashAIMessages: 'AI মেসেজ',
    dashImagesLabel: 'ছবি তৈরি',
    dashToolsLabel: 'টুলস',
    dashUpgradeLabel: 'আপগ্রেড',
    dashChatNow: 'চ্যাট করুন',
    dashGenerate: 'তৈরি করুন',
    dashUseNow: 'ব্যবহার করুন',
    dashViewPlans: 'প্ল্যান দেখুন',
    dashUnlimited: 'আনলিমিটেড',
    dashNearLimit: 'সীমার কাছাকাছি। আজই আপগ্রেড করুন!',
    dashGetPro: 'প্রো নিন',
    dashMobile: 'মোবাইল',
    dashPlan: 'প্ল্যান',
    dashJoined: 'যোগদান',
    dashSave: 'সেভ',
    dashCancel: 'বাতিল',
    dashNoPayments: 'কোনো পেমেন্ট নেই',

    // Pricing page
    pricingPageTitle: 'আপনার জন্য সঠিক প্ল্যান',
    pricingPageSub: 'bKash, Nagad, Rocket দিয়ে মিনিটেই পেমেন্ট করুন। কোনো ক্রেডিট কার্ড লাগবে না।',
    pricingPageBadge: 'সহজ মূল্য, বাংলাদেশি পেমেন্ট',
    pricingCurrentPlan: 'বর্তমান প্ল্যান:',
    pricingMostPopular: 'সবচেয়ে জনপ্রিয়',
    pricingFreeLabel: 'বিনামূল্যে',
    pricingCurrentPlanBtn: 'বর্তমান প্ল্যান',
    pricingStartFree: 'ফ্রিতে শুরু',
    pricingPayNow: 'পেমেন্ট করুন',
    pricingPaymentTitle: 'গ্রহণযোগ্য পেমেন্ট পদ্ধতি',
    pricingPaymentNote: 'পেমেন্টের পর ট্রানজেকশন আইডি দিলে',
    pricingPaymentNoteHighlight: '২-২৪ ঘণ্টার মধ্যে',
    pricingPaymentNoteEnd: 'অ্যাকাউন্ট আপগ্রেড হবে',
    pricingFaqTitle: 'সাধারণ প্রশ্ন',
    pricingGotoDash: 'ড্যাশবোর্ডে যান',
    pricingActive: 'সক্রিয়',
    pricingMonthSuffix: '/মাস',
  },

  en: {
    // Brand
    brand: 'AI Shala',
    tagline: "Bangladesh's First AI Super App",

    // Nav
    navFeatures: 'Features',
    navModels: 'Models',
    navPricing: 'Pricing',
    login: 'Login',
    startFree: 'Start Free',

    // Hero
    heroTitle1: 'All AI',
    heroTitle2: 'In One Place',
    heroSub: '40+ AI Models, Image Generation, 20+ Tools — fully in Bangla.',
    heroFree: '7 days completely free.',
    heroLearnMore: 'Learn More',

    // Stats
    stat1Label: 'AI Models',
    stat2Label: 'Tools',
    stat3Value: '7 Days',
    stat3Label: 'Free Trial',
    stat4Value: '100%',
    stat4Label: 'Bangla Support',

    // Features section
    featuresTitle: 'Why AI Shala?',
    featuresSub: 'Built for Bangladesh, speaks Bangla',
    feat1Title: 'AI Chat',
    feat1Desc: 'Chat with 40+ AI models. LLaMA, Gemini, Mistral — all in one place.',
    feat2Title: 'Image Generation',
    feat2Desc: 'Write prompts in Bangla, get stunning images instantly. Completely free.',
    feat3Title: '20+ AI Tools',
    feat3Desc: 'Writing, translation, code, CV, cover letters — all in Bangla.',
    feat4Title: 'Ultra Fast',
    feat4Desc: 'Powered by Groq — responses in seconds. No waiting.',
    feat5Title: 'Secure',
    feat5Desc: 'Your data is completely protected. Never shared with third parties.',
    feat6Title: 'Bangla Support',
    feat6Desc: 'Full Bangla interface. Built for Bangladesh.',

    // Models section
    modelsTitle: 'AI Models',
    modelsSub: 'Use all models completely free of charge',
    modelsMore: 'And 30+ more models...',

    // Pricing
    pricingTitle: 'Simple Pricing',
    pricingSub: 'Pay with bKash, Nagad',
    pricingPopular: 'Popular',
    plan1Name: 'Free',
    plan1Price: '৳0',
    plan1Period: '',
    plan1F1: '50 messages/day',
    plan1F2: '7-day trial',
    plan1F3: '25+ AI Models',
    plan1F4: '5 images/day',
    plan1Cta: 'Get Started',
    plan2Name: 'Pro',
    plan2Price: '৳299',
    plan2Period: '/month',
    plan2F1: 'Unlimited messages',
    plan2F2: '40+ AI Models',
    plan2F3: 'Unlimited images',
    plan2F4: 'All premium tools',
    plan2F5: 'API access',
    plan2Cta: 'Get Pro',
    plan3Name: 'Premium',
    plan3Price: '৳699',
    plan3Period: '/month',
    plan3F1: 'All Pro features',
    plan3F2: 'GPT-4o + Claude',
    plan3F3: 'Dedicated support',
    plan3F4: 'Custom prompts',
    plan3F5: 'Team sharing',
    plan3Cta: 'Get Premium',
    paymentMethods: '💳 bKash · Nagad · Rocket · Bank Transfer accepted',

    // CTA
    ctaTitle: 'Start today,',
    ctaTitleHighlight: 'completely free',
    ctaSub: '7-day free trial. No credit card required.',
    ctaBtn: 'Register Now',

    // Footer
    footerMade: 'Made with 💚 in Bangladesh · © 2025 AI Shala',

    // Login page
    loginSubtitle: 'Sign in to your account',
    emailLabel: 'Email',
    emailPlaceholder: 'Your email',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Your password',
    loginBtn: 'Sign In',
    loggingIn: 'Signing in...',
    loginError: 'Failed to sign in',
    noAccount: "Don't have an account?",
    registerFree: 'Register for free',

    // Register page
    registerSubtitle: 'Create a free account',
    registerFreeTag: '7 days completely free',
    nameLabel: 'Your Name *',
    namePlaceholder: 'Enter your full name',
    emailReq: 'Email *',
    phoneLabel: 'Mobile Number (optional)',
    phonePlaceholder: '01XXXXXXXXX',
    passwordReq: 'Password *',
    passwordMin: 'At least 6 characters',
    confirmPassword: 'Confirm Password *',
    confirmPlaceholder: 'Re-enter your password',
    registerBtn: 'Create Account',
    registering: 'Creating account...',
    pwMismatch: 'Passwords do not match',
    pwTooShort: 'Password must be at least 6 characters',
    registerError: 'Registration failed',
    haveAccount: 'Already have an account?',
    loginLink: 'Sign in',

    // Layout / Sidebar
    sidebarChat: 'AI Chat',
    sidebarImage: 'Image Gen',
    sidebarTools: 'AI Tools',
    sidebarDashboard: 'Dashboard',
    sidebarPayment: 'Subscription',
    sidebarAdmin: 'Admin',
    sidebarLogout: 'Logout',
    subFree: 'Free',
    subPro: 'Pro',
    subPremium: 'Premium',
    loading: 'Loading...',

    // Chat page
    chatNewChat: 'New Chat',
    chatNoConvs: 'No conversations',
    chatWelcome: 'Welcome to AI Shala!',
    chatWelcomeSub: 'Start a new chat or use an example below',
    chatPrompt1: 'Write a story in Bangla',
    chatPrompt2: 'Write Python code for me',
    chatPrompt3: 'Help me create my CV',
    chatPrompt4: 'Translate this text to Bangla',
    chatToday: "Today's Usage",
    chatSendError: 'Failed to send message',
    chatPlaceholder: 'Type a message...',

    // Image page
    imageTitle: 'AI Image Generation',
    imagePlaceholder: 'Describe the image you want...',
    imageGenerateBtn: 'Generate Image',
    imageGenerating: 'Generating...',
    imageStyleLabel: 'Style',
    imageSizeLabel: 'Size',
    imageSubtitle: 'Create images completely free with Pollinations.ai',
    imageTodayCount: "Today's images",
    imageGetUnlimited: 'Get unlimited',
    imageGeneratingMsg: 'Generating image...',
    imageTimeSec: '10-30 seconds',
    imagePlaceholderMsg: 'Your image will appear here',
    imageHistory: 'Previous Images',
    imageLimitReached: 'Daily limit reached',
    imageStyleRealistic: 'Realistic',
    imageStyleAnime: 'Anime',
    imageStyleCartoon: 'Cartoon',
    imageStyleOilPainting: 'Oil Painting',
    imageStyleWatercolor: 'Watercolor',
    imageStyleDigitalArt: 'Digital Art',
    imageStyleSketch: 'Sketch',
    imageStyleBangladeshi: 'Bangladeshi',
    imageSizeSquare: 'Square',
    imageSizeLandscape: 'Landscape',
    imageSizePortrait: 'Portrait',

    // Tools page
    toolsTitle: 'AI Tools',
    toolsAllCats: 'All',
    toolSelectPrompt: 'Select a tool from the left',
    toolInputLabel: 'Enter your input',
    toolInputPlaceholder: 'Enter your text here...',
    toolRunning: 'Running...',
    toolRun: 'Run Tool',
    toolResult: 'Result',
    toolCopied: 'Copied!',
    toolCopy: 'Copy',
    toolError: 'Failed to run tool',
    toolGetPro: 'Get Pro',
    toolTranslateTo: 'Translate to',
    toolCodeLang: 'Programming Language',
    toolPlatform: 'Platform',
    toolQuestionCount: 'Number of questions',
    toolQuestions: 'questions',

    // Dashboard
    dashTitle: 'My Dashboard',
    dashTodayUsage: "Today's Usage",
    dashProfile: 'Profile',
    dashPayments: 'Recent Payments',
    dashWelcome: 'Welcome,',
    dashFreeTrial: 'Free trial active',
    dashDaysLeft: 'days left',
    dashUpgrade: 'Upgrade',
    dashSubscriptionLabel: 'Subscription',
    dashRenew: 'Renew',
    dashAIMessages: 'AI Messages',
    dashImagesLabel: 'Images',
    dashToolsLabel: 'Tools',
    dashUpgradeLabel: 'Upgrade',
    dashChatNow: 'Chat now',
    dashGenerate: 'Generate',
    dashUseNow: 'Use now',
    dashViewPlans: 'View plans',
    dashUnlimited: 'Unlimited',
    dashNearLimit: 'Approaching limit. Upgrade today!',
    dashGetPro: 'Get Pro',
    dashMobile: 'Mobile',
    dashPlan: 'Plan',
    dashJoined: 'Joined',
    dashSave: 'Save',
    dashCancel: 'Cancel',
    dashNoPayments: 'No payments yet',

    // Pricing page
    pricingPageTitle: 'The Right Plan For You',
    pricingPageSub: 'Pay instantly with bKash, Nagad, Rocket. No credit card needed.',
    pricingPageBadge: 'Simple pricing, Bangladeshi payments',
    pricingCurrentPlan: 'Current plan:',
    pricingMostPopular: 'Most Popular',
    pricingFreeLabel: 'Free',
    pricingCurrentPlanBtn: 'Current Plan',
    pricingStartFree: 'Start Free',
    pricingPayNow: 'Pay Now',
    pricingPaymentTitle: 'Accepted Payment Methods',
    pricingPaymentNote: 'After payment, submit your transaction ID and your account will be upgraded within',
    pricingPaymentNoteHighlight: '2–24 hours',
    pricingPaymentNoteEnd: '',
    pricingFaqTitle: 'FAQ',
    pricingGotoDash: 'Go to Dashboard',
    pricingActive: 'Active',
    pricingMonthSuffix: '/month',
  },
}

type Translations = typeof translations.bn
type TranslationKey = keyof Translations

interface LanguageContextType {
  lang: Lang
  t: Translations
  toggle: () => void
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  t: translations.en,
  toggle: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('ai_shala_lang') as Lang) || 'en'
  })

  const toggle = () => {
    setLang(prev => {
      const next = prev === 'bn' ? 'en' : 'bn'
      localStorage.setItem('ai_shala_lang', next)
      return next
    })
  }

  useEffect(() => {
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en'
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggle }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}

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
    heroSub: '৪০+ ফ্রি AI মডেল, ছবি তৈরি, ২০+ টুলস — সম্পূর্ণ বাংলায়।',
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
    feat1Desc: '৪০+ ফ্রি AI মডেল দিয়ে চ্যাট করুন। LLaMA, Gemini, Mistral সব এক জায়গায়।',
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
    modelsTitle: 'ফ্রি AI মডেলসমূহ',
    modelsSub: 'সব মডেল সম্পূর্ণ বিনামূল্যে ব্যবহার করুন',
    modelsMore: 'এবং আরো ৩০+ মডেল...',
    modelBadgeFree: 'ফ্রি',

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
    chatTyping: 'টাইপ করছে...',
    chatCopy: 'কপি করুন',
    chatCopied: 'কপি হয়েছে!',
    chatDelete: 'মুছুন',
    chatUsageOf: 'এর মধ্যে',
    chatMessages: 'মেসেজ',
    chatImages: 'ছবি',

    // Image page
    imageTitle: 'AI ছবি তৈরি',
    imagePlaceholder: 'ছবির বিবরণ লিখুন...',
    imageGenerateBtn: 'ছবি তৈরি করুন',
    imageGenerating: 'তৈরি হচ্ছে...',
    imageStyleLabel: 'স্টাইল',
    imageSizeLabel: 'সাইজ',
    imageError: 'ছবি লোড হয়নি, আবার চেষ্টা করুন',

    // Tools page
    toolsTitle: 'AI টুলস',
    toolsAllCats: 'সব',

    // Dashboard
    dashTitle: 'আমার ড্যাশবোর্ড',
    dashTodayUsage: 'আজকের ব্যবহার',
    dashProfile: 'প্রোফাইল',
    dashPayments: 'সাম্প্রতিক পেমেন্ট',

    // Pricing page
    pricingPageTitle: 'আপনার জন্য সঠিক প্ল্যান',
    pricingPageSub: 'bKash, Nagad, Rocket দিয়ে মিনিটেই পেমেন্ট',
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
    heroSub: '40+ Free AI Models, Image Generation, 20+ Tools — fully in Bangla.',
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
    feat1Desc: 'Chat with 40+ free AI models. LLaMA, Gemini, Mistral — all in one place.',
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
    modelsTitle: 'Free AI Models',
    modelsSub: 'Use all models completely free of charge',
    modelsMore: 'And 30+ more models...',
    modelBadgeFree: 'Free',

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
    chatTyping: 'Typing...',
    chatCopy: 'Copy',
    chatCopied: 'Copied!',
    chatDelete: 'Delete',
    chatUsageOf: 'of',
    chatMessages: 'messages',
    chatImages: 'images',

    // Image page
    imageTitle: 'AI Image Generation',
    imagePlaceholder: 'Describe the image you want...',
    imageGenerateBtn: 'Generate Image',
    imageGenerating: 'Generating...',
    imageStyleLabel: 'Style',
    imageSizeLabel: 'Size',
    imageError: 'Image failed to load, please try again',

    // Tools page
    toolsTitle: 'AI Tools',
    toolsAllCats: 'All',

    // Dashboard
    dashTitle: 'My Dashboard',
    dashTodayUsage: "Today's Usage",
    dashProfile: 'Profile',
    dashPayments: 'Recent Payments',

    // Pricing page
    pricingPageTitle: 'The Right Plan For You',
    pricingPageSub: 'Pay instantly with bKash, Nagad, Rocket',
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
  lang: 'bn',
  t: translations.bn,
  toggle: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('ai_shala_lang') as Lang) || 'bn'
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

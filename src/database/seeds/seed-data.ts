/**
 * Анхны өгөгдөл — kueneree / kueneere-admin дээрх mock өгөгдлөөс авав.
 * Seed давтан ажиллуулахад давхардахгүй (slug / name / channel-аар шалгана).
 */
export const CATEGORIES = [
  { slug: 'headwear', name: 'МАЛГАЙ', position: 1, en: 'HEADWEAR', ko: '모자' },
  { slug: 'tops', name: 'ДЭЭД ХУВЦАС', position: 2, en: 'TOPS', ko: '상의' },
  {
    slug: 'bottoms',
    name: 'ДООД ХУВЦАС',
    position: 3,
    en: 'BOTTOMS',
    ko: '하의',
  },
  {
    slug: 'footwear-bags',
    name: 'ГУТАЛ ЦҮНХ',
    position: 4,
    en: 'FOOTWEAR & BAGS',
    ko: '신발 & 가방',
  },
  {
    slug: 'accessories',
    name: 'ГОЁЛЫН ХЭРЭГСЭЛ',
    position: 5,
    en: 'ACCESSORIES',
    ko: '액세서리',
  },
];

const FIT_MN =
  'Өдөр бүр өмсөхөд тохиромжтой, сул эсгүүртэй зузаан давхарга. Хүйтэн шөнө, харих урт алхалтад зориулав.';
const FIT_EN =
  'Relaxed fit with a heavyweight feel, designed for cold nights and long walks home.';
const FIT_KO =
  '매일 착용하기 좋은 여유로운 핏의 헤비웨이트 소재. 차가운 밤, 긴 귀갓길을 위해 디자인되었습니다.';
const BODY_MN =
  'Улаанбаатарт зохион бүтээв. Хязгаарлагдмал тоо. Монгол даяар болон дэлхий даяар манай урлангаас хүргэнэ.';
const BODY_EN =
  'Designed in Ulaanbaatar. Limited run. Ships worldwide from our studio in Mongolia.';
const BODY_KO =
  '울란바토르에서 디자인. 한정 수량. 몽골 스튜디오에서 전 세계 배송.';

const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export const PRODUCTS = [
  {
    slug: 'camo-star-trucker',
    category: 'headwear',
    name: 'Одтой Камо Малгай',
    color: 'ОЛИВЫН КАМО',
    colorHex: '#5b5e3c',
    price: 89000,
    mainImage: '/images/khulan/IMG_121048_0.jpg',
    images: [
      '/images/khulan/IMG_121048_0.jpg',
      '/images/khulan/IMG_094327_0.jpg',
    ],
    sizes: ['OS'],
    isFeatured: true,
    position: 1,
    en: { name: 'Star Camo Cap', color: 'OLIVE CAMO' },
    ko: { name: '스타 카모 캡', color: '올리브 카모' },
  },
  {
    slug: 'heavy-zip-hoodie',
    category: 'tops',
    name: 'Зузаан Цахилгаантай Худди',
    color: 'БЕТОН СААРАЛ',
    colorHex: '#8a8a86',
    price: 189000,
    mainImage: '/images/khulan/IMG_2777.jpg',
    images: ['/images/khulan/IMG_2777.jpg', '/images/khulan/IMG_094327_0.jpg'],
    sizes: APPAREL_SIZES,
    isFeatured: true,
    position: 2,
    en: { name: 'Heavy Zip Hoodie', color: 'CONCRETE GREY' },
    ko: { name: '헤비 집업 후디', color: '콘크리트 그레이' },
  },
  {
    slug: 'ribbed-cami',
    category: 'tops',
    name: 'Сүлжмэл Топ',
    color: 'ХАР',
    colorHex: '#111111',
    price: 79000,
    mainImage: '/images/khulan/IMG_2780.jpg',
    images: ['/images/khulan/IMG_2780.jpg', '/images/khulan/IMG_094327_0.jpg'],
    sizes: APPAREL_SIZES,
    isFeatured: true,
    position: 3,
    en: { name: 'Ribbed Cami', color: 'BLACK' },
    ko: { name: '립드 캐미', color: '블랙' },
  },
  {
    slug: 'wide-leg-sweatpant',
    category: 'bottoms',
    name: 'Өргөн Шуумагтай Өмд',
    color: 'ХАР',
    colorHex: '#111111',
    price: 159000,
    mainImage: '/images/khulan/IMG_2782.jpg',
    images: ['/images/khulan/IMG_2782.jpg', '/images/khulan/IMG_094327_0.jpg'],
    sizes: APPAREL_SIZES,
    isFeatured: true,
    position: 4,
    en: { name: 'Wide Leg Sweatpant', color: 'BLACK' },
    ko: { name: '와이드 레그 스웨트팬츠', color: '블랙' },
  },
].map((p) => ({
  ...p,
  fitNote: FIT_MN,
  details: BODY_MN,
  care: BODY_MN,
  dropName: 'DROP 01 — FW 26',
  translations: {
    en: { ...p.en, fitNote: FIT_EN, details: BODY_EN, care: BODY_EN },
    ko: { ...p.ko, fitNote: FIT_KO, details: BODY_KO, care: BODY_KO },
  },
}));

export const CAMPAIGNS = [
  {
    name: 'Q1 Brand Awareness Push',
    status: 'live',
    spend: 12450,
    impressions: 892000,
    clicks: 37464,
    conversions: 1424,
    revenue: 52290,
    channel: 'Meta Ads',
    startDate: '2026-01-01',
    endDate: '2026-02-15',
    budget: 50000,
  },
  {
    name: 'Product Launch - Series X',
    status: 'live',
    spend: 8920,
    impressions: 456000,
    clicks: 31008,
    conversions: 1178,
    revenue: 40140,
    channel: 'Google Ads',
    startDate: '2026-01-10',
    endDate: '2026-02-28',
    budget: 75000,
  },
  {
    name: 'Retargeting - Cart Abandoners',
    status: 'live',
    spend: 3240,
    impressions: 234000,
    clicks: 7254,
    conversions: 290,
    revenue: 11664,
    channel: 'Meta Ads',
    startDate: '2026-01-05',
    endDate: '2026-03-31',
    budget: 25000,
  },
  {
    name: 'Spring Sale Promotion',
    status: 'scheduled',
    spend: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    revenue: 0,
    channel: 'TikTok Ads',
    startDate: '2026-02-15',
    endDate: '2026-03-15',
    budget: 40000,
  },
  {
    name: 'Influencer Partnership - Wave 2',
    status: 'paused',
    spend: 5670,
    impressions: 312000,
    clicks: 24648,
    conversions: 520,
    revenue: 17577,
    channel: 'YouTube',
    startDate: '2026-01-15',
    endDate: '2026-02-28',
    budget: 60000,
  },
  {
    name: 'Holiday Campaign 2025',
    status: 'ended',
    spend: 45000,
    impressions: 2100000,
    clicks: 88200,
    conversions: 3800,
    revenue: 189000,
    channel: 'Multi-channel',
    startDate: '2025-11-01',
    endDate: '2025-12-31',
    budget: 45000,
  },
  {
    name: 'Email Nurture Sequence',
    status: 'live',
    spend: 2340,
    impressions: 156000,
    clicks: 13104,
    conversions: 690,
    revenue: 16380,
    channel: 'Email',
    startDate: '2026-01-01',
    endDate: '2026-04-30',
    budget: 15000,
  },
];

export const ASSETS = [
  {
    name: 'Hero Banner - After Dark',
    type: 'image',
    url: '/images/khulan/IMG_2841.jpg',
    impressions: 892000,
    engagement: 8.5,
    ctr: 4.2,
    campaign: 'Q1 Brand Awareness Push',
    size: 'large',
  },
  {
    name: 'Lookbook Shoot - Night Shift',
    type: 'video',
    url: '/images/khulan/IMG_2855.jpg',
    impressions: 456000,
    engagement: 12.3,
    ctr: 6.8,
    campaign: 'Product Launch - Series X',
    size: 'medium',
  },
  {
    name: 'Camo Cap Close-up',
    type: 'image',
    url: '/images/khulan/IMG_121048_0.jpg',
    impressions: 234000,
    engagement: 6.2,
    ctr: 3.1,
    campaign: 'Retargeting - Cart Abandoners',
    size: 'small',
  },
  {
    name: 'Hoodie Flat Lay',
    type: 'image',
    url: '/images/khulan/IMG_2777.jpg',
    impressions: 678000,
    engagement: 9.8,
    ctr: 5.5,
    campaign: 'Spring Sale Promotion',
    size: 'small',
  },
  {
    name: 'Street Portrait Video',
    type: 'video',
    url: '/images/khulan/khulan-portrait.jpg',
    impressions: 312000,
    engagement: 15.2,
    ctr: 7.9,
    campaign: 'Influencer Partnership - Wave 2',
    size: 'medium',
  },
  {
    name: 'Wide Leg Campaign Shot',
    type: 'image',
    url: '/images/khulan/IMG_2782.jpg',
    impressions: 189000,
    engagement: 5.4,
    ctr: 2.8,
    campaign: 'Email Nurture Sequence',
    size: 'small',
  },
];

export const SEGMENTS = [
  {
    name: 'High-Value Customers',
    size: 12500,
    growth: 12.5,
    engagement: 8.2,
    ltv: 450000,
    engagementLevel: 'high',
  },
  {
    name: 'Active Browsers',
    size: 45000,
    growth: 25.8,
    engagement: 4.1,
    ltv: 120000,
    engagementLevel: 'medium',
  },
  {
    name: 'Cart Abandoners',
    size: 8200,
    growth: -3.2,
    engagement: 4.5,
    ltv: 85000,
    engagementLevel: 'low',
  },
  {
    name: 'New Visitors',
    size: 67000,
    growth: 25.8,
    engagement: 2.1,
    ltv: 45000,
    engagementLevel: 'medium',
  },
  {
    name: 'Loyal Repeat Buyers',
    size: 5600,
    growth: 8.4,
    engagement: 11.3,
    ltv: 680000,
    engagementLevel: 'high',
  },
];

export const CHANNEL_BUDGETS = [
  { channel: 'Meta Ads', allocated: 120000, spent: 78500 },
  { channel: 'Google Ads', allocated: 95000, spent: 62300 },
  { channel: 'TikTok Ads', allocated: 45000, spent: 12800 },
  { channel: 'YouTube', allocated: 60000, spent: 38200 },
  { channel: 'Email', allocated: 15000, spent: 8900 },
  { channel: 'Display', allocated: 30000, spent: 18400 },
];

export const BUDGET = { totalBudget: 365000, dailyBudget: 35000 };

export const TRANSACTIONS = [
  {
    description: 'Meta Ads - Q1 Campaign',
    amount: -12450,
    channel: 'Meta Ads',
    daysAgo: 0,
  },
  {
    description: 'Google Ads - Product Launch',
    amount: -8920,
    channel: 'Google Ads',
    daysAgo: 0,
  },
  { description: 'Budget Top-up', amount: 50000, channel: null, daysAgo: 1 },
  {
    description: 'TikTok Ads - Test Campaign',
    amount: -3200,
    channel: 'TikTok Ads',
    daysAgo: 5,
  },
  {
    description: 'YouTube Influencer Payment',
    amount: -5600,
    channel: 'YouTube',
    daysAgo: 7,
  },
];

/** Shop the Look — x/y нь зургийн жинхэнэ харьцаан дээрх % */
export const LOOKS = [
  {
    title: 'LOOK 001 — HOOD UP',
    translations: {
      en: { title: 'LOOK 001 — HOOD UP' },
      ko: { title: 'LOOK 001 — 후드 업' },
    },
    imageUrl: '/images/khulan/IMG_2840.jpg',
    imageWidth: 3024,
    imageHeight: 4032,
    bundleDiscountPercent: 10,
    items: [
      { slug: 'camo-star-trucker', x: 50, y: 28 },
      { slug: 'heavy-zip-hoodie', x: 22, y: 75 },
    ],
  },
  {
    title: 'LOOK 002 — NIGHT SHIFT',
    translations: {
      en: { title: 'LOOK 002 — NIGHT SHIFT' },
      ko: { title: 'LOOK 002 — 나이트 시프트' },
    },
    imageUrl: '/images/khulan/IMG_2855.jpg',
    imageWidth: 3024,
    imageHeight: 4032,
    bundleDiscountPercent: 10,
    items: [
      { slug: 'camo-star-trucker', x: 41, y: 36 },
      { slug: 'ribbed-cami', x: 42, y: 55 },
      { slug: 'wide-leg-sweatpant', x: 48, y: 82 },
    ],
  },
  {
    title: 'LOOK 003 — CONCRETE',
    translations: {
      en: { title: 'LOOK 003 — CONCRETE' },
      ko: { title: 'LOOK 003 — 콘크리트' },
    },
    imageUrl: '/images/khulan/IMG_2841.jpg',
    imageWidth: 3024,
    imageHeight: 4032,
    bundleDiscountPercent: 0,
    items: [
      { slug: 'camo-star-trucker', x: 49, y: 35 },
      { slug: 'heavy-zip-hoodie', x: 60, y: 78 },
    ],
  },
];

/** Нүүр хуудасны контент (admin → Контент хэсгээс засна) */
export const SITE_CONTENT: Record<string, Record<string, unknown>> = {
  hero: {
    image: '/images/khulan/IMG_2774.jpg',
    eyebrow: 'ULAANBAATAR / 47.918° N / 106.917° E',
    titleLine1: 'AFTER',
    titleLine2: 'DARK',
    dropLabel: 'DROP 01 — FW 26',
    frameLabel: 'FRAME 001 / 024',
    i18n: {
      mn: { subtitle: 'ХЯЗГААРЛАГДМАЛ ТОО / WORLDWIDE', cta: 'ДРОПЫГ ҮЗЭХ' },
      en: { subtitle: 'LIMITED UNITS / WORLDWIDE', cta: 'VIEW DROP' },
      ko: { subtitle: '한정 수량 / 전세계 배송', cta: '드롭 보기' },
    },
  },
  ticker: {
    i18n: {
      mn: {
        text: '★ УЛААНБААТАРТ ҮНЭГҮЙ ХҮРГЭЛТ ★ ШИНЭ ДРОП ★ ХЯЗГААРЛАГДМАЛ ТОО',
      },
      en: { text: '★ FREE DELIVERY IN ULAANBAATAR ★ NEW DROP ★ LIMITED UNITS' },
      ko: { text: '★ 울란바토르 무료 배송 ★ 새 드롭 ★ 한정 수량' },
    },
  },
  campaign: {
    titleLine1: 'NIGHT',
    titleLine2: 'SHIFT',
    image1: '/images/khulan/IMG_2841.jpg',
    image2: '/images/khulan/IMG_2855.jpg',
    i18n: {
      mn: { date: 'УЛААНБААТАР, МОНГОЛ\nАРАВДУГААР САР 2026' },
      en: { date: 'ULAANBAATAR, MONGOLIA\nOCTOBER 2026' },
      ko: { date: '몽골, 울란바토르\n2026년 10월' },
    },
  },
  community: {
    hashtag: '#AFTERDARK',
    i18n: {
      mn: { text: 'ОНЦЛОГДОХЫН ТУЛД @KUENEREE ТЭМДЭГЛЭЭРЭЙ' },
      en: { text: 'TAG @KUENEREE TO BE FEATURED' },
      ko: { text: '@KUENEREE 태그하고 피처드 되세요' },
    },
  },
  newsletter: {
    i18n: {
      mn: { heading: 'ДАРААГИЙН ДРОПЫН\nУРЬДЧИЛСАН ЭРХЭЭ АВААРАЙ.' },
      en: { heading: 'GET EARLY ACCESS\nTO THE NEXT DROP.' },
      ko: { heading: '다음 드롭\n얼리 액세스 받기.' },
    },
  },
};

/* ================= i18n ================= */
export const LANGS = ['ru', 'ro', 'en'];
export const DEFAULT_LANG = 'en';

export function detectLang() {
  try {
    const saved = localStorage.getItem('cc_lang');
    if (saved && LANGS.includes(saved)) return saved;
  } catch { /* ignore */ }
  return DEFAULT_LANG;
}

const PROJECTS_I18N = [
  { tags: { en: 'Banking Platform · Product Design', ru: 'Банковская платформа · Продуктовый дизайн', ro: 'Platformă bancară · Product Design' } },
  { tags: { en: 'Healthcare Platform · Product Design', ru: 'Платформа здравоохранения · Продуктовый дизайн', ro: 'Platformă medicală · Product Design' } },
  { tags: { en: 'iOS App · Product & UX/UI', ru: 'iOS-приложение · Продукт и UX/UI', ro: 'Aplicație iOS · Product & UX/UI' } },
  { tags: { en: 'Agency Website · UX/UI', ru: 'Сайт агентства · UX/UI', ro: 'Site de agenție · UX/UI' } },
  { tags: { en: 'E-Commerce · UX/UI', ru: 'Интернет-магазин · UX/UI', ro: 'E-Commerce · UX/UI' } },
  { tags: { en: 'E-Commerce · UX/UI', ru: 'Интернет-магазин · UX/UI', ro: 'E-Commerce · UX/UI' } },
  { tags: { en: 'E-Commerce · UX/UI', ru: 'Интернет-магазин · UX/UI', ro: 'E-Commerce · UX/UI' } },
  { tags: { en: 'Android App · Branding & UX/UI', ru: 'Android-приложение · Брендинг и UX/UI', ro: 'Aplicație Android · Branding & UX/UI' } },
  { tags: { en: 'UX/UI Design', ru: 'UX/UI дизайн', ro: 'Design UX/UI' } },
  { tags: { en: 'Pets App · UX/UI', ru: 'Приложение для питомцев · UX/UI', ro: 'Aplicație pentru animale de companie · UX/UI' } },
  { name: { en: 'Logos for Business', ru: 'Логотипы для бизнеса', ro: 'Logo-uri pentru afaceri' }, tags: { en: 'Branding · Logos', ru: 'Брендинг · Логотипы', ro: 'Branding · Logo-uri' } },
  { tags: { en: 'Branding · Logos', ru: 'Брендинг · Логотипы', ro: 'Branding · Logo-uri' } }
];

export function projectName(p, lang) {
  return (p.i18n && p.i18n.name && p.i18n.name[lang]) || p.name;
}
export function projectTags(p, lang) {
  return (p.i18n && p.i18n.tags && p.i18n.tags[lang]) || p.tags;
}
export { PROJECTS_I18N };

const en = {
  meta: {
    title: 'Cookiekiller — UX/UI Designer',
    description: "Senior UX/UI & Product Designer. I turn complex product logic into interfaces that convert. Chisinau → worldwide."
  },
  city: 'Chisinau',
  header: { openToWork: 'Open to work', menu: 'Menu', close: 'Close', home: 'Home', language: 'Language', mainNav: 'Main navigation' },
  loader: { tag: 'cookiekiller.design — portfolio 2026' },
  nav: {
    work: { label: 'Work', n: '12 projects · 2018—2026', desc: 'Selected case studies — e-commerce, CRM, mobile.' },
    about: { label: 'About', n: 'The short version', desc: "Who's behind the screen, in a few lines." },
    capabilities: { label: 'Capabilities', n: 'Stacked, like my sprints', desc: 'Product & UX, UI systems, branding, and the AI stack that keeps it fast.' },
    experience: { label: 'Experience', n: '2018 → now', desc: 'Senior UX/UI at Zazitex SRL, lecturing at IT STEP Academy.' },
    contact: { label: 'Contact', n: 'Say hello', desc: "Got a messy flow? A leaky funnel? Let's kill it together." }
  },
  menuFoot: { location: 'Chisinau, MD → Worldwide' },
  hero: {
    line1: 'I KILL', line2: 'BAD UX', line3: 'FOR A LIVING',
    subPre: 'I turn complex product logic — ',
    subBold: 'CRM architecture, marketplaces, checkout funnels',
    subPost: ' — into interfaces people actually finish using. 5+ years shipping for international clients.'
  },
  marquee: ['Product Design', 'UX Research', 'Design Systems', 'E-Commerce', 'CRM Architecture', 'Conversion Optimization', 'Branding', 'Mobile Apps'],
  status: { live: 'Live', dev: 'In dev', case: 'Case study' },
  work: {
    eyebrow: 'Selected Work', count: '12 projects · 2018—2026',
    more: 'Full archive on Behance',
    viewCase: 'View case study', viewBehance: 'View on Behance'
  },
  about: {
    eyebrow: 'About', count: 'The short version',
    statementPre: "Design isn't decoration. It's ",
    statementEm: 'logic you can click',
    statementPost: ' — and I build it end-to-end: discovery, systems, prototypes, delivery.',
    p1Pre: 'I specialise in products where the flows are messy and the stakes are real: ',
    p1Bold: 'banking platforms, healthcare, marketplaces, closed CRM systems for 50+ internal users.',
    p2: 'By day I ship at Zazitex. By night I lecture UX/UI Design, Design Thinking and Product Strategy at IT STEP Academy — because explaining design out loud keeps my own thinking honest.',
    p3: 'English B2 · Russian native · Romanian fluent.',
    stats: ['Years in product design', 'Products shipped', 'Brands designed', 'Adobe certifications']
  },
  capabilities: {
    eyebrow: 'Capabilities', count: 'Stacked, like my sprints',
    decks: [
      { top1: 'A — Product & UX', top2: 'Where I start', h3: 'Product & UX Design', items: ['User Flows', 'Information Architecture', 'MVP Design', 'A/B Testing', 'Conversion Optimization', 'UX Research', 'Usability Testing', 'Wireframing'] },
      { top1: 'B — UI & Systems', top2: 'Where it scales', h3: 'UI & Design Systems', items: ['Design Systems', 'Prototyping', 'Responsive Design', 'Accessibility', 'Web · iOS · Android', 'Design-to-dev handoff'] },
      { top1: 'C — Brand', top2: 'Where it gets a face', h3: 'Branding & Visual', items: ['Identity Systems', 'Rebranding', 'Packaging', 'Motion & Visual Communication', 'Print & Digital'] },
      { top1: 'D — Stack', top2: 'Where it gets fast', h3: 'Tools & AI Stack', items: ['Figma', 'Adobe CC', 'Miro', 'Notion', 'Jira', 'Midjourney', 'Sora', 'ChatGPT', 'Real-ESRGAN'] }
    ]
  },
  experience: {
    eyebrow: 'Experience', count: '2018 → now',
    rows: [
      { when: 'Jun 2024 — Present', now: true, role: 'Senior UX/UI & Product Designer', org: 'Zazitex SRL', desc: 'End-to-end UX/UI for e-commerce platforms and internal systems. Architected closed CRM logic from scratch — data models, navigation, role-based access for 50+ users. Reduced checkout friction through IA restructuring and progressive disclosure. Mentoring juniors, running UX workshops.' },
      { when: 'Jun 2024 — Present', now: true, role: 'Lecturer, UX/UI Design', org: 'IT STEP Academy', desc: 'Teaching UX/UI Design, Design Thinking and Product Strategy. Guiding students through research, prototyping and usability testing on real client projects.' },
      { when: 'Dec 2022 — Jan 2024', now: false, role: 'Middle UX/UI Designer', org: 'Yucatech Software SRL · Hostry.com · Lycaste.com', desc: 'Redesigned core e-commerce flows, improved onboarding and cut drop-off at key conversion points. Built a multi-platform design system (web + iOS + Android) across 3 products. Shipped a VPN app: onboarding, settings architecture, subscription flows.' },
      { when: 'Dec 2021 — Dec 2022', now: false, role: 'Middle Graphic Designer', org: 'Art Poligraf SRL', desc: 'Brand identity and packaging for clients across Moldova and EU markets; visual communication across print and digital campaigns.' },
      { when: '2018 — 2021', now: false, role: 'Junior Graphic Designer', org: 'Sonaris-com Advertising Agency · Freelance', desc: 'Brand identities and digital ads for 20+ SMEs and startups; UI layouts for early-stage e-commerce products.' }
    ],
    certsEyebrow: 'Certifications', certsCount: 'Verified via Certiport',
    certs: ['Adobe Certified Professional — Visual Design', 'ACP — Visual Design · Photoshop CC', 'ACP — Graphic Design · Illustrator', 'ACP — Print & Digital Media · InDesign']
  },
  special: {
    tickerVet: 'Strays get a discount', tickerMetal: 'Riffs get a deal',
    vetTitle: 'Animal Rescue & Vet Volunteers',
    vetDesc: 'Shelters and rescues get pro-bono or cost-only rates — sites, adoption flows and donation pages built to actually convert.',
    vetCta: 'Tell me about your shelter', vetCursor: 'Woof-approved rate',
    metalTitle: 'Metal Bands & Labels',
    metalDesc: "Flat rate, revenue split, or vinyl toward the invoice — album art, merch stores and sites that don't embarrass the music.",
    metalCta: 'Book the slot', metalCursor: 'Full send rate'
  },
  footer: {
    eyebrow: 'Got a messy flow? A leaky funnel? A CRM nobody can use?',
    ctaPre: "Let's ", ctaSwap: 'kill it', ctaPost: ' together.',
    formTrigger: 'Leave a request',
    fineSuffix: 'Chisinau time'
  },
  form: {
    title: 'Leave a request', sub: "Fill it in — I'll get back within a day, usually faster.",
    nameLabel: 'Name', namePlaceholder: 'Your name',
    emailLabel: 'Email', emailPlaceholder: 'you@company.com',
    msgLabel: 'What are we killing?', msgPlaceholder: 'Project, budget range, timeline…',
    submit: 'Send the brief', note: 'Opens your email app with everything filled in.',
    thanksTitle: 'Thanks for reaching out!',
    thanksSub: "Got your message — I'll get back to you soon, usually within a day.",
    close: 'Close'
  }
};

const ru = {
  meta: {
    title: 'Cookiekiller — UX/UI дизайнер',
    description: 'Senior UX/UI & Product дизайнер. Превращаю сложную бизнес-логику продукта в интерфейсы, которые конвертят. Кишинёв → весь мир.'
  },
  city: 'Кишинёв',
  header: { openToWork: 'Открыт для работы', menu: 'Меню', close: 'Закрыть', home: 'Главная', language: 'Язык', mainNav: 'Основная навигация' },
  loader: { tag: 'cookiekiller.design — портфолио 2026' },
  nav: {
    work: { label: 'Работы', n: '12 проектов · 2018—2026', desc: 'Избранные кейсы — e-commerce, CRM, мобильные приложения.' },
    about: { label: 'Обо мне', n: 'Коротко', desc: 'Кто по ту сторону экрана — в двух словах.' },
    capabilities: { label: 'Компетенции', n: 'Собрано, как мои спринты', desc: 'Product & UX, UI-системы, брендинг и AI-стек, который держит скорость.' },
    experience: { label: 'Опыт', n: '2018 → сейчас', desc: 'Senior UX/UI в Zazitex SRL, преподаю в IT STEP Academy.' },
    contact: { label: 'Контакты', n: 'Написать', desc: 'Кривой флоу? Дырявая воронка? Убьём это вместе.' }
  },
  menuFoot: { location: 'Кишинёв, Молдова → весь мир' },
  hero: {
    line1: 'Я УБИВАЮ', line2: 'ПЛОХОЙ UX', line3: 'ПРОФЕССИОНАЛЬНО',
    subPre: 'Я превращаю сложную бизнес-логику продукта — ',
    subBold: 'архитектуру CRM, маркетплейсы, воронки оформления заказа',
    subPost: ' — в интерфейсы, которыми реально пользуются до конца. 5+ лет опыта с международными клиентами.'
  },
  marquee: ['Продуктовый дизайн', 'UX-исследования', 'Дизайн-системы', 'E-Commerce', 'CRM-архитектура', 'Оптимизация конверсии', 'Брендинг', 'Мобильные приложения'],
  status: { live: 'Работает', dev: 'В разработке', case: 'Кейс' },
  work: {
    eyebrow: 'Избранные работы', count: '12 проектов · 2018—2026',
    more: 'Полный архив на Behance',
    viewCase: 'Смотреть кейс', viewBehance: 'Смотреть на Behance'
  },
  about: {
    eyebrow: 'Обо мне', count: 'Коротко',
    statementPre: 'Дизайн — это не украшательство. Это ',
    statementEm: 'логика, по которой можно кликнуть',
    statementPost: ' — и я строю её полностью: исследование, системы, прототипы, сдача.',
    p1Pre: 'Я специализируюсь на продуктах, где флоу запутанные, а ставки реальные: ',
    p1Bold: 'банковские платформы, здравоохранение, маркетплейсы, закрытые CRM-системы для 50+ внутренних пользователей.',
    p2: 'Днём я делаю продукты в Zazitex. Вечером преподаю UX/UI дизайн, дизайн-мышление и продуктовую стратегию в IT STEP Academy — потому что объяснять дизайн вслух держит собственное мышление честным.',
    p3: 'Английский B2 · Русский родной · Румынский свободно.',
    stats: ['Лет в продуктовом дизайне', 'Продуктов запущено', 'Брендов разработано', 'Сертификатов Adobe']
  },
  capabilities: {
    eyebrow: 'Компетенции', count: 'Собрано, как мои спринты',
    decks: [
      { top1: 'A — Продукт и UX', top2: 'С чего я начинаю', h3: 'Продукт и UX дизайн', items: ['Пользовательские флоу', 'Информационная архитектура', 'MVP-дизайн', 'A/B-тестирование', 'Оптимизация конверсии', 'UX-исследования', 'Юзабилити-тестирование', 'Вайрфрейминг'] },
      { top1: 'B — UI и системы', top2: 'Где это масштабируется', h3: 'UI и дизайн-системы', items: ['Дизайн-системы', 'Прототипирование', 'Адаптивный дизайн', 'Доступность', 'Web · iOS · Android', 'Передача в разработку'] },
      { top1: 'C — Бренд', top2: 'Где появляется лицо', h3: 'Брендинг и визуал', items: ['Айдентика', 'Ребрендинг', 'Упаковка', 'Моушн и визуальные коммуникации', 'Print и digital'] },
      { top1: 'D — Стек', top2: 'Где это ускоряется', h3: 'Инструменты и AI-стек', items: ['Figma', 'Adobe CC', 'Miro', 'Notion', 'Jira', 'Midjourney', 'Sora', 'ChatGPT', 'Real-ESRGAN'] }
    ]
  },
  experience: {
    eyebrow: 'Опыт', count: '2018 → сейчас',
    rows: [
      { when: 'Июнь 2024 — по наст. время', now: true, role: 'Senior UX/UI и продуктовый дизайнер', org: 'Zazitex SRL', desc: 'End-to-end UX/UI для e-commerce платформ и внутренних систем. Спроектировал закрытую CRM-логику с нуля — модели данных, навигация, ролевой доступ для 50+ пользователей. Снизил трение в чекауте за счёт реструктуризации IA и прогрессивного раскрытия информации. Менторю джунов, провожу UX-воркшопы.' },
      { when: 'Июнь 2024 — по наст. время', now: true, role: 'Преподаватель UX/UI дизайна', org: 'IT STEP Academy', desc: 'Преподаю UX/UI дизайн, дизайн-мышление и продуктовую стратегию. Провожу студентов через research, прототипирование и юзабилити-тестирование на реальных клиентских проектах.' },
      { when: 'Дек 2022 — Янв 2024', now: false, role: 'Middle UX/UI дизайнер', org: 'Yucatech Software SRL · Hostry.com · Lycaste.com', desc: 'Редизайн основных e-commerce флоу, улучшение онбординга и снижение оттока на ключевых точках конверсии. Построил мультиплатформенную дизайн-систему (web + iOS + Android) для 3 продуктов. Выпустил VPN-приложение: онбординг, архитектура настроек, флоу подписки.' },
      { when: 'Дек 2021 — Дек 2022', now: false, role: 'Middle графический дизайнер', org: 'Art Poligraf SRL', desc: 'Айдентика и упаковка для клиентов на рынках Молдовы и ЕС; визуальные коммуникации в print и digital кампаниях.' },
      { when: '2018 — 2021', now: false, role: 'Junior графический дизайнер', org: 'Sonaris-com Advertising Agency · Freelance', desc: 'Айдентика и digital-реклама для 20+ малых компаний и стартапов; UI-макеты для e-commerce продуктов на раннем этапе.' }
    ],
    certsEyebrow: 'Сертификаты', certsCount: 'Подтверждено через Certiport',
    certs: ['Adobe Certified Professional — Visual Design', 'ACP — Visual Design · Photoshop CC', 'ACP — Graphic Design · Illustrator', 'ACP — Print & Digital Media · InDesign']
  },
  special: {
    tickerVet: 'Бездомным — скидка', tickerMetal: 'Металлистам — скидка',
    vetTitle: 'Приютам и ветеринарам-волонтёрам',
    vetDesc: 'Приютам и спасательным организациям — pro bono или по себестоимости: сайты, флоу усыновления и страницы донатов, которые реально конвертят.',
    vetCta: 'Расскажите о своём приюте', vetCursor: 'Одобрено лапой',
    metalTitle: 'Метал-группам и лейблам',
    metalDesc: 'Фикс, доля от выручки или винил в счёт оплаты — обложки альбомов, merch-магазины и сайты, за которые не будет стыдно перед музыкой.',
    metalCta: 'Забронировать слот', metalCursor: 'На полной мощности'
  },
  footer: {
    eyebrow: 'Кривой флоу? Дырявая воронка? CRM, которым никто не пользуется?',
    ctaPre: 'Давайте ', ctaSwap: 'убьём это', ctaPost: ' вместе.',
    formTrigger: 'Оставить заявку',
    fineSuffix: 'время в Кишинёве'
  },
  form: {
    title: 'Оставить заявку', sub: 'Заполните форму — отвечу в течение дня, обычно быстрее.',
    nameLabel: 'Имя', namePlaceholder: 'Ваше имя',
    emailLabel: 'Email', emailPlaceholder: 'you@company.com',
    msgLabel: 'Что будем убивать?', msgPlaceholder: 'Проект, бюджет, сроки…',
    submit: 'Отправить бриф', note: 'Откроет почтовое приложение с готовым письмом.',
    thanksTitle: 'Спасибо, что написали!',
    thanksSub: 'Я получил ваше сообщение и свяжусь с вами в ближайшее время — обычно в течение дня.',
    close: 'Закрыть'
  }
};

const ro = {
  meta: {
    title: 'Cookiekiller — UX/UI Designer',
    description: 'Senior UX/UI & Product Designer. Transform logica complexă a produsului în interfețe care convertesc. Chișinău → în toată lumea.'
  },
  city: 'Chișinău',
  header: { openToWork: 'Disponibil pentru proiecte', menu: 'Meniu', close: 'Închide', home: 'Acasă', language: 'Limbă', mainNav: 'Navigare principală' },
  loader: { tag: 'cookiekiller.design — portofoliu 2026' },
  nav: {
    work: { label: 'Lucrări', n: '12 proiecte · 2018—2026', desc: 'Studii de caz selectate — e-commerce, CRM, mobil.' },
    about: { label: 'Despre mine', n: 'Pe scurt', desc: 'Cine e în spatele ecranului, pe scurt.' },
    capabilities: { label: 'Competențe', n: 'Organizate, ca sprinturile mele', desc: 'Product & UX, sisteme UI, branding și stack-ul AI care ține totul rapid.' },
    experience: { label: 'Experiență', n: '2018 → prezent', desc: 'Senior UX/UI la Zazitex SRL, predau la IT STEP Academy.' },
    contact: { label: 'Contact', n: 'Scrie-mi', desc: 'Ai un flow încurcat? Un funnel care pierde clienți? Hai să-l ucidem împreună.' }
  },
  menuFoot: { location: 'Chișinău, Moldova → în toată lumea' },
  hero: {
    line1: 'EU UCID', line2: 'UX-UL PROST', line3: 'CA MESERIE',
    subPre: 'Transform logica complexă a produsului — ',
    subBold: 'arhitectură CRM, marketplace-uri, fluxuri de checkout',
    subPost: ' — în interfețe pe care oamenii chiar le duc până la capăt. 5+ ani de experiență cu clienți internaționali.'
  },
  marquee: ['Product Design', 'Cercetare UX', 'Sisteme de design', 'E-Commerce', 'Arhitectură CRM', 'Optimizare conversii', 'Branding', 'Aplicații mobile'],
  status: { live: 'Activ', dev: 'În dezvoltare', case: 'Studiu de caz' },
  work: {
    eyebrow: 'Lucrări selectate', count: '12 proiecte · 2018—2026',
    more: 'Arhivă completă pe Behance',
    viewCase: 'Vezi studiul de caz', viewBehance: 'Vezi pe Behance'
  },
  about: {
    eyebrow: 'Despre mine', count: 'Pe scurt',
    statementPre: 'Design-ul nu e decorație. E ',
    statementEm: 'logică pe care poți da click',
    statementPost: ' — și o construiesc integral: research, sisteme, prototipuri, livrare.',
    p1Pre: 'Mă specializez pe produse unde fluxurile sunt complicate, iar mizele sunt reale: ',
    p1Bold: 'platforme bancare, sănătate, marketplace-uri, sisteme CRM închise pentru 50+ utilizatori interni.',
    p2: 'Ziua livrez produse la Zazitex. Seara predau UX/UI Design, Design Thinking și Product Strategy la IT STEP Academy — pentru că explicarea design-ului cu voce tare îmi ține gândirea onestă.',
    p3: 'Engleză B2 · Rusă maternă · Română fluent.',
    stats: ['Ani în product design', 'Produse livrate', 'Branduri create', 'Certificări Adobe']
  },
  capabilities: {
    eyebrow: 'Competențe', count: 'Organizate, ca sprinturile mele',
    decks: [
      { top1: 'A — Product & UX', top2: 'De unde încep', h3: 'Product & UX Design', items: ['User Flows', 'Arhitectura informației', 'Design MVP', 'Testare A/B', 'Optimizare conversii', 'Cercetare UX', 'Testare de uzabilitate', 'Wireframing'] },
      { top1: 'B — UI & Sisteme', top2: 'Unde se scalează', h3: 'UI & Design Systems', items: ['Sisteme de design', 'Prototipare', 'Design responsive', 'Accesibilitate', 'Web · iOS · Android', 'Predare către dezvoltare'] },
      { top1: 'C — Brand', top2: 'Unde capătă o față', h3: 'Branding & Visual', items: ['Sisteme de identitate', 'Rebranding', 'Ambalaje', 'Motion & comunicare vizuală', 'Print & Digital'] },
      { top1: 'D — Stack', top2: 'Unde devine rapid', h3: 'Tools & AI Stack', items: ['Figma', 'Adobe CC', 'Miro', 'Notion', 'Jira', 'Midjourney', 'Sora', 'ChatGPT', 'Real-ESRGAN'] }
    ]
  },
  experience: {
    eyebrow: 'Experiență', count: '2018 → prezent',
    rows: [
      { when: 'Iun 2024 — Prezent', now: true, role: 'Senior UX/UI & Product Designer', org: 'Zazitex SRL', desc: 'UX/UI end-to-end pentru platforme e-commerce și sisteme interne. Am arhitecturat de la zero logica unui CRM închis — modele de date, navigare, acces bazat pe roluri pentru 50+ utilizatori. Am redus frecările din checkout prin restructurarea IA și progressive disclosure. Mentorez juniori, susțin workshop-uri de UX.' },
      { when: 'Iun 2024 — Prezent', now: true, role: 'Lector, UX/UI Design', org: 'IT STEP Academy', desc: 'Predau UX/UI Design, Design Thinking și Product Strategy. Ghidez studenții prin research, prototipare și testare de uzabilitate pe proiecte reale ale clienților.' },
      { when: 'Dec 2022 — Ian 2024', now: false, role: 'Middle UX/UI Designer', org: 'Yucatech Software SRL · Hostry.com · Lycaste.com', desc: 'Am redesenat fluxurile principale de e-commerce, am îmbunătățit onboarding-ul și am redus abandonul în punctele cheie de conversie. Am construit un sistem de design multi-platformă (web + iOS + Android) pentru 3 produse. Am livrat o aplicație VPN: onboarding, arhitectura setărilor, fluxuri de abonament.' },
      { when: 'Dec 2021 — Dec 2022', now: false, role: 'Middle Graphic Designer', org: 'Art Poligraf SRL', desc: 'Identitate de brand și ambalaje pentru clienți din Moldova și piețele UE; comunicare vizuală în campanii print și digital.' },
      { when: '2018 — 2021', now: false, role: 'Junior Graphic Designer', org: 'Sonaris-com Advertising Agency · Freelance', desc: 'Identități de brand și reclame digitale pentru 20+ IMM-uri și startup-uri; layout-uri UI pentru produse e-commerce la început de drum.' }
    ],
    certsEyebrow: 'Certificări', certsCount: 'Verificate prin Certiport',
    certs: ['Adobe Certified Professional — Visual Design', 'ACP — Visual Design · Photoshop CC', 'ACP — Graphic Design · Illustrator', 'ACP — Print & Digital Media · InDesign']
  },
  special: {
    tickerVet: 'Reducere pentru animale fără stăpân', tickerMetal: 'Reducere pentru trupe rock',
    vetTitle: 'Adăposturi & voluntari veterinari',
    vetDesc: 'Adăposturile și organizațiile de salvare primesc tarife pro-bono sau la cost — site-uri, fluxuri de adopție și pagini de donații construite să convertească cu adevărat.',
    vetCta: 'Spune-mi despre adăpostul tău', vetCursor: 'Aprobat de lăbuțe',
    metalTitle: 'Trupe & Case de Discuri Metal',
    metalDesc: 'Tarif fix, procent din venituri sau vinil în contul facturii — coperți de album, magazine de merch și site-uri care nu fac de rușine muzica.',
    metalCta: 'Rezervă un slot', metalCursor: 'Tarif la maximum'
  },
  footer: {
    eyebrow: 'Ai un flow încurcat? Un funnel care pierde clienți? Un CRM pe care nimeni nu-l folosește?',
    ctaPre: 'Hai să ', ctaSwap: 'o ucidem', ctaPost: ' împreună.',
    formTrigger: 'Trimite o cerere',
    fineSuffix: 'ora Chișinăului'
  },
  form: {
    title: 'Trimite o cerere', sub: 'Completează-l — revin în cel mult o zi, de obicei mai repede.',
    nameLabel: 'Nume', namePlaceholder: 'Numele tău',
    emailLabel: 'Email', emailPlaceholder: 'you@company.com',
    msgLabel: 'Ce proiect ucidem?', msgPlaceholder: 'Proiect, buget, termen…',
    submit: 'Trimite briefing-ul', note: 'Deschide aplicația de email cu totul completat.',
    thanksTitle: 'Mulțumesc că mi-ai scris!',
    thanksSub: 'Am primit mesajul tău — te contactez în curând, de obicei în aceeași zi.',
    close: 'Închide'
  }
};

export const translations = { en, ru, ro };

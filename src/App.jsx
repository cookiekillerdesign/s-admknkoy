import { useEffect, useRef, useState, useCallback, useMemo, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { LANGS, detectLang, translations, projectName, projectTags } from './i18n';
import { STATIC_PROJECTS, fetchPublishedProjects } from './lib/projects';
import {
  List, X, ArrowRight, ArrowUpRight, PawPrint, Skull,
  LinkedinLogo, BehanceLogo, EnvelopeSimple, Phone, CheckCircle
} from '@phosphor-icons/react';

/* ================= constants ================= */
const HEART = [
  0,1,1,0,1,1,0,
  1,1,1,1,1,1,1,
  1,1,1,1,1,1,1,
  0,1,1,1,1,1,0,
  0,0,1,1,1,0,0,
  0,0,0,1,0,0,0
];

/** DB row (from Supabase, or the static fallback) → the shape the homepage UI expects. */
function toWorkProject(row) {
  return {
    slug: row.slug,
    name: row.name?.en || row.slug,
    status: row.status,
    hue: row.hue,
    thumb: row.thumb || '',
    previewImg: row.preview_img || '',
    href: `/project/${row.slug}`,
    i18n: { name: row.name, tags: row.tags }
  };
}

function getMenuLinks(t) {
  return [
    { href: '#work', num: '01', ...t.nav.work },
    { href: '#about', num: '02', ...t.nav.about },
    { href: '#capabilities', num: '03', ...t.nav.capabilities },
    { href: '#experience', num: '04', ...t.nav.experience },
    { href: '#contact', num: '05', ...t.nav.contact }
  ];
}

function initials(name) {
  return name.replace(/[^A-Za-zА-Яа-я0-9 ]/g, '').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
function shade(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${Math.min(255, (n >> 16) + 24)} ${Math.min(255, ((n >> 8) & 255) + 24)} ${Math.min(255, (n & 255) + 24)})`;
}

/* ================= smooth in-page scroll ================= */
/* Matches the site's --ease cubic-bezier(.19,1,.22,1) — a.k.a. easeOutExpo. */
function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
function smoothScrollTo(targetY, duration = 900) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  if (Math.abs(diff) < 1) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { window.scrollTo(0, targetY); return; }
  const t0 = performance.now();
  function step(now) {
    const t = Math.min((now - t0) / duration, 1);
    window.scrollTo(0, startY + diff * easeOutExpo(t));
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function scrollToHash(hash) {
  const el = document.querySelector(hash);
  if (!el) return;
  const targetY = el.getBoundingClientRect().top + window.scrollY;
  const distance = Math.abs(targetY - window.scrollY);
  const duration = Math.min(1500, Math.max(600, distance * 0.55));
  smoothScrollTo(targetY, duration);
}

/* ================= pixel heart ================= */
function PixelHeart({ className = '', stagger = false }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!stagger || !ref.current) return;
    const on = [...ref.current.querySelectorAll('i.on')].sort(() => Math.random() - 0.5);
    on.forEach((p, i) => { p.style.animationDelay = (80 + i * 24) + 'ms'; });
  }, [stagger]);
  return (
    <span className={`pxheart ${className}`} ref={ref} aria-hidden="true">
      {HEART.map((v, i) => <i key={i} className={v ? 'on' : ''} />)}
    </span>
  );
}

/* ================= loader ================= */
function Loader({ onDone, tag }) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lv = 0;
    const timer = setInterval(() => {
      lv = Math.min(lv + Math.ceil(Math.random() * 9) + 3, 100);
      setCount(lv);
      if (lv >= 100) {
        clearInterval(timer);
        setTimeout(() => setDone(true), 250);
        setTimeout(() => { setRemoved(true); onDone && onDone(); }, 1600);
      }
    }, RM ? 1 : 70);
    return () => clearInterval(timer);
  }, [onDone]);

  if (removed) return null;

  return (
    <div className={`loader${done ? ' done' : ''}`} aria-hidden="true">
      <div className="half l" /><div className="half r" />
      <div className="loader-core">
        <PixelHeart stagger />
        <div className="loader-count">{count}</div>
        <div className="loader-tag">{tag}</div>
      </div>
    </div>
  );
}

/* ================= hero title split ================= */
function HeroTitleLine({ text, accent, innerRef }) {
  let charIndex = 0;
  return (
    <span className={`line${accent ? ' accent' : ''}`} ref={innerRef}>
      {[...text].map((c, i) => {
        if (c === ' ') return <span className="sp" key={i} />;
        const delay = (0.55 + charIndex * 0.035) + 's';
        charIndex++;
        return <span className="ch" style={{ transitionDelay: delay }} key={i}>{c}</span>;
      })}
    </span>
  );
}

/* ================= clock ================= */
function useChisinauClock() {
  const [time, setTime] = useState('—:—');
  useEffect(() => {
    const tick = () => {
      const t = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Chisinau' }).format(new Date());
      setTime(t);
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/* ================= App ================= */
export default function App() {
  const clock = useChisinauClock();
  const [heroIn, setHeroIn] = useState(false);

  // language
  const [lang, setLangState] = useState(detectLang);
  const t = translations[lang];
  const menuLinks = useMemo(() => getMenuLinks(t), [t]);
  const setLang = useCallback((l) => {
    setHeroIn(false);
    setLangState(l);
    try { localStorage.setItem('cc_lang', l); } catch { /* ignore */ }
  }, []);

  const heroMounted = useRef(false);
  useEffect(() => {
    if (!heroMounted.current) { heroMounted.current = true; return; }
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(() => setHeroIn(true), RM ? 0 : 120);
    return () => clearTimeout(timer);
  }, [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.meta.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t.meta.description);
  }, [lang, t]);

  // top-level state
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('work');
  const [menuPreview, setMenuPreview] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [hoveredWork, setHoveredWork] = useState(null);
  const [previewShow, setPreviewShow] = useState(false);
  const [cursorOnLink, setCursorOnLink] = useState(false);
  const [cursorHidden, setCursorHidden] = useState(false);
  const [cursorLabelShow, setCursorLabelShow] = useState(false);
  const [cursorLabelText, setCursorLabelText] = useState('');
  const [statValues, setStatValues] = useState([0, 0, 0, 0]);
  const [projectsRaw, setProjectsRaw] = useState(STATIC_PROJECTS);
  const PROJECTS = useMemo(() => projectsRaw.map(toWorkProject), [projectsRaw]);

  useEffect(() => {
    let alive = true;
    fetchPublishedProjects().then(rows => { if (alive && rows && rows.length) setProjectsRaw(rows); });
    return () => { alive = false; };
  }, []);

  // refs to DOM nodes needed by imperative animation loops
  const cursorRef = useRef(null);
  const cursorLabelRef = useRef(null);
  const previewRef = useRef(null);
  const progressRef = useRef(null);
  const headerRef = useRef(null);
  const skewRef = useRef(null);
  const trackRef = useRef(null);
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const accentLineRef = useRef(null);
  const heroTitleRef = useRef(null);
  const logoRef = useRef(null);
  const logoSvgRef = useRef(null);
  const workListRef = useRef(null);
  const maskCellsRef = useRef([]);
  const deckCardsRef = useRef([]);
  const statsRef = useRef(null);
  const leadFormRef = useRef(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const msgRef = useRef(null);

  /* ---- hero title reveal ---- */
  useEffect(() => {
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => setHeroIn(true), RM ? 0 : 600);
    return () => clearTimeout(t);
  }, []);

  /* ---- cursor: link detection ---- */
  useEffect(() => {
    const onOver = e => { if (e.target.closest('a,button')) setCursorOnLink(true); };
    const onOut = e => { if (e.target.closest('a,button')) setCursorOnLink(false); };
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    return () => {
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, []);

  /* ---- magnetic buttons ---- */
  useEffect(() => {
    const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!(FINE && !RM)) return;
    const magnets = [...document.querySelectorAll('.magnetic')];
    const cleanups = [];
    magnets.forEach(el => {
      const onMove = e => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * .25}px,${dy * .35}px)`;
      };
      const onLeave = () => {
        el.style.transform = '';
        el.style.transition = 'transform .5s cubic-bezier(.19,1,.22,1)';
        setTimeout(() => { el.style.transition = ''; }, 500);
      };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      cleanups.push(() => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); });
    });
    return () => cleanups.forEach(fn => fn());
  }, []);

  /* ---- section-in-view tracking for menu ---- */
  useEffect(() => {
    const ids = ['work', 'about', 'capabilities', 'experience', 'contact'];
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) setActiveSection(en.target.id); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  /* ---- reveal-on-scroll ---- */
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [projectsRaw]);

  /* ---- stat count-up ---- */
  useEffect(() => {
    const targets = [5, 12, 20, 4];
    if (!statsRef.current) return;
    const obs = new IntersectionObserver((en, o) => {
      if (!en[0].isIntersecting) return;
      o.disconnect();
      const t0 = performance.now(), dur = 1300;
      const tick = t => {
        const k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3);
        setStatValues(targets.map(target => Math.round(target * e)));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: .4 });
    obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  /* ---- hero particle canvas ---- */
  useEffect(() => {
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let parts = [], cw = 0, ch = 0;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let pmx = -9999, pmy = -9999, heroVisible = true, raf;

    function buildParticles() {
      cw = canvas.offsetWidth; ch = canvas.offsetHeight;
      canvas.width = cw * dpr; canvas.height = ch * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      parts = [];
      if (RM || cw < 1100) return;
      const SUB = 3;
      const gridW = 7 * SUB, gridH = 6 * SUB;
      const heroEl = heroRef.current;
      if (!heroEl) return;
      const heroRect = heroEl.getBoundingClientRect();
      const padRight = parseFloat(getComputedStyle(heroEl).paddingRight) || cw * .04;
      const boxX1 = cw - padRight, boxX0 = cw * .62;
      const size = (boxX1 - boxX0) / gridW;
      const totalH = gridH * size;
      const accentLine = accentLineRef.current;
      let centerY = ch * .4;
      if (accentLine) {
        const r = accentLine.getBoundingClientRect();
        centerY = (r.top + r.bottom) / 2 - heroRect.top;
      }
      centerY = Math.min(Math.max(centerY, totalH / 2 + 20), ch - totalH / 2 - 20);
      const ox = boxX0, oy = centerY - totalH / 2;
      for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
        if (!HEART[r * 7 + c]) continue;
        for (let sr = 0; sr < SUB; sr++) for (let sc = 0; sc < SUB; sc++) {
          const hx = ox + (c * SUB + sc) * size, hy = oy + (r * SUB + sr) * size;
          parts.push({
            hx, hy,
            x: hx + (Math.random() - .5) * cw * .7,
            y: hy + (Math.random() - .5) * ch * .7,
            vx: 0, vy: 0, s: size * .8,
            col: Math.random() < .05 ? '#1B3BFF' : 'rgba(15,15,19,.85)'
          });
        }
      }
    }
    function drawParticles() {
      if (!parts.length || !heroVisible) return;
      ctx.clearRect(0, 0, cw, ch);
      for (const p of parts) {
        p.vx += (p.hx - p.x) * .045; p.vy += (p.hy - p.y) * .045;
        const dx = p.x - pmx, dy = p.y - pmy, d2 = dx * dx + dy * dy, R = 150;
        if (d2 < R * R) { const d = Math.sqrt(d2) || 1, f = (R - d) / R * 3.2; p.vx += dx / d * f; p.vy += dy / d * f; }
        p.vx *= .86; p.vy *= .86;
        p.x += p.vx; p.y += p.vy;
        ctx.fillStyle = p.col;
        ctx.fillRect(p.x, p.y, p.s, p.s);
      }
    }
    buildParticles();
    const onResize = () => buildParticles();
    addEventListener('resize', onResize);
    const parent = canvas.parentElement;
    const onMove = e => { const r = canvas.getBoundingClientRect(); pmx = e.clientX - r.left; pmy = e.clientY - r.top; };
    const onLeave = () => { pmx = pmy = -9999; };
    parent.addEventListener('mousemove', onMove);
    parent.addEventListener('mouseleave', onLeave);
    const visObs = new IntersectionObserver(en => { heroVisible = en[0].isIntersecting; }, { threshold: 0 });
    visObs.observe(canvas);

    // expose drawParticles to master loop via canvas element
    canvas.__drawParticles = drawParticles;

    return () => {
      removeEventListener('resize', onResize);
      parent.removeEventListener('mousemove', onMove);
      parent.removeEventListener('mouseleave', onLeave);
      visObs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  /* ---- master scroll/raf loop: cursor, preview, skew, marquee, progress, logo, particles ---- */
  useEffect(() => {
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;

    const cursor = cursorRef.current, cursorLabel = cursorLabelRef.current;
    const preview = previewRef.current, progress = progressRef.current;
    const header = headerRef.current, skew = skewRef.current, track = trackRef.current;
    const logo = logoRef.current, logoSvg = logoSvgRef.current, canvas = canvasRef.current;
    if (!cursor || !skew || !track) return;

    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    const onMouseMove = e => { mx = e.clientX; my = e.clientY; };
    addEventListener('mousemove', onMouseMove);

    let logoRect = logo ? logo.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
    const measureLogo = () => { if (logo) logoRect = logo.getBoundingClientRect(); };
    addEventListener('resize', measureLogo, { passive: true });
    addEventListener('load', measureLogo);

    let logoTX = 0, logoTY = 0, logoScaleK = 1;
    function updateLogo(scrollT, vel) {
      if (!logo || !logoSvg) return;
      const lcx = logoRect.left + logoRect.width / 2, lcy = logoRect.top + logoRect.height / 2;
      const dx = mx - lcx, dy = my - lcy;
      const dist = Math.hypot(dx, dy);
      const radius = 280;
      const pull = Math.max(0, 1 - dist / radius);
      const tx = FINE && !RM ? (dx / radius) * 20 * pull : 0;
      const ty = FINE && !RM ? (dy / radius) * 20 * pull : 0;
      logoTX += (tx - logoTX) * .16;
      logoTY += (ty - logoTY) * .16;
      const targetScale = 1 + scrollT * .22 + pull * .1;
      logoScaleK += (targetScale - logoScaleK) * .12;
      const tilt = (RM || !FINE) ? 0 : Math.max(-8, Math.min(8, vel * .18));
      logoSvg.style.transform = `translate(${logoTX}px,${logoTY}px) scale(${logoScaleK}) rotate(${tilt}deg)`;
      const glow = .12 + scrollT * .4 + pull * .25;
      logoSvg.style.filter = scrollT > .02 || pull > .05 ? `drop-shadow(0 0 ${6 + scrollT * 20}px rgba(27,59,255,${glow}))` : 'none';
    }

    let pvX = 0, pvY = 0, pvTX = 0, pvTY = 0;
    const onListMove = e => { pvTX = e.clientX; pvTY = e.clientY; };
    if (workListRef.current) workListRef.current.addEventListener('mousemove', onListMove);
    const workList = workListRef.current;

    let lastY = scrollY, vel = 0, smoothVel = 0, mqX = 0;
    const trackHalf = () => track.scrollWidth / 3;

    let raf;
    function master() {
      cx += (mx - cx) * .22; cy += (my - cy) * .22;
      cursor.style.transform = `translate(${cx}px,${cy}px)`;
      if (cursorLabel) { cursorLabel.style.left = cx + 'px'; cursorLabel.style.top = cy + 'px'; }

      pvX += (pvTX - pvX) * .14; pvY += (pvTY - pvY) * .14;
      if (preview) { preview.style.left = pvX + 'px'; preview.style.top = pvY + 'px'; }

      const y = scrollY; vel = y - lastY; lastY = y;
      smoothVel += (vel - smoothVel) * .1;

      if (!RM && FINE) {
        const sk = Math.max(-4, Math.min(4, smoothVel * .12));
        skew.style.transform = `skewY(${sk}deg)`;
      }

      mqX -= 1.1 + Math.min(Math.abs(smoothVel) * .4, 14);
      const half = trackHalf();
      if (-mqX >= half) mqX += half;
      track.style.transform = `translateX(${mqX}px)`;

      const max = document.documentElement.scrollHeight - innerHeight;
      if (progress) progress.style.transform = `scaleX(${max ? y / max : 0})`;

      updateLogo(max ? Math.min(y / max, 1) : 0, smoothVel);

      if (canvas && canvas.__drawParticles) canvas.__drawParticles();

      raf = requestAnimationFrame(master);
    }
    raf = requestAnimationFrame(master);

    let lastHideY = 0;
    const onScroll = () => {
      const y = scrollY;
      if (!header) return;
      if (y > 600 && y > lastHideY + 8) header.classList.add('hide');
      else if (y < lastHideY - 8 || y <= 600) header.classList.remove('hide');
      lastHideY = y;
    };
    addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('mousemove', onMouseMove);
      removeEventListener('resize', measureLogo);
      removeEventListener('load', measureLogo);
      removeEventListener('scroll', onScroll);
      if (workList) workList.removeEventListener('mousemove', onListMove);
    };
  }, []);

  /* ---- deck stacking (capabilities) ---- */
  useEffect(() => {
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = deckCardsRef.current.filter(Boolean);
    cards.forEach((c, i) => { c.style.top = (100 + i * 22) + 'px'; c.style.zIndex = i + 1; });
    let raf;
    function deckScale() {
      if (!RM) {
        cards.forEach((c, i) => {
          if (i === cards.length - 1) return;
          const next = cards[i + 1];
          const r = next.getBoundingClientRect();
          const start = innerHeight, end = 100 + (i + 1) * 22;
          const t = Math.min(Math.max((start - r.top) / (start - end), 0), 1);
          c.style.transform = `scale(${1 - t * .06}) translateY(${-t * 8}px)`;
          c.style.filter = `brightness(${1 - t * .15})`;
        });
      }
      raf = requestAnimationFrame(deckScale);
    }
    raf = requestAnimationFrame(deckScale);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ---- menu toggle & preview ---- */
  const toggleMenu = useCallback((open) => {
    setMenuOpen(open);
    document.body.classList.toggle('locked', open);
    if (!open) setMenuPreview(null);
  }, []);

  /* ---- close modal, then reset form + thank-you state after the close transition ---- */
  const closeFormModal = useCallback(() => {
    setFormModalOpen(false);
    setTimeout(() => {
      setFormSent(false);
      if (leadFormRef.current) leadFormRef.current.reset();
    }, 400);
  }, []);

  /* ---- escape key closes menu / form modal ---- */
  useEffect(() => {
    const onKey = e => {
      if (e.key !== 'Escape') return;
      if (menuOpen) toggleMenu(false);
      if (formModalOpen) closeFormModal();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [menuOpen, formModalOpen, toggleMenu, closeFormModal]);

  /* ---- form modal open: focus first field ---- */
  useEffect(() => {
    document.body.classList.toggle('locked', formModalOpen);
    if (formModalOpen) {
      const focusTimer = setTimeout(() => { if (nameRef.current) nameRef.current.focus(); }, 380);
      return () => clearTimeout(focusTimer);
    }
  }, [formModalOpen]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const form = leadFormRef.current;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const name = nameRef.current.value.trim();
    const email = emailRef.current.value.trim();
    const message = msgRef.current.value.trim();
    const subject = encodeURIComponent(`New project request — ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:cookiekiller.design@gmail.com?subject=${subject}&body=${body}`;
    setFormSent(true);
    setTimeout(closeFormModal, 3400);
  };

  /* ---- work list hover ---- */
  const onWorkListMouseOver = (e) => {
    const row = e.target.closest('.work-row');
    if (!row) return;
    maskCellsRef.current.forEach(c => { if (c) c.style.transitionDelay = (Math.random() * .28) + 's'; });
    setPreviewShow(true);
    setCursorHidden(true);
    setCursorLabelShow(true);
    const idx = Number(row.dataset.i);
    const proj = PROJECTS[idx];
    setCursorLabelText(<><ArrowUpRight size={13} weight="bold" />{proj && proj.href ? t.work.viewCase : t.work.viewBehance}</>);
    setHoveredWork(row.dataset.i);
  };
  const onWorkListMouseLeave = () => {
    setPreviewShow(false);
    setCursorHidden(false);
    setCursorLabelShow(false);
  };

  const onSpecialCardEnter = (label) => {
    setCursorLabelText(label);
    setCursorLabelShow(true);
  };
  const onSpecialCardLeave = () => setCursorLabelShow(false);

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="progress" id="progress" ref={progressRef} aria-hidden="true" />
      <div
        className={`cursor${cursorOnLink ? ' on-link' : ''}${cursorHidden ? ' hidden' : ''}`}
        id="cursor" ref={cursorRef} aria-hidden="true"
      >
        <span className="cursor-ring">
          <i className="tick tl" /><i className="tick tr" /><i className="tick bl" /><i className="tick br" />
          <i className="dot" />
        </span>
      </div>
      <div
        className={`cursor-label${cursorLabelShow ? ' show' : ''}`}
        id="cursorLabel" ref={cursorLabelRef} aria-hidden="true"
      >{cursorLabelText}</div>

      <Loader tag={t.loader.tag} />

      <header id="header" ref={headerRef}>
        <a className="logo" href="#top" aria-label={t.header.home} ref={logoRef} onClick={(e) => { e.preventDefault(); scrollToHash('#top'); }}>
          <svg ref={logoSvgRef} viewBox="0 0 991 404" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M549.018 205.735L609.076 293.797H665.209L583.169 176.56L659.717 90.0701H603.976L521.147 181.595L519.209 0H466.608L468.546 293.797H521.147V233.021L549.018 205.735ZM63.595 289.349C76.9399 294.91 91.9864 297.723 108.735 297.723L108.729 297.739C123.91 297.739 137.582 295.447 149.752 290.868C161.921 286.289 172.518 279.939 181.547 271.828C190.576 263.717 197.441 254.554 202.154 244.349L150.734 228.648C148.641 233.355 145.371 237.542 140.921 241.209C136.477 244.875 131.436 247.752 125.81 249.846C120.185 251.939 114.232 252.986 107.951 252.986C98.004 252.986 88.975 250.367 80.8639 245.068C72.7528 239.835 66.2736 232.636 61.4316 223.543C56.5897 214.385 54.1687 203.982 54.1687 192.14C54.1687 180.105 56.5199 169.503 61.233 160.345C65.9462 151.246 72.42 144.182 80.6653 139.211C88.9052 134.17 97.9986 131.685 107.946 131.685C116.846 131.685 124.957 133.709 132.284 137.767C139.612 141.825 145.5 147.644 149.95 155.235L201.371 139.533C193.523 123.832 181.616 111.142 165.652 101.458C149.693 91.7737 130.588 86.9318 108.343 86.9318C86.1031 86.9318 66.8695 91.704 50.6419 101.323C34.4144 110.873 21.9176 123.628 13.1517 139.528C4.38567 155.428 0 172.96 0 192.129C0 206.134 2.54981 219.415 7.6548 232.105C12.7598 244.795 20.0227 256.116 29.4436 266.057C38.8645 276.069 50.2501 283.788 63.595 289.349ZM687.579 293.806V88.1143L739.789 88.5061L740.181 293.806H687.579ZM838.324 289.346C851.669 294.908 866.587 297.721 883.072 297.721L883.078 297.715C898.253 297.715 912.124 295.423 924.685 290.844C937.246 286.265 948.17 279.915 957.462 271.804C966.749 263.693 973.883 254.401 978.854 243.933L933.709 231.372C930.305 239.746 923.96 246.483 914.668 251.588C905.376 256.693 895.499 259.243 885.031 259.243C875.868 259.243 867.301 257.278 859.319 253.289C851.336 249.365 844.798 243.541 839.693 235.822C834.593 228.167 831.518 219.202 830.471 208.998H989.45C989.713 206.904 989.971 204.285 990.234 201.016C990.497 197.811 990.626 194.606 990.626 191.53C990.626 173.08 986.369 155.94 977.866 139.976C969.363 124.081 957.129 111.193 941.165 101.509C925.206 91.7603 905.972 86.9183 883.464 86.9183C861.219 86.9183 841.921 91.7603 825.564 101.509C809.208 111.193 796.647 124.081 787.881 140.11C779.115 156.139 774.729 173.87 774.729 193.302C774.729 207.302 777.279 220.518 782.384 233.079C787.489 245.64 794.752 256.763 804.173 266.446C813.594 276.195 824.979 283.785 838.324 289.346ZM936.854 175.641H829.301C830.347 165.431 833.289 156.536 838.131 148.946C842.973 141.425 849.254 135.536 856.973 131.349C864.692 127.098 873.265 125.004 882.686 125.004C892.364 125.004 901.135 127.098 908.984 131.349C916.837 135.536 923.182 141.42 928.024 148.946C932.866 156.536 935.808 165.436 936.854 175.641ZM713.747 66.4778C668.86 66.4778 668.903 0.220308 713.747 0.220308C758.882 0.220308 759.053 66.4778 713.747 66.4778ZM601.486 366.725V353.369C604.106 353.707 607.402 353.96 610.021 353.96H665.382C667.159 353.96 671.383 353.793 673.75 353.369V366.639C671.469 366.472 667.915 366.386 665.382 366.386H646.449C645.858 374.836 643.743 381.514 640.871 387.263C637.999 393.264 631.407 400.114 623.715 404L611.712 395.379C617.375 393.264 623.291 388.449 626.673 383.714C629.969 378.813 631.574 372.978 632.084 366.386H610.021C607.573 366.386 603.853 366.558 601.486 366.725ZM654.989 329.53L662.934 326.32V326.314C665.049 329.438 668.007 334.935 669.526 337.893L661.495 341.275C660.395 339.079 658.962 336.288 657.523 333.668V344.657C654.399 344.49 650.931 344.319 647.721 344.319H620.929C617.971 344.319 613.913 344.485 611.127 344.657V331.553C613.999 331.977 618.057 332.23 620.929 332.23H647.721C650.512 332.23 653.556 332.063 656.342 331.725C656.025 331.159 655.663 330.59 655.323 330.056L655.322 330.055C655.265 329.966 655.209 329.878 655.154 329.791C655.098 329.702 655.043 329.615 654.989 329.53ZM665.387 325.471L673.332 322.261C675.527 325.471 678.571 330.882 680.01 333.754L672.065 337.136C670.374 333.668 667.668 328.681 665.387 325.471ZM751.007 329.363L757.685 327.248C759.29 330.716 761.067 335.531 761.995 338.661L755.318 340.776C754.137 337.141 752.698 332.831 751.007 329.363ZM741.962 358.436V361.142L741.957 361.147C741.957 381.181 736.803 394.622 715.755 403.834L704.767 393.522C721.676 387.939 728.52 380.585 728.52 361.485V358.442H710.768V368.668C710.768 372.807 711.026 376.103 711.192 378.218H696.908C697.16 376.108 697.413 372.807 697.413 368.668V358.442H691.325C686.763 358.442 684.229 358.614 681.776 358.78V344.92C681.89 344.94 682.007 344.96 682.129 344.982L682.163 344.988C684.115 345.331 687.055 345.848 691.325 345.848H697.413V338.832C697.413 336.041 697.16 333.336 696.822 330.378H711.359C711.107 332.402 710.768 335.279 710.768 338.913V345.843H728.52V337.898C728.52 334.431 728.349 331.645 728.01 329.53H742.547C742.461 330.286 742.381 331.135 742.295 332.063L748.806 330.034C750.411 333.502 752.102 338.237 752.945 341.447L746.181 343.642C745.913 342.819 745.644 341.962 745.371 341.089L745.371 341.089C744.438 338.108 743.45 334.951 742.209 332.401C742.042 334.012 741.957 335.783 741.957 337.898V345.843H746.439C751.34 345.843 753.707 345.671 756.665 345.167V358.689C754.303 358.436 751.345 358.436 746.525 358.436H741.962ZM770.278 375.26L763.939 362.328L763.933 362.323C779.318 358.436 791.407 353.197 800.871 347.448C809.406 342.209 819.718 333.083 825.043 326.658L836.117 337.222C829.777 343.395 821.581 349.987 813.55 355.312V388.615C813.55 392.674 813.722 398.503 814.398 400.871H798.171C798.509 398.589 798.847 392.674 798.847 388.615V363.847C790.312 368.158 780.086 372.468 770.278 375.26ZM871.707 347.625V339.509L871.712 339.514C871.712 336.556 871.374 331.988 870.446 328.778H886.673C886.077 331.988 885.911 336.889 885.911 339.595V347.625H902.987C907.464 347.625 911.269 347.287 913.299 347.035V361.067C911.269 360.895 906.707 360.643 902.901 360.643H885.825C885.068 376.784 880.081 390.816 861.401 402.143L848.635 392.679C865.373 385.153 870.526 373.488 871.541 360.643H851.759C847.787 360.643 844.239 360.895 841.109 361.147V346.949C844.153 347.287 847.787 347.625 851.421 347.625H871.707ZM920.728 372.05V355.908C924.11 356.16 931.206 356.499 935.35 356.499H980.232C983.138 356.499 986.237 356.251 988.632 356.061C988.958 356.035 989.271 356.01 989.569 355.986C989.949 355.957 990.305 355.93 990.63 355.908V372.05C989.872 372.022 988.815 371.954 987.612 371.876L987.61 371.876H987.61C985.32 371.727 982.505 371.545 980.232 371.545H935.35C930.535 371.545 924.19 371.797 920.728 372.05ZM328.577 297.722C270.608 297.722 223.181 250.295 223.181 192.326C223.181 134.356 270.608 86.93 328.577 86.93V131.678C295.22 131.678 267.929 158.969 267.929 192.326C267.929 225.683 295.22 252.974 328.577 252.974V297.722ZM433.972 267.357C433.972 209.388 386.546 161.961 328.576 161.961V206.704C361.933 206.704 389.224 233.995 389.224 267.352C389.224 300.709 361.933 328 328.576 328V372.753C386.546 372.753 433.972 325.327 433.972 267.357Z" fill="currentColor" />
          </svg>
          <PixelHeart />
        </a>
        <div className="hdr-right">
          <span className="hdr-time" id="clock">{t.city} {clock}</span>
          <span className="hdr-status">{t.header.openToWork}</span>
          <div className="lang-switch" role="group" aria-label={t.header.language}>
            {LANGS.map(l => (
              <button key={l} type="button" className={lang === l ? 'active' : ''} aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
            ))}
          </div>
          <button className="menu-btn" aria-expanded={menuOpen} aria-controls="menu" aria-label={t.header.menu} onClick={() => toggleMenu(true)}><List size={14} weight="bold" /><span className="menu-btn-label" aria-hidden="true">{t.header.menu}</span></button>
        </div>
      </header>

      <div className={`menu${menuOpen ? ' open' : ''}`} id="menu" aria-hidden={!menuOpen}>
        <nav className="menu-links" aria-label={t.header.mainNav}>
          {menuLinks.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              className={activeSection === l.href.slice(1) ? 'active' : ''}
              style={{ transitionDelay: menuOpen ? `${.15 + i * .06}s, ${.15 + i * .06}s, 0s` : '0s, 0s, 0s' }}
              onMouseEnter={() => setMenuPreview(l)}
              onClick={(e) => { e.preventDefault(); toggleMenu(false); scrollToHash(l.href); }}
            ><i>{l.num}</i>{l.label}</a>
          ))}
        </nav>
        <div className={`menu-preview${menuPreview ? ' show' : ''}`} onMouseLeave={() => setMenuPreview(null)} aria-hidden="true">
          <span className="menu-preview-num">{menuPreview ? menuPreview.num : '01'}</span>
          <span className="menu-preview-eyebrow">{menuPreview ? menuPreview.n : ''}</span>
          <p className="menu-preview-desc">{menuPreview ? menuPreview.desc : ''}</p>
        </div>
        <div className="menu-foot">
          <span>{t.menuFoot.location}</span>
          <a href="https://behance.net/iamcookiekiller" target="_blank" rel="noopener noreferrer"><BehanceLogo size={15} weight="bold" />Behance<ArrowUpRight size={12} /></a>
          <a href="https://linkedin.com/in/iamcookiekiller" target="_blank" rel="noopener noreferrer"><LinkedinLogo size={15} weight="bold" />LinkedIn<ArrowUpRight size={12} /></a>
          <a href="mailto:cookiekiller.design@gmail.com"><EnvelopeSimple size={15} weight="bold" />cookiekiller.design@gmail.com</a>
        </div>
      </div>
      <div className="menu-status" aria-hidden="true">
        <span className="hdr-status">{t.header.openToWork}</span>
        <span>{t.city} {clock}</span>
      </div>
      <button className="menu-close" onClick={() => toggleMenu(false)}><X size={13} weight="bold" />{t.header.close}</button>

      <div className="skew" ref={skewRef}>
        <main id="top">

          {/* HERO */}
          <section className="hero" ref={heroRef}>
            <canvas id="heroCanvas" ref={canvasRef} aria-hidden="true" />
            <h1 className={`hero-title${heroIn ? ' in' : ''}`} id="heroTitle" ref={heroTitleRef} key={lang}>
              <HeroTitleLine text={t.hero.line1} />
              <HeroTitleLine text={t.hero.line2} accent innerRef={accentLineRef} />
              <HeroTitleLine text={t.hero.line3} />
            </h1>
            <p className="hero-sub">{t.hero.subPre}<b>{t.hero.subBold}</b>{t.hero.subPost}</p>
          </section>

          {/* MARQUEE */}
          <div className="marquee" aria-hidden="true">
            <div className="marquee-track" ref={trackRef}>
              {[0, 1, 2].map(copy => (
                <span key={copy}>{t.marquee.map((m, i) => <Fragment key={i}>{m}<i className="dot" /></Fragment>)}</span>
              ))}
            </div>
          </div>

          {/* WORK */}
          <section id="work">
            <div className="sec-num" aria-hidden="true">01</div>
            <div className="eyebrow reveal">{t.work.eyebrow} <span className="count">{t.work.count}</span></div>
            <div id="workList" ref={workListRef} onMouseOver={onWorkListMouseOver} onMouseLeave={onWorkListMouseLeave}>
              {PROJECTS.map((p, i) => (
                <Link
                  key={p.slug}
                  className="work-row reveal"
                  to={p.href}
                  data-i={i}
                >
                  <span className="idx">{String(i + 1).padStart(2, '0')}</span>
                  {p.thumb
                    ? <span className="row-thumb"><img src={p.thumb} alt={`${projectName(p, lang)} preview`} loading="lazy" /></span>
                    : <span className="row-thumb placeholder" style={{ background: p.hue + '1F' }}><span style={{ color: p.hue }}>{initials(projectName(p, lang))}</span></span>}
                  <span className="name">{projectName(p, lang)}</span>
                  <span className="tags">{projectTags(p, lang)}</span>
                  <span className={`status ${p.status}`}>{t.status[p.status]}</span>
                </Link>
              ))}
            </div>
            <div className="work-more"><a className="cert reveal" href="https://behance.net/iamcookiekiller" target="_blank" rel="noopener noreferrer">{t.work.more}<ArrowUpRight size={13} weight="bold" /></a></div>
          </section>

          <div className={`preview${previewShow ? ' show' : ''}`} ref={previewRef} aria-hidden="true">
            {PROJECTS.map((p, i) => (
              <div
                key={p.slug}
                className={`pv${p.thumb ? ' has-img' : ''}${hoveredWork === String(i) ? ' on' : ''}`}
                style={!p.thumb ? { background: `repeating-linear-gradient(45deg,${p.hue},${p.hue} 14px,${shade(p.hue)} 14px,${shade(p.hue)} 28px)` } : undefined}
              >
                {p.thumb
                  ? <><img src={p.previewImg || p.thumb} alt={projectName(p, lang)} /><span className="chip">{projectName(p, lang)}</span></>
                  : <span className="chip">{projectName(p, lang)}</span>}
              </div>
            ))}
            <div className="mask">
              {Array.from({ length: 80 }).map((_, i) => (
                <i key={i} ref={el => { maskCellsRef.current[i] = el; }} />
              ))}
            </div>
          </div>

          {/* ABOUT */}
          <section id="about">
            <div className="sec-num" aria-hidden="true">02</div>
            <div className="eyebrow reveal">{t.about.eyebrow} <span className="count">{t.about.count}</span></div>
            <div className="about-grid">
              <p className="about-statement reveal">{t.about.statementPre}<em>{t.about.statementEm}</em>{t.about.statementPost}</p>
              <div className="about-copy reveal">
                <p>{t.about.p1Pre}<b>{t.about.p1Bold}</b></p>
                <p>{t.about.p2}</p>
                <p>{t.about.p3}</p>
              </div>
            </div>
            <div className="stats reveal" id="stats" ref={statsRef}>
              <div className="stat"><div className="num">{statValues[0]}<sup>+</sup></div><div className="lbl">{t.about.stats[0]}</div></div>
              <div className="stat"><div className="num">{statValues[1]}<sup>+</sup></div><div className="lbl">{t.about.stats[1]}</div></div>
              <div className="stat"><div className="num">{statValues[2]}<sup>+</sup></div><div className="lbl">{t.about.stats[2]}</div></div>
              <div className="stat"><div className="num">{statValues[3]}</div><div className="lbl">{t.about.stats[3]}</div></div>
            </div>
          </section>

          {/* CAPABILITIES */}
          <section id="capabilities">
            <div className="eyebrow reveal">{t.capabilities.eyebrow} <span className="count">{t.capabilities.count}</span></div>
            <div className="deck" id="deck">
              {t.capabilities.decks.map((d, i) => (
                <div className="deck-card" key={i} ref={el => { deckCardsRef.current[i] = el; }}>
                  <div className="deck-top"><span>{d.top1}</span><span>{d.top2}</span></div>
                  <h3>{d.h3}</h3>
                  <ul>{d.items.map((it, j) => <li key={j}>{it}</li>)}</ul>
                </div>
              ))}
            </div>
          </section>

          {/* EXPERIENCE */}
          <section id="experience">
            <div className="sec-num" aria-hidden="true">04</div>
            <div className="eyebrow reveal">{t.experience.eyebrow} <span className="count">{t.experience.count}</span></div>
            <div className="xp">
              {t.experience.rows.map((r, i) => (
                <div className="xp-row reveal" key={i}>
                  <div className="xp-when">{r.now ? <span className="now">{r.when}</span> : r.when}</div>
                  <div>
                    <h3 className="xp-role">{r.role}</h3>
                    <p className="xp-org">{r.org}</p>
                    <p className="xp-desc">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 'clamp(60px,8vw,110px)' }}>
              <div className="eyebrow reveal">{t.experience.certsEyebrow} <span className="count">{t.experience.certsCount}</span></div>
              <div className="certs reveal">
                {t.experience.certs.map((c, i) => <span className="cert" key={i}><i className="badge" />{c}</span>)}
              </div>
            </div>
          </section>

          {/* SPECIAL RATES */}
          <section id="special">
            <div className="special-ticker" aria-hidden="true">
              <div className="special-ticker-track">
                <span><PawPrint size={22} weight="fill" />{t.special.tickerVet}<i>✦</i><Skull size={22} weight="fill" />{t.special.tickerMetal}<i>✦</i><PawPrint size={22} weight="fill" />{t.special.tickerVet}<i>✦</i><Skull size={22} weight="fill" />{t.special.tickerMetal}<i>✦</i></span>
                <span><PawPrint size={22} weight="fill" />{t.special.tickerVet}<i>✦</i><Skull size={22} weight="fill" />{t.special.tickerMetal}<i>✦</i><PawPrint size={22} weight="fill" />{t.special.tickerVet}<i>✦</i><Skull size={22} weight="fill" />{t.special.tickerMetal}<i>✦</i></span>
              </div>
            </div>
            <div className="special-grid">
              <div className="special-card special-card--vet reveal" onMouseEnter={() => onSpecialCardEnter(<><PawPrint size={13} weight="bold" />{t.special.vetCursor}</>)} onMouseLeave={onSpecialCardLeave}>
                <h3><PawPrint size={22} weight="bold" />{t.special.vetTitle}</h3>
                <p>{t.special.vetDesc}</p>
                <a className="special-cta magnetic" href="mailto:cookiekiller.design@gmail.com?subject=Vet%20volunteer%20%2F%20rescue%20project">{t.special.vetCta}</a>
              </div>
              <div className="special-card special-card--metal reveal" onMouseEnter={() => onSpecialCardEnter(<><Skull size={13} weight="bold" />{t.special.metalCursor}</>)} onMouseLeave={onSpecialCardLeave}>
                <h3><Skull size={22} weight="bold" />{t.special.metalTitle}</h3>
                <p>{t.special.metalDesc}</p>
                <a className="special-cta magnetic" href="mailto:cookiekiller.design@gmail.com?subject=Band%20%2F%20label%20project">{t.special.metalCta}</a>
              </div>
            </div>
          </section>

        </main>

        {/* FOOTER */}
        <footer id="contact">
          <p className="foot-eyebrow">{t.footer.eyebrow}</p>
          <a className="foot-cta" href="mailto:cookiekiller.design@gmail.com">{t.footer.ctaPre}<span className="swap">{t.footer.ctaSwap}</span><br />{t.footer.ctaPost}</a>

          <div className="foot-ctas">
            <a className="foot-mail magnetic" href="mailto:cookiekiller.design@gmail.com"><EnvelopeSimple size={17} weight="bold" />cookiekiller.design@gmail.com<ArrowRight size={15} weight="bold" /></a>
            <button type="button" className="foot-form-trigger magnetic" onClick={() => setFormModalOpen(true)}>{t.footer.formTrigger}<ArrowRight size={15} weight="bold" /></button>
          </div>

          <div className="foot-grid">
            <div className="foot-links">
              <a href="https://behance.net/iamcookiekiller" target="_blank" rel="noopener noreferrer"><BehanceLogo size={15} weight="bold" />Behance</a>
              <a href="https://linkedin.com/in/iamcookiekiller" target="_blank" rel="noopener noreferrer"><LinkedinLogo size={15} weight="bold" />LinkedIn</a>
              <a href="tel:+37369555534"><Phone size={15} weight="bold" />+373 69 555 534</a>
            </div>
            <div className="foot-fine"><PixelHeart className="" /> © 2026 Mihail Barascov · <span>{clock}</span> {t.footer.fineSuffix}</div>
          </div>
          <div className="foot-watermark" aria-hidden="true">COOKIEKILLER</div>
        </footer>
      </div>

      {/* LEAD FORM MODAL */}
      <div className={`form-modal${formModalOpen ? ' open' : ''}`} aria-hidden={!formModalOpen}>
        <div className="form-modal-backdrop" onClick={closeFormModal} />
        <div className="form-modal-panel" role="dialog" aria-modal="true" aria-labelledby="formModalTitle">
          <button className="form-modal-close" aria-label={t.header.close} onClick={closeFormModal}><X size={18} weight="bold" /></button>
          {formSent ? (
            <div className="form-thanks">
              <CheckCircle className="form-thanks-icon" size={56} weight="fill" aria-hidden="true" />
              <h3 className="form-modal-title">{t.form.thanksTitle}</h3>
              <p className="form-modal-sub">{t.form.thanksSub}</p>
            </div>
          ) : (
            <>
              <h3 className="form-modal-title" id="formModalTitle">{t.form.title}</h3>
              <p className="form-modal-sub">{t.form.sub}</p>
              <form className="foot-form" ref={leadFormRef} noValidate onSubmit={handleFormSubmit}>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="lfName">{t.form.nameLabel}</label>
                    <input type="text" id="lfName" name="name" autoComplete="name" placeholder={t.form.namePlaceholder} required ref={nameRef} />
                  </div>
                  <div className="form-field">
                    <label htmlFor="lfEmail">{t.form.emailLabel}</label>
                    <input type="email" id="lfEmail" name="email" autoComplete="email" placeholder={t.form.emailPlaceholder} required ref={emailRef} />
                  </div>
                </div>
                <div className="form-field">
                  <label htmlFor="lfMsg">{t.form.msgLabel}</label>
                  <textarea id="lfMsg" name="message" rows="4" placeholder={t.form.msgPlaceholder} required ref={msgRef} />
                </div>
                <div className="form-foot">
                  <button type="submit" className="form-submit magnetic">{t.form.submit}</button>
                  <span className="form-note">{t.form.note}</span>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}

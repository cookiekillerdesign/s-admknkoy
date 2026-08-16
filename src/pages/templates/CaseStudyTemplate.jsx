import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, X, CaretLeft, CaretRight } from '@phosphor-icons/react';
import './case-study.css';

function pick(field, lang) {
  if (!field) return '';
  return field[lang] || field.en || Object.values(field)[0] || '';
}

export default function CaseStudyTemplate({ project, lang }) {
  const content = project.content || {};
  const intro = content.intro || {};
  const items = content.gallery || [];

  const galleryRef = useRef(null);
  const [hudIdx, setHudIdx] = useState(1);
  const [hudProgress, setHudProgress] = useState(0);
  const [lightbox, setLightbox] = useState(null); // index or null

  /* reveal-on-scroll */
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.cs-reveal').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [items.length]);

  /* sticky HUD: which item is centered + overall scroll progress within the gallery */
  useEffect(() => {
    if (!galleryRef.current) return;
    const frames = [...galleryRef.current.querySelectorAll('.cs-gitem')];
    if (!frames.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) setHudIdx(Number(en.target.dataset.i) + 1);
      });
    }, { threshold: .5 });
    frames.forEach(f => obs.observe(f));

    const onScroll = () => {
      const rect = galleryRef.current.getBoundingClientRect();
      const total = rect.height - innerHeight;
      const passed = -rect.top;
      setHudProgress(Math.min(Math.max(total > 0 ? passed / total : 0, 0), 1));
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { obs.disconnect(); removeEventListener('scroll', onScroll); };
  }, [items.length]);

  /* lightbox keyboard nav */
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = e => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox(i => Math.min(i + 1, items.length - 1));
      if (e.key === 'ArrowLeft') setLightbox(i => Math.max(i - 1, 0));
    };
    document.body.classList.add('locked');
    addEventListener('keydown', onKey);
    return () => { document.body.classList.remove('locked'); removeEventListener('keydown', onKey); };
  }, [lightbox, items.length]);

  const jumpTo = (i) => {
    const el = galleryRef.current?.querySelector(`[data-i="${i}"]`);
    if (el) el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  };

  const title = pick(project.name, lang) || pick(intro, lang);

  return (
    <div className="cs-page">
      <div className="grain" aria-hidden="true" />

      <div className="cs-header">
        <Link className="cs-back" to="/">← Portfolio</Link>
        <span className="cs-hdr-right">{pick(project.tags, lang)}</span>
      </div>

      <section className="cs-intro">
        {intro.category && <div className="cs-eyebrow">{intro.category}</div>}
        <h1>
          {intro.titleMain || title}{intro.titleAccent && <em> {intro.titleAccent}</em>}
        </h1>
        {intro.subtitle && <p className="cs-intro-sub">{intro.subtitle}</p>}
        {!!(intro.meta && intro.meta.length) && (
          <div className="cs-meta-row">
            {intro.meta.map((m, i) => (
              <div className="cs-meta-item" key={i}>
                <span>{m.label}</span>
                <b>{m.link ? <a href={m.link} target="_blank" rel="noopener noreferrer">{m.value} ↗</a> : m.value}</b>
              </div>
            ))}
          </div>
        )}
      </section>

      {items.length > 1 && (
        <div className="cs-scroll-hud" aria-hidden="true">
          <span className="cs-hud-idx">{String(hudIdx).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
          <span className="cs-hud-bar"><i style={{ width: `${hudProgress * 100}%` }} /></span>
        </div>
      )}

      <div className="cs-gallery" ref={galleryRef}>
        {items.map((it, i) => (
          <div className="cs-gitem cs-reveal" key={it.id || i} data-i={i}>
            <div className="cs-gframe" onClick={() => (it.type === 'image' || it.type === 'gif') && setLightbox(i)}>
              {it.type === 'video'
                ? <video src={it.url} controls playsInline muted loop preload="metadata" />
                : <img src={it.url} alt={it.name || title} loading={i < 2 ? 'eager' : 'lazy'} />}
            </div>
            {(it.name || it.tag) && (
              <div className="cs-gcap">
                <div>
                  {it.name && <div className="cs-gname">{it.name}</div>}
                  {it.tag && <div className="cs-gtag">{it.tag}</div>}
                </div>
                <div className="cs-gidx">{String(i + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={`cs-lightbox${lightbox !== null ? ' open' : ''}`}>
        <button className="cs-lb-close" aria-label="Close" onClick={() => setLightbox(null)}><X size={16} weight="bold" /></button>
        {lightbox !== null && lightbox > 0 && (
          <button className="cs-lb-nav cs-l" aria-label="Previous" onClick={() => setLightbox(i => i - 1)}><CaretLeft size={16} weight="bold" /></button>
        )}
        {lightbox !== null && lightbox < items.length - 1 && (
          <button className="cs-lb-nav cs-r" aria-label="Next" onClick={() => setLightbox(i => i + 1)}><CaretRight size={16} weight="bold" /></button>
        )}
        {lightbox !== null && items[lightbox] && (
          <>
            <img src={items[lightbox].url} alt={items[lightbox].name || ''} />
            <div className="cs-lb-cap">{[items[lightbox].name, items[lightbox].tag].filter(Boolean).join(' — ')}</div>
          </>
        )}
      </div>

      {items.length > 1 && (
        <section className="cs-roster">
          <div className="cs-eyebrow cs-reveal">All {items.length} <span style={{ marginLeft: 'auto', opacity: .5 }}>Click any to jump</span></div>
          <div className="cs-roster-grid">
            {items.map((it, i) => (
              <div className="cs-rrow" key={it.id || i} onClick={() => jumpTo(i)}>
                <span className="cs-idx">{String(i + 1).padStart(2, '0')}</span>
                <span className="cs-rname">{it.name || `Item ${i + 1}`}</span>
                <span className="cs-rtag">{it.tag}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {project.external_url && (
        <div className="cs-external">
          <a href={project.external_url} target="_blank" rel="noopener noreferrer" className="cs-external-link">
            View full case on Behance <ArrowUpRight size={14} weight="bold" />
          </a>
        </div>
      )}

      <div className="cs-footer">
        <p className="cs-foot-eyebrow">Need something that works this hard?</p>
        <a className="cs-foot-cta" href="mailto:cookiekiller.design@gmail.com">Let's <span className="cs-swap">talk.</span></a>
        <br />
        <a className="cs-foot-mail" href="mailto:cookiekiller.design@gmail.com">cookiekiller.design@gmail.com →</a>
        <p className="cs-foot-fine">© 2026 Mihail Barascov · cookiekiller® · Chisinau, MD</p>
      </div>
    </div>
  );
}

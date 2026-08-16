import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, X, CaretLeft, CaretRight, ArrowDown } from '@phosphor-icons/react';
import './filmstrip.css';

function pick(field, lang) {
  if (!field) return '';
  return field[lang] || field.en || Object.values(field)[0] || '';
}

export default function FilmstripTemplate({ project, lang }) {
  const content = project.content || {};
  const intro = content.intro || {};
  const items = content.gallery || [];

  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const [introOut, setIntroOut] = useState(false);

  const title = pick(project.name, lang) || pick(intro, lang);

  /* desktop: convert vertical wheel into horizontal scroll across the strip */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
    if (!FINE) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // let native horizontal trackpad gestures through
      e.preventDefault();
      track.scrollLeft += e.deltaY * 1.15;
    };
    track.addEventListener('wheel', onWheel, { passive: false });
    return () => track.removeEventListener('wheel', onWheel);
  }, []);

  /* drag-to-scroll with the mouse */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let down = false, startX = 0, startScroll = 0, moved = false;
    const onDown = (e) => { down = true; moved = false; startX = e.clientX; startScroll = track.scrollLeft; track.classList.add('fs-grabbing'); };
    const onMove = (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startScroll - dx;
    };
    const onUp = () => { down = false; track.classList.remove('fs-grabbing'); };
    track.addEventListener('pointerdown', onDown);
    addEventListener('pointermove', onMove);
    addEventListener('pointerup', onUp);
    track.__wasDragged = () => moved;
    return () => {
      track.removeEventListener('pointerdown', onDown);
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerup', onUp);
    };
  }, []);

  /* track which frame is centered + fade the intro overlay once scrolling starts */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      setIntroOut(track.scrollLeft > 40);
      const frames = [...track.querySelectorAll('.fs-frame')];
      const center = track.scrollLeft + track.clientWidth / 2;
      let closest = 0, closestD = Infinity;
      frames.forEach((f, i) => {
        const d = Math.abs((f.offsetLeft + f.offsetWidth / 2) - center);
        if (d < closestD) { closestD = d; closest = i; }
      });
      setActive(closest);
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => track.removeEventListener('scroll', onScroll);
  }, [items.length]);

  const scrollToIndex = (i) => {
    const track = trackRef.current;
    const frame = track?.querySelector(`[data-i="${i}"]`);
    if (frame) frame.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

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

  return (
    <div className="fs-page">
      <div className="grain" aria-hidden="true" />

      <div className="fs-header">
        <Link className="fs-back" to="/">← Portfolio</Link>
        <span className="fs-hdr-right">{pick(project.tags, lang)}</span>
      </div>

      <div className={`fs-intro${introOut ? ' fs-out' : ''}`}>
        {intro.category && <div className="fs-eyebrow">{intro.category}</div>}
        <h1>{intro.titleMain || title}{intro.titleAccent && <em> {intro.titleAccent}</em>}</h1>
        {intro.subtitle && <p className="fs-intro-sub">{intro.subtitle}</p>}
        {items.length > 0 && (
          <div className="fs-scroll-hint"><ArrowDown size={14} weight="bold" className="fs-hint-icon" />Scroll to explore</div>
        )}
      </div>

      <div className="fs-track" ref={trackRef}>
        <div className="fs-spacer" aria-hidden="true" />
        {items.map((it, i) => (
          <div
            className={`fs-frame${active === i ? ' fs-active' : ''}`}
            key={it.id || i}
            data-i={i}
            onClick={() => { if (!trackRef.current.__wasDragged || !trackRef.current.__wasDragged()) setLightbox(i); }}
          >
            {it.type === 'video'
              ? <video src={it.url} autoPlay muted loop playsInline preload="metadata" />
              : <img src={it.url} alt={it.name || title} loading={i < 2 ? 'eager' : 'lazy'} draggable={false} />}
            {(it.name || it.tag) && (
              <div className="fs-cap">
                {it.name && <span className="fs-cap-name">{it.name}</span>}
                {it.tag && <span className="fs-cap-tag">{it.tag}</span>}
              </div>
            )}
          </div>
        ))}
        {project.external_url && (
          <div className="fs-frame fs-frame--cta">
            <a href={project.external_url} target="_blank" rel="noopener noreferrer">
              <span>Full case<br />on Behance</span>
              <ArrowUpRight size={22} weight="bold" />
            </a>
          </div>
        )}
        <div className="fs-spacer" aria-hidden="true" />
      </div>

      {items.length > 1 && (
        <div className="fs-dots" role="tablist" aria-label="Slides">
          {items.map((_, i) => (
            <button key={i} className={active === i ? 'fs-active' : ''} onClick={() => scrollToIndex(i)} aria-label={`Go to slide ${i + 1}`} />
          ))}
        </div>
      )}

      <div className={`fs-lightbox${lightbox !== null ? ' open' : ''}`}>
        <button className="fs-lb-close" aria-label="Close" onClick={() => setLightbox(null)}><X size={16} weight="bold" /></button>
        {lightbox !== null && lightbox > 0 && (
          <button className="fs-lb-nav fs-l" aria-label="Previous" onClick={() => setLightbox(i => i - 1)}><CaretLeft size={16} weight="bold" /></button>
        )}
        {lightbox !== null && lightbox < items.length - 1 && (
          <button className="fs-lb-nav fs-r" aria-label="Next" onClick={() => setLightbox(i => i + 1)}><CaretRight size={16} weight="bold" /></button>
        )}
        {lightbox !== null && items[lightbox] && (
          items[lightbox].type === 'video'
            ? <video src={items[lightbox].url} controls autoPlay playsInline />
            : <img src={items[lightbox].url} alt={items[lightbox].name || ''} />
        )}
        {lightbox !== null && items[lightbox] && (items[lightbox].name || items[lightbox].tag) && (
          <div className="fs-lb-cap">{[items[lightbox].name, items[lightbox].tag].filter(Boolean).join(' — ')}</div>
        )}
      </div>

      <div className="fs-footer">
        <p className="fs-foot-eyebrow">Need something that works this hard?</p>
        <a className="fs-foot-cta" href="mailto:cookiekiller.design@gmail.com">Let's <span className="fs-swap">talk.</span></a>
        <br />
        <a className="fs-foot-mail" href="mailto:cookiekiller.design@gmail.com">cookiekiller.design@gmail.com →</a>
        <p className="fs-foot-fine">© 2026 Mihail Barascov · cookiekiller® · Chisinau, MD</p>
      </div>
    </div>
  );
}

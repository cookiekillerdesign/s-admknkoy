import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { detectLang } from '../i18n';
import { fetchProjectBySlug } from '../lib/projects';
import CaseStudyTemplate from './templates/CaseStudyTemplate';
import FilmstripTemplate from './templates/FilmstripTemplate';

export default function ProjectPage() {
  const { slug } = useParams();
  const [state, setState] = useState({ loading: true, project: null });
  const lang = detectLang();

  useEffect(() => {
    let alive = true;
    setState({ loading: true, project: null });
    fetchProjectBySlug(slug).then(project => {
      if (alive) setState({ loading: false, project });
    });
    return () => { alive = false; };
  }, [slug]);

  useEffect(() => {
    if (state.project) {
      document.title = `${state.project.name?.[lang] || state.project.name?.en || state.project.slug} — cookiekiller®`;
    }
  }, [state.project, lang]);

  if (state.loading) {
    return <div style={{ minHeight: '100vh', background: 'var(--ink)' }} />;
  }

  if (!state.project) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 18,
        alignItems: 'center', justifyContent: 'center', background: 'var(--ink)', color: 'var(--paper)',
        fontFamily: 'var(--body)', textAlign: 'center', padding: 24
      }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .6 }}>404</p>
        <h1 style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: 'clamp(28px,5vw,48px)' }}>Project not found</h1>
        <Link to="/" style={{
          fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase',
          border: '1px solid rgba(241,240,236,.3)', borderRadius: 99, padding: '12px 22px'
        }}>← Back to portfolio</Link>
      </div>
    );
  }

  const project = state.project;
  return project.template === 2
    ? <FilmstripTemplate project={project} lang={lang} />
    : <CaseStudyTemplate project={project} lang={lang} />;
}

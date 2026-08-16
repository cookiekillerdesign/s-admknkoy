import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, DotsSixVertical, Trash, Eye, EyeSlash, SignOut, ArrowSquareOut } from '@phosphor-icons/react';
import { fetchAllProjectsForAdmin, createProject, deleteProject, updateProject, reorderProjects } from '../lib/projects';
import { signOut } from '../lib/auth';
import './admin.css';

export default function AdminDashboard() {
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dragIndex = useRef(null);

  const load = () => {
    fetchAllProjectsForAdmin().then(setProjects).catch(err => setError(err.message));
  };
  useEffect(load, []);

  const handleCreate = async () => {
    try {
      const p = await createProject({});
      navigate(`/admin/projects/${p.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (p) => {
    if (!confirm(`Удалить проект «${p.name?.en || p.slug}»? Это действие необратимо.`)) return;
    try {
      await deleteProject(p.id);
      setProjects(prev => prev.filter(x => x.id !== p.id));
    } catch (err) {
      setError(err.message);
    }
  };

  const togglePublished = async (p) => {
    try {
      const updated = await updateProject(p.id, { published: !p.published });
      setProjects(prev => prev.map(x => x.id === p.id ? updated : x));
    } catch (err) {
      setError(err.message);
    }
  };

  /* native HTML5 drag & drop reorder */
  const onDragStart = (i) => { dragIndex.current = i; };
  const onDragOver = (e, i) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === i) return;
    setProjects(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex.current, 1);
      next.splice(i, 0, moved);
      dragIndex.current = i;
      return next;
    });
  };
  const onDragEnd = async () => {
    dragIndex.current = null;
    try {
      await reorderProjects(projects.map(p => p.id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="adm-dash">
      <div className="adm-topbar">
        <div>
          <h1>Проекты</h1>
          <p className="adm-sub">Перетаскивай строки, чтобы поменять порядок — так же они будут идти на главной.</p>
        </div>
        <div className="adm-topbar-actions">
          <a href="/" target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-ghost"><ArrowSquareOut size={15} weight="bold" />Сайт</a>
          <button className="adm-btn adm-btn-ghost" onClick={() => signOut()}><SignOut size={15} weight="bold" />Выйти</button>
          <button className="adm-btn adm-btn-primary" onClick={handleCreate}><Plus size={15} weight="bold" />Новый проект</button>
        </div>
      </div>

      {error && <div className="adm-error adm-error-block">{error}</div>}

      {!projects ? (
        <div className="adm-loading-rows">Загружаю…</div>
      ) : (
        <div className="adm-list">
          {projects.map((p, i) => (
            <div
              className="adm-row"
              key={p.id}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={(e) => onDragOver(e, i)}
              onDragEnd={onDragEnd}
            >
              <span className="adm-drag"><DotsSixVertical size={18} weight="bold" /></span>
              <span className="adm-row-thumb" style={{ background: (p.thumb || p.preview_img) ? undefined : p.hue + '22' }}>
                {(p.thumb || p.preview_img)
                  ? <img src={p.thumb || p.preview_img} alt="" />
                  : <span style={{ color: p.hue }}>{(p.name?.en || p.slug || '?').slice(0, 2).toUpperCase()}</span>}
              </span>
              <div className="adm-row-main">
                <Link to={`/admin/projects/${p.id}`} className="adm-row-name">{p.name?.en || '(без названия)'}</Link>
                <span className="adm-row-meta">/{p.slug} · шаблон {p.template} · {p.status}</span>
              </div>
              <button className={`adm-pill ${p.published ? 'adm-pill-live' : ''}`} onClick={() => togglePublished(p)}>
                {p.published ? <><Eye size={13} weight="bold" />Опубликован</> : <><EyeSlash size={13} weight="bold" />Черновик</>}
              </button>
              <Link to={`/admin/projects/${p.id}`} className="adm-btn adm-btn-ghost">Редактировать</Link>
              <button className="adm-btn adm-btn-danger" onClick={() => handleDelete(p)}><Trash size={15} weight="bold" /></button>
            </div>
          ))}
          {!projects.length && <div className="adm-empty">Проектов пока нет — нажми «Новый проект».</div>}
        </div>
      )}
    </div>
  );
}

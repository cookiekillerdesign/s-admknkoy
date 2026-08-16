import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, FloppyDisk, Trash, Plus, DotsSixVertical, X, ArrowSquareOut,
  Image as ImageIcon, VideoCamera, FilmSlate
} from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';
import { updateProject, deleteProject, slugify, deleteMedia, emptyContent } from '../lib/projects';
import MediaUploader from './MediaUploader';
import './admin.css';

const LANGS = ['en', 'ru', 'ro'];
const LANG_LABEL = { en: 'EN', ru: 'RU', ro: 'RO' };

export default function ProjectEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [nameLang, setNameLang] = useState('en');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const dragIndex = useRef(null);

  useEffect(() => {
    let alive = true;
    supabase.from('projects').select('*').eq('id', id).single().then(({ data, error: err }) => {
      if (!alive) return;
      if (err || !data) { setError('Проект не найден.'); return; }
      setProject({ ...data, name: data.name || {}, tags: data.tags || {}, content: { ...emptyContent(), ...(data.content || {}) } });
    });
    return () => { alive = false; };
  }, [id]);

  const patch = (fn) => {
    setProject(prev => { const next = typeof fn === 'function' ? fn(structuredClone(prev)) : { ...prev, ...fn }; return next; });
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await updateProject(project.id, {
        slug: project.slug,
        status: project.status,
        hue: project.hue,
        template: project.template,
        published: project.published,
        thumb: project.thumb,
        preview_img: project.preview_img,
        external_url: project.external_url,
        name: project.name,
        tags: project.tags,
        content: project.content
      });
      setProject({ ...updated, content: { ...emptyContent(), ...(updated.content || {}) } });
      setDirty(false);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1800);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить проект без возможности восстановления?')) return;
    try {
      await deleteProject(project.id);
      navigate('/admin/dashboard');
    } catch (e) {
      setError(e.message);
    }
  };

  if (error && !project) {
    return <div className="adm-dash"><div className="adm-error adm-error-block">{error}</div><Link to="/admin/dashboard" className="adm-btn adm-btn-ghost">← Назад</Link></div>;
  }
  if (!project) return <div className="adm-dash adm-loading" />;

  const gallery = project.content.gallery || [];
  const meta = project.content.intro.meta || [];

  /* ---- gallery item helpers ---- */
  const addMedia = (items) => {
    patch(p => { p.content.gallery = [...(p.content.gallery || []), ...items]; return p; });
  };
  const updateItem = (i, field, value) => {
    patch(p => { p.content.gallery[i] = { ...p.content.gallery[i], [field]: value }; return p; });
  };
  const removeItem = async (i) => {
    const item = gallery[i];
    patch(p => { p.content.gallery.splice(i, 1); return p; });
    if (item?.path) deleteMedia(item.path).catch(() => {});
  };
  const onItemDragStart = (i) => { dragIndex.current = i; };
  const onItemDragOver = (e, i) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === i) return;
    patch(p => {
      const arr = p.content.gallery;
      const [moved] = arr.splice(dragIndex.current, 1);
      arr.splice(i, 0, moved);
      dragIndex.current = i;
      return p;
    });
  };

  /* ---- meta row helpers ---- */
  const addMetaRow = () => patch(p => { p.content.intro.meta = [...(p.content.intro.meta || []), { label: '', value: '', link: '' }]; return p; });
  const updateMetaRow = (i, field, value) => patch(p => { p.content.intro.meta[i][field] = value; return p; });
  const removeMetaRow = (i) => patch(p => { p.content.intro.meta.splice(i, 1); return p; });

  return (
    <div className="adm-dash">
      <div className="adm-topbar">
        <div className="adm-topbar-left">
          <Link to="/admin/dashboard" className="adm-btn adm-btn-ghost"><ArrowLeft size={15} weight="bold" /></Link>
          <div>
            <h1>{project.name.en || '(без названия)'}</h1>
            <p className="adm-sub">/{project.slug}</p>
          </div>
        </div>
        <div className="adm-topbar-actions">
          {project.published && (
            <a href={`/project/${project.slug}`} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-ghost">
              <ArrowSquareOut size={15} weight="bold" />Открыть
            </a>
          )}
          <button className="adm-btn adm-btn-danger" onClick={handleDelete}><Trash size={15} weight="bold" /></button>
          <button className="adm-btn adm-btn-primary" onClick={save} disabled={saving}>
            <FloppyDisk size={15} weight="bold" />{saving ? 'Сохраняю…' : savedFlash ? 'Сохранено ✓' : 'Сохранить'}
          </button>
        </div>
      </div>

      {error && <div className="adm-error adm-error-block">{error}</div>}

      <div className="adm-grid">
        {/* ===== basic settings ===== */}
        <section className="adm-card">
          <h2>Основное</h2>
          <div className="adm-field-row">
            <label className="adm-field">
              <span>Slug (адрес страницы)</span>
              <input value={project.slug} onChange={e => patch({ slug: slugify(e.target.value) })} />
            </label>
            <label className="adm-field adm-field-sm">
              <span>Цвет</span>
              <input type="color" value={project.hue} onChange={e => patch({ hue: e.target.value })} />
            </label>
          </div>
          <div className="adm-field-row">
            <label className="adm-field">
              <span>Статус</span>
              <select value={project.status} onChange={e => patch({ status: e.target.value })}>
                <option value="case">Case study</option>
                <option value="live">Live</option>
                <option value="dev">In dev</option>
              </select>
            </label>
            <label className="adm-field adm-check">
              <input type="checkbox" checked={project.published} onChange={e => patch({ published: e.target.checked })} />
              <span>Опубликован на сайте</span>
            </label>
          </div>
          <label className="adm-field">
            <span>Внешняя ссылка (Behance и т.п., необязательно)</span>
            <input value={project.external_url || ''} onChange={e => patch({ external_url: e.target.value })} placeholder="https://behance.net/gallery/…" />
          </label>

          <div className="adm-field">
            <span>Шаблон страницы проекта</span>
            <div className="adm-template-picker">
              <button type="button" className={`adm-template-card${project.template === 1 ? ' adm-active' : ''}`} onClick={() => patch({ template: 1 })}>
                <strong>Шаблон 1 — Кейс</strong>
                <small>Вертикальная лента: заголовок, описание, метаданные, крупные карточки с подписями. Как в примере HTML.</small>
              </button>
              <button type="button" className={`adm-template-card${project.template === 2 ? ' adm-active' : ''}`} onClick={() => patch({ template: 2 })}>
                <strong>Шаблон 2 — Лента</strong>
                <small>Горизонтальная лента фото/видео впритык друг к другу, скролл колесом мыши, drag, лайтбокс.</small>
              </button>
            </div>
          </div>
        </section>

        {/* ===== images used on the homepage ===== */}
        <section className="adm-card">
          <h2>Превью на главной</h2>
          <div className="adm-thumbs-row">
            <ThumbPicker label="Квадратная миниатюра (строка списка)" value={project.thumb} onChange={v => patch({ thumb: v })} />
            <ThumbPicker label="Большое превью (при наведении)" value={project.preview_img} onChange={v => patch({ preview_img: v })} />
          </div>
        </section>

        {/* ===== trilingual name & tags ===== */}
        <section className="adm-card">
          <h2>Название и теги <span className="adm-hint">(на 3 языках — показывается на главной)</span></h2>
          <div className="adm-lang-tabs">
            {LANGS.map(l => (
              <button key={l} type="button" className={nameLang === l ? 'adm-active' : ''} onClick={() => setNameLang(l)}>{LANG_LABEL[l]}</button>
            ))}
          </div>
          <label className="adm-field">
            <span>Название</span>
            <input value={project.name[nameLang] || ''} onChange={e => patch(p => { p.name[nameLang] = e.target.value; return p; })} />
          </label>
          <label className="adm-field">
            <span>Теги (например: «E-Commerce · UX/UI»)</span>
            <input value={project.tags[nameLang] || ''} onChange={e => patch(p => { p.tags[nameLang] = e.target.value; return p; })} />
          </label>
        </section>

        {/* ===== case-study intro ===== */}
        <section className="adm-card">
          <h2>Текст страницы проекта</h2>
          <div className="adm-field-row">
            <label className="adm-field">
              <span>Категория (эйброу)</span>
              <input value={project.content.intro.category || ''} onChange={e => patch(p => { p.content.intro.category = e.target.value; return p; })} placeholder="Case study · Branding" />
            </label>
          </div>
          <div className="adm-field-row">
            <label className="adm-field">
              <span>Заголовок</span>
              <input value={project.content.intro.titleMain || ''} onChange={e => patch(p => { p.content.intro.titleMain = e.target.value; return p; })} />
            </label>
            <label className="adm-field">
              <span>Акцентная часть заголовка (синим)</span>
              <input value={project.content.intro.titleAccent || ''} onChange={e => patch(p => { p.content.intro.titleAccent = e.target.value; return p; })} />
            </label>
          </div>
          <label className="adm-field">
            <span>Подзаголовок</span>
            <textarea rows={3} value={project.content.intro.subtitle || ''} onChange={e => patch(p => { p.content.intro.subtitle = e.target.value; return p; })} />
          </label>

          <div className="adm-subhead">
            <span>Метаданные (Client / Role / Year …)</span>
            <button type="button" className="adm-btn adm-btn-ghost adm-btn-xs" onClick={addMetaRow}><Plus size={13} weight="bold" />Добавить строку</button>
          </div>
          {meta.map((m, i) => (
            <div className="adm-meta-row" key={i}>
              <input placeholder="Label" value={m.label} onChange={e => updateMetaRow(i, 'label', e.target.value)} />
              <input placeholder="Value" value={m.value} onChange={e => updateMetaRow(i, 'value', e.target.value)} />
              <input placeholder="Link (необязательно)" value={m.link || ''} onChange={e => updateMetaRow(i, 'link', e.target.value)} />
              <button type="button" className="adm-icon-btn" onClick={() => removeMetaRow(i)}><X size={14} weight="bold" /></button>
            </div>
          ))}
        </section>

        {/* ===== gallery / block editor ===== */}
        <section className="adm-card adm-card-wide">
          <h2>Медиа <span className="adm-hint">(фото, видео, гифки — перетаскивай, чтобы менять порядок)</span></h2>
          <MediaUploader onAdd={addMedia} />
          <div className="adm-gallery-editor">
            {gallery.map((it, i) => (
              <div
                className="adm-gallery-item"
                key={it.id || i}
                draggable
                onDragStart={() => onItemDragStart(i)}
                onDragOver={(e) => onItemDragOver(e, i)}
                onDragEnd={() => { dragIndex.current = null; }}
              >
                <span className="adm-drag"><DotsSixVertical size={16} weight="bold" /></span>
                <div className="adm-gallery-thumb">
                  {it.type === 'video'
                    ? <video src={it.url} muted />
                    : <img src={it.url} alt="" />}
                  <span className="adm-gallery-type">
                    {it.type === 'video' ? <VideoCamera size={12} weight="bold" /> : it.type === 'gif' ? <FilmSlate size={12} weight="bold" /> : <ImageIcon size={12} weight="bold" />}
                    {it.type}
                  </span>
                </div>
                <div className="adm-gallery-fields">
                  <input placeholder="Название" value={it.name || ''} onChange={e => updateItem(i, 'name', e.target.value)} />
                  <input placeholder="Тег / подпись" value={it.tag || ''} onChange={e => updateItem(i, 'tag', e.target.value)} />
                </div>
                <button type="button" className="adm-icon-btn" onClick={() => removeItem(i)}><X size={14} weight="bold" /></button>
              </div>
            ))}
            {!gallery.length && <div className="adm-empty">Пока нет медиа — загрузи фото, видео или гифки выше.</div>}
          </div>
        </section>
      </div>

      <div className="adm-savebar">
        <span>{dirty ? 'Есть несохранённые изменения' : 'Все изменения сохранены'}</span>
        <button className="adm-btn adm-btn-primary" onClick={save} disabled={saving || !dirty}>
          <FloppyDisk size={15} weight="bold" />{saving ? 'Сохраняю…' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
}

function ThumbPicker({ label, value, onChange }) {
  return (
    <div className="adm-thumb-picker">
      <span className="adm-thumb-label">{label}</span>
      {value ? (
        <div className="adm-thumb-preview">
          <img src={value} alt="" />
          <button type="button" className="adm-icon-btn adm-thumb-remove" onClick={() => onChange('')}><X size={14} weight="bold" /></button>
        </div>
      ) : (
        <MediaUploader label="Загрузить изображение" onAdd={(items) => items[0] && onChange(items[0].url)} />
      )}
    </div>
  );
}

import { supabase, supabaseReady } from './supabase';

/* ============================================================
 * Static fallback — used when Supabase isn't configured yet
 * (e.g. first local run before you set up .env) or if a fetch
 * fails for any reason, so the homepage never renders empty.
 * Shape matches what the DB returns after normalizeRow().
 * ============================================================ */
export const STATIC_PROJECTS = [
  { id: 's1', slug: 'victoriabank', name: { en: 'Victoriabank', ru: 'Victoriabank', ro: 'Victoriabank' }, status: 'case', hue: '#1B3BFF', template: 1, thumb: '', preview_img: '', external_url: '', tags: { en: 'Banking Platform · Product Design', ru: 'Банковская платформа · Продуктовый дизайн', ro: 'Platformă bancară · Product Design' }, content: {} },
  { id: 's2', slug: 'my-doctor-32', name: { en: 'My Doctor 32', ru: 'My Doctor 32', ro: 'My Doctor 32' }, status: 'live', hue: '#00B549', template: 1, thumb: '', preview_img: '', external_url: '', tags: { en: 'Healthcare Platform · Product Design', ru: 'Платформа здравоохранения · Продуктовый дизайн', ro: 'Platformă medicală · Product Design' }, content: {} },
  { id: 's3', slug: 'point-money', name: { en: 'Point Money', ru: 'Point Money', ro: 'Point Money' }, status: 'case', hue: '#0F0F13', template: 1, thumb: '', preview_img: '', external_url: '', tags: { en: 'iOS App · Product & UX/UI', ru: 'iOS-приложение · Продукт и UX/UI', ro: 'Aplicație iOS · Product & UX/UI' }, content: {} },
  { id: 's4', slug: 'zazitex', name: { en: 'Zazitex.com', ru: 'Zazitex.com', ro: 'Zazitex.com' }, status: 'live', hue: '#1B3BFF', template: 1, thumb: '', preview_img: '', external_url: '', tags: { en: 'Agency Website · UX/UI', ru: 'Сайт агентства · UX/UI', ro: 'Site de agenție · UX/UI' }, content: {} },
  { id: 's5', slug: 'conutache', name: { en: "Conu'Tache", ru: "Conu'Tache", ro: "Conu'Tache" }, status: 'live', hue: '#B4530A', template: 1, thumb: '', preview_img: '', external_url: '', tags: { en: 'E-Commerce · UX/UI', ru: 'Интернет-магазин · UX/UI', ro: 'E-Commerce · UX/UI' }, content: {} },
  { id: 's6', slug: 'promez', name: { en: 'Promez', ru: 'Promez', ro: 'Promez' }, status: 'live', hue: '#0E7490', template: 1, thumb: '', preview_img: '', external_url: '', tags: { en: 'E-Commerce · UX/UI', ru: 'Интернет-магазин · UX/UI', ro: 'E-Commerce · UX/UI' }, content: {} },
  { id: 's7', slug: 'des-champs', name: { en: 'Des Champs', ru: 'Des Champs', ro: 'Des Champs' }, status: 'live', hue: '#4D7C0F', template: 1, thumb: '', preview_img: '', external_url: '', tags: { en: 'E-Commerce · UX/UI', ru: 'Интернет-магазин · UX/UI', ro: 'E-Commerce · UX/UI' }, content: {} },
  { id: 's8', slug: 'yuca-vpn', name: { en: 'YUCA VPN', ru: 'YUCA VPN', ro: 'YUCA VPN' }, status: 'live', hue: '#6D28D9', template: 1, thumb: '', preview_img: '', external_url: '', tags: { en: 'Android App · Branding & UX/UI', ru: 'Android-приложение · Брендинг и UX/UI', ro: 'Aplicație Android · Branding & UX/UI' }, content: {} },
  { id: 's9', slug: 'riongo', name: { en: 'Riongo', ru: 'Riongo', ro: 'Riongo' }, status: 'dev', hue: '#FF3B30', template: 1, thumb: '', preview_img: '', external_url: '', tags: { en: 'UX/UI Design', ru: 'UX/UI дизайн', ro: 'Design UX/UI' }, content: {} },
  { id: 's10', slug: 'pawsome-world', name: { en: 'Pawsome.world', ru: 'Pawsome.world', ro: 'Pawsome.world' }, status: 'dev', hue: '#EA580C', template: 1, thumb: '', preview_img: '', external_url: '', tags: { en: 'Pets App · UX/UI', ru: 'Приложение для питомцев · UX/UI', ro: 'Aplicație pentru animale de companie · UX/UI' }, content: {} },
  { id: 's11', slug: 'logofolio', name: { en: 'Logos for Business', ru: 'Логотипы для бизнеса', ro: 'Logo-uri pentru afaceri' }, status: 'case', hue: '#0F0F13', template: 2, thumb: '/assets/logofolio/thumb-logofolio.png', preview_img: '/assets/logofolio/Content.png', external_url: 'https://www.behance.net/gallery/247319791/Logofolio-2025-2026', tags: { en: 'Branding · Logos', ru: 'Брендинг · Логотипы', ro: 'Branding · Logo-uri' }, content: {} },
  { id: 's12', slug: 'rock-metal-stage-md', name: { en: 'Rock / Metal Stage MD', ru: 'Rock / Metal Stage MD', ro: 'Rock / Metal Stage MD' }, status: 'case', hue: '#0F0F13', template: 1, thumb: '', preview_img: '', external_url: '', tags: { en: 'Branding · Logos', ru: 'Брендинг · Логотипы', ro: 'Branding · Logo-uri' }, content: {} }
].map((p, i) => ({ ...p, order_index: i, published: true }));

/* ============================================================
 * helpers
 * ============================================================ */
export function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'project';
}

export function emptyContent() {
  return {
    intro: { category: '', titleMain: '', titleAccent: '', subtitle: '', meta: [] },
    gallery: []
  };
}

function normalizeRow(row) {
  return {
    ...row,
    name: row.name || {},
    tags: row.tags || {},
    content: { ...emptyContent(), ...(row.content || {}) }
  };
}

/* ============================================================
 * public reads (used by the live site)
 * ============================================================ */
export async function fetchPublishedProjects() {
  if (!supabaseReady) return STATIC_PROJECTS;
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .order('order_index', { ascending: true });
  if (error || !data || !data.length) return STATIC_PROJECTS;
  return data.map(normalizeRow);
}

export async function fetchProjectBySlug(slug) {
  if (!supabaseReady) return STATIC_PROJECTS.find(p => p.slug === slug) || null;
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) return STATIC_PROJECTS.find(p => p.slug === slug) || null;
  return normalizeRow(data);
}

/* ============================================================
 * admin reads/writes (require an authenticated session — RLS
 * on the `projects` table enforces this server-side too)
 * ============================================================ */
export async function fetchAllProjectsForAdmin() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('order_index', { ascending: true });
  if (error) throw error;
  return (data || []).map(normalizeRow);
}

export async function createProject(partial) {
  const { data: existing } = await supabase
    .from('projects')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1);
  const nextOrder = existing && existing[0] ? existing[0].order_index + 1 : 0;

  const { data, error } = await supabase
    .from('projects')
    .insert({
      slug: partial.slug || slugify(partial.name?.en || 'new-project'),
      order_index: nextOrder,
      status: 'case',
      hue: '#1B3BFF',
      template: 1,
      published: false,
      name: { en: 'New project', ru: 'Новый проект', ro: 'Proiect nou' },
      tags: { en: '', ru: '', ro: '' },
      content: emptyContent()
    })
    .select()
    .single();
  if (error) throw error;
  return normalizeRow(data);
}

export async function updateProject(id, patch) {
  const { data, error } = await supabase
    .from('projects')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return normalizeRow(data);
}

export async function deleteProject(id) {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}

/** Persist a full new ordering. `orderedIds` = array of project ids, top to bottom. */
export async function reorderProjects(orderedIds) {
  const updates = orderedIds.map((id, i) =>
    supabase.from('projects').update({ order_index: i }).eq('id', id)
  );
  const results = await Promise.all(updates);
  const failed = results.find(r => r.error);
  if (failed) throw failed.error;
}

/* ============================================================
 * media upload (images / gifs / video) → Supabase Storage
 * ============================================================ */
export async function uploadMedia(file, { onProgress } = {}) {
  const ext = file.name.split('.').pop().toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from('project-media')
    .upload(path, file, { cacheControl: '31536000', upsert: false });
  if (error) throw error;
  if (onProgress) onProgress(100);

  const { data } = supabase.storage.from('project-media').getPublicUrl(path);
  const type = file.type.startsWith('video/') ? 'video' : (ext === 'gif' ? 'gif' : 'image');
  return { url: data.publicUrl, type, path };
}

export async function deleteMedia(path) {
  if (!path) return;
  await supabase.storage.from('project-media').remove([path]);
}

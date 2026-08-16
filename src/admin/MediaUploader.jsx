import { useRef, useState } from 'react';
import { UploadSimple, SpinnerGap } from '@phosphor-icons/react';
import { uploadMedia } from '../lib/projects';

/** Drop zone / file picker. Calls onAdd([{id,type,url,name,tag,path}, ...]) once uploads finish. */
export default function MediaUploader({ onAdd, label = 'Добавить фото, видео или гифки' }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [err, setErr] = useState('');

  const handleFiles = async (fileList) => {
    const files = [...fileList].filter(f => /^image\/|^video\//.test(f.type));
    if (!files.length) return;
    setBusy(true);
    setErr('');
    try {
      const uploaded = [];
      for (const file of files) {
        const res = await uploadMedia(file);
        uploaded.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: res.type,
          url: res.url,
          path: res.path,
          name: '',
          tag: ''
        });
      }
      onAdd(uploaded);
    } catch (e) {
      setErr(e.message || 'Не удалось загрузить файл.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`adm-dropzone${dragOver ? ' adm-dropzone-over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        style={{ display: 'none' }}
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />
      {busy
        ? <><SpinnerGap size={20} weight="bold" className="adm-spin" /><span>Загружаю…</span></>
        : <><UploadSimple size={20} weight="bold" /><span>{label}</span></>}
      {err && <div className="adm-error" onClick={(e) => e.stopPropagation()}>{err}</div>}
    </div>
  );
}

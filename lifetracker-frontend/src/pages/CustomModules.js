import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Page.css';
import './CustomModules.css';

const FIELD_TYPES = ['text', 'number', 'date', 'dropdown', 'boolean'];
const EMOJI_OPTIONS = ['📋','📚','🎯','🎮','💤','🧘','🌿','💡','🎵','✈️','📸','🛒','💊','🌙','⚡'];

export default function CustomModules() {
  const [modules, setModules]     = useState([]);
  const [creating, setCreating]   = useState(false);
  const [moduleName, setModuleName]   = useState('');
  const [moduleIcon, setModuleIcon]   = useState('📋');
  const [moduleDesc, setModuleDesc]   = useState('');
  const [fields, setFields]       = useState([{ name: '', label: '', type: 'text', required: false, options: '' }]);
  const navigate = useNavigate();

  const fetchModules = async () => {
    const res = await api.get('/custom/modules');
    setModules(res.data);
  };

  useEffect(() => { fetchModules(); }, []);

  const addField = () =>
    setFields([...fields, { name: '', label: '', type: 'text', required: false, options: '' }]);

  const updateField = (i, key, val) => {
    const updated = [...fields];
    updated[i][key] = val;
    // auto-generate field name from label
    if (key === 'label') updated[i].name = val.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    setFields(updated);
  };

  const removeField = (i) => setFields(fields.filter((_, idx) => idx !== i));

  const handleCreate = async (e) => {
    e.preventDefault();
    const fieldDefs = fields.map(f => ({
      name: f.name,
      label: f.label,
      type: f.type,
      required: f.required,
      ...(f.type === 'dropdown' ? { options: f.options.split(',').map(o => o.trim()).filter(Boolean) } : {})
    }));
    await api.post('/custom/modules', {
      name: moduleName,
      icon: moduleIcon,
      description: moduleDesc,
      fields: JSON.stringify(fieldDefs)
    });
    setCreating(false);
    setModuleName(''); setModuleDesc(''); setModuleIcon('📋');
    setFields([{ name: '', label: '', type: 'text', required: false, options: '' }]);
    fetchModules();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this module and all its data?')) return;
    await api.delete(`/custom/modules/${id}`);
    fetchModules();
  };

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">🧩 My Modules</h1>
          <p className="page-sub">Build your own custom trackers</p>
        </div>
        <button className="btn-primary" onClick={() => setCreating(!creating)}>
          {creating ? '✕ Cancel' : '+ New Module'}
        </button>
      </div>

      {/* Module Builder Form */}
      {creating && (
        <form className="builder-card" onSubmit={handleCreate}>
          <h3 className="builder-title">✨ Build a New Module</h3>

          <div className="builder-row">
            <div className="emoji-picker">
              {EMOJI_OPTIONS.map(e => (
                <button key={e} type="button"
                  className={`emoji-btn ${moduleIcon === e ? 'selected' : ''}`}
                  onClick={() => setModuleIcon(e)}>{e}</button>
              ))}
            </div>
          </div>

          <div className="builder-row">
            <input className="form-input" placeholder="Module name (e.g. Reading Log)" value={moduleName}
              onChange={e => setModuleName(e.target.value)} required style={{ flex: 2 }} />
            <input className="form-input" placeholder="Description (optional)" value={moduleDesc}
              onChange={e => setModuleDesc(e.target.value)} style={{ flex: 3 }} />
          </div>

          <div className="fields-section">
            <div className="fields-header">
              <span className="section-label">Fields</span>
              <button type="button" className="btn-outline" style={{ fontSize: 12, padding: '4px 12px' }} onClick={addField}>+ Add Field</button>
            </div>

            {fields.map((field, i) => (
              <div key={i} className="field-row">
                <input className="form-input" placeholder="Label (e.g. Book Title)" value={field.label}
                  onChange={e => updateField(i, 'label', e.target.value)} required style={{ flex: 2 }} />
                <select className="form-input" value={field.type}
                  onChange={e => updateField(i, 'type', e.target.value)}>
                  {FIELD_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                {field.type === 'dropdown' && (
                  <input className="form-input" placeholder="Options: a, b, c" value={field.options}
                    onChange={e => updateField(i, 'options', e.target.value)} />
                )}
                <label style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={field.required}
                    onChange={e => updateField(i, 'required', e.target.checked)} /> Required
                </label>
                {fields.length > 1 && (
                  <button type="button" className="btn-delete" onClick={() => removeField(i)}>×</button>
                )}
              </div>
            ))}
          </div>

          <button className="btn-primary" type="submit" style={{ marginTop: 8 }}>
            🚀 Create Module
          </button>
        </form>
      )}

      {/* Module Cards */}
      {modules.length === 0 && !creating ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>🧩</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 12 }}>No custom modules yet</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Create one to track anything you want!</div>
        </div>
      ) : (
        <div className="module-cards">
          {modules.map(m => {
            const fieldDefs = JSON.parse(m.fields || '[]');
            return (
              <div key={m.id} className="module-card-item" onClick={() => navigate(`/custom/${m.id}`)}>
                <div className="module-card-icon">{m.icon}</div>
                <div className="module-card-body">
                  <div className="module-card-name">{m.name}</div>
                  {m.description && <div className="module-card-desc">{m.description}</div>}
                  <div className="module-card-fields">
                    {fieldDefs.map(f => (
                      <span key={f.name} className="tag" style={{ fontSize: 10, marginRight: 4 }}>{f.label}</span>
                    ))}
                  </div>
                </div>
                <button className="btn-delete" style={{ marginLeft: 'auto' }}
                  onClick={e => { e.stopPropagation(); handleDelete(m.id); }}>×</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

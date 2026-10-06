import { useState, useEffect } from 'react';
import {
  getSnapshots,
  createSnapshot,
  updateSnapshot,
  deleteSnapshot,
  getSites,
} from '../api';

const INITIAL_FORM = {
  siteId: '',
  duration: '',
  docCount: 0,
  status: 'completed',
};

export default function SnapshotsSection({ sitesList = [] }) {
  const [snapshots, setSnapshots] = useState([]);
  const [sites, setSites] = useState(sitesList);
  const [filterSiteId, setFilterSiteId] = useState('');
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (sitesList.length > 0) {
      setSites(sitesList);
      if (!formData.siteId) {
        setFormData((prev) => ({ ...prev, siteId: sitesList[0]._id }));
      }
    } else {
      getSites()
        .then((data) => {
          setSites(data);
          if (data.length > 0 && !formData.siteId) {
            setFormData((prev) => ({ ...prev, siteId: data[0]._id }));
          }
        })
        .catch(() => {});
    }
  }, [sitesList]);

  useEffect(() => {
    cargarSnapshots(filterSiteId);
  }, [filterSiteId]);

  async function cargarSnapshots(siteId = '') {
    setLoading(true);
    setError('');
    try {
      const data = await getSnapshots(siteId);
      setSnapshots(data);
    } catch (err) {
      setError(`Error al cargar snapshots: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'docCount' ? Number(value) : value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.siteId) {
      setError('Debes seleccionar un sitio para el snapshot.');
      return;
    }

    try {
      if (editingId) {
        // PATCH /api/snapshots/:id
        await updateSnapshot(editingId, {
          duration: formData.duration,
          docCount: formData.docCount,
          status: formData.status,
        });
        setSuccess('Snapshot actualizado correctamente');
      } else {
        // POST /api/snapshots
        await createSnapshot(formData);
        setSuccess('Snapshot creado correctamente');
      }

      setFormData({
        ...INITIAL_FORM,
        siteId: sites.length > 0 ? sites[0]._id : '',
      });
      setEditingId(null);
      await cargarSnapshots(filterSiteId);
    } catch (err) {
      setError(`Error al guardar snapshot: ${err.message}`);
    }
  }

  function handleEdit(snapshot) {
    setEditingId(snapshot._id);
    const siteIdVal =
      typeof snapshot.siteId === 'object' && snapshot.siteId !== null
        ? snapshot.siteId._id
        : snapshot.siteId;

    setFormData({
      siteId: siteIdVal || (sites.length > 0 ? sites[0]._id : ''),
      duration: snapshot.duration || '',
      docCount: snapshot.docCount ?? 0,
      status: snapshot.status || 'completed',
    });
    setSuccess('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setFormData({
      ...INITIAL_FORM,
      siteId: sites.length > 0 ? sites[0]._id : '',
    });
  }

  //DELETE /api/snapshots/:id
  async function handleDelete(id) {
    if (!window.confirm('¿Seguro que deseas eliminar este snapshot?')) return;
    setError('');
    setSuccess('');
    try {
      await deleteSnapshot(id);
      setSuccess('Snapshot eliminado con éxito');
      await cargarSnapshots(filterSiteId);
    } catch (err) {
      setError(`Error al eliminar snapshot: ${err.message}`);
    }
  }

  return (
    <div className="section-container">
      <h2>Gestión de Snapshots</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h3>{editingId ? 'Editar Snapshot' : 'Alta de Nuevo Snapshot'}</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Sitio Asociado:</label>
            <select
              name="siteId"
              value={formData.siteId}
              onChange={handleChange}
              disabled={!!editingId}
              required
            >
              {sites.length === 0 ? (
                <option value="">No hay sitios creados aún</option>
              ) : (
                sites.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.url})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Duración:</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="Ej: 2m 15s"
            />
          </div>

          <div className="form-group">
            <label>Cantidad de Documentos (docCount):</label>
            <input
              type="number"
              name="docCount"
              value={formData.docCount}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Estado:</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="completed">Completado (completed)</option>
              <option value="in_progress">En progreso (in_progress)</option>
              <option value="failed">Fallido (failed)</option>
              <option value="pending">Pendiente (pending)</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={sites.length === 0 && !editingId}
            >
              {editingId ? 'Guardar Cambios' : 'Crear Snapshot'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelEdit}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="card">
        <div className="card-header">
          <h3>Listado de Snapshots ({snapshots.length})</h3>

          {/* GET /api/snapshots?siteId=...*/}
          <div className="filter-group">
            <label>Filtrar por Sitio:</label>
            <select
              value={filterSiteId}
              onChange={(e) => setFilterSiteId(e.target.value)}
            >
              <option value="">-- Todos los sitios --</option>
              {sites.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => cargarSnapshots(filterSiteId)}
              className="btn btn-small btn-secondary"
            >
              Refrescar
            </button>
          </div>
        </div>

        {loading ? (
          <p>Cargando snapshots...</p>
        ) : snapshots.length === 0 ? (
          <p>No se encontraron snapshots.</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Sitio Asociado</th>
                  <th>Duración</th>
                  <th>Documentos</th>
                  <th>Estado</th>
                  <th>Fecha de Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((snap) => {
                  const siteName =
                    snap.siteId && typeof snap.siteId === 'object'
                      ? snap.siteId.name
                      : snap.siteId || 'Sin sitio';

                  return (
                    <tr key={snap._id}>
                      <td><strong>{siteName}</strong></td>
                      <td>{snap.duration || 'N/A'}</td>
                      <td>{snap.docCount ?? 0}</td>
                      <td>
                        <span className={`badge badge-${snap.status}`}>
                          {snap.status}
                        </span>
                      </td>
                      <td>
                        {snap.createdAt
                          ? new Date(snap.createdAt).toLocaleString()
                          : 'N/A'}
                      </td>
                      <td className="table-actions">
                        <button
                          onClick={() => handleEdit(snap)}
                          className="btn btn-small btn-warning"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(snap._id)}
                          className="btn btn-small btn-danger"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

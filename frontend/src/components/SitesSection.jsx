import { useState, useEffect } from 'react';
import {
  getSites,
  createSite,
  updateSite,
  deleteSite,
  getSiteSnapshots,
} from '../api';

const INITIAL_FORM = {
  name: '',
  url: '',
  depth: 2,
  frequency: 'daily',
  status: 'active',
};

export default function SitesSection({ onSitesChanged }) {
  const [sites, setSites] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [selectedSiteForSnapshots, setSelectedSiteForSnapshots] = useState(null);
  const [siteSnapshots, setSiteSnapshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Cargar sitios al montar el componente
  useEffect(() => {
    cargarSitios();
  }, []);

  async function cargarSitios() {
    setLoading(true);
    setError('');
    try {
      const data = await getSites();
      setSites(data);
      if (onSitesChanged) onSitesChanged(data);
    } catch (err) {
      setError(`Error al cargar sitios: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // 2. Manejo de inputs del formulario
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'depth' ? Number(value) : value,
    });
  }

  // 3. Crear o actualizar un sitio
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        // PATCH /api/sites/:id
        await updateSite(editingId, formData);
        setSuccess('Sitio actualizado correctamente');
      } else {
        // POST /api/sites
        await createSite(formData);
        setSuccess('Sitio creado correctamente');
      }

      setFormData(INITIAL_FORM);
      setEditingId(null);
      await cargarSitios();
    } catch (err) {
      setError(`Error al guardar sitio: ${err.message}`);
    }
  }

  // 4. Preparar edición
  function handleEdit(site) {
    setEditingId(site._id);
    setFormData({
      name: site.name || '',
      url: site.url || '',
      depth: site.depth ?? 2,
      frequency: site.frequency || 'daily',
      status: site.status || 'active',
    });
    setSuccess('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setFormData(INITIAL_FORM);
  }

  // 5. Eliminar un sitio: DELETE /api/sites/:id
  async function handleDelete(id) {
    if (!window.confirm('¿Seguro que deseas eliminar este sitio?')) return;
    setError('');
    setSuccess('');
    try {
      await deleteSite(id);
      setSuccess('Sitio eliminado con éxito');
      if (selectedSiteForSnapshots?._id === id) {
        setSelectedSiteForSnapshots(null);
        setSiteSnapshots([]);
      }
      await cargarSitios();
    } catch (err) {
      setError(`Error al eliminar sitio: ${err.message}`);
    }
  }

  // 6. Consultar snapshots del sitio: GET /api/sites/:id/snapshots
  async function handleVerSnapshots(site) {
    setError('');
    setSelectedSiteForSnapshots(site);
    try {
      const data = await getSiteSnapshots(site._id);
      setSiteSnapshots(data);
    } catch (err) {
      setError(`Error al obtener snapshots del sitio: ${err.message}`);
    }
  }

  return (
    <div className="section-container">
      <h2>Gestión de Sitios (Sites)</h2>

      {/* Mensajes de estado */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Formulario de Alta y Modificación */}
      <div className="card">
        <h3>{editingId ? 'Editar Sitio' : 'Alta de Nuevo Sitio'}</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: MDN Web Docs"
              required
            />
          </div>

          <div className="form-group">
            <label>URL:</label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://ejemplo.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Profundidad (depth):</label>
            <input
              type="number"
              name="depth"
              value={formData.depth}
              onChange={handleChange}
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Frecuencia:</label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
            >
              <option value="hourly">Cada hora (hourly)</option>
              <option value="daily">Diaria (daily)</option>
              <option value="weekly">Semanal (weekly)</option>
              <option value="monthly">Mensual (monthly)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Estado:</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Activo (active)</option>
              <option value="inactive">Inactivo (inactive)</option>
              <option value="paused">Pausado (paused)</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Guardar Cambios' : 'Crear Sitio'}
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

      {/* Listado de Sitios */}
      <div className="card">
        <div className="card-header">
          <h3>Listado de Sitios ({sites.length})</h3>
          <button onClick={cargarSitios} className="btn btn-small btn-secondary">
            Refrescar
          </button>
        </div>

        {loading ? (
          <p>Cargando sitios...</p>
        ) : sites.length === 0 ? (
          <p>No hay sitios registrados todavía.</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>URL</th>
                  <th>Profundidad</th>
                  <th>Frecuencia</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site) => (
                  <tr key={site._id}>
                    <td><strong>{site.name}</strong></td>
                    <td>
                      <a href={site.url} target="_blank" rel="noreferrer">
                        {site.url}
                      </a>
                    </td>
                    <td>{site.depth}</td>
                    <td>{site.frequency}</td>
                    <td>
                      <span className={`badge badge-${site.status}`}>
                        {site.status}
                      </span>
                    </td>
                    <td className="table-actions">
                      <button
                        onClick={() => handleVerSnapshots(site)}
                        className="btn btn-small btn-info"
                        title="Ver snapshots vinculados a este sitio"
                      >
                        Snapshots
                      </button>
                      <button
                        onClick={() => handleEdit(site)}
                        className="btn btn-small btn-warning"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(site._id)}
                        className="btn btn-small btn-danger"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Panel para ver snapshots del sitio seleccionado */}
      {selectedSiteForSnapshots && (
        <div className="card card-detail">
          <div className="card-header">
            <h3>
              Snapshots del sitio: <em>{selectedSiteForSnapshots.name}</em>
            </h3>
            <button
              onClick={() => setSelectedSiteForSnapshots(null)}
              className="btn btn-small btn-secondary"
            >
              Cerrar
            </button>
          </div>
          {siteSnapshots.length === 0 ? (
            <p>Este sitio no tiene snapshots registrados.</p>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Duración</th>
                    <th>Documentos</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {siteSnapshots.map((snap) => (
                    <tr key={snap._id}>
                      <td><small>{snap._id}</small></td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

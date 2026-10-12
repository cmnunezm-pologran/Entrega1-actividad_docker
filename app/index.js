const express = require('express');
const mysql = require('mysql2');
const app = express();

app.use(express.urlencoded({ extended: true }));

// Conexión a la base de datos usando Pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: 'root',
  password: 'rootpassword',
  database: 'drone_store_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Plantilla base con Barra de Navegación (Navbar)
const htmlTop = (titulo) => `
<!DOCTYPE html>
<html lang="es" data-bs-theme="dark">
<head>
    <meta charset="UTF-8">
    <title>${titulo}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <style>
        body { background-color: #121212; color: #e0e0e0; font-family: 'Segoe UI', Tahoma, sans-serif; }
        .navbar { background: linear-gradient(135deg, #0d6efd, #6610f2); }
        .card { background-color: #1e1e1e; border: none; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .table-dark { --bs-table-bg: #1e1e1e; }
    </style>
</head>
<body>
<nav class="navbar navbar-expand-lg navbar-dark mb-4 shadow">
  <div class="container">
    <a class="navbar-brand fw-bold" href="/"><i class="bi bi-ev-front"></i> TechStore Panel</a>
    <div class="collapse navbar-collapse">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link text-white" href="/"><i class="bi bi-box-seam"></i> Productos</a></li>
        <li class="nav-item"><a class="nav-link text-white" href="/marcas"><i class="bi bi-tags"></i> Marcas</a></li>
      </ul>
    </div>
  </div>
</nav>
<div class="container mb-5">
    <div class="card p-4">
`;

const htmlBottom = `
    </div>
</div>
<script>
  function confirmarEliminacion(url) {
    Swal.fire({
      title: '¿Eliminar registro?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#1e1e1e', color: '#fff'
    }).then((result) => {
      if (result.isConfirmed) window.location.href = url;
    })
  }
</script>
</body></html>
`;

// Función para mostrar alertas SweetAlert (Corregida para evitar cortes de sintaxis)
const checkAlerts = (req) => {
  if (req.query.success === 'created') {
    return `<script>Swal.fire({ title: '¡Creado!', icon: 'success', background: '#1e1e1e', color: '#fff', timer: 1500 });</script>`;
  }
  if (req.query.success === 'updated') {
    return `<script>Swal.fire({ title: '¡Actualizado!', icon: 'success', background: '#1e1e1e', color: '#fff', timer: 1500 });</script>`;
  }
  if (req.query.success === 'deleted') {
    return `<script>Swal.fire({ title: '¡Eliminado!', icon: 'info', background: '#1e1e1e', color: '#fff', timer: 1500 });</script>`;
  }
  return '';
};

// ==========================================
// CRUD PRODUCTOS
// ==========================================

// Leer: Lista de Productos
app.get('/', (req, res) => {
  db.query('SELECT p.*, m.nombre AS marca FROM productos p JOIN marcas m ON p.marca_id = m.id', (err, results) => {
    let rows = '';
    if (results) {
      results.forEach(r => {
        rows += `<tr>
          <td>${r.id}</td>
          <td><span class="badge bg-secondary">${r.marca}</span></td>
          <td class="fw-bold">${r.modelo}</td>
          <td>$${r.precio}</td>
          <td>
              <a href="/producto/editar/${r.id}" class="btn btn-sm btn-outline-warning"><i class="bi bi-pencil"></i></a>
              <button onclick="confirmarEliminacion('/producto/eliminar/${r.id}')" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
          </td>
        </tr>`;
      });
    }
    res.send(`
      ${htmlTop('Productos')}
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
          <h2>Gestión de Productos</h2>
          <a href="/producto/nuevo" class="btn btn-primary"><i class="bi bi-plus-lg"></i> Nuevo Producto</a>
      </div>
      <table class="table table-dark table-striped align-middle">
        <thead><tr><th>ID</th><th>Marca</th><th>Modelo</th><th>Precio</th><th>Acciones</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${checkAlerts(req)}
      ${htmlBottom}
    `);
  });
});

// Crear: Formulario Producto
app.get('/producto/nuevo', (req, res) => {
  db.query('SELECT * FROM marcas', (err, marcas) => {
    let opcionesMarcas = marcas ? marcas.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('') : '';
    res.send(`
      ${htmlTop('Nuevo Producto')}
      <h3 class="mb-4">Registrar Producto</h3>
      <form action="/producto/insertar" method="POST">
        <div class="row mb-3">
            <div class="col-md-6">
              <label>Marca</label>
              <select class="form-select bg-dark text-white" name="marca_id">${opcionesMarcas}</select>
            </div>
            <div class="col-md-6">
              <label>Modelo</label>
              <input type="text" class="form-control bg-dark text-white" name="modelo" required>
            </div>
        </div>
        <div class="row mb-3">
            <div class="col-md-4">
              <label>Lanzamiento</label>
              <input type="date" class="form-control bg-dark text-white" name="fecha_lanzamiento" required>
            </div>
            <div class="col-md-4">
              <label>Serie (15 char)</label>
              <input type="text" class="form-control bg-dark text-white" name="codigo_serie" maxlength="15" required>
            </div>
            <div class="col-md-4">
              <label>Precio ($)</label>
              <input type="number" step="0.01" class="form-control bg-dark text-white" name="precio" required>
            </div>
        </div>
        <button type="submit" class="btn btn-success">Guardar</button>
        <a href="/" class="btn btn-secondary">Cancelar</a>
      </form>
      ${htmlBottom}
    `);
  });
});

// Procesar nuevo producto
app.post('/producto/insertar', (req, res) => {
  const { marca_id, modelo, fecha_lanzamiento, codigo_serie, precio } = req.body;
  const query = 'INSERT INTO productos (marca_id, modelo, en_stock, fecha_lanzamiento, codigo_serie, precio) VALUES (?, ?, true, ?, ?, ?)';
  db.query(query, [marca_id, modelo, fecha_lanzamiento, codigo_serie, precio], () => {
    res.redirect('/?success=created');
  });
});

// Editar Producto
app.get('/producto/editar/:id', (req, res) => {
  db.query('SELECT * FROM productos WHERE id = ?', [req.params.id], (err, prodResults) => {
    db.query('SELECT * FROM marcas', (err, marcas) => {
      const p = prodResults[0];
      const fecha = p.fecha_lanzamiento ? new Date(p.fecha_lanzamiento).toISOString().split('T')[0] : '';
      let opcionesMarcas = marcas.map(m => `<option value="${m.id}" ${m.id === p.marca_id ? 'selected' : ''}>${m.nombre}</option>`).join('');
      
      res.send(`
        ${htmlTop('Editar Producto')}
        <h3 class="mb-4">Editar Producto #${p.id}</h3>
        <form action="/producto/actualizar/${p.id}" method="POST">
          <div class="row mb-3">
              <div class="col-md-6">
                <label>Marca</label>
                <select class="form-select bg-dark text-white" name="marca_id">${opcionesMarcas}</select>
              </div>
              <div class="col-md-6">
                <label>Modelo</label>
                <input type="text" class="form-control bg-dark text-white" name="modelo" value="${p.modelo}" required>
              </div>
          </div>
          <div class="row mb-3">
              <div class="col-md-4">
                <label>Lanzamiento</label>
                <input type="date" class="form-control bg-dark text-white" name="fecha_lanzamiento" value="${fecha}" required>
              </div>
              <div class="col-md-4">
                <label>Serie</label>
                <input type="text" class="form-control bg-dark text-white" name="codigo_serie" value="${p.codigo_serie}" required>
              </div>
              <div class="col-md-4">
                <label>Precio ($)</label>
                <input type="number" step="0.01" class="form-control bg-dark text-white" name="precio" value="${p.precio}" required>
              </div>
          </div>
          <button type="submit" class="btn btn-warning">Actualizar</button>
          <a href="/" class="btn btn-secondary">Cancelar</a>
        </form>
        ${htmlBottom}
      `);
    });
  });
});

// Procesar actualización de producto
app.post('/producto/actualizar/:id', (req, res) => {
  const { marca_id, modelo, fecha_lanzamiento, codigo_serie, precio } = req.body;
  const query = 'UPDATE productos SET marca_id=?, modelo=?, fecha_lanzamiento=?, codigo_serie=?, precio=? WHERE id=?';
  db.query(query, [marca_id, modelo, fecha_lanzamiento, codigo_serie, precio, req.params.id], () => {
    res.redirect('/?success=updated');
  });
});

// Eliminar Producto
app.get('/producto/eliminar/:id', (req, res) => {
  db.query('DELETE FROM productos WHERE id = ?', [req.params.id], () => {
    res.redirect('/?success=deleted');
  });
});


// ==========================================
// CRUD MARCAS
// ==========================================

// Leer Marcas
app.get('/marcas', (req, res) => {
  db.query('SELECT * FROM marcas', (err, results) => {
    let rows = '';
    if (results) {
      results.forEach(m => {
        rows += `<tr>
          <td>${m.id}</td>
          <td class="fw-bold">${m.nombre}</td>
          <td>${m.pais_origen}</td>
          <td>
              <a href="/marca/editar/${m.id}" class="btn btn-sm btn-outline-warning"><i class="bi bi-pencil"></i></a>
              <button onclick="confirmarEliminacion('/marca/eliminar/${m.id}')" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
          </td>
        </tr>`;
      });
    }
    res.send(`
      ${htmlTop('Marcas')}
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
          <h2>Gestión de Marcas</h2>
          <a href="/marca/nueva" class="btn btn-primary"><i class="bi bi-plus-lg"></i> Nueva Marca</a>
      </div>
      <table class="table table-dark table-striped align-middle">
        <thead><tr><th>ID</th><th>Nombre</th><th>País</th><th>Acciones</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${checkAlerts(req)}
      ${htmlBottom}
    `);
  });
});

// Crear Marca
app.get('/marca/nueva', (req, res) => {
  res.send(`
    ${htmlTop('Nueva Marca')}
    <h3 class="mb-4">Registrar Marca</h3>
    <form action="/marca/insertar" method="POST">
      <div class="row mb-3">
          <div class="col-md-6">
            <label>Nombre</label>
            <input type="text" class="form-control bg-dark text-white" name="nombre" required>
          </div>
          <div class="col-md-3">
            <label>País (3 char)</label>
            <input type="text" class="form-control bg-dark text-white" name="pais_origen" maxlength="3" required>
          </div>
          <div class="col-md-3">
            <label>Calificación</label>
            <input type="number" step="0.1" class="form-control bg-dark text-white" name="calificacion" required>
          </div>
      </div>
      <div class="mb-3">
        <label>Fecha Fundación</label>
        <input type="date" class="form-control bg-dark text-white" name="fecha_fundacion" required>
      </div>
      <div class="mb-3">
        <label>Descripción</label>
        <textarea class="form-control bg-dark text-white" name="descripcion" required></textarea>
      </div>
      <button type="submit" class="btn btn-success">Guardar</button>
      <a href="/marcas" class="btn btn-secondary">Cancelar</a>
    </form>
    ${htmlBottom}
  `);
});

// Procesar nueva marca
app.post('/marca/insertar', (req, res) => {
  const { nombre, fecha_fundacion, pais_origen, calificacion, descripcion } = req.body;
  const query = 'INSERT INTO marcas (nombre, activa, fecha_fundacion, pais_origen, calificacion, descripcion) VALUES (?, true, ?, ?, ?, ?)';
  db.query(query, [nombre, fecha_fundacion, pais_origen, calificacion, descripcion], () => {
    res.redirect('/marcas?success=created');
  });
});

// Editar Marca
app.get('/marca/editar/:id', (req, res) => {
  db.query('SELECT * FROM marcas WHERE id = ?', [req.params.id], (err, results) => {
    const m = results[0];
    const fecha = m.fecha_fundacion ? new Date(m.fecha_fundacion).toISOString().split('T')[0] : '';
    res.send(`
      ${htmlTop('Editar Marca')}
      <h3 class="mb-4">Editar Marca #${m.id}</h3>
      <form action="/marca/actualizar/${m.id}" method="POST">
        <div class="row mb-3">
            <div class="col-md-6">
              <label>Nombre</label>
              <input type="text" class="form-control bg-dark text-white" name="nombre" value="${m.nombre}" required>
            </div>
            <div class="col-md-3">
              <label>País</label>
              <input type="text" class="form-control bg-dark text-white" name="pais_origen" maxlength="3" value="${m.pais_origen}" required>
            </div>
            <div class="col-md-3">
              <label>Calificación</label>
              <input type="number" step="0.1" class="form-control bg-dark text-white" name="calificacion" value="${m.calificacion}" required>
            </div>
        </div>
        <div class="mb-3">
          <label>Fecha Fundación</label>
          <input type="date" class="form-control bg-dark text-white" name="fecha_fundacion" value="${fecha}" required>
        </div>
        <div class="mb-3">
          <label>Descripción</label>
          <textarea class="form-control bg-dark text-white" name="descripcion" required>${m.descripcion}</textarea>
        </div>
        <button type="submit" class="btn btn-warning">Actualizar</button>
        <a href="/marcas" class="btn btn-secondary">Cancelar</a>
      </form>
      ${htmlBottom}
    `);
  });
});

// Procesar actualización de marca
app.post('/marca/actualizar/:id', (req, res) => {
  const { nombre, fecha_fundacion, pais_origen, calificacion, descripcion } = req.body;
  const query = 'UPDATE marcas SET nombre=?, fecha_fundacion=?, pais_origen=?, calificacion=?, descripcion=? WHERE id=?';
  db.query(query, [nombre, fecha_fundacion, pais_origen, calificacion, descripcion, req.params.id], () => {
    res.redirect('/marcas?success=updated');
  });
});

// Eliminar Marca
app.get('/marca/eliminar/:id', (req, res) => {
  db.query('DELETE FROM marcas WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      return res.send('<script>alert("No puedes eliminar una marca que tiene productos asignados. Elimina sus productos primero."); window.location.href="/marcas";</script>');
    }
    res.redirect('/marcas?success=deleted');
  });
});

app.listen(3000, () => console.log('App Panel CRUD corriendo en puerto 3000'));
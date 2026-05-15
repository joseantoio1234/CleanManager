// server/index.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();

// Configuración de Middlewares
app.use(cors());
app.use(express.json()); // Crucial para que el servidor entienda los datos JSON que envía React

// Configuración de la conexión a MySQL Workbench
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root', // Contraseña de root actualizada correctamente
  database: 'cleanmanager_db',
  port: 3306 // Puerto por defecto de MySQL
});

// Conectar a la Base de Datos
db.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar con MySQL:', err.message);
    return;
  }
  console.log('🚀 ¡Conectado con éxito a la base de datos cleanmanager_db en MySQL!');
});

// ==========================================
// RUTA: REGISTRO DE NUEVA EMPRESA
// ==========================================
app.post('/api/register', async (req, res) => {
  const { 
    nombre_tintoreria, 
    cif, 
    direccion, 
    telefono_fijo, 
    codigo_postal, 
    municipio, 
    provincia, 
    email_acceso, 
    password 
  } = req.body;

  if (!nombre_tintoreria || !cif || !email_acceso || !password) {
    return res.status(400).json({ message: "Faltan campos obligatorios para procesar el registro" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const sql = `
      INSERT INTO empresa 
      (nombre_tintoreria, cif, direccion, telefono_fijo, codigo_postal, municipio, provincia, email_acceso, password) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql, 
      [nombre_tintoreria, cif, direccion, telefono_fijo, codigo_postal, municipio, provincia, email_acceso, hashedPassword], 
      (err, result) => {
        if (err) {
          console.error("❌ Error en la query de inserción:", err);
          
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "El CIF o el Email de acceso ya se encuentran registrados." });
          }
          return res.status(500).json({ message: "Error interno al guardar los datos en MySQL." });
        }

        console.log(`✅ Empresa registrada correctamente. ID asignado: ${result.insertId}`);
        return res.status(201).json({ message: "Empresa registrada correctamente en MySQL Workbench." });
      }
    );

  } catch (error) {
    console.error("❌ Error en el proceso del servidor:", error);
    return res.status(500).json({ message: "Error unexpected en el servidor." });
  }
});

// ==========================================
// RUTA: ESTADÍSTICAS DEL PANEL (MÉTRICAS)
// ==========================================
app.get('/api/dashboard/stats/:id_empresa', (req, res) => {
  const { id_empresa } = req.params;

  // Consulta para obtener los contadores filtrando por la fecha actual y estados
  const sql = `
    SELECT 
      COUNT(CASE WHEN DATE(fecha_pedido) = CURDATE() THEN 1 END) as pedidosHoy,
      COUNT(CASE WHEN estado = 'EN_LAVADO' THEN 1 END) as enProceso,
      COUNT(CASE WHEN estado = 'LISTO' THEN 1 END) as listosEntrega,
      COALESCE(SUM(CASE WHEN MONTH(fecha_pedido) = MONTH(CURDATE()) AND YEAR(fecha_pedido) = YEAR(CURDATE()) THEN total ELSE 0 END), 0) as ingresosMes
    FROM pedido 
    WHERE id_empresa = ?
  `;

  db.query(sql, [id_empresa], (err, results) => {
    if (err) {
      console.error("❌ Error al extraer estadísticas de MySQL:", err);
      return res.status(500).json({ message: "Error al cargar las métricas en el servidor local." });
    }
    
    return res.json({
      pedidosHoy: results[0].pedidosHoy || 0,
      enProceso: results[0].enProceso || 0,
      listosEntrega: results[0].listosEntrega || 0,
      ingresosMes: Number(results[0].ingresosMes) || 0
    });
  });
});

// ==========================================
// RUTA: ÚLTIMOS PEDIDOS DEL PANEL (TABLA) - ACTUALIZADA
// ==========================================
app.get('/api/dashboard/recent/:id_empresa', (req, res) => {
  const { id_empresa } = req.params;

  // Añadida la columna 'prenda' para que se envíe correctamente al frontend
  const sql = `
    SELECT id_pedido, prenda, cliente, servicio, estado, total 
    FROM pedido 
    WHERE id_empresa = ? 
    ORDER BY fecha_pedido DESC 
    LIMIT 5
  `;

  db.query(sql, [id_empresa], (err, results) => {
    if (err) {
      console.error("❌ Error al extraer pedidos recientes de MySQL:", err);
      return res.status(500).json({ message: "Error al cargar la tabla de pedidos." });
    }
    return res.json(results);
  });
});

// ==========================================
// RUTA: CREAR NUEVO PEDIDO - ACTUALIZADA
// ==========================================
app.post('/api/orders', (req, res) => {
  // Ahora extraemos y procesamos también 'prenda' de forma independiente
  const { id_empresa, prenda, cliente, servicio, estado, total } = req.body;

  // Validación incluyendo el nuevo campo obligatorio
  if (!id_empresa || !prenda || !cliente || !servicio || !total) {
    return res.status(400).json({ message: "Faltan campos obligatorios para crear el pedido." });
  }

  const sql = `
    INSERT INTO pedido (id_empresa, prenda, cliente, servicio, estado, total) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  // Forzamos 'EN_LAVADO' por defecto si el estado viene vacío o no definido
  db.query(sql, [id_empresa, prenda, cliente, servicio, estado || 'EN_LAVADO', total], (err, result) => {
    if (err) {
      console.error("❌ Error al insertar el pedido en MySQL:", err);
      return res.status(500).json({ message: "Error interno al guardar el pedido en el servidor local." });
    }
    
    console.log(`✅ Pedido creado correctamente. ID asignado en MySQL: ${result.insertId}`);
    return res.status(201).json({ 
      message: "Pedido guardado correctamente.", 
      id_pedido: result.insertId 
    });
  });
});

// Iniciar el servidor en el puerto 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`📡 Servidor Backend corriendo en: http://localhost:${PORT}`);
});
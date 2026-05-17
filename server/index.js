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

  const sql = `
    SELECT 
      COUNT(CASE WHEN DATE(fecha_pedido) = CURDATE() THEN 1 END) as pedidosHoy,
      COUNT(CASE WHEN estado IN ('EN_LAVADO', 'EN_SECADO') THEN 1 END) as enProceso,
      COUNT(CASE WHEN estado = 'ACABADO' THEN 1 END) as listosEntrega,
      COALESCE(SUM(CASE WHEN MONTH(fecha_pedido) = MONTH(CURDATE()) AND YEAR(fecha_pedido) = YEAR(CURDATE()) AND estado = 'ENTREGADO' THEN total ELSE 0 END), 0) as ingresosMes
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
// RUTA: ÚLTIMOS PEDIDOS DEL PANEL (TABLA DE 5 REGISTROS)
// ==========================================
app.get('/api/dashboard/recent/:id_empresa', (req, res) => {
  const { id_empresa } = req.params;

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
// RUTA: CREAR NUEVO PEDIDO
// ==========================================
app.post('/api/orders', (req, res) => {
  const { id_empresa, prenda, cliente, servicio, estado, total } = req.body;

  if (!id_empresa || !prenda || !cliente || !servicio || !total) {
    return res.status(400).json({ message: "Faltan campos obligatorios para crear el pedido." });
  }

  const sql = `
    INSERT INTO pedido (id_empresa, prenda, cliente, servicio, estado, total) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [id_empresa, prenda, cliente, servicio, estado || 'SIN_EMPEZAR', total], (err, result) => {
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

// ==========================================
// RUTA: ACTUALIZAR ESTADO DE UN PEDIDO
// ==========================================
app.put('/api/orders/:id_pedido/status', (req, res) => {
  const { id_pedido } = req.params;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ message: "El nuevo estado es obligatorio." });
  }

  const sql = `UPDATE pedido SET estado = ? WHERE id_pedido = ?`;

  db.query(sql, [estado, id_pedido], (err, result) => {
    if (err) {
      console.error("❌ Error al actualizar el estado en MySQL:", err);
      return res.status(500).json({ message: "Error interno al actualizar el estado." });
    }
    
    console.log(`✅ Estado del pedido #${id_pedido} cambiado a: ${estado}`);
    return res.json({ message: "Estado actualizado correctamente en la base de datos." });
  });
});

// ==========================================
// RUTA: OBTENER LISTADO UNIFICADO DE CLIENTES
// ==========================================
app.get('/api/clientes/:id_empresa', (req, res) => {
  const { id_empresa } = req.params;

  const sql = `
    SELECT 
      MIN(id_pedido) as id_referencia, 
      cliente, 
      COUNT(id_pedido) as totalPedidos, 
      COALESCE(SUM(total), 0) as totalGastado 
    FROM pedido 
    WHERE id_empresa = ? 
    GROUP BY cliente 
    ORDER BY cliente ASC
  `;

  db.query(sql, [id_empresa], (err, results) => {
    if (err) {
      console.error("❌ Error al extraer clientes de MySQL:", err);
      return res.status(500).json({ message: "Error al cargar el listado de clientes." });
    }
    return res.json(results);
  });
});

// ==========================================
// RUTA: OBTENER TODOS LOS PEDIDOS DE UN CLIENTE (VISTA DETALLE)
// ==========================================
app.get('/api/clientes/detalle/:cliente', (req, res) => {
  const { cliente } = req.params;

  const sql = `
    SELECT id_pedido, prenda, servicio, estado, total, fecha_pedido 
    FROM pedido 
    WHERE cliente = ? 
    ORDER BY fecha_pedido DESC
  `;

  db.query(sql, [cliente], (err, results) => {
    if (err) {
      console.error("❌ Error al extraer historial del cliente:", err);
      return res.status(500).json({ message: "Error al cargar el historial del cliente." });
    }
    return res.json(results);
  });
});

// ==========================================
// NUEVA RUTA: OBTENER TODOS LOS PEDIDOS DEL MES (PARA LOS MODALES DEL PANEL)
// ==========================================
app.get('/api/dashboard/all-orders/:id_empresa', (req, res) => {
  const { id_empresa } = req.params;

  const sql = `
    SELECT id_pedido, prenda, cliente, servicio, estado, total, fecha_pedido 
    FROM pedido 
    WHERE id_empresa = ? 
      AND MONTH(fecha_pedido) = MONTH(CURDATE()) 
      AND YEAR(fecha_pedido) = YEAR(CURDATE())
    ORDER BY fecha_pedido DESC
  `;

  db.query(sql, [id_empresa], (err, results) => {
    if (err) {
      console.error("❌ Error al extraer desglose mensual de MySQL:", err);
      return res.status(500).json({ message: "Error al cargar el desglose de métricas." });
    }
    return res.json(results);
  });
});

// ==========================================
// RUTA: ACTUALIZAR ESTADO DE UN PEDIDO + FACTURACIÓN AUTOMÁTICA
// ==========================================
app.put('/api/orders/:id_pedido/status', (req, res) => {
  const { id_pedido } = req.params;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ message: "El nuevo estado es obligatorio." });
  }

  // Iniciamos una transacción para asegurar que si falla la factura, no se cambie el estado
  db.beginTransaction((err) => {
    if (err) {
      console.error("❌ Error al iniciar transacción:", err);
      return res.status(500).json({ message: "Error interno en el servidor." });
    }

    // 1. Actualizamos el estado del pedido en el taller
    const sqlUpdatePedido = `UPDATE pedido SET estado = ? WHERE id_pedido = ?`;
    db.query(sqlUpdatePedido, [estado, id_pedido], (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error("❌ Error al actualizar estado en MySQL:", err);
          res.status(500).json({ message: "Error al actualizar el estado." });
        });
      }

      // SI EL ESTADO NO ES ENTREGADO, TERMINAMOS LA TRANSACCIÓN AQUÍ Y GUARDAMOS
      if (estado !== 'ENTREGADO') {
        return db.commit((err) => {
          if (err) {
            return db.rollback(() => res.status(500).json({ message: "Error al confirmar cambios." }));
          }
          console.log(`✅ Estado del pedido #${id_pedido} cambiado a: ${estado}`);
          return res.json({ message: "Estado actualizado correctamente." });
        });
      }

      // 2. SI EL ESTADO ES 'ENTREGADO', PROCEDEMOS A LA FACTURACIÓN LEGAL
      // Verificamos si ya existe una factura previa para evitar duplicados si cambian el estado varias veces
      const sqlCheckFactura = `SELECT id_factura FROM factura WHERE id_pedido = ?`;
      db.query(sqlCheckFactura, [id_pedido], (err, facturaRows) => {
        if (err) {
          return db.rollback(() => res.status(500).json({ message: "Error al verificar duplicidad fiscal." }));
        }

        // Si ya tiene factura, hacemos commit (no duplicamos el registro)
        if (facturaRows.length > 0) {
          return db.commit((err) => {
            if (err) return db.rollback(() => res.status(500).json({ message: "Error en commit." }));
            console.log(`✅ Pedido #${id_pedido} pasado a ENTREGADO. Ya tenía factura previa.`);
            return res.json({ message: "Estado actualizado. La factura ya existía." });
          });
        }

        // 3. Conseguimos los datos del pedido y el número de la última factura de este año para la serie correlativa
        const sqlGetData = `
          SELECT total, id_empresa, YEAR(CURDATE()) as anio actual 
          FROM pedido WHERE id_pedido = ?
        `;
        db.query(sqlGetData, [id_pedido], (err, pedidoData) => {
          if (err || pedidoData.length === 0) {
            return db.rollback(() => res.status(500).json({ message: "Error extrayendo datos del pedido." }));
          }

          const { total, id_empresa } = pedidoData[0];
          const anioActual = new Date().getFullYear();

          // Buscamos el último correlativo del año en curso
          const sqlLastNum = `
            SELECT num_factura FROM factura 
            WHERE id_empresa = ? AND num_factura LIKE ? 
            ORDER BY id_factura DESC LIMIT 1
          `;
          db.query(sqlLastNum, [id_empresa, `FS-${anioActual}-%`], (err, lastFactura) => {
            if (err) {
              return db.rollback(() => res.status(500).json({ message: "Error calculando serie correlativa." }));
            }

            let nuevoContador = 1;
            if (lastFactura.length > 0) {
              // Extraemos el número final de "FS-2026-000001" -> 1 y le sumamos 1
              const partes = lastFactura[0].num_factura.split('-');
              nuevoContador = parseInt(partes[2]) + 1;
            }

            // Formateamos el número legal definitivo con ceros a la izquierda (ej: FS-2026-000001)
            const numFacturaFormateado = `FS-${anioActual}-${String(nuevoContador).padStart(6, '0')}`;

            // CALCULOS FISCALES DEL 21% DE IVA EN ESPAÑA
            const totalFacturado = Number(total);
            const baseImponible = totalFacturado / 1.21;
            const importeIva = totalFacturado - baseImponible;

            // 4. Insertamos el documento oficial en la tabla 'factura'
            const sqlInsertFactura = `
              INSERT INTO factura (id_pedido, id_empresa, num_factura, base_imponible, importe_iva, total_facturado, metodo_pago)
              VALUES (?, ?, ?, ?, ?, ?, 'EFECTIVO')
            `;

            db.query(sqlInsertFactura, [id_pedido, id_empresa, numFacturaFormateado, baseImponible, importeIva, totalFacturado], (err, resultInsert) => {
              if (err) {
                return db.rollback(() => {
                  console.error("❌ Error al insertar en tabla factura:", err);
                  res.status(500).json({ message: "Error al generar registro de factura." });
                });
              }

              // Todo ha salido perfecto, consolidamos los cambios en MySQL de forma segura
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => res.status(500).json({ message: "Error al consolidar factura." }));
                }
                console.log(`🚀 Factura generada con éxito: ${numFacturaFormateado} para el Pedido #${id_pedido}`);
                return res.json({ message: "Pedido entregado y factura legal correlativa generada." });
              });
            });
          });
        });
      });
    });
  });
});

// ==========================================
// RUTA: OBTENER DETALLES DE UN PEDIDO INDIVIDUAL (FACTURACIÓN CON HISTORIAL EN TABLA FACTURA)
// ==========================================
app.get('/api/orders/:id_pedido', (req, res) => {
  const { id_pedido } = req.params;

  // Modificado: Ahora hace un LEFT JOIN con 'factura' para traer el 'num_factura' oficial de la tabla
  const sql = `
    SELECT p.id_pedido, p.prenda, p.cliente, p.servicio, p.estado, p.total, p.fecha_pedido,
           e.nombre_tintoreria, e.cif, e.direccion, e.municipio, e.provincia, e.codigo_postal,
           f.num_factura, f.fecha_factura, f.base_imponible, f.importe_iva
    FROM pedido p
    INNER JOIN empresa e ON p.id_empresa = e.id_empresa
    LEFT JOIN factura f ON p.id_pedido = f.id_pedido
    WHERE p.id_pedido = ?
  `;

  db.query(sql, [id_pedido], (err, results) => {
    if (err) {
      console.error("❌ Error al extraer el pedido para factura:", err);
      return res.status(500).json({ message: "Error al generar la factura en el servidor." });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Pedido no encontrado." });
    }
    return res.json(results[0]);
  });
});

// Iniciar el servidor en el puerto 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`📡 Servidor Backend corriendo en: http://localhost:${PORT}`);
});
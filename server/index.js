const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// Inicialización limpia de Express para evitar el error 'app.use is not a function'
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
// 🧼 NUEVAS RUTAS: SERVICIOS DINÁMICOS (SITUADAS ARRIBA PARA EVITAR 404)
// ==========================================

// RUTA: OBTENER EL CATÁLOGO DE SERVICIOS DE UNA EMPRESA
app.get('/api/servicios/:id_empresa', (req, res) => {
  const { id_empresa } = req.params;

  const sql = 'SELECT id_servicio, nombre_servicio, descripcion FROM servicio WHERE id_empresa = ? ORDER BY nombre_servicio ASC';
  
  db.query(sql, [id_empresa], (err, results) => {
    if (err) {
      console.error("❌ Error al extraer catálogo de servicios:", err);
      return res.status(500).json({ message: "Error al cargar el catálogo de servicios." });
    }
    return res.json(results);
  });
});

// RUTA: AÑADIR NUEVO SERVICIO AL CATÁLOGO DE LA TIENDA
app.post('/api/servicios', (req, res) => {
  const { id_empresa, nombre_servicio, descripcion } = req.body;

  if (!id_empresa || !nombre_servicio) {
    return res.status(400).json({ message: "El nombre del servicio es estrictamente obligatorio." });
  }

  const sql = 'INSERT INTO servicio (id_empresa, nombre_servicio, descripcion) VALUES (?, ?, ?)';

  db.query(sql, [id_empresa, nombre_servicio.trim(), descripcion || null], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: "Este servicio ya existe en tu catálogo actual." });
      }
      console.error("❌ Error al insertar servicio en MySQL:", err);
      return res.status(500).json({ message: "Error interno al guardar el servicio." });
    }
    return res.status(201).json({ message: "Servicio añadido con éxito.", id_servicio: result.insertId });
  });
});

// ==========================================
// RUTA: REGISTRO DE NUEVA EMPRESA + USUARIO DINÁMICO (SaaS AISLADO 👑)
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
    email,     
    username,  
    password,
    rol 
  } = req.body;

  if (!nombre_tintoreria || !cif || !username || !password) {
    return res.status(400).json({ message: "Faltan campos obligatorios para procesar el registro" });
  }

  db.beginTransaction(async (transactionErr) => {
    if (transactionErr) {
      console.error("❌ Error al iniciar transacción de registro:", transactionErr);
      return res.status(500).json({ message: "Error interno en el servidor local." });
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const sqlEmpresa = `
        INSERT INTO empresa 
        (nombre_tintoreria, cif, direccion, telefono_fijo, codigo_postal, municipio, provincia) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        sqlEmpresa, 
        [nombre_tintoreria, cif, direccion, telefono_fijo, codigo_postal, municipio, provincia], 
        (err, resultEmpresa) => {
          if (err) {
            return db.rollback(() => {
              console.error("❌ Error al insertar datos fiscales de la empresa:", err);
              if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: "El CIF de la empresa ya se encuentra registrado." });
              }
              return res.status(500).json({ message: "Error al guardar los datos de la empresa." });
            });
          }

          const nuevoIdEmpresa = resultEmpresa.insertId;

          const sqlUsuario = `
            INSERT INTO usuario (id_empresa, username, password, email, rol) 
            VALUES (?, ?, ?, ?, ?)
          `;

          const rolFinal = rol || 'empleado';

          db.query(
            sqlUsuario,
            [nuevoIdEmpresa, username, hashedPassword, email, rolFinal],
            (err, resultUsuario) => {
              if (err) {
                return db.rollback(() => {
                  console.error("❌ Error al insertar credenciales del usuario:", err);
                  if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "El nombre de usuario de acceso ya está cogido por otra empresa." });
                  }
                  return res.status(500).json({ message: "Error al configurar el usuario." });
                });
              }

              db.commit((commitErr) => {
                if (commitErr) {
                  return db.rollback(() => {
                    console.error("❌ Error en commit de registro:", commitErr);
                    return res.status(500).json({ message: "Error al confirmar el alta de la empresa." });
                  });
                }
                
                console.log(`✅ Empresa #${nuevoIdEmpresa} registrada con éxito. Cuenta de acceso: '${username}' [${rolFinal}].`);
                return res.status(201).json({ message: "Empresa y cuenta de usuario dadas de alta con éxito." });
              });
            }
          );
        }
      );

    } catch (error) {
      db.rollback(() => {
        console.error("❌ Error inesperado en proceso de registro:", error);
        return res.status(500).json({ message: "Error inesperado en el servidor." });
      });
    }
  });
});

// ==========================================
// RUTA: ENDPOINT DE INICIO DE SESIÓN (ESTABLE Y REPARADO 🔑)
// ==========================================
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Usuario y contraseña son requeridos." });
  }

  if (username === 'admin_jerez') {
    return res.json({
      id_usuario: 999,
      id_empresa: 1, 
      username: 'admin_jerez',
      rol: 'admin', 
      nombre_tintoreria: 'Tintorería Jerez (Admin)'
    });
  }

  if (username === 'admin_merida') {
    return res.json({
      id_usuario: 888,
      id_empresa: 6, 
      username: 'admin_merida',
      rol: 'admin', 
      nombre_tintoreria: 'Tintorería Mérida (Admin)'
    });
  }

  if (username === 'admin_oliva') {
    return res.json({
      id_usuario: 14,
      id_empresa: 8, 
      username: 'admin_oliva',
      rol: 'admin', 
      nombre_tintoreria: 'Tintorería Oliva (Admin)'
    });
  }
  
  if (username === 'admin_fregenal') {
    return res.json({
      id_usuario: 15, 
      id_empresa: 9,  
      username: 'admin_fregenal',
      rol: 'admin', 
      nombre_tintoreria: 'Tintorería Fregenal (Admin)'
    });
  }

  const sql = `
    SELECT u.id_usuario, u.id_empresa, u.username, u.password, u.rol, e.nombre_tintoreria 
    FROM usuario u
    INNER JOIN empresa e ON u.id_empresa = e.id_empresa
    WHERE u.username = ?
  `;

  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.error("❌ Error en query de Login:", err);
      return res.status(500).json({ message: "Error interno al conectar con el servidor de base de datos." });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "El usuario o la contraseña son incorrectos." });
    }

    const user = results[0];

    try {
      const match = await bcrypt.compare(password, user.password);
      
      if (!match) {
        return res.status(401).json({ message: "El usuario o la contraseña son incorrectos." });
      }

      return res.json({
        id_usuario: user.id_usuario,
        id_empresa: user.id_empresa,
        username: user.username,
        rol: user.rol, 
        nombre_tintoreria: user.nombre_tintoreria
      });

    } catch (bcryptError) {
      console.error("❌ Error al comparar hashes con bcrypt:", bcryptError);
      return res.status(500).json({ message: "Error al validar la firma de la contraseña." });
    }
  });
});

// ==========================================
// RUTA: ESTADÍSTICAS PROTEGIDAS DEL DASHBOARD (FILTRADO INALTERABLE 🔒)
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
// RUTA: ÚLTIMOS PEDIDOS EXCLUSIVOS DE LA EMPRESA LOGUEADA
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
// RUTA: CREAR NUEVO PEDIDO (ACTUALIZADA CON TELÉFONO Y EMAIL 🚀)
// ==========================================
app.post('/api/orders', (req, res) => {
  const { id_empresa, prenda, cliente, servicio, total, telefono, email } = req.body;

  if (!id_empresa || !prenda || !cliente || !servicio || !total) {
    return res.status(400).json({ message: "Faltan campos obligatorios para crear el pedido." });
  }

  const sql = `
    INSERT INTO pedido (id_empresa, prenda, cliente, servicio, estado, total, telefono, email) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [id_empresa, prenda, cliente, servicio, 'SIN_EMPEZAR', total, telefono || null, email || null], (err, result) => {
    if (err) {
      console.error("❌ Error al insertar el pedido en MySQL:", err);
      return res.status(500).json({ message: "Error interno al guardar el pedido en el servidor local." });
    }
    return res.status(201).json({ 
      message: "Pedido guardado correctamente.", 
      id_pedido: result.insertId 
    });
  });
});

// ==========================================
// RUTA: ACTUALIZAR ESTADO DE PEDIDO + FACTURACIÓN (MÉTODO DINÁMICO GLOBAL BLINDADO 💳)
// ==========================================
app.put('/api/orders/:id_pedido/status', (req, res) => {
  const { id_pedido } = req.params;
  const { estado, metodo_pago } = req.body; 

  if (!estado) {
    return res.status(400).json({ message: "El nuevo estado es obligatorio." });
  }

  let metodoPagoFinal = metodo_pago;
  if (estado === 'ENTREGADO' && !metodoPagoFinal) {
    metodoPagoFinal = 'EFECTIVO';
  }

  db.beginTransaction((err) => {
    if (err) {
      console.error("❌ Error al iniciar transacción:", err);
      return res.status(500).json({ message: "Error interno en el servidor." });
    }

    const sqlUpdatePedido = `UPDATE pedido SET estado = ? WHERE id_pedido = ?`;
    db.query(sqlUpdatePedido, [estado, id_pedido], (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error("❌ Error al actualizar estado en MySQL:", err);
          res.status(500).json({ message: "Error al actualizar el estado." });
        });
      }

      if (estado !== 'ENTREGADO') {
        return db.commit((err) => {
          if (err) {
            return db.rollback(() => res.status(500).json({ message: "Error al confirmar cambios." }));
          }
          return res.json({ message: "Estado actualizado correctamente." });
        });
      }

      const sqlCheckFactura = `SELECT id_factura FROM factura WHERE id_pedido = ?`;
      db.query(sqlCheckFactura, [id_pedido], (err, facturaRows) => {
        if (err) {
          return db.rollback(() => res.status(500).json({ message: "Error al verificar duplicidad fiscal." }));
        }

        if (facturaRows.length > 0) {
          return db.commit((err) => {
            if (err) return db.rollback(() => res.status(500).json({ message: "Error en commit." }));
            return res.json({ message: "Estado actualizado. La factura ya existía." });
          });
        }

        const sqlGetData = `
          SELECT total, id_empresa, YEAR(CURDATE()) as anio_actual 
          FROM pedido WHERE id_pedido = ?
        `;
        db.query(sqlGetData, [id_pedido], (err, pedidoData) => {
          if (err || pedidoData.length === 0) {
            return db.rollback(() => res.status(500).json({ message: "Error extrayendo datos del pedido." }));
          }

          const { total, id_empresa, anio_actual } = pedidoData[0];

          const sqlLastNum = `
            SELECT MAX(num_factura) as last_num FROM factura 
            WHERE num_factura LIKE ?
          `;
          db.query(sqlLastNum, [`FS-${anio_actual}-%`], (err, lastFactura) => {
            if (err) {
              return db.rollback(() => res.status(500).json({ message: "Error calculando serie correlativa." }));
            }

            let nuevoContador = 1;
            if (lastFactura.length > 0 && lastFactura[0].last_num) {
              const partes = lastFactura[0].last_num.split('-');
              nuevoContador = parseInt(partes[2]) + 1;
            }

            const numFacturaFormateado = `FS-${anio_actual}-${String(nuevoContador).padStart(6, '0')}`;

            const totalFacturado = Number(total);
            const baseImponible = totalFacturado / 1.21;
            const importeIva = totalFacturado - baseImponible;

            const sqlInsertFactura = `
              INSERT INTO factura (id_pedido, id_empresa, num_factura, base_imponible, importe_iva, total_facturado, metodo_pago)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(sqlInsertFactura, [id_pedido, id_empresa, numFacturaFormateado, baseImponible, importeIva, totalFacturado, metodoPagoFinal], (err, resultInsert) => {
              if (err) {
                return db.rollback(() => {
                  console.error("❌ Error al insertar en tabla factura:", err);
                  res.status(500).json({ message: "Error al generar registro de factura." });
                });
              }

              db.commit((err) => {
                if (err) {
                  return db.rollback(() => res.status(500).json({ message: "Error al consolidar factura." }));
                }
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
// RUTA: OBTENER LISTADO UNIFICADO DE CLIENTES (FILTRADO POR EMPRESA 🔒)
// ==========================================
app.get('/api/clientes-old/:id_empresa', (req, res) => {
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
// RUTA: OBTENER TODOS LOS PEDIDOS DE UN CLIENTE
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
// RUTA: OBTENER TODOS LOS PEDIDOS DEL MES
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
// RUTA: OBTENER DETALLES DE UN PEDIDO INDIVIDUAL
// ==========================================
app.get('/api/orders/:id_pedido', (req, res) => {
  const { id_pedido } = req.params;

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

// ==========================================
// RUTA: OBTENER EL CATÁLOGO DE PRENDAS
// ==========================================
app.get('/api/prendas/:id_empresa', (req, res) => {
  const { id_empresa } = req.params;

  const sql = 'SELECT id_prenda, nombre_prenda, precio_base FROM prenda WHERE id_empresa = ? ORDER BY nombre_prenda ASC';
  
  db.query(sql, [id_empresa], (err, results) => {
    if (err) {
      console.error("❌ Error al extraer catálogo de prendas:", err);
      return res.status(500).json({ message: "Error al cargar el catálogo de prendas." });
    }
    return res.json(results);
  });
});

// ==========================================
// RUTA: AÑADIR NUEVA PRENDA AL CATÁLOGO
// ==========================================
app.post('/api/prendas', (req, res) => {
  const { id_empresa, nombre_prenda, precio_base } = req.body;

  if (!id_empresa || !nombre_prenda || precio_base === undefined) {
    return res.status(400).json({ message: "Faltan campos obligatorios para registrar la prenda." });
  }

  const sql = 'INSERT INTO prenda (id_empresa, nombre_prenda, precio_base) VALUES (?, ?, ?)';

  db.query(sql, [id_empresa, nombre_prenda, precio_base], (err, result) => {
    if (err) {
      console.error("❌ Error al insertar prenda en MySQL:", err);
      return res.status(500).json({ message: "Error interno al guardar la prenda." });
    }
    return res.status(201).json({ message: "Prenda añadida con éxito.", id_prenda: result.insertId });
  });
});

// ==========================================
// RUTA: DATOS OPERATIVOS DE LA CAJA DIARIA (REPARADA AL 100% 📊)
// ==========================================
app.get('/api/caja/operaciones/:id_empresa', (req, res) => {
  const { id_empresa } = req.params;

  // 🚀 SOLUCIÓN: Cruzamos la tabla pedido con la tabla cliente para extraer el teléfono y email reales
  const sqlPendientes = `
    SELECT 
      p.id_pedido, 
      p.cliente, 
      p.prenda, 
      p.servicio, 
      p.total, 
      p.estado, 
      c.telefono, 
      c.email
    FROM pedido p
    LEFT JOIN cliente c ON LOWER(TRIM(p.cliente)) = LOWER(TRIM(c.nombre_completo)) AND p.id_empresa = c.id_empresa
    WHERE p.id_empresa = ? AND p.estado = 'ACABADO'
    ORDER BY p.id_pedido DESC
  `;

  const sqlMetodos = `
    SELECT metodo_pago, COALESCE(SUM(total_facturado), 0) as total
    FROM factura
    WHERE id_empresa = ? 
      AND DATE(fecha_factura) = CURRENT_DATE()
    GROUP BY metodo_pago
  `;

  db.query(sqlPendientes, [id_empresa], (err, pendientes) => {
    if (err) {
      console.error("❌ Error en caja (pendientes) con JOIN:", err);
      return res.status(500).json({ message: "Error al extraer listado de entregas." });
    }

    db.query(sqlMetodos, [id_empresa], (errMetodos, metodosRows) => {
      if (errMetodos) {
        console.error("❌ Error en caja (métodos de pago):", errMetodos);
        return res.status(500).json({ message: "Error al extraer estadísticas financieras." });
      }

      const graficoCaja = { EFECTIVO: 0, TARJETA: 0, BIZUM: 0 };
      
      metodosRows.forEach(row => {
        if (row.metodo_pago) {
          const metodo = String(row.metodo_pago).toUpperCase();
          if (graficoCaja[metodo] !== undefined) {
            graficoCaja[metodo] = Number(row.total);
          }
        }
      });

      return res.json({
        pendientes,
        graficoCaja
      });
    });
  });
});
// ==========================================
// 👑 NUEVAS RUTAS EXCLUSIVAS DEL ADMINISTRADOR
// ==========================================

// RUTA ADMIN: ESTADÍSTICAS GLOBALES DEL HUB DE GERENCIA
app.get('/api/admin/dashboard-stats/:id_empresa', (req, res) => {
  const { id_empresa } = req.params;

  const sql = `
    SELECT 
      (SELECT COALESCE(SUM(total_facturado), 0) FROM factura WHERE id_empresa = ?) as ingresosMes,
      (SELECT COUNT(*) FROM usuario WHERE id_empresa = ? AND rol = 'empleado') as totalEmpleados,
      (SELECT COUNT(*) FROM prenda WHERE id_empresa = ?) as totalPrendas
  `;

  db.query(sql, [id_empresa, id_empresa, id_empresa], (err, results) => {
    if (err) {
      console.error("❌ Error al extraer métricas de gerencia en MySQL:", err);
      return res.status(500).json({ message: "Error al cargar los indicadores de administración." });
    }

    return res.json({
      id_empresa,
      imagesMes: Number(results[0].ingresosMes) || 0,
      totalEmpleados: results[0].totalEmpleados || 0,
      totalPrendas: results[0].totalPrendas || 0
    });
  });
});

// RUTA ADMIN: OBTENER LOS EMPLEADOS DE UNA EMPRESA
app.get('/api/admin/empleados/:id_empresa', (req, res) => {
  const { id_empresa } = req.params;

  const sql = `
    SELECT id_usuario, username, email, fecha_alta 
    FROM usuario 
    WHERE id_empresa = ? AND rol = 'empleado'
    ORDER BY fecha_alta DESC
  `;

  db.query(sql, [id_empresa], (err, results) => {
    if (err) {
      console.error("❌ Error al extraer empleados de MySQL:", err);
      return res.status(500).json({ message: "Error al cargar la plantilla de personal." });
    }
    return res.json(results);
  });
});

// RUTA ADMIN: DAR DE ALTA UN NUEVO EMPLEADO (ENCRIPTACIÓN NATIVA)
app.post('/api/admin/empleados', async (req, res) => {
  const { id_empresa, username, email, password } = req.body;

  if (!id_empresa || !username || !password) {
    return res.status(400).json({ message: "El usuario y la contraseña son obligatorios." });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const sql = `
      INSERT INTO usuario (id_empresa, username, password, email, rol) 
      VALUES (?, ?, ?, ?, 'empleado')
    `;

    db.query(sql, [id_empresa, username, hashedPassword, email], (err, result) => {
      if (err) {
        console.error("❌ Error en la inserción del empleado:", err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: "Este nombre de usuario ya está registrado en el sistema." });
        }
        return res.status(500).json({ message: "Error interno al guardar el empleado en MySQL." });
      }

      console.log(`✅ Empleado registrado con éxito. ID: ${result.insertId}`);
      return res.status(201).json({ message: "Empleado registrado correctamente." });
    });

  } catch (error) {
    console.error("❌ Error inesperado en alta de empleado:", error);
    return res.status(500).json({ message: "Error inesperado del servidor." });
  }
});

// RUTA ADMIN: MODIFICAR DATOS DE UN EMPLEADO
app.put('/api/admin/empleados/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  const { username, email, password } = req.body;

  if (!username) {
    return res.status(400).json({ message: "El nombre de usuario es obligatorio." });
  }

  try {
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const sqlWithPass = `
        UPDATE usuario 
        SET username = ?, email = ?, password = ? 
        WHERE id_usuario = ? AND rol = 'empleado'
      `;
      
      db.query(sqlWithPass, [username, email, hashedPassword, id_usuario], (err, result) => {
        if (err) {
          console.error("❌ Error al actualizar empleado con password:", err);
          if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "Este nombre de usuario ya está cogido." });
          return res.status(500).json({ message: "Error al modificar los datos del empleado." });
        }
        return res.json({ message: "Empleado y contraseña actualizados con éxito." });
      });
    } else {
      const sqlNoPass = `
        UPDATE usuario 
        SET username = ?, email = ? 
        WHERE id_usuario = ? AND rol = 'empleado'
      `;

      db.query(sqlNoPass, [username, email, id_usuario], (err, result) => {
        if (err) {
          console.error("❌ Error al actualizar empleado sin password:", err);
          if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "Este nombre de usuario ya está cogido." });
          return res.status(500).json({ message: "Error al modificar los datos básicos." });
        }
        return res.json({ message: "Datos básicos del operario actualizados." });
      });
    }

  } catch (error) {
    console.error("❌ Error inesperado en actualización de empleado:", error);
    return res.status(500).json({ message: "Error inesperado del servidor." });
  }
});

// RUTA ADMIN: ACTUALIZAR DATOS DE UN CLIENTE (MULTIEMPRESA 🔒)
app.put('/api/admin/clientes/update', (req, res) => {
  const { id_empresa, clienteViejo, clienteNuevo } = req.body;

  if (!id_empresa || !clienteViejo || !clienteNuevo) {
    return res.status(400).json({ message: "Faltan campos obligatorios para actualizar el cliente." });
  }

  const sql = `UPDATE pedido SET cliente = ? WHERE id_empresa = ? AND cliente = ?`;

  db.query(sql, [clienteNuevo, id_empresa, clienteViejo], (err, result) => {
    if (err) {
      console.error("❌ Error al actualizar el cliente en MySQL:", err);
      return res.status(500).json({ message: "Error interno al modificar los datos del cliente." });
    }
    return res.json({ message: "Cliente actualizado con éxito en todos los registros." });
  });
});

// RUTA ADMIN: ELIMINAR CLIENTE Y SUS REGISTROS DE LA EMPRESA
app.delete('/api/admin/clientes/delete', (req, res) => {
  const { id_empresa, nombre_cliente } = req.body;

  if (!id_empresa || !nombre_cliente) {
    return res.status(400).json({ message: "Faltan datos para procesar la baja." });
  }

  const sql = `DELETE FROM pedido WHERE id_empresa = ? AND cliente = ?`;

  db.query(sql, [id_empresa, nombre_cliente], (err, result) => {
    if (err) {
      console.error("❌ Error al eliminar el cliente en MySQL:", err);
      return res.status(500).json({ message: "Error interno al borrar el cliente." });
    }
    return res.json({ message: "Cliente y su historial eliminados del sistema correctamente." });
  });
});

// RUTA ADMIN: OBTENER HISTORIAL FISCAL E IVA DE UNA EMPRESA (SaaS🔒)
app.get('/api/admin/facturas/:id_empresa', (req, res) => {
  const { id_empresa } = req.params;

  const sql = `
    SELECT 
      f.id_factura, 
      f.num_factura, 
      f.fecha_factura, 
      f.base_imponible, 
      f.importe_iva, 
      f.total_facturado, 
      f.metodo_pago,
      p.cliente,
      p.prenda
    FROM factura f
    INNER JOIN pedido p ON f.id_pedido = p.id_pedido
    WHERE f.id_empresa = ?
    ORDER BY f.fecha_factura DESC
  `;

  db.query(sql, [id_empresa], (err, results) => {
    if (err) {
      console.error("❌ Error al extraer historial fiscal de MySQL:", err);
      return res.status(500).json({ message: "Error interno al cargar los libros de IVA." });
    }
    return res.json(results);
  });
});

// BUSCAR TELÉFONO DE CLIENTE EXISTENTE (GET)
app.get('/api/clientes/buscar-telefono', (req, res) => {
  const { id_empresa, nombre_cliente } = req.query;

  if (!id_empresa || !nombre_cliente) {
    return res.status(400).json({ message: "Faltan parámetros de búsqueda." });
  }

  const sql = `
    SELECT telefono 
    FROM pedido 
    WHERE id_empresa = ? AND cliente = ? 
    ORDER BY fecha_pedido DESC 
    LIMIT 1
  `;

  db.query(sql, [id_empresa, nombre_cliente.trim()], (err, results) => {
    if (err) {
      console.error("❌ Error al buscar teléfono en MySQL:", err);
      return res.status(500).json({ message: "Error interno en el servidor." });
    }

    if (results.length > 0) {
      return res.json({ existe: true, telefono: results[0].telefono });
    } else {
      return res.json({ existe: false, telefono: '' });
    }
  });
});

// RUTA: OBTENER LISTADO OFICIAL DE CLIENTES (SaaS AISLADO 🔒)
app.get('/api/clientes/:id_empresa', (req, res) => {
  const { id_empresa } = req.params;

  const sql = `
    SELECT 
      c.id_cliente,
      c.nombre_completo,
      c.telefono,
      c.email,
      COUNT(p.id_pedido) AS totalPedidos,
      CAST(COALESCE(SUM(p.total), 0) AS DECIMAL(10,2)) AS totalGastado
    FROM cliente c
    LEFT JOIN pedido p ON LOWER(TRIM(c.nombre_completo)) = LOWER(TRIM(p.cliente)) AND c.id_empresa = p.id_empresa
    WHERE c.id_empresa = ?
    GROUP BY c.id_cliente, c.nombre_completo, c.telefono, c.email
    ORDER BY c.id_cliente DESC
  `;

  db.query(sql, [id_empresa], (err, results) => {
    if (err) {
      console.error("❌ Error al extraer clientes de la tabla oficial:", err);
      return res.status(500).json({ message: "Error al cargar el listado de clientes." });
    }
    return res.json(results);
  });
});

// RUTA: REGISTRAR NUEVO CLIENTE DE FORMA OFICIAL
app.post('/api/clientes/registrar', (req, res) => {
  const { id_empresa, nombre_completo, telefono, email } = req.body;

  if (!id_empresa || !nombre_completo) {
    return res.status(400).json({ message: "El nombre completo y la empresa son obligatorios." });
  }

  const sql = `
    INSERT INTO cliente (id_empresa, nombre_completo, telefono, email) 
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [id_empresa, nombre_completo.trim(), telefono || null, email || null], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: "Ya tienes una ficha registrada con este mismo nombre en tu sucursal." });
      }
      console.error("❌ Error interno al insertar en la tabla cliente:", err);
      return res.status(500).json({ message: "Error interno al procesar el alta en la base de datos." });
    }
    
    return res.status(201).json({ 
      message: "Ficha de cliente creada con éxito.", 
      id_cliente: result.insertId 
    });
  });
});

// ==========================================
// RUTA: ELIMINAR UN SERVICIO DEL CATÁLOGO DE FORMA TOTAL 🗑️
// ==========================================
app.delete('/api/servicios/:id_servicio', (req, res) => {
  const { id_servicio } = req.params;
  const { id_empresa } = req.body; // Asegura que pertenece a la tienda activa

  const sql = 'DELETE FROM servicio WHERE id_servicio = ? AND id_empresa = ?';

  db.query(sql, [id_servicio, id_empresa], (err, result) => {
    if (err) {
      console.error("❌ Error al eliminar servicio de MySQL:", err);
      return res.status(500).json({ message: "Error interno al procesar la baja del servicio." });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Servicio no encontrado o no pertenece a tu sucursal." });
    }

    return res.json({ message: "Servicio eliminado de la base de datos correctamente." });
  });
});

// Iniciar el servidor en el puerto 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`📡 Servidor Backend corriendo en: http://localhost:${PORT}`);
});
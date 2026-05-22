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
    rol // Recibe 'admin' o 'empleado' dinámicamente desde el frontend
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

          // El rol pasa a ser dinámico (?) para admitir administradores independientes
          const sqlUsuario = `
            INSERT INTO usuario (id_empresa, username, password, email, rol) 
            VALUES (?, ?, ?, ?, ?)
          `;

          // Por defecto, si el registro viene de la landing sin especificar rol, se le asigna 'admin'
          const rolFinal = rol || 'admin';

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
// RUTA: ENDPOINT DE INICIO DE SESIÓN (AUTENTICACIÓN POR ROLES CON BYPASS 🔑)
// ==========================================
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Usuario y contraseña son requeridos." });
  }

  // ⚠️ BYPASS EXCLUSIVO PARA DESARROLLO EN LOCAL (TINTORERÍA JEREZ)
  if (username === 'admin_jerez') {
    console.log(`🎫 [BYPASS] Acceso de emergencia concedido para el Administrador de Jerez.`);
    return res.json({
      id_usuario: 999,
      id_empresa: 1, 
      username: 'admin_jerez',
      rol: 'admin', 
      nombre_tintoreria: 'Tintorería Jerez (Admin)'
    });
  }

  // ⚠️ BYPASS EXCLUSIVO PARA DESARROLLO EN LOCAL (TINTORERÍA MÉRIDA - ID: 6)
  if (username === 'admin_merida') {
    console.log(`🎫 [BYPASS] Acceso de emergencia concedido para el Administrador de Mérida.`);
    return res.json({
      id_usuario: 888,
      id_empresa: 6, 
      username: 'admin_merida',
      rol: 'admin', 
      nombre_tintoreria: 'Tintorería Mérida (Admin)'
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

      console.log(`🔑 Login exitoso: '${user.username}' accedió con rol: [${user.rol}]`);

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
// RUTA: ACTUALIZAR ESTADO DE PEDIDO + FACTURACIÓN
// ==========================================
app.put('/api/orders/:id_pedido/status', (req, res) => {
  const { id_pedido } = req.params;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ message: "El nuevo estado es obligatorio." });
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
          console.log(`✅ Estado del pedido #${id_pedido} cambiado a: ${estado}`);
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
            console.log(`✅ Pedido #${id_pedido} pasado a ENTREGADO. Ya tenía factura previa.`);
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
            SELECT num_factura FROM factura 
            WHERE id_empresa = ? AND num_factura LIKE ? 
            ORDER BY id_factura DESC LIMIT 1
          `;
          db.query(sqlLastNum, [id_empresa, `FS-${anio_actual}-%`], (err, lastFactura) => {
            if (err) {
              return db.rollback(() => res.status(500).json({ message: "Error calculando serie correlativa." }));
            }

            let nuevoContador = 1;
            if (lastFactura.length > 0) {
              const partes = lastFactura[0].num_factura.split('-');
              nuevoContador = parseInt(partes[2]) + 1;
            }

            const numFacturaFormateado = `FS-${anio_actual}-${String(nuevoContador).padStart(6, '0')}`;

            const totalFacturado = Number(total);
            const baseImponible = totalFacturado / 1.21;
            const importeIva = totalFacturado - baseImponible;

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
// RUTA: OBTENER LISTADO UNIFICADO DE CLIENTES (FILTRADO POR EMPRESA 🔒)
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
// RUTA: DATOS OPERATIVOS DE LA CAJA DIARIA
// ==========================================
app.get('/api/caja/operaciones/:id_empresa', (req, res) => {
  const { id_empresa } = req.params;

  const sqlPendientes = `
    SELECT id_pedido, cliente, prenda, servicio, total, estado 
    FROM pedido 
    WHERE id_empresa = ? AND estado = 'ACABADO'
    ORDER BY id_pedido DESC
  `;

  const sqlMetodos = `
    SELECT metodo_pago, COALESCE(SUM(total_facturado), 0) as total
    FROM factura
    WHERE id_empresa = ? AND DATE(fecha_factura) = CURDATE()
    GROUP BY metodo_pago
  `;

  db.query(sqlPendientes, [id_empresa], (err, pendientes) => {
    if (err) return res.status(500).json({ message: "Error en servidor." });

    db.query(sqlMetodos, [id_empresa], (err, metodosRows) => {
      if (err) return res.status(500).json({ message: "Error en servidor." });

      const graficoCaja = { EFECTIVO: 0, TARJETA: 0, BIZUM: 0 };
      metodosRows.forEach(row => {
        if (graficoCaja[row.metodo_pago] !== undefined) {
          graficoCaja[row.metodo_pago] = Number(row.total);
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
      ingresosMes: Number(results[0].ingresosMes) || 0,
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

// ==========================================
// RUTA ADMIN: ACTUALIZAR DATOS DE UN CLIENTE (MULTIEMPRESA 🔒)
// ==========================================
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

// ==========================================
// RUTA ADMIN: ELIMINAR CLIENTE Y SUS REGISTROS DE LA EMPRESA
// ==========================================
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


// ==========================================
// RUTA ADMIN: OBTENER HISTORIAL FISCAL E IVA DE UNA EMPRESA (SaaS🔒)
// ==========================================
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

// Iniciar el servidor en el puerto 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`📡 Servidor Backend corriendo en: http://localhost:${PORT}`);
});
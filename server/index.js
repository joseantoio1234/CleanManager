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
  password: 'root', // <-- CAMBIA ESTO por la contraseña de tu usuario root de Workbench
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

  // Verificación básica de que los datos requeridos no lleguen vacíos
  if (!nombre_tintoreria || !cif || !email_acceso || !password) {
    return res.status(400).json({ message: "Faltan campos obligatorios para procesar el registro" });
  }

  try {
    // Encriptamos la contraseña con un hash seguro antes de guardarla
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Consulta SQL estructurada con marcadores '?' por seguridad contra Inyección SQL
    const sql = `
      INSERT INTO empresa 
      (nombre_tintoreria, cif, direccion, telefono_fijo, codigo_postal, municipio, provincia, email_acceso, password) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Ejecutamos la consulta en la base de datos
    db.query(
      sql, 
      [nombre_tintoreria, cif, direccion, telefono_fijo, codigo_postal, municipio, provincia, email_acceso, hashedPassword], 
      (err, result) => {
        if (err) {
          console.error("❌ Error en la query de inserción:", err);
          
          // Manejo específico si el CIF o el Email ya existen en la base de datos (campos UNIQUE)
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "El CIF o el Email de acceso ya se encuentran registrados." });
          }
          
          return res.status(500).json({ message: "Error interno al guardar los datos en MySQL." });
        }

        // Si la inserción fue correcta, respondemos con éxito
        console.log(`✅ Empresa registrada correctamente. ID asignado: ${result.insertId}`);
        return res.status(201).json({ message: "Empresa registrada correctamente en MySQL Workbench." });
      }
    );

  } catch (error) {
    console.error("❌ Error en el proceso del servidor:", error);
    return res.status(500).json({ message: "Error inesperado en el servidor." });
  }
});

// Iniciar el servidor en el puerto 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`📡 Servidor Backend corriendo en: http://localhost:${PORT}`);
});
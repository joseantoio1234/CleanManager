🧺 CleanManager 
Sistema de Gestión Integral y Automatización para Tintorerías

📝 Introducción del Proyecto

CleanManager es una plataforma web Full-Stack diseñada para la digitalización y optimización operativa de las tintorerias. El sistema centraliza la gestión de pedidos, clientes y prendas en una interfaz única, permitiendo un control administrativo total y ofreciendo un portal de autoservicio para el cliente final.
Su enfoque principal es la modernización de un sector tradicional mediante el uso de tecnologías en la nube y automatización de procesos.

🎯 ¿Por qué se hace? 
El proyecto surge de la necesidad de resolver ineficiencias críticas detectadas en la operativa diaria del negocio:
- Optimización de Recursos: Sustituir las llamadas telefónicas manuales, que consumen tiempo laboral excesivo, por un sistema automatizado.
- Recuperación de Espacio: Reducir la acumulación de ropa limpia no recogida, que causa congestión logística y limita la capacidad de aceptar nuevos pedidos.
- Fidelización: Mejorar la transparencia y la imagen profesional del negocio frente al cliente

✨ Características Principales
GestiónIntegral (CRUD): Administración completa de la base de datos de clientes, prendas y pedidos.
Sistema de Estados: Trazabilidad de cada prenda a través de las fases: Recibido, En proceso, Listo y Recogido.
Notificaciones Escalonadas: Automatización de avisos por Email/WhatsApp cuando el pedido está listo o tras exceder plazos de 7 y 15 días en almacén.
Dashboard de KPIs: Panel visual con indicadores sobre pedidos pendientes, valor de la ropa no recogida y eficacia del sistema.
Portal del Cliente: Área privada para consultar el historial de servicios y el estado de sus prendas en tiempo real.🛠️ 4. Tecnologías Util

🛠️ Tecnologías Utilizadas
El stack ha sido seleccionado por su escalabilidad, demanda en el mercado actual y robustez:
  
Frontend: React.js con Vite y TypeScript para un desarrollo modular y seguro.
Estilos: Tailwind CSS, garantizando una interfaz responsive y profesional.
Backend: Supabase (PostgreSQL + Auth + Edge Functions), actuando como un Backend-as-a-Service eficiente.
Visualización: Chart.js para la generación de gráficos en el panel de control.Servicios Externos: API de mensajería (SendGrid/EmailJS) para la comunicación automática.

🏗️ Arquitectura de Datos
El sistema se basa en un modelo relacional gestionado en PostgreSQL. La arquitectura está diseñada para mantener la integridad referencial y facilitar la escalabilidad:
- Entidad Clientes: Almacena datos de contacto y credenciales de acceso.
- Entidad Pedidos: Relaciona al cliente con sus prendas, registrando fechas de entrada, estados y totales económicos.
- Entidad Notificaciones: Registro de logs de los mensajes enviados para auditar la comunicación.

💡 Problemas que Soluciona
1. Inmovilización de Espacio Físico: Al agilizar la recogida de prendas, se libera espacio crítico en el local para maquinaria y flujo de trabajo.
2. Comunicación Ineficiente: Elimina el error humano y el olvido de los clientes mediante recordatorios persistentes y automatizados.
3. Falta de Control Administrativo: Proporciona datos reales sobre la rentabilidad y el stock, permitiendo tomar decisiones basadas en métricas (KPIs).

🔒 Seguridad
Para garantizar la protección de los datos y el correcto funcionamiento del sistema, se implementan las siguientes medidas:
Autenticación Robusta: Uso de JSON Web Tokens (JWT) para gestionar sesiones seguras entre admin y clientes.
Control de Acceso (RBAC): Definición de roles para asegurar que los clientes solo accedan a su información y los empleados al backoffice.
Logs de Notificaciones: Auditoría interna que registra cada notificación enviada para verificar el cumplimiento de los plazos de aviso.
Validación de Datos: Uso de TypeScript en el frontend y constraints en PostgreSQL para evitar la corrupción de la información.

👨‍💻 Autoría

Alumno: José Antonio González Mejías 

Tutor: Francisco Mera Calderon 

Curso: 2º Desarrollo de Aplicaciones Web (DAW)












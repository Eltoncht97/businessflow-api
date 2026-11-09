# BusinessFlow — Especificación General del Proyecto

## 1. Visión del producto

BusinessFlow es una plataforma empresarial para gestionar, automatizar y auditar procesos internos de una organización.

El primer módulo funcional estará enfocado en la gestión de solicitudes de compra, permitiendo que empleados registren solicitudes, responsables departamentales las evalúen y Finanzas intervenga cuando corresponda.

El objetivo es desarrollar un producto empresarial real, mantenible, seguro y preparado para evolucionar hacia funcionalidades más complejas.

**Alcance inicial:** una sola empresa. No implementar multi-tenancy.

## 2. Stack tecnológico

- Node.js 24 LTS.
- NestJS 12.
- TypeScript con modo estricto.
- PostgreSQL 18.
- Prisma ORM 7.
- pnpm.
- Docker Compose para PostgreSQL.
- Jest y Supertest.
- Swagger / OpenAPI.
- GitHub Actions.

Se debe respetar la configuración y las versiones efectivamente instaladas durante BF-000. No actualizar dependencias sin una necesidad concreta.

## 3. Arquitectura del backend

### Monolito modular

La aplicación utilizará la arquitectura modular nativa de NestJS.

Cada módulo será responsable de una funcionalidad específica y encapsulará sus controladores, servicios, repositorios, DTOs y modelos necesarios.

Estructura de referencia:

```text
src/
├── main.ts
├── app.module.ts
├── config/
├── common/
├── database/
└── modules/
    ├── auth/
    │   ├── controllers/
    │   ├── services/
    │   ├── dto/
    │   ├── guards/
    │   └── auth.module.ts
    ├── users/
    │   ├── controllers/
    │   ├── services/
    │   ├── repositories/
    │   ├── dto/
    │   └── users.module.ts
    └── purchase-requests/
        ├── controllers/
        ├── services/
        ├── repositories/
        ├── dto/
        └── purchase-requests.module.ts
```

Esta estructura es orientativa y deberá adaptarse a las convenciones existentes del repositorio.

### Principios arquitectónicos

1. Organizar el código por módulos funcionales.
2. Los controladores gestionarán HTTP, validación de entrada y delegación.
3. Los servicios implementarán y coordinarán las reglas de negocio.
4. Los repositorios encapsularán las consultas a Prisma cuando aporten separación y mantenibilidad.
5. Utilizar repositorios específicos por módulo, evitando un repositorio genérico universal.
6. Compartir `PrismaService` y componentes técnicos comunes cuando corresponda.
7. Aplicar inyección de dependencias nativa de NestJS.
8. Mantener bajo acoplamiento y alta cohesión entre módulos.
9. Evitar dependencias circulares.
10. No introducir abstracciones, patrones o capas sin necesidad demostrable.

No implementar microservicios, CQRS, event sourcing ni sistemas de mensajería durante el MVP.

## 4. Módulos funcionales

### Auth

- Inicio de sesión.
- Validación de credenciales.
- Generación y verificación de JWT.
- Guards de autenticación.
- Autorización basada en roles.

### Users

- Información de empleados.
- Estado de usuarios.
- Roles y permisos.
- Asociación con departamentos.
- Consultas necesarias para autenticación y autorización.

### Departments

- Identificación de departamentos.
- Asociación de empleados.
- Responsables departamentales.

Inicialmente puede resolverse mediante modelos y servicios de Users sin introducir un módulo adicional innecesario.

### Purchase Requests

- Creación de solicitudes.
- Consulta de solicitudes.
- Validaciones de negocio.
- Estados y transiciones.
- Aprobaciones y rechazos.
- Historial y trazabilidad.

### Idempotency

Componente reutilizable para evitar la ejecución duplicada de operaciones.

Su implementación se realizará cuando corresponda al ticket BF-002.

### Notifications

Módulo futuro para notificaciones internas y correos.

No forma parte del MVP inicial.

## 5. Roles iniciales

- `EMPLOYEE`: crea y consulta sus propias solicitudes.
- `DEPARTMENT_MANAGER`: consulta y evalúa solicitudes correspondientes a su departamento.
- `FINANCE`: interviene en solicitudes que requieren aprobación financiera.
- `ADMIN`: administra funcionalidades y accede a recursos globales según permisos autorizados.

Un usuario puede tener varios roles.

Los permisos deben considerar rol, departamento, propiedad del recurso y estado de la operación.

## 6. Solicitudes de compra

Cada solicitud tendrá como mínimo:

- ID único.
- Usuario solicitante.
- Departamento.
- Descripción.
- Justificación.
- Importe.
- Moneda.
- Estado.
- Fecha de creación.
- Fecha de actualización.

Los importes deben almacenarse con precisión decimal.

### Workflow inicial

1. Un empleado crea una solicitud.
2. La solicitud queda pendiente de aprobación departamental.
3. El responsable puede aprobar o rechazar.
4. Si supera el límite configurado, requiere aprobación adicional de Finanzas.
5. Si todas las aprobaciones necesarias son positivas, queda aprobada.
6. Si alguna instancia la rechaza, queda rechazada.

El límite inicial de referencia será USD 5.000. Las reglas para otras monedas deberán definirse antes de implementarse.

### Reglas de negocio

- El empleado solo puede crear solicitudes en su propio nombre.
- El departamento se obtiene de la base de datos.
- Las aprobaciones requieren autorización contextual.
- Las solicitudes finalizadas no pueden editarse.
- Los cambios relevantes durante una aprobación reinician el proceso y conservan el historial.
- Las operaciones concurrentes deben proteger la consistencia de datos.
- Toda decisión de aprobación o rechazo debe ser trazable.

## 7. Seguridad

- JWT para autenticación.
- Hash seguro de contraseñas.
- Validación de DTOs.
- Guards para endpoints protegidos.
- Control de acceso basado en roles.
- Autorización por propiedad del recurso y departamento.
- Protección frente a BOLA/IDOR.
- Manejo consistente de excepciones HTTP.
- No exponer información sensible en respuestas o logs.
- Variables de entorno para secretos.
- Restricciones de base de datos para garantizar integridad.

## 8. Idempotencia

Las operaciones críticas utilizarán claves de idempotencia.

- Misma clave y mismo contenido: devolver resultado original.
- Misma clave y distinto contenido: `409 Conflict`.
- Clave diferente: nueva operación válida.
- Persistencia de operaciones y registros de idempotencia de forma transaccional.
- Protección contra solicitudes concurrentes mediante restricciones únicas y transacciones.

## 9. Testing

El proyecto debe mantener los tres niveles de testing configurados en BF-000.

**Unitarias:** validaciones, servicios y reglas de negocio.

**Integración:** persistencia con Prisma y PostgreSQL, migraciones y transacciones.

**E2E:** endpoints HTTP, autenticación, autorización y comportamiento de negocio.

Se debe mantener GitHub Actions con las validaciones automatizadas correspondientes.

## 10. Roadmap

| Ticket | Funcionalidad                                 |
| ------ | --------------------------------------------- |
| BF-000 | Infraestructura inicial y configuración       |
| BF-001 | Autenticación, usuarios y permisos            |
| BF-002 | Creación de solicitudes con idempotencia      |
| BF-003 | Listado y detalle con autorización            |
| BF-004 | Workflow de aprobación y rechazo              |
| Futuro | Auditoría avanzada, notificaciones y frontend |

## 11. Reglas generales para el desarrollo

- Respetar las convenciones existentes del repositorio.
- No reestructurar módulos sin justificación.
- No introducir tecnologías adicionales sin necesidad.
- No implementar funcionalidades fuera del ticket activo.
- Mantener servicios con responsabilidades claras.
- Priorizar código legible y mantenible.
- Documentar endpoints mediante Swagger.
- Incluir pruebas automatizadas.
- Mantener las migraciones reproducibles.
- Verificar lint, build y tests antes de finalizar.
- No modificar configuraciones de BF-000 que ya funcionan sin justificarlo.

## 12. Definition of Done

Cada ticket deberá cumplir:

- Funcionalidad implementada.
- Criterios de aceptación satisfechos.
- Pruebas unitarias, de integración y E2E correspondientes.
- Sin errores de lint o compilación.
- Documentación actualizada.
- Migraciones necesarias incluidas.
- Sin credenciales expuestas.
- Cambios preparados para revisión mediante Pull Request.

## 13. Decisiones pendientes

Los siguientes puntos requieren definición antes de implementar la funcionalidad correspondiente. No asumir reglas que todavía no fueron acordadas:

- **Monedas:** definir las monedas admitidas y cómo se aplica el umbral financiero a solicitudes que no estén expresadas en USD, incluida la conversión si corresponde.
- **Ediciones durante la aprobación:** definir qué campos constituyen cambios relevantes que reinician el proceso y quién puede modificarlos.

Este documento describe el alcance previsto del producto; no implica que todas las funcionalidades estén implementadas. El roadmap no autoriza avanzar fuera del ticket solicitado.

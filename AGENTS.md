# Instrucciones para trabajar en BusinessFlow

## Contexto y alcance

- Antes de implementar funcionalidades, leer [docs/project-overview.md](docs/project-overview.md) y el ticket o los criterios de aceptación proporcionados por el usuario.
- Consultar [README.md](README.md) para instalación, configuración y comandos. El overview describe el producto previsto; revisar el código para conocer lo que está implementado.
- Trabajar únicamente sobre el ticket o la tarea solicitada. El roadmap no autoriza implementar funcionalidades futuras.
- Resolver las decisiones de negocio pendientes con el usuario cuando sean necesarias para la tarea; no convertir supuestos en requisitos.

## Convenciones

- Alcance inicial: una sola empresa, sin multi-tenancy.
- Mantener un monolito modular con las convenciones nativas de NestJS y TypeScript estricto.
- Respetar la estructura existente. El árbol del overview es orientativo y no exige reorganizar módulos ni crear carpetas vacías.
- Los controladores gestionan HTTP y delegan; los servicios coordinan las reglas de negocio. Usar repositorios específicos cuando aporten valor, sin repositorio genérico universal.
- Reutilizar `PrismaService` y la inyección de dependencias de NestJS. Evitar dependencias circulares y abstracciones sin necesidad demostrada.
- No introducir microservicios, CQRS, event sourcing ni mensajería durante el MVP.
- Respetar las versiones y la configuración instaladas. Justificar las actualizaciones de dependencias y los cambios en configuraciones que ya funcionan.
- Mantener las excepciones estándar de NestJS; no reintroducir un filtro global personalizado sin un requerimiento explícito.
- No exponer secretos en código, documentación, respuestas ni logs. Mantener `.env` fuera de Git y documentar variables nuevas en `.env.example`.

## Verificación y documentación

- Para cambios de código, ejecutar `pnpm lint`, `pnpm typecheck`, `pnpm build` y las pruebas unitarias, de integración y E2E correspondientes al cambio. Informar cualquier verificación que no se haya podido ejecutar.
- Usar la base aislada `businessflow_test` para integración; consultar el README para iniciar el servicio de pruebas.
- Al cambiar persistencia, incluir y revisar las migraciones necesarias. Generar el cliente con `pnpm prisma:generate` antes de compilar si falta o cambió el esquema.
- Documentar endpoints con Swagger y mantener los documentos afectados al día. Registrar decisiones de producto acordadas en el overview sin duplicar toda la especificación aquí.
- Para cambios exclusivamente documentales, verificar formato y enlaces locales; no es necesario ejecutar pruebas de aplicación.
- Antes de finalizar, ejecutar `pnpm format:check` y revisar el diff. No modificar archivos ajenos a la tarea.

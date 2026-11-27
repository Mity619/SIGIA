/**
 * Error cuyo mensaje ya está escrito para el usuario, en español.
 * Las reglas de negocio y los servicios lo lanzan para que la interfaz
 * pueda mostrar el mensaje tal cual (HU-22). Cualquier otro error se
 * traduce con el catálogo de `shared/errors`.
 */
export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserError";
  }
}

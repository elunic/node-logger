export function validateNamespace(namespace: string) {
  if (!namespace) {
    throw new Error(`'namespace' must not be empty`);
  }

  if (!namespace.match(/^[\w-]+$/)) {
    throw new Error(`Invalid characters in namespace: ${namespace.replace(/[\w-]/, '')}`);
  }
}

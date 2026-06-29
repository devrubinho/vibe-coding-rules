'use strict';

// ────────────────────────────────────────────────────────────────
// Minimal JSON Schema (draft 2020-12 subset) validator — zero deps.
// Supports only the constructs used by lib/schemas/*.json:
//   type (incl. array of types), enum, minimum, minLength, required,
//   properties, items, additionalProperties (as schema),
//   propertyNames.pattern, and local $ref (#/$defs/Name).
// Returns an array of human-readable error strings ([] = valid).
// ────────────────────────────────────────────────────────────────

function typeOf(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  if (Number.isInteger(value)) return 'integer';
  return typeof value; // string | number | object | boolean | undefined
}

function resolveRef(root, ref) {
  const match = /^#\/\$defs\/(.+)$/.exec(ref);
  if (!match || !root.$defs || !root.$defs[match[1]]) {
    throw new Error(`Unsupported or unknown $ref: ${ref}`);
  }
  return root.$defs[match[1]];
}

function walk(root, schema, data, where, errors) {
  if (schema.$ref) schema = resolveRef(root, schema.$ref);

  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actual = typeOf(data);
    const ok = types.some((t) => t === actual || (t === 'number' && actual === 'integer'));
    if (!ok) {
      errors.push(`${where}: expected ${types.join('|')}, got ${actual}`);
      return; // type mismatch — deeper checks would be noise
    }
  }

  if (schema.enum && !schema.enum.includes(data)) {
    errors.push(`${where}: "${data}" is not one of [${schema.enum.join(', ')}]`);
  }
  if (typeof schema.minimum === 'number' && typeof data === 'number' && data < schema.minimum) {
    errors.push(`${where}: ${data} is below minimum ${schema.minimum}`);
  }
  if (typeof schema.minLength === 'number' && typeof data === 'string' && data.length < schema.minLength) {
    errors.push(`${where}: must not be empty`);
  }

  if (typeOf(data) === 'object') {
    for (const required of schema.required || []) {
      if (!(required in data)) errors.push(`${where}: missing required "${required}"`);
    }
    if (schema.propertyNames && schema.propertyNames.pattern) {
      const re = new RegExp(schema.propertyNames.pattern);
      for (const key of Object.keys(data)) {
        if (!re.test(key)) errors.push(`${where}: key "${key}" must match ${schema.propertyNames.pattern}`);
      }
    }
    for (const [key, value] of Object.entries(data)) {
      const propSchema = schema.properties && schema.properties[key];
      if (propSchema) {
        walk(root, propSchema, value, `${where}.${key}`, errors);
      } else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        walk(root, schema.additionalProperties, value, `${where}.${key}`, errors);
      }
    }
  }

  if (typeOf(data) === 'array' && schema.items) {
    data.forEach((item, i) => walk(root, schema.items, item, `${where}[${i}]`, errors));
  }
}

function validateAgainstSchema(schema, data, label = 'root') {
  const errors = [];
  walk(schema, schema, data, label, errors);
  return errors;
}

module.exports = { validateAgainstSchema };

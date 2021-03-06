import { ParameterObject, SchemaObject } from 'openapi3-ts';
import CompiledSchema from './CompiledSchema';
import ChowError from '../error';

export default class CompiledParameterPath {
  private compiledSchema: CompiledSchema;
  private pathSchema: SchemaObject = {
    type: 'object',
    properties: {},
    required: []
  };

  constructor(parameters: ParameterObject[]) {
    for (const parameter of parameters) {
      this.pathSchema.properties![parameter.name] = parameter.schema || {};
      /**
       * All path parameters are required
       */
      this.pathSchema.required!.push(parameter.name);
    }

    /**
     * We want query to coerce to array if needed
     * For example:
     *   `/pets/123` will be valid against a schema with type=number even if `123` is string
     */
    this.compiledSchema = new CompiledSchema(this.pathSchema, { coerceTypes: true });
  }

  /**
   * If there is no path passed in, we make it an empty object
   */
  public validate(value: any) {
    try {
      this.compiledSchema.validate(value);
    } catch(e) {
      throw new ChowError('Schema validation error', { in: 'path', rawErrors: e });
    }
  }
}

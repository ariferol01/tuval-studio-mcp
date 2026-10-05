import * as zodPkg from './node_modules/zod/lib/index.js';

if (zodPkg.z.ZodObject && !zodPkg.z.ZodObject.prototype.loose) {
  zodPkg.z.ZodObject.prototype.loose = function() {
    return this.passthrough();
  };
}

export const looseObject = (shape) => zodPkg.z.object(shape).passthrough();
zodPkg.z.looseObject = looseObject;

export const iso = {
  datetime: (opts) => zodPkg.z.string().datetime(opts)
};
zodPkg.z.iso = iso;

export * from './node_modules/zod/lib/index.js';
export const z = zodPkg.z;
export default zodPkg.z;



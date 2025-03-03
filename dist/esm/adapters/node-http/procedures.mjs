import { forEachOpenApiProcedure, getPathRegExp, normalizePath } from '../../utils/index.mjs';
export const createProcedureCache = (router) => {
    const procedureCache = new Map();
    forEachOpenApiProcedure(router._def.procedures, ({ path: queryPath, procedure, openapi }) => {
        if (procedure._def.type === 'subscription') {
            return;
        }
        const { method: oMethod } = openapi;
        const method = (() => {
            if (oMethod)
                return oMethod;
            if (procedure._def.type === 'query')
                return 'GET';
            if (procedure._def.type === 'mutation')
                return 'POST';
            return 'POST';
        })();
        if (!procedureCache.has(method)) {
            procedureCache.set(method, new Map());
        }
        const path = normalizePath(openapi.path || queryPath);
        const pathRegExp = getPathRegExp(path);
        procedureCache.get(method)?.set(pathRegExp, {
            type: procedure._def.type,
            path: queryPath,
            procedure,
        });
    });
    return (method, path) => {
        const procedureMethodCache = procedureCache.get(method);
        if (!procedureMethodCache) {
            return undefined;
        }
        const procedureRegExp = Array.from(procedureMethodCache.keys()).find((re) => re.test(path));
        if (!procedureRegExp) {
            return undefined;
        }
        const procedure = procedureMethodCache.get(procedureRegExp);
        const pathInput = procedureRegExp.exec(path)?.groups ?? {};
        return { procedure, pathInput };
    };
};
//# sourceMappingURL=procedures.js.map
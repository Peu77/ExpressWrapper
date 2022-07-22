"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateListener = void 0;
/**
 * create request listener data object to saving code lines
 * @param routeType
 * @param routePath
 * @param execute
 */
function generateListener(routeType, routePath, execute) {
    return {
        route: {
            type: routeType,
            path: routePath
        },
        execute
    };
}
exports.generateListener = generateListener;

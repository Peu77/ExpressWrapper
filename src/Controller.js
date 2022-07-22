"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initControllers = exports.RouteType = void 0;
var RouteType;
(function (RouteType) {
    RouteType["GET"] = "get";
    RouteType["POST"] = "post";
    RouteType["PUT"] = "put";
    RouteType["DELETE"] = "delete";
})(RouteType = exports.RouteType || (exports.RouteType = {}));
/**
 * register all controllers and their services routes to the Express app
 * @param express
 * @param controllers
 */
function initControllers(express, controllers) {
    controllers.forEach(controller => {
        controller.routes.forEach(route => {
            express[route.type.toString()](`${controller.prefix}/${route.path}`, (req, res) => {
                // find request listener by route path and type
                const requestListener = controller.service.listeners.find(listener => listener.route.path === route.path && listener.route.type === route.type);
                // check if listener was found
                if (!requestListener) {
                    res.status(404).send(`Service wasn't registered for route ${controller.prefix}/${route.path}`);
                    return;
                }
                const responseData = requestListener.execute(req.body);
                res.status(responseData.status).json(Object.assign(Object.assign({}, responseData.data), { message: responseData.message }));
            });
        });
    });
}
exports.initControllers = initControllers;

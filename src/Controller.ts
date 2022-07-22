import {RequestListener, Service, ServiceResponseData} from "./Service";
import {Express} from "express";

export type Controller = {
    prefix: string,
    service: Service
    routes: Route[]
}

export type Route = {
    path: string,
    type: RouteType
}

export enum RouteType {
    GET = "get",
    POST = "post",
    PUT = "put",
    DELETE = "delete"
}

/**
 * register all controllers and their services routes to the Express app
 * @param express
 * @param controllers
 */
export function initControllers(express: Express, controllers: Controller[]): void {
    controllers.forEach(controller => {
            controller.routes.forEach(route => {
                    express[route.type.toString()](`${controller.prefix}/${route.path}`, (
                            req: any, res: any
                        ) => {
                            // find request listener by route path and type
                            const requestListener: RequestListener = controller.service.listeners.find(
                                listener => listener.route.path === route.path && listener.route.type === route.type
                            );

                            // check if listener was found
                            if (!requestListener) {
                                res.status(404).send(`Service wasn't registered for route ${controller.prefix}/${route.path}`);
                                return;
                            }

                            const responseData: ServiceResponseData = requestListener.execute(req.body);
                            res.status(responseData.status).json({
                                ...responseData.data,
                                message: responseData.message
                            })
                        }
                    )
                }
            )
        }
    )
}
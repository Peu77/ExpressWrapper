import {HttpStatus} from "http-status-ts";
import {Route, RouteType} from "./Controller";

export type Service = {
    listeners: RequestListener[]
}

export type RequestListener = {
    route: Route
    execute: (data: any) => ServiceResponseData
}

export type ServiceResponseData = {
    success: boolean,
    message: string,
    status: HttpStatus,
    data: any
}

/**
 * create request listener data object to saving code lines
 * @param routeType
 * @param routePath
 * @param execute
 */
export function generateListener(routeType: RouteType, routePath: string, execute: (data: any) => ServiceResponseData): RequestListener {
    return {
        route: {
            type: routeType,
            path: routePath,
            guards: [],
            dependencies: []
        },
        execute
    }
}
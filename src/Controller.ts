import {RequestListener, Service, ServiceResponseData} from "./Service";
import {Express, json, urlencoded} from "express";
import {GuardFunction} from "./Guard";

export type Controller = {
    prefix: string,
    service: Service
    routes: Route[]
}

export type DependencyOptionResponse = {
    success: boolean,
    message: string,
}

export type DependencyOption<T> = (value: T) => Promise<DependencyOptionResponse>;

export type DependencyResponse = {
    success: boolean,
    messages: string[]
}

type Dependency = {
    valueName: string,
    check(data: any): Promise<DependencyResponse>
    option: DependencyOption<any>[]
}

export class DependencyImpl implements Dependency {
    option: DependencyOption<any>[];
    valueName: string;

    constructor(valueName: string, option: DependencyOption<any>[]) {
        this.valueName = valueName;
        this.option = option;
    }

    /**
     * check if the value is in the data and check all options
     * @param data
     */
    async check(data: any): Promise<DependencyResponse> {
        let messages: string[] = [];
        let success: boolean = true;

        // check if the value is in the data
        if (!data[this.valueName]) {
            success = false;
            messages.push(`${this.valueName} is not in the body`);
        }

        // execute only if the success has been set to true
        if (success)
            await Promise.all(this.option.map(async (option: DependencyOption<any>) => {
                // execute the option function and check if it is false
                const optionResponse: DependencyOptionResponse = await option(data[this.valueName]);
                if (!optionResponse.success) {
                    success = false;
                    messages.push(optionResponse.message);
                }
            }))

        return {
            success: success,
            messages: messages
        }
    }
}

export type Route = {
    path: string,
    type: RouteType,
    dependencies: Dependency[]
    guards: GuardFunction[],
}

export enum RouteType {
    GET = "get",
    POST = "post",
    PUT = "put",
    DELETE = "delete"
}

/**
 * async filter function
 */
export async function filter<T>(array: T[], predicate: (value: T) => Promise<boolean>): Promise<T[]> {
    return (await Promise.all(array.map(async (value: T) => {
        const result: boolean = await predicate(value);
        if (result)
            return value;
    }))).filter((value: T) => value !== undefined && value !== null);
}

/**
 * register all controllers and their services routes to the Express app
 * @param express
 * @param controllers
 */
export function initControllers(express: Express, controllers: Controller[]): void {
    express.use(json())
    express.use(urlencoded({extended: true}))
    controllers.forEach(controller => {
            controller.routes.forEach(route => {
                    express[route.type.toString()](`${controller.prefix}/${route.path}`, async (
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


                            // data which will be sent to the execute function
                            let data: any = {...req.body, ...req.query, headers: req.headers};

                            // check dependencies
                            const dependencies: Dependency[] = route.dependencies;
                            if (dependencies.length > 0) {
                                if (!data) {
                                    res.status(400).send("no body was provided ");
                                    return;
                                }

                                const successDependencies: Dependency[] = await filter(dependencies, async (dependency: Dependency) => {
                                    const dependencyResponse: DependencyResponse = await dependency.check(data);
                                    return dependencyResponse.success;
                                })


                                // check if all dependencies are satisfied
                                if (successDependencies.length !== dependencies.length) {
                                    const failedDependencies: Dependency[] = dependencies.filter(dependency => !successDependencies.includes(dependency));
                                    const messages: string[][] = await Promise.all(failedDependencies.map(async (dependency: Dependency) => [`${dependency.valueName} is not satisfied because:`, ...(await dependency.check(req.body)).messages]));
                                    res.status(400).json(messages);
                                    return;
                                }

                                // set data from the dependencies to the data
                                successDependencies.forEach(dependency => {
                                    data[dependency.valueName] = data[dependency.valueName];
                                })
                            }

                            // handle guards
                            const guards: GuardFunction[] = route.guards;
                            if (guards.length > 0) {
                                const successGuards: GuardFunction[] = await filter(guards, async (guard: GuardFunction) => {
                                    const serviceResponseData: ServiceResponseData = await guard(data);
                                    data = {...data, ...serviceResponseData.data};
                                    return serviceResponseData.success
                                })

                                // check if all guards are satisfied
                                if (successGuards.length !== guards.length) {
                                    const failedGuards: GuardFunction[] = guards.filter(guard => !successGuards.includes(guard));
                                    const messages: string[] = await Promise.all(failedGuards.map(async (guard: GuardFunction) => (await guard(data)).message));
                                    res.status(400).json({
                                        guardProblems: messages
                                    });
                                    return;
                                }
                            }

                            const responseData: ServiceResponseData = await requestListener.execute(data);
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
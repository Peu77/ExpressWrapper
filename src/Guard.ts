import {ServiceResponseData} from "./Service";

export type GuardFunction = (data: any) => Promise<ServiceResponseData>
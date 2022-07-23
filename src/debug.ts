import express from "express";

import {
    Controller,
    initControllers,
    RouteType,
    Service,
    generateListener,
    DependencyImpl,
    DependencyOptions, GuardFunction
} from "../src";

import request from "supertest";

const service: Service = {
    listeners: [
        generateListener(RouteType.POST, "isEmail", (data: any) => {
            return {
                success: true,
                message: "finished",
                status: 200,
                data: {}
            }
        }),

        generateListener(RouteType.POST, "user", (data: any) => {
            return {
                success: true,
                message: "finished",
                status: 200,
                data: {
                    userData: data.userData
                }
            }
        })
    ]
}

const guard: GuardFunction = async (data: any) => {
    if (data.user != "secret") {
        return {
            success: false,
            message: "user not secret",
            status: 400,
            data: {}
        }
    }

    return {
        success: true,
        message: "",
        status: 200,
        data: {
            userData: "important data"
        }
    }
}

const controller: Controller = {
    prefix: "/api",
    service: service,
    routes: [
        {
            path: "isEmail",
            type: RouteType.POST,
            guards: [],
            dependencies: [
                new DependencyImpl("email", [
                    DependencyOptions.isEmailOption,
                    DependencyOptions.getMaxLengthOption(13),
                    DependencyOptions.getMinLengthOption(10),
                ])
            ]
        },
        {
            path: "user",
            type: RouteType.POST,
            guards: [guard],
            dependencies: [
                new DependencyImpl("user", [])
            ]
        }
    ]
}


const app = express();
const server = app.listen(3000, () => {
    initControllers(app, [controller]);
    console.log("init server")
})
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

const guard: GuardFunction = (data: any) => {
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
const server = app.listen(0, () => {
    initControllers(app, [controller]);
})

describe("Test application", () => {
    test("value test", async () => {
        const res = await request(app).post("/api/isEmail").send({})

        expect(res.statusCode).toBe(400);
    })

    test("email test", async () => {
        const res = await request(app).post("/api/isEmail").send({
            email: "test@test.de"
        })

        expect(res.statusCode).toBe(200);
    })

    test("max length test", async () => {
        const res = await request(app).post("/api/isEmail").send({
            email: "gwe@tegwegwst.degweg"
        })

        expect(res.statusCode).toBe(400);
    })

    test("min length test", async () => {
        const res = await request(app).post("/api/isEmail").send({
            email: "t@te.de"
        })

        expect(res.statusCode).toBe(400);
    })

    test("guard test 1", async () => {
        const res = await request(app).post("/api/user").send({
            user: "secretf"
        })

        expect(res.statusCode).toBe(400);
    })

    test("guard test 2", async () => {
        const res = await request(app).post("/api/user").send({
            user: "secret"
        })

        expect(res.statusCode).toBe(200);
        expect(res.body.userData).toBe("important data");
    })
})

afterAll(async () => {
    await server.close()
})
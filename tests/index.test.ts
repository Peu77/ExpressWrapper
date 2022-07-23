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
        })
    ]
}

const guard: GuardFunction = (data: any) => {
    if (data.tests.length < 10) {
        return {
            success: false,
            message: "tests length must be greater than 10",
            status: 400,
            data: {}
        }
    }

    return {
        success: true,
        message: "",
        status: 200,
        data: {
            tests: data.tests
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
})

afterAll(async () => {
    await server.close()
})
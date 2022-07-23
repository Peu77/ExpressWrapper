# ExpressWrapper

[![install size](https://packagephobia.com/badge?p=@peu77/expresswrapper)](https://packagephobia.com/result?p=@bergerapi/env)

Simple construct for an express application.

## Installation

### With NPM

``npm i @peu77/expresswrapper``

## With Yarn

``yarn add @peu77/expresswrapper``

### You need to create a service and a controller

###  

#### Imports
```typescript
import {
    Controller,
    initControllers,
    RouteType,
    Service,
    generateListener,
    DependencyImpl
} from '@peu77/expresswrapper';
```

#### Basic service
```typescript
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
```

#### Basic controller which use the service
```typescript
const controller: Controller = {
    prefix: "/api",
    service: service,
    routes: [
        {
            path: "test",
            type: RouteType.POST,
            guards: [],
            dependencies: []
        }
    ]
}
```

#### If you have a controller you can use the initControllers function
```typescript
const app = express();
app.listen(3000, () => {
    initControllers(app, [controller]);
})
```
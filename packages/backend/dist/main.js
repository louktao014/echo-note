"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    console.log('process.env.PORT :', process.env.PORT);
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: `http://localhost:${process.env.FRONT_END_PORT}`,
        credentials: true,
    });
    await app.listen(process.env.PORT || 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map
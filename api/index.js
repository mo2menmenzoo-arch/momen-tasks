"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const common_1 = require("@nestjs/common");
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const app_module_1 = require("../src/app.module");
const http_exception_filter_1 = require("../src/common/filters/http-exception.filter");
const prisma_exception_filter_1 = require("../src/common/filters/prisma-exception.filter");
let cachedServer;
async function createServer() {
    const expressApp = (0, express_1.default)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp), {
        bufferLogs: true,
    });
    app.use((0, helmet_1.default)({ crossOriginEmbedderPolicy: false }));
    app.use((0, cookie_parser_1.default)());
    app.enableCors({
        origin: process.env.FRONTEND_URL || '*',
        credentials: true,
    });
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        defaultVersion: '1',
        prefix: 'api/v',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(), new prisma_exception_filter_1.PrismaExceptionFilter());
    await app.init();
    return expressApp;
}
async function handler(req, res) {
    if (!cachedServer) {
        cachedServer = await createServer();
    }
    return cachedServer(req, res);
}
//# sourceMappingURL=index.js.map
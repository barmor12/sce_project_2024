"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("../models/user_model"));
const userEmail = "user2@gmail.com";
const userPassword = "12345";
let accessToken = "";
let refreshToken = "";
let server;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    server = server_1.default.listen(3000);
    yield mongoose_1.default.model('User').deleteMany({});
    yield mongoose_1.default.model('Post').deleteMany({});
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
    server.close();
}));
describe("Auth Tests", () => {
    describe("Register Tests", () => {
        test("Register with valid credentials", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/auth/register')
                .send({
                email: userEmail,
                password: userPassword
            });
            expect(response.statusCode).toEqual(201);
        }), 10000);
        test("Register with empty email", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/auth/register')
                .send({
                email: "",
                password: userPassword
            });
            expect(response.statusCode).not.toEqual(201);
        }), 10000);
        test("Register with empty password", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/auth/register')
                .send({
                email: userEmail,
                password: ""
            });
            expect(response.statusCode).not.toEqual(201);
        }), 10000);
        test("Register with empty email and password", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/auth/register')
                .send({
                email: "",
                password: ""
            });
            expect(response.statusCode).not.toEqual(201);
        }), 10000);
        test("Register with existing email", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/auth/register')
                .send({
                email: userEmail,
                password: userPassword
            });
            expect(response.statusCode).not.toEqual(201);
        }), 10000);
    });
    describe("Login Tests", () => {
        test("Login Test", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/auth/login')
                .send({
                email: userEmail,
                password: userPassword
            });
            expect(response.statusCode).toEqual(200);
            accessToken = response.body.accessToken;
            expect(accessToken).not.toBeNull();
            refreshToken = response.body.refreshToken;
            expect(refreshToken).not.toBeNull();
            const user1 = yield user_model_1.default.findOne({ email: userEmail });
            expect(user1.refresh_tokens).toContain(refreshToken);
        }));
        test("Login with wrong password", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/auth/login')
                .send({
                email: userEmail,
                password: "wrongpassword"
            });
            expect(response.statusCode).not.toEqual(200);
            const access = response.body.accessToken;
            expect(access).toBeUndefined();
        }), 10000);
        test("Login with wrong email", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/auth/login')
                .send({
                email: "wrongemail@example.com",
                password: userPassword
            });
            expect(response.statusCode).not.toEqual(200);
            const access = response.body.accessToken;
            expect(access).toBeUndefined();
        }), 10000);
        test("Login with empty email", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/auth/login')
                .send({
                email: "",
                password: userPassword
            });
            expect(response.statusCode).not.toEqual(200);
        }), 10000);
        test("Login with empty password", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/auth/login')
                .send({
                email: userEmail,
                password: ""
            });
            expect(response.statusCode).not.toEqual(200);
        }), 10000);
        test("Login with not registered email", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/auth/login')
                .send({
                email: "nonexistent@example.com",
                password: userPassword
            });
            expect(response.statusCode).not.toEqual(200);
        }), 20000);
    });
    describe("Token Access Tests", () => {
        test("Unauthorized access without token", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default).get('/post');
            expect(response.statusCode).not.toEqual(200);
        }));
        test("Test Using valid Access Token:", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default).get("/post")
                .set('Authorization', 'Bearer ' + accessToken);
            expect(response.statusCode).toEqual(200);
        }));
        test("Test Using Worng Access Token:", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default).get("/post")
                .set('Authorization', 'Bearer 1' + accessToken);
            expect(response.statusCode).not.toEqual(200);
        }));
        jest.setTimeout(30000);
        test("test expired token", () => __awaiter(void 0, void 0, void 0, function* () {
            yield new Promise(r => setTimeout(r, 10000));
            const response = yield (0, supertest_1.default)(server_1.default).get("/post")
                .set('Authorization', 'Bearer ' + accessToken);
            expect(response.statusCode).not.toEqual(200);
        }));
        test("refresh token test", () => __awaiter(void 0, void 0, void 0, function* () {
            let response = yield (0, supertest_1.default)(server_1.default).get("/auth/refresh").set('Authorization', 'Bearer ' + refreshToken);
            expect(response.statusCode).toEqual(200);
            const newaccessToken = response.body.accessToken;
            expect(newaccessToken).not.toBeNull();
            const newrefreshToken = response.body.refreshToken;
            expect(newrefreshToken).not.toBeNull();
            response = yield (0, supertest_1.default)(server_1.default).get("/post")
                .set('Authorization', 'Bearer ' + newaccessToken);
            expect(response.statusCode).toEqual(200);
        }));
    });
    describe("Logout Tests", () => {
        test("Logout test", () => __awaiter(void 0, void 0, void 0, function* () {
            if (!refreshToken) {
                console.log("Refresh token not found: Skipping logout test.");
                return;
            }
            const response = yield (0, supertest_1.default)(server_1.default)
                .get('/auth/logout')
                .set('Authorization', 'Bearer ' + refreshToken).send();
            expect(response.statusCode).toEqual(200);
        }));
    });
});
//# sourceMappingURL=auth.test.js.map
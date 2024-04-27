import request from "supertest";
import app from '../server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import user from "../models/user_model";

const userEmail = "user2@gmail.com";
const userPassword = "12345";
let accessToken = "";
let refreshToken = "";
let server;

beforeAll(async () => {
    server = app.listen(3000);
    await mongoose.model('User').deleteMany({});
    await mongoose.model('Post').deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
    server.close();
});

describe("Auth Tests", () => {
    describe("Register Tests", () => {
        test("Register with valid credentials", async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    email: userEmail,
                    password: userPassword
                });
            expect(response.statusCode).toEqual(201);
        }, 10000);
        
        test("Register with empty email", async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    email: "",
                    password: userPassword
                });
            expect(response.statusCode).not.toEqual(201);
        }, 10000);

        test("Register with empty password", async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    email: userEmail,
                    password: ""
                });
            expect(response.statusCode).not.toEqual(201);
        }, 10000);

        test("Register with empty email and password", async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    email: "",
                    password: ""
                });
            expect(response.statusCode).not.toEqual(201);
        }, 10000);

        test("Register with existing email", async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    email: userEmail,
                    password: userPassword
                });
            expect(response.statusCode).not.toEqual(201);
        }, 10000);
    });

    describe("Login Tests", () => {
        test("Login Test", async () => {
            const response = await request(app)
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

            const user1 = await user.findOne({ email: userEmail });
            expect(user1.refresh_tokens).toContain(refreshToken);
        });

        test("Login with wrong password", async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: userEmail,
                    password: "wrongpassword"
                });
            expect(response.statusCode).not.toEqual(200);
            const access = response.body.accessToken;
            expect(access).toBeUndefined();
        }, 10000);

        test("Login with wrong email", async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: "wrongemail@example.com",
                    password: userPassword
                });
            expect(response.statusCode).not.toEqual(200);
            const access = response.body.accessToken;
            expect(access).toBeUndefined();
        }, 10000);

        test("Login with empty email", async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: "",
                    password: userPassword
                });
            expect(response.statusCode).not.toEqual(200);


        }, 10000);

        test("Login with empty password", async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: userEmail,
                    password: ""
                });
            expect(response.statusCode).not.toEqual(200);

        }, 10000);

        test("Login with not registered email", async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: "nonexistent@example.com",
                    password: userPassword
                });
            expect(response.statusCode).not.toEqual(200);
        }, 20000);
    });

    describe("Token Access Tests", () => {
        test("Unauthorized access without token", async () => {
            const response = await request(app).get('/post');
            expect(response.statusCode).not.toEqual(200);
        });

        test("Test Using valid Access Token:", async () => {
            const response = await request(app).get("/post")
                .set('Authorization', 'Bearer ' + accessToken);
            expect(response.statusCode).toEqual(200);

        });
        test("Test Using Worng Access Token:", async () => {
            const response = await request(app).get("/post")
                .set('Authorization', 'Bearer 1' + accessToken);
            expect(response.statusCode).not.toEqual(200);
        });

        jest.setTimeout(30000);
        test("test expired token", async () => {
            await new Promise(r => setTimeout(r, 10000));
            const response = await request(app).get("/post")
                .set('Authorization', 'Bearer ' + accessToken);
            expect(response.statusCode).not.toEqual(200);
        });

        test("refresh token test", async () => {
            let response = await request(app).get("/auth/refresh").set
            ('Authorization', 'Bearer ' + refreshToken);   
            expect(response.statusCode).toEqual(200);

            const newaccessToken = response.body.accessToken;
            expect(newaccessToken).not.toBeNull();
            const newrefreshToken = response.body.refreshToken;
            expect(newrefreshToken).not.toBeNull();

            response = await request(app).get("/post")
                .set('Authorization', 'Bearer ' + newaccessToken);
            expect(response.statusCode).toEqual(200);




        });
    });

    describe("Logout Tests", () => {
        test("Logout test", async () => {
            if (!refreshToken) {
                console.log("Refresh token not found: Skipping logout test.");
                return;
            }
            const response = await request(app)
                .get('/auth/logout')
                .set('Authorization', 'Bearer ' + refreshToken).send();
            expect(response.statusCode).toEqual(200);
        });
    });
});
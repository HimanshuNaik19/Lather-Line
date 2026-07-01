# 💳 Payments, Deployment & Production Readiness

This document explains how Lather & Line handles online payments and how the application is configured to run securely in a production environment.

---

## 1. What does this feature area do?
It enables customers to pay for their laundry orders online using credit cards, UPI, or net banking. It also ensures the application can be safely hosted on the internet, automatically deployed, and securely configured.

## 2. What problem does it solve?
- **Payments:** Cash-only businesses struggle to scale. Integrating an online payment gateway automates the collection of revenue.
- **Hosting:** A local development server (`localhost`) is useless for real customers. We need automated infrastructure (Docker, Nginx) to serve the app reliably to the public.

## 3. How is it implemented?

### Razorpay Integration
We use the Razorpay Payment Gateway.
- **Backend:** The Spring Boot backend uses the official `razorpay-java` SDK. When an order reaches the `PAYMENT_PENDING` state, the server makes an API call to Razorpay to generate a unique `order_id`. 
- **Frontend:** The React frontend loads the `checkout.js` script (loaded with `defer` for performance). When the user clicks "Pay", a Razorpay popup opens. 
- **Verification:** After the user pays, Razorpay returns a cryptographic signature. The backend verifies this signature using its secret key before marking the order as `PAID`.

### Externalized Secrets (`.env` & `application-prod.yml`)
You should never hardcode secret keys in your source code.
- We use Spring Boot's environment variable substitution: `${RAZORPAY_KEY_ID}`.
- We created an `application-prod.yml` that overrides the default settings when deployed. It completely disables internal logging and turns off development tools to secure the application.

### Docker & Nginx
To ensure the application runs identically on any server, we use Docker.
- **Frontend Dockerfile:** We use a "Multi-Stage Build". First, a Node.js container builds the React code into static HTML/CSS/JS. Then, an Nginx container serves those static files.
- **Nginx Config (`nginx.conf`):** We configured Nginx to compress files (Gzip) to make them load faster, and to route all traffic to `index.html` to support React Router's client-side navigation.

### Automated Deployment (Render.com)
We use Infrastructure-as-Code (IaC) via a `render.yaml` file.
- This file tells Render.com exactly how to build and host both the backend and the frontend.
- When you push code to GitHub, Render automatically reads this file, sets up the environment variables, builds the Docker containers, and deploys them to the internet with free SSL certificates.

## 4. What can you learn from this?
- **Secure Integrations:** How to securely implement 3rd-party payment gateways using backend signature verification.
- **DevOps Basics:** How to use Docker multi-stage builds and Nginx reverse proxies for modern web applications.
- **12-Factor App Principles:** Why externalizing configuration into environment variables is critical for production security.

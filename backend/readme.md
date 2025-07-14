1) open smartshop in terminal & in terminal type mkdir backend
2) in terminal type cd backend and then type "npm init -y" to create package.json file in backend folder
3) npm install express mongoose dotenv cors
4) npm install --save-dev nodemon
5) create a file in backend with name "index.js"
6) create a folder in backend with name "controllers" for writing the logic part
7) create a folder in backend with name "routes" for routing
8) create a folder in backend with name "models" for creating database models
9) create a folder in backend with name "middleware" for token verification
<!-- 9) create a folder in backend with name "utils" to store reusable functions and logic -->
10) add "start": "nodemon index.js" in scripts of package.json and run the project with the command "nodemon index.js"
11) npm i bcrypt when doing authentication of user
12) npm i jsonwebtoken
13) npm install nodemailer

<!-- if there is any cors error in project then go to backend folder in terminal and type "npm i cors"
add const cors = require("cors"); in index.js
add app.use(cors()); in index.js -->



✅ 2. Manage Providers
Create a route /admin/providers to:

View all providers

Approve, block, or activate/deactivate provider profiles

You can allow admin to toggle isActive on provider accounts.

✅ 3. Manage Services
Create route /admin/services:

View all services listed on the platform

Filter by provider/category/status

Deactivate services violating rules (isActive: false)

✅ 4. Manage Bookings
Allow admin to:

View all bookings (by status/date)

Delete or override bookings if needed

✅ 5. Admin Controls for Categories
Add a route like /admin/categories to:

Add/edit/remove service categories (Plumbing, AC Repair, etc.)

(Optional) Let providers choose only from predefined categories

✅ 6. Reports and Analytics (Optional - Future Phase)
Add endpoints to download booking reports, revenue by service, etc.
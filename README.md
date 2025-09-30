# Core Shiksha Academy Website

This is the complete source code for the Core Shiksha Academy website, including the frontend and a Node.js backend to handle form submissions.

## Project Status

This project has been cleaned up and configured to be ready for local testing and deployment. 

- The backend is a Node.js/Express server that uses MongoDB for its database.
- All frontend forms (Student Registration, Technical Registration, Career, Contact, Feedback) are now connected to the backend.
- All internal links and paths for CSS, JS, and images have been corrected.
- Unused code and files have been removed.

## How to Run Locally

To run this website on your local machine, you will need **Node.js**, **npm**, and **MongoDB** installed.

### 1. Install Dependencies

Navigate to the project directory in your terminal and run:

```bash
npm install
```

This will install all the necessary backend dependencies listed in `package.json` (like Express, Mongoose, etc.).

### 2. Start Your MongoDB Database

Make sure your local MongoDB server is running. By default, the application will try to connect to `mongodb://localhost:27017/coer_shiksha_db`.

### 3. Create Upload Folders

Manually create a folder named `uploads` in the main project directory. Inside `uploads`, create the following three folders:
- `resumes`
- `student_docs`
- `tech_docs`

This is where the files from your website's forms will be saved.

### 4. Start the Server

Once the dependencies are installed and MongoDB is running, you can start the server with:

```bash
npm start
```

This will launch the backend server. You will see a message in your terminal:
`Server is running on port 3000`
`MongoDB Connected...`

### 5. View the Website

Open your web browser and go to:
[http://localhost:3000](http://localhost:3000)

You should see your homepage. You can now navigate the entire website, and all forms will submit data to your local MongoDB database.

## Ready for Hosting

Your website is now ready to be hosted.

1.  **Hosting Provider**: Choose a hosting provider that supports Node.js applications (e.g., Railway, Vercel, Heroku, DigitalOcean).
2.  **Database**: You will need to create a **cloud MongoDB database**. MongoDB Atlas offers a generous free tier that is perfect for most projects. 
3.  **Environment Variable**: Once you have your cloud database, you will get a connection string (URL). In your hosting provider's settings, create an **environment variable** named `MONGODB_URI` and set its value to your MongoDB Atlas connection string. The `server.js` file is already configured to use this variable when deployed.
4.  **File Storage**: For file uploads, it is highly recommended to use a cloud storage service like **AWS S3** or **Cloudinary**, as most modern hosting platforms have ephemeral filesystems. You would need to update the routes in the `/routes` directory to upload files to your chosen service instead of the local `/uploads` folder.

## Manual File Cleanup

As requested, I have prepared the project for you. Please manually delete the following files and folders which are not needed:

- `testing.html`
- `desktop.ini`
- `folderico-red.ico`
- The entire `register and login form/` directory

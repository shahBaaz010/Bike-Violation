// Script to set up admin user in MongoDB
// Run this script to create an admin user in your database

const adminUser = {
  id: "admin-68a78c9ca5124e12cefe1eb9", // Using the ID you provided
  email: "admin@bikeviolation.gov",
  password: "admin12345", // Change this to a secure password
  firstName: "System",
  lastName: "Administrator",
  role: "super_admin",
  department: "management",
  permissions: [
    {
      resource: "violations",
      actions: ["view", "create", "edit", "delete", "approve"]
    },
    {
      resource: "users",
      actions: ["view", "create", "edit", "delete"]
    },
    {
      resource: "payments",
      actions: ["view", "create", "edit", "delete"]
    },
    {
      resource: "queries",
      actions: ["view", "create", "edit", "delete"]
    },
    {
      resource: "reports",
      actions: ["view", "create", "edit", "delete"]
    },
    {
      resource: "settings",
      actions: ["view", "create", "edit", "delete"]
    }
  ],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// MongoDB commands to run in your database:

console.log("=== MongoDB Commands to Run ===");
console.log("");
console.log("1. Connect to your MongoDB database");
console.log("2. Switch to your database (e.g., bike_violation)");
console.log("3. Run the following command:");
console.log("");
console.log("db.admin_users.insertOne(");
console.log(JSON.stringify(adminUser, null, 2));
console.log(");");
console.log("");
console.log("=== Alternative: Using MongoDB Compass ===");
console.log("1. Open MongoDB Compass");
console.log("2. Connect to your database");
console.log("3. Navigate to the 'admin_users' collection");
console.log("4. Click 'Add Data' -> 'Insert Document'");
console.log("5. Paste the following JSON:");
console.log("");
console.log(JSON.stringify(adminUser, null, 2));
console.log("");
console.log("=== Login Credentials ===");
console.log("Email: admin@bikeviolation.gov");
console.log("Password: admin12345");
console.log("");
console.log("=== Important Notes ===");
console.log("- Change the password in production");
console.log("- The password should be hashed in a real application");
console.log("- Make sure your MongoDB connection is working");
console.log("- The admin user will have full system access");

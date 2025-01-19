// // Import required modules
// const mongoose = require("mongoose");
// const Document = require("./Document");
// require('dotenv').config();

// // Define the MongoDB connection string
// const DB_CONNECTION_STRING = process.env.MONGO_URI;

// // Connect to MongoDB
// mongoose.connect(DB_CONNECTION_STRING, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useFindAndModify: false,
//   useCreateIndex: true,
// });

// // Initialize Socket.IO server
// const socketIO = require("socket.io")(3001, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//   },
// });

// // Default value for new documents
// const DEFAULT_DOCUMENT_VALUE = "";

// // Socket.IO event handling for document operations
// socketIO.on("connection", clientSocket => {
//   clientSocket.on("get-document", async documentId => {
//     // Find or create the document
//     const document = await findOrCreateDocument(documentId);

//     // Join the room corresponding to the document ID
//     clientSocket.join(documentId);

//     // Emit the document data to the connected client
//     clientSocket.emit("load-document", document.data);

//     clientSocket.on("send-changes", delta => {
//       // Broadcast the received changes to all other clients in the same room
//       clientSocket.broadcast.to(documentId).emit("receive-changes", delta);
//     });

//     clientSocket.on("save-document", async data => {
//       // Update the document data in the database
//       await updateDocumentData(documentId, data);
//     });
//   });
// });

// // Function to find or create a document with the given ID
// async function findOrCreateDocument(documentId) {
//   if (documentId == null) return; // If no ID is provided, return undefined

//   // Check if the document already exists in the database
//   const document = await Document.findById(documentId);
//   if (document) return document; // If found, return the document

//   // If the document does not exist, create a new one with the default value
//   return await Document.create({ _id: documentId, data: DEFAULT_DOCUMENT_VALUE });
// }

// // Function to update document data in the database
// async function updateDocumentData(documentId, newData) {
//   await Document.findByIdAndUpdate(documentId, { data: newData });
// }



// Import required modules
const mongoose = require("mongoose");
const Document = require("./Document");
require("dotenv").config();

// Define the MongoDB connection string
const DB_CONNECTION_STRING = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(DB_CONNECTION_STRING, {
  useNewUrlParser: true, // Use the new URL parser
  useUnifiedTopology: true, // Use the new server discovery and monitoring engine
})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Initialize Socket.IO server
const socketIO = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:3000", // Allow requests from the client
    methods: ["GET", "POST"], // Allowed HTTP methods
  },
});

// Default value for new documents
const DEFAULT_DOCUMENT_VALUE = "";

// Socket.IO event handling for document operations
socketIO.on("connection", (clientSocket) => {
  console.log("New client connected");

  clientSocket.on("get-document", async (documentId) => {
    // Find or create the document
    const document = await findOrCreateDocument(documentId);

    // Join the room corresponding to the document ID
    clientSocket.join(documentId);

    // Emit the document data to the connected client
    clientSocket.emit("load-document", document.data);

    clientSocket.on("send-changes", (delta) => {
      // Broadcast the received changes to all other clients in the same room
      clientSocket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    clientSocket.on("save-document", async (data) => {
      // Update the document data in the database
      await updateDocumentData(documentId, data);
    });
  });
});

// Function to find or create a document with the given ID
async function findOrCreateDocument(documentId) {
  if (documentId == null) return; // If no ID is provided, return undefined

  try {
    // Check if the document already exists in the database
    const document = await Document.findById(documentId);
    if (document) return document; // If found, return the document

    // If the document does not exist, create a new one with the default value
    return await Document.create({ _id: documentId, data: DEFAULT_DOCUMENT_VALUE });
  } catch (err) {
    console.error("Error finding or creating document:", err);
    throw err;
  }
}

// Function to update document data in the database
async function updateDocumentData(documentId, newData) {
  try {
    await Document.findByIdAndUpdate(documentId, { data: newData });
  } catch (err) {
    console.error("Error updating document data:", err);
    throw err;
  }
}

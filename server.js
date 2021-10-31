const express = require("express");
const path = require("path");
const fs = require("fs");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the public files
app.use(express.static("public"));

// GET route for homepage
app.get('/', (req, res) => 
    res.sendFile(path.join(__dirname, "/public/index.html"))
);

// GET notes page
app.get("/notes", (req, res) =>
    res.sendFile(path.join(__dirname, "/public/notes.html"))
);

// Display the existing notes from the json file
app.get("/api/notes", (req, res) => 
    res.sendFile(path.join(__dirname, "./db/db.json"))
);

// GET notes based of it's ID
app.get("/api/notes/:id", (req, res) => {
    // Read file, parse the json array, then pass object based on the :id
    // parameter
    let notes = JSON.parse(fs.readFileSync("./db/db.json", "utf8"));
    res.json(notes[parseInt(req.params.id)]);
});

// POST to add notes
app.post("/api/notes", (req, res) => {
    console.info(req.body);
    let notes = JSON.parse(fs.readFileSync("./db/db.json", "utf8"));
    let noteId = notes.length.toString();

    // Here we get the  title and text of the post request
    // Destructure the object
    const { title, text} = req.body;
    

    if (title && text) {
        const newNote = {
            title,
            text,
            id: noteId
        }
        // Push new current note to the notes array
        notes.push(newNote);
        
        // Append the file to the json file here
        fs.writeFileSync("./db/db.json", JSON.stringify(notes));
        
        const response = {
            status: "success",
            body: notes
        }

        res.status(201).json(response.body);
    
    } else {
        res.status(500).json("! Error posting note !")
    }
})

// DELETE notes using the id parameter
app.delete("/api/notes/:id", (req, res) => {
    // Get notes array
    let notes = JSON.parse(fs.readFileSync("./db/db.json", "utf8"));
    console.log(req.params.id);
    // id of note to be deleted
    let noteId = req.params.id;
    let newId = 0;

    // Return all notes excpet the one that matches the note id parameter
    // Update the notes array using this result
    notes = notes.filter(currentNote => {
        return currentNote.id != noteId;
    })

    // Assign new Id to each note element in the array
    notes.forEach(element => {
        element.id = newId.toString();
        newId++
    });

    // Return the new notes array as a string
    fs.writeFileSync("./db/db.json", JSON.stringify(notes));
    res.json(notes);
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
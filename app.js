require('dotenv').config();
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

app.use(bodyParser.json());
app.use(express.static('public'));

let questionsData = [];

fs.readFile('questionsData.json', 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading the file:", err);
        return;
    }
    questionsData = JSON.parse(data);
});

const connectionString = process.env.MONGO_DB_CONNECTION_STRING;

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB Atlas');
});

const userAnswerSchema = new mongoose.Schema({
    sessionID: String,
    question_id: Number,
    answer: String
});
const UserAnswer = mongoose.model('UserAnswer', userAnswerSchema);

const answerCountSchema = new mongoose.Schema({
    question_id: Number,
    yes: Number,
    no: Number
});
const AnswerCount = mongoose.model('AnswerCount', answerCountSchema);

app.get('/new-session', (req, res) => {
    const sessionID = uuidv4();
    res.json({ sessionID: sessionID });
});

app.get('/questions/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const questionObj = questionsData.find(q => q.id === id);
    if (!questionObj) {
        res.status(404).json({error: "Not found"});
        return;
    }
    res.json({ question: questionObj.question, choices: questionObj.choices });
});

app.get('/answers/:sessionID', async (req, res) => {
    const sessionID = req.params.sessionID;
    try {
        const answers = await UserAnswer.find({ sessionID: sessionID });
        if (!answers) {
            res.status(404).json({ message: "No answers found for this session" });
            return;
        }
        res.json(answers);
    } catch (err) {
        res.status(500).json({ message: "Error fetching answers from database" });
    }
});



app.post('/answers/:sessionID/:id', async (req, res) => {
    const sessionID = req.params.sessionID;
    const id = parseInt(req.params.id);
    const answer = req.body.answer;

    const questionObj = questionsData.find(q => q.id === id);
    if (!questionObj) {
        res.status(404).json({error: "Not found"});
        return;
    }

    const feedback = questionObj.feedback[answer];
    if (!feedback) {
        res.status(400).json({error: "Invalid answer choice"});
        return;
    }

    const userAnswer = new UserAnswer({ sessionID, question_id: id, answer });
    try {
        await userAnswer.save();
        res.json({ feedback: feedback });
    } catch (err) {
        res.status(500).json({error: "Error saving data"});
    }
});



app.get('/summary', async (req, res) => {
    const counts = await AnswerCount.find({});
    const percentages = {};
    counts.forEach(count => {
        const total = count.yes + count.no;
        percentages[count.question_id] = {
            yes: (count.yes / total) * 100,
            no: (count.no / total) * 100,
        };
    });
    res.json({ percentages: percentages });
});

app.get('/answers-for-session/:sessionID', async (req, res) => {
    const sessionID = req.params.sessionID;
    try {
        const answers = await UserAnswer.find({ sessionID: sessionID });
        res.json(answers);
    } catch (err) {
        res.status(500).json({ message: "Error fetching answers from database" });
    }
});


app.get('/end-session/:sessionID', async (req, res) => {
    const sessionID = req.params.sessionID;
    try {
        const answers = await UserAnswer.find({ sessionID: sessionID });
        if (!answers || answers.length === 0) {
            res.status(400).json({ message: "No answers found for this session" });
            return;
        }

        for(let ans of answers) {
            let count = await AnswerCount.findOne({ question_id: ans.question_id });
            if(!count) {
                count = new AnswerCount({ question_id: ans.question_id, yes: 0, no: 0 });
            }
            count[ans.answer]++;
            await count.save();
        }

        res.json({ message: "Answers saved successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Error fetching answers from database" });
    }
});

app.get('/questions-data', (req, res) => {
    const reducedData = questionsData.map(q => ({
        question: q.question,
        choices: q.choices
    }));
    res.json(reducedData);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});

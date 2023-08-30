require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');


app.use(bodyParser.json());
app.use(express.static('public'));



const questionsData = [
    {
        id: 0,
        question: "Találhat nekünk párt a mesterséges intelligencia?",
        choices: {
            yes: "Igen",
            no: "Nem"
        },
        feedback: {
            yes: "[[italic]]Bizonyára sekélyes ember vagy, aki azt gondolja, hogy a szerelemhez csak a [[bold]]“párkapcsolati piacon”[[/bold]] megfelelő személyiségű portfolióval rendelkező áru megtalálására van szükség.[[/italic]][[br]][[br]]Ez a párkapcsolatok közgazadságtani szemlélete, ami a fogyasztói világ logikáját ülteti bele a szerelmi életbe. A szeretet azonban nem akkor lobban fel, amikor a megfelelő tárgyat megtaláljuk hozzá. A szeretet és a szerelem a pszichológia szerint képesség, amit a személyiségünkön belül kell fejleszteni. Ha folyton kudarcot vallasz, az nem a megfelelő pártaláló algoritmus, hanem a benned lévő készségek hiányoznak. Ebben pedig egy algoritmus nem tud segíteni.", // Your feedback for yes
            no: "Már a manuális, emberek által ...", // Your feedback for no
        }
    },
    {
        id: 1,
        question: "Jobb városban élni?",
        choices: {
            yes: "Igen",
            no: "Nem"
        },
        feedback: {
            yes: "Úgy tűnik, hogy téged is megtéveszt ...", // Your feedback for yes
            no: "Hiába forr benned a kurucvér, ...", // Your feedback for no
        }
    },
    {
        id: 2,
        question: "Kifejlesztenek egy agyfokozó pirulát, amitől magabiztosabbak lesznek az emberek - bevezetnéd-e?",
        choices: {
            yes: "Igen",
            no: "Nem"
        },
        feedback: {
            yes: "Gratulálok az emberi faj elpusztításához. Most legalizáltad a kokaint.", // Your feedback for yes
            no: "Gratulálok, üdv a vesztesek országában.. ", // Your feedback for no
        }
    },
    {
        id: 3,
        question: "Legyen ingyenes wifi a közterületeken?",
        choices: {
            yes: "Igen",
            no: "Nem"
        },
        feedback: {
            yes: "Ha szeretsz veszélyesen élni, és nem zavar, hogy az összes banki és személyes adatod veszélybe kerül, akkor érthető a választásod. ", // Your feedback for yes
            no: "Az internet, ahol minden történik, és ahol minden tudás elérhető ezek szerint csak a kiváltságosoknak jár? Na szép!", // Your feedback for no
        }
    }
    //... Add more questions similarly
];

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

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
            yes: "Bizonyára sekélyes ember vagy, aki azt gondolja, hogy a szerelemhez csak a “párkapcsolati piacon” megfelelő személyiségű portfolióval rendelkező áru megtalálására van szükség.[[br]][[br]]Ez a párkapcsolatok közgazadságtani szemlélete, ami a fogyasztói világ logikáját ülteti bele a szerelmi életbe. A szeretet azonban nem akkor lobban fel, amikor a megfelelő tárgyat megtaláljuk hozzá. A szeretet és a szerelem a pszichológia szerint képesség, amit a személyiségünkön belül kell fejleszteni. Ha folyton kudarcot vallasz, az nem a megfelelő pártaláló algoritmus, hanem a benned lévő készségek hiányoznak. Ebben pedig egy algoritmus nem tud segíteni.", // Your feedback for yes
            no: "Már a manuális, emberek által elrendezett szervezett házasságok is jobban teljesítenek hosszú távon, mint az emberek által választott “szerelemházasságok“.[[br]][[br]]A párosító algoritmus ráadásul biztosítja, hogy a közös érdeklődési körök és a preferált fizikai tulajdonságok jelen legyenek, mielőtt bemutatja neked a megfelelő partnert. Mivel a rendszer öntanuló, minél többen bízzák rá magukat az algoritmusra, annál megfelelőbb partnert fog választani neked. Az eHarmony társkereső weboldal például már olyan mesterséges intelligenciát tesztel, amely elemzi a csevegésed és javaslatokat küld a következő lépésre vonatkozóan. A Happn pedig mesterséges intelligenciát használ a profilok “rangsorolásához“, ami így személyre szabott partnert kínál nekünk.", // Your feedback for no
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
            yes: "Úgy tűnik, hogy téged is megtéveszt a függetlenség illúziója.[[br]][[br]]Gondolj csak bele, ha hirtelen a boltokba nem érkezik friss áru, vagy tönkremegy az elektromos hálózat, akkor mit csinálsz? A Covid-19-járvány ebből is adott egy kis ízelítőt: hirtelen újra divatossá vált kovászos kenyeret sütni, a balkonládák muskátli helyett paradicsompalántákkal teltek meg és gomba módjára kezdtek el szaporodni a közösségi kertek a városokban. Amíg egy város a jólétet biztosítja és megteremti azt a környezetet, amelyben a Maslow-piramis alsó két szintjének szükségleteit könnyedén ki tudod elégíteni, addig ez egy sérülékeny létállapotot is jelent. Ez a függetlenség illúziója, amely rámutat arra, hogy hiába van több lehetőséged a városban, mégis sokkal kiszolgáltatottabb, mint a vidéken élő embereknek, akiknek megvannak a maguk túlélési stratégiái az ilyen helyzetekre.", // Your feedback for yes
            no: "Hiába forr sokakban a kurucvér, ebben nagyot tévednek.[[br]][[br]]Jelentős különbség a vidéki és városi életmód között az, hogy a városi életmód társul egy intézményi, szolgáltatási bőséggel is. Minden este van színházi előadás, találunk magunknak vegán éttermet és többféle kávézót, és minden vallásnak van temploma. Minél több ember él egy helyen, annál nagyobb szükség van a hatékonyan működő út, víz és elektromos hálózatra, jobb egészségügyre, oktatásra, szórakozásra. Ráadásul mindezek a szolgáltatások gyorsan és könnyen elérhetőek, nem kell értük sokat utazni. A városban élők egészségesebbek hiszen könnyebben jutnak el orvoshoz, sőt szakorvosi vizsgálatokra; a városban jobbak az iskolák, hiszen nagyobb közöttük a verseny, és ezáltal nő az oktatás színvonala is; valamint jobbak a szociális ellátások is.", // Your feedback for no
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
            yes: "Gratulálok az emberi faj elpusztításához. Most legalizáltad a kokaint.[[br]][[br]]Az agyfokozó (neuroenhancement) drogok olyan anyagok, amelyek az agyműködést befolyásolják és céljuk a memória, a koncentráció, vagy az emberi teljesítmény javítása. Amint egy országban bevezeted őket, versenyhelyzet alakul ki, ami miatt minden más ország is igyekszik átalakítani népességét. Céllá válhat például a hosszú távú társadalmi stabilitás biztosítása olyan emberi jellegek fokozásával, mint az engedelmesség, a behódolás, a konformitás, a kockázatkerülés vagy a gyávaság. Jól hangzik, ugye?  Ennek az öngyilkos ideológiának a neve transzhumanizmus, ami az emberi faj “maghaladását” tűzte ki célul. Az embereknek van egy autentikus magjuk, amitől így drogokkal eltérítjük őket. Nem véletlenül nem ismerünk magunkra egy ittas éjszaka után. Azok nem is mi voltunk, hanem kémiai anyagok, amik alakították a viselkedésünket.", // Your feedback for yes
            no: "Gratulálok, üdv a vesztesek országában…[[br]][[br]]A mai társadalmak jellemzően legalizálják a nyugtató szereket, de tűzzel vassal üldözik az emberek kreativitását és magabiztosságát növelő szereket. Érdekes belegondolni nem? A xanax függő lakosság valamiért kívánatosabb, mint a kokainfüggő. Vannak azonban, akik mindenféle személyiség módosítást, fokozást elleneznek. Emögött részben az a tudománytalan elgondolás van, hogy az emberek valamilyen eredeti személyiséggel születnek, amitől eltérítenek a kémiai szerek. Pedig a személyiséged nem más, mint azoknak a döntésekneknek a sorozata, amiket meghozol. Fogadjunk, egy ittas este után azt mondod, nem is “én voltam”. Pedig, az te voltál. És ha unod, hogy megbénít a szorongás, miért ne alakítsd át magad szerek által. Ráadásul, ha egy közösség bevezeti a magabiztosság pirulát, onnantól ki teheti meg a mai nemzetközi versenyben, hogy a környék legszorongóbb népeséggel rendelkezzen. Csak egy igazi vesztes ország.", // Your feedback for no
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
            yes: "Ha szeretsz veszélyesen élni, és nem zavar, hogy az összes banki és személyes adatod veszélybe kerül, akkor érthető a választásod.[[br]][[br]]Az ingyenes wifi infrastruktúrájának kiépítése és fenntartása drága mulatság. Mindemellett olyan, mint egy nyílt seb a digitális társadalom testén. Hatalmas biztonsági kockázatot jelent, hiszen az ingyenes wifi-hálózatokat könnyebben kihasználhatják kiberbűnözők és hackerek, ami a felhasználók személyes adatainak veszélyeztetéséhez, sőt a települési infrastruktúra megbénításához is vezethet. Emellett számos egyéni kockázatot is hordoz magában, és különösen veszélyes azokra a társadalmi rétegekre nézve, amelyekben az internetes edukáció alacsony szintű vagy nem is létezik. Sokan, például az idősek közül könnyen lehetnek az egyre kifinomultabb internetes csalások áldozatai is. ", // Your feedback for yes
            no: "Az internet, ahol minden történik, és ahol minden tudás elérhető ezek szerint csak a kiváltságosoknak jár? Na szép![[br]][[br]]Az ingyenes wifi lehetőséget biztosít a lakosság széles rétegeinek, ideértve a rászorulókat is, hogy könnyebben hozzáférjenek az internethez és ezáltal a nyilvánossághoz. Ez segíti a digitális szakadék csökkentését, az információhoz és tanuláshoz való egyenlőbb hozzáférést. Ráadásul vonzóvá teheti közterületeket az adott település lakói és a turisták számára egyaránt. Az idegenforgalom fellendülése, a turisták elégedettsége és a helyi vállalkozások virágzása révén az önkormányzatoknak nagyobb adóbevételeket és ezáltal jobb közszolgáltatásokat jelenthet. Ezeken túl pedig lehetőséget nyújt az embereknek, hogy könnyen kapcsolatban maradjanak családtagjaikkal, barátaikkal, üzleti partnereikkel. A közösségek ezáltal nyitottabbá válhatnak, amely megerősíti a társadalmi szervezeteket és segíti a közösségi kikapcsolódást.", // Your feedback for no
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

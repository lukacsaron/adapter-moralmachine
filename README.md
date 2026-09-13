# Morális Iránytű / Moral Compass

A touchscreen kiosk that asks you ten uncomfortable questions about technology and society, then argues back whichever way you answer.

Built for [Adaptér](https://adapterujbuda.hu/) and [Szájensz Szeánsz](https://www.youtube.com/@szajenszszeansz), the Hungarian science-communication project. It ran at Bartók Feszt and at Adaptér's own events.

## The idea

Every question takes a yes or no. Whatever you pick, the machine pushes back with a written argument for the position you did not take.

> **Can artificial intelligence find us a partner?**
>
> *Yes* → "A fairly shallow thought, that love only requires finding goods with the right portfolio on the relationship market..."
>
> *No* → "Even manually arranged marriages perform better long-term than love matches. The matching algorithm also guarantees shared interests are present before it introduces you..."

The point is not to score you. The point is that you stand in front of a screen in a public space, commit to an answer, and then read a serious case against it. The intro warns you that some responses are deliberately provocative.

Ten questions in Hungarian, eleven in English. Topics include AI matchmaking, city versus rural living, cognitive-enhancement drugs, and public wifi.

At the end it offers the Adaptér newsletter and points you at *Kódolt dilemmák* (Coded Dilemmas), the printed companion publication visitors could take home, or at the volunteers standing next to the kiosk.

## How it runs

Express serves a static PWA. Answers go to MongoDB against a per-visit UUID, and a separate collection keeps a running yes/no tally per question so the team can read the room afterwards.

```
GET  /new-session          issue a session UUID
GET  /questions/:id        question text and choices
POST /answers              record one answer
GET  /answers/:sessionID   replay a visit
```

The kiosk build uses [simple-keyboard](https://virtual-keyboard.js.org/) for the on-screen keyboard, since the machine had no hardware one. A service worker makes it survive a flaky venue network. Desktop visitors can answer with the arrow keys.

Question text lives in `questionsData.json` and `questionsData_HU.json`. `[[br]]` inside a feedback string becomes a paragraph break at render time.

## Run it

```bash
npm install
echo "MONGO_DB_CONNECTION_STRING=mongodb://localhost:27017/moralmachine" > .env
node app.js
# http://localhost:3000
```

Hungarian version at `/index_hu.html`, English at `/index.html`.

Docker and Coolify instructions are in [DEPLOYMENT.md](DEPLOYMENT.md).

## Branches

The code is on **`master`**. The `main` branch holds a `.gitignore` and nothing else.

## Files

```
app.js                    Express server, Mongoose schemas, answer tallies
questionsData.json        English questions and both feedback texts
questionsData_HU.json     Hungarian questions
data.json                 a snapshot of aggregate yes/no counts
public/                   PWA shell, service worker, styles, artwork
```

## License

ISC for the code. Question and feedback text was written with Szájensz Szeánsz and belongs to them and Adaptér.

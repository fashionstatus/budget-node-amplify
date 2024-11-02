"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const router = express.Router();
router.get('/exercises', (req, res) => {
    /* Exercise.find()
        .then((exercise: any) => res.json(exercise))
        .catch((err: string) => res.status(400).json('Error: '+err));*/
});
router.post('/exercises/add', (req, res) => {
    const username = req.body.username;
    const description = req.body.description;
    const duration = Number(req.body.duration);
    const date = Date.parse(req.body.date);
    // new Exercise({username, description, duration, date})
    const newExercise = { username, description, duration, date };
    newExercise.save()
        .then(() => res.json('Exercise added !'))
        .catch((err) => res.status(400).json('Error: ' + err));
});
exports.default = router;

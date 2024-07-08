const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  console.log(`WEBSERV - ${req.query}`);
});

router.get('/:id', async (req, res) => {
  console.log(`WEBSERV - ${req.body}`);
});

router.post('/', async (req, res) => {
  console.log(`WEBSERV - ${req.body}`);
});

router.put('/:id', async (req, res) => {
  console.log(`WEBSERV - ${req.body}`);
});

router.delete('/:id', async (req, res) => {
  console.log(`WEBSERV - ${req.body}`);
});

module.exports = router;
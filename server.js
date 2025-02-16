const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/buscar-informacoes', async (req, res) => {
    const codigo = req.query.codigo;
    const url = `https://www.saojoaofarmacias.com.br/${codigo}`;

    try {
        const response = await fetch(url);
        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const resultado1 = doc.querySelector('.sjdigital-custom-apps-5-x-currencyInteger').textContent.trim();
        const resultado2 = doc.querySelector('.sjdigital-custom-apps-5-x-currencyFraction').textContent.trim();

        res.json({ resultado1, resultado2 });
    } catch (error) {
        console.error('Erro ao buscar as informações:', error);
        res.status(500).send('Erro ao buscar informações');
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

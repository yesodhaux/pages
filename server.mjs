import express from 'express';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import https from 'https';
import fs from 'fs';

const app = express();

// Middleware para adicionar cabeçalhos CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/buscar-informacoes', async (req, res) => {
    const codigo = req.query.codigo;
    const url = `https://www.saojoaofarmacias.com.br/${codigo}`;

    try {
        const response = await fetch(url);
        const htmlText = await response.text();
        const dom = new JSDOM(htmlText);
        const doc = dom.window.document;
        
        // Captura o conteúdo da div com a classe 'sjdigital-custom-apps-5-x-shelfPricesContainer'
        const shelfPricesContainer = doc.querySelector('.sjdigital-custom-apps-5-x-shelfPricesContainer');
        
        if (shelfPricesContainer) {
            // Captura todos os elementos de texto dentro da div
            const textos = Array.from(shelfPricesContainer.querySelectorAll('*'))
                .map(element => element.textContent.trim())
                .filter(text => text.length > 0); // Filtra textos vazios

            // Remove duplicatas
            const textosUnicos = [...new Set(textos)];

            // Regex para capturar preços com R$ seguidos de números e ponto ou vírgula como separador decimal
            const regexPreco = /R\$\s?\d{1,3}([.,]\d{2})?/g;

            const textosPrecios = [];

            // Iterar e capturar todos os preços que batem com o padrão
            textosUnicos.forEach(texto => {
                const matches = texto.match(regexPreco);
                if (matches) {
                    matches.forEach(preco => {
                        if (!textosPrecios.includes(preco)) {
                            textosPrecios.push(preco);
                        }
                    });
                }
            });

            // Retorna os preços encontrados
            res.json({ textosPrecios });
        } else {
            res.status(404).send('Elemento não encontrado');
        }
    } catch (error) {
        console.error('Erro ao buscar as informações:', error);
        res.status(500).send('Erro ao buscar informações');
    }
});

// Carregar certificados SSL
const options = {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem')
};

// Iniciar servidor HTTP
app.listen(1880, () => {
    console.log('Servidor HTTP rodando na porta 1880');
});

// Iniciar servidor HTTPS
https.createServer(options, app).listen(1881, () => {
    console.log('Servidor HTTPS rodando na porta 1881');
});

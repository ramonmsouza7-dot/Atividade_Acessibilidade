const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middlewares para permitir requisições e interpretar JSON
app.use(cors()); // Permite que o Live Server converse com esta API
app.use(express.json());
app.use(express.static(__dirname)); // Serve os arquivos index.html, style.css e script.js

// 1. Criação e Conexão com o arquivo do Banco de Dados SQLite
const db = new sqlite3.Database('./acessibilidade.db', (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao SQLite:', err.message);
  } else {
    console.log('✅ Banco de dados SQLite criado/conectado com sucesso (acessibilidade.db).');
  }
});

// 2. Criação da Tabela no Banco de Dados (se ainda não existir)
db.run(`
  CREATE TABLE IF NOT EXISTS contatos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    perfil TEXT NOT NULL,
    recurso_favorito TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 3. Rota GET: Buscar todos os registros do banco
app.get('/api/contatos', (req, res) => {
  const sql = 'SELECT * FROM contatos ORDER BY id DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ sucesso: false, erro: err.message });
    }
    res.json({ sucesso: true, dados: rows });
  });
});

// 4. Rota POST: Inserir um novo cadastro no banco
app.post('/api/contatos', (req, res) => {
  const { nome, email, perfil, recurso_favorito, mensagem } = req.body;

  if (!nome || !email || !perfil || !recurso_favorito || !mensagem) {
    return res.status(400).json({ sucesso: false, erro: 'Preencha todos os campos.' });
  }

  const sql = `INSERT INTO contatos (nome, email, perfil, recurso_favorito, mensagem) VALUES (?, ?, ?, ?, ?)`;
  const params = [nome, email, perfil, recurso_favorito, mensagem];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ sucesso: false, erro: err.message });
    }
    res.status(201).json({ sucesso: true, id: this.lastID });
  });
});

// Inicialização do Servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🌐 Host disponível em http://0.0.0.0:${PORT}`);
});
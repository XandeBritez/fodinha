# 📦 Enviar Projeto para o GitHub

## 🎯 Passo a Passo

### 1️⃣ Inicializar Git (se ainda não foi feito)

```bash
git init
```

### 2️⃣ Adicionar todos os arquivos

```bash
git add .
```

### 3️⃣ Fazer o primeiro commit

```bash
git commit -m "Initial commit - Jogo Fodinha completo"
```

### 4️⃣ Conectar com o repositório do GitHub

Substitua `SEU-USUARIO` e `SEU-REPOSITORIO` pelos seus dados:

```bash
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
```

**Exemplo:**
```bash
git remote add origin https://github.com/joao/fodinha-game.git
```

### 5️⃣ Verificar se conectou

```bash
git remote -v
```

Deve mostrar:
```
origin  https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git (fetch)
origin  https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git (push)
```

### 6️⃣ Enviar para o GitHub

```bash
git branch -M main
git push -u origin main
```

Se pedir usuário e senha:
- **Usuário:** seu username do GitHub
- **Senha:** use um **Personal Access Token** (não a senha normal)

---

## 🔑 Criar Personal Access Token (se necessário)

1. GitHub → Settings (seu perfil)
2. Developer settings → Personal access tokens → Tokens (classic)
3. Generate new token (classic)
4. Marque: `repo` (acesso completo)
5. Generate token
6. **COPIE O TOKEN!** (não vai aparecer de novo)
7. Use o token como senha no git push

---

## ✅ Pronto!

Seu código está no GitHub! 🎉

Acesse: `https://github.com/SEU-USUARIO/SEU-REPOSITORIO`

---

## 🔄 Atualizações Futuras

Quando fizer mudanças:

```bash
git add .
git commit -m "Descrição da mudança"
git push
```

---

## 🆘 Problemas Comuns

### "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
```

### "Authentication failed"
- Use Personal Access Token em vez da senha
- Ou configure SSH keys

### "Updates were rejected"
```bash
git pull origin main --rebase
git push
```

---

## 💡 Dica: Usar SSH (Opcional)

Mais fácil que token:

1. Gerar chave SSH:
```bash
ssh-keygen -t ed25519 -C "seu-email@example.com"
```

2. Copiar chave pública:
```bash
cat ~/.ssh/id_ed25519.pub
```

3. GitHub → Settings → SSH and GPG keys → New SSH key
4. Cole a chave

5. Mudar remote para SSH:
```bash
git remote set-url origin git@github.com:SEU-USUARIO/SEU-REPOSITORIO.git
```

Agora não precisa mais de senha! 🎉

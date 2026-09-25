import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

const corsOptions = {
    origin: '*',
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// ROTA: Cadastro de usuário (E-mail e Senha)
app.post('/api/register', async (req, res) => {
    const { name, email, password, birthdate } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { 
                name, 
                email, 
                password: hashedPassword, 
                birthdate,
                isAdmin: email === "admin@gympro.com" 
            }
        });
        res.json({ id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin });
    } catch (error) {
        res.status(400).json({ error: "E-mail já cadastrado" });
    }
});

// ROTA: Login com e-mail e senha
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Senha incorreta" });

    res.json({ id: user.id, name: user.name, email: user.email, picture: user.picture, phone: user.phone, isAdmin: user.isAdmin });
});

// ROTA: Login com Google (salva sem senha)
app.post('/api/google-login', async (req, res) => {
    const { name, email, picture } = req.body;
    const user = await prisma.user.upsert({
        where: { email },
        update: { name, picture },
        create: { name, email, picture, password: "google_oauth" }
    });
    res.json({ id: user.id, name: user.name, email: user.email, picture: user.picture, phone: user.phone, isAdmin: user.isAdmin });
});

// ROTA: Listar todos os clientes (para o Admin)
app.get('/api/users', async (req, res) => {
    const users = await prisma.user.findMany({ 
        select: { id: true, name: true, email: true, picture: true, phone: true, isAdmin: true, createdAt: true } 
    });
    res.json(users);
});

// ROTA: Atualizar Perfil (Nome, Telefone, Foto)
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, picture, phone } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { name, picture, phone }
        });
        res.json({ 
            id: updatedUser.id, 
            name: updatedUser.name, 
            email: updatedUser.email, 
            picture: updatedUser.picture, 
            phone: updatedUser.phone, 
            isAdmin: updatedUser.isAdmin 
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar perfil" });
    }
});

// ROTA: Salvar Treino
app.post('/api/workouts', async (req, res) => {
    const { name, desc, exercises, userId } = req.body;
    try {
        const workout = await prisma.workout.create({
            data: { name, desc, exercises: JSON.stringify(exercises), userId }
        });
        res.json(workout);
    } catch (error) {
        res.status(500).json({ error: "Erro ao salvar treino" });
    }
});

// ROTA: Pegar Treinos de um usuário
app.get('/api/workouts/:userId', async (req, res) => {
    const workouts = await prisma.workout.findMany({ where: { userId: req.params.userId } });
    res.json(workouts.map(w => ({ ...w, exercises: JSON.parse(w.exercises) })));
});

// ROTA: Salvar Histórico
app.post('/api/history', async (req, res) => {
    const { userId, workoutId, volume, sets } = req.body;
    try {
        const session = await prisma.workoutSession.create({
            data: { userId, workoutId, volume, sets: JSON.stringify(sets) }
        });
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: "Erro ao salvar histórico" });
    }
});

// ROTA: Pegar Histórico de um usuário
app.get('/api/history/:userId', async (req, res) => {
    const sessions = await prisma.workoutSession.findMany({ where: { userId: req.params.userId } });
    res.json(sessions.map(s => ({ ...s, sets: JSON.parse(s.sets) })));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Backend do GymPro rodando na porta ${PORT}`);
});
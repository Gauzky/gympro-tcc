import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ROTA: Salvar usuário (quando loga com Google)
app.post('/api/users', async (req, res) => {
    const { name, email, picture } = req.body;
    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: { name, picture },
            create: { name, email, picture }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Erro ao salvar usuário" });
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

// ROTA: Salvar Histórico (Treino Concluído)
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
// ROTA: Listar todos os clientes (para o Admin)
app.get('/api/users', async (req, res) => {
    const users = await prisma.user.findMany({ 
        select: { id: true, name: true, email: true, picture: true, phone: true, isAdmin: true, createdAt: true } 
    });
    res.json(users);
});

app.listen(3000, '0.0.0.0', () => {
    console.log('🚀 Backend GymPro rodando em http://localhost:3000');
});
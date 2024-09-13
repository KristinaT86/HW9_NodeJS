import express from 'express';
import bcrypt from 'bcrypt';
const app = express();

// Middleware для работы с JSON из тела
app.use(express.json());

// Middleware для симуляции, что пользователь залогинен
app.use((req, res, next) => {
  req.user = { id: 1 };  // Имитируем залогиненного пользователя с id = 1
  next();
});

// Пример простого "хранилища" пользователей (вместо настоящей базы данных)
const users = []; // push()

// Получить пользователя по ID  NB slug
app.get('/profile/:id', (req, res) => {
  // Парсинг до int
  const userId = parseInt(req.params.id, 10)

  if (req.user.id !== userId) {
      return res.status(403).send('Доступ запрещен')
  }

  const user = users.find((user) => user.id === userId); // метод поиска

  if (!user) {
      return res.status(404).send('Пользователь не найден')
  }

  res.status(200).json({
      userName: user.username,
      email: user.email,
      name: user.name,
  })
})

// Получить доступ на изменение пользователя
app.put('/profile/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10)

  if (req.user.id !== userId) {
      return res.status(403).send('Доступ запрещен')
  }

  const user = users.find((user) => user.id === userId);

  if (!user) {
      return res.status(404).send('Пользователь не найден')
  }
  // Nullable - false = 0, 0 = 0, null = 0, undef = 0, 
  // [], {} != 0
  // if (req.body) { // error
  //     return res.status(400).send('Нет данных')
  // }

  const { email, name } = req.body;

  if (email) {
      user.email = email
  }

  if (name) {
      user.name = name
  }

  res.send('Профиль обновлен');
})

// Sign up / Registration
app.post('/register', async (req, res) => {
  try {
      const { username, password, id, email, name } = req.body;

      const saltRounds = 10;
      const hashPassword = await bcrypt.hash(password, saltRounds)

      users.push({ username, password: hashPassword, id, email, name });

      res.status(201).send('Пользователь был зарегистрирован')
      console.log(users)
  } catch (error) {
      res.status(500).send('Ошибки при регистрации пользователя')
  }
});

// Sign in / Log in
app.post('/login', async (req, res) => {
  try {
      const { username, password } = req.body;
      const user = users.find((user) => user.username === username)
      console.log(user)
      if (!user) {
          return res.status(400).send('Пользователь не найден')
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
          return res.status(400).send('Пароль не правильный')
      }
      res.status(200).send('Успешный вход');
  } catch (err) {

  }
})

app.listen(3000, () => {
  console.log('Сервер запущен на порту http://localhost:3000');
});

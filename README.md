# Word Snake 🐍

A fun and interactive Chinese vocabulary learning game built with React, Vite, and Tailwind CSS. Control a snake to eat the correct Chinese character that matches the English word displayed at the top.

## 🎮 Features

- **Interactive Learning**: Match English words with Chinese characters
- **Multiple Difficulty Levels**: Easy, Medium, and Hard modes
- **Lives System**: 3 lives per game
- **Streak Bonuses**: Earn extra points for consecutive correct answers
- **Responsive Design**: Works on desktop and mobile devices
- **Cheat Sheet**: Built-in vocabulary reference with search and filter
- **Word Tracking**: See which words you've learned
- **High Score**: Persistent high score tracking
- **GitHub Pages Ready**: Auto-deploys to GitHub Pages

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages when you push to the `main` branch.

#### Setup Steps:

1. **Create a new GitHub repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under "Build and deployment", select **Source: GitHub Actions**

3. **Push your code**
   - The GitHub Actions workflow will automatically build and deploy your site
   - Your site will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

#### Manual Deployment

To trigger a manual deployment:
- Go to the **Actions** tab in your repository
- Select the "Deploy to GitHub Pages" workflow
- Click "Run workflow"

## 🎯 How to Play

1. **Start the game**: Press Space or click "Start Game"
2. **Read the target word**: The English word appears at the top
3. **Find the match**: Look for the Chinese character that matches
4. **Control the snake**: Use arrow keys, WASD, or swipe on mobile
5. **Eat the correct apple**: Navigate the snake to the matching character
6. **Avoid wrong answers**: Eating the wrong character costs a life
7. **Build streaks**: Get 3+ correct in a row for bonus points

## 🎮 Controls

### Desktop
- **Arrow Keys** or **WASD**: Move the snake
- **Space**: Start game / Pause / Resume
- **Escape**: Pause game

### Mobile
- **Swipe**: Change direction
- **D-pad buttons**: On-screen controls
- **📖 button**: Open cheat sheet

## 📚 Vocabulary

The game includes 70+ Chinese words across categories:
- Animals (猫, 狗, 鱼, etc.)
- Food & Drink (水, 米, 茶, etc.)
- Nature (日, 月, 星, etc.)
- People & Body (人, 手, 眼, etc.)
- Numbers & Time (一, 二, 三, etc.)
- Places & Things (山, 河, 海, etc.)
- Colors (红, 蓝, 绿, etc.)
- Actions & Qualities (爱, 大, 小, etc.)

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **GitHub Actions** - CI/CD and deployment

## 📝 License

MIT License - feel free to use this project for learning or build upon it!

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Add more vocabulary words
- Improve the UI/UX
- Add new game features
- Fix bugs

## 🎓 Learning Tips

- Use the cheat sheet to review words before playing
- Start with Easy mode to build confidence
- Focus on the pinyin pronunciation
- Try to learn a few words each session
- Review the "Learned" filter to track progress

---

**Happy Learning! 🐍📚**

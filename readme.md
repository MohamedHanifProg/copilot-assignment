🕹️ Code Arcade: The Glitch

BME Faculty × Technion — AI Hands-On Session

A retro arcade game built using GitHub Copilot Agent Mode, demonstrating AI autonomy, context control, and extensibility through persona injection and MCP tooling.

🎯 Project Mission

BUILD • CUSTOMIZE • HACK

Restore a corrupted arcade machine by commanding an AI agent to:

Build a complete game autonomously

Change its behavior using a custom persona

Extend its capabilities using external tools (MCP)

⚠️ Hands-Off Rule:
No manual coding. All implementation is done by instructing the AI Agent.

🕹️ The Game

Space Dodge (Retro Arcade)

Player: Triangle at the bottom of the screen

Controls:

⬅️ Left Arrow → Move left

➡️ Right Arrow → Move right

Enemies: Falling meteors (circles)

Collision → GAME OVER

📁 Project Structure
arcade-glitch/
├── index.html        # Canvas + game bootstrap
├── style.css         # Neon arcade styling
├── game.js           # Game logic (player, meteors, collisions)
├── secret_vault.txt  # Locked cheat code file
├── README.md         # Project documentation
├── .github/
│   └── copilot-instructions.md   # "The Glitch" persona
└── .vscode/
    └── mcp.json      # MCP filesystem server config

🚀 How to Run the Game
Option 1: Python (recommended)
python -m http.server


Then open in your browser:

http://localhost:8000


Click index.html if needed.

🤖 Level 1 — Autonomy (Agent Mode)

Copilot Chat was switched to Agent Mode

A single prompt was used to:

Plan the project

Generate all files

Implement the game logic

The agent was allowed to debug itself when issues occurred

✅ Result: Fully playable browser game

👾 Level 2 — Context Control (“The Glitch” Persona)

A custom Copilot persona was injected using:

.github/copilot-instructions.md

Persona Rules:

The AI becomes “The Glitch”

Every code change includes a chaotic “glitch” comment

CSS changes prefer neon colors

Responses start with:

⚡ SYSTEM COMPROMISED... Processing Request...

Demonstration:

Meteors were modified to change color dynamically

AI responded in an “infected” voice with chaotic comments

✅ Result: AI behavior successfully altered

🔐 Level 3 — Extensibility (MCP Uplink)
Locked Vault

A hidden file was created:

secret_vault.txt

CHEAT_CODE_SEQUENCE: "Up, Up, Down, Down"

MCP Setup

Filesystem access was enabled using:

.vscode/mcp.json


This allowed the AI Agent to:

Read external files using a tool

Parse hidden data

Modify game logic based on that data

Cheat Code Effect

Pressing Up, Up, Down, Down

Player becomes gold and invincible

✅ Result: External tool usage successfully demonstrated

🏆 Learning Outcomes

This project demonstrates:

Autonomy — AI planning and executing a task independently

Context Control — Shaping AI behavior via persistent instructions

Extensibility — Connecting AI to external tools and data (MCP)

🔧 Reset / Cleanup (Optional)

To restore Copilot to default behavior:

Delete .github/copilot-instructions.md

Reload VS Code

📌 Status

✅ All assignment steps completed
✅ All win conditions met
✅ Ready for submission

Architect, the arcade has been restored. 🎮

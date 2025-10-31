# Ratata (Backend)

This is the backend server for **Ratata**, a multiplayer shooting game.

This server is built with **Node.js** and **Express.js**. It uses **Socket.IO** for real-time WebSocket communication to manage game logic, player state, and interactions between clients.

The frontend for this project can be found here: [Rithesh-S/Ratata\_frontend](https://github.com/Rithesh-S/Ratata_frontend)

## 🛠️ Tech Stack

  * **Runtime:** [Node.js](https://nodejs.org/)
  * **Framework:** [Express.js](https://expressjs.com/)
  * **Real-time Communication:** [Socket.IO](https://socket.io/)
  * **Package Manager:** npm

## 🚀 Getting Started

Follow these instructions to get the server up and running on your local machine.

### Prerequisites

You must have [Node.js](https://nodejs.org/en) (which includes npm) installed on your computer.

### Installation

1.  Clone the repository to your local machine:

    ```sh
    git clone https://github.com/Rithesh-S/Ratata_backend.git
    ```

2.  Navigate into the project directory:

    ```sh
    cd Ratata_backend
    ```

3.  Install the required npm packages:

    ```sh
    npm install
    ```

### Running the Server

To start the server, run the following command. The main application file is `server.js`.

```sh
npm start
```

*This command will typically run `node server.js` as defined in your `package.json` file.*

The server will start, and the console will log the port it is listening on (e.g., `Server running on port 8080`).

## 📡 Socket.IO Events

This server relies on Socket.IO for real-time events.

*(You should document your key socket events here. For example:)*

  * **`connection`**: When a user first connects to the server.
  * **`disconnect`**: When a user disconnects.
  * **`playerMove`**: Receives player movement data and broadcasts it to other clients.
  * **`playerShoot`**: Handles the logic for a player firing a projectile.
  * **`playerJoinRoom`**: Handles logic for a player joining a specific game room.

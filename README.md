# ShareMoney Backend

ShareMoney Backend is a Node.js application that provides API services for the ShareMoney frontend. It handles expense data storage, participant management, and bill-splitting calculations.

## Features

- **Persistent Storage**: Data is stored using MongoDB Atlas, ensuring users can access their expense records across sessions.
- **Secure API**: RESTful API for managing expenses and participants.
- **Lightweight Server**: Built with Express.js for fast and efficient request handling.

## Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-%23339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-%23000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%2347A248?style=for-the-badge&logo=mongodb&logoColor=white)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-%2361DAFB?style=for-the-badge&logo=mongodb&logoColor=white)

- **Backend**: Node.js with Express.js, connected to MongoDB Atlas for data persistence.
- **Database**: MongoDB Atlas, a cloud-hosted database service.
- **Deployment**: Hosted on Render.
  
## Deployment

comming soon...

## Installation

To run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/a03993/share-money-app-server.git
   ```
2. Navigate to the project directory:
   ```bash
   cd share-money-app-server
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   nodemon index
   ```

## Future Enhancements

- Backend deployment on Netlify
- Improved authentication mechanisms
- Expanded functionality for managing expenses

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue with your suggestions or bug reports.

---

Enjoy seamless bill splitting with ShareMoney!


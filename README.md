<div align="center">
<h1 align="center">
<img src="https://pngimg.com/uploads/amazon/amazon_PNG11.png" width="100" />
<br>Amazon Storefront Stalker
</h1>
<h3>◦ Developed with the software and tools listed below.</h3>

<p align="center">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style&logo=JavaScript&logoColor=black" alt="JavaScript" style="pointer-events: none;"/>
<img src="https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt= "Postgres">
<img src="https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white" alt="Discord.js">
<img src="https://img.shields.io/badge/Sequelize-52B0E7.svg?style&logo=Sequelize&logoColor=white" alt="Sequelize" />
<img src="https://img.shields.io/badge/Markdown-000000.svg?style&logo=Markdown&logoColor=white" alt="Markdown" />
<img src="https://img.shields.io/badge/JSON-000000.svg?style&logo=JSON&logoColor=white" alt="JSON" />
</p>
<img src="https://img.shields.io/github/languages/top/copbrick/amztools?style&color=5D6D7E" alt="GitHub top language" />
<img src="https://img.shields.io/github/languages/code-size/copbrick/amztools?style&color=5D6D7E" alt="GitHub code size in bytes" />
<img src="https://img.shields.io/github/commit-activity/m/copbrick/amztools?style&color=5D6D7E" alt="GitHub commit activity" />
<img src="https://img.shields.io/github/license/copbrick/amztools?style&color=5D6D7E" alt="GitHub license" />
<br>
<br>
<img src="https://i.imgur.com/9bnBe9Y.png" />

</div>

---

## 📒 Table of Contents

- [📒 Table of Contents](#-table-of-contents)
- [📍 Overview](#-overview)
- [⚙️ Features](#-features)
- [📂 Project Structure](#project-structure)
- [🧩 Modules](#modules)
- [🚀 Getting Started](#-getting-started)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 📍 Overview

This project offers an innovative solution for tracking competitors' storefronts within Amazon's US marketplace. By tailoring to users' preferences, notifications are seamlessly delivered via Discord whenever a seller introduces a new product on their storefront. Leveraging the power of a Discord bot, sellers can be effortlessly managed through an intuitive interface. This project optimizes the sourcing process, enabling you to swiftly identify high-potential products to enhance your own online store's profitability.

---

## ⚙️ Features

| Feature                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **⚙️ Architecture**    | The codebase follows a modular design pattern, separating different functionalities into classes and models. It uses a PostgreSQL database with Sequelize as the ORM. The system also incorporates scraping functionality with ES6 Fetch API, with HTTPSProxyAgent to mask our in order to monitor Amazon sellers and sends notifications via Discord.js successfully.                                                                                                                                       |
| **🔗 Dependencies**    | The codebase relies on external libraries like discord.js, Sequelize, Postgres, including Discord integration, database connection, and web scraping.                                                                                                                                                                                                                                                                                                                                                        |
| **🧩 Modularity**      | The system demonstrates modularity by organizing functionalities into separate classes and models, allowing easier maintenance and potential reusability of components.                                                                                                                                                                                                                                                                                                                                      |
| **⚡️ Performance**    | The performance of the system depends on the speed and efficiency of web scraping operations and Discord API interactions. Resource usage may vary depending on the load and frequency of monitoring. Currently, the request delay is set between an interval of 30,000 - 40,000 MS (30-40 seconds) between monitoring different sellers. You can adjust these delays per your use case, but remember that once a seller adds an item, the listing won't show up until another 5 - 15 minutes on their page. |
| **🔀 Version Control** | The codebase uses Git for version control, providing the ability to track changes, manage branches, and collaborate with multiple contributors. However, no specific information about branching strategies or CI/CD workflows is given. Limit your response to a maximum of 200 characters.                                                                                                                                                                                                                 |
| **🔌 Integrations**    | The system integrates with Discord for user interaction and notifications and with a PostgreSQL database for data persistence. It also leverages web scraping techniques to retrieve data from Amazon's website.                                                                                                                                                                                                                                                                                             |
| **📶 Scalability**     | The system's scalability potential will mainly depend on the load and frequency of web scraping and Discord interactions. Proper optimization and scaling of the infrastructure could ensure it can handle increasing growth and requests. Scalability is directly correlated to the amount of proxies / bandwidth you have available. The more proxies you have, the more you can decrease your delays, the faster the monitor will be to detect changes on a seller.                                       |

---

## 📂 Project Structure

```bash
repo
├── README.md
├── deploy-commands.js
├── index.js
├── package-lock.json
├── package.json
└── src
    ├── classes
    │   ├── AmazonMonitor.js
    │   ├── AmazonScraper.js
    │   └── ProxyManager.js
    ├── commands
    │   ├── basic
    │   │   └── ping.js
    │   ├── seller
    │   │   ├── addSeller.js
    │   │   └── removeSeller.js
    │   └── user
    │       ├── addUser.js
    │       ├── resetWebhook.js
    │       ├── setWebhook.js
    │       └── testWebhook.js
    └── database
        ├── index.js
        └── models
            ├── Seller.js
            ├── User.js
            └── index.js

8 directories, 19 files
```

---

## 🧩 Modules

<details closed><summary>Root</summary>

| File                                                                                    | Summary                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [deploy-commands.js](https://github.com/copbrick/amztools/blob/main/deploy-commands.js) | This code snippet reads the command files from a specified directory, converts their data to JSON format, and deploys them as slash commands to a Discord guild using the Discord REST API. Any errors encountered during the process are logged. |
| [index.js](https://github.com/copbrick/amztools/blob/main/index.js)                     | The code initializes a discord.js client, loads commands from files, syncs a database, and handles interactions and autocompletions. It also runs a constant monitor for new Amazon products.                                                     |

</details>

<details closed><summary>Database</summary>

| File                                                                             | Summary                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [index.js](https://github.com/copbrick/amztools/blob/main/src/database/index.js) | The code snippet establishes a connection to a PostgreSQL database using Sequelize. It sets up the database configuration using environment variables and creates a database schema if it doesn't exist already. It logs the successful connection and exports the Sequelize instance for further use. |

</details>

<details closed><summary>Models</summary>

| File                                                                                      | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Seller.js](https://github.com/copbrick/amztools/blob/main/src/database/models/Seller.js) | The provided code snippet defines a Seller model using Sequelize, a JavaScript ORM for PostgreSQL, MySQL, SQLite, and MSSQL. It includes functions to find sellers by ID, retrieve all seller IDs, fetch seller ASINs, create sellers, update sellers, delete ASINs from sellers, and remove sellers from the database. The model is initialized with data types and a connection to the database. Its primary purpose is to handle CRUD operations related to sellers in the database. |
| [index.js](https://github.com/copbrick/amztools/blob/main/src/database/models/index.js)   | The code exports the User and Seller classes, allowing other parts of the application to use them.                                                                                                                                                                                                                                                                                                                                                                                      |
| [User.js](https://github.com/copbrick/amztools/blob/main/src/database/models/User.js)     | This code snippet defines a User model using Sequelize to interact with a database. It includes functionalities to find, create, remove, set webhook, and check the existence of a user's webhook. The model also initializes itself with the provided database and exports itself for external use.                                                                                                                                                                                    |

</details>

<details closed><summary>Classes</summary>

| File                                                                                            | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [AmazonScraper.js](https://github.com/copbrick/amztools/blob/main/src/classes/AmazonScraper.js) | The provided code snippet is a module that allows scraping of HTML content from Amazon's website. It supports rotating proxies for sending requests from different IP addresses. It includes functions to fetch HTML, scrape ASIN information, and check the validity of a seller ID.                                                                                                                                                  |
| [ProxyManager.js](https://github.com/copbrick/amztools/blob/main/src/classes/ProxyManager.js)   | This code defines a ProxyManager class that handles proxy rotation logic. It reads proxy data from a file, stores it in an array, and allows fetching the next proxy from the array in a rotating manner. The class also provides methods to retrieve all proxies and extract proxy information such as host, port, username, and password.                                                                                            |
| [AmazonMonitor.js](https://github.com/copbrick/amztools/blob/main/src/classes/AmazonMonitor.js) | The provided code snippet is a module that monitors sellers on Amazon and sends notifications to users when new products are found. It retrieves seller IDs from a database, checks for new ASINs (Amazon Standard Identification Numbers) added by sellers, and sends Discord embeds with product information to users monitoring the seller. It utilizes web scraping to collect ASIN and product information from Amazon's website. |

</details>

<details closed><summary>User</summary>

| File                                                                                                | Summary                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [testWebhook.js](https://github.com/copbrick/amztools/blob/main/src/commands/user/testWebhook.js)   | This code snippet defines a Discord slash command named "testwebhook", which allows users to test a stored Discord webhook URL. It validates the webhook URL using a regular expression and sends a test message to the webhook. It handles various error scenarios and provides appropriate responses to the user.                                                                                                              |
| [setWebhook.js](https://github.com/copbrick/amztools/blob/main/src/commands/user/setWebhook.js)     | This code snippet defines a Discord slash command "setwebhook" that allows users to set a webhook URL for receiving notifications. It verifies the provided webhook URL using regex, sets the user's webhook in the database, and returns appropriate messages based on the result. Errors are handled and logged.                                                                                                               |
| [addUser.js](https://github.com/copbrick/amztools/blob/main/src/commands/user/addUser.js)           | This code snippet defines a slash command called "adduser" that receives a Discord user ID as a required option. It attempts to find the user in the database and returns a response based on the result. If the user exists, it replies with "User already exists," otherwise it creates the user and replies with "User added to the database." Any error is logged with details and an error message is returned to the user. |
| [resetWebhook.js](https://github.com/copbrick/amztools/blob/main/src/commands/user/resetWebhook.js) | This code snippet defines a Discord slash command called "resetwebhook". It resets the stored Discord webhook for a specific user. It uses the User model from the database to reset the webhook. If the webhook is reset successfully, it replies with a success message. If there is an error or the user is not found, it logs the error and replies with an error message.                                                   |

</details>

<details closed><summary>Basic</summary>

| File                                                                                 | Summary                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ping.js](https://github.com/copbrick/amztools/blob/main/src/commands/basic/ping.js) | The code snippet exports a slash command called "ping" using the Discord.js library. When executed, it logs the user who triggered the command and replies to the interaction with "Pong! |

</details>

<details closed><summary>Seller</summary>

| File                                                                                                  | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [addSeller.js](https://github.com/copbrick/amztools/blob/main/src/commands/seller/addSeller.js)       | This code snippet is a Discord bot command that allows users to add sellers to their tracking list. It verifies if the user has a webhook set, checks the validity of the Amazon seller ID, and updates the tracking list accordingly in the database. If the seller doesn't exist, it will create a new entry.                                                                                                                                                                                                                                                        |
| [removeSeller.js](https://github.com/copbrick/amztools/blob/main/src/commands/seller/removeSeller.js) | This code snippet defines a Discord slash command called "removeseller" that can be used to remove a seller from a tracking list. It checks if the user has a webhook set, retrieves the seller ID from the user's input, and then verifies if the seller exists in the database. If the seller is found, it removes the user from the seller's tracking list. If there are no other users tracking the seller, it removes the seller from the database. Finally, it sends a reply indicating the success or failure of the operation.Total characters: 347 characters |

</details>

---

## 🚀 Getting Started

### ✔️ Prerequisites

Before you begin, ensure that you have the following prerequisites installed:

> - `ℹ️ Node.js`
> - `ℹ️ Postgres Database`
> - `ℹ️ NPM`
> - `ℹ️ Residential / Datacenter Proxies`

### 📦 Installation

1. Clone the amztools repository:

```sh
git clone https://github.com/copbrick/amztools
```

2. Change to the project directory:

```sh
cd amztools
```

3. Install the dependencies:

```sh
npm install
```

### 🌍🌡️ Enviroment Setup

- **Ensure you're in the root directory when completing the following steps.**

1. Create a .env file with the following:

```env
DATABASE_NAME=<DATABASE_NAME>
DATABASE_HOST=<DATABASE_HOST>
DATABASE_PORT=<DATABASE_PORT>
DATABASE_USERNAME=<DATABASE_USERNAME>
DATABASE_PASSWORD=<DATABASE_PASSWORD>
DATABASE_SCHEMA=stalker
LOGGING=false #make "true" if you'd like to see DB logs
```

2. Create a config.json file with the following

```json
{
  "token": "<DISCORD_BOT_TOKEN>",
  "clientId": "<DISCORD_BOT_CLIENT_ID>",
  "guildId": "<DISCORD_SERVER_ID>"
}
```

3. Create a proxies.txt file with your proxies, seperated by a new line.

```txt
191.x.x.x:1111:username:password
192.x.x.x:1111:username:password
.
.
.
```

4. Once you've created all of these files, run the bot using the command:

```sh
node deploy-commands.js # enables discord bot to recognize our commands. Only needs to be ran first time you set up the enviroment, or if you add your own commands to the bot.
npm start
```

### 🤖 Using Commands

- **Set Discord Webhook** `/setWebhook`:


  ![Discord Set Webhook Command](https://i.imgur.com/MTN1IqO.png)

---

## 🤝 Contributing

Contributions are always welcome! Please follow these steps:

1. Fork the project repository. This creates a copy of the project on your account that you can modify without affecting the original project.
2. Clone the forked repository to your local machine using a Git client like Git or GitHub Desktop.
3. Create a new branch with a descriptive name (e.g., `new-feature-branch` or `bugfix-issue-123`).

```sh
git checkout -b new-feature-branch
```

4. Make changes to the project's codebase.
5. Commit your changes to your local branch with a clear commit message that explains the changes you've made.

```sh
git commit -m 'Implemented new feature.'
```

6. Push your changes to your forked repository on GitHub using the following command

```sh
git push origin new-feature-branch
```

7. Create a new pull request to the original project repository. In the pull request, describe the changes you've made and why they're necessary.
   The project maintainers will review your changes and provide feedback or merge them into the main branch.

---

## 📄 License

This project is licensed under the `MIT` License.

---

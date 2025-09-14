//config.js
module.exports = {
    // db: {
    //   host: process.env.DB_HOST || 'localhost',
    //   user: process.env.DB_USER || 'root',
    //   password: process.env.DB_PASSWORD || '',
    //   database: process.env.DB_NAME || 'project',
    //   waitForConnections: true,
    //   connectionLimit: 10,
    //   queueLimit: 0
    // },
    jwt: {
      secret: process.env.JWT_SECRET || 'sec9rity',
      expiresIn: '10h'
    },
    promptpayqr: "0825328896"    
  };
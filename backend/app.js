require('dotenv').config({ path: './.env.dev' });

var express = require('express');
var mysql = require('mysql'); 
const bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
let SEED = "esta-es-una-semilla-para-generar-el-token";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const e = require('express');

const EMAIL_CLIENT_ID = process.env.EMAIL_CLIENT_ID;
const EMAIL_CLIENT_SECRET = process.env.EMAIL_CLIENT_SECRET;
const EMAIL_REDIRECT_URI = process.env.EMAIL_REDIRECT_URI;
const EMAIL_REFRESH_TOKEN = process.env.EMAIL_REFRESH_TOKEN;

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
    EMAIL_CLIENT_ID,
    EMAIL_CLIENT_SECRET,
    EMAIL_REDIRECT_URI
);

oauth2Client.setCredentials({
    refresh_token: EMAIL_REFRESH_TOKEN
});

const smptTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: "javier.gutierrez2201@alumnos.ubiobio.cl",
        clientId: EMAIL_CLIENT_ID,
        clientSecret: EMAIL_CLIENT_SECRET,
        refreshToken: EMAIL_REFRESH_TOKEN,
    },
    tls: {
        rejectUnauthorized: false
    }
});

var app = express();

app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const conn = mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'acme'
});

conn.connect();

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x.client-key, x-client-token, x-client-secret, Authorization');
    next();
});



app.post('/usuarios', (req, res) => {
    const { name, email, img, role } = req.body;
    let hashedPassword = bcrypt.hashSync(req.body.password, 10);

    const sql = 'INSERT INTO usuarios (userName, userEmail, userPassword, userImg, userRole) VALUES (?, ?, ?, ?, ?)';
    conn.query(sql, [name, email, hashedPassword, img, role], (err, results) => {
        if (err) {
            return res.status(500).json({ ok: false, mensaje: 'Error al crear usuario' });
        }
        res.status(201).json({
            ok: true,
            mensaje: 'Usuario creado correctamente',
        });
    });
});

app.post('/login', (req, res) => {
    const {email} = req.body;
    let hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const sql = 'SELECT * FROM usuarios WHERE userEmail = ?';
    conn.query(sql, [email], (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Usuario no encontrado'
            });
        } else {
            const user = results[0];
            const passwordMatch = bcrypt.compareSync(req.body.password, user.userPassword);
            if (!passwordMatch) {
                return res.status(401).json({
                    ok: false,
                    mensaje: 'Contraseña incorrecta'
                });
            }
            const token = jwt.sign({ usuario: user }, SEED, { expiresIn: 14400 });
            res.status(200).json({
                ok: true,
                mensaje: 'Login exitoso',
                usuario: user,
                token: token
            });
        }  
    });
});

// Verificar el token de Google
async function verifyGoogleToken(token) {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log(payload);
    return {
        name: payload.name,
        email: payload.email,
        picture: payload.picture
    };
}

// Login con Google
app.post('/google-login', async (req, res) => {
    const { token } = req.body;
    console.log('Token recibido: ' + token);
    try {
        const { name, email, picture } = await verifyGoogleToken(token);
        conn.query('SELECT * FROM usuarios WHERE userEmail = ?', [email], (err, results) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al consultar la base de datos',
                    error: err
                });
            }
            if (results.length === 0 || !results.length) {
                console.log('Usuario no encontrado -> creando nuevo usuario');
                let datosUsuario = {
                    userName: name,
                    userEmail: email,
                    userImg: picture,
                };
                conn.query('INSERT INTO usuarios SET ?', datosUsuario, (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al crear el usuario',
                            error: err
                        });
                    }
                    res.status(201).json({
                        ok: true,
                        mensaje: 'Usuario creado correctamente'
                    });
                });
            } else {
                console.log('Usuario encontrado');
                console.log('Generar token para el usuario');
                const user = results[0];
                const token = jwt.sign({ usuario: user }, SEED, { expiresIn: 14400 });
                res.status(200).json({
                    ok: true,
                    mensaje: 'Login exitoso',
                    usuario: user,
                    token: token
                });
            }
        });
    } catch (error) {
        res.status(401).json({
            ok: false,
            mensaje: 'Token no válido',
            error: error
        });
    }
});


// ============================================
// RECUPERACIÓN DE CONTRASEÑA - Among Us Style
// ============================================

// Almacén temporal de códigos de recuperación (en producción usar Redis o DB)
const recoveryCodes = new Map();

// Generar código de 6 dígitos
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /forgot-password - Solicita recuperación de contraseña
app.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ ok: false, mensaje: 'El email es obligatorio' });
    }

    // Verificar que el usuario exista
    const sql = 'SELECT * FROM usuarios WHERE userEmail = ?';
    conn.query(sql, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ ok: false, mensaje: 'Error del servidor' });
        }
        if (results.length === 0) {
            // Por seguridad, no revelar si el email existe o no
            return res.status(200).json({
                ok: true,
                mensaje: 'Si el email existe, recibirás un correo con instrucciones'
            });
        }

        // Generar código y token
        const code = generateCode();
        const token = jwt.sign({ email, code }, SEED, { expiresIn: '15m' });

        // Guardar código en memoria (expira en 15 min)
        recoveryCodes.set(email, {
            code,
            expiresAt: Date.now() + 15 * 60 * 1000
        });

        // Construir link de recuperación (Angular frontend)
        const recoveryLink = `http://localhost:4200/recover/${token}`;

        // HTML del email estilo Among Us
        const msg = `
        <div style="background:#1a1a2e;padding:30px;text-align:center;font-family:'Segoe UI',sans-serif;">
            <div style="background:#2d2d44;border-radius:20px;padding:30px;max-width:500px;margin:0 auto;">
                <h1 style="color:#ff0040;margin:0;font-size:28px;">🚨 EMERGENCY MEETING</h1>
                <p style="color:#aaa;font-size:14px;">Se reportó una emergencia en la nave</p>

                <div style="background:#16213e;border-radius:15px;padding:20px;margin:20px 0;">
                    <p style="color:#fff;font-size:16px;margin:0;">
                        Un tripulante necesita recuperar su acceso.
                        <br><br>
                        Completá las tareas para obtener tu código de recuperación.
                    </p>
                </div>

                <a href="${recoveryLink}"
                   style="display:inline-block;background:#00ff41;color:#1a1a2e;
                          padding:15px 40px;border-radius:30px;text-decoration:none;
                          font-weight:bold;font-size:16px;margin:20px 0;
                          box-shadow:0 0 20px #00ff41;">
                    ⚡ COMPLETAR TAREAS
                </a>

                <p style="color:#666;font-size:12px;margin-top:20px;">
                    Este link expira en 15 minutos.<br>
                    Si no solicitaste esta recuperación, ignorá este email.
                </p>
            </div>
        </div>`;

        const mailOptions = {
            from: "Among Us Security <javier.gutierrez2201@alumnos.ubiobio.cl>",
            to: email,
            subject: "🚨 Emergency Meeting - Recuperá tu contraseña",
            generateTextFromHTML: true,
            html: msg
        };

        smptTransport.sendMail(mailOptions, (err, response) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ ok: false, mensaje: 'Error al enviar el correo' });
            }
            console.log('Email de recuperación enviado a:', email);
            res.status(200).json({
                ok: true,
                mensaje: 'Si el email existe, recibirás un correo con instrucciones'
            });
        });
    });
});

// GET /verify-recovery-token/:token - Valida que el token sea válido
app.get('/verify-recovery-token/:token', (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, SEED);
        const stored = recoveryCodes.get(decoded.email);

        if (!stored || stored.expiresAt < Date.now()) {
            return res.status(400).json({ ok: false, mensaje: 'Código expirado o inválido' });
        }

        res.status(200).json({
            ok: true,
            email: decoded.email,
            mensaje: 'Token válido. Completá las tareas para obtener tu código.'
        });
    } catch (error) {
        res.status(400).json({ ok: false, mensaje: 'Token inválido o expirado' });
    }
});

// POST /get-recovery-code - Devuelve el código después de completar las tareas
app.post('/get-recovery-code', (req, res) => {
    const { token } = req.body;

    try {
        const decoded = jwt.verify(token, SEED);
        const stored = recoveryCodes.get(decoded.email);

        if (!stored || stored.expiresAt < Date.now()) {
            return res.status(400).json({ ok: false, mensaje: 'Código expirado' });
        }

        res.status(200).json({ ok: true, code: stored.code });
    } catch (error) {
        res.status(400).json({ ok: false, mensaje: 'Token inválido' });
    }
});

// POST /reset-password - Valida código y cambia contraseña
app.post('/reset-password', (req, res) => {
    const { token, code, newPassword } = req.body;

    if (!token || !code || !newPassword) {
        return res.status(400).json({ ok: false, mensaje: 'Todos los campos son obligatorios' });
    }

    try {
        const decoded = jwt.verify(token, SEED);
        const stored = recoveryCodes.get(decoded.email);

        if (!stored) {
            return res.status(400).json({ ok: false, mensaje: 'No hay solicitud de recuperación activa' });
        }

        if (stored.expiresAt < Date.now()) {
            recoveryCodes.delete(decoded.email);
            return res.status(400).json({ ok: false, mensaje: 'Código expirado. Solicita uno nuevo.' });
        }

        if (stored.code !== code) {
            return res.status(400).json({ ok: false, mensaje: 'Código incorrecto' });
        }

        // Código correcto → actualizar contraseña
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        const sql = 'UPDATE usuarios SET userPassword = ? WHERE userEmail = ?';

        conn.query(sql, [hashedPassword, decoded.email], (err, results) => {
            if (err) {
                return res.status(500).json({ ok: false, mensaje: 'Error al actualizar la contraseña' });
            }

            // Limpiar código usado
            recoveryCodes.delete(decoded.email);

            res.status(200).json({
                ok: true,
                mensaje: 'Contraseña actualizada correctamente. Ya podés iniciar sesión.'
            });
        });
    } catch (error) {
        res.status(400).json({ ok: false, mensaje: 'Token inválido o expirado' });
    }
});


// Enviar Email de Prueba (antes del middleware JWT para testing directo)
app.post('/email-test', (req, res) => {
    let msg = `<h3>
            <span style="background-color: #ffcc00;">
                Envío de Email con NodeJS - Nodemailer y GMail
            </span>
        </h3>
        <p>Este es un <strong> email de ejemplo </strong> utilizando
            <span style="color: #ff0000;">Nodemailer</span> y <em>NodeJS</em>.
        </p>
        <ul>
            <li>Permite formato HTML</li>
            <li>Permite adjuntar archivos</li>
            <li>Se utiliza una cuenta GMail configurada con OAuth2</li>
        </ul>`;

    const { email_adress } = req.body;

    const mailOptions = {
        from: "Asignatura Angular",
        to: email_adress,
        subject: "Email de ejemplo con Nodemailer",
        generateTextFromHTML: true,
        html: msg
    };

    smptTransport.sendMail(mailOptions, (err, response) => {
        if (err) {
            console.log(err)
            throw err;
        }
        console.log(response);
        smptTransport.close();
        res.status(200).json({
            ok: true,
            mensaje: 'Email enviado correctamente'
        });
    });
});

// Validar si un código de producto ya existe (para validación asíncrona del frontend)
app.get('/productos/validate-code/:code', (req, res) => {
    const { code } = req.params;
    const sql = 'SELECT COUNT(*) AS total FROM productos WHERE productCode = ?';
    conn.query(sql, [code], (err, results) => {
        if (err) {
            return res.status(500).json({ ok: false, mensaje: 'Error al validar código' });
        }
        const existe = results[0].total > 0;
        res.status(200).json({
            ok: true,
            data: { codeExists: existe }
        });
    });
});

app.use(function (req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token no proporcionado'
        });
    }else {
        jwt.verify(token, SEED, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    ok: false,
                    mensaje: 'Token no válido'
                });
            }
            req.usuario = decoded.usuario;
            next();
        });
    }
    
});

app.get('/productos', (req, res, next) => {
    const sql = 'SELECT * FROM productos';
    conn.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ ok: false, mensaje: 'Error al obtener productos' });
        }
        res.status(200).json({
            ok: true,
            productos: results
        });
    });
});

app.get('/productos/top-ranking', (req, res, next) => {
    const sql = 'SELECT productName, starRating FROM productos ORDER BY starRating DESC LIMIT 5';
    conn.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ ok: false, mensaje: 'Error al obtener ranking' });
        }
        const topProducts = results.map(p => ({
            name: p.productName,
            value: p.starRating
        }));
        res.status(200).json({
            ok: true,
            productos: topProducts
        });
    });
});

app.get('/', (req, res, next) => {
   res.status(200).json({
    ok: true,
    mensaje: 'Petición realizada correctamente'
   });
});

app.post('/productos', (req, res) => {
    const { productName, productCode, releaseDate, price, description, starRating, image } = req.body;
    const finalPrice = parseInt(price) || 0;
    const finalRate = parseFloat(starRating) || 0;

    const sql = 'INSERT INTO productos (productName, productCode, releaseDate, price, description, starRating, image) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    conn.query(sql, [productName, productCode, releaseDate, finalPrice, description, finalRate, image], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ ok: false, mensaje: 'Error al insertar' });
        }
        res.status(201).json({
            ok: true,
            mensaje: 'Producto creado correctamente',
        });
    });
});

app.get('/productos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM productos WHERE productId = ?';
    conn.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ ok: false, mensaje: 'Error al obtener producto' });
        }
        res.status(200).json({
            ok: true,
            producto: results[0]
        });
    });
});

app.delete('/productos/:id', (req, res) => {
    const { id } = req.params; 
    const sql = 'DELETE FROM productos WHERE productId = ?';
    conn.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ ok: false, mensaje: 'Error al eliminar producto' });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'Producto eliminado correctamente'
        });
    });
});

app.put('/productos/:id', (req, res) => {
    const { id } = req.params;
    const { productName, productCode, releaseDate, price, description, starRating, image } = req.body;
    const finalPrice = parseInt(price) || 0;
    const finalRate = parseFloat(starRating) || 0;

    const sql = 'UPDATE productos SET productName = ?, productCode = ?, releaseDate = ?, price = ?, description = ?, starRating = ?, image = ? WHERE productId = ?';
    
    conn.query(sql, [productName, productCode, releaseDate, finalPrice, description, finalRate, image, id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ ok: false, mensaje: 'Error al actualizar' });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'Producto actualizado correctamente'
        });
    });
});

app.put('/upload/producto/:id', (req, res) => {
    const { id } = req.params;
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se ha seleccionado ningún archivo'
        });
    }

    const file = req.files.image;
    const fileExtemsion = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif'];

    if(!allowedExtensions.includes(fileExtemsion)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Archivo no permitido, solo se permiten imágenes'
        });
    }

    const productId = req.params.id;
    const fileName = `${productId}-${new Date().getMilliseconds()}.${fileExtemsion}`;
    const uploadPath = __dirname + '/uploads/' + fileName;

    console.log(uploadPath);

    file.mv(uploadPath , (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al subir el archivo'
            });
        }
        
        const sql = 'UPDATE productos SET image = ? WHERE productId = ?';
        
        conn.query(sql, [fileName, productId], (err, results) => {
            if (err) throw err;
            res.status(200).json({
                ok: true,
                mensaje: 'Archivo subido y producto actualizado correctamente',
                fileName
            });
        });
    });
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
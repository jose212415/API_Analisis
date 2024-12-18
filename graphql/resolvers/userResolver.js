const pool = require('../../db/pool'); // Ruta a la configuración de la BD
const bcrypt = require('bcrypt');

// Importar el cliente S3 desde el SDK v3
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { GraphQLUpload } = require('graphql-upload');

// Configurar el cliente S3 para MinIO
const s3 = new S3Client({
    endpoint: 'https://bucket-production-a192.up.railway.app', // Reemplaza por el link de tu bucket
    region: 'us-east-1', // Elige cualquier región, MinIO no lo requiere pero es necesario para configurar el cliente
    credentials: {
        accessKeyId: 'k8GY4AWFDXmXhl8qpL39', // Reemplaza con tu access key
        secretAccessKey: 'at19PevhDUF4rEpOACntdk49oVsVL9FQjhVFCCNC', // Reemplaza con tu secret key
    },
    forcePathStyle: true, // Necesario para MinIO
});

// Función para probar la conexión a MinIO listando los buckets
async function testMinIOConnection() {
    try {
        const data = await s3.send(new ListBucketsCommand({}));
        console.log("Buckets disponibles:", data.Buckets);
    } catch (error) {
        console.error("Error conectando a MinIO:", error);
    }
}

const userResolvers = {
    Upload: GraphQLUpload,

    Query: {
        // Obtener todos los usuarios
        users: async (parent, { limit, offset }) => {
            const res = await pool.query('SELECT * FROM "Users" LIMIT $1 OFFSET $2', [limit, offset]);
            return res.rows;
        },
        // Obtener un usuario por ID
        user: async (parent, args) => {
            const res = await pool.query('SELECT * FROM "Users" WHERE "Id" = $1', [args.Id]);
            const user = res.rows[0];

            if (user && user.Birthdate) {
                const birthdate = new Date(user.Birthdate);
        
                // Verificar si la fecha es válida
                if (!isNaN(birthdate)) {
                    // Extraer los componentes de la fecha
                    const day = String(birthdate.getDate()).padStart(2, '0');
                    const month = String(birthdate.getMonth() + 1).padStart(2, '0'); // Los meses son 0 indexados
                    const year = birthdate.getFullYear();
        
                    // Formatear la fecha como MM-DD-YYYY
                    user.Birthdate = `${day}-${month}-${year}`;
                } else {
                    user.Birthdate = null; // Si la fecha es inválida
                }
            }

            console.log(user.Birthdate);

            return user;
        },
    },

    Mutation: {
        createUser: async (parent, args) => {
            const {
            NameUsers,
            LastName,
            Email,
            Password,
            Phone,
            Rol,
            Address,
            Birthdate,
            Image,
            active
            } = args;

            // Verificar si el email ya existe
            const checkEmail = await pool.query('SELECT * FROM "Users" WHERE "Email" = $1', [Email]);

            if (checkEmail.rows.length > 0) {
                // Si ya existe un usuario con ese email, lanzamos un error
                throw new Error('El correo electrónico ya está registrado.');
            }

            // Cifrar la contraseña antes de guardarla
            const hashedPassword = await bcrypt.hash(Password, 10);

            testMinIOConnection();

            // Subir la imagen solo si se proporciona
            let imageUrl = null;
            if (Image) {
                try {
                    // Resolver la promesa de `Image` y acceder a `file.createReadStream`
                    const imageFile = await Image;
                    const { createReadStream, filename, mimetype } = imageFile.file; // Acceder a la propiedad 'file'

                    // Validar si el createReadStream existe
                    if (typeof createReadStream !== 'function') {
                        throw new Error('createReadStream is not a function');
                    }

                    // Subir la imagen a MinIO usando Upload
                    const uploadImage = async () => {
                        const upload = new Upload({
                            client: s3,
                            params: {
                                Bucket: 'images-travel-agency-app',
                                Key: `${Date.now()}-${filename}`, // Nombre único para la imagen
                                Body: createReadStream(), // El stream de la imagen
                                ContentType: mimetype,
                                ACL: 'public-read',
                            },
                        });

                        try {
                            const data = await upload.done();
                            return `https://bucket-production-a192.up.railway.app/images-travel-agency-app/${data.Key}`; // URL de la imagen subida
                        } catch (error) {
                            throw new Error('Error subiendo la imagen a MinIO.');
                        }
                    };

                    imageUrl = await uploadImage();
                } catch (error) {
                    console.error("Error handling the image upload: ", error);
                    return {
                        success: false,
                        code: 500,
                        message: 'Error en la subida de imagen',
                        details: error.message
                    };
                }
            }

            const res = await pool.query(
            `INSERT INTO public."Users"(
                "NameUsers", "LastName", "Email", "Password", "Phone", "Rol", "Address", "Birthdate", "Image", active)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [NameUsers, LastName, Email, hashedPassword, Phone, Rol, Address, Birthdate, imageUrl, active]
            );

            const user = res.rows[0];

            return {
                message: 'Registro exitoso',
                user
            };
        },
        // Actualizar Información del usuario
        updateUser: async (parent, args) => {
            const {
                Id,
                NameUsers,
                LastName,
                Phone,
                Address,
                Birthdate,
                Image,
            } = args;

            try {
                let imageUrl;
                if (!Image) {
                    // Obtener la imagen actual si no se proporciona una nueva
                    const userResult = await pool.query('SELECT "Image" FROM "Users" WHERE "Id" = $1', [Id]);
                    imageUrl = userResult.rows[0].Image;
                } else {
                    // Si se proporciona una nueva imagen, subirla a MinIO
                    try {
                        const imageFile = await Image;
                        const { createReadStream, filename, mimetype } = imageFile.file;

                        if (typeof createReadStream !== 'function') {
                            console.error('createReadStream is not a function');
                            return { message: 'Error: createReadStream no es una función válida.' };
                        }

                        // Subir la imagen a MinIO
                        const uploadImage = async () => {
                            const upload = new Upload({
                                client: s3,
                                params: {
                                    Bucket: 'images-travel-agency-app',
                                    Key: `${Date.now()}-${filename}`,
                                    Body: createReadStream(),
                                    ContentType: mimetype,
                                    ACL: 'public-read',
                                },
                            });

                            try {
                                const data = await upload.done();
                                return `https://bucket-production-a192.up.railway.app/images-travel-agency-app/${data.Key}`;
                            } catch (error) {
                                console.error('Error subiendo la imagen a MinIO:', error);
                                return { message: 'Error subiendo la imagen a MinIO.' };
                            }
                        };

                        const uploadResult = await uploadImage();
                        if (uploadResult.message) {
                            return uploadResult; // Si hubo un error al subir la imagen, retornar el mensaje de error
                        }

                        imageUrl = uploadResult;
                    } catch (error) {
                        console.error("Error handling the image upload:", error);
                        return { message: 'Error en la subida de imagen' };
                    }
                }

                // Actualizar información del usuario en la base de datos
                const res = await pool.query(
                    `UPDATE public."Users"
                        SET "NameUsers" = $1, "LastName" = $2, "Phone" = $3, "Address" = $4, "Birthdate" = $5, "Image" = $6
                        WHERE "Id" = $7 RETURNING *;`,
                    [NameUsers, LastName, Phone, Address, Birthdate, imageUrl, Id]
                );

                const user = res.rows[0];

                return {
                    message: 'Usuario actualizado exitosamente',
                    user
                };

            } catch (error) {
                console.error("Error updating user:", error);
                return { message: 'Error al actualizar el usuario' };
            }
        },
    },
};

module.exports = userResolvers;

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

const imageUploadResolvers = {
    Upload: GraphQLUpload,

    Mutation: {
        // Subir imagen a MinIO y devolver la URL
        uploadImageMinio: async (parent, args) => {
            const { Image } = args;

            try {
                // Resolver la promesa de `Image` y obtener el archivo
                const imageFile = await Image;
                const { createReadStream, filename, mimetype } = imageFile.file;

                // Validar si `createReadStream` existe
                if (typeof createReadStream !== 'function') {
                    throw new Error('createReadStream no es una función válida');
                }

                // Subir la imagen a MinIO
                const uploadImage = async () => {
                    const upload = new Upload({
                        client: s3,
                        params: {
                            Bucket: 'images-travel-agency-app',
                            Key: `${Date.now()}-${filename}`, // Nombre único para la imagen
                            Body: createReadStream(),         // Stream de la imagen
                            ContentType: mimetype,
                            ACL: 'public-read',
                        },
                    });

                    try {
                        const data = await upload.done();
                        return `https://bucket-production-a192.up.railway.app/images-travel-agency-app/${data.Key}`; // URL de la imagen subida
                    } catch (error) {
                        throw new Error('Error subiendo la imagen a MinIO');
                    }
                };

                const imageUrl = await uploadImage();
                console.log(imageUrl);
                return { message: 'Imagen Subida a Minio', imageUrl: imageUrl }

            } catch (error) {
                console.error("<Erro>ro>r subiendo la imagen a MinIO:", error);
                throw new Error('Error en la subida de imagen');
            }
        },
    },
};

module.exports = imageUploadResolvers;
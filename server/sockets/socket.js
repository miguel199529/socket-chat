const { io } = require('../server');
const colors = require('colors');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utils/utilidades');


const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on('entrarChat', (usuario, callback) => {

        if (!usuario.nombre || !usuario.sala) {
            return callback({
                error: true,
                mensaje: 'El nombre/sala es nesesario'
            });
        }

        client.join(usuario.sala);
        usuarios.agregarPersona(client.id, usuario.nombre, usuario.sala)
            //console.log(colors.bgCyan(personas));

        client.broadcast.to(usuario.sala).emit('listarPersonas', usuarios.getPersonaPorSala(usuario.sala))
        callback(usuarios.getPersonaPorSala(usuario.sala));

    })

    client.on('crearMensaje', (data) => {

        let persona = usuarios.getPersona(client.id)

        let mensaje = crearMensaje(persona.nombre, data.mensaje);

        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje)
    });

    client.on('disconnect', () => {

        let personaBorrada = usuarios.borrarPersona(client.id);

        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('admin', `${personaBorrada.nombre} abandono el chat`))

        client.broadcast.to(personaBorrada.sala).emit('listarPersonas', usuarios.getPersonaPorSala(personaBorrada.sala));

    })

    // mensajes privados 
    client.on('mensajePrivado', data => {

        let persona = usuarios.getPersona(client.id);

        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje))

    })



});
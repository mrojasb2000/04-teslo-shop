<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Ejecutar en desarrollo

1. Clonar el repositorio

```sh
git clone https://github.com/<username>/<projectname>
```

1. Tener Nest CLI instalado

```sh
npm i -g @nestjs/cli
```

1. Instalar dependencias

```sh
yarn install
```

1. Clonar el archivo '.env.template' y renombrarlo a '.env'
1. Cambiar los valores de la variables de entorno

1. Levantar la base de datos

```sh
docker-compose up -d
```

1. Ejecutar el proyecto en modo desarrollo

```sh
yarn start:dev
```

## Stack usado

* Postgresql
* Nest

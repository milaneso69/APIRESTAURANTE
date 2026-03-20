# Comandos para Microservicios en Docker

## Levantar los Microservicios

Para iniciar todos los microservicios definidos en el archivo docker-compose.yml, utiliza el siguiente comando:

```bash
docker-compose up
```

Este comando levantará los contenedores de todos los microservicios definidos en el archivo.


## Acceder a los Microservicios

Para acceder a los microservicios, puedes usar los puertos definidos en el archivo docker-compose.yml. Por ejemplo:

- **Auth Service**: Accede a http://localhost:3001
- **User Service**: Accede a http://localhost:3002
- **Product Service**: Accede a http://localhost:3003
- **Order Service**: Accede a http://localhost:3004
- **Sales Service**: Accede a http://localhost:3005

## Pruebas de los Microservicios

Para probar los microservicios, puedes usar las siguientes URLs:

- **Auth Service**:
    - **Login**: POST a http://localhost:3001/auth/login con un JSON como { "username": "usuario", "password": "contraseña" }
    - **Registro**: POST a http://localhost:3001/auth/register con un JSON como { "username": "usuario", "password": "contraseña" }

- **User Service**:
  - **Obtener Usuarios**: GET a http://localhost:3002/users
  - **Crear Usuario**: POST a http://localhost:3002/users con un JSON como { "username": "usuario", "password": "contraseña" }

- **Product Service**:
  - **Obtener Productos**: GET a http://localhost:3003/products
  - **Crear Producto**: POST a http://localhost:3003/products con un JSON como { "name": "producto", "price": 100, "stock": 10 }

- **Employee Service**:
  - **Obtener Empleados**: GET a http://localhost:3004/employees
  - **Crear Empleado**: POST a http://localhost:3004/employees con un JSON como { "name": "empleado", "salary": 50000 }

- **Sales Service**:
  - **Obtener Ventas**: GET a http://localhost:3005/sales
  - **Crear Venta**: POST a http://localhost:3005/sales con un JSON como { "product_id": "id_del_producto", "quantity": 5, "total": 500 }


## Notas Adicionales

- Asegúrate de que los puertos definidos en el archivo docker-compose.yml no estén siendo utilizados por otros servicios en tu sistema.
- Puedes usar herramientas como Postman o curl para probar las APIs de los microservicios.
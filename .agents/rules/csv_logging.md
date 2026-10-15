---
name: "Reglas de Logging en CSV"
description: "Establece que todas las acciones y eventos importantes deben registrarse en un archivo CSV."
---

# Reglas de Desarrollo: Registro en CSV

1. **Uso Obligatorio de CSV para Logs**: Todo evento importante, ejecución, resultado o error dentro de este proyecto debe quedar registrado obligatoriamente en un archivo `.csv` (por ejemplo, `logs.csv` o `registro.csv`).
2. **Estructura del Archivo**:
   - El archivo debe incluir una fila inicial con los encabezados correspondientes. Se recomienda el formato: `Fecha_Hora, Nivel, Modulo, Mensaje`.
   - Utilizar siempre la coma (`,`) como separador.
3. **Modo de Escritura**: Toda nueva información o evento debe agregarse al final del archivo (modo "append"), evitando sobrescribir los registros anteriores.
4. **Manejo de Errores**: Si el archivo no existe, el programa debe encargarse de crearlo automáticamente e inicializar los encabezados antes de agregar el primer registro.

# Actualizacion funcional del portafolio

Esta version conserva el contenido, la composicion editorial, la tipografia y la paleta visual del CV original. El segundo ZIP se uso solo como referencia de comportamiento; no se copiaron sus bundles, recursos de marca, telemetria ni dependencias.

## Funciones incorporadas

- Navegacion inmersiva con apertura, cierre, foco controlado y tecla `Escape`.
- Indicador de progreso general y navegacion directa entre las 13 secciones.
- Control para avanzar a la siguiente seccion y navegacion por teclado.
- Aparicion progresiva de contenido y movimiento sutil sensible al puntero.
- Ventanas de detalle accesibles para los casos de impacto.
- Adaptacion responsive con scroll flexible y contenido sin recortes en pantallas pequenas.
- Compatibilidad con `prefers-reduced-motion` y funcionamiento legible sin JavaScript.
- Caso de Ki Natural Science autocontenido y con retorno correcto al portafolio.

## Ejecucion

Sirva la carpeta con cualquier servidor estatico y abra `index.html`. Por ejemplo:

```powershell
python -m http.server 8091
```

## Verificacion

```powershell
node --check cv_profile.js
node --test tests/ui_contract.test.js
```

# Widget de jQueryUI para simular un juego de damas.
##### Creado por José Suero, para la tarea final del curso de jQueryUI impartido en la certificación de JavaScript de [Next University](http://www.nextu.com/)

[ct]:()
### Tabla de Contenidos
1. [Objetos](#objetos)
	1.  ```$.widget("custom.juegodedamas")```
	2.  ```Coord```
2. [Funciones y utilierías](#funciones-y-utilierías)
	1. ```boardUtils```

[1]:()
### Objetos
#### Objetos Definidos en este Widget
1. ```$.widget("custom.juegodedamas")```: widget principal de este proyecto.
    #### Sintaxis básica
    ```javascript 
    $("target").juegodedamas();
    ```
    #### Sintaxis con opciones
    ```javascript 
    $("target").juegodedamas({
        size: 150,
        droppableClass: "cust-droppable",
        player1: {name: "Player 1 name"},
        player2: {name: "Player 2 name"}
    });
    ```
    ##### Opciones
    * **size:** Especifica el tamaño con el que se generará el tablero del juego. Si no se envía este asumirá un valor por defecto de 960 píxeles.
    * **droppableClass:** Especifica la clase css a aplicar a las celdas del tablero cuando una pieza está encima de ella.
    [player1]:()
    * **player1:** Opciones para el primer jugador del tablero
      * _**name:** especifique el nombre del jugador. Por defecto "Jugador 1"_
    * **player2:** Lo mismo que para `player1` con valor para ``.name`` por defecto de "Jugador 2"

2. ```Coord```: define la ublicación fila y columna de una celda del tablero.
   * Propiedades:
     * _*row:* define la fila de la celda. Este índice está basado en 0._
     * _*col:* define la columna de la celda. Este índice está basado en 0._
   * Métodos de la clase:
     * `getCoordFromCell(cell)`: devuelve un objeto Coord en base a una celda suministrada en su parámetro ``cell``
   * Métodos de la instancia:
     * `isInsideOfBoard()`: devuelve verdadero cuando la coordenada está dentro de los límites del tablero de este widget.

**[⬆ Volver al índice](#tabla-de-contenidos)**

[2]:()
### Funciones y utilierías
3. ```boardUtils```

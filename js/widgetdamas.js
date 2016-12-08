$.widget("custom.juegodedamas", {
	version: "0.0.1",
	//opciones por defecto.	
	options: {
		"player1": { name: "Jugador 1" },
		"player2": { name: "Jugador 2" },
		"size": 960,
		"droppableClass" : false,
		"cellBorder": 1
	},
	
	//Constructor
	_create: function () {	
		
		this.element.addClass("ui-juegodedamas");
		this.element.append(this.MainDiv = $("<DIV>")
			.prop({"id": "tablaMain"})
			.css({
				"overflow": "auto",
				"width": this.options.size + "px",
				"height": this.options.size + "px",
				"border": "1px solid black"})
		);
		//this.element.append(this.ObjsDiv = $("<DIV>").prop({"id": "tablaObjs"}));
		this.element.append(this.ObjsDiv = $("<DIV>").prop({"id": "tablaObjs"}));
	},
	
	//Inicializador
	_init() {
		//Para lograr referenciar a este widget dentro de funciones que le dan otro sentido a la palabra clave "this"
		var thisWidget = this;
		var cellsize = (this.options.size / 8) - (2*this.options.cellBorder);	

		//todo: destruir las celdas e imagenes para construirlas nuevamente.
		
		//Crear los 64 objetos que tendrán las celdas y sus referencias.
		var celdas = this.celdas = [];
		for (var i = 0; i < 8*8; i++) {
			var light  = ((i % 2) == (parseInt(i / 8) % 2)),
			      color = (light) ? "#FFFFFF" : "#000000",
				  celda = celdas[i] = $("<DIV>")
					.prop({
						"id": "celda" + i})
					.data({
					    "boardRow": Math.floor(i/8),
					    "boardCol": (i - Math.floor(i/8) * 8)})
					.css({
						"backgroundColor": color,
						"width": cellsize + "px",
						"height": cellsize + "px",
						"position": "relative",
						"float": "left",
						"border": this.options.cellBorder + "px solid " + color})
					.data({
						"tipo": (light ? "blanca" : "negra"),
						"ocupada": false
					});
				
			if (!light) {
				celda.droppable({
					drop: thisWidget._drop,
					accept: thisWidget._accept,
					activeClass: thisWidget.options.droppableClass });
			}
			
			this.MainDiv.append(celda);
		}
		
		//Crear las 24 piezas
		var piezas = this.piezas = [];
		for (var i = 0; i < 24; i++) {
			thisWidget.ObjsDiv.append(this.piezas[i] =
				$("<IMG>")
				.prop({"src": (i < 12) ? "img/blue.svg" : "img/red.svg"})
				.css({
					"width": parseInt(cellsize * .8) + "px",
					"height": parseInt(cellsize * .8) + "px"})
				.draggable({revert: "invalid"})
				.data({
					"tipo": (i<12)?"azul":"roja",
					"coronada": false }));
		}
		
		//Llevar las piezas a su lugar inicial.
		$(piezas).each( function (i,pieza) {
			var tipo = pieza.data("tipo");
			var desde = (tipo == "azul") ? 0 : 40;
			var negras =  thisWidget._getBlackDivs(desde,desde+23,false);
			var celda = negras[0];
			
			pieza.position({
				my: "center",
				at: "center",
				of: celda
			});
			
			thisWidget._setCellOcupada(celda, true, pieza);
			pieza.data("whereiam", celda);
		});
	},
	
	_getBlackDivs: function (fRow, tRow, ocupada) {
		fRow = (fRow) ? fRow : 0;
		tRow = (tRow) ? tRow : this.celdas.length - 1;
		
		return $.grep(this.celdas, function (e,i) {
			var pRet = (e.data("tipo")=="negra" && fRow <= i && i <= tRow);
			return ocupada !== undefined ? pRet && e.data("ocupada") == ocupada: pRet;
		});
	},
	
	_setCellOcupada: function (celda, ocupada, pieza) {
		var thisWidget = $(celda).closest(".ui-juegodedamas").data("customJuegodedamas");
		
		if (ocupada === undefined) ocupada = true;
		var elem = $(celda);
		elem.data("ocupada", ocupada);
		if (pieza !== undefined) { elem.data("pieza", pieza); }
		else { elem.removeData("pieza"); }

		if (ocupada) { 
			elem.droppable("instance").destroy(); 
		} else { 
			elem.droppable({
				drop: thisWidget._drop,
				accept: thisWidget._accept,
				activeClass: thisWidget.options.droppableClass });
		}
	},
		
	_drop: function(event, ui) {
		ui.draggable.position({
			my: "center",
			at: "center",
			of: this
		});
		
		var cellAfter = $(this);
		var thisWidget = cellAfter.closest(".ui-juegodedamas").data("customJuegodedamas");
		var cellBefore = ui.draggable.data("whereiam");
		
		if (cellBefore) {
			thisWidget._setCellOcupada(cellBefore, false);
		}
		
		thisWidget._setCellOcupada(cellAfter, true, ui.draggable);		
		ui.draggable.data("whereiam", cellAfter);		
	},

	_accept: function(draggable) {
		//Permitir el movimiento solamente a recuadros que si pueden utilizarse.
		//Piezas sin coronar:
		//1. Movimiento hacia delante en la próxima fila
		var pieza = {
			mySelf: $(draggable),
		};
		pieza.data = pieza.mySelf.data()	;
		pieza.whereiam = pieza.data.whereiam;
		pieza.boardRow = pieza.whereiam.data("boardRow");
		pieza.boardCol = pieza.whereiam.data("boardCol");
		
		var $this = {
			mySelf: $(this)
		}; //droppable object
		$this.data = $this.mySelf.data();
		$this.myRow = $this.data.boardRow;
		$this.myCol = $this.data.boardCol;
		var thisWidget = pieza.mySelf.closest(".ui-juegodedamas").data("customJuegodedamas");
		var direction = (pieza.data.tipo == "azul") ? 1 : -1;
		
		//solamente se permite un movimiento de 1 o 2 filas arriba y abajo en el mismo número de columnas izquierda o derecha
		//  si es de 2 filas, se debe considerar que la celda del medio esté ocupada por una pieza del otro jugador.
		var filas = ($this.myRow-pieza.boardRow) * direction;
		var columnas = Math.abs(pieza.boardCol - $this.myCol);
		
		if (filas <= 2 && filas == columnas) {
			if (filas == 2) {
				var coordsBetween = {
					row: pieza.boardRow  + (direction * (pieza.boardRow < $this.myRow) ? 1 : -1),
					col: pieza.boardCol + (direction * (pieza.boardCol > $this.boardCol) ? 1 : -1)
				};
				var cellBetween = $(thisWidget.celdas).filter(function (i, e) {
					return e.data("boardRow") == coordsBetween.row
					      && e.data("boardCol") == coordsBetween.col;
				})[0];
				
				if (cellBetween && cellBetween.data("ocupada") && cellBetween.data("pieza").data("tipo") != pieza.data.tipo) {
					console.log("Captura");
					return true;
				} else {
					return false;
				}
			} else {
				return true;
			}
		}
		
		return false;
	}
	
});
$.widget("custom.juegodedamas", {
	version: "0.0.1",
	//opciones por defecto.	
	options: {
		"player1": { name: "Jugador 1" },
		"player2": { name: "Jugador 2" },
		"size": 960,
		"droppableClass" : false
	},
	
	//Constructor
	_create: function () {	
		
		this.element.addClass("ui-juegodedamas");
		this.element.append(this.MainDiv = $("<DIV>").prop({"id": "tablaMain"}));
		this.element.append(this.ObjsDiv = $("<DIV>").prop({"id": "tablaObjs"}));
		
		this.MainDiv.css({
			"overflow": "auto",
			"width": this.options.size + "px",
			"height": this.options.size + "px",
			"border": "1px solid black"
		});
	},
	
	//Inicializador
	_init() {
		//Para lograr referenciar a este widget dentro de funciones que redefinen la palaba clave this
		var thisWidget = this;
		var cellsize = this.options.size / 8;	

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
						"float": "left"})
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
				.data({"tipo":(i<12)?"azul":"roja"}));
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
		
		thisWidget._setCellOcupada(this, true, ui.draggable);		
		ui.draggable.data("whereiam", this);
	},

	_accept: function(draggable) {
		//aquí se puede implementar la decisión de objetos draggable que 
		// pueden dejarse caer en cada celda. por el momento la dejo 
		// que todas queden disponibles.
		return true;
	}
	
});
$.widget("custom.juegodedamas", {
		
	options: {
		"player1": { name: "Jugador 1" },
		"player1": { name: "Jugador 2" },
		"size": 960		
	},
	
	//Constructor
	_create: function () {
		//Para lograr referenciar a este widget dentro de funciones que redefinen la palaba clave this
		var thisWidget = this;
		var cellsize = this.options.size / 8;
		
		$(["tablaMain", "tablaObjs"]).each(function(i, e) {
			thisWidget._appendToElement($("<DIV>").prop({
				"id": e
			}));
		});
		
		this._getMainDiv().css({
			"overflow": "auto",
			"width": this.options.size + "px",
			"height": this.options.size + "px",
			"border": "1px solid black"
		});
		
		//Crear los 64 objetos que tendrán las celdas y sus referencias.
		var celdas = this.celdas = [];
		for (var i = 0; i < 8*8; i++) {
			var light = ((i % 2) == (parseInt(i / 8) % 2));
			var color = light ? "#FFFFFF" : "#000000";
			
			var celda = celdas[i] = $("<DIV>").prop({
				"id": "celda" + i
			}).css({
				"backgroundColor": color,
				"width": cellsize + "px",
				"height": cellsize + "px",
				"position": "relative",
				"float": "left"
			});
			if (!light) celda.droppable({
				drop: thisWidget._drop
			});
			this._getMainDiv().append(celda);
		}
		
		//Crear las 24 piezas
		for (var i = 0; i < 24; i++) {
			thisWidget._getObjsDiv().append(
				$("<IMG>").prop({
					"src": (i < 12) ? "img/blue.svg" : "img/red.svg"
				}).css({
					"width": parseInt(cellsize * .8) + "px",
					"height": parseInt(cellsize * .8) + "px"
				}).draggable({
					revert: "invalid"
				})
			);
		}
	},
	
	_getMainDiv: function () {
		return $("#tablaMain", this.element);
	},
	
	_getObjsDiv: function () {
		return $("#tablaObjs", this.element);
	},
	
	_appendToElement: function(obj) {
		this.element.append(obj);
	},
	
	_drop: function(event, ui) {
		ui.draggable.position({
			my: "center",
			at: "center",
			of: $(event.target)
		});
	}
	
});